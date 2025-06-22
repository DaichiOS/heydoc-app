import { CognitoService } from '@/lib/aws/cognito'
import { NextRequest, NextResponse } from 'next/server'

const cognitoService = new CognitoService()

export async function POST(request: NextRequest) {
	try {
		const { email, temporaryPassword } = await request.json()

		if (!email || !temporaryPassword) {
			return NextResponse.json(
				{ error: 'Email and temporary password are required' },
				{ status: 400 }
			)
		}

		// Try to authenticate with temporary password
		try {
			const authResult = await cognitoService.signIn(email, temporaryPassword)
			
			if (authResult) {
				// Success - user can continue with permanent password
				return NextResponse.json({
					success: true,
					requiresNewPassword: true, // Always require new password after temp
				})
			} else {
				return NextResponse.json(
					{ error: 'Invalid email or temporary password' },
					{ status: 401 }
				)
			}
		} catch (error: any) {
			// Check if it's a new password required error
			if (error.message.includes('NEW_PASSWORD_REQUIRED') || 
				error.message.includes('NotAuthorizedException')) {
				return NextResponse.json({
					success: true,
					requiresNewPassword: true,
				})
			}
			
			console.error('Temp password verification error:', error)
			return NextResponse.json(
				{ error: 'Invalid email or temporary password' },
				{ status: 401 }
			)
		}

	} catch (error) {
		console.error('Verify temp password error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
} 