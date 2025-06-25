'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export interface User {
	id: string
	email: string
	role: string
	status: string
}

export interface AuthState {
	user: User | null
	isLoading: boolean
	isAuthenticated: boolean
}

export function useAuth() {
	const [authState, setAuthState] = useState<AuthState>({
		user: null,
		isLoading: true,
		isAuthenticated: false,
	})
	const router = useRouter()

	// Check authentication status
	const checkAuth = useCallback(async () => {
		try {
			const response = await fetch('/api/auth/validate-session', {
				method: 'GET',
				credentials: 'include',
			})

			if (response.ok) {
				const { user } = await response.json()
				setAuthState({
					user,
					isLoading: false,
					isAuthenticated: true,
				})
			} else {
				setAuthState({
					user: null,
					isLoading: false,
					isAuthenticated: false,
				})
			}
		} catch (error) {
			console.error('Auth check error:', error)
			setAuthState({
				user: null,
				isLoading: false,
				isAuthenticated: false,
			})
		}
	}, [])

	// Login function
	const login = useCallback(async (email: string, password: string) => {
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({ email, password }),
			})

			const data = await response.json()

			if (response.ok && data.success) {
				setAuthState({
					user: data.user,
					isLoading: false,
					isAuthenticated: true,
				})
				return { success: true }
			} else {
				return { 
					success: false, 
					error: data.error || 'Login failed' 
				}
			}
		} catch (error) {
			console.error('Login error:', error)
			return { 
				success: false, 
				error: 'Network error occurred' 
			}
		}
	}, [])

	// Logout function
	const logout = useCallback(async () => {
		try {
			await fetch('/api/auth/logout', {
				method: 'POST',
				credentials: 'include',
			})
		} catch (error) {
			console.error('Logout error:', error)
		} finally {
			setAuthState({
				user: null,
				isLoading: false,
				isAuthenticated: false,
			})
			router.push('/login')
		}
	}, [router])

	// Check authentication on mount
	useEffect(() => {
		checkAuth()
	}, [checkAuth])

	// Redirect if not authenticated (for protected pages)
	const requireAuth = useCallback((requiredRole?: string) => {
		if (!authState.isLoading && !authState.isAuthenticated) {
			router.push('/login')
			return false
		}

		if (requiredRole && authState.user?.role !== requiredRole) {
			router.push('/unauthorized')
			return false
		}

		return true
	}, [authState, router])

	// Role checking helpers
	const hasRole = useCallback((role: string) => {
		return authState.user?.role === role
	}, [authState.user])

	const isAdmin = useCallback(() => {
		return hasRole('admin')
	}, [hasRole])

	const isDoctor = useCallback(() => {
		return hasRole('doctor')
	}, [hasRole])

	const isPatient = useCallback(() => {
		return hasRole('patient')
	}, [hasRole])

	return {
		...authState,
		login,
		logout,
		checkAuth,
		requireAuth,
		hasRole,
		isAdmin,
		isDoctor,
		isPatient,
	}
} 