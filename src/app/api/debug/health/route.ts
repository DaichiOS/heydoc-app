import { testConnection } from '@/lib/db/connection'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		console.log('Health check started')
		
		// Test environment variables
		const hasDbUrl = !!process.env.DATABASE_URL
		const dbUrlPreview = process.env.DATABASE_URL 
			? `${process.env.DATABASE_URL.substring(0, 20)}...${process.env.DATABASE_URL.slice(-20)}`
			: 'Not set'
		
		console.log('DATABASE_URL exists:', hasDbUrl)
		console.log('DATABASE_URL preview:', dbUrlPreview)
		console.log('NODE_ENV:', process.env.NODE_ENV)
		
		// Test database connection
		console.log('Testing database connection...')
		const dbConnected = await testConnection()
		
		const healthData = {
			status: 'ok',
			timestamp: new Date().toISOString(),
			environment: process.env.NODE_ENV,
			database: {
				hasUrl: hasDbUrl,
				urlPreview: dbUrlPreview,
				connected: dbConnected
			}
		}
		
		console.log('Health check completed:', healthData)
		
		return NextResponse.json(healthData)
	} catch (error) {
		console.error('Health check failed:', error)
		return NextResponse.json(
			{ 
				status: 'error', 
				error: error instanceof Error ? error.message : 'Unknown error',
				timestamp: new Date().toISOString()
			}, 
			{ status: 500 }
		)
	}
} 