import { CognitoService } from '@/lib/aws/cognito'
import { db } from '@/lib/db'
import { doctors, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const cognitoService = new CognitoService()

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		
		// Log the incoming request body for debugging (remove sensitive data in production)
		console.log('Registration request received:', {
			...body,
			password: '[REDACTED]',
			confirmPassword: '[REDACTED]'
		})
		
		const {
			type,
			firstName,
			lastName,
			email,
			phone,
			specialty,
			ahpraNumber,
			ahpraRegistrationDate,
			practiceName,
			city,
			state,
			postcode,
			experience, // Frontend sends 'experience', not 'yearsExperience'
			practiceDescription,
		} = body

		// Create practiceAddress from individual fields since frontend sends them separately
		const practiceAddress = [city, state, postcode].filter(Boolean).join(', ')

		// Validate required fields
		if (!type || type !== 'doctor') {
			console.log('Invalid registration type:', type)
			return NextResponse.json(
				{ error: 'Invalid registration type' },
				{ status: 400 }
			)
		}

		const requiredFields = {
			firstName,
			lastName,
			email,
			phone,
			specialty,
			ahpraNumber,
			ahpraRegistrationDate,
			practiceName,
			city, // Check city instead of practiceAddress since that's what frontend sends
			state,
			postcode,
			experience, // Check 'experience' instead of 'yearsExperience'
		}

		const missingFields = Object.entries(requiredFields)
			.filter(([_, value]) => !value || value.trim() === '')
			.map(([key, _]) => key)

		if (missingFields.length > 0) {
			console.log('Missing required fields:', missingFields)
			console.log('Received values:', Object.fromEntries(
				Object.entries(requiredFields).map(([key, value]) => [key, value ? `"${value}"` : 'MISSING'])
			))
			return NextResponse.json(
				{ error: `Missing required fields: ${missingFields.join(', ')}` },
				{ status: 400 }
			)
		}

		// Check if user already exists
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1)

		if (existingUser.length > 0) {
			return NextResponse.json(
				{ error: 'User with this email already exists' },
				{ status: 409 }
			)
		}

		// Create user in Cognito first
		let cognitoUserId: string
		try {
			const cognitoResponse = await cognitoService.createUser({
				email,
				firstName,
				lastName,
				role: 'doctor',
			})
			
			if (!cognitoResponse.success) {
				throw new Error(cognitoResponse.error || 'Failed to create Cognito user')
			}
			
			cognitoUserId = cognitoResponse.userId || uuidv4()
		} catch (cognitoError: any) {
			console.error('Cognito user creation failed:', cognitoError)
			
			// Extract meaningful error message
			let errorMessage = 'Failed to create user account'
			if (cognitoError.message) {
				if (cognitoError.message.includes('Password did not conform')) {
					errorMessage = 'Password does not meet requirements. Please ensure it has uppercase, lowercase, and numeric characters.'
				} else if (cognitoError.message.includes('already exists') || cognitoError.__type === 'UsernameExistsException') {
					errorMessage = 'An account with this email already exists. If you already have an account, please try logging in instead.'
				} else {
					errorMessage = cognitoError.message
				}
			}
			
			return NextResponse.json(
				{ error: errorMessage },
				{ status: 409 } // Use 409 Conflict for existing users
			)
		}

		// Create user in database
		const userId = uuidv4()
		
		await db.insert(users).values({
			id: userId,
			cognitoUserId: cognitoUserId,
			email,
			role: 'doctor',
			status: 'pending', // Doctors start as pending until approved
		})

		// Create doctor record
		// Convert year string to proper date format (YYYY-01-01)
		const registrationDate = new Date(`${ahpraRegistrationDate}-01-01`).toISOString().split('T')[0]
		
		const doctorData = await db.insert(doctors).values({
			id: uuidv4(),
			userId,
			firstName,
			lastName,
			phone,
			addressCity: city,
			addressState: state,
			addressPostcode: postcode,
			medicalSpecialty: specialty,
			ahpraNumber,
			ahpraRegistrationDate: registrationDate,
			yearsExperience: parseInt(experience.split('-')[0]) || 0,
		}).returning({ id: doctors.id })

		if (doctorData.length === 0) {
			// Rollback: delete the Cognito user if database insert fails
			try {
				// Note: You might want to implement a delete user method in CognitoService
				console.error('Database insert failed, but Cognito user created. Manual cleanup may be needed.')
			} catch (cleanupError) {
				console.error('Failed to cleanup Cognito user after database error:', cleanupError)
			}
			
			return NextResponse.json(
				{ error: 'Failed to save user data' },
				{ status: 500 }
			)
		}

		// TODO: Send custom verification email with link to /verify-email?email=user@example.com
		// For now, user will need to navigate to the verification link manually
		
		console.log('Doctor registration successful:', {
			email,
			cognitoUserId,
			databaseUserId: userId,
			doctorId: doctorData[0].id
		})

		return NextResponse.json({
			success: true,
			message: 'Registration successful! Please check your email to verify your account and set your password.',
			requiresEmailVerification: true,
			email: email
		})

	} catch (error) {
		console.error('Registration error:', error)
		return NextResponse.json(
			{ error: 'Registration failed. Please try again.' },
			{ status: 500 }
		)
	}
}

 