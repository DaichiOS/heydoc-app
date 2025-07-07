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
	trainingLevel: string
	workSituation: string[]
}

interface DoctorRegistrationStep3Props {
	formData: DoctorFormData
	updateFormData: (updates: Partial<DoctorFormData>) => void
	onBack: () => void
	onSubmit: () => void
	isSubmitting: boolean
}

const AUSTRALIAN_STATES = [
	{ value: '', label: 'Select State' },
	{ value: 'NSW', label: 'New South Wales' },
	{ value: 'VIC', label: 'Victoria' },
	{ value: 'QLD', label: 'Queensland' },
	{ value: 'WA', label: 'Western Australia' },
	{ value: 'SA', label: 'South Australia' },
	{ value: 'TAS', label: 'Tasmania' },
	{ value: 'ACT', label: 'Australian Capital Territory' },
	{ value: 'NT', label: 'Northern Territory' },
]

const MEDICAL_SPECIALTIES = [
	{ value: '', label: 'Select Specialty' },
	{ value: 'general-practice', label: 'General Practitioner' },
	{ value: 'other', label: 'Other' },
]

const TRAINING_LEVELS = [
	{ value: '', label: 'Select your training level' },
	{ value: 'specialist-gp', label: 'Specialist GP (Fellow of RACGP or ACRRM)' },
	{ value: 'non-gp-specialist', label: 'Non-GP Specialist (e.g. Fellow of RACP, RACS, etc.)' },
	{ value: 'specialist-in-training', label: 'Specialist in training (e.g. Registrar on a College training program)' },
	{ value: 'gp-in-training', label: 'General Practitioner in training (RACGP or ACRRM pathway)' },
	{ value: 'hospital-non-specialist', label: 'Hospital non-specialist doctor (e.g. Resident, Intern, or Career Medical Officer)' },
	{ value: 'img-toward-fellowship', label: 'International Medical Graduate (IMG) working toward fellowship' },
	{ value: 'other', label: 'Other' },
]

const WORK_SITUATIONS = [
	{ value: 'solely-consulting-here', label: 'Solely consulting here' },
	{ value: 'part-time-here', label: 'Part-time - here' },
	{ value: 'part-time-hospital', label: 'Part time - hospital' },
	{ value: 'part-time-clinic', label: 'Part time - clinic (eg. GP, urgent care)' },
	{ value: 'part-time-other-telehealth', label: 'Part time - other telehealth' },
	{ value: 'full-time-hospital', label: 'Full time – hospital' },
	{ value: 'full-time-clinic', label: 'Full time – clinic' },
	{ value: 'full-time-other-telehealth', label: 'Full time – other telehealth' },
	{ value: 'on-leave-reduced-load', label: 'On leave or reduced load' },
	{ value: 'studying-part-time', label: 'Studying part-time' },
	{ value: 'studying-full-time', label: 'Studying full-time' },
	{ value: 'other', label: 'Other' },
]

