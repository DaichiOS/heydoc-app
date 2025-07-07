'use client'

import { AdminHeader } from '@/components/ui/admin-header'
import { useAuth } from '@/hooks/use-auth'
import { Calendar, Clock, FileText, Mail, Phone, User, X } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'

interface DoctorApplication {
	id: string
	firstName: string
	lastName: string
	email: string
	phone: string
	ahpraNumber: string
	medicalSpecialty: string | null
	status: string
	createdAt: Date | null
	updatedAt: Date | null
}

interface ApplicationsData {
	applications: DoctorApplication[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

function ApplicationsContent() {
	const { user, isAuthenticated, isAdmin, isLoading } = useAuth()
	const [applications, setApplications] = useState<DoctorApplication[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [totalApplications, setTotalApplications] = useState(0)
	
	// Modal state for scheduling interviews
	const [showScheduleModal, setShowScheduleModal] = useState(false)
	const [selectedDoctor, setSelectedDoctor] = useState<DoctorApplication | null>(null)
	const [calendlyLink, setCalendlyLink] = useState('https://calendly.com/your-link')
	const [adminName, setAdminName] = useState('')
	const [isScheduling, setIsScheduling] = useState(false)

	useEffect(() => {
		// Don't redirect while auth is still loading
		if (isLoading) return
		
		if (!isAuthenticated || !isAdmin) {
			window.location.href = '/login'
			return
		}

		fetchApplications()
	}, [isAuthenticated, isAdmin, isLoading])

	const fetchApplications = async () => {
		try {
			console.log('🔍 Fetching applications from API...')
			setLoading(true)
			const response = await fetch('/api/admin/applications')
			
			console.log('📡 API Response status:', response.status)
			console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))
			
			if (!response.ok) {
				const errorText = await response.text()
				console.error('❌ API Error response:', errorText)
				throw new Error(`Failed to fetch applications: ${response.status}`)
			}
			
			const data: ApplicationsData = await response.json()
			console.log('📊 API Response data:', data)
			console.log('📋 Applications received:', data.applications?.length || 0)
			console.log('📝 Applications details:', data.applications?.map(app => ({
				id: app.id,
				name: `${app.firstName} ${app.lastName}`,
				email: app.email,
				status: app.status
			})))
			
			setApplications(data.applications)
			setTotalApplications(data.pagination.total)
		} catch (err) {
			console.error('❌ Frontend error fetching applications:', err)
			setError('Failed to load applications')
		} finally {
			setLoading(false)
		}
	}

	const handleScheduleInterview = async (doctor: DoctorApplication) => {
		setSelectedDoctor(doctor)
		
		// Load admin profile and settings
		try {
			const response = await fetch('/api/admin/settings')
			if (response.ok) {
				const data = await response.json()
				if (data.success && data.admin) {
					// Set admin name from profile
					const fullName = `${data.admin.firstName || ''} ${data.admin.lastName || ''}`.trim()
					setAdminName(fullName || data.admin.firstName || 'Admin')
					
					// Set Calendly link if available
					if (data.admin.calendlyLink) {
						setCalendlyLink(data.admin.calendlyLink)
					}
				}
			}
		} catch (error) {
			console.error('Error loading admin profile:', error)
			// Fallback to user email if profile loading fails
			const defaultName = user?.email 
				? user.email.split('@')[0]
					.split('.')
					.map(part => part.charAt(0).toUpperCase() + part.slice(1))
					.join(' ')
				: 'Admin'
			setAdminName(defaultName)
		}
		
		setShowScheduleModal(true)
	}

	const confirmScheduleInterview = async () => {
		if (!selectedDoctor || !calendlyLink.trim()) return

		setIsScheduling(true)
		
		try {
			const response = await fetch('/api/admin/schedule-interview', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					doctorId: selectedDoctor.id,
					calendlyLink: calendlyLink.trim(),
					adminName: adminName.trim() || undefined
				})
			})

			const data = await response.json()

