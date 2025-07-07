import { count, eq } from 'drizzle-orm'
import { db } from '../db'
import { admins, users, type Admin, type NewAdmin } from '../db/schema'
import { BaseRepository } from './base-repository'

export interface AdminWithUser extends Admin {
	user: {
		id: string
		email: string
		role: string
		status: string
	}
}

export class AdminRepository extends BaseRepository {
	/**
	 * Create a new admin record
	 */
	async create(adminData: NewAdmin): Promise<Admin> {
		try {
			const [admin] = await db.insert(admins).values(adminData).returning()
			return admin
		} catch (error) {
			console.error('Error creating admin:', error)
			throw new Error('Failed to create admin')
		}
	}

	/**
	 * Get admin by ID
	 */
	async findById(id: string): Promise<Admin | null> {
		try {
			const [admin] = await db
				.select()
				.from(admins)
				.where(eq(admins.id, id))
				.limit(1)

			return admin || null
		} catch (error) {
			console.error('Error finding admin by ID:', error)
			throw new Error('Failed to find admin')
		}
	}

	/**
	 * Get admin by user ID
	 */
	async findByUserId(userId: string): Promise<Admin | null> {
		try {
			const [admin] = await db
				.select()
				.from(admins)
				.where(eq(admins.userId, userId))
				.limit(1)

			return admin || null
		} catch (error) {
			console.error('Error finding admin by user ID:', error)
			throw new Error('Failed to find admin by user ID')
		}
	}

	/**
	 * Get admin with user information by user ID
	 */
	async findWithUserByUserId(userId: string): Promise<AdminWithUser | null> {
		try {
			const result = await db
				.select({
					// Admin fields
					id: admins.id,
					userId: admins.userId,
					firstName: admins.firstName,
					lastName: admins.lastName,
					phone: admins.phone,
					calendlyLink: admins.calendlyLink,
					department: admins.department,
					title: admins.title,
					status: admins.status,
					createdAt: admins.createdAt,
					updatedAt: admins.updatedAt,
					// User fields
					userEmail: users.email,
					userRole: users.role,
					userStatus: users.status,
				})
				.from(admins)
				.innerJoin(users, eq(admins.userId, users.id))
				.where(eq(admins.userId, userId))
				.limit(1)

			if (!result.length) return null

			const adminData = result[0]
			return {
				id: adminData.id,
				userId: adminData.userId,
				firstName: adminData.firstName,
				lastName: adminData.lastName,
				phone: adminData.phone,
				calendlyLink: adminData.calendlyLink,
				department: adminData.department,
				title: adminData.title,
				status: adminData.status,
				createdAt: adminData.createdAt,
				updatedAt: adminData.updatedAt,
				user: {
					id: adminData.userId,
					email: adminData.userEmail,
					role: adminData.userRole,
					status: adminData.userStatus,
				},
			}
		} catch (error) {
			console.error('Error finding admin with user by user ID:', error)
			throw new Error('Failed to find admin with user information')
		}
	}

	/**
	 * Update admin by user ID
	 */
	async updateByUserId(
		userId: string,
		updates: Partial<Omit<Admin, 'id' | 'userId' | 'createdAt'>>
	): Promise<Admin | null> {
		try {
			const [admin] = await db
				.update(admins)
				.set({ ...updates, updatedAt: new Date() })
				.where(eq(admins.userId, userId))
				.returning()

			return admin || null
		} catch (error) {
			console.error('Error updating admin:', error)
			throw new Error('Failed to update admin')
		}
	}

	/**
	 * Get all admins
	 */
	async findAll(): Promise<Admin[]> {
		try {
			return await db.select().from(admins)
		} catch (error) {
			console.error('Error finding all admins:', error)
			throw new Error('Failed to find admins')
		}
	}

	/**
	 * Check if admin exists by user ID
	 */
	async existsByUserId(userId: string): Promise<boolean> {
		try {
			const result = await db
				.select({ count: count() })
				.from(admins)
				.where(eq(admins.userId, userId))

			return (result[0]?.count || 0) > 0
		} catch (error) {
			console.error('Error checking admin existence:', error)
			throw new Error('Failed to check admin existence')
		}
	}

	/**
	 * Delete admin by user ID
	 */
	async deleteByUserId(userId: string): Promise<boolean> {
		try {
			const result = await db
				.delete(admins)
				.where(eq(admins.userId, userId))

			return (result.rowCount ?? 0) > 0
		} catch (error) {
			console.error('Error deleting admin:', error)
			throw new Error('Failed to delete admin')
		}
	}
} 