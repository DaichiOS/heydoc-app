import { AdminService } from '@/lib/services/admin-service'

export async function DashboardStats() {
	try {
		const adminService = new AdminService()
		const stats = await adminService.getDashboardStats()

		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<div className="bg-white rounded-xl p-6 border border-border">
					<h3 className="text-sm font-medium text-muted-foreground mb-2">
						Pending Applications
					</h3>
					<p className="text-3xl font-bold text-heydoc-primary">
						{stats.pendingApplications}
					</p>
					<p className="text-sm text-muted-foreground mt-1">
						Doctor applications awaiting review
					</p>
				</div>
				
				<div className="bg-white rounded-xl p-6 border border-border">
					<h3 className="text-sm font-medium text-muted-foreground mb-2">
						Active Doctors
					</h3>
					<p className="text-3xl font-bold text-success">
						{stats.activeDoctors}
					</p>
					<p className="text-sm text-muted-foreground mt-1">
						Approved and active doctors
					</p>
				</div>
				
				<div className="bg-white rounded-xl p-6 border border-border">
					<h3 className="text-sm font-medium text-muted-foreground mb-2">
						Total Patients
					</h3>
					<p className="text-3xl font-bold text-primary">
						{stats.totalPatients}
					</p>
					<p className="text-sm text-muted-foreground mt-1">
						Registered patients
					</p>
				</div>
				
				<div className="bg-white rounded-xl p-6 border border-border">
					<h3 className="text-sm font-medium text-muted-foreground mb-2">
						Total Users
					</h3>
					<p className="text-3xl font-bold text-blue-600">
						{stats.totalUsers}
					</p>
					<p className="text-sm text-muted-foreground mt-1">
						All registered users
					</p>
				</div>
			</div>
		)
	} catch (error) {
		console.error('Error loading dashboard stats:', error)
		
		// Fallback UI
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<div className="bg-white rounded-xl p-6 border border-border">
					<h3 className="text-sm font-medium text-muted-foreground mb-2">
						Pending Applications
					</h3>
					<p className="text-3xl font-bold text-heydoc-primary">-</p>
					<p className="text-sm text-muted-foreground mt-1">
						Unable to load data
					</p>
				</div>
				
				<div className="bg-white rounded-xl p-6 border border-border">
					<h3 className="text-sm font-medium text-muted-foreground mb-2">
						Active Doctors
					</h3>
					<p className="text-3xl font-bold text-success">-</p>
					<p className="text-sm text-muted-foreground mt-1">
						Unable to load data
					</p>
				</div>
				
				<div className="bg-white rounded-xl p-6 border border-border">
					<h3 className="text-sm font-medium text-muted-foreground mb-2">
						Total Patients
					</h3>
					<p className="text-3xl font-bold text-primary">-</p>
					<p className="text-sm text-muted-foreground mt-1">
						Unable to load data
					</p>
				</div>
				
				<div className="bg-white rounded-xl p-6 border border-border">
					<h3 className="text-sm font-medium text-muted-foreground mb-2">
						Total Users
					</h3>
					<p className="text-3xl font-bold text-blue-600">-</p>
					<p className="text-sm text-muted-foreground mt-1">
						Unable to load data
					</p>
				</div>
			</div>
		)
	}
} 