export function DoctorRegistrationStep3({ 
	formData, 
	updateFormData, 
	onBack,
	onSubmit,
	isSubmitting
}: DoctorRegistrationStep3Props) {
	const [showWorkSituationDropdown, setShowWorkSituationDropdown] = useState(false)

	const handleWorkSituationToggle = (value: string) => {
		const currentSituations = formData.workSituation || []
		const newSituations = currentSituations.includes(value)
			? currentSituations.filter(s => s !== value)
			: [...currentSituations, value]
		
		updateFormData({ workSituation: newSituations })
	}

	return (
		<div className="space-y-8">
			<div className="text-center">
				<h2 className="text-2xl font-semibold text-slate-900 mb-2">
					Professional Details
				</h2>
				<p className="text-slate-600">
					Help us understand your background to match you with the right opportunities.
				</p>
			</div>

			<div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 space-y-6">
				{/* Training Level */}
				<div>
					<label className="block text-sm font-medium text-slate-700 mb-2">
						What best describes your training level? <span className="text-red-500">*</span>
					</label>
					<select
						value={formData.trainingLevel}
						onChange={(e) => updateFormData({ trainingLevel: e.target.value })}
						className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1C1B3A] focus:border-transparent bg-white"
						required
					>
						{TRAINING_LEVELS.map(level => (
							<option key={level.value} value={level.value}>
								{level.label}
							</option>
						))}
					</select>
				</div>

				{/* Work Situation */}
				<div>
					<label className="block text-sm font-medium text-slate-700 mb-2">
						What best describes your current work situation? <span className="text-red-500">*</span>
					</label>
					<p className="text-xs text-slate-500 mb-3">Choose all that apply</p>
					
					<div className="relative">
						<button
							type="button"
							onClick={() => setShowWorkSituationDropdown(!showWorkSituationDropdown)}
							className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1C1B3A] focus:border-transparent bg-white text-left flex items-center justify-between"
						>
							<span className="text-slate-700">
								{formData.workSituation?.length > 0 
									? `${formData.workSituation.length} selected`
									: 'Select your work situation(s)'
								}
							</span>
							<svg className={`w-5 h-5 transition-transform ${showWorkSituationDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
						</button>
						
						{showWorkSituationDropdown && (
							<div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
								{WORK_SITUATIONS.map(situation => (
									<label key={situation.value} className="flex items-center px-4 py-3 hover:bg-slate-50 cursor-pointer">
										<input
											type="checkbox"
											checked={formData.workSituation?.includes(situation.value) || false}
											onChange={() => handleWorkSituationToggle(situation.value)}
											className="mr-3 h-4 w-4 text-[#1C1B3A] focus:ring-[#1C1B3A] border-slate-300 rounded"
										/>
										<span className="text-sm text-slate-700">{situation.label}</span>
									</label>
								))}
							</div>
						)}
					</div>
					
					{/* Show selected items */}
					{formData.workSituation?.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-2">
							{formData.workSituation.map(value => {
								const situation = WORK_SITUATIONS.find(s => s.value === value)
								return (
									<span key={value} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#1C1B3A] text-white">
										{situation?.label}
										<button
											type="button"
											onClick={() => handleWorkSituationToggle(value)}
											className="ml-2 text-white hover:text-slate-200"
										>
											×
										</button>
									</span>
								)
							})}
						</div>
					)}
				</div>

				{/* Years of Experience */}
				<div>
					<label className="block text-sm font-medium text-slate-700 mb-2">
						Years of Experience
					</label>
					<select
						value={formData.yearsOfExperience}
						onChange={(e) => updateFormData({ yearsOfExperience: e.target.value })}
						className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1C1B3A] focus:border-transparent bg-white"
					>
						<option value="">Select years of experience</option>
						<option value="0-2">0-2 years</option>
						<option value="3-5">3-5 years</option>
						<option value="6-10">6-10 years</option>
						<option value="11-15">11-15 years</option>
						<option value="16-20">16-20 years</option>
						<option value="20+">20+ years</option>
					</select>
				</div>

				{/* Availability */}
				<div>
					<label className="block text-sm font-medium text-slate-700 mb-2">
						Availability for Consultations
					</label>
					<select
						value={formData.availability}
						onChange={(e) => updateFormData({ availability: e.target.value })}
						className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1C1B3A] focus:border-transparent bg-white"
					>
						<option value="">Select your availability</option>
						<option value="mornings">Mornings</option>
						<option value="afternoons">Afternoons</option>
						<option value="evenings">Evenings</option>
						<option value="weekends">Weekends</option>
						<option value="flexible">Flexible</option>
					</select>
				</div>

				{/* Additional Information */}
				<div>
					<label className="block text-sm font-medium text-slate-700 mb-2">
						Tell us more about your practice
					</label>
					<textarea
						value={formData.additionalInfo}
						onChange={(e) => updateFormData({ additionalInfo: e.target.value })}
						placeholder="What would you like to achieve with HeyDoc? Any specific areas of interest or expertise?"
						rows={4}
						className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1C1B3A] focus:border-transparent resize-none"
					/>
				</div>

				{/* Submit Button */}
				<div className="pt-4">
					<button
						onClick={onSubmit}
						disabled={isSubmitting || !formData.trainingLevel || !formData.workSituation?.length}
						className="w-full bg-[#1C1B3A] text-white py-4 rounded-lg font-medium hover:bg-[#2A2951] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting ? 'Submitting...' : 'Complete Registration'}
					</button>
				</div>
			</div>
		</div>
	)
} 