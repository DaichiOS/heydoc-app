'use client'

import { AdminHeader } from '@/components/ui/admin-header'
import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'

export default function AdminSettingsPage() {
	const { user, isLoading } = useAuth()
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [calendlyLink, setCalendlyLink] = useState('')
	const [phone, setPhone] = useState('')
	const [department, setDepartment] = useState('')
	const [title, setTitle] = useState('')
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [saved, setSaved] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!isLoading && user?.role === 'admin') {
			loadSettings()
		}
	}, [user, isLoading])

	const loadSettings = async () => {
		try {
			setLoading(true)
			const response = await fetch('/api/admin/settings')
			const data = await response.json()
			
			if (data.success && data.admin) {
				setFirstName(data.admin.firstName || '')
				setLastName(data.admin.lastName || '')
				setCalendlyLink(data.admin.calendlyLink || '')
				setPhone(data.admin.phone || '')
				setDepartment(data.admin.department || '')
				setTitle(data.admin.title || '')
			}
		} catch (error) {
			console.error('Error loading settings:', error)
			setError('Failed to load settings')
		} finally {
			setLoading(false)
		}
	}

	const handleSave = async () => {
		try {
			setSaving(true)
			setError(null)
			
			const response = await fetch('/api/admin/settings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					firstName: firstName.trim(),
					lastName: lastName.trim(),
					calendlyLink: calendlyLink.trim(),
					phone: phone.trim(),
					department: department.trim(),
					title: title.trim(),
				})
			})

			const data = await response.json()

			if (data.success) {
				setSaved(true)
				setTimeout(() => setSaved(false), 3000)
			} else {
				setError(data.error || 'Failed to save settings')
			}
		} catch (error) {
			console.error('Error saving settings:', error)
			setError('Failed to save settings')
		} finally {
			setSaving(false)
		}
	}

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white">
				<AdminHeader />
				<div className="container mx-auto px-4 py-8">
					<div className="animate-pulse">
						<div className="h-8 bg-slate-200 rounded w-48 mb-6"></div>
						<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30">
							<div className="space-y-6">
								<div className="h-4 bg-slate-200 rounded w-32"></div>
								<div className="h-10 bg-slate-200 rounded"></div>
								<div className="h-4 bg-slate-200 rounded w-32"></div>
								<div className="h-10 bg-slate-200 rounded"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!user || user.role !== 'admin') {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white">
				<AdminHeader />
				<div className="container mx-auto px-4 py-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
						<p className="text-slate-600">You don't have permission to access this page.</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white">
			<AdminHeader />
			
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-[#1C1B3A] mb-2">Admin Settings</h1>
					<p className="text-slate-600">Manage your admin profile and preferences</p>
				</div>

				<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 max-w-2xl">
					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-red-600 text-sm">{error}</p>
						</div>
					)}

					{saved && (
						<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
							<p className="text-green-600 text-sm">Settings saved successfully!</p>
						</div>
					)}

					<div className="space-y-6">
						{/* Personal Information */}
						<div>
							<h2 className="text-lg font-semibold text-[#1C1B3A] mb-4">Personal Information</h2>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										First Name *
									</label>
									<input
										type="text"
										value={firstName}
										onChange={(e) => setFirstName(e.target.value)}
										placeholder="Your first name"
										className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C1B3A]/20 focus:border-[#1C1B3A] transition-all duration-200 text-sm"
									/>
								</div>

								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Last Name
									</label>
									<input
										type="text"
										value={lastName}
										onChange={(e) => setLastName(e.target.value)}
										placeholder="Your last name"
										className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C1B3A]/20 focus:border-[#1C1B3A] transition-all duration-200 text-sm"
									/>
								</div>
							</div>
						</div>

						{/* Contact Information */}
						<div>
							<h2 className="text-lg font-semibold text-[#1C1B3A] mb-4">Contact Information</h2>
							
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Phone Number
									</label>
									<input
										type="tel"
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										placeholder="Your phone number"
										className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C1B3A]/20 focus:border-[#1C1B3A] transition-all duration-200 text-sm"
									/>
								</div>
							</div>
						</div>

						{/* Professional Information */}
						<div>
							<h2 className="text-lg font-semibold text-[#1C1B3A] mb-4">Professional Information</h2>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Department
									</label>
									<input
										type="text"
										value={department}
										onChange={(e) => setDepartment(e.target.value)}
										placeholder="Your department"
										className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C1B3A]/20 focus:border-[#1C1B3A] transition-all duration-200 text-sm"
									/>
								</div>

								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Job Title
									</label>
									<input
										type="text"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder="Your job title"
										className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C1B3A]/20 focus:border-[#1C1B3A] transition-all duration-200 text-sm"
									/>
								</div>
							</div>
						</div>

						{/* Interview Settings */}
						<div>
							<h2 className="text-lg font-semibold text-[#1C1B3A] mb-4">Interview Settings</h2>
							
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-2">
									Calendly Link
								</label>
								<input
									type="url"
									value={calendlyLink}
									onChange={(e) => setCalendlyLink(e.target.value)}
									placeholder="https://calendly.com/your-link"
									className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C1B3A]/20 focus:border-[#1C1B3A] transition-all duration-200 text-sm"
								/>
								<p className="text-xs text-slate-500 mt-1">
									This link will be included in interview invitation emails
								</p>
							</div>
						</div>

						{/* Save Button */}
						<div className="pt-4">
							<button
								onClick={handleSave}
								disabled={saving || loading}
								className="w-full px-6 py-3 bg-[#1C1B3A] text-white rounded-xl hover:bg-[#2A2951] transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
							>
								{saving ? 'Saving...' : 'Save Settings'}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
} 