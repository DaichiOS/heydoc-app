'use client'

import { AppHeader } from '@/components/ui/app-header'
import { AlertCircle, Award, BookOpen, Building, Camera, CheckCircle2, Clock, Clock4, Edit3, FileText, Languages, Mail, MapPin, Phone, Settings, Shield, Stethoscope, User } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

interface DoctorProfile {
	firstName: string
	lastName: string
	email: string
	phone: string
	specialty: string
	ahpraNumber: string
	ahpraRegistrationDate: string
	city: string
	state: string
	postcode: string
	experience: string
	status: 'pending_email_verification' | 'pending_review' | 'approved' | 'rejected'
	// Additional fields from the database
	dateOfBirth?: string
	addressStreet?: string
	addressCountry?: string
	currentRegistrationStatus?: string
	qualifications?: string[]
	currentRoles?: string[]
	languagesSpoken?: string[]
	consultationTypes?: string[]
}

type UserStatus = 'pending_email_verification' | 'pending_review' | 'approved' | 'rejected'

// Component that uses useSearchParams - wrapped in Suspense
function DoctorProfileContent() {
	const searchParams = useSearchParams()
	const [profile, setProfile] = useState<DoctorProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [userEmail, setUserEmail] = useState('')
	const [editMode, setEditMode] = useState<string | null>(null) // Track which section is being edited
	
	// Resend email state
	const [isResending, setIsResending] = useState(false)
	const [resendMessage, setResendMessage] = useState('')
	const [resendSuccess, setResendSuccess] = useState(false)

	// Fetch doctor profile data
	useEffect(() => {
		const fetchProfile = async () => {
			// Get email from auth data first (most reliable)
			let email = ''
			const authData = localStorage.getItem('heydoc_auth')
			if (authData) {
				try {
					const userData = JSON.parse(authData)
					email = userData.email
				} catch (error) {
					console.error('Error parsing auth data:', error)
				}
			}
			
			// Fallback to URL params or localStorage
			if (!email) {
				const emailFromUrl = searchParams.get('email')
				const emailFromStorage = localStorage.getItem('registrationEmail')
				email = emailFromUrl || emailFromStorage || ''
			}

			if (!email || email === 'your-email@example.com') {
				setError('No email found. Please log in again.')
				setLoading(false)
				return
			}

			try {
				setLoading(true)
				setError(null)

				// Single optimized API call using email
				const response = await fetch(`/api/doctor/profile?email=${encodeURIComponent(email)}`)
				if (!response.ok) {
					throw new Error('Profile not found')
				}

				const data = await response.json()
				if (!data.success) {
					throw new Error(data.error || 'Failed to load profile')
				}

				setProfile(data.profile)
				setUserEmail(email) // Set email for resend functionality
			} catch (err) {
				console.error('Error fetching profile:', err)
				setError(err instanceof Error ? err.message : 'Failed to load profile')
			} finally {
				setLoading(false)
			}
		}

		fetchProfile()
	}, [searchParams]) // Remove userEmail dependency to prevent re-fetching

	const handleResendEmail = async () => {
		if (isResending || !userEmail || userEmail === 'your-email@example.com') return

		setIsResending(true)
		setResendMessage('')
		setResendSuccess(false)

		try {
			const response = await fetch('/api/auth/resend-confirmation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: userEmail }),
			})

			const data = await response.json()

			if (response.ok) {
				setResendSuccess(true)
				setResendMessage(data.message || 'Verification email sent successfully!')
			} else {
				setResendSuccess(false)
				setResendMessage(data.error || 'Failed to resend email. Please try again.')
			}
		} catch (error) {
			console.error('Resend email error:', error)
			setResendSuccess(false)
			setResendMessage('Failed to resend email. Please try again.')
		} finally {
			setIsResending(false)
		}
	}

	const getStatusInfo = (status: UserStatus) => {
		switch (status) {
			case 'pending_email_verification':
				return {
					label: 'Email Verification Required',
					color: 'bg-amber-100 text-amber-800 border-amber-200',
					icon: <Mail className="w-4 h-4" />,
					description: 'Please verify your email to continue'
				}
			case 'pending_review':
				return {
					label: 'Under Review',
					color: 'bg-blue-100 text-blue-800 border-blue-200',
					icon: <Clock className="w-4 h-4" />,
					description: 'Our team is currently taking a look at your application'
				}
			case 'approved':
				return {
					label: 'Approved',
					color: 'bg-green-100 text-green-800 border-green-200',
					icon: <CheckCircle2 className="w-4 h-4" />,
					description: 'Your account is active'
				}
			case 'rejected':
				return {
					label: 'Requires Attention',
					color: 'bg-red-100 text-red-800 border-red-200',
					icon: <AlertCircle className="w-4 h-4" />,
					description: 'Please contact support'
				}
			default:
				return {
					label: 'Processing',
					color: 'bg-slate-100 text-slate-800 border-slate-200',
					icon: <Clock className="w-4 h-4" />,
					description: 'Processing your application'
				}
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C1B3A] mx-auto mb-4"></div>
					<p className="text-slate-600">Loading your profile...</p>
				</div>
			</div>
		)
	}

	if (error || !profile) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center max-w-md mx-auto px-6">
					<AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
					<h1 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h1>
					<p className="text-slate-600 mb-6">
						{error || 'Unable to load your profile. Please try again or contact support.'}
					</p>
					<button
						onClick={() => window.location.reload()}
						className="px-6 py-3 bg-[#1C1B3A] hover:bg-[#2A2951] text-white font-medium rounded-lg transition-colors"
					>
						Try Again
					</button>
				</div>
			</div>
		)
	}

	const statusInfo = getStatusInfo(profile.status)

	return (
		<div className="min-h-screen bg-slate-50">
			<AppHeader />
			
			<div className="max-w-7xl mx-auto px-6 py-8">
				{/* Header Section with Profile Picture */}
				<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
					<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
						<div className="flex items-center space-x-6">
							{/* Profile Picture */}
							<div className="relative group">
								<div className="w-24 h-24 bg-gradient-to-br from-[#1C1B3A] to-[#2A2951] rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
									{profile.firstName?.[0]}{profile.lastName?.[0]}
								</div>
								<button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
									<Camera className="w-6 h-6 text-white" />
								</button>
							</div>
							
							{/* Name and Title */}
							<div>
								<h1 className="text-3xl font-bold text-slate-900">
									Dr. {profile.firstName} {profile.lastName}
								</h1>
								<p className="text-lg text-slate-600 mt-1">{profile.specialty}</p>
								<div className="flex items-center mt-2 space-x-4">
									<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
										<Stethoscope className="w-4 h-4 mr-1" />
										{profile.experience} years experience
									</span>
									<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
										<Award className="w-4 h-4 mr-1" />
										AHPRA: {profile.ahpraNumber}
									</span>
								</div>
							</div>
						</div>
						
						{/* Status Badge */}
						<div className={`rounded-lg border p-4 ${statusInfo.color}`}>
							<div className="flex items-center space-x-3">
								{statusInfo.icon}
								<div>
									<h3 className="font-semibold">{statusInfo.label}</h3>
									<p className="text-sm opacity-90">{statusInfo.description}</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Progress Timeline */}
				<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
					<h2 className="text-lg font-semibold text-slate-900 mb-6">Application Progress</h2>
					<div className="flex items-center justify-between">
						{/* Email Verification */}
						<div className="flex flex-col items-center text-center">
							<div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
								['pending_review', 'approved'].includes(profile.status) 
									? 'bg-green-500 text-white' 
									: profile.status === 'pending_email_verification'
									? 'bg-amber-500 text-white'
									: 'bg-slate-300 text-slate-600'
							}`}>
								<Mail className="w-6 h-6" />
							</div>
							<span className="text-sm font-medium text-slate-900">Email Verified</span>
							<span className="text-xs text-slate-500 mt-1">Step 1</span>
						</div>

						<div className={`flex-1 h-1 mx-4 ${
							['pending_review', 'approved'].includes(profile.status) ? 'bg-green-500' : 'bg-slate-300'
						}`}></div>

						{/* Credential Review */}
						<div className="flex flex-col items-center text-center">
							<div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
								profile.status === 'approved'
									? 'bg-green-500 text-white' 
									: profile.status === 'pending_review'
									? 'bg-blue-500 text-white'
									: 'bg-slate-300 text-slate-600'
							}`}>
								<FileText className="w-6 h-6" />
							</div>
							<span className="text-sm font-medium text-slate-900">Credential Review</span>
							<span className="text-xs text-slate-500 mt-1">Step 2</span>
						</div>

						<div className={`flex-1 h-1 mx-4 ${
							profile.status === 'approved' ? 'bg-green-500' : 'bg-slate-300'
						}`}></div>

						{/* Approval */}
						<div className="flex flex-col items-center text-center">
							<div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
								profile.status === 'approved'
									? 'bg-green-500 text-white' 
									: 'bg-slate-300 text-slate-600'
							}`}>
								<CheckCircle2 className="w-6 h-6" />
							</div>
							<span className="text-sm font-medium text-slate-900">Approved</span>
							<span className="text-xs text-slate-500 mt-1">Step 3</span>
						</div>
					</div>
				</div>

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Personal & Contact */}
					<div className="lg:col-span-1 space-y-6">
						{/* Personal Information */}
						<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center space-x-3">
									<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
										<User className="w-5 h-5 text-blue-600" />
									</div>
									<h2 className="text-xl font-semibold text-slate-900">Personal Information</h2>
								</div>
								<button 
									onClick={() => setEditMode(editMode === 'personal' ? null : 'personal')}
									className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
								>
									<Edit3 className="w-4 h-4" />
								</button>
							</div>
							
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-slate-500">First Name</label>
										<p className="text-slate-900 mt-1">{profile.firstName}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-slate-500">Last Name</label>
										<p className="text-slate-900 mt-1">{profile.lastName}</p>
									</div>
								</div>
								
								<div>
									<label className="text-sm font-medium text-slate-500">Email Address</label>
									<p className="text-slate-900 flex items-center mt-1">
										<Mail className="w-4 h-4 mr-2 text-slate-400" />
										{profile.email}
									</p>
								</div>
								
								<div>
									<label className="text-sm font-medium text-slate-500">Phone Number</label>
									<p className="text-slate-900 flex items-center mt-1">
										<Phone className="w-4 h-4 mr-2 text-slate-400" />
										{profile.phone}
									</p>
								</div>
							</div>
						</div>

						{/* Address Information */}
						<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center space-x-3">
									<div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
										<MapPin className="w-5 h-5 text-emerald-600" />
									</div>
									<h2 className="text-xl font-semibold text-slate-900">Address</h2>
								</div>
								<button 
									onClick={() => setEditMode(editMode === 'address' ? null : 'address')}
									className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
								>
									<Edit3 className="w-4 h-4" />
								</button>
							</div>
							
							<div className="space-y-3">
								{profile.addressStreet && (
									<div>
										<label className="text-sm font-medium text-slate-500">Street Address</label>
										<p className="text-slate-900 mt-1">{profile.addressStreet}</p>
									</div>
								)}
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-slate-500">City</label>
										<p className="text-slate-900 mt-1">{profile.city}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-slate-500">State</label>
										<p className="text-slate-900 mt-1">{profile.state}</p>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-slate-500">Postcode</label>
										<p className="text-slate-900 mt-1">{profile.postcode}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-slate-500">Country</label>
										<p className="text-slate-900 mt-1">{profile.addressCountry || 'Australia'}</p>
									</div>
								</div>
							</div>
						</div>

						{/* Quick Actions */}
						<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
							<h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
							<div className="space-y-3">
								<button className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-lg transition-colors">
									<div className="flex items-center space-x-3">
										<Settings className="w-4 h-4 text-slate-400" />
										<span className="text-sm font-medium text-slate-700">Account Settings</span>
									</div>
									<span className="text-slate-400">→</span>
								</button>
								<button className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-lg transition-colors">
									<div className="flex items-center space-x-3">
										<Shield className="w-4 h-4 text-slate-400" />
										<span className="text-sm font-medium text-slate-700">Privacy Settings</span>
									</div>
									<span className="text-slate-400">→</span>
								</button>
								<button className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-lg transition-colors">
									<div className="flex items-center space-x-3">
										<FileText className="w-4 h-4 text-slate-400" />
										<span className="text-sm font-medium text-slate-700">Download Documents</span>
									</div>
									<span className="text-slate-400">→</span>
								</button>
							</div>
						</div>
					</div>

					{/* Right Column - Professional Information */}
					<div className="lg:col-span-2 space-y-6">
						{/* Professional Details */}
						<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center space-x-3">
									<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
										<Stethoscope className="w-5 h-5 text-purple-600" />
									</div>
									<h2 className="text-xl font-semibold text-slate-900">Professional Information</h2>
								</div>
								<button 
									onClick={() => setEditMode(editMode === 'professional' ? null : 'professional')}
									className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
								>
									<Edit3 className="w-4 h-4" />
								</button>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="text-sm font-medium text-slate-500">Medical Specialty</label>
									<p className="text-slate-900 mt-1 font-medium">{profile.specialty}</p>
								</div>
								
								<div>
									<label className="text-sm font-medium text-slate-500">Years of Experience</label>
									<p className="text-slate-900 mt-1">{profile.experience} years</p>
								</div>
								
								<div>
									<label className="text-sm font-medium text-slate-500">AHPRA Number</label>
									<p className="text-slate-900 mt-1 font-mono">{profile.ahpraNumber}</p>
								</div>
								
								<div>
									<label className="text-sm font-medium text-slate-500">Registration Year</label>
									<p className="text-slate-900 mt-1">{profile.ahpraRegistrationDate}</p>
								</div>
								
								{profile.currentRegistrationStatus && (
									<div className="md:col-span-2">
										<label className="text-sm font-medium text-slate-500">Registration Status</label>
										<p className="text-slate-900 mt-1">{profile.currentRegistrationStatus}</p>
									</div>
								)}
							</div>
						</div>

						{/* Qualifications & Languages */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Qualifications */}
							<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center space-x-3">
										<div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
											<BookOpen className="w-4 h-4 text-amber-600" />
										</div>
										<h3 className="text-lg font-semibold text-slate-900">Qualifications</h3>
									</div>
									<button className="p-1 text-slate-400 hover:text-slate-600 rounded">
										<Edit3 className="w-3 h-3" />
									</button>
								</div>
								<div className="space-y-2">
									{profile.qualifications && profile.qualifications.length > 0 ? (
										profile.qualifications.map((qual, index) => (
											<div key={index} className="flex items-center space-x-2">
												<div className="w-2 h-2 bg-amber-500 rounded-full"></div>
												<span className="text-sm text-slate-700">{qual}</span>
											</div>
										))
									) : (
										<p className="text-sm text-slate-500 italic">No qualifications added yet</p>
									)}
									<button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">
										+ Add Qualification
									</button>
								</div>
							</div>

							{/* Languages */}
							<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center space-x-3">
										<div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
											<Languages className="w-4 h-4 text-indigo-600" />
										</div>
										<h3 className="text-lg font-semibold text-slate-900">Languages</h3>
									</div>
									<button className="p-1 text-slate-400 hover:text-slate-600 rounded">
										<Edit3 className="w-3 h-3" />
									</button>
								</div>
								<div className="space-y-2">
									{profile.languagesSpoken && profile.languagesSpoken.length > 0 ? (
										profile.languagesSpoken.map((lang, index) => (
											<span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mr-2 mb-2">
												{lang}
											</span>
										))
									) : (
										<p className="text-sm text-slate-500 italic">No languages specified</p>
									)}
									<button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 block">
										+ Add Language
									</button>
								</div>
							</div>
						</div>

						{/* Current Roles & Consultation Types */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Current Roles */}
							<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center space-x-3">
										<div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
											<Building className="w-4 h-4 text-green-600" />
										</div>
										<h3 className="text-lg font-semibold text-slate-900">Current Roles</h3>
									</div>
									<button className="p-1 text-slate-400 hover:text-slate-600 rounded">
										<Edit3 className="w-3 h-3" />
									</button>
								</div>
								<div className="space-y-2">
									{profile.currentRoles && profile.currentRoles.length > 0 ? (
										profile.currentRoles.map((role, index) => (
											<div key={index} className="flex items-center space-x-2">
												<div className="w-2 h-2 bg-green-500 rounded-full"></div>
												<span className="text-sm text-slate-700">{role}</span>
											</div>
										))
									) : (
										<p className="text-sm text-slate-500 italic">No current roles specified</p>
									)}
									<button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">
										+ Add Role
									</button>
								</div>
							</div>

							{/* Consultation Types */}
							<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center space-x-3">
										<div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
											<Clock4 className="w-4 h-4 text-rose-600" />
										</div>
										<h3 className="text-lg font-semibold text-slate-900">Consultation Types</h3>
									</div>
									<button className="p-1 text-slate-400 hover:text-slate-600 rounded">
										<Edit3 className="w-3 h-3" />
									</button>
								</div>
								<div className="space-y-2">
									{profile.consultationTypes && profile.consultationTypes.length > 0 ? (
										profile.consultationTypes.map((type, index) => (
											<span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-800 mr-2 mb-2">
												{type}
											</span>
										))
									) : (
										<p className="text-sm text-slate-500 italic">No consultation types specified</p>
									)}
									<button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 block">
										+ Add Consultation Type
									</button>
								</div>
							</div>
						</div>

						{/* Email Verification Section */}
						{profile.status === 'pending_email_verification' && (
							<div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<Mail className="w-5 h-5 text-amber-600" />
										<div>
											<h3 className="font-semibold text-amber-900">Email Verification Required</h3>
											<p className="text-sm text-amber-700">Please check your email and click the verification link to continue.</p>
										</div>
									</div>
									
									<div className="flex items-center space-x-4">
										{resendMessage && (
											<div className={`text-sm px-3 py-1 rounded ${resendSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
												{resendMessage}
											</div>
										)}
										<button
											onClick={handleResendEmail}
											disabled={isResending}
											className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
										>
											{isResending ? 'Sending...' : 'Resend Email'}
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

function ProfileLoading() {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C1B3A] mx-auto mb-4"></div>
				<p className="text-slate-600">Loading profile...</p>
			</div>
		</div>
	)
}

export default function DoctorProfilePage() {
	return (
		<Suspense fallback={<ProfileLoading />}>
			<DoctorProfileContent />
		</Suspense>
	)
} 