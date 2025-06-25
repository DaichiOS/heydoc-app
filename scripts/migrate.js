#!/usr/bin/env node

/**
 * Reliable Database Migration Script
 * 
 * This script uses Drizzle's programmatic API to run migrations
 * with proper error handling and verification.
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

const dbConfig = {
	host: process.env.DB_HOST || 'localhost',
	port: parseInt(process.env.DB_PORT || '5432'),
	user: process.env.DB_USER || 'postgres',
	database: process.env.DB_NAME || 'heydoc_local',
	password: process.env.DB_PASSWORD,
	ssl: false,
}

const pool = new Pool(dbConfig)

const db = drizzle(pool)

async function runMigrations() {
	console.log('🚀 Starting database migrations...')
	
	try {
		console.log('📋 Checking current migration state...')
		
		const migrationsPath = join(__dirname, '..', 'src', 'lib', 'db', 'migrations')
		console.log(`📁 Migrations path: ${migrationsPath}`)
		
		console.log('⚡ Running migrations...')
		await migrate(db, { migrationsFolder: migrationsPath })
		
		console.log('✅ Verifying migrations...')
		const result = await pool.query(`
			SELECT id, hash, created_at 
			FROM drizzle.__drizzle_migrations 
			ORDER BY id
		`)
		
		console.log('📊 Applied migrations:')
		result.rows.forEach((row, index) => {
			const date = new Date(parseInt(row.created_at)).toISOString()
			console.log(`  ${index + 1}. ${row.hash} (${date})`)
		})
		
		console.log('🎉 Migrations completed successfully!')
		
	} catch (error) {
		console.error('❌ Migration failed:', error)
		
		// Try to get more details about the error
		if (error.message) {
			console.error('Error message:', error.message)
		}
		if (error.stack) {
			console.error('Stack trace:', error.stack)
		}
		
		process.exit(1)
	} finally {
		await pool.end()
	}
}

// Handle script arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')

if (isDryRun) {
	console.log('🔍 Dry run mode - checking what would be migrated...')
	// TODO: Implement dry run functionality
	console.log('⚠️  Dry run not implemented yet')
	process.exit(0)
}

// Run migrations
runMigrations().catch((error) => {
	console.error('💥 Unexpected error:', error)
	process.exit(1)
}) 