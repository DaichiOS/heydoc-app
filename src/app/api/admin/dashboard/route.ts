import { getAuthUser } from '@/lib/auth/cookies'
import { AdminService } from '@/lib/services/admin-service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		// Check authentication
		const user = await getAuthUser()
		if (!user) {
			return NextResponse.json(
				{ success: false, error: 'Authentication required' },
				{ status: 401 }
			)
		}

		// Check admin role
		if (user.role !== 'admin') {
			return NextResponse.json(
				{ success: false, error: 'Admin access required' },
				{ status: 403 }
			)
		}

		const adminService = new AdminService()
		const stats = await adminService.getDashboardStats()

		return NextResponse.json({
			success: true,
			stats: stats,
		})
	} catch (error) {
		console.error('Error fetching dashboard stats:', error)
		
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch dashboard statistics',
			},
			{ status: 500 }
		)
	}
} 