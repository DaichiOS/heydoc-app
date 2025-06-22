'use client'

import { AppHeader } from '@/components/ui/app-header'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function HomePage() {
	const router = useRouter()
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// Check if user is already authenticated
		const authData = localStorage.getItem('heydoc_auth')
		if (authData) {
			try {
				const userData = JSON.parse(authData)
				
				// Validate that the auth data has required fields
				if (userData.email && userData.role) {
					setIsAuthenticated(true)
				} else {
					throw new Error('Invalid auth data')
				}
			} catch (error) {
				console.error('Invalid auth data:', error)
				// Invalid auth data, clear it
				localStorage.removeItem('heydoc_auth')
				setIsAuthenticated(false)
			}
		} else {
			setIsAuthenticated(false)
		}
		
		setIsLoading(false)
	}, [])

	if (isLoading) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center">
				<div className="text-center">
					<Image
						src="/logos/heydoc.png"
						alt="HeyDoc"
						width={200}
						height={100}
						className="mx-auto h-16 w-auto mb-4"
						priority
					/>
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C1B3A] mx-auto mb-4"></div>
					<p className="text-slate-600">Loading...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-[#EFF4F9] flex flex-col">
			<AppHeader />
			
			{/* Hero Section */}
			<section className="px-6 sm:px-8 lg:px-12 py-24 lg:py-32 flex-grow">
				<div className="max-w-4xl mx-auto text-center">
					{/* Logo */}
					<div className="mb-8">
						<Image
							src="/animations/heydoc.gif"
							alt="HeyDoc"
							width={600}
							height={300}
							className="h-32 sm:h-36 lg:h-40 w-auto mx-auto"
							priority
							unoptimized
						/>
					</div>

					{/* Headline */}
					<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
						Fertility Referrals Made Simple
					</h1>
					
					<p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-12">
						Streamlined fertility consultations and specialist referrals for healthcare professionals across Australia.
					</p>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						{isAuthenticated ? (
							<Link
								href="/doctor/profile"
								className="inline-flex items-center justify-center px-8 py-4 bg-[#1C1B3A] hover:bg-[#252347] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
							>
								Go to Profile
								<ArrowRight className="ml-2 w-5 h-5" />
							</Link>
						) : (
							<>
								<Link
									href="/register"
									className="inline-flex items-center justify-center px-8 py-4 bg-[#1C1B3A] hover:bg-[#252347] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
								>
									Join HeyDoc
									<ArrowRight className="ml-2 w-5 h-5" />
								</Link>
								<Link
									href="/login"
									className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-slate-50 text-[#1C1B3A] font-semibold rounded-xl border-2 border-[#1C1B3A] transition-all duration-200"
								>
									Sign In
								</Link>
							</>
						)}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-slate-900 text-white py-12 mt-auto">
				<div className="max-w-7xl mx-auto px-6">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div className="col-span-1 md:col-span-2">
							<Image
								src="/logos/heydoc-white.png"
								alt="HeyDoc"
								width={200}
								height={80}
								className="h-12 w-auto mb-4"
							/>
							<p className="text-slate-400 max-w-md mb-6">
								Quality healthcare, anywhere in Australia. Built by doctors for better patient access.
							</p>
							
							{/* Social Media */}
							<div className="flex space-x-4">
								<div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
									<svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
										<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
									</svg>
								</div>
								<a 
									href="https://www.instagram.com/heydoc.au/" 
									target="_blank" 
									rel="noopener noreferrer"
									className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer"
								>
									<svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
										<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.072-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
									</svg>
								</a>
								<a 
									href="https://www.linkedin.com/company/heydocau" 
									target="_blank" 
									rel="noopener noreferrer"
									className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer"
								>
									<svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
										<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
									</svg>
								</a>
							</div>
						</div>

						<div>
							<h4 className="font-semibold mb-4">Company</h4>
							<ul className="space-y-2 text-slate-400">
								<li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
								<li><a href="mailto:admin@heydochealth.com.au" className="hover:text-white transition-colors">Contact</a></li>
								<li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
								<li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold mb-4">Services</h4>
							<ul className="space-y-2 text-slate-400">
								<li><a href="#" className="hover:text-white transition-colors">GP Consultations</a></li>
								<li><a href="#" className="hover:text-white transition-colors">Mental Health</a></li>
								<li><a href="#" className="hover:text-white transition-colors">Women's Health</a></li>
								<li><a href="#" className="hover:text-white transition-colors">Specialist Referrals</a></li>
							</ul>
						</div>
					</div>
					
					<div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
						<div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
							<p>&copy; 2025 HeyDoc. All rights reserved.</p>
							<div className="flex space-x-4 text-sm">
								<a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
								<a href="#" className="hover:text-white transition-colors">Terms of Service</a>
								<a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	)
}
