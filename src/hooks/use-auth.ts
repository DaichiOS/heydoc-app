'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export interface User {
	id: string
	email: string
	role: string
	status: string
	firstName?: string
	lastName?: string
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
			console.error('Auth check failed:', error)
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
			setAuthState(prev => ({ ...prev, isLoading: true }))
			
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({ email, password }),
			})

			const data = await response.json()

			if (response.ok) {
				await checkAuth() // Refresh auth state
				return { success: true, data }
			} else {
				setAuthState(prev => ({ ...prev, isLoading: false }))
				return { success: false, error: data.error || 'Login failed' }
			}
		} catch (error) {
			console.error('Login error:', error)
			setAuthState(prev => ({ ...prev, isLoading: false }))
			return { success: false, error: 'Network error' }
		}
	}, [checkAuth])

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

	// Helper functions
	const isAdmin = useCallback(() => {
		return authState.user?.role === 'admin'
	}, [authState.user])

	const isDoctor = useCallback(() => {
		return authState.user?.role === 'doctor'
	}, [authState.user])

	const isPatient = useCallback(() => {
		return authState.user?.role === 'patient'
	}, [authState.user])

	// Check auth on mount
	useEffect(() => {
		checkAuth()
	}, [checkAuth])

	return {
		...authState,
		login,
		logout,
		checkAuth,
		isAdmin,
		isDoctor,
		isPatient,
	}
} 