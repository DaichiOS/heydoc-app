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
		const {
			type,
			firstName,
			lastName,
			email,
			phone,
			specialty,
			password,
			ahpraNumber,
			ahpraRegistrationDate,
			practiceName,
			practiceAddress,
			city,
			state,
			postcode,
			yearsExperience,
			practiceDescription,
		} = body

		// Validate required fields
		if (!type || type !== 'doctor') {
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
			password,
			ahpraNumber,
			ahpraRegistrationDate,
			practiceName,
			practiceAddress,
			city,
			state,
			postcode,
			yearsExperience,
		}

		const missingFields = Object.entries(requiredFields)
			.filter(([_, value]) => !value || value.trim() === '')
			.map(([key, _]) => key)

		if (missingFields.length > 0) {
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
				password,
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
				} else if (cognitoError.message.includes('already exists')) {
					errorMessage = 'An account with this email already exists.'
				} else {
					errorMessage = cognitoError.message
				}
			}
			
			return NextResponse.json(
				{ error: errorMessage },
				{ status: 400 }
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
		await db.insert(doctors).values({
			id: uuidv4(),
			userId,
			firstName,
			lastName,
			phone,
			medicalSpecialty: specialty,
			ahpraNumber,
			ahpraRegistrationDate: ahpraRegistrationDate,
			yearsExperience: parseInt(yearsExperience.split('-')[0]) || 0, // Convert "0-2" to 0
		})

		return NextResponse.json({
			message: 'Registration submitted successfully! We will review your application and be in touch soon.',
			userId,
		})

	} catch (error) {
		console.error('Registration error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

 