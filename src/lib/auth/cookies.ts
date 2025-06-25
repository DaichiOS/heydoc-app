import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const COOKIE_NAME = 'heydoc_auth'

export interface UserPayload extends JWTPayload {
	id: string
	email: string
	role: string
	status: string
	cognitoUserId?: string
}

export interface AuthCookieOptions {
	maxAge?: number
	httpOnly?: boolean
	secure?: boolean
	sameSite?: 'strict' | 'lax' | 'none'
}

/**
 * Sign a JWT token with user payload
 */
export async function signToken(payload: UserPayload): Promise<string> {
	try {
		const token = await new SignJWT({ ...payload })
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime('24h')
			.sign(JWT_SECRET)

		return token
	} catch (error) {
		console.error('Error signing JWT token:', error)
		throw new Error('Failed to sign authentication token')
	}
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<UserPayload | null> {
	try {
		const { payload } = await jwtVerify(token, JWT_SECRET)
		
		if (
			typeof payload.id === 'string' &&
			typeof payload.email === 'string' &&
			typeof payload.role === 'string' &&
			typeof payload.status === 'string'
		) {
			return payload as UserPayload
		}
		
		console.error('Invalid JWT payload structure:', payload)
		return null
	} catch (error) {
		console.error('Error verifying JWT token:', error)
		return null
	}
}

/**
 * Set authentication cookie with JWT token
 */
export async function setAuthCookie(
	payload: UserPayload,
	options: AuthCookieOptions = {}
): Promise<void> {
	try {
		const token = await signToken(payload)
		
		const cookieStore = await cookies()
		
		const defaultOptions: AuthCookieOptions = {
			maxAge: 24 * 60 * 60,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			...options,
		}

		cookieStore.set(COOKIE_NAME, token, {
			maxAge: defaultOptions.maxAge,
			httpOnly: defaultOptions.httpOnly,
			secure: defaultOptions.secure,
			sameSite: defaultOptions.sameSite,
			path: '/',
		})
	} catch (error) {
		console.error('Error setting auth cookie:', error)
		throw new Error('Failed to set authentication cookie')
	}
}

/**
 * Get authentication token from cookies
 */
export async function getAuthToken(): Promise<string | null> {
	try {
		const cookieStore = await cookies()
		const cookie = cookieStore.get(COOKIE_NAME)
		return cookie?.value || null
	} catch (error) {
		console.error('Error getting auth token:', error)
		return null
	}
}

/**
 * Get user payload from authentication cookie
 */
export async function getAuthUser(): Promise<UserPayload | null> {
	try {
		const token = await getAuthToken()
		if (!token) {
			return null
		}

		return await verifyToken(token)
	} catch (error) {
		console.error('Error getting auth user:', error)
		return null
	}
}

/**
 * Clear authentication cookie
 */
export async function clearAuthCookie(): Promise<void> {
	try {
		const cookieStore = await cookies()
		cookieStore.delete(COOKIE_NAME)
	} catch (error) {
		console.error('Error clearing auth cookie:', error)
	}
}

/**
 * Refresh authentication cookie with updated user data
 */
export async function refreshAuthCookie(payload: UserPayload): Promise<void> {
	try {
		await clearAuthCookie()
		
		await setAuthCookie(payload)
	} catch (error) {
		console.error('Error refreshing auth cookie:', error)
		throw new Error('Failed to refresh authentication')
	}
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
	try {
		const user = await getAuthUser()
		return user !== null
	} catch (error) {
		return false
	}
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: string): Promise<boolean> {
	try {
		const user = await getAuthUser()
		return user?.role === role
	} catch (error) {
		return false
	}
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
	return hasRole('admin')
}

/**
 * Check if user is doctor
 */
export async function isDoctor(): Promise<boolean> {
	return hasRole('doctor')
}

/**
 * Check if user is patient
 */
export async function isPatient(): Promise<boolean> {
	return hasRole('patient')
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<UserPayload> {
	const user = await getAuthUser()
	if (!user) {
		throw new Error('Authentication required')
	}
	return user
}

/**
 * Require admin role - throws error if not admin
 */
export async function requireAdmin(): Promise<UserPayload> {
	const user = await requireAuth()
	if (user.role !== 'admin') {
		throw new Error('Admin access required')
	}
	return user
}

/**
 * Require doctor role - throws error if not doctor
 */
export async function requireDoctor(): Promise<UserPayload> {
	const user = await requireAuth()
	if (user.role !== 'doctor') {
		throw new Error('Doctor access required')
	}
	return user
} 