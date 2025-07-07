import { requireServerAdmin } from '@/lib/auth/server'
import { AdminService } from '@/lib/services/admin-service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	console.log('🔍 Admin applications API called')
	
	try {
		// Require admin authentication
		console.log('🔑 Checking admin authentication...')
		const admin = await requireServerAdmin()
		console.log('✅ Admin authenticated:', admin.email)
		
		const { searchParams } = new URL(request.url)
		const page = parseInt(searchParams.get('page') || '1', 10)
		const limit = parseInt(searchParams.get('limit') || '20', 10)
		
		console.log('📄 Fetching applications with params:', { page, limit })

		const adminService = new AdminService()

		// Get pending applications with pagination
		const result = await adminService.getPendingApplications(page, limit)
		
		console.log('📊 Applications result:', {
			count: result.applications.length,
			total: result.pagination.total,
			applications: result.applications.map(app => ({
				id: app.id,
				name: `${app.firstName} ${app.lastName}`,
				email: app.email,
				status: app.status
			}))
		})

		return NextResponse.json({
			applications: result.applications,
			pagination: result.pagination
		})

	} catch (error) {
		console.error('❌ Applications API error:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch applications' },
			{ status: 500 }
		)
	}
} 