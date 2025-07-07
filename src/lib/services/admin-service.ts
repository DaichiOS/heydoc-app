import { db } from '@/lib/db/connection'
import { adminActions, adminSettings, doctors, DoctorStatus, users, type Admin } from '@/lib/db/schema'
import { and, count, desc, eq, or, sql } from 'drizzle-orm'
import { AdminRepository, type AdminWithUser } from '../repositories/admin-repository'

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
	private adminRepository: AdminRepository

	constructor() {
		this.adminRepository = new AdminRepository()
	}

	/**
	 * Get or create admin profile
	 */
	async getOrCreateAdmin(userId: string): Promise<AdminWithUser | null> {
		try {
			// Try to get existing admin
			let admin = await this.adminRepository.findWithUserByUserId(userId)
			
			if (!admin) {
				// Check if user exists and is an admin
				const [user] = await db
					.select()
					.from(users)
					.where(and(eq(users.id, userId), eq(users.role, 'admin')))
					.limit(1)

				if (!user) {
					return null
				}

				// Create admin profile with default values
				const newAdmin = await this.adminRepository.create({
					userId,
					firstName: user.email.split('@')[0].split('.').map(part => 
						part.charAt(0).toUpperCase() + part.slice(1)
					).join(' '),
					lastName: '',
					status: 'active',
				})

				// Get the full admin with user data
				admin = await this.adminRepository.findWithUserByUserId(userId)
			}

			return admin
		} catch (error) {
			console.error('Error getting or creating admin:', error)
			throw new Error('Failed to get admin profile')
		}
	}

	/**
	 * Update admin profile
	 */
	async updateAdmin(
		userId: string, 
		updates: {
			firstName?: string
			lastName?: string
			calendlyLink?: string
			phone?: string
			department?: string
			title?: string
		}
	): Promise<Admin | null> {
		try {
			return await this.adminRepository.updateByUserId(userId, updates)
		} catch (error) {
			console.error('Error updating admin:', error)
			throw new Error('Failed to update admin profile')
		}
	}

	/**
	 * Get admin by user ID
	 */
	async getAdminByUserId(userId: string): Promise<AdminWithUser | null> {
		try {
			return await this.adminRepository.findWithUserByUserId(userId)
		} catch (error) {
			console.error('Error getting admin by user ID:', error)
			throw new Error('Failed to get admin')
		}
	}

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
				// Pending applications - include all statuses in the pipeline
				db
					.select({ count: count() })
					.from(doctors)
					.where(
						or(
							eq(doctors.status, 'email_unconfirmed'),
							eq(doctors.status, 'pending'),
							eq(doctors.status, 'documentation_required'),
							eq(doctors.status, 'interview_scheduled')
						)
					),
				// Active doctors
				db.select({ count: count() }).from(doctors).where(eq(doctors.status, 'active')),
				// Total patients
				db.select({ count: count() }).from(users).where(eq(users.role, 'patient')),
				// Total users
				db.select({ count: count() }).from(users),
				// Recent applications (last 7 days) - include all new applications
				db
					.select({ count: count() })
					.from(doctors)
					.where(
						and(
							or(
								eq(doctors.status, 'email_unconfirmed'),
								eq(doctors.status, 'pending'),
								eq(doctors.status, 'documentation_required'),
								eq(doctors.status, 'interview_scheduled')
							),
							sql`${doctors.createdAt} >= NOW() - INTERVAL '7 days'`
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
			console.log('🔍 Getting pending applications from database...')
			const offset = (page - 1) * limit

			// Get total count - include all statuses that need admin attention
			console.log('📊 Querying total count...')
			const totalResult = await db
				.select({ count: count() })
				.from(doctors)
				.innerJoin(users, eq(doctors.userId, users.id))
				.where(
					or(
						eq(doctors.status, 'email_unconfirmed'),
						eq(doctors.status, 'pending'),
						eq(doctors.status, 'documentation_required'),
						eq(doctors.status, 'interview_scheduled')
					)
				)

			const total = totalResult[0]?.count || 0
			console.log('📈 Total pending applications:', total)

			// Get applications - show complete pipeline
			console.log('📄 Querying applications with pagination:', { offset, limit })
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
						eq(doctors.status, 'email_unconfirmed'),
						eq(doctors.status, 'pending'),
						eq(doctors.status, 'documentation_required'),
						eq(doctors.status, 'interview_scheduled')
					)
				)
				.orderBy(desc(doctors.createdAt))
				.limit(limit)
				.offset(offset)

			console.log('📋 Applications found:', applicationsResult.length)
			console.log('📝 Applications details:', applicationsResult.map(app => ({
				id: app.id,
				name: `${app.firstName} ${app.lastName}`,
				email: app.email,
				status: app.status,
				createdAt: app.createdAt
			})))

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
			console.error('❌ Error getting pending applications:', error)
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

	/**
	 * Schedule interview for doctor application
	 */
	async scheduleInterview(
		doctorId: string,
		adminId: string,
		reason?: string
	): Promise<void> {
		const db_connection = db

		try {
			await db_connection.transaction(async (tx) => {
				// Update doctor status to interview_scheduled
				await tx
					.update(doctors)
					.set({
						status: 'interview_scheduled',
						updatedAt: new Date(),
					})
					.where(eq(doctors.id, doctorId))

				// Log admin action
				await tx.insert(adminActions).values({
					adminId,
					action: 'schedule_interview',
					targetType: 'doctor',
					targetId: doctorId,
					reason: reason || 'Interview scheduled',
					createdAt: new Date(),
				})
			})
		} catch (error) {
			console.error('Error scheduling interview:', error)
			throw new Error('Failed to schedule interview')
		}
	}

	// Legacy admin_settings methods - can be removed after migration
	async getAdminSetting(adminId: string, settingKey: string): Promise<string | null> {
		try {
			const result = await db
				.select({ settingValue: adminSettings.settingValue })
				.from(adminSettings)
				.where(and(
					eq(adminSettings.adminId, adminId),
					eq(adminSettings.settingKey, settingKey)
				))
				.limit(1)

			return result[0]?.settingValue || null
		} catch (error) {
			console.error(`Error getting admin setting ${settingKey}:`, error)
			throw new Error('Failed to get admin setting')
		}
	}

	async setAdminSetting(adminId: string, settingKey: string, settingValue: string): Promise<void> {
		try {
			await db
				.insert(adminSettings)
				.values({
					adminId,
					settingKey,
					settingValue,
				})
				.onConflictDoUpdate({
					target: [adminSettings.adminId, adminSettings.settingKey],
					set: {
						settingValue,
						updatedAt: new Date(),
					},
				})
		} catch (error) {
			console.error(`Error setting admin setting ${settingKey}:`, error)
			throw new Error('Failed to set admin setting')
		}
	}

	async getCalendlyLink(adminId: string): Promise<string | null> {
		return this.getAdminSetting(adminId, 'calendly_link')
	}

	async setCalendlyLink(adminId: string, calendlyLink: string): Promise<void> {
		return this.setAdminSetting(adminId, 'calendly_link', calendlyLink)
	}

	async getAdminSettings(adminId: string): Promise<Record<string, string>> {
		try {
			const result = await db
				.select({
					settingKey: adminSettings.settingKey,
					settingValue: adminSettings.settingValue,
				})
				.from(adminSettings)
				.where(eq(adminSettings.adminId, adminId))

			const settings: Record<string, string> = {}
			result.forEach(setting => {
				if (setting.settingValue) {
					settings[setting.settingKey] = setting.settingValue
				}
			})

			return settings
		} catch (error) {
			console.error('Error getting admin settings:', error)
			throw new Error('Failed to get admin settings')
		}
	}
} 