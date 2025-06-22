'use client'

import { LogOut, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AppHeaderProps {
	showQuestions?: boolean
	showExit?: boolean
	exitHref?: string
	exitText?: string
}

export function AppHeader({ 
	showQuestions = false,
	showExit = true, 
	exitHref = '/login',
	exitText = 'Exit'
}: AppHeaderProps) {
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [userDisplayName, setUserDisplayName] = useState('')
	const [showUserMenu, setShowUserMenu] = useState(false)
	const router = useRouter()

	useEffect(() => {
		// Check if user is authenticated
		const authData = localStorage.getItem('heydoc_auth')
		if (authData) {
			try {
				const userData = JSON.parse(authData)
				setIsAuthenticated(true)
				
				// Create display name - prefer "Dr [LastName]" for doctors
				if (userData.role === 'doctor' && userData.firstName && userData.lastName) {
					setUserDisplayName(`Dr ${userData.lastName}`)
				} else if (userData.firstName && userData.lastName) {
					setUserDisplayName(`${userData.firstName} ${userData.lastName}`)
				} else {
					// Fallback to email if no name available
					setUserDisplayName(userData.email)
				}
			} catch (error) {
				setIsAuthenticated(false)
				setUserDisplayName('')
			}
		} else {
			setIsAuthenticated(false)
			setUserDisplayName('')
		}
	}, [])

	const handleLogout = () => {
		localStorage.removeItem('heydoc_auth')
		localStorage.removeItem('registrationEmail')
		setShowUserMenu(false)
		router.push('/login')
	}

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (showUserMenu) {
				setShowUserMenu(false)
			}
		}

		document.addEventListener('click', handleClickOutside)
		return () => document.removeEventListener('click', handleClickOutside)
	}, [showUserMenu])

	return (
		<div className="bg-slate-900 border-b border-slate-800 shadow-lg">
			<div className="flex items-center justify-between px-6 py-6">
				<div className="flex items-center ml-8">
					<Link 
						href="/" 
						className="group transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95"
					>
						<Image
							src="/animations/heydoc-white.gif"
							alt="HeyDoc"
							width={280}
							height={112}
							className="h-20 w-auto transition-all duration-300 group-hover:drop-shadow-lg cursor-pointer"
							priority
							unoptimized
						/>
					</Link>
				</div>
				<div className="flex items-center gap-4 mr-4">
					{/* Show different options based on authentication status */}
					{isAuthenticated ? (
						/* Authenticated User - Show dropdown menu */
						<div className="relative">
							<button
								onClick={(e) => {
									e.stopPropagation()
									setShowUserMenu(!showUserMenu)
								}}
								className="flex items-center gap-3 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 font-medium transition-all duration-200 px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-600"
							>
								<div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center">
									<User className="w-3 h-3 text-slate-300" />
								</div>
								<span className="text-sm">
									{userDisplayName}
								</span>
								<svg 
									className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
									fill="none" 
									stroke="currentColor" 
									viewBox="0 0 24 24"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{/* Dropdown Menu */}
							{showUserMenu && (
								<div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
									<div className="px-4 py-3 border-b border-slate-100">
										<p className="text-sm font-medium text-slate-900">{userDisplayName}</p>
										<p className="text-xs text-slate-500 mt-1">Logged in</p>
									</div>
									<div className="py-1">
										<Link
											href="/doctor/profile"
											className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
											onClick={() => setShowUserMenu(false)}
										>
											<User className="w-4 h-4 mr-3 text-slate-400" />
											View Profile
										</Link>
										<button
											onClick={handleLogout}
											className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
										>
											<LogOut className="w-4 h-4 mr-3" />
											Sign Out
										</button>
									</div>
								</div>
							)}
						</div>
					) : (
						/* Not Authenticated - Show login/register buttons */
						<div className="flex items-center gap-3">
							<Link
								href="/login"
								className="text-slate-300 hover:text-white font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-slate-800"
							>
								Sign In
							</Link>
							<Link
								href="/register"
								className="text-slate-900 hover:text-white bg-white hover:bg-slate-700 font-medium transition-all duration-200 px-4 py-2 rounded-lg border border-white hover:border-transparent"
							>
								Sign Up
							</Link>
							
							{/* Fallback exit button if specifically requested */}
							{showExit && exitHref !== '/login' && (
								<Link
									href={exitHref}
									className="text-slate-400 hover:text-white font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:bg-slate-800 text-sm"
								>
									{exitText}
								</Link>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
} 