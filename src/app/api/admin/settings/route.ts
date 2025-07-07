import { getAuthUser } from '@/lib/auth/cookies'
import { AdminService } from '@/lib/services/admin-service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
	try {
		// Get authenticated user
		const user = await getAuthUser()
		if (!user || user.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const adminService = new AdminService()
		
		// Get or create admin profile
		const admin = await adminService.getOrCreateAdmin(user.id)
		
		if (!admin) {
			return NextResponse.json({ error: 'Admin profile not found' }, { status: 404 })
		}

		// Return admin data
		return NextResponse.json({
			success: true,
			admin: {
				firstName: admin.firstName,
				lastName: admin.lastName,
				calendlyLink: admin.calendlyLink,
				phone: admin.phone,
				department: admin.department,
				title: admin.title,
			}
		})
	} catch (error) {
		console.error('Error fetching admin settings:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch admin settings' },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		// Get authenticated user
		const user = await getAuthUser()
		if (!user || user.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const { firstName, lastName, calendlyLink, phone, department, title } = body

		const adminService = new AdminService()
		
		// Get or create admin profile first
		await adminService.getOrCreateAdmin(user.id)
		
		// Update admin profile
		const updatedAdmin = await adminService.updateAdmin(user.id, {
			...(firstName && { firstName }),
			...(lastName && { lastName }),
			...(calendlyLink && { calendlyLink }),
			...(phone && { phone }),
			...(department && { department }),
			...(title && { title }),
		})

		if (!updatedAdmin) {
			return NextResponse.json({ error: 'Failed to update admin profile' }, { status: 500 })
		}

		return NextResponse.json({
			success: true,
			admin: updatedAdmin
		})
	} catch (error) {
		console.error('Error updating admin settings:', error)
		return NextResponse.json(
			{ error: 'Failed to update admin settings' },
			{ status: 500 }
		)
	}
} 