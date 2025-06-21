'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
	const router = useRouter()

	useEffect(() => {
		// Check if user is already authenticated
		const authData = localStorage.getItem('heydoc_auth')
		if (authData) {
			try {
				const userData = JSON.parse(authData)
				// Redirect based on role
				if (userData.role === 'admin') {
					router.push('/admin/dashboard')
				} else if (userData.role === 'doctor') {
					router.push('/doctor/dashboard')
				} else {
					router.push('/patient/dashboard')
				}
				return
			} catch (error) {
				// Invalid auth data, clear it
				localStorage.removeItem('heydoc_auth')
			}
		}
		
		// Redirect to login if not authenticated
		router.push('/login')
	}, [router])

	// Show loading while redirecting
	return (
		<div className="min-h-screen bg-background flex items-center justify-center">
			<div className="text-center">
				<Image
					src="/logos/heydoc.png"
					alt="HeyDoc"
					width={200}
					height={100}
					className="mx-auto h-16 w-auto mb-4"
					priority
				/>
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
				<p className="text-muted-foreground">Loading HeyDoc...</p>
			</div>
		</div>
	)
}
