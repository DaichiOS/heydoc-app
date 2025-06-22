import { cognitoService } from '@/lib/aws/cognito'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const { accessToken } = await request.json()

		if (!accessToken) {
			return NextResponse.json(
				{ success: false, error: 'Access token is required' },
				{ status: 400 }
			)
		}

		// Validate token with Cognito
		const isValid = await cognitoService.validateAccessToken(accessToken)
		
		if (!isValid) {
			return NextResponse.json(
				{ success: false, error: 'Invalid or expired token' },
				{ status: 401 }
			)
		}

		return NextResponse.json({
			success: true,
			message: 'Session is valid'
		})

	} catch (error: any) {
		console.error('Session validation error:', error)
		return NextResponse.json(
			{ success: false, error: 'Session validation failed' },
			{ status: 500 }
		)
	}
} 