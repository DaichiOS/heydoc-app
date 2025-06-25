import { Doctor, doctors, DoctorStatus, NewDoctor, User, users } from '@/lib/db/schema'
import { and, asc, desc, eq, SQL } from 'drizzle-orm'
import { BaseRepository, PaginationOptions, PaginationResult } from './base-repository'

export interface DoctorWithUser extends Doctor {
	user: User
}

export interface DoctorFilters {
	status?: DoctorStatus | DoctorStatus[]
	specialty?: string
	state?: string
	approvedBy?: string
}

export interface DoctorListOptions extends PaginationOptions {
	filters?: DoctorFilters
	sortBy?: 'createdAt' | 'approvedAt' | 'firstName' | 'lastName' | 'status'
	sortOrder?: 'asc' | 'desc'
}

export class DoctorRepository extends BaseRepository {
	/**
	 * Find a doctor by ID
	 */
	async findById(id: string): Promise<Doctor | null> {
		try {
			const result = await this.db
				.select()
				.from(doctors)
				.where(eq(doctors.id, id))
				.limit(1)

			return result[0] || null
		} catch (error) {
			console.error(`Error finding doctor by ID ${id}:`, error)
			throw new Error('Failed to find doctor')
		}
	}

	/**
	 * Find a doctor by ID with user information
	 */
	async findByIdWithUser(id: string): Promise<DoctorWithUser | null> {
		try {
			const result = await this.db
				.select()
				.from(doctors)
				.innerJoin(users, eq(doctors.userId, users.id))
				.where(eq(doctors.id, id))
				.limit(1)

			if (!result[0]) return null

			return {
				...result[0].doctors,
				user: result[0].users,
			} as DoctorWithUser
		} catch (error) {
			console.error(`Error finding doctor with user by ID ${id}:`, error)
			throw new Error('Failed to find doctor')
		}
	}

	/**
	 * Find a doctor by user ID
	 */
	async findByUserId(userId: string): Promise<Doctor | null> {
		try {
			const result = await this.db
				.select()
				.from(doctors)
				.where(eq(doctors.userId, userId))
				.limit(1)

			return result[0] || null
		} catch (error) {
			console.error(`Error finding doctor by user ID ${userId}:`, error)
			throw new Error('Failed to find doctor')
		}
	}

	/**
	 * Find a doctor by AHPRA number
	 */
	async findByAhpraNumber(ahpraNumber: string): Promise<Doctor | null> {
		try {
			const result = await this.db
				.select()
				.from(doctors)
				.where(eq(doctors.ahpraNumber, ahpraNumber))
				.limit(1)

			return result[0] || null
		} catch (error) {
			console.error(`Error finding doctor by AHPRA number ${ahpraNumber}:`, error)
			throw new Error('Failed to find doctor')
		}
	}

