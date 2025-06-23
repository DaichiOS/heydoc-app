import { CognitoService } from '@/lib/aws/cognito'
import { db } from '@/lib/db'
import { doctors, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const cognitoService = new CognitoService()

// Debug function to check environment variables
function validateEnvironment() {
	const requiredEnvVars = [
		'AWS_ACCESS_KEY_ID',
		'AWS_SECRET_ACCESS_KEY',
		'COGNITO_USER_POOL_ID',
		'COGNITO_CLIENT_ID',
		'COGNITO_CLIENT_SECRET',
		'DATABASE_URL'
	]
	
	const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
	const partial = requiredEnvVars.filter(envVar => {
		const value = process.env[envVar]
		return value && value.length < 10 // Likely incomplete
	})
	
	return {
		missing,
		partial,
		isValid: missing.length === 0
	}
}

export async function POST(request: NextRequest) {
	try {
		// First, validate environment
		const envCheck = validateEnvironment()
		if (!envCheck.isValid) {
			console.error('❌ Environment validation failed:', {
				missing: envCheck.missing,
				partial: envCheck.partial,
				nodeEnv: process.env.NODE_ENV,
				timestamp: new Date().toISOString()
			})
			
			return NextResponse.json(
				{ error: 'Server configuration error. Please contact support.' },
				{ status: 500 }
			)
		}
		
		console.log('✅ Environment validation passed')
		
		const body = await request.json()
		
		// Log the incoming request body for debugging (remove sensitive data in production)
		console.log('📝 Registration request received:', {
			...body,
			password: '[REDACTED]',
			confirmPassword: '[REDACTED]',
			timestamp: new Date().toISOString(),
			userAgent: request.headers.get('user-agent'),
			origin: request.headers.get('origin')
		})
		
		const {
			type,
			firstName,
			lastName,
			email,
			phone,
			specialty,
			customSpecialty,
			ahpraNumber,
			ahpraRegistrationDate,
			experience, // Frontend sends 'experience', not 'yearsExperience'
		} = body

		// Validate required fields
		if (!type || type !== 'doctor') {
			console.log('❌ Invalid registration type:', type)
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
			experience, // Check 'experience' instead of 'yearsExperience'
		}

		const missingFields = Object.entries(requiredFields)
			.filter(([_, value]) => !value || value.trim() === '')
			.map(([key, _]) => key)

		if (missingFields.length > 0) {
			console.log('❌ Missing required fields:', missingFields)
			console.log('📋 Received values:', Object.fromEntries(
				Object.entries(requiredFields).map(([key, value]) => [key, value ? `"${value}"` : 'MISSING'])
			))
			return NextResponse.json(
				{ error: `Missing required fields: ${missingFields.join(', ')}` },
				{ status: 400 }
			)
		}

		console.log('✅ Field validation passed')

		// Test database connection
		try {
			console.log('🔍 Testing database connection...')
			const testQuery = await db.select().from(users).limit(1)
			console.log('✅ Database connection successful')
		} catch (dbError: any) {
			console.error('❌ Database connection failed:', {
				error: dbError.message,
				code: dbError.code,
				detail: dbError.detail,
				timestamp: new Date().toISOString()
			})
			
			return NextResponse.json(
				{ error: 'Database connection failed. Please try again later.' },
				{ status: 500 }
			)
		}

		// Check if user already exists
		console.log('🔍 Checking for existing user...')
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1)

		if (existingUser.length > 0) {
			console.log('❌ User already exists:', email)
			return NextResponse.json(
				{ error: 'User with this email already exists' },
				{ status: 409 }
			)
		}

		console.log('✅ User email is available')

		// Create user in Cognito first
		let cognitoUserId: string
		try {
			console.log('🔍 Creating Cognito user...')
			const cognitoResponse = await cognitoService.createUser({
				email,
				firstName,
				lastName,
				role: 'doctor',
			})
			
			if (!cognitoResponse.success) {
				console.error('❌ Cognito user creation failed:', cognitoResponse.error)
				throw new Error(cognitoResponse.error || 'Failed to create Cognito user')
			}
			
			cognitoUserId = cognitoResponse.userId || uuidv4()
			console.log('✅ Cognito user created successfully:', cognitoUserId)
		} catch (cognitoError: any) {
			console.error('❌ Cognito user creation failed:', {
				error: cognitoError.message,
				type: cognitoError.__type,
				code: cognitoError.code,
				statusCode: cognitoError.$metadata?.httpStatusCode,
				timestamp: new Date().toISOString()
			})
			
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
		console.log('🔍 Creating database user...')
		const userId = uuidv4()
		
		try {
		await db.insert(users).values({
			id: userId,
			cognitoUserId: cognitoUserId,
			email,
			role: 'doctor',
			status: 'pending', // Doctors start as pending until approved
		})
			console.log('✅ Database user created successfully:', userId)
		} catch (dbError: any) {
			console.error('❌ Database user creation failed:', {
				error: dbError.message,
				code: dbError.code,
				detail: dbError.detail,
				constraint: dbError.constraint,
				timestamp: new Date().toISOString()
			})
			
			return NextResponse.json(
				{ error: 'Failed to save user data to database' },
				{ status: 500 }
			)
		}

		// Create doctor record
		console.log('🔍 Creating doctor record...')
		try {
			// Convert year string to proper date format (YYYY-01-01)
			const registrationDate = new Date(`${ahpraRegistrationDate}-01-01`).toISOString().split('T')[0]
			
			const doctorData = await db.insert(doctors).values({
			id: uuidv4(),
			userId,
			firstName,
			lastName,
			phone,
			medicalSpecialty: specialty === 'other' ? customSpecialty : specialty,
			ahpraNumber,
			ahpraRegistrationDate: registrationDate,
			yearsExperience: parseInt(experience.split('-')[0]) || 0,
			}).returning({ id: doctors.id })

			if (doctorData.length === 0) {
				console.error('❌ Doctor record creation failed - no data returned')
				throw new Error('Failed to create doctor record')
			}
			
			console.log('✅ Doctor record created successfully:', doctorData[0].id)
		} catch (doctorError: any) {
			console.error('❌ Doctor record creation failed:', {
				error: doctorError.message,
				code: doctorError.code,
				detail: doctorError.detail,
				constraint: doctorError.constraint,
				timestamp: new Date().toISOString()
			})
			
			// Rollback: delete the Cognito user if database insert fails
			try {
				// Note: You might want to implement a delete user method in CognitoService
				console.error('🔄 Database insert failed, but Cognito user created. Manual cleanup may be needed.')
			} catch (cleanupError) {
				console.error('❌ Failed to cleanup Cognito user after database error:', cleanupError)
			}
			
			return NextResponse.json(
				{ error: 'Failed to save doctor profile data' },
				{ status: 500 }
			)
		}

		// TODO: Send custom verification email with link to /verify-email/[token]
		// For now, user will need to navigate to the verification link manually
		
		console.log('🎉 Doctor registration successful:', {
			email,
			cognitoUserId,
			databaseUserId: userId,
			timestamp: new Date().toISOString()
		})

		return NextResponse.json({
			success: true,
			message: 'Registration successful! Please check your email to verify your account and set your password.',
			requiresEmailVerification: true,
			email: email
		})

	} catch (error: any) {
		console.error('💥 Unexpected registration error:', {
			error: error.message,
			stack: error.stack,
			name: error.name,
			timestamp: new Date().toISOString(),
			nodeEnv: process.env.NODE_ENV
		})
		
		return NextResponse.json(
			{ error: 'Registration failed. Please try again.' },
			{ status: 500 }
		)
	}
}

 