'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface DoctorProfile {
	firstName: string
	lastName: string
	email: string
	phone: string
	specialty: string
	ahpraNumber: string
	ahpraRegistrationDate: string
	practiceName: string
	city: string
	state: string
	postcode: string
	experience: string
	status: 'pending' | 'approved' | 'rejected'
}

export default function DoctorProfilePage() {
	const [profile, setProfile] = useState<DoctorProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	useEffect(() => {
		const loadProfile = async () => {
			try {
				// Get auth data from localStorage (you'll improve this later)
				const authData = localStorage.getItem('heydoc_auth')
				if (!authData) {
					router.push('/login')
					return
				}

				const user = JSON.parse(authData)
				
				// Fetch doctor profile from API
				const response = await fetch(`/api/doctor/profile?userId=${user.id}`)
				const data = await response.json()
				
				if (data.success) {
					setProfile(data.profile)
				} else {
					console.error('Failed to load profile:', data.error)
				}
			} catch (error) {
				console.error('Error loading profile:', error)
			} finally {
				setLoading(false)
			}
		}

		loadProfile()
	}, [router])

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading your profile...</p>
				</div>
			</div>
		)
	}

	if (!profile) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-600">Failed to load profile</p>
					<button 
						onClick={() => router.push('/login')}
						className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Back to Login
					</button>
				</div>
			</div>
		)
	}

	const getStatusBadge = () => {
		switch (profile.status) {
			case 'pending':
				return (
					<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
						<div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
						Pending Review
					</span>
				)
			case 'approved':
				return (
					<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
						<div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
						Approved
					</span>
				)
			case 'rejected':
				return (
					<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
						<div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
						Rejected
					</span>
				)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div className="flex items-center">
							<Image
								src="/animations/heydoc.gif"
								alt="HeyDoc"
								width={200}
								height={80}
								className="h-12 w-auto"
								unoptimized
							/>
						</div>
						<button
							onClick={() => {
								localStorage.removeItem('heydoc_auth')
								router.push('/login')
							}}
							className="text-gray-500 hover:text-gray-700 font-medium"
						>
							Sign Out
						</button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Status Banner */}
				<div className="mb-8">
					<div className="bg-white rounded-lg shadow-sm border p-6">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-2xl font-bold text-gray-900 mb-2">
									Welcome, Dr. {profile.firstName} {profile.lastName}
								</h1>
								<p className="text-gray-600">
									Thank you for your application to join HeyDoc. 
									{profile.status === 'pending' && ' We are currently reviewing your submission.'}
								</p>
							</div>
							<div>
								{getStatusBadge()}
							</div>
						</div>
					</div>
				</div>

				{/* Application Details */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Personal Information */}
					<div className="bg-white rounded-lg shadow-sm border p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
						<div className="space-y-3">
							<div>
								<label className="text-sm font-medium text-gray-500">Full Name</label>
								<p className="text-gray-900">{profile.firstName} {profile.lastName}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">Email</label>
								<p className="text-gray-900">{profile.email}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">Phone</label>
								<p className="text-gray-900">{profile.phone}</p>
							</div>
						</div>
					</div>

					{/* Professional Information */}
					<div className="bg-white rounded-lg shadow-sm border p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
						<div className="space-y-3">
							<div>
								<label className="text-sm font-medium text-gray-500">Medical Specialty</label>
								<p className="text-gray-900 capitalize">{profile.specialty.replace('-', ' ')}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">AHPRA Number</label>
								<p className="text-gray-900">{profile.ahpraNumber}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">Registration Date</label>
								<p className="text-gray-900">{profile.ahpraRegistrationDate}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">Experience</label>
								<p className="text-gray-900">{profile.experience} years</p>
							</div>
						</div>
					</div>

					{/* Practice Information */}
					<div className="bg-white rounded-lg shadow-sm border p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">Practice Information</h2>
						<div className="space-y-3">
							<div>
								<label className="text-sm font-medium text-gray-500">Practice Name</label>
								<p className="text-gray-900">{profile.practiceName}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">Location</label>
								<p className="text-gray-900">{profile.city}, {profile.state} {profile.postcode}</p>
							</div>
						</div>
					</div>

					{/* Next Steps */}
					<div className="bg-white rounded-lg shadow-sm border p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h2>
						{profile.status === 'pending' && (
							<div className="space-y-3">
								<div className="flex items-start">
									<div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
										<div className="w-2 h-2 bg-blue-600 rounded-full"></div>
									</div>
									<div className="ml-3">
										<p className="text-sm text-gray-900 font-medium">Application Review</p>
										<p className="text-sm text-gray-600">Our team is reviewing your credentials and registration details.</p>
									</div>
								</div>
								<div className="flex items-start">
									<div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mt-1">
										<div className="w-2 h-2 bg-gray-400 rounded-full"></div>
									</div>
									<div className="ml-3">
										<p className="text-sm text-gray-500 font-medium">Approval & Setup</p>
										<p className="text-sm text-gray-500">Once approved, you'll receive instructions to complete your profile setup.</p>
									</div>
								</div>
							</div>
						)}
						
						{profile.status === 'approved' && (
							<div className="text-center py-4">
								<p className="text-green-600 font-medium mb-4">🎉 Congratulations! Your application has been approved.</p>
								<button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
									Complete Profile Setup
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
} 