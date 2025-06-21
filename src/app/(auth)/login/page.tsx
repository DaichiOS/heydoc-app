'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const router = useRouter()

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
				// Store auth data in localStorage (we'll improve this later)
				localStorage.setItem('heydoc_auth', JSON.stringify(data.user))
				
				// Redirect based on role
				if (data.user.role === 'admin') {
					router.push('/admin/dashboard')
				} else if (data.user.role === 'doctor') {
					router.push('/doctor/dashboard')
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
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="text-center mb-8">
					<Image
						src="/logos/heydoc.png"
						alt="HeyDoc"
						width={300}
						height={150}
						className="mx-auto h-24 w-auto"
						priority
					/>
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