/**
 * Configuration for HeyDoc application
 * Handles all environment variables and AWS settings
 */

export const config = {
	// AWS Configuration
	aws: {
		region: process.env.AWS_REGION || 'ap-southeast-2',
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
	},

	// Cognito Configuration
	cognito: {
		userPoolId: process.env.COGNITO_USER_POOL_ID || '',
		clientId: process.env.COGNITO_CLIENT_ID || '',
		clientSecret: process.env.COGNITO_CLIENT_SECRET || '',
		region: process.env.AWS_REGION || 'ap-southeast-2',
	},

	// Database Configuration
	database: {
		url: process.env.DATABASE_URL || '',
		host: process.env.DB_HOST || '',
		port: parseInt(process.env.DB_PORT || '5432'),
		database: process.env.DB_NAME || 'heydoc',
		username: process.env.DB_USERNAME || 'heydoc_admin',
		password: process.env.DB_PASSWORD || '',
		ssl: process.env.NODE_ENV === 'production',
	},

	// S3 Configuration
	s3: {
		bucketName: process.env.S3_BUCKET_NAME || 'heydoc-bucket',
		region: process.env.S3_REGION || 'ap-southeast-2',
		folders: {
			doctors: 'doctor-documents/',
			patients: 'patient-documents/',
			admin: 'admin-uploads/',
			temp: 'temp-uploads/',
		},
	},

	// Application Configuration
	app: {
		url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
		environment: process.env.NODE_ENV || 'development',
		jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key',
	},

	// Email Configuration (for future use)
	email: {
		from: process.env.FROM_EMAIL || 'noreply@heydochealth.com.au',
		replyTo: process.env.REPLY_TO_EMAIL || 'support@heydochealth.com.au',
	},
}

// Validation function to ensure required environment variables are set
export function validateConfig() {
	const requiredEnvVars = [
		'AWS_ACCESS_KEY_ID',
		'AWS_SECRET_ACCESS_KEY',
		'COGNITO_USER_POOL_ID',
		'COGNITO_CLIENT_ID',
		'COGNITO_CLIENT_SECRET',
		'DATABASE_URL',
		'S3_BUCKET_NAME',
	]

	const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
	
	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
	}
}

// Helper function to check if we're in development
export const isDevelopment = config.app.environment === 'development'
export const isProduction = config.app.environment === 'production'

export default config 