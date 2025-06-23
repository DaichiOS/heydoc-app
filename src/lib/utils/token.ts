/**
 * Browser-safe email token encoding/decoding utilities
 * Uses only browser-compatible APIs (btoa/atob)
 */

/**
 * Encodes an email address into a URL-safe token using base64
 */
export function encodeEmailToken(email: string): string {
	try {
		// Use browser's built-in base64 encoding
		const base64 = btoa(email)
		// Make it URL-safe by replacing problematic characters
		return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
	} catch (error) {
		console.error('Failed to encode email token:', error)
		throw new Error('Failed to encode email token')
	}
}

/**
 * Decodes a token back to an email address using base64
 */
export function decodeEmailToken(token: string): string | null {
	try {
		// Restore URL-safe characters back to standard base64
		let base64 = token.replace(/-/g, '+').replace(/_/g, '/')
		
		// Add padding if needed (base64 requires length to be multiple of 4)
		while (base64.length % 4) {
			base64 += '='
		}
		
		// Decode using browser's built-in base64 decoding
		return atob(base64)
	} catch (error) {
		console.error('Failed to decode email token:', error)
		return null
	}
}

/**
 * Validates if a decoded token contains a valid email format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
} 