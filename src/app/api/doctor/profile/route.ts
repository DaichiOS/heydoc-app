import { db } from '@/lib/db'
import { doctors, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get('userId')
		const email = searchParams.get('email')

		// Support both userId and email parameters for flexibility
		if (!userId && !email) {
			return NextResponse.json(
				{ error: 'Either User ID or email is required' },
				{ status: 400 }
			)
		}

		let user, doctor

		if (email) {
			// Get user and doctor data in a single query using email
			const result = await db
				.select({
					// User fields
					userId: users.id,
					userEmail: users.email,
					userStatus: users.status,
					userCreatedAt: users.createdAt,
					userUpdatedAt: users.updatedAt,
					// Doctor fields
					firstName: doctors.firstName,
					lastName: doctors.lastName,
					phone: doctors.phone,
					ahpraNumber: doctors.ahpraNumber,
					ahpraRegistrationDate: doctors.ahpraRegistrationDate,
					medicalSpecialty: doctors.medicalSpecialty,
					yearsExperience: doctors.yearsExperience,
					addressStreet: doctors.addressStreet,
					addressCity: doctors.addressCity,
					addressState: doctors.addressState,
					addressPostcode: doctors.addressPostcode,
					addressCountry: doctors.addressCountry,
					dateOfBirth: doctors.dateOfBirth,
					currentRegistrationStatus: doctors.currentRegistrationStatus,
					qualifications: doctors.qualifications,
					currentRoles: doctors.currentRoles,
					languagesSpoken: doctors.languagesSpoken,
					consultationTypes: doctors.consultationTypes,
					workingHours: doctors.workingHours,
					abn: doctors.abn,
					insuranceProviderName: doctors.insuranceProviderName,
					insuranceExpiryDate: doctors.insuranceExpiryDate,
				})
				.from(users)
				.innerJoin(doctors, eq(doctors.userId, users.id))
				.where(eq(users.email, email))
				.limit(1)

			if (result.length === 0) {
				return NextResponse.json(
					{ error: 'Doctor profile not found' },
					{ status: 404 }
				)
			}

			const data = result[0]
			user = {
				id: data.userId,
				email: data.userEmail,
				status: data.userStatus,
				createdAt: data.userCreatedAt,
				updatedAt: data.userUpdatedAt,
			}
			doctor = data
		} else {
			// Original logic for userId (keeping for backward compatibility)
			const userResult = await db
				.select()
				.from(users)
				.where(eq(users.id, userId!))
				.limit(1)

			if (userResult.length === 0) {
				return NextResponse.json(
					{ error: 'User not found' },
					{ status: 404 }
				)
			}

			const doctorResult = await db
				.select()
				.from(doctors)
				.where(eq(doctors.userId, userId!))
				.limit(1)

			if (doctorResult.length === 0) {
				return NextResponse.json(
					{ error: 'Doctor profile not found' },
					{ status: 404 }
				)
			}

			user = userResult[0]
			doctor = doctorResult[0]
		}

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
			firstName: doctor.firstName,
			lastName: doctor.lastName,
			email: user.email,
			phone: doctor.phone,
			
			// Professional Information
			specialty: doctor.medicalSpecialty || 'General Practice',
			ahpraNumber: doctor.ahpraNumber,
			ahpraRegistrationDate: doctor.ahpraRegistrationDate,
			experience: doctor.yearsExperience?.toString() || '0',
			currentRegistrationStatus: doctor.currentRegistrationStatus || '',
			
			// Address Information
			addressStreet: doctor.addressStreet || '',
			city: doctor.addressCity || '',
			state: doctor.addressState || '',
			postcode: doctor.addressPostcode || '',
			addressCountry: doctor.addressCountry || 'Australia',
			
			// Personal Details
			dateOfBirth: doctor.dateOfBirth || '',
			
			// Professional Arrays
			qualifications: doctor.qualifications || [],
			currentRoles: doctor.currentRoles || [],
			languagesSpoken: doctor.languagesSpoken || ['English'],
			consultationTypes: doctor.consultationTypes || [],
			
			// Status
			status: mapStatus(user.status),
			
			// Additional professional info
			workingHours: doctor.workingHours || '',
			
			// Banking (sensitive - only include if needed for profile display)
			abn: doctor.abn || '',
			
			// Insurance
			insuranceProviderName: doctor.insuranceProviderName || '',
			insuranceExpiryDate: doctor.insuranceExpiryDate || '',
			
			// Timestamps
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
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