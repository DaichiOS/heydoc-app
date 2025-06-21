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

interface Step2Props {
	formData: DoctorFormData
	updateFormData: (updates: Partial<DoctorFormData>) => void
	onNext: () => void
	onBack: () => void
}

export function DoctorRegistrationStep2({ formData, updateFormData, onNext, onBack }: Step2Props) {
	const [errors, setErrors] = useState<{ [key: string]: string }>({})

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {}

		if (!formData.ahpraNumber.trim()) {
			newErrors.ahpraNumber = 'AHPRA number is required'
		} else if (!/^[A-Z]{3}\d{10}$/.test(formData.ahpraNumber.trim())) {
			newErrors.ahpraNumber = 'AHPRA number must be in format: ABC1234567890'
		}

		if (!formData.ahpraRegistrationDate.trim()) {
			newErrors.ahpraRegistrationDate = 'AHPRA registration date is required'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleNext = () => {
		if (validateForm()) {
			onNext()
		}
	}

	const handleInputChange = (field: keyof DoctorFormData, value: string) => {
		updateFormData({ [field]: value })
		// Clear error when user starts typing
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
						AHPRA Registration Details
					</h1>
					<p className="text-slate-600">
						We need to verify your medical registration to ensure patient safety and compliance.
					</p>
				</div>

				{/* Form */}
				<div className="space-y-6">
					{/* AHPRA Number */}
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							AHPRA Registration Number *
						</label>
						<input
							type="text"
							value={formData.ahpraNumber}
							onChange={(e) => handleInputChange('ahpraNumber', e.target.value.toUpperCase())}
							className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1C1B3A] focus:border-transparent transition-all duration-200 ${
								errors.ahpraNumber ? 'border-red-500' : 'border-slate-300'
							}`}
							placeholder="e.g., MED1234567890"
						/>
						{errors.ahpraNumber && (
							<p className="mt-1 text-sm text-red-600">{errors.ahpraNumber}</p>
						)}
						<p className="mt-1 text-sm text-slate-500">
							Your AHPRA number can be found on your registration certificate
						</p>
					</div>

					{/* AHPRA Registration Date */}
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							AHPRA Registration Date *
						</label>
						<input
							type="date"
							value={formData.ahpraRegistrationDate}
							onChange={(e) => handleInputChange('ahpraRegistrationDate', e.target.value)}
							className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1C1B3A] focus:border-transparent transition-all duration-200 ${
								errors.ahpraRegistrationDate ? 'border-red-500' : 'border-slate-300'
							}`}
						/>
						{errors.ahpraRegistrationDate && (
							<p className="mt-1 text-sm text-red-600">{errors.ahpraRegistrationDate}</p>
						)}
						<p className="mt-1 text-sm text-slate-500">
							The date when your AHPRA registration was first issued
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
									Why we need this information
								</p>
								<p className="text-blue-700 text-sm">
									We verify all medical practitioners through AHPRA to ensure patient safety and maintain the highest standards of care in our fertility referral network.
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