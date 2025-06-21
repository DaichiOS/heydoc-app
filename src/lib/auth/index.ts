import { eq } from 'drizzle-orm'
import type {
	AuthUser,
	CognitoAuthResult,
	CognitoSignUpData,
	User,
	UserRole
} from '../../types'
import { cognitoService } from '../aws/cognito'
import { db, users } from '../db'

export class AuthService {
	/**
	 * Sign in user with email and password
	 */
	async signIn(email: string, password: string): Promise<AuthUser | null> {
		try {
			// Authenticate with Cognito
			const cognitoResult = await cognitoService.signIn(email, password)
			if (!cognitoResult) {
				return null
			}

			// Get or create user in database
			const user = await this.getOrCreateUser(cognitoResult)
			if (!user) {
				throw new Error('Failed to get user information')
			}

			return {
				id: user.id,
				email: user.email,
				role: user.role as UserRole,
				status: user.status as 'active' | 'inactive' | 'pending',
				accessToken: cognitoResult.accessToken,
				refreshToken: cognitoResult.refreshToken,
			}
		} catch (error: any) {
			console.error('Sign in error:', error)
			throw new Error(error.message || 'Authentication failed')
		}
	}

	/**
	 * Create a new user (admin only)
	 */
	async createUser(userData: CognitoSignUpData): Promise<{ success: boolean; userId?: string; error?: string }> {
		try {
			// Create user in Cognito
			const cognitoResult = await cognitoService.createUser(userData)
			if (!cognitoResult.success) {
				return cognitoResult
			}

			// Create user in database
			const dbUser = await this.createDatabaseUser({
				cognitoUserId: cognitoResult.userId!,
				email: userData.email,
				role: userData.role,
				status: 'pending',
			})

			if (!dbUser) {
				// If database creation fails, we should ideally clean up Cognito user
				return { success: false, error: 'Failed to create user in database' }
			}

			return { success: true, userId: dbUser.id }
		} catch (error: any) {
			console.error('Create user error:', error)
			return { success: false, error: error.message || 'Failed to create user' }
		}
	}

	/**
	 * Get user by email
	 */
	async getUserByEmail(email: string): Promise<User | null> {
		try {
			const result = await db.select().from(users).where(eq(users.email, email))
			return result[0] as User || null
		} catch (error: any) {
			console.error('Get user by email error:', error)
			return null
		}
	}

	/**
	 * Get user by Cognito ID
	 */
	async getUserByCognitoId(cognitoUserId: string): Promise<User | null> {
		try {
			const result = await db.select().from(users).where(eq(users.cognitoUserId, cognitoUserId))
			return result[0] as User || null
		} catch (error: any) {
			console.error('Get user by Cognito ID error:', error)
			return null
		}
	}

	/**
	 * Update user status
	 */
	async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'pending'): Promise<boolean> {
		try {
			await db.update(users)
				.set({ 
					status, 
					updatedAt: new Date() 
				})
				.where(eq(users.id, userId))
			return true
		} catch (error: any) {
			console.error('Update user status error:', error)
			return false
		}
	}

	/**
	 * Get users by role
	 */
	async getUsersByRole(role: UserRole): Promise<User[]> {
		try {
			const result = await db.select()
				.from(users)
				.where(eq(users.role, role))
				.orderBy(users.createdAt)
			return result as User[]
		} catch (error: any) {
			console.error('Get users by role error:', error)
			return []
		}
	}

	/**
	 * Sign out user
	 */
	async signOut(accessToken: string): Promise<boolean> {
		try {
			return await cognitoService.signOut(accessToken)
		} catch (error: any) {
			console.error('Sign out error:', error)
			return false
		}
	}

	/**
	 * Refresh authentication token
	 */
	async refreshToken(refreshToken: string, email: string): Promise<{ accessToken: string; idToken: string } | null> {
		try {
			return await cognitoService.refreshToken(refreshToken, email)
		} catch (error: any) {
			console.error('Refresh token error:', error)
			return null
		}
	}

	/**
	 * Check if user has required role
	 */
	hasRole(user: AuthUser, requiredRole: UserRole | UserRole[]): boolean {
		const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
		return roles.includes(user.role)
	}

	/**
	 * Check if user is admin
	 */
	isAdmin(user: AuthUser): boolean {
		return user.role === 'admin'
	}

	/**
	 * Check if user is doctor
	 */
	isDoctor(user: AuthUser): boolean {
		return user.role === 'doctor'
	}

	/**
	 * Check if user is patient
	 */
	isPatient(user: AuthUser): boolean {
		return user.role === 'patient'
	}

	/**
	 * Private: Get or create user in database from Cognito result
	 */
	private async getOrCreateUser(cognitoResult: CognitoAuthResult): Promise<User | null> {
		try {
			// First try to get existing user
			let user = await this.getUserByEmail(cognitoResult.user.email)
			
			if (!user) {
				// Create new user if doesn't exist
				user = await this.createDatabaseUser({
					cognitoUserId: cognitoResult.user.cognitoUserId,
					email: cognitoResult.user.email,
					role: cognitoResult.user.role,
					status: 'pending',
				})
			}

			return user
		} catch (error: any) {
			console.error('Get or create user error:', error)
			return null
		}
	}

	/**
	 * Private: Create user in database
	 */
	private async createDatabaseUser(userData: {
		cognitoUserId: string
		email: string
		role: UserRole
		status: 'active' | 'inactive' | 'pending'
	}): Promise<User | null> {
		try {
			const result = await db.insert(users)
				.values({
					cognitoUserId: userData.cognitoUserId,
					email: userData.email,
					role: userData.role,
					status: userData.status,
				})
				.onConflictDoUpdate({
					target: users.email,
					set: {
						cognitoUserId: userData.cognitoUserId,
						role: userData.role,
						updatedAt: new Date(),
					}
				})
				.returning()
			
			return result[0] as User || null
		} catch (error: any) {
			console.error('Create database user error:', error)
			return null
		}
	}
}

// Export singleton instance
export const authService = new AuthService()

// Export middleware for route protection (to be created)
// export { authMiddleware } from './middleware'
