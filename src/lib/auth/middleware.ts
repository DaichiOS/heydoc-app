import { getAuthToken } from './cookies'
import { verifyJWT } from './jwt'

export interface AuthenticatedUser {
	userId: string
	email: string
	role: string
	status: string
}

/**
 * Get current authenticated user from cookies (server-side)
 * Returns null if not authenticated or token is invalid
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
	try {
		const token = await getAuthToken()
		if (!token) {
			return null
		}

		const payload = verifyJWT(token)
		if (!payload) {
			return null
		}

		return {
			userId: payload.userId,
			email: payload.email,
			role: payload.role,
			status: payload.status,
		}
	} catch (error) {
		console.error('Error getting current user:', error)
		return null
	}
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
	const user = await getCurrentUser()
	if (!user) {
		throw new Error('Authentication required')
	}
	return user
}

/**
 * Require admin role - throws error if not admin
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
	const user = await requireAuth()
	if (user.role !== 'admin') {
		throw new Error('Admin access required')
	}
	return user
}

/**
 * Require doctor role - throws error if not doctor
 */
export async function requireDoctor(): Promise<AuthenticatedUser> {
	const user = await requireAuth()
	if (user.role !== 'doctor') {
		throw new Error('Doctor access required')
	}
	return user
}

/**
 * Check if user has specific role
 */
export async function hasRole(requiredRole: string): Promise<boolean> {
	const user = await getCurrentUser()
	return user?.role === requiredRole
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
	return await hasRole('admin')
} 