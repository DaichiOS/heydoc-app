import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AuthUser {
	id: string
	email: string
	role: 'admin' | 'doctor' | 'patient'
	status: string
	accessToken?: string
	loginTime?: number
}

interface UseAuthReturn {
	user: AuthUser | null
	isLoading: boolean
	isAuthenticated: boolean
	logout: () => void
	refreshSession: () => Promise<boolean>
}

export function useAuth(): UseAuthReturn {
	const [user, setUser] = useState<AuthUser | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const router = useRouter()

	const logout = () => {
		localStorage.removeItem('heydoc_auth')
		setUser(null)
		router.push('/login')
	}

	const refreshSession = async (): Promise<boolean> => {
		const authData = localStorage.getItem('heydoc_auth')
		if (!authData) return false

		try {
			const userData = JSON.parse(authData)
			
			// Check if session is too old (24 hours)
			const sessionAge = Date.now() - (userData.loginTime || 0)
			const maxSessionAge = 24 * 60 * 60 * 1000 // 24 hours
			
			if (sessionAge > maxSessionAge) {
				console.log('Session expired due to age')
				logout()
				return false
			}

			// Validate session data structure
			if (!userData.email || !userData.role) {
				throw new Error('Invalid session data')
			}

			// Validate access token with backend if available
			if (userData.accessToken) {
				try {
					const response = await fetch('/api/auth/validate-session', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ accessToken: userData.accessToken }),
					})

					const result = await response.json()
					
					if (!result.success) {
						console.log('Token validation failed:', result.error)
						logout()
						return false
					}
				} catch (error) {
					console.error('Token validation request failed:', error)
					// Don't logout on network errors, just continue with local validation
				}
			}

			setUser(userData)
			return true
		} catch (error) {
			console.error('Session validation failed:', error)
			logout()
			return false
		}
	}

	useEffect(() => {
		const initializeAuth = async () => {
			setIsLoading(true)
			await refreshSession()
			setIsLoading(false)
		}

		initializeAuth()

		// Set up periodic session validation (every 10 minutes)
		const interval = setInterval(() => {
			refreshSession()
		}, 10 * 60 * 1000)

		return () => clearInterval(interval)
	}, [])

	return {
		user,
		isLoading,
		isAuthenticated: !!user,
		logout,
		refreshSession,
	}
} 