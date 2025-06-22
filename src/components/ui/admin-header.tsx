'use client'

import { LogOut, User, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UserData {
	email: string
	role: 'admin' | 'doctor' | 'patient'
	firstName?: string
	lastName?: string
}

interface AdminHeaderProps {
	showQuestions?: boolean
	showExit?: boolean
	exitHref?: string
	exitText?: string
}

export function AdminHeader({ 
	showQuestions = false,
	showExit = true, 
	exitHref = '/login',
	exitText = 'Exit'
}: AdminHeaderProps) {
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [userDisplayName, setUserDisplayName] = useState('')
	const [showUserMenu, setShowUserMenu] = useState(false)
	const [userData, setUserData] = useState<UserData | null>(null)
	const router = useRouter()

	useEffect(() => {
		// Check if user is authenticated and is admin
		const authData = localStorage.getItem('heydoc_auth')
		if (authData) {
			try {
				const userData = JSON.parse(authData) as UserData
				if (userData.role === 'admin') {
					setIsAuthenticated(true)
					setUserData(userData)
					
					// Create display name for admin
					if (userData.firstName && userData.lastName) {
						setUserDisplayName(`${userData.firstName} ${userData.lastName}`)
					} else {
						setUserDisplayName('Admin')
					}
				} else {
					// Not an admin, redirect to appropriate page
					router.push('/login')
				}
			} catch (error) {
				setIsAuthenticated(false)
				setUserDisplayName('')
				setUserData(null)
				router.push('/login')
			}
		} else {
			setIsAuthenticated(false)
			setUserDisplayName('')
			setUserData(null)
			router.push('/login')
		}
	}, [router])

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

	if (!isAuthenticated) {
		return null // Don't render anything while redirecting
	}

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
							alt="HeyDoc Admin"
							width={280}
							height={112}
							className="h-20 w-auto transition-all duration-300 group-hover:drop-shadow-lg cursor-pointer"
							priority
							unoptimized
						/>
					</Link>
					<div className="ml-6 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-lg shadow-lg border border-amber-400/20">
						<div className="flex items-center gap-2">
							<span>ADMIN</span>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-4 mr-4">
					{/* Admin User - Show dropdown menu */}
					<div className="relative">
						<button
							onClick={(e) => {
								e.stopPropagation()
								setShowUserMenu(!showUserMenu)
							}}
							className="flex items-center gap-3 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 font-medium transition-all duration-200 px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-600"
						>
							<div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
								<User className="w-3 h-3 text-white" />
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

						{/* Admin Dropdown Menu */}
						{showUserMenu && (
							<div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
								<div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
									<p className="text-sm font-medium text-slate-900">{userDisplayName}</p>
									<p className="text-xs text-amber-600 font-semibold mt-1 flex items-center">
										<div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
										Administrator
									</p>
								</div>
								<div className="py-1">
									<Link
										href="/admin/dashboard"
										className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
										onClick={() => setShowUserMenu(false)}
									>
										<User className="w-4 h-4 mr-3 text-amber-500" />
										Admin Dashboard
									</Link>
									<Link
										href="/admin/users"
										className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
										onClick={() => setShowUserMenu(false)}
									>
										<Users className="w-4 h-4 mr-3 text-amber-500" />
										Manage Users
									</Link>
									<div className="border-t border-slate-100 my-1"></div>
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
				</div>
			</div>
		</div>
	)
} 