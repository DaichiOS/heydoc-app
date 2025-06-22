import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const email = searchParams.get('email')

		if (!email) {
			return NextResponse.json(
				{ error: 'Email is required' },
				{ status: 400 }
			)
		}

		// Get user by email
		const user = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1)

		if (user.length === 0) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			)
		}

		return NextResponse.json({
			success: true,
			user: {
				id: user[0].id,
				email: user[0].email,
				role: user[0].role,
				status: user[0].status,
				createdAt: user[0].createdAt,
			},
		})

	} catch (error) {
		console.error('Error fetching user by email:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
} 