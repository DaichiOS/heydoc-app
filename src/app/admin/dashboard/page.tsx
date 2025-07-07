'use client'

import { AdminHeader } from '@/components/ui/admin-header'
import { useAuth } from '@/hooks/use-auth'
import { Suspense, useEffect, useState } from 'react'

interface AdminDashboardStats {
	pendingApplications: number
	activeDoctors: number
	totalPatients: number
	totalUsers: number
}

function AdminDashboardContent() {
	const { user, isAuthenticated, isAdmin, isLoading } = useAuth()
	const [stats, setStats] = useState<AdminDashboardStats>({
		pendingApplications: 0,
		activeDoctors: 0,
		totalPatients: 0,
		totalUsers: 0
	})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		// Don't redirect while auth is still loading
		if (isLoading) return
		
		if (!isAuthenticated || !isAdmin) {
			window.location.href = '/login'
			return
		}

		fetchDashboardStats()
	}, [isAuthenticated, isAdmin, isLoading])

	const fetchDashboardStats = async () => {
		try {
			setLoading(true)
			const response = await fetch('/api/admin/dashboard')
			
			if (!response.ok) {
				throw new Error(`Failed to fetch dashboard stats: ${response.status}`)
			}
			
			const data = await response.json()
			
			if (data.success) {
				setStats(data.stats)
			} else {
				throw new Error(data.error || 'Failed to fetch dashboard stats')
			}
		} catch (err) {
			console.error('Error fetching dashboard stats:', err)
			setError('Failed to load dashboard data')
		} finally {
			setLoading(false)
		}
	}

	if (isLoading) {
		return <DashboardLoadingSkeleton />
	}

	if (loading) {
		return <DashboardLoadingSkeleton />
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white">
				<AdminHeader />
				<div className="container mx-auto px-4 py-8">
					<div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6 shadow-xl">
						<h2 className="text-lg font-medium text-red-800 mb-2">
							Dashboard Error
						</h2>
						<p className="text-red-600">{error}</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white">
			<AdminHeader />
			
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-[#1C1B3A]">
						Admin Dashboard
					</h1>
					<p className="text-slate-600 mt-2">
						Welcome back, {user?.email}
					</p>
				</div>

				{/* Dashboard Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/30">
						<h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
							Pending Applications
						</h3>
						<p className="text-3xl font-bold text-[#1C1B3A] mt-2">
							{stats.pendingApplications}
						</p>
					</div>
					
					<div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/30">
						<h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
							Active Doctors
						</h3>
						<p className="text-3xl font-bold text-[#1C1B3A] mt-2">
							{stats.activeDoctors}
						</p>
					</div>
					
					<div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/30">
						<h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
							Total Patients
						</h3>
						<p className="text-3xl font-bold text-[#1C1B3A] mt-2">
							{stats.totalPatients}
						</p>
					</div>
					
					<div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/30">
						<h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
							Total Users
						</h3>
						<p className="text-3xl font-bold text-[#1C1B3A] mt-2">
							{stats.totalUsers}
						</p>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					<div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/30">
						<h3 className="text-lg font-semibold text-[#1C1B3A] mb-2">Review Applications</h3>
						<p className="text-slate-600 text-sm mb-4">Process pending doctor applications</p>
						<a 
							href="/admin/applications"
							className="inline-flex items-center px-6 py-3 bg-[#1C1B3A] text-white rounded-lg hover:bg-[#2A2951] transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
						>
							View Applications →
						</a>
					</div>

					<div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/30">
						<h3 className="text-lg font-semibold text-[#1C1B3A] mb-2">Manage Users</h3>
						<p className="text-slate-600 text-sm mb-4">View and manage all users</p>
						<a 
							href="/admin/users"
							className="inline-flex items-center px-6 py-3 bg-[#1C1B3A] text-white rounded-lg hover:bg-[#2A2951] transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
						>
							Manage Users →
						</a>
					</div>

					<div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/30">
						<h3 className="text-lg font-semibold text-[#1C1B3A] mb-2">Admin Settings</h3>
						<p className="text-slate-600 text-sm mb-4">Configure admin preferences and settings</p>
						<a 
							href="/admin/settings"
							className="inline-flex items-center px-6 py-3 bg-[#1C1B3A] text-white rounded-lg hover:bg-[#2A2951] transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
						>
							Open Settings →
						</a>
					</div>
				</div>

				{/* Recent Activity */}
				<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30">
					<div className="px-6 py-4 border-b border-slate-200/50">
						<h2 className="text-xl font-semibold text-[#1C1B3A]">
							Recent Activity
						</h2>
					</div>
					<div className="p-6">
						<p className="text-slate-500">
							Recent activity dashboard coming soon...
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

function DashboardLoadingSkeleton() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white">
			<div className="h-20 bg-slate-900 animate-pulse"></div>
			
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<div className="h-8 bg-slate-200/50 rounded w-64 mb-2 animate-pulse"></div>
					<div className="h-4 bg-slate-200/50 rounded w-48 animate-pulse"></div>
				</div>

				{/* Loading skeleton for stats */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/30">
							<div className="h-4 bg-slate-200/50 rounded w-32 mb-2 animate-pulse"></div>
							<div className="h-8 bg-slate-200/50 rounded w-16 animate-pulse"></div>
						</div>
					))}
				</div>

				{/* Loading skeleton for quick actions */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/30">
							<div className="h-6 bg-slate-200/50 rounded w-32 mb-2 animate-pulse"></div>
							<div className="h-4 bg-slate-200/50 rounded w-40 mb-4 animate-pulse"></div>
							<div className="h-10 bg-slate-200/50 rounded-lg w-32 animate-pulse"></div>
						</div>
					))}
				</div>

				{/* Loading skeleton for recent activity */}
				<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30">
					<div className="px-6 py-4 border-b border-slate-200/50">
						<div className="h-6 bg-slate-200/50 rounded w-40 animate-pulse"></div>
					</div>
					<div className="p-6">
						<div className="h-4 bg-slate-200/50 rounded w-full mb-2 animate-pulse"></div>
						<div className="h-4 bg-slate-200/50 rounded w-3/4 animate-pulse"></div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default function AdminDashboardPage() {
	return (
		<Suspense fallback={<DashboardLoadingSkeleton />}>
			<AdminDashboardContent />
		</Suspense>
	)
} 