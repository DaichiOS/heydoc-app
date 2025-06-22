import { cognitoService } from '@/lib/aws/cognito'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json()

		if (!email) {
			return NextResponse.json(
				{ error: 'Email is required' },
				{ status: 400 }
			)
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: 'Invalid email format' },
				{ status: 400 }
			)
		}

		const result = await cognitoService.resendConfirmationCode(email)

		if (result.success) {
			return NextResponse.json({
				message: 'Confirmation code sent successfully. Please check your email.',
			})
		} else {
			return NextResponse.json(
				{ error: result.error || 'Failed to resend confirmation code' },
				{ status: 400 }
			)
		}
	} catch (error) {
		console.error('Resend confirmation error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
} 