			if (data.success) {
				// Save admin name to profile if updated
				if (adminName.trim()) {
					try {
						const nameParts = adminName.trim().split(' ')
						const firstName = nameParts[0] || ''
						const lastName = nameParts.slice(1).join(' ') || ''
						
						await fetch('/api/admin/settings', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								firstName,
								lastName
							})
						})
					} catch (error) {
						console.error('Error saving admin name:', error)
						// Don't block the main flow if saving fails
					}
				}
				
				// Open mailto link
				window.location.href = data.mailtoLink
				
				// Update the application status locally (only if it wasn't already interview_scheduled)
				if (selectedDoctor.status !== 'interview_scheduled') {
					setApplications(prev => 
						prev.map(app => 
							app.id === selectedDoctor.id 
								? { ...app, status: 'interview_scheduled' }
								: app
						)
					)
				}
				
				// Close modal with a slight delay to allow email client to open
				setTimeout(() => {
					setShowScheduleModal(false)
					setSelectedDoctor(null)
					
					// Show success message
					const isResend = selectedDoctor.status === 'interview_scheduled'
					alert(isResend 
						? '✅ Interview email opened in your email client. Please review and send the email to the doctor.'
						: '✅ Interview scheduled! Email opened in your email client. Please review and send the email to the doctor.'
					)
				}, 500)
			} else {
				alert('Failed to schedule interview: ' + data.error)
			}
		} catch (error) {
			console.error('Error scheduling interview:', error)
			alert('Failed to schedule interview. Please try again.')
		} finally {
			setIsScheduling(false)
		}
	}

	if (isLoading) {
		return <ApplicationsLoadingSkeleton />
	}

	if (loading) {
		return <ApplicationsLoadingSkeleton />
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white">
				<AdminHeader />
				<div className="container mx-auto px-4 py-8">
					<div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6 shadow-xl">
						<h2 className="text-lg font-medium text-red-800 mb-2">
							Applications Error
						</h2>
						<p className="text-red-600">{error}</p>
					</div>
				</div>
			</div>
		)
	}

	// Determine status color and text
	const getStatusInfo = (status: string) => {
		switch (status) {
			case 'email_unconfirmed':
				return { 
					color: 'bg-amber-100/80 text-amber-800', 
					text: 'Email Verification Pending',
					description: 'Waiting for email confirmation'
				}
			case 'pending':
				return { 
					color: 'bg-blue-100/80 text-blue-800', 
					text: 'Ready for Review',
					description: 'Application ready for admin review'
				}
			case 'interview_scheduled':
				return { 
					color: 'bg-purple-100/80 text-purple-800', 
					text: 'Interview Scheduled',
					description: 'Interview has been scheduled with doctor'
				}
			case 'documentation_required':
				return { 
					color: 'bg-orange-100/80 text-orange-800', 
					text: 'Documentation Required',
					description: 'Additional documents needed from doctor'
				}
			case 'active':
				return { 
					color: 'bg-green-100/80 text-green-800', 
					text: 'Approved & Active',
					description: 'Doctor has been approved and is active'
				}
			case 'rejected':
				return { 
					color: 'bg-red-100/80 text-red-800', 
					text: 'Rejected',
					description: 'Application has been rejected'
				}
			case 'suspended':
				return { 
					color: 'bg-gray-100/80 text-gray-800', 
					text: 'Suspended',
					description: 'Doctor account has been suspended'
				}
			default:
				return { 
					color: 'bg-slate-100/80 text-slate-800', 
					text: status,
					description: 'Unknown status'
				}
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white">
			<AdminHeader />
			
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-[#1C1B3A]">
						Doctor Applications
					</h1>
					<p className="text-slate-600 mt-2">
						Review and manage pending doctor applications ({totalApplications} total)
					</p>
				</div>

				{applications.length === 0 ? (
					<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-12 text-center">
						<FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-[#1C1B3A] mb-2">No Pending Applications</h3>
						<p className="text-slate-500">
							All doctor applications have been processed.
						</p>
					</div>
				) : (
					<div className="grid gap-6">
						{applications.map((application: DoctorApplication) => {
							const statusInfo = getStatusInfo(application.status)
							
							return (
								<div key={application.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
									<div className="flex items-start justify-between mb-4">
										<div className="flex items-center space-x-4">
											<div className="w-12 h-12 bg-[#1C1B3A]/10 rounded-full flex items-center justify-center">
												<User className="w-6 h-6 text-[#1C1B3A]" />
											</div>
											<div>
												<h3 className="text-lg font-semibold text-[#1C1B3A]">
													{application.firstName && application.lastName 
														? `Dr. ${application.firstName} ${application.lastName}`
														: application.email
													}
												</h3>
												<p className="text-sm text-slate-500">{application.email}</p>
											</div>
										</div>
										<div className="flex items-center space-x-3">
											<span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
												{statusInfo.text}
											</span>
											<div className="flex items-center text-xs text-slate-500">
												<Clock className="w-3 h-3 mr-1" />
												{application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}
											</div>
										</div>
									</div>

									{/* Doctor Details */}
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50/50 rounded-lg">
										{application.ahpraNumber && (
											<div>
												<p className="text-sm font-medium text-slate-700">AHPRA Number</p>
												<p className="text-sm text-[#1C1B3A] font-medium">{application.ahpraNumber}</p>
											</div>
										)}
										{application.medicalSpecialty && (
											<div>
												<p className="text-sm font-medium text-slate-700">Specialty</p>
												<p className="text-sm text-[#1C1B3A] font-medium">{application.medicalSpecialty}</p>
											</div>
										)}
										{application.phone && (
											<div>
												<p className="text-sm font-medium text-slate-700">Phone</p>
												<p className="text-sm text-[#1C1B3A] font-medium">{application.phone}</p>
											</div>
										)}
									</div>

									{/* Action Buttons */}
									<div className="flex flex-wrap gap-3">
										{application.status === 'pending' && (
											<>
												<button className="inline-flex items-center px-4 py-2 bg-[#1C1B3A] text-white rounded-lg hover:bg-[#2A2951] transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105">
													<User className="w-4 h-4 mr-2" />
													Approve Application
												</button>
												<button 
													onClick={() => handleScheduleInterview(application)}
													className="inline-flex items-center px-4 py-2 bg-[#1C1B3A] text-white rounded-lg hover:bg-[#2A2951] transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
												>
													<Calendar className="w-4 h-4 mr-2" />
													Schedule Interview
												</button>
												<button className="inline-flex items-center px-4 py-2 bg-[#1C1B3A] text-white rounded-lg hover:bg-[#2A2951] transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105">
													<FileText className="w-4 h-4 mr-2" />
													Request Documentation
												</button>
												<button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105">
													Reject Application
												</button>
											</>
										)}
										
										{application.status === 'interview_scheduled' && (
											<>
												<button className="inline-flex items-center px-4 py-2 bg-[#1C1B3A] text-white rounded-lg hover:bg-[#2A2951] transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105">
													<User className="w-4 h-4 mr-2" />
													Approve After Interview
												</button>
												<button 
													onClick={() => handleScheduleInterview(application)}
													className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
												>
													<Mail className="w-4 h-4 mr-2" />
													Resend Interview Email
												</button>
												<button className="inline-flex items-center px-4 py-2 bg-[#1C1B3A] text-white rounded-lg hover:bg-[#2A2951] transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105">
													<FileText className="w-4 h-4 mr-2" />
													Request Documentation
												</button>
												<button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105">
													Reject Application
												</button>
											</>
										)}
										
										{application.status === 'documentation_required' && (
											<>
												<button className="inline-flex items-center px-4 py-2 bg-[#1C1B3A] text-white rounded-lg hover:bg-[#2A2951] transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105">
													<User className="w-4 h-4 mr-2" />
													Approve Application
												</button>
												<button 
													onClick={() => handleScheduleInterview(application)}
													className="inline-flex items-center px-4 py-2 bg-[#1C1B3A] text-white rounded-lg hover:bg-[#2A2951] transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
												>
													<Calendar className="w-4 h-4 mr-2" />
													Schedule Interview
												</button>
												<button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105">
													Reject Application
												</button>
											</>
										)}
										
										{/* Contact Actions - Always Available */}
										{application.phone && (
											<button className="inline-flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105">
												<Phone className="w-4 h-4 mr-2" />
												Call Doctor
											</button>
										)}
										<button className="inline-flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105">
											<Mail className="w-4 h-4 mr-2" />
											Send Email
										</button>
									</div>
								</div>
							)
						})}
					</div>
				)}
			</div>

			{/* Schedule Interview Modal */}
			{showScheduleModal && selectedDoctor && (
				<div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-xl font-semibold text-[#1C1B3A]">
									{selectedDoctor.status === 'interview_scheduled' ? 'Resend Interview Email' : 'Schedule Interview'}
								</h3>
								<button 
									onClick={() => setShowScheduleModal(false)}
									className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
								>
									<X className="w-5 h-5" />
								</button>
							</div>
							
							<div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
								<p className="text-sm text-slate-600 mb-2">
									{selectedDoctor.status === 'interview_scheduled' ? 'Resending interview email to:' : 'Scheduling interview for:'}
								</p>
								<p className="font-semibold text-[#1C1B3A] text-lg">
									Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
								</p>
								<p className="text-sm text-slate-500">{selectedDoctor.email}</p>
							</div>

							{/* Email Process Explanation */}
							<div className="mb-6 p-4 bg-amber-50/50 rounded-xl border border-amber-100/50">
								<div className="flex items-start space-x-3">
									<Mail className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
									<div>
										<p className="text-sm font-medium text-amber-800 mb-1">
											How this works:
										</p>
										<p className="text-xs text-amber-700 leading-relaxed">
											This will open your email client with a pre-written interview invitation. You'll need to review and click "Send" to actually send the email to the doctor.
										</p>
									</div>
								</div>
							</div>

							<div className="space-y-5">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Calendly Link *
									</label>
									<input
										type="url"
										value={calendlyLink}
										onChange={(e) => setCalendlyLink(e.target.value)}
										placeholder="https://calendly.com/your-link"
										className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C1B3A]/20 focus:border-[#1C1B3A] transition-all duration-200 text-sm"
									/>
									<p className="text-xs text-slate-500 mt-1">
										This link will be included in the interview invitation email
									</p>
								</div>

								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Your Name
									</label>
									<input
										type="text"
										value={adminName}
										onChange={(e) => setAdminName(e.target.value)}
										placeholder="Enter your name for the email signature"
										className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C1B3A]/20 focus:border-[#1C1B3A] transition-all duration-200 text-sm"
									/>
									<p className="text-xs text-slate-500 mt-1">
										This name will be used in the email signature and saved for future use
									</p>
								</div>
							</div>

							<div className="flex gap-3 mt-8">
								<button
									onClick={() => setShowScheduleModal(false)}
									className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
								>
									Cancel
								</button>
								<button
									onClick={confirmScheduleInterview}
									disabled={!calendlyLink.trim() || isScheduling}
									className="flex-1 px-4 py-3 bg-[#1C1B3A] text-white rounded-xl hover:bg-[#2A2951] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
								>
									{isScheduling ? (
										<div className="flex items-center justify-center">
											<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
											Opening Email...
										</div>
									) : (
										<div className="flex items-center justify-center">
											<Mail className="w-4 h-4 mr-2" />
											Open Email Client
										</div>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

function ApplicationsLoadingSkeleton() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white">
			<div className="h-20 bg-slate-900 animate-pulse"></div>
			
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<div className="h-8 bg-slate-200/50 rounded w-64 mb-2 animate-pulse"></div>
					<div className="h-4 bg-slate-200/50 rounded w-96 animate-pulse"></div>
				</div>

				{/* Loading skeleton for applications */}
				<div className="grid gap-6">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6">
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 bg-slate-200/50 rounded-full animate-pulse"></div>
									<div>
										<div className="h-5 bg-slate-200/50 rounded w-48 mb-2 animate-pulse"></div>
										<div className="h-4 bg-slate-200/50 rounded w-64 animate-pulse"></div>
									</div>
								</div>
								<div className="flex items-center space-x-3">
									<div className="h-6 bg-slate-200/50 rounded-full w-24 animate-pulse"></div>
									<div className="h-4 bg-slate-200/50 rounded w-20 animate-pulse"></div>
								</div>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50/50 rounded-lg">
								{[...Array(3)].map((_, j) => (
									<div key={j}>
										<div className="h-4 bg-slate-200/50 rounded w-24 mb-1 animate-pulse"></div>
										<div className="h-4 bg-slate-200/50 rounded w-32 animate-pulse"></div>
									</div>
								))}
							</div>
							
							<div className="flex flex-wrap gap-3">
								{[...Array(4)].map((_, j) => (
									<div key={j} className="h-9 bg-slate-200/50 rounded-lg w-32 animate-pulse"></div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default function AdminApplicationsPage() {
	return (
		<Suspense fallback={<ApplicationsLoadingSkeleton />}>
			<ApplicationsContent />
		</Suspense>
	)
} 