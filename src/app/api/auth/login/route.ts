import { db } from '@/lib/db'
import { doctors, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
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

		// Only block inactive users - allow pending doctors to log in and see their profile
		if (user.status === 'inactive') {
			return NextResponse.json(
				{ success: false, error: 'Your account has been deactivated. Please contact support.' },
				{ status: 403 }
			)
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

		// Return user data (including pending doctors)
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