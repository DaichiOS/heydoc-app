import { db } from '@/lib/db'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function POST(request: NextRequest) {
	try {
		// Simple security check - only allow in production with correct header
		const authHeader = request.headers.get('x-migration-key')
		if (authHeader !== process.env.MIGRATION_SECRET) {
			return NextResponse.json(
				{ error: 'Unauthorized - Invalid migration key' },
				{ status: 401 }
			)
		}

		console.log('Starting database migration...')
		console.log('Environment:', process.env.NODE_ENV)
		console.log('Database URL exists:', !!process.env.DATABASE_URL)
		
		// Get the absolute path to migrations
		const migrationsPath = path.join(process.cwd(), 'src/lib/db/migrations')
		console.log('Migrations path:', migrationsPath)
		
		await migrate(db, { 
			migrationsFolder: migrationsPath
		})

		console.log('Migration completed successfully')
		
		return NextResponse.json({ 
			success: true, 
			message: 'Database migration completed successfully',
			timestamp: new Date().toISOString()
		})
	} catch (error) {
		console.error('Migration failed:', error)
		return NextResponse.json(
			{ 
				error: 'Migration failed', 
				details: error instanceof Error ? error.message : 'Unknown error',
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		)
	}
} 