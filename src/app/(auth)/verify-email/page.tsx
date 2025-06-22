'use client'

import { AppHeader } from '@/components/ui/app-header'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function VerifyEmailContent() {
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
			<div className="min-h-screen flex flex-col">
				<AppHeader showQuestions={false} exitHref="/" exitText="Back to Home" />
				<div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
					<div className="text-center">
						<h1 className="text-xl font-semibold text-slate-900 mb-2">Invalid Verification Link</h1>
						<p className="text-slate-600">This verification link is invalid or has expired.</p>
					</div>
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
				// Password set successfully - redirect to doctor profile with email
				router.push(`/doctor/profile?email=${encodeURIComponent(email)}`)
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
		<div className="min-h-screen flex flex-col">
			<AppHeader exitHref="/" exitText="Back to Home" />
			<div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
				<div className="w-full max-w-md">
					{/* Main Card */}
					<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
						<div className="text-center mb-6">
							<h1 className="text-2xl font-semibold text-slate-900 mb-2">
								{step === 'temp-password' ? 'Complete Your Registration' : 'Set Your Password'}
							</h1>
							<p className="text-slate-600">
								{step === 'temp-password' 
									? 'Check your email for the invitation with your temporary password'
									: 'Create a secure password for your account'
								}
							</p>
						</div>

						{step === 'temp-password' && (
							<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
								<p className="text-blue-800 text-sm">
									<strong>📧 Check your email!</strong> We've sent you an invitation email with your temporary password.
								</p>
							</div>
						)}

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
										placeholder="Enter your new password"
										required
									/>
									<p className="mt-1 text-xs text-slate-500">
										Must be at least 8 characters with uppercase, lowercase, and numbers
									</p>
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
										placeholder="Confirm your new password"
										required
									/>
								</div>

								<button
									type="submit"
									disabled={isSubmitting}
									className="w-full bg-[#1C1B3A] hover:bg-[#252347] text-white py-4 px-6 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
								>
									{isSubmitting ? 'Setting Password...' : 'Complete Setup'}
								</button>
							</form>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

function LoadingFallback() {
	return (
		<div className="min-h-screen flex flex-col">
			<AppHeader showQuestions={false} exitHref="/" exitText="Back to Home" />
			<div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C1B3A] mx-auto mb-4"></div>
					<p className="text-slate-600">Loading...</p>
				</div>
			</div>
		</div>
	)
}

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<VerifyEmailContent />
		</Suspense>
	)
} 