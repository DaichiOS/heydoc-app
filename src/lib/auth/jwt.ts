import jwt from 'jsonwebtoken'
import { config } from '../config'

export interface JWTPayload {
	userId: string
	email: string
	role: string
	status: string
	iat?: number
	exp?: number
}

export interface AuthTokens {
	accessToken: string
	refreshToken: string
}

/**
 * Sign a JWT token with user payload
 */
export function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
	return jwt.sign(payload, config.app.jwtSecret, {
		expiresIn: '24h', // 24 hours
		issuer: 'heydoc',
		audience: 'heydoc-users',
	})
}

/**
 * Sign a refresh token (longer expiry)
 */
export function signRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
	return jwt.sign(payload, config.app.jwtSecret, {
		expiresIn: '7d', // 7 days
		issuer: 'heydoc',
		audience: 'heydoc-users',
	})
}

/**
 * Verify and decode JWT token
 */
export function verifyJWT(token: string): JWTPayload | null {
	try {
		const decoded = jwt.verify(token, config.app.jwtSecret, {
			issuer: 'heydoc',
			audience: 'heydoc-users',
		}) as JWTPayload
		
		return decoded
	} catch (error) {
		console.error('JWT verification failed:', error)
		return null
	}
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
	if (!authHeader) return null
	
	const parts = authHeader.split(' ')
	if (parts.length !== 2 || parts[0] !== 'Bearer') {
		return null
	}
	
	return parts[1]
}

/**
 * Create auth token response
 */
export function createAuthTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): AuthTokens {
	return {
		accessToken: signJWT(payload),
		refreshToken: signRefreshToken(payload),
	}
} 