import { db } from '@/lib/db'
import { doctors, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get('userId')

		if (!userId) {
			return NextResponse.json(
				{ error: 'User ID is required' },
				{ status: 400 }
			)
		}

		// Get user data
		const user = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1)

		if (user.length === 0) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			)
		}

		// Get doctor profile
		const doctor = await db
			.select()
			.from(doctors)
			.where(eq(doctors.userId, userId))
			.limit(1)

		if (doctor.length === 0) {
			return NextResponse.json(
				{ error: 'Doctor profile not found' },
				{ status: 404 }
			)
		}

		const doctorProfile = doctor[0]
		const userData = user[0]

		// Format the profile data
		const profile = {
			firstName: doctorProfile.firstName,
			lastName: doctorProfile.lastName,
			email: userData.email,
			phone: doctorProfile.phone,
			specialty: doctorProfile.medicalSpecialty || '',
			ahpraNumber: doctorProfile.ahpraNumber,
			ahpraRegistrationDate: doctorProfile.ahpraRegistrationDate,
			practiceName: '', // You might want to add this field to schema later
			city: doctorProfile.addressCity || '',
			state: doctorProfile.addressState || '',
			postcode: doctorProfile.addressPostcode || '',
			experience: doctorProfile.yearsExperience?.toString() || '0',
			status: userData.status as 'pending' | 'approved' | 'rejected',
		}

		return NextResponse.json({
			success: true,
			profile,
		})

	} catch (error) {
		console.error('Error fetching doctor profile:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
} 