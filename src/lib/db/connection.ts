import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({
	connectionString: process.env.DATABASE_URL!,
	ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
})

// Handle pool errors
pool.on('error', (err) => {
	console.error('Unexpected error on idle client', err)
})

export const db = drizzle(pool, { schema })

// Test database connection
export async function testConnection(): Promise<boolean> {
	try {
		const result = await pool.query('SELECT NOW()')
		console.log('Database connected successfully:', result.rows[0])
		return true
	} catch (error) {
		console.error('Database connection failed:', error)
		return false
	}
}

// Close all connections
export async function closeConnection(): Promise<void> {
	await pool.end()
} 