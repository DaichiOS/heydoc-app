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

		// Use the new method to verify temporary password
		const result = await cognitoService.verifyTemporaryPassword(email, temporaryPassword)
		
		if (result.success) {
			return NextResponse.json({
				success: true,
				requiresNewPassword: true,
			})
		} else {
			return NextResponse.json(
				{ error: result.error || 'Invalid email or temporary password' },
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