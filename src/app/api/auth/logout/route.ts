import { clearAuthCookie } from '@/lib/auth/cookies'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
	try {
		// Clear the authentication cookie
		await clearAuthCookie()

		return NextResponse.json({
			success: true,
			message: 'Logged out successfully',
		})
	} catch (error) {
		console.error('Logout error:', error)
		
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
} 