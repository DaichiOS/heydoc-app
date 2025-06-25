import { authService } from '@/lib/auth'
import { setAuthCookie } from '@/lib/auth/cookies'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const loginSchema = z.object({
	email: z.string().email('Invalid email format'),
	password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		
		// Validate request body
		const validatedData = loginSchema.parse(body)
		const { email, password } = validatedData

		// Authenticate with existing auth service
		const authUser = await authService.signIn(email, password)
		
		if (!authUser) {
			return NextResponse.json(
				{ error: 'Invalid email or password' },
				{ status: 401 }
			)
		}

		// Create JWT payload
		const userPayload = {
			id: authUser.id,
			email: authUser.email,
			role: authUser.role,
			status: authUser.status,
		}

		// Set authentication cookie
		await setAuthCookie(userPayload)

		// Return success response without sensitive data
		return NextResponse.json({
			success: true,
			user: {
				id: authUser.id,
				email: authUser.email,
				role: authUser.role,
				status: authUser.status,
			},
		})
	} catch (error) {
		console.error('Login error:', error)
		
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation failed', details: error.errors },
				{ status: 400 }
			)
		}

		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
} 