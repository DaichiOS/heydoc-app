import { Pool, PoolClient, QueryResult } from 'pg'
import { config } from '../config'

class DatabaseService {
	private pool: Pool
	private static instance: DatabaseService

	constructor() {
		this.pool = new Pool({
			connectionString: config.database.url,
			ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
			max: 20,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000,
		})

		// Handle pool errors
		this.pool.on('error', (err) => {
			console.error('Unexpected error on idle client', err)
		})
	}

	static getInstance(): DatabaseService {
		if (!DatabaseService.instance) {
			DatabaseService.instance = new DatabaseService()
		}
		return DatabaseService.instance
	}

	/**
	 * Execute a query with parameters
	 */
	async query<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
		const client = await this.pool.connect()
		try {
			const result = await client.query<T>(text, params)
			return result
		} catch (error) {
			console.error('Database query error:', error)
			throw error
		} finally {
			client.release()
		}
	}

	/**
	 * Execute a transaction
	 */
	async transaction<T>(
		callback: (client: PoolClient) => Promise<T>
	): Promise<T> {
		const client = await this.pool.connect()
		try {
			await client.query('BEGIN')
			const result = await callback(client)
			await client.query('COMMIT')
			return result
		} catch (error) {
			await client.query('ROLLBACK')
			console.error('Transaction error:', error)
			throw error
		} finally {
			client.release()
		}
	}

	/**
	 * Test database connection
	 */
	async testConnection(): Promise<boolean> {
		try {
			const result = await this.query('SELECT NOW()')
			console.log('Database connected successfully:', result.rows[0])
			return true
		} catch (error) {
			console.error('Database connection failed:', error)
			return false
		}
	}

	/**
	 * Close all connections
	 */
	async close(): Promise<void> {
		await this.pool.end()
	}
}

// Export singleton instance
export const db = DatabaseService.getInstance()

// Export types for use in other files
export type { QueryResult } from 'pg'
