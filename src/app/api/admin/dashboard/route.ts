import { AdminService } from '@/lib/services/admin-service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		// TODO: Add proper authentication check here
		// For now, we'll assume the request is authenticated as admin
		
		const adminService = new AdminService()
		const stats = await adminService.getDashboardStats()

		return NextResponse.json({
			success: true,
			data: stats,
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