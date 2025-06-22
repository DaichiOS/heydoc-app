'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function LoginContent() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [successMessage, setSuccessMessage] = useState('')
	const router = useRouter()
	const searchParams = useSearchParams()

	useEffect(() => {
		// Check for success message and email from URL params
		const message = searchParams.get('message')
		const emailParam = searchParams.get('email')
		
		if (message) {
			setSuccessMessage(message)
		}
		
		if (emailParam) {
			setEmail(emailParam)
		}
	}, [searchParams])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError('')

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			})

			const data = await response.json()

			if (data.success) {
				// Store auth data in localStorage with access token for validation
				const authData = {
					...data.user,
					accessToken: data.accessToken,
					loginTime: Date.now(), // Store login time for session expiry
				}
				localStorage.setItem('heydoc_auth', JSON.stringify(authData))
				
				// Redirect based on role to correct routes
				if (data.user.role === 'admin') {
					router.push('/admin/dashboard')
				} else if (data.user.role === 'doctor') {
					// Redirect to profile page instead of non-existent dashboard
					router.push('/doctor/profile')
				} else {
					router.push('/patient/dashboard')
				}
			} else {
				setError(data.error || 'Login failed')
			}
		} catch (err) {
			setError('An error occurred. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #dbeafe, #eff6ff, #ffffff)' }}>
			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="text-center mb-8">
					<Link 
						href="/" 
						className="group transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95 inline-block"
					>
						<Image
							src="/animations/heydoc.gif"
							alt="HeyDoc"
							width={300}
							height={150}
							className="mx-auto h-24 w-auto transition-all duration-300 group-hover:drop-shadow-lg cursor-pointer"
							priority
							unoptimized
						/>
					</Link>
				</div>

				{/* Login Form */}
				<div className="bg-white rounded-2xl p-8 shadow-xl border border-border">
					<div className="text-center mb-8">
						<h1 className="text-2xl font-bold text-heydoc-primary mb-2">
							Welcome back
						</h1>
						<p className="text-muted-foreground">
							Sign in to your HeyDoc account
						</p>
					</div>

					{successMessage && (
						<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
							{successMessage}
						</div>
					)}

					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
								Email address
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-input"
								placeholder="Enter your email"
							/>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-input"
								placeholder="Enter your password"
							/>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full px-6 py-3 bg-heydoc-primary hover:bg-heydoc-primary-light text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? 'Signing in...' : 'Sign in'}
						</button>
					</form>

					<div className="mt-6 text-center space-y-3">
						<p className="text-sm text-muted-foreground">
							Don&apos;t have an account?{' '}
							<a href="/register" className="text-primary hover:underline font-medium">
								Sign up
							</a>
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center mt-8 text-sm text-muted-foreground">
					<p>© 2025 HeyDoc. All rights reserved.</p>
				</div>
			</div>
		</div>
	)
}

function LoginLoading() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white flex items-center justify-center p-4">
			<div className="text-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
				<p className="text-muted-foreground">Loading...</p>
			</div>
		</div>
	)
}

export default function LoginPage() {
	return (
		<Suspense fallback={<LoginLoading />}>
			<LoginContent />
		</Suspense>
	)
} 