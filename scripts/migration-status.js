#!/usr/bin/env node

/**
 * Migration Status Checker
 * 
 * This script checks the current migration status and compares
 * what Drizzle thinks is applied vs what's actually in the database.
 */

import { config } from 'dotenv'
import { readdir } from 'fs/promises'
import { dirname, join } from 'path'
import { Pool } from 'pg'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config()

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL is not set')
	process.exit(1)
}

// Create database connection with same config as drizzle.config.ts
const pool = new Pool({
	host: 'localhost',
	port: 5432,
	user: 'postgres',
	database: 'heydoc_local',
	ssl: false,
})

async function checkMigrationStatus() {
	console.log('🔍 Checking migration status...\n')
	
	try {
		// 1. Get migrations from filesystem
		const migrationsPath = join(__dirname, '..', 'src', 'lib', 'db', 'migrations')
		const migrationFiles = (await readdir(migrationsPath))
			.filter(file => file.endsWith('.sql'))
			.sort()
		
		console.log('📁 Migration files found:')
		migrationFiles.forEach((file, index) => {
			console.log(`  ${index + 1}. ${file}`)
		})
		console.log()
		
		// 2. Get applied migrations from database
		let appliedMigrations = []
		try {
			const result = await pool.query(`
				SELECT id, hash, created_at 
				FROM drizzle.__drizzle_migrations 
				ORDER BY id
			`)
			appliedMigrations = result.rows
		} catch (error) {
			if (error.message.includes('relation "drizzle.__drizzle_migrations" does not exist')) {
				console.log('⚠️  Migration tracking table does not exist yet')
			} else {
				throw error
			}
		}
		
		console.log('📊 Applied migrations in database:')
		if (appliedMigrations.length === 0) {
			console.log('  (none)')
		} else {
			appliedMigrations.forEach((row, index) => {
				const date = new Date(parseInt(row.created_at)).toISOString()
				console.log(`  ${index + 1}. ${row.hash} (${date})`)
			})
		}
		console.log()
		
		// 3. Compare and find differences
		const fileHashes = migrationFiles.map(file => file.replace('.sql', ''))
		const appliedHashes = appliedMigrations.map(row => row.hash)
		
		const pendingMigrations = fileHashes.filter(hash => !appliedHashes.includes(hash))
		const orphanedMigrations = appliedHashes.filter(hash => !fileHashes.includes(hash))
		
		console.log('📋 Status Summary:')
		console.log(`  Total migration files: ${migrationFiles.length}`)
		console.log(`  Applied migrations: ${appliedMigrations.length}`)
		console.log(`  Pending migrations: ${pendingMigrations.length}`)
		console.log(`  Orphaned migrations: ${orphanedMigrations.length}`)
		console.log()
		
		if (pendingMigrations.length > 0) {
			console.log('⏳ Pending migrations (need to be applied):')
			pendingMigrations.forEach((hash, index) => {
				console.log(`  ${index + 1}. ${hash}`)
			})
			console.log()
		}
		
		if (orphanedMigrations.length > 0) {
			console.log('🚨 Orphaned migrations (in database but no file):')
			orphanedMigrations.forEach((hash, index) => {
				console.log(`  ${index + 1}. ${hash}`)
			})
			console.log()
		}
		
		// 4. Show next steps
		if (pendingMigrations.length > 0) {
			console.log('💡 Next steps:')
			console.log('  Run: npm run db:migrate:safe')
			console.log('  Or:  node scripts/migrate.js')
		} else if (orphanedMigrations.length > 0) {
			console.log('⚠️  Warning: You have orphaned migrations. This might indicate:')
			console.log('  - Migration files were deleted after being applied')
			console.log('  - Database was restored from a different state')
			console.log('  - Manual intervention may be needed')
		} else {
			console.log('✅ All migrations are in sync!')
		}
		
	} catch (error) {
		console.error('❌ Failed to check migration status:', error)
		process.exit(1)
	} finally {
		await pool.end()
	}
}

checkMigrationStatus().catch((error) => {
	console.error('💥 Unexpected error:', error)
	process.exit(1)
}) 