	/**
	 * Find all doctors with filters and pagination
	 */
	async findAll(options: DoctorListOptions = {}): Promise<PaginationResult<DoctorWithUser>> {
		const { 
			page = 1, 
			limit = 10, 
			filters = {}, 
			sortBy = 'createdAt', 
			sortOrder = 'desc' 
		} = options
		const offset = this.getPaginationOffset(page, limit)

		try {
			// Build conditions
			const conditions: SQL[] = []
			
			if (filters.status) {
				if (Array.isArray(filters.status)) {
					// Multiple statuses
					conditions.push(inArray(doctors.status, filters.status))
				} else {
					// Single status
					conditions.push(eq(doctors.status, filters.status))
				}
			}

			if (filters.specialty) {
				conditions.push(eq(doctors.medicalSpecialty, filters.specialty))
			}

			if (filters.state) {
				conditions.push(eq(doctors.addressState, filters.state))
			}

			if (filters.approvedBy) {
				conditions.push(eq(doctors.approvedBy, filters.approvedBy))
			}

			const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

			// Get total count
			const total = await this.countRecords(doctors, whereCondition)

			// Build sort condition
			const sortColumn = this.getSortColumn(sortBy)
			const sortDirection = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)

			// Get paginated data with user information
			const query = this.db
				.select({
					...doctors,
					user: users,
				})
				.from(doctors)
				.innerJoin(users, eq(doctors.userId, users.id))
				.limit(limit)
				.offset(offset)
				.orderBy(sortDirection)

			if (whereCondition) {
				query.where(whereCondition)
			}

			const result = await query
			
			const data = result.map(row => ({
				...row,
				user: row.user,
			})) as DoctorWithUser[]

			return this.createPaginationResult(data, page, limit, total)
		} catch (error) {
			console.error('Error finding all doctors:', error)
			throw new Error('Failed to fetch doctors')
		}
	}

	/**
	 * Find doctors by status
	 */
	async findByStatus(
		status: DoctorStatus | DoctorStatus[], 
		options: PaginationOptions = {}
	): Promise<PaginationResult<DoctorWithUser>> {
		return this.findAll({ ...options, filters: { status } })
	}

	/**
	 * Find pending doctors (awaiting approval)
	 */
	async findPending(options: PaginationOptions = {}): Promise<PaginationResult<DoctorWithUser>> {
		return this.findByStatus(['pending', 'documentation_required'], options)
	}

	/**
	 * Find active doctors
	 */
	async findActive(options: PaginationOptions = {}): Promise<PaginationResult<DoctorWithUser>> {
		return this.findByStatus('active', options)
	}

	/**
	 * Create a new doctor
	 */
	async create(doctorData: NewDoctor): Promise<Doctor> {
		try {
			const result = await this.db
				.insert(doctors)
				.values(doctorData)
				.returning()

			return result[0]
		} catch (error) {
			console.error('Error creating doctor:', error)
			throw new Error('Failed to create doctor')
		}
	}

	/**
	 * Update a doctor by ID
	 */
	async update(id: string, doctorData: Partial<NewDoctor>): Promise<Doctor | null> {
		try {
			const updateData = {
				...doctorData,
				updatedAt: new Date(),
			}

			const result = await this.db
				.update(doctors)
				.set(updateData)
				.where(eq(doctors.id, id))
				.returning()

			return result[0] || null
		} catch (error) {
			console.error(`Error updating doctor ${id}:`, error)
			throw new Error('Failed to update doctor')
		}
	}

	/**
	 * Update doctor status
	 */
	async updateStatus(
		id: string, 
		status: DoctorStatus, 
		approvedBy?: string
	): Promise<Doctor | null> {
		try {
			const updateData: Partial<NewDoctor> = {
				status,
				updatedAt: new Date(),
			}

			// Set approval timestamp and approver for active status
			if (status === 'active' && approvedBy) {
				updateData.approvedAt = new Date()
				updateData.approvedBy = approvedBy
			}

			return this.update(id, updateData)
		} catch (error) {
			console.error(`Error updating doctor status ${id}:`, error)
			throw new Error('Failed to update doctor status')
		}
	}

	/**
	 * Delete a doctor by ID
	 */
	async delete(id: string): Promise<boolean> {
		try {
			const result = await this.db
				.delete(doctors)
				.where(eq(doctors.id, id))

			return (result.rowCount || 0) > 0
		} catch (error) {
			console.error(`Error deleting doctor ${id}:`, error)
			throw new Error('Failed to delete doctor')
		}
	}

	/**
	 * Check if doctor exists by AHPRA number
	 */
	async existsByAhpraNumber(ahpraNumber: string): Promise<boolean> {
		try {
			const count = await this.countRecords(
				doctors,
				eq(doctors.ahpraNumber, ahpraNumber)
			)
			return count > 0
		} catch (error) {
			console.error(`Error checking if doctor exists by AHPRA ${ahpraNumber}:`, error)
			throw new Error('Failed to check doctor existence')
		}
	}

	/**
	 * Get doctor count by status
	 */
	async countByStatus(status: DoctorStatus): Promise<number> {
		return this.countRecords(doctors, eq(doctors.status, status))
	}

	/**
	 * Get doctor count by specialty
	 */
	async countBySpecialty(specialty: string): Promise<number> {
		return this.countRecords(doctors, eq(doctors.medicalSpecialty, specialty))
	}

	/**
	 * Get total active doctors count
	 */
	async countActive(): Promise<number> {
		return this.countByStatus('active')
	}

	/**
	 * Get total pending doctors count
	 */
	async countPending(): Promise<number> {
		const pendingCount = await this.countByStatus('pending')
		const docsRequiredCount = await this.countByStatus('documentation_required')
		return pendingCount + docsRequiredCount
	}

	/**
	 * Get all unique specialties
	 */
	async getSpecialties(): Promise<string[]> {
		try {
			const result = await this.db
				.selectDistinct({ specialty: doctors.medicalSpecialty })
				.from(doctors)
				.where(eq(doctors.status, 'active'))

			return result
				.map(row => row.specialty)
				.filter(Boolean)
				.sort()
		} catch (error) {
			console.error('Error getting specialties:', error)
			throw new Error('Failed to get specialties')
		}
	}

	/**
	 * Get sort column based on sort field
	 */
	private getSortColumn(sortBy: string) {
		switch (sortBy) {
			case 'firstName':
				return doctors.firstName
			case 'lastName':
				return doctors.lastName
			case 'status':
				return doctors.status
			case 'approvedAt':
				return doctors.approvedAt
			case 'createdAt':
			default:
				return doctors.createdAt
		}
	}
} 