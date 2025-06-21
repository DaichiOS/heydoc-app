'use client'

import { useState } from 'react'

interface DoctorFormData {
	firstName: string
	lastName: string
	email: string
	phone: string
	ahpraNumber: string
	ahpraRegistrationDate: string
	specialty: string
	practiceName: string
	practiceAddress: string
	practiceCity: string
	practiceState: string
	practicePostcode: string
	availability: string
	yearsOfExperience: string
	additionalInfo: string
}

interface Step1Props {
	formData: DoctorFormData
	updateFormData: (updates: Partial<DoctorFormData>) => void
	onNext: () => void
}

export function DoctorRegistrationStep1({ formData, updateFormData, onNext }: Step1Props) {
	const [errors, setErrors] = useState<Record<string, string>>({})

	const validateStep1 = () => {
		const newErrors: Record<string, string> = {}

		if (!formData.firstName.trim()) {
			newErrors.firstName = 'First name is required'
		}
		if (!formData.lastName.trim()) {
			newErrors.lastName = 'Last name is required'
		}
		if (!formData.email.trim()) {
			newErrors.email = 'Email is required'
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email address'
		}
		if (!formData.phone.trim()) {
			newErrors.phone = 'Phone number is required'
		} else if (!/^(\+61|0)[2-9]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
			newErrors.phone = 'Please enter a valid Australian phone number'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleNext = () => {
		if (validateStep1()) {
			onNext()
		}
	}

	const handleInputChange = (field: keyof DoctorFormData, value: string) => {
		updateFormData({ [field]: value })
		// Clear error for this field when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }))
		}
	}

	return (
		<div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
			<div className="space-y-6">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-semibold text-slate-900">
						Let's get to know you
					</h1>
					<p className="text-slate-600">
						Share some basic information to get started with your fertility referral journey.
					</p>
				</div>

				{/* Form */}
				<div className="space-y-6">
					{/* Name Fields */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">
								First Name *
							</label>
							<input
								type="text"
								value={formData.firstName}
								onChange={(e) => handleInputChange('firstName', e.target.value)}
								className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1C1B3A] focus:border-transparent transition-all duration-200 ${
									errors.firstName ? 'border-red-500' : 'border-slate-300'
								}`}
								placeholder="Enter your first name"
							/>
							{errors.firstName && (
								<p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">
								Last Name *
							</label>
							<input
								type="text"
								value={formData.lastName}
								onChange={(e) => handleInputChange('lastName', e.target.value)}
								className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1C1B3A] focus:border-transparent transition-all duration-200 ${
									errors.lastName ? 'border-red-500' : 'border-slate-300'
								}`}
								placeholder="Enter your last name"
							/>
							{errors.lastName && (
								<p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
							)}
						</div>
					</div>

					{/* Email */}
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Email Address *
						</label>
						<input
							type="email"
							value={formData.email}
							onChange={(e) => handleInputChange('email', e.target.value)}
							className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1C1B3A] focus:border-transparent transition-all duration-200 ${
								errors.email ? 'border-red-500' : 'border-slate-300'
							}`}
							placeholder="your.email@example.com"
						/>
						{errors.email && (
							<p className="mt-1 text-sm text-red-600">{errors.email}</p>
						)}
						<p className="mt-1 text-sm text-slate-500">
							We'll use this to send you important updates about your application
						</p>
					</div>

					{/* Phone */}
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Phone Number *
						</label>
						<input
							type="tel"
							value={formData.phone}
							onChange={(e) => handleInputChange('phone', e.target.value)}
							className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1C1B3A] focus:border-transparent transition-all duration-200 ${
								errors.phone ? 'border-red-500' : 'border-slate-300'
							}`}
							placeholder="0412 345 678"
						/>
						{errors.phone && (
							<p className="mt-1 text-sm text-red-600">{errors.phone}</p>
						)}
						<p className="mt-1 text-sm text-slate-500">
							Australian mobile or landline number
						</p>
					</div>

					{/* Info Box */}
					<div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
						<div className="flex items-start gap-3">
							<div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
								<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
								</svg>
							</div>
							<div>
								<p className="text-blue-800 font-medium mb-1">
									Quick and secure setup
								</p>
								<p className="text-blue-700 text-sm">
									Your information is securely stored and will only be used to verify your identity and facilitate fertility referrals through our platform.
								</p>
							</div>
						</div>
					</div>

					{/* Next Button */}
					<button
						onClick={handleNext}
						className="w-full bg-[#1C1B3A] hover:bg-[#252347] text-white py-4 px-6 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
					>
						Continue
					</button>
				</div>
			</div>
		</div>
	)
} 