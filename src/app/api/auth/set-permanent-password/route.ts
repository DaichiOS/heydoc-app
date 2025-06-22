import { CognitoService } from '@/lib/aws/cognito'
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

		// First, verify the temporary password by attempting to sign in
		try {
			await cognitoService.signIn(email, temporaryPassword)
		} catch (error: any) {
			console.error('Temporary password verification failed:', error)
			return NextResponse.json(
				{ error: 'Invalid temporary password' },
				{ status: 401 }
			)
		}

		// Set the permanent password in Cognito
		const success = await cognitoService.setUserPermanentPassword(email, newPassword)
		
		if (!success) {
			return NextResponse.json(
				{ error: 'Failed to set password' },
				{ status: 500 }
			)
		}

		// Mark email as verified
		const emailVerified = await cognitoService.updateUserAttributes(email, {
			'email_verified': 'true'
		})

		if (!emailVerified) {
			console.warn('Failed to mark email as verified for:', email)
		}

		return NextResponse.json({ 
			success: true,
			message: 'Password set successfully. You can now log in with your new password.' 
		})

	} catch (error: any) {
		console.error('Set permanent password error:', error)
		
		let errorMessage = 'Failed to set password'
		if (error.message?.includes('not found')) {
			errorMessage = 'User account not found. Please register first.'
		} else if (error.message?.includes('Password did not conform')) {
			errorMessage = 'Password does not meet security requirements'
		} else if (error.message?.includes('NotAuthorizedException')) {
			errorMessage = 'Invalid temporary password'
		}

		return NextResponse.json(
			{ error: errorMessage },
			{ status: 500 }
		)
	}
} 