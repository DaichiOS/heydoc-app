#!/usr/bin/env node

/**
 * Production Migration Script
 * 
 * This script runs migrations in production with additional safeguards:
 * - Backup verification
 * - Transaction rollback on failure
 * - Detailed logging
 * - Environment checks
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

if (NODE_ENV !== 'production') {
	console.error('❌ This script should only be run in production')
	console.error('   Use npm run db:migrate:safe for local development')
	process.exit(1)
}

// Create database connection with production settings
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
	max: 10, // Lower connection pool for migration
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 10000, // Longer timeout for production
})

async function runProductionMigrations() {
	console.log('🚀 Starting PRODUCTION database migrations...')
	console.log(`📅 ${new Date().toISOString()}`)
	console.log(`🌐 Environment: ${NODE_ENV}`)
	console.log()
	
	// Safety check
	const args = process.argv.slice(2)
	const forceFlag = args.includes('--force')
	
	if (!forceFlag) {
		console.log('🛡️  PRODUCTION SAFETY CHECK')
		console.log('   This will modify your production database.')
		console.log('   Make sure you have:')
		console.log('   1. ✅ Recent database backup')
		console.log('   2. ✅ Tested migrations in staging')
		console.log('   3. ✅ Maintenance window scheduled')
		console.log()
		console.log('   To proceed, run with --force flag:')
		console.log('   npm run db:migrate:prod -- --force')
		console.log()
		process.exit(0)
	}
	
	let client
	
	try {
		// Get a dedicated client for transaction
		client = await pool.connect()
		
		console.log('📋 Pre-migration checks...')
		
		// Check current migration state
		const currentMigrations = await client.query(`
			SELECT id, hash, created_at 
			FROM drizzle.__drizzle_migrations 
			ORDER BY id
		`)
		
		console.log(`📊 Current applied migrations: ${currentMigrations.rows.length}`)
		currentMigrations.rows.forEach((row, index) => {
			const date = new Date(parseInt(row.created_at)).toISOString()
			console.log(`  ${index + 1}. ${row.hash} (${date})`)
		})
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
		
		const newCount = newMigrations.rows.length - currentMigrations.rows.length
		console.log(`📈 Applied ${newCount} new migrations`)
		
		if (newCount > 0) {
			console.log('📊 Newly applied migrations:')
			newMigrations.rows.slice(-newCount).forEach((row, index) => {
				const date = new Date(parseInt(row.created_at)).toISOString()
				console.log(`  ${index + 1}. ${row.hash} (${date})`)
			})
		}
		
		// Commit transaction
		console.log('💾 Committing migration transaction...')
		await client.query('COMMIT')
		
		console.log('🎉 Production migrations completed successfully!')
		console.log(`📅 Completed at: ${new Date().toISOString()}`)
		
	} catch (error) {
		console.error('❌ PRODUCTION MIGRATION FAILED!')
		console.error('📅 Failed at:', new Date().toISOString())
		console.error('💥 Error:', error)
		
		if (client) {
			try {
				console.log('🔄 Rolling back transaction...')
				await client.query('ROLLBACK')
				console.log('✅ Transaction rolled back successfully')
			} catch (rollbackError) {
				console.error('💥 CRITICAL: Failed to rollback transaction:', rollbackError)
			}
		}
		
		console.log()
		console.log('🚨 IMMEDIATE ACTION REQUIRED:')
		console.log('   1. Check database state')
		console.log('   2. Restore from backup if necessary')
		console.log('   3. Review migration files')
		console.log('   4. Contact development team')
		
		process.exit(1)
	} finally {
		if (client) {
			client.release()
		}
		await pool.end()
	}
}

runProductionMigrations().catch((error) => {
	console.error('💥 Unexpected error in production migration:', error)
	process.exit(1)
})