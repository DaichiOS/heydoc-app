import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Load environment variables
config({ path: '.env.local' })

export default defineConfig({
	schema: './src/lib/db/schema.ts',
	out: './src/lib/db/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		host: 'localhost',
		port: 5432,
		user: 'postgres',
		database: 'heydoc_local',
		ssl: false,
	},
	verbose: true,
	strict: true,
}) 