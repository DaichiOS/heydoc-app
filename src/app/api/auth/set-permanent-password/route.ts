import { authService } from '@/lib/auth'
import { setAuthCookie } from '@/lib/auth/cookies'
import { CognitoService } from '@/lib/aws/cognito'
import { db } from '@/lib/db'
import { doctors, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
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

		const { email, temporaryPassword, newPassword } = await request.json()

		// Validate input
		if (!email || !temporaryPassword || !newPassword) {
			console.log('❌ Missing required fields')
			return NextResponse.json(
				{ error: 'Email, temporary password, and new password are required' },
				{ status: 400 }
			)
		}

		// Validate password strength
		if (newPassword.length < 8) {
			console.log('❌ Password too short')
			return NextResponse.json(
				{ error: 'Password must be at least 8 characters long' },
				{ status: 400 }
			)
		}

		if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
			console.log('❌ Password does not meet complexity requirements')
			return NextResponse.json(
				{ error: 'Password must contain uppercase, lowercase, and numeric characters' },
				{ status: 400 }
			)
		}

		console.log('🔍 Setting permanent password for:', email)

		// First verify the temporary password and set the new one
		const setPermanentResult = await cognitoService.setPermanentPassword(
			email,
			temporaryPassword,
			newPassword
		)

		if (!setPermanentResult.success) {
			console.log('❌ Failed to set permanent password:', setPermanentResult.error)
			return NextResponse.json(
				{ error: setPermanentResult.error || 'Failed to set permanent password' },
				{ status: 400 }
			)
		}

		console.log('✅ Permanent password set successfully')

		// Now automatically log the user in with their new password
		try {
			const user = await authService.signIn(email, newPassword)
			
			if (!user) {
				console.log('❌ Auto-login failed after password setup')
				// Password was set but auto-login failed
				return NextResponse.json({
					success: true,
					requiresLogin: true,
					message: 'Password set successfully. Please log in with your new password.',
				})
			}

			console.log('✅ Auto-login successful for:', user.email)

			// Get doctor's name and update status if user is a doctor
			let firstName = ''
			let lastName = ''
			
			if (user.role === 'doctor') {
				try {
					// Get doctor profile and update status from 'email_unconfirmed' to 'pending'
					const doctorProfile = await db
						.select({
							id: doctors.id,
							firstName: doctors.firstName,
							lastName: doctors.lastName,
							status: doctors.status,
						})
						.from(doctors)
						.innerJoin(users, eq(users.id, doctors.userId))
						.where(eq(users.email, email))
						.limit(1)
					
					if (doctorProfile.length > 0) {
						firstName = doctorProfile[0].firstName
						lastName = doctorProfile[0].lastName
						
						// Update doctor status to 'pending' if currently 'email_unconfirmed'
						if (doctorProfile[0].status === 'email_unconfirmed') {
							await db
								.update(doctors)
								.set({ 
									status: 'pending',
									updatedAt: new Date() 
								})
								.where(eq(doctors.id, doctorProfile[0].id))
							
							console.log('✅ Doctor status updated from email_unconfirmed to pending')
						} else {
							console.log('ℹ️ Doctor status already:', doctorProfile[0].status)
						}
					}
				} catch (dbError) {
					console.error('Error updating doctor status:', dbError)
					// Continue without status update - not critical for auth
				}
			}

			// Set the authentication cookie
			await setAuthCookie({
				id: user.id,
				email: user.email,
				role: user.role,
				status: user.status,
				cognitoUserId: user.id, // Assuming this is the cognito user ID
			})

			console.log('✅ Authentication cookie set successfully')

			// Return success with user data (frontend can still use this)
			return NextResponse.json({
				success: true,
				user: {
					id: user.id,
					email: user.email,
					role: user.role,
					status: user.status,
					firstName,
					lastName,
				},
				// Still return access token for compatibility, but cookie auth is primary
				accessToken: user.accessToken,
			})

		} catch (loginError) {
			console.error('❌ Auto-login failed after password setup:', loginError)
			
			// Password was set but auto-login failed
			return NextResponse.json({
				success: true,
				requiresLogin: true,
				message: 'Password set successfully. Please log in with your new password.',
			})
		}

	} catch (error: any) {
		console.error('❌ Unexpected error in set permanent password:', {
			error: error.message,
			stack: error.stack,
			name: error.name,
			timestamp: new Date().toISOString()
		})
		
		return NextResponse.json(
			{ error: error.message || 'Failed to set permanent password. Please try again.' },
			{ status: 500 }
		)
	}
} 