#!/usr/bin/env node

/**
 * Automated Production Migration Script
 * 
 * This script runs migrations in production automatically during deployment.
 * It's designed for CI/CD environments like Vercel where user interaction isn't possible.
 */

import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { dirname, join } from 'path'
import { Pool } from 'pg'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config()

const NODE_ENV = process.env.NODE_ENV
const DATABASE_URL = process.env.DATABASE_URL

// Validation
if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL is not set')
	process.exit(1)
}

if (NODE_ENV !== 'production') {
	console.log('⏭️  Skipping production migrations (not in production environment)')
	process.exit(0)
}

// Create database connection for AWS RDS
const pool = new Pool({
	connectionString: DATABASE_URL,
	ssl: {
		rejectUnauthorized: false // Required for AWS RDS
	},
	max: 5, // Lower pool for migration
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 15000, // Longer timeout for RDS
})

async function runAutomatedMigrations() {
	console.log('🚀 Starting automated production migrations...')
	console.log(`📅 ${new Date().toISOString()}`)
	console.log(`🌐 Environment: ${NODE_ENV}`)
	console.log(`🗄️  Database: AWS RDS`)
	console.log()
	
	let client
	
	try {
		// Test connection first
		console.log('🔌 Testing database connection...')
		client = await pool.connect()
		console.log('✅ Database connection established')
		
		// Check if migrations table exists
		try {
			await client.query('SELECT 1 FROM drizzle.__drizzle_migrations LIMIT 1')
		} catch (error) {
			if (error.message.includes('does not exist')) {
				console.log('📋 First-time setup: Migration tracking table will be created')
			}
		}
		
		// Get current migration state
		console.log('📋 Checking current migration state...')
		let currentMigrations = []
		try {
			const result = await client.query(`
				SELECT id, hash, created_at 
				FROM drizzle.__drizzle_migrations 
				ORDER BY id
			`)
			currentMigrations = result.rows
		} catch (error) {
			// Table doesn't exist yet - first migration
			console.log('📝 No existing migrations found (first deployment)')
		}
		
		console.log(`📊 Current applied migrations: ${currentMigrations.length}`)
		if (currentMigrations.length > 0) {
			currentMigrations.forEach((row, index) => {
				const date = new Date(parseInt(row.created_at)).toISOString()
				console.log(`  ${index + 1}. ${row.hash} (${date})`)
			})
		}
		console.log()
		
		// Start transaction for migration
		console.log('🔄 Starting migration transaction...')
		await client.query('BEGIN')
		
		const migrationsPath = join(__dirname, '..', 'src', 'lib', 'db', 'migrations')
		console.log(`📁 Migrations path: ${migrationsPath}`)
		
		// Create a drizzle instance with the transaction client
		const db = drizzle(client)
		
		// Run migrations
		console.log('⚡ Running migrations...')
		const startTime = Date.now()
		
		await migrate(db, { migrationsFolder: migrationsPath })
		
		const endTime = Date.now()
		console.log(`⏱️  Migration completed in ${endTime - startTime}ms`)
		
		// Verify migrations were applied
		console.log('✅ Verifying post-migration state...')
		const newMigrations = await client.query(`
			SELECT id, hash, created_at 
			FROM drizzle.__drizzle_migrations 
			ORDER BY id
		`)
		
		const newCount = newMigrations.rows.length - currentMigrations.length
		console.log(`📈 Applied ${newCount} new migrations`)
		
		if (newCount > 0) {
			console.log('📊 Newly applied migrations:')
			newMigrations.rows.slice(-newCount).forEach((row, index) => {
				const date = new Date(parseInt(row.created_at)).toISOString()
				console.log(`  ${index + 1}. ${row.hash} (${date})`)
			})
		} else {
			console.log('📋 No new migrations to apply')
		}
		
		// Commit transaction
		console.log('💾 Committing migration transaction...')
		await client.query('COMMIT')
		
		console.log('🎉 Production migrations completed successfully!')
		console.log(`📅 Completed at: ${new Date().toISOString()}`)
		console.log('🚀 Deployment can continue...')
		
	} catch (error) {
		console.error('❌ PRODUCTION MIGRATION FAILED!')
		console.error('📅 Failed at:', new Date().toISOString())
		console.error('💥 Error:', error.message)
		
		if (client) {
			try {
				console.log('🔄 Rolling back transaction...')
				await client.query('ROLLBACK')
				console.log('✅ Transaction rolled back successfully')
			} catch (rollbackError) {
				console.error('💥 CRITICAL: Failed to rollback transaction:', rollbackError.message)
			}
		}
		
		console.log()
		console.log('🚨 DEPLOYMENT WILL FAIL - Migration error must be resolved')
		console.log('📋 Troubleshooting steps:')
		console.log('   1. Check Vercel function logs for full error details')
		console.log('   2. Verify DATABASE_URL is correct in Vercel environment')
		console.log('   3. Ensure AWS RDS security groups allow Vercel IPs')
		console.log('   4. Check migration file syntax')
		console.log('   5. Verify database permissions')
		
		process.exit(1)
	} finally {
		if (client) {
			client.release()
		}
		await pool.end()
	}
}

// Only run if called directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
	runAutomatedMigrations().catch((error) => {
		console.error('💥 Unexpected error in automated migration:', error)
		process.exit(1)
	})
} 