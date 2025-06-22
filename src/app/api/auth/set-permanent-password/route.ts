import { authService } from '@/lib/auth'
import { CognitoService } from '@/lib/aws/cognito'
import { db } from '@/lib/db'
import { doctors, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

const cognitoService = new CognitoService()

export async function POST(request: NextRequest) {
	try {
		const { email, temporaryPassword, newPassword } = await request.json()

		// Validate input
		if (!email || !temporaryPassword || !newPassword) {
			return NextResponse.json(
				{ error: 'Email, temporary password, and new password are required' },
				{ status: 400 }
			)
		}

		// Validate password strength
		if (newPassword.length < 8) {
			return NextResponse.json(
				{ error: 'Password must be at least 8 characters long' },
				{ status: 400 }
			)
		}

		if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
			return NextResponse.json(
				{ error: 'Password must contain uppercase, lowercase, and numeric characters' },
				{ status: 400 }
			)
		}

		// First verify the temporary password and set the new one
		const setPermanentResult = await cognitoService.setPermanentPassword(
			email,
			temporaryPassword,
			newPassword
		)

		if (!setPermanentResult.success) {
			return NextResponse.json(
				{ error: setPermanentResult.error || 'Failed to set permanent password' },
				{ status: 400 }
			)
		}

		// Now automatically log the user in with their new password
		try {
			const user = await authService.signIn(email, newPassword)
			
			if (!user) {
				// Password was set but auto-login failed
				return NextResponse.json({
					success: true,
					requiresLogin: true,
					message: 'Password set successfully. Please log in with your new password.',
				})
			}

			// Get doctor's name if user is a doctor
			let firstName = ''
			let lastName = ''
			
			if (user.role === 'doctor') {
				try {
					const doctorProfile = await db
						.select({
							firstName: doctors.firstName,
							lastName: doctors.lastName,
						})
						.from(doctors)
						.innerJoin(users, eq(users.id, doctors.userId))
						.where(eq(users.email, email))
						.limit(1)
					
					if (doctorProfile.length > 0) {
						firstName = doctorProfile[0].firstName
						lastName = doctorProfile[0].lastName
					}
				} catch (dbError) {
					console.error('Error fetching doctor name:', dbError)
					// Continue without name - not critical for auth
				}
			}

			// Auto-login successful - return auth data with name
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
				accessToken: user.accessToken,
			})

		} catch (loginError) {
			console.error('Auto-login failed after password setup:', loginError)
			
			// Password was set but auto-login failed
			return NextResponse.json({
				success: true,
				requiresLogin: true,
				message: 'Password set successfully. Please log in with your new password.',
			})
		}

	} catch (error: any) {
		console.error('Set permanent password error:', error)
		return NextResponse.json(
			{ error: error.message || 'Failed to set permanent password' },
			{ status: 500 }
		)
	}
} 