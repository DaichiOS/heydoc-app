import { headers } from 'next/headers'
import { getAuthUser, UserPayload } from './cookies'

/**
 * Get current user from server component
 * Uses middleware-injected headers as fallback if cookies are not accessible
 */
export async function getCurrentUser(): Promise<UserPayload | null> {
	try {
		// First try to get user from cookies
		const user = await getAuthUser()
		if (user) {
			return user
		}

		// Fallback to middleware headers
		const headersList = await headers()
		const userId = headersList.get('x-user-id')
		const userEmail = headersList.get('x-user-email')
		const userRole = headersList.get('x-user-role')
		const userStatus = headersList.get('x-user-status')

		if (userId && userEmail && userRole && userStatus) {
			return {
				id: userId,
				email: userEmail,
				role: userRole,
				status: userStatus,
			}
		}

		return null
	} catch (error) {
		console.error('Error getting current user:', error)
		return null
	}
}

/**
 * Require authentication in server components
 */
export async function requireServerAuth(): Promise<UserPayload> {
	try {
		const user = await getCurrentUser()
		if (!user) {
			throw new Error('Authentication required')
		}
		return user
	} catch (error) {
		console.error('Server auth error:', error)
		throw new Error('Authentication required')
	}
}

/**
 * Require admin role in server components
 */
export async function requireServerAdmin(): Promise<UserPayload> {
	try {
		const user = await requireServerAuth()
		if (user.role !== 'admin') {
			throw new Error('Admin access required')
		}
		return user
	} catch (error) {
		console.error('Server admin auth error:', error)
		throw new Error('Admin access required')
	}
}

/**
 * Require doctor role in server components
 */
export async function requireServerDoctor(): Promise<UserPayload> {
	try {
		const user = await requireServerAuth()
		if (user.role !== 'doctor' && user.role !== 'admin') {
			throw new Error('Doctor access required')
		}
		return user
	} catch (error) {
		console.error('Server doctor auth error:', error)
		throw new Error('Doctor access required')
	}
}

/**
 * Check if current user has specific role
 */
export async function hasServerRole(role: string): Promise<boolean> {
	try {
		const user = await getCurrentUser()
		return user?.role === role || false
	} catch (error) {
		return false
	}
}

/**
 * Check if current user is authenticated
 */
export async function isServerAuthenticated(): Promise<boolean> {
	try {
		const user = await getCurrentUser()
		return user !== null
	} catch (error) {
		return false
	}
}

/**
 * Check if current user is admin
 */
export async function isServerAdmin(): Promise<boolean> {
	return hasServerRole('admin')
}

/**
 * Check if current user is doctor
 */
export async function isServerDoctor(): Promise<boolean> {
	const user = await getCurrentUser()
	return user?.role === 'doctor' || user?.role === 'admin' || false
}

/**
 * Check if current user is patient
 */
export async function isServerPatient(): Promise<boolean> {
	return hasServerRole('patient')
}

/**
 * Get user ID from server component
 */
export async function getCurrentUserId(): Promise<string | null> {
	const user = await getCurrentUser()
	return user?.id || null
}

/**
 * Get user email from server component
 */
export async function getCurrentUserEmail(): Promise<string | null> {
	const user = await getCurrentUser()
	return user?.email || null
}

/**
 * Get user role from server component
 */
export async function getCurrentUserRole(): Promise<string | null> {
	const user = await getCurrentUser()
	return user?.role || null
}

/**
 * Get user status from server component
 */
export async function getCurrentUserStatus(): Promise<string | null> {
	const user = await getCurrentUser()
	return user?.status || null
} 