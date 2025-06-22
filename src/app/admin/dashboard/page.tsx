'use client'

import { AdminHeader } from '@/components/ui/admin-header'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface User {
	id: string
	email: string
	role: string
	status: string
}

export default function AdminDashboard() {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const router = useRouter()

	useEffect(() => {
		// Check if user is authenticated and is admin
		const authData = localStorage.getItem('heydoc_auth')
		if (!authData) {
			router.push('/login')
			return
		}

		try {
			const userData = JSON.parse(authData)
			if (userData.role !== 'admin') {
				router.push('/login')
				return
			}
			setUser(userData)
		} catch (error) {
			router.push('/login')
			return
		}
		
		setIsLoading(false)
	}, [router])

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="mt-2 text-muted-foreground">Loading...</p>
				</div>
			</div>
		)
	}

	if (!user) {
		return null // Will redirect to login
	}

	return (
		<div className="min-h-screen bg-slate-50">
			{/* Use the new AdminHeader component */}
			<AdminHeader />

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground mb-2">
						Admin Dashboard
					</h1>
					<p className="text-muted-foreground">
						Manage HeyDoc users, doctor applications, and system settings.
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<div className="bg-white rounded-xl p-6 border border-border">
						<h3 className="text-sm font-medium text-muted-foreground mb-2">
							Pending Applications
						</h3>
						<p className="text-3xl font-bold text-heydoc-primary">0</p>
						<p className="text-sm text-muted-foreground mt-1">
							Doctor applications awaiting review
						</p>
					</div>
					
					<div className="bg-white rounded-xl p-6 border border-border">
						<h3 className="text-sm font-medium text-muted-foreground mb-2">
							Active Doctors
						</h3>
						<p className="text-3xl font-bold text-success">0</p>
						<p className="text-sm text-muted-foreground mt-1">
							Approved and active doctors
						</p>
					</div>
					
					<div className="bg-white rounded-xl p-6 border border-border">
						<h3 className="text-sm font-medium text-muted-foreground mb-2">
							Total Patients
						</h3>
						<p className="text-3xl font-bold text-primary">0</p>
						<p className="text-sm text-muted-foreground mt-1">
							Registered patients
						</p>
					</div>
					
					<div className="bg-white rounded-xl p-6 border border-border">
						<h3 className="text-sm font-medium text-muted-foreground mb-2">
							System Status
						</h3>
						<div className="flex items-center space-x-2">
							<div className="w-3 h-3 bg-success rounded-full"></div>
							<span className="text-sm font-medium text-success">Operational</span>
						</div>
						<p className="text-sm text-muted-foreground mt-1">
							All systems running normally
						</p>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="bg-white rounded-xl p-6 border border-border mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						Quick Actions
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<button className="p-4 text-left border border-border rounded-lg hover:bg-muted transition-colors">
							<h3 className="font-medium text-foreground mb-1">
								Review Applications
							</h3>
							<p className="text-sm text-muted-foreground">
								Approve or reject doctor applications
							</p>
						</button>
						
						<button className="p-4 text-left border border-border rounded-lg hover:bg-muted transition-colors">
							<h3 className="font-medium text-foreground mb-1">
								Manage Users
							</h3>
							<p className="text-sm text-muted-foreground">
								View and manage user accounts
							</p>
						</button>
						
						<button className="p-4 text-left border border-border rounded-lg hover:bg-muted transition-colors">
							<h3 className="font-medium text-foreground mb-1">
								System Settings
							</h3>
							<p className="text-sm text-muted-foreground">
								Configure system preferences
							</p>
						</button>
					</div>
				</div>

				{/* Recent Activity */}
				<div className="bg-white rounded-xl p-6 border border-border">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						Recent Activity
					</h2>
					<div className="text-center py-8">
						<p className="text-muted-foreground">
							No recent activity to display
						</p>
					</div>
				</div>
			</main>
		</div>
	)
} 