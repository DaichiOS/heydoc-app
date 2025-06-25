import { getAuthUser } from '@/lib/auth/cookies'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
	try {
		// Get user from JWT cookie
		const user = await getAuthUser()

		if (!user) {
			return NextResponse.json(
				{ error: 'Not authenticated' },
				{ status: 401 }
			)
		}

		// Return user data without sensitive information
		return NextResponse.json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
				status: user.status,
			},
		})
	} catch (error) {
		console.error('Session validation error:', error)
		
		return NextResponse.json(
			{ error: 'Session validation failed' },
			{ status: 500 }
		)
	}
} 