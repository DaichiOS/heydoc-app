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

		// Use the new method to set permanent password
		const result = await cognitoService.setPermanentPassword(email, temporaryPassword, newPassword)

		if (result.success) {
			return NextResponse.json({
				success: true,
				message: 'Password set successfully',
			})
		} else {
			return NextResponse.json(
				{ error: result.error || 'Failed to set password' },
				{ status: 400 }
			)
		}

	} catch (error) {
		console.error('Set permanent password error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
} 