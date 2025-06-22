'use client'

import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function VerifyEmailSentPage() {
	const searchParams = useSearchParams()
	const email = searchParams.get('email')
	const [isResending, setIsResending] = useState(false)
	const [resendMessage, setResendMessage] = useState('')

	const handleResendEmail = async () => {
		if (!email) return

		setIsResending(true)
		setResendMessage('')

		try {
			const response = await fetch('/api/auth/resend-verification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			})

			if (response.ok) {
				setResendMessage('Verification email sent! Please check your inbox.')
			} else {
				setResendMessage('Failed to resend email. Please try again.')
			}
		} catch (error) {
			setResendMessage('Failed to resend email. Please try again.')
		} finally {
			setIsResending(false)
		}
	}

	const maskedEmail = email 
		? email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
		: 'your email'

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
					{/* Success Icon */}
					<div className="text-center mb-6">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h1 className="text-2xl font-semibold text-slate-900 mb-2">
							Check Your Email
						</h1>
						<p className="text-slate-600">
							We've sent a verification email to <strong>{maskedEmail}</strong>
						</p>
					</div>

					{/* Instructions */}
					<div className="space-y-4 mb-6">
						<div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
							<h3 className="font-medium text-slate-900 mb-2">Next Steps:</h3>
							<ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
								<li>Check your email inbox (and spam folder)</li>
								<li>Look for an email from HeyDoc with your temporary password</li>
								<li>Click the link or go to the verification page</li>
								<li>Use the temporary password to set your permanent password</li>
							</ol>
						</div>
					</div>

					{/* Resend Email */}
					<div className="border-t border-slate-200 pt-4">
						<div className="text-center">
							<p className="text-sm text-slate-600 mb-3">
								Didn't receive the email?
							</p>
							
							{resendMessage && (
								<div className={`mb-3 p-2 rounded-lg text-sm ${
									resendMessage.includes('sent') 
										? 'bg-green-50 text-green-700 border border-green-200' 
										: 'bg-red-50 text-red-700 border border-red-200'
								}`}>
									{resendMessage}
								</div>
							)}
							
							<button
								onClick={handleResendEmail}
								disabled={isResending || !email}
								className="text-[#1C1B3A] hover:text-[#252347] font-medium text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isResending ? 'Sending...' : 'Resend Email'}
							</button>
						</div>
					</div>

					{/* Help */}
					<div className="mt-6 text-center">
						<p className="text-xs text-slate-500">
							Need help? Contact us at{' '}
							<a href="mailto:support@heydoc.com" className="text-[#1C1B3A] hover:underline">
								support@heydoc.com
							</a>
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