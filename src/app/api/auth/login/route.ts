import { NextRequest, NextResponse } from 'next/server'
import { authService } from '../../../../lib/auth'
import { validateConfig } from '../../../../lib/config'

export async function POST(request: NextRequest) {
	try {
		// Validate environment configuration
		validateConfig()

		const { email, password } = await request.json()

		// Validate input
		if (!email || !password) {
			return NextResponse.json(
				{ success: false, error: 'Email and password are required' },
				{ status: 400 }
			)
		}

		// Authenticate user
		const user = await authService.signIn(email, password)

		if (!user) {
			return NextResponse.json(
				{ success: false, error: 'Invalid email or password' },
				{ status: 401 }
			)
		}

		// Check if user is active (for doctors, they need admin approval)
		if (user.role === 'doctor' && user.status === 'pending') {
			return NextResponse.json(
				{ 
					success: false, 
					error: 'Your account is pending approval. Please wait for admin confirmation.',
					isPending: true 
				},
				{ status: 403 }
			)
		}

		if (user.status === 'inactive') {
			return NextResponse.json(
				{ success: false, error: 'Your account has been deactivated. Please contact support.' },
				{ status: 403 }
			)
		}

		// Return user data (excluding sensitive tokens for now)
		return NextResponse.json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
				status: user.status,
			},
			// Note: In production, tokens should be stored in httpOnly cookies
			accessToken: user.accessToken,
		})

	} catch (error: any) {
		console.error('Login API error:', error)
		return NextResponse.json(
			{ success: false, error: error.message || 'Authentication failed' },
			{ status: 500 }
		)
	}
} 