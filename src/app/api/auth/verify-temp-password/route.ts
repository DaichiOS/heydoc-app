import { CognitoService } from '@/lib/aws/cognito'
import { NextRequest, NextResponse } from 'next/server'

const cognitoService = new CognitoService()

// Environment validation function
function validateEnvironment() {
	const requiredEnvVars = [
		'AWS_ACCESS_KEY_ID',
		'AWS_SECRET_ACCESS_KEY',
		'COGNITO_USER_POOL_ID',
		'COGNITO_CLIENT_ID',
		'COGNITO_CLIENT_SECRET',
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

		const { email, temporaryPassword } = await request.json()

		if (!email || !temporaryPassword) {
			console.log('❌ Missing email or temporary password')
			return NextResponse.json(
				{ error: 'Email and temporary password are required' },
				{ status: 400 }
			)
		}

		console.log('🔍 Verifying temporary password for:', email)

		// Use the new method to verify temporary password
		const result = await cognitoService.verifyTemporaryPassword(email, temporaryPassword)
		
		if (result.success) {
			console.log('✅ Temporary password verified successfully')
			return NextResponse.json({
				success: true,
				requiresNewPassword: true,
			})
		} else {
			console.log('❌ Temporary password verification failed:', result.error)
			return NextResponse.json(
				{ error: result.error || 'Invalid email or temporary password' },
				{ status: 401 }
			)
		}

	} catch (error: any) {
		console.error('❌ Unexpected error in verify temp password:', {
			error: error.message,
			stack: error.stack,
			name: error.name,
			timestamp: new Date().toISOString()
		})
		
		return NextResponse.json(
			{ error: 'Internal server error. Please try again.' },
			{ status: 500 }
		)
	}
} 