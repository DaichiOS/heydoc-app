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

		// Map database status to frontend status
		const mapStatus = (dbStatus: string) => {
			switch (dbStatus) {
				case 'pending':
					return 'pending_review'
				case 'approved':
					return 'approved'
				case 'rejected':
					return 'rejected'
				case 'pending_email_verification':
					return 'pending_email_verification'
				default:
					return 'pending_review'
			}
		}

		// Format the profile data with comprehensive information
		const profile = {
			// Basic Information
			firstName: doctorProfile.firstName,
			lastName: doctorProfile.lastName,
			email: userData.email,
			phone: doctorProfile.phone,
			
			// Professional Information
			specialty: doctorProfile.medicalSpecialty || 'General Practice',
			ahpraNumber: doctorProfile.ahpraNumber,
			ahpraRegistrationDate: doctorProfile.ahpraRegistrationDate,
			experience: doctorProfile.yearsExperience?.toString() || '0',
			currentRegistrationStatus: doctorProfile.currentRegistrationStatus || '',
			
			// Address Information
			addressStreet: doctorProfile.addressStreet || '',
			city: doctorProfile.addressCity || '',
			state: doctorProfile.addressState || '',
			postcode: doctorProfile.addressPostcode || '',
			addressCountry: doctorProfile.addressCountry || 'Australia',
			
			// Personal Details
			dateOfBirth: doctorProfile.dateOfBirth || '',
			
			// Professional Arrays
			qualifications: doctorProfile.qualifications || [],
			currentRoles: doctorProfile.currentRoles || [],
			languagesSpoken: doctorProfile.languagesSpoken || ['English'],
			consultationTypes: doctorProfile.consultationTypes || [],
			
			// Status
			status: mapStatus(userData.status),
			
			// Additional professional info
			workingHours: doctorProfile.workingHours || '',
			
			// Banking (sensitive - only include if needed for profile display)
			abn: doctorProfile.abn || '',
			
			// Insurance
			insuranceProviderName: doctorProfile.insuranceProviderName || '',
			insuranceExpiryDate: doctorProfile.insuranceExpiryDate || '',
			
			// Timestamps
			createdAt: userData.createdAt,
			updatedAt: userData.updatedAt,
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