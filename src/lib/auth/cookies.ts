import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { config } from '../config'

export const COOKIE_NAME = 'heydoc_auth_token'
export const REFRESH_COOKIE_NAME = 'heydoc_refresh_token'

/**
 * Cookie configuration
 */
const getCookieConfig = () => ({
	httpOnly: true,
	secure: config.app.environment === 'production',
	sameSite: 'lax' as const,
	path: '/',
})

/**
 * Set authentication cookies in response
 */
export function setAuthCookies(
	response: NextResponse,
	accessToken: string,
	refreshToken: string
): NextResponse {
	const cookieConfig = getCookieConfig()
	
	// Set access token (24 hours)
	response.cookies.set(COOKIE_NAME, accessToken, {
		...cookieConfig,
		maxAge: 24 * 60 * 60, // 24 hours in seconds
	})
	
	// Set refresh token (7 days)
	response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
		...cookieConfig,
		maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
	})
	
	return response
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(response: NextResponse): NextResponse {
	const cookieConfig = getCookieConfig()
	
	response.cookies.set(COOKIE_NAME, '', {
		...cookieConfig,
		maxAge: 0,
	})
	
	response.cookies.set(REFRESH_COOKIE_NAME, '', {
		...cookieConfig,
		maxAge: 0,
	})
	
	return response
}

/**
 * Get authentication token from cookies (server-side)
 */
export async function getAuthToken(): Promise<string | null> {
	try {
		const cookieStore = await cookies()
		return cookieStore.get(COOKIE_NAME)?.value || null
	} catch (error) {
		console.error('Error getting auth token from cookies:', error)
		return null
	}
}

/**
 * Get refresh token from cookies (server-side)
 */
export async function getRefreshToken(): Promise<string | null> {
	try {
		const cookieStore = await cookies()
		return cookieStore.get(REFRESH_COOKIE_NAME)?.value || null
	} catch (error) {
		console.error('Error getting refresh token from cookies:', error)
		return null
	}
} 