import { requireServerAdmin } from '@/lib/auth/server'
import { AdminService } from '@/lib/services/admin-service'
import { Suspense } from 'react'

interface AdminDashboardStats {
	pendingApplications: number
	activeDoctors: number
	totalPatients: number
	totalUsers: number
}

async function AdminDashboardContent() {
	// Require admin authentication
	const user = await requireServerAdmin()
	
	const adminService = new AdminService()
	
	try {
		// Get dashboard statistics
		const stats = await adminService.getDashboardStats()
		
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						Admin Dashboard
					</h1>
					<p className="text-gray-600 mt-2">
						Welcome back, {user.email}
					</p>
				</div>

				{/* Dashboard Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
						<h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
							Pending Applications
						</h3>
						<p className="text-3xl font-bold text-orange-600 mt-2">
							{stats.pendingApplications}
						</p>
					</div>
					
					<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
						<h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
							Active Doctors
						</h3>
						<p className="text-3xl font-bold text-green-600 mt-2">
							{stats.activeDoctors}
						</p>
					</div>
					
					<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
						<h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
							Total Patients
						</h3>
						<p className="text-3xl font-bold text-blue-600 mt-2">
							{stats.totalPatients}
						</p>
					</div>
					
					<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
						<h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
							Total Users
						</h3>
						<p className="text-3xl font-bold text-purple-600 mt-2">
							{stats.totalUsers}
						</p>
					</div>
				</div>

				{/* Recent Activity */}
				<div className="bg-white rounded-lg shadow-md border border-gray-200">
					<div className="px-6 py-4 border-b border-gray-200">
						<h2 className="text-xl font-semibold text-gray-900">
							Recent Activity
						</h2>
					</div>
					<div className="p-6">
						<p className="text-gray-500">
							Recent activity dashboard coming soon...
						</p>
					</div>
				</div>
			</div>
		)
	} catch (error) {
		console.error('Dashboard error:', error)
		
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="bg-red-50 border border-red-200 rounded-lg p-6">
					<h2 className="text-lg font-medium text-red-800 mb-2">
						Dashboard Error
					</h2>
					<p className="text-red-600">
						Failed to load dashboard data. Please try again later.
					</p>
				</div>
			</div>
		)
	}
}

function DashboardLoadingSkeleton() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
				<div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
			</div>

			{/* Loading skeleton for stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
						<div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
						<div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
					</div>
				))}
			</div>

			{/* Loading skeleton for recent activity */}
			<div className="bg-white rounded-lg shadow-md border border-gray-200">
				<div className="px-6 py-4 border-b border-gray-200">
					<div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
				</div>
				<div className="p-6">
					<div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
					<div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
				</div>
			</div>
		</div>
	)
}

export default async function AdminDashboardPage() {
	return (
		<Suspense fallback={<DashboardLoadingSkeleton />}>
			<AdminDashboardContent />
		</Suspense>
	)
} 