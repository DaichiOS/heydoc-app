import { NewUser, User, users } from '@/lib/db/schema'
import { and, eq, SQL } from 'drizzle-orm'
import { BaseRepository, PaginationOptions, PaginationResult } from './base-repository'

export class UserRepository extends BaseRepository {
	/**
	 * Find a user by ID
	 */
	async findById(id: string): Promise<User | null> {
		try {
			const result = await this.db
				.select()
				.from(users)
				.where(eq(users.id, id))
				.limit(1)

			return result[0] || null
		} catch (error) {
			console.error(`Error finding user by ID ${id}:`, error)
			throw new Error('Failed to find user')
		}
	}

	/**
	 * Find a user by email
	 */
	async findByEmail(email: string): Promise<User | null> {
		try {
			const result = await this.db
				.select()
				.from(users)
				.where(eq(users.email, email.toLowerCase()))
				.limit(1)

			return result[0] || null
		} catch (error) {
			console.error(`Error finding user by email ${email}:`, error)
			throw new Error('Failed to find user')
		}
	}

	/**
	 * Find a user by Cognito User ID
	 */
	async findByCognitoId(cognitoUserId: string): Promise<User | null> {
		try {
			const result = await this.db
				.select()
				.from(users)
				.where(eq(users.cognitoUserId, cognitoUserId))
				.limit(1)

			return result[0] || null
		} catch (error) {
			console.error(`Error finding user by Cognito ID ${cognitoUserId}:`, error)
			throw new Error('Failed to find user')
		}
	}

	/**
	 * Find all users with optional pagination and filters
	 */
	async findAll(options: PaginationOptions & {
		role?: string
		status?: string
	} = {}): Promise<PaginationResult<User>> {
		const { page = 1, limit = 10, role, status } = options
		const offset = this.getPaginationOffset(page, limit)

		try {
			// Build conditions
			const conditions: SQL[] = []
			if (role) {
				conditions.push(eq(users.role, role))
			}
			if (status) {
				conditions.push(eq(users.status, status))
			}

			const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

			// Get total count
			const total = await this.countRecords(users, whereCondition)

			// Get paginated data
			const query = this.db
				.select()
				.from(users)
				.limit(limit)
				.offset(offset)

			if (whereCondition) {
				query.where(whereCondition)
			}

			const data = await query

			return this.createPaginationResult(data, page, limit, total)
		} catch (error) {
			console.error('Error finding all users:', error)
			throw new Error('Failed to fetch users')
		}
	}

	/**
	 * Find users by role
	 */
	async findByRole(role: string, options: PaginationOptions = {}): Promise<PaginationResult<User>> {
		return this.findAll({ ...options, role })
	}

	/**
	 * Find users by status
	 */
	async findByStatus(status: string, options: PaginationOptions = {}): Promise<PaginationResult<User>> {
		return this.findAll({ ...options, status })
	}

	/**
	 * Create a new user
	 */
	async create(userData: NewUser): Promise<User> {
		try {
			// Ensure email is lowercase
			const data = {
				...userData,
				email: userData.email.toLowerCase(),
			}

			const result = await this.db
				.insert(users)
				.values(data)
				.returning()

			return result[0]
		} catch (error) {
			console.error('Error creating user:', error)
			throw new Error('Failed to create user')
		}
	}

	/**
	 * Update a user by ID
	 */
	async update(id: string, userData: Partial<NewUser>): Promise<User | null> {
		try {
			const updateData = {
				...userData,
				updatedAt: new Date(),
			}

			// Ensure email is lowercase if provided
			if (userData.email) {
				updateData.email = userData.email.toLowerCase()
			}

			const result = await this.db
				.update(users)
				.set(updateData)
				.where(eq(users.id, id))
				.returning()

			return result[0] || null
		} catch (error) {
			console.error(`Error updating user ${id}:`, error)
			throw new Error('Failed to update user')
		}
	}

	/**
	 * Update user status
	 */
	async updateStatus(id: string, status: string): Promise<User | null> {
		return this.update(id, { status })
	}

	/**
	 * Delete a user by ID
	 */
	async delete(id: string): Promise<boolean> {
		try {
			const result = await this.db
				.delete(users)
				.where(eq(users.id, id))

			return (result.rowCount || 0) > 0
		} catch (error) {
			console.error(`Error deleting user ${id}:`, error)
			throw new Error('Failed to delete user')
		}
	}

	/**
	 * Check if user exists by email
	 */
	async existsByEmail(email: string): Promise<boolean> {
		try {
			const count = await this.countRecords(
				users,
				eq(users.email, email.toLowerCase())
			)
			return count > 0
		} catch (error) {
			console.error(`Error checking if user exists by email ${email}:`, error)
			throw new Error('Failed to check user existence')
		}
	}

	/**
	 * Check if user exists by Cognito ID
	 */
	async existsByCognitoId(cognitoUserId: string): Promise<boolean> {
		try {
			const count = await this.countRecords(
				users,
				eq(users.cognitoUserId, cognitoUserId)
			)
			return count > 0
		} catch (error) {
			console.error(`Error checking if user exists by Cognito ID ${cognitoUserId}:`, error)
			throw new Error('Failed to check user existence')
		}
	}

	/**
	 * Get user count by role
	 */
	async countByRole(role: string): Promise<number> {
		return this.countRecords(users, eq(users.role, role))
	}

	/**
	 * Get user count by status
	 */
	async countByStatus(status: string): Promise<number> {
		return this.countRecords(users, eq(users.status, status))
	}
} 