import { db } from '@/lib/db/connection'
import { adminActions, doctors, DoctorStatus, patients, users } from '@/lib/db/schema'
import { and, count, desc, eq, or } from 'drizzle-orm'

export interface DashboardStats {
	pendingApplications: number
	activeDoctors: number
	totalPatients: number
	totalUsers: number
	recentApplications: number // Last 7 days
}

export interface DoctorApplication {
	id: string
	firstName: string
	lastName: string
	email: string
	phone: string
	ahpraNumber: string
	medicalSpecialty: string | null
	status: DoctorStatus
	createdAt: Date | null
	updatedAt: Date | null
}

export interface UserOverview {
	id: string
	email: string
	role: string
	status: string
	createdAt: Date | null
	doctorInfo?: {
		firstName: string
		lastName: string
		specialty: string | null
		status: DoctorStatus
	}
}

export class AdminService {
	/**
	 * Get dashboard statistics
	 */
	async getDashboardStats(): Promise<DashboardStats> {
		try {
			const [
				pendingApplicationsResult,
				activeDoctorsResult,
				totalPatientsResult,
				totalUsersResult,
				recentApplicationsResult,
			] = await Promise.all([
				// Pending applications (pending + documentation_required)
				db
					.select({ count: count() })
					.from(doctors)
					.where(
						or(
							eq(doctors.status, 'pending'),
							eq(doctors.status, 'documentation_required')
						)
					),
				
				// Active doctors
				db
					.select({ count: count() })
					.from(doctors)
					.where(eq(doctors.status, 'active')),
				
				// Total patients
				db
					.select({ count: count() })
					.from(patients),
				
				// Total users
				db
					.select({ count: count() })
					.from(users),
				
				// Recent applications (last 7 days)
				db
					.select({ count: count() })
					.from(doctors)
					.where(
						and(
							eq(doctors.status, 'pending'),
							// TODO: Add date filter for last 7 days
						)
					),
			])

			return {
				pendingApplications: pendingApplicationsResult[0]?.count || 0,
				activeDoctors: activeDoctorsResult[0]?.count || 0,
				totalPatients: totalPatientsResult[0]?.count || 0,
				totalUsers: totalUsersResult[0]?.count || 0,
				recentApplications: recentApplicationsResult[0]?.count || 0,
			}
		} catch (error) {
			console.error('Error getting dashboard stats:', error)
			throw new Error('Failed to get dashboard statistics')
		}
	}

	/**
	 * Get pending doctor applications
	 */
	async getPendingApplications(
		page: number = 1,
		limit: number = 10
	): Promise<{
		applications: DoctorApplication[]
		pagination: {
			page: number
			limit: number
			total: number
			totalPages: number
		}
	}> {
		try {
			const offset = (page - 1) * limit

			// Get total count
			const totalResult = await db
				.select({ count: count() })
				.from(doctors)
				.innerJoin(users, eq(doctors.userId, users.id))
				.where(
					or(
						eq(doctors.status, 'pending'),
						eq(doctors.status, 'documentation_required')
					)
				)

			const total = totalResult[0]?.count || 0

			// Get applications
			const applicationsResult = await db
				.select({
					id: doctors.id,
					firstName: doctors.firstName,
					lastName: doctors.lastName,
					email: users.email,
					phone: doctors.phone,
					ahpraNumber: doctors.ahpraNumber,
					medicalSpecialty: doctors.medicalSpecialty,
					status: doctors.status,
					createdAt: doctors.createdAt,
					updatedAt: doctors.updatedAt,
				})
				.from(doctors)
				.innerJoin(users, eq(doctors.userId, users.id))
				.where(
					or(
						eq(doctors.status, 'pending'),
						eq(doctors.status, 'documentation_required')
					)
				)
				.orderBy(desc(doctors.createdAt))
				.limit(limit)
				.offset(offset)

			const totalPages = Math.ceil(total / limit)

			return {
				applications: applicationsResult,
				pagination: {
					page,
					limit,
					total,
					totalPages,
				},
			}
		} catch (error) {
			console.error('Error getting pending applications:', error)
			throw new Error('Failed to get pending applications')
		}
	}

