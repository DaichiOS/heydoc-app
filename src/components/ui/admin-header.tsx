'use client'

import { useAuth } from '@/hooks/use-auth'
import { FileText, LogOut, Settings, User, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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
	const { user, isAuthenticated, isAdmin, logout } = useAuth()
	const [showUserMenu, setShowUserMenu] = useState(false)

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

	const handleLogout = async () => {
		setShowUserMenu(false)
		await logout()
	}

	// Don't render if not authenticated or not admin
	if (!isAuthenticated || !isAdmin()) {
		return null
	}

	const userDisplayName = user?.email?.split('@')[0] || 'Admin'

	return (
		<div className="bg-slate-900 border-b border-slate-800 shadow-lg">
			<div className="flex items-center justify-between px-6 py-6">
				<div className="flex items-center ml-8">
					<Link 
						href="/admin/dashboard" 
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
					{/* Quick Actions */}
					<div className="hidden md:flex items-center gap-2">
						<Link
							href="/admin/dashboard"
							className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 5a2 2 0 012-2h4a2 2 0 012 2v0" />
							</svg>
							<span>Dashboard</span>
						</Link>
						<Link
							href="/admin/applications"
							className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600"
						>
							<FileText className="w-4 h-4" />
							<span>Applications</span>
						</Link>
						<Link
							href="/admin/users"
							className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600"
						>
							<Users className="w-4 h-4" />
							<span>Users</span>
						</Link>
						<Link
							href="/admin/settings"
							className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600"
						>
							<Settings className="w-4 h-4" />
							<span>Settings</span>
						</Link>
					</div>
					
					{/* Admin User Menu */}
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
							<div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
															<div className="px-4 py-3 border-b border-slate-100">
								<p className="text-sm font-medium text-slate-900">{user?.email}</p>
								<p className="text-xs text-slate-500">Administrator</p>
							</div>
							
							<Link
								href="/admin/dashboard"
								className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
							>
								<svg className="w-4 h-4 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 5a2 2 0 012-2h4a2 2 0 012 2v0" />
								</svg>
								Dashboard
							</Link>
							
							<Link
								href="/admin/applications"
								className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
							>
								<FileText className="w-4 h-4 mr-3 text-slate-400" />
								View Applications
							</Link>
							
							<Link
								href="/admin/users"
								className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
							>
								<Users className="w-4 h-4 mr-3 text-slate-400" />
								Manage Users
							</Link>

							<Link
								href="/admin/settings"
								className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
							>
								<Settings className="w-4 h-4 mr-3 text-slate-400" />
								Settings
							</Link>
								
								<div className="border-t border-slate-100 mt-2 pt-2">
									<button
										onClick={logout}
										className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
									>
										<LogOut className="w-4 h-4 mr-3 text-red-500" />
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