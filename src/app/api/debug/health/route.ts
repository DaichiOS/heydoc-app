import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		// Check environment variables (without exposing sensitive values)
		const envCheck = {
			NODE_ENV: process.env.NODE_ENV,
			hasAWSAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
			awsAccessKeyLength: process.env.AWS_ACCESS_KEY_ID?.length || 0,
			hasAWSSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
			awsSecretKeyLength: process.env.AWS_SECRET_ACCESS_KEY?.length || 0,
			hasCognitoUserPool: !!process.env.COGNITO_USER_POOL_ID,
			cognitoUserPoolLength: process.env.COGNITO_USER_POOL_ID?.length || 0,
			hasCognitoClientId: !!process.env.COGNITO_CLIENT_ID,
			cognitoClientIdLength: process.env.COGNITO_CLIENT_ID?.length || 0,
			hasCognitoClientSecret: !!process.env.COGNITO_CLIENT_SECRET,
			cognitoClientSecretLength: process.env.COGNITO_CLIENT_SECRET?.length || 0,
			hasDatabaseUrl: !!process.env.DATABASE_URL,
			databaseUrlLength: process.env.DATABASE_URL?.length || 0,
			awsRegion: process.env.AWS_REGION,
		}

		// Test database connection
		let dbStatus = 'unknown'
		let dbError = null
		try {
			const result = await db.select().from(users).limit(1)
			dbStatus = 'connected'
		} catch (error: any) {
			dbStatus = 'failed'
			dbError = {
				message: error.message,
				code: error.code,
				name: error.name
			}
		}

		// Test Cognito (basic check)
		let cognitoStatus = 'unknown'
		try {
			// Just check if we can instantiate the service
			const { CognitoService } = await import('@/lib/aws/cognito')
			const cognitoService = new CognitoService()
			cognitoStatus = 'service_created'
		} catch (error: any) {
			cognitoStatus = 'failed'
		}

		return NextResponse.json({
			status: 'ok',
			timestamp: new Date().toISOString(),
			environment: envCheck,
			services: {
				database: {
					status: dbStatus,
					error: dbError
				},
				cognito: {
					status: cognitoStatus
				}
			}
		})

	} catch (error: any) {
		return NextResponse.json({
			status: 'error',
			timestamp: new Date().toISOString(),
			error: {
				message: error.message,
				name: error.name
			}
		}, { status: 500 })
	}
} 