	/**
	 * Get all users with optional filtering
	 */
	async getUsers(
		page: number = 1,
		limit: number = 10,
		role?: string,
		status?: string
	): Promise<{
		users: UserOverview[]
		pagination: {
			page: number
			limit: number
			total: number
			totalPages: number
		}
	}> {
		try {
			const offset = (page - 1) * limit

			// Build where conditions
			const conditions = []
			if (role) {
				conditions.push(eq(users.role, role))
			}
			if (status) {
				conditions.push(eq(users.status, status))
			}

			const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

			// Get total count
			const totalQuery = db.select({ count: count() }).from(users)
			if (whereCondition) {
				totalQuery.where(whereCondition)
			}
			const totalResult = await totalQuery
			const total = totalResult[0]?.count || 0

			// Get users with optional doctor info
			const usersQuery = db
				.select({
					id: users.id,
					email: users.email,
					role: users.role,
					status: users.status,
					createdAt: users.createdAt,
					doctorId: doctors.id,
					doctorFirstName: doctors.firstName,
					doctorLastName: doctors.lastName,
					doctorSpecialty: doctors.medicalSpecialty,
					doctorStatus: doctors.status,
				})
				.from(users)
				.leftJoin(doctors, eq(users.id, doctors.userId))
				.limit(limit)
				.offset(offset)
				.orderBy(desc(users.createdAt))

			if (whereCondition) {
				usersQuery.where(whereCondition)
			}

			const usersResult = await usersQuery

			const usersWithDoctorInfo: UserOverview[] = usersResult.map(user => ({
				id: user.id,
				email: user.email,
				role: user.role,
				status: user.status,
				createdAt: user.createdAt,
				doctorInfo: user.doctorId
					? {
							firstName: user.doctorFirstName!,
							lastName: user.doctorLastName!,
							specialty: user.doctorSpecialty,
							status: user.doctorStatus!,
					  }
					: undefined,
			}))

			const totalPages = Math.ceil(total / limit)

			return {
				users: usersWithDoctorInfo,
				pagination: {
					page,
					limit,
					total,
					totalPages,
				},
			}
		} catch (error) {
			console.error('Error getting users:', error)
			throw new Error('Failed to get users')
		}
	}

	/**
	 * Approve a doctor application
	 */
	async approveDoctor(
		doctorId: string,
		adminId: string,
		reason?: string
	): Promise<void> {
		try {
			await db.transaction(async (tx) => {
				// Update doctor status to active
				await tx
					.update(doctors)
					.set({
						status: 'active',
						approvedAt: new Date(),
						approvedBy: adminId,
						updatedAt: new Date(),
					})
					.where(eq(doctors.id, doctorId))

				// Log admin action
				await tx.insert(adminActions).values({
					adminId,
					targetId: doctorId,
					targetType: 'doctor',
					action: 'approve',
					reason: reason || 'Application approved',
					metadata: {
						status: 'active',
						timestamp: new Date().toISOString(),
					},
				})
			})
		} catch (error) {
			console.error('Error approving doctor:', error)
			throw new Error('Failed to approve doctor application')
		}
	}

	/**
	 * Reject a doctor application
	 */
	async rejectDoctor(
		doctorId: string,
		adminId: string,
		reason: string
	): Promise<void> {
		try {
			await db.transaction(async (tx) => {
				// Update doctor status to rejected
				await tx
					.update(doctors)
					.set({
						status: 'rejected',
						updatedAt: new Date(),
					})
					.where(eq(doctors.id, doctorId))

				// Log admin action
				await tx.insert(adminActions).values({
					adminId,
					targetId: doctorId,
					targetType: 'doctor',
					action: 'reject',
					reason,
					metadata: {
						status: 'rejected',
						timestamp: new Date().toISOString(),
					},
				})
			})
		} catch (error) {
			console.error('Error rejecting doctor:', error)
			throw new Error('Failed to reject doctor application')
		}
	}

	/**
	 * Request additional documentation from doctor
	 */
	async requestDocumentation(
		doctorId: string,
		adminId: string,
		reason: string
	): Promise<void> {
		try {
			await db.transaction(async (tx) => {
				// Update doctor status to documentation_required
				await tx
					.update(doctors)
					.set({
						status: 'documentation_required',
						updatedAt: new Date(),
					})
					.where(eq(doctors.id, doctorId))

				// Log admin action
				await tx.insert(adminActions).values({
					adminId,
					targetId: doctorId,
					targetType: 'doctor',
					action: 'request_documentation',
					reason,
					metadata: {
						status: 'documentation_required',
						timestamp: new Date().toISOString(),
					},
				})
			})
		} catch (error) {
			console.error('Error requesting documentation:', error)
			throw new Error('Failed to request additional documentation')
		}
	}

	/**
	 * Get doctor application details
	 */
	async getDoctorApplication(doctorId: string): Promise<DoctorApplication | null> {
		try {
			const result = await db
				.select({
					id: doctors.id,
					firstName: doctors.firstName,
					lastName: doctors.lastName,
					email: users.email,
					phone: doctors.phone,
					ahpraNumber: doctors.ahpraNumber,
					medicalSpecialty: doctors.medicalSpecialty,
					status: doctors.status,
					createdAt: doctors.createdAt,
					updatedAt: doctors.updatedAt,
				})
				.from(doctors)
				.innerJoin(users, eq(doctors.userId, users.id))
				.where(eq(doctors.id, doctorId))
				.limit(1)

			return result[0] || null
		} catch (error) {
			console.error('Error getting doctor application:', error)
			throw new Error('Failed to get doctor application')
		}
	}
} 