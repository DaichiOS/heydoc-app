'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function VerifyEmailPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const email = searchParams.get('email')
	
	const [step, setStep] = useState<'temp-password' | 'new-password'>('temp-password')
	const [tempPassword, setTempPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')

	if (!email) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
				<div className="text-center">
					<h1 className="text-xl font-semibold text-slate-900 mb-2">Invalid Verification Link</h1>
					<p className="text-slate-600">This verification link is invalid or has expired.</p>
				</div>
			</div>
		)
	}

	const handleTempPasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		if (!tempPassword.trim()) {
			setError('Temporary password is required')
			return
		}

		setIsSubmitting(true)
		setError('')

		try {
			const response = await fetch('/api/auth/verify-temp-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email,
					temporaryPassword: tempPassword,
				}),
			})

			const data = await response.json()

			if (response.ok && data.success) {
				setStep('new-password')
			} else {
				setError(data.error || 'Invalid temporary password')
			}
		} catch (error) {
			console.error('Temp password verification error:', error)
			setError('Failed to verify temporary password. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleNewPasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		if (newPassword !== confirmPassword) {
			setError('Passwords do not match')
			return
		}
		
		if (newPassword.length < 8) {
			setError('Password must be at least 8 characters long')
			return
		}
		
		if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
			setError('Password must contain uppercase, lowercase, and numeric characters')
			return
		}

		setIsSubmitting(true)
		setError('')

		try {
			const response = await fetch('/api/auth/set-permanent-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email,
					temporaryPassword: tempPassword,
					newPassword,
				}),
			})

			const data = await response.json()

			if (response.ok && data.success) {
				// Password set successfully - redirect to pending doctor profile
				router.push('/doctor/pending')
			} else {
				setError(data.error || 'Failed to set password')
			}
		} catch (error) {
			console.error('Password setup error:', error)
			setError('Failed to set password. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="text-center mb-8">
					<Image
						src="/logos/heydoc.png"
						alt="HeyDoc"
						width={150}
						height={40}
						className="mx-auto"
						unoptimized
					/>
				</div>

				{/* Main Card */}
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
					<div className="text-center mb-6">
						<h1 className="text-2xl font-semibold text-slate-900 mb-2">
							{step === 'temp-password' ? 'Verify Your Email' : 'Set Your Password'}
						</h1>
						<p className="text-slate-600">
							{step === 'temp-password' 
								? 'Enter the temporary password from your email'
								: 'Create a secure password for your account'
							}
						</p>
					</div>

					{error && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-red-600 text-sm">{error}</p>
						</div>
					)}

					{step === 'temp-password' ? (
						<form onSubmit={handleTempPasswordSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Email
								</label>
								<input
									type="email"
									value={email}
									readOnly
									className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-600"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Temporary Password *
								</label>
								<input
									type="password"
									value={tempPassword}
									onChange={(e) => setTempPassword(e.target.value)}
									className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1C1B3A] focus:border-transparent transition-all duration-200"
									placeholder="Enter temporary password from email"
									required
								/>
								<p className="mt-1 text-xs text-slate-500">
									Check your email for the temporary password we sent you
								</p>
							</div>

							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full bg-[#1C1B3A] hover:bg-[#252347] text-white py-4 px-6 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
							>
								{isSubmitting ? 'Verifying...' : 'Verify Email'}
							</button>
						</form>
					) : (
						<form onSubmit={handleNewPasswordSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									New Password *
								</label>
								<input
									type="password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1C1B3A] focus:border-transparent transition-all duration-200"
									placeholder="Create a secure password"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Confirm Password *
								</label>
								<input
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1C1B3A] focus:border-transparent transition-all duration-200"
									placeholder="Confirm your password"
									required
								/>
							</div>

							<div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3">
								<p className="text-xs text-slate-600 font-medium mb-1">
									Password requirements:
								</p>
								<ul className="text-xs text-slate-600 space-y-1">
									<li>At least 8 characters long</li>
									<li>Contains uppercase and lowercase letters</li>
									<li>Contains at least one number</li>
								</ul>
							</div>

							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full bg-[#1C1B3A] hover:bg-[#252347] text-white py-4 px-6 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
							>
								{isSubmitting ? 'Setting Password...' : 'Set Password & Continue'}
							</button>
						</form>
					)}

					<div className="mt-6 text-center">
						<p className="text-sm text-slate-500">
							{step === 'temp-password' 
								? "Didn't receive an email? Check your spam folder or contact support."
								: 'By setting your password, you confirm your email and complete your registration.'
							}
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center mt-8 text-sm text-slate-400">
					<p>© 2025 HeyDoc. All rights reserved.</p>
				</div>
			</div>
		</div>
	)
} 