'use client'

import { AppHeader } from '@/components/ui/app-header'
import { AlertCircle, Calendar, CheckCircle2, Clock, FileText, Mail, MapPin, Phone, Stethoscope, User, Users } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

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

export default function DoctorProfilePage() {
	const searchParams = useSearchParams()
	const [profile, setProfile] = useState<DoctorProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [userEmail, setUserEmail] = useState('')
	
	// Resend email state
	const [isResending, setIsResending] = useState(false)
	const [resendMessage, setResendMessage] = useState('')
	const [resendSuccess, setResendSuccess] = useState(false)

	// Get email from URL params or localStorage
	useEffect(() => {
		const emailFromUrl = searchParams.get('email')
		const emailFromStorage = typeof window !== 'undefined' ? localStorage.getItem('registrationEmail') : null
		
		if (emailFromUrl) {
			setUserEmail(emailFromUrl)
		} else if (emailFromStorage) {
			setUserEmail(emailFromStorage)
		}
	}, [searchParams])

	// Fetch doctor profile data
	useEffect(() => {
		const fetchProfile = async () => {
			if (!userEmail || userEmail === 'your-email@example.com') return

			try {
				setLoading(true)
				setError(null)

				// First, get the user ID from email
				const userResponse = await fetch(`/api/auth/user-by-email?email=${encodeURIComponent(userEmail)}`)
				if (!userResponse.ok) {
					throw new Error('User not found')
				}
				
				const userData = await userResponse.json()
				if (!userData.success || !userData.user) {
					throw new Error('User not found')
				}

				// Then fetch the doctor profile
				const profileResponse = await fetch(`/api/doctor/profile?userId=${userData.user.id}`)
				if (!profileResponse.ok) {
					throw new Error('Profile not found')
				}

				const profileData = await profileResponse.json()
				if (!profileData.success) {
					throw new Error(profileData.error || 'Failed to load profile')
				}

				setProfile(profileData.profile)
			} catch (err) {
				console.error('Error fetching profile:', err)
				setError(err instanceof Error ? err.message : 'Failed to load profile')
			} finally {
				setLoading(false)
			}
		}

		fetchProfile()
	}, [userEmail])

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
					description: 'Your credentials are being reviewed'
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
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
				<AppHeader showQuestions={true} showExit={true} exitHref="/" exitText="Back to Home" />
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C1B3A] mx-auto mb-4"></div>
						<p className="text-slate-600">Loading your profile...</p>
					</div>
				</div>
			</div>
		)
	}

	if (error || !profile) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
				<AppHeader showQuestions={true} showExit={true} exitHref="/" exitText="Back to Home" />
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="text-center max-w-md mx-auto px-6">
						<AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
						<h1 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h1>
						<p className="text-slate-600 mb-6">
							{error || 'Unable to load your profile. Please try again or contact support.'}
						</p>
						<button
							onClick={() => window.location.reload()}
							className="px-6 py-3 bg-[#1C1B3A] text-white rounded-lg hover:bg-[#2A2951] transition-colors"
						>
							Try Again
						</button>
					</div>
				</div>
			</div>
		)
	}

	const statusInfo = getStatusInfo(profile.status)

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
			<AppHeader showQuestions={true} showExit={true} exitHref="/" exitText="Back to Home" />
			
			<div className="max-w-7xl mx-auto px-6 py-8">
				{/* Header Section */}
				<div className="mb-8">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
						<div>
							<h1 className="text-3xl font-bold text-[#1C1B3A] mb-2">
								Dr. {profile.firstName} {profile.lastName}
							</h1>
							<p className="text-lg text-slate-600">
								{profile.specialty || 'Medical Professional'}
							</p>
						</div>
						
						{/* Status Badge */}
						<div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium ${statusInfo.color}`}>
							{statusInfo.icon}
							<span>{statusInfo.label}</span>
						</div>
					</div>
				</div>

				{/* Status Alert for pending states */}
				{profile.status === 'pending_email_verification' && (
					<div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
						<div className="flex items-start gap-4">
							<Mail className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
							<div className="flex-1">
								<h3 className="font-semibold text-amber-900 mb-2">Email Verification Required</h3>
								<p className="text-amber-800 mb-4">
									Please check your email and click the verification link to activate your account.
								</p>
								
								{/* Resend Message */}
								{resendMessage && (
									<div className={`mb-4 p-3 rounded-lg text-sm ${
										resendSuccess 
											? 'bg-green-100 text-green-800 border border-green-200'
											: 'bg-red-100 text-red-800 border border-red-200'
									}`}>
										{resendMessage}
									</div>
								)}

								<button
									onClick={handleResendEmail}
									disabled={isResending}
									className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-medium rounded-lg transition-colors duration-200"
								>
									<Mail className="w-4 h-4 mr-2" />
									{isResending ? 'Sending...' : 'Resend Email'}
								</button>
							</div>
						</div>
					</div>
				)}

				{profile.status === 'pending_review' && (
					<div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
						<div className="flex items-start gap-4">
							<Clock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
							<div className="flex-1">
								<h3 className="font-semibold text-blue-900 mb-2">Application Under Review</h3>
								<p className="text-blue-800">
									Thank you for completing your registration. Our team is currently reviewing your credentials and application. We'll notify you once the review is complete.
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Main Profile Content */}
				<div className="grid lg:grid-cols-3 gap-8">
					{/* Left Column - Personal & Contact Info */}
					<div className="lg:col-span-1 space-y-6">
						{/* Personal Information */}
						<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
							<h2 className="text-xl font-semibold text-[#1C1B3A] mb-4 flex items-center">
								<User className="w-5 h-5 mr-2" />
								Personal Information
							</h2>
							<div className="space-y-4">
								<div>
									<label className="text-sm font-medium text-slate-500">Full Name</label>
									<p className="text-slate-900 font-medium">{profile.firstName} {profile.lastName}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-slate-500">Email</label>
									<p className="text-slate-900">{profile.email}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-slate-500">Phone</label>
									<p className="text-slate-900 flex items-center">
										<Phone className="w-4 h-4 mr-2 text-slate-400" />
										{profile.phone}
									</p>
								</div>
								{(profile.city || profile.state || profile.postcode) && (
									<div>
										<label className="text-sm font-medium text-slate-500">Location</label>
										<p className="text-slate-900 flex items-center">
											<MapPin className="w-4 h-4 mr-2 text-slate-400" />
											{[profile.city, profile.state, profile.postcode].filter(Boolean).join(', ')}
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Professional Registration */}
						<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
							<h2 className="text-xl font-semibold text-[#1C1B3A] mb-4 flex items-center">
								<FileText className="w-5 h-5 mr-2" />
								Registration Details
							</h2>
							<div className="space-y-4">
								<div>
									<label className="text-sm font-medium text-slate-500">AHPRA Number</label>
									<p className="text-slate-900 font-mono">{profile.ahpraNumber}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-slate-500">Registration Year</label>
									<p className="text-slate-900 flex items-center">
										<Calendar className="w-4 h-4 mr-2 text-slate-400" />
										{new Date(profile.ahpraRegistrationDate).getFullYear()}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-slate-500">Years of Experience</label>
									<p className="text-slate-900">{profile.experience} years</p>
								</div>
							</div>
						</div>
					</div>

					{/* Right Column - Professional Details */}
					<div className="lg:col-span-2 space-y-6">
						{/* Medical Specialty */}
						<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
							<h2 className="text-xl font-semibold text-[#1C1B3A] mb-4 flex items-center">
								<Stethoscope className="w-5 h-5 mr-2" />
								Medical Specialty
							</h2>
							<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
								<p className="text-lg font-medium text-[#1C1B3A]">
									{profile.specialty || 'General Practice'}
								</p>
							</div>
						</div>

						{/* Application Status Timeline */}
						<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
							<h2 className="text-xl font-semibold text-[#1C1B3A] mb-4 flex items-center">
								<Users className="w-5 h-5 mr-2" />
								Application Progress
							</h2>
							<div className="space-y-4">
								{/* Step 1 - Email Verification */}
								<div className="flex items-center">
									<div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
										profile.status !== 'pending_email_verification' 
											? 'bg-green-500' 
											: 'bg-amber-500'
									}`}>
										{profile.status !== 'pending_email_verification' ? (
											<CheckCircle2 className="w-5 h-5 text-white" />
										) : (
											<Mail className="w-5 h-5 text-white" />
										)}
									</div>
									<div className="ml-4 flex-1">
										<h3 className="text-sm font-medium text-slate-900">Email Verification</h3>
										<p className="text-sm text-slate-500">Verify your email address</p>
									</div>
									<div className={`text-sm font-medium ${
										profile.status !== 'pending_email_verification' 
											? 'text-green-600' 
											: 'text-amber-600'
									}`}>
										{profile.status !== 'pending_email_verification' ? 'Completed' : 'Required'}
									</div>
								</div>

								{/* Step 2 - Credential Review */}
								<div className="flex items-center">
									<div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
										profile.status === 'approved' 
											? 'bg-green-500' 
											: profile.status === 'pending_review'
											? 'bg-blue-500'
											: 'bg-slate-300'
									}`}>
										{profile.status === 'approved' ? (
											<CheckCircle2 className="w-5 h-5 text-white" />
										) : profile.status === 'pending_review' ? (
											<Clock className="w-5 h-5 text-white animate-pulse" />
										) : (
											<FileText className="w-5 h-5 text-slate-500" />
										)}
									</div>
									<div className="ml-4 flex-1">
										<h3 className="text-sm font-medium text-slate-900">Credential Review</h3>
										<p className="text-sm text-slate-500">Our team will review your application and give you a call!</p>
									</div>
									<div className={`text-sm font-medium ${
										profile.status === 'approved' 
											? 'text-green-600' 
											: profile.status === 'pending_review'
											? 'text-blue-600'
											: 'text-slate-500'
									}`}>
										{profile.status === 'approved' ? 'Completed' : 
										 profile.status === 'pending_review' ? 'In Progress' : 'Pending'}
									</div>
								</div>

								{/* Step 3 - Account Activation */}
								<div className={`flex items-center ${profile.status !== 'approved' ? 'opacity-50' : ''}`}>
									<div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
										profile.status === 'approved' 
											? 'bg-green-500' 
											: 'bg-slate-300'
									}`}>
										<CheckCircle2 className={`w-5 h-5 ${
											profile.status === 'approved' ? 'text-white' : 'text-slate-500'
										}`} />
									</div>
									<div className="ml-4 flex-1">
										<h3 className="text-sm font-medium text-slate-900">Account Activation</h3>
										<p className="text-sm text-slate-500">Access to HeyDoc platform and patient consultations</p>
									</div>
									<div className={`text-sm font-medium ${
										profile.status === 'approved' ? 'text-green-600' : 'text-slate-500'
									}`}>
										{profile.status === 'approved' ? 'Active' : 'Pending'}
									</div>
								</div>
							</div>
						</div>

						{/* Next Steps */}
						<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
							<h2 className="text-xl font-semibold text-[#1C1B3A] mb-4">What's Next?</h2>
							{profile.status === 'pending_email_verification' ? (
								<div className="space-y-3 text-sm text-slate-700">
									<p className="flex items-start">
										<span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
										Check your email for the verification link
									</p>
									<p className="flex items-start">
										<span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
										Click "Accept Invitation" in the email
									</p>
									<p className="flex items-start">
										<span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
										Set up your permanent password
									</p>
								</div>
							) : profile.status === 'pending_review' ? (
								<div className="space-y-3 text-sm text-slate-700">
									<p className="flex items-start">
										<span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
										Our team is verifying your AHPRA registration
									</p>
									<p className="flex items-start">
										<span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
										We're reviewing your professional background and qualifications
									</p>
									<p className="flex items-start">
										<span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
										You'll receive an email notification once approved
									</p>
								</div>
							) : profile.status === 'approved' ? (
								<div className="space-y-3 text-sm text-slate-700">
									<p className="flex items-start">
										<span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
										Your account is now active and ready to use
									</p>
									<p className="flex items-start">
										<span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
										You can start accepting patient consultations
									</p>
									<p className="flex items-start">
										<span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
										Access your doctor dashboard to manage appointments
									</p>
								</div>
							) : (
								<p className="text-sm text-slate-700">
									Please contact our support team for assistance with your application.
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Support Section */}
				<div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold text-[#1C1B3A] mb-2">Need Help?</h3>
							<p className="text-slate-600">
								Have questions about your application or need to update your information?
							</p>
						</div>
						<a
							href="mailto:admin@heydochealth.com.au"
							className="inline-flex items-center px-6 py-3 bg-[#1C1B3A] hover:bg-[#2A2951] text-white font-medium rounded-lg transition-colors"
						>
							<Mail className="w-4 h-4 mr-2" />
							Contact Support
						</a>
					</div>
				</div>
			</div>
		</div>
	)
} 