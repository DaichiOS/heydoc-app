import { db } from '@/lib/db/connection'
import { count, SQL } from 'drizzle-orm'

export interface PaginationOptions {
	page?: number
	limit?: number
}

export interface PaginationResult<T> {
	data: T[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasNext: boolean
		hasPrev: boolean
	}
}

/**
 * Base repository class providing common database operations
 * This is a concrete implementation that child repositories can extend
 */
export class BaseRepository {
	protected db = db

	/**
	 * Count records with optional condition
	 */
	async countRecords(table: any, condition?: SQL): Promise<number> {
		try {
			const query = this.db.select({ count: count() }).from(table)
			
			if (condition) {
				query.where(condition)
			}

			const result = await query
			return result[0]?.count || 0
		} catch (error) {
			console.error('Error counting records:', error)
			throw new Error('Failed to count records')
		}
	}

	/**
	 * Create pagination result helper
	 */
	protected createPaginationResult<T>(
		data: T[],
		page: number,
		limit: number,
		total: number
	): PaginationResult<T> {
		const totalPages = Math.ceil(total / limit)

		return {
			data,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		}
	}

	/**
	 * Calculate pagination offset
	 */
	protected getPaginationOffset(page: number, limit: number): number {
		return (page - 1) * limit
	}
} 