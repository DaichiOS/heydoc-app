'use client'


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

export function DoctorRegistrationStep3({ 
	formData, 
	updateFormData, 
	onBack,
	onSubmit,
	isSubmitting
}: DoctorRegistrationStep3Props) {
	return (
		<div className="space-y-8">
			<div className="text-center">
				<h2 className="text-2xl font-semibold text-slate-900 mb-2">
					Additional Details
				</h2>
				<p className="text-slate-600">
					These details help us match you with the right opportunities. All fields are optional.
				</p>
			</div>

			<div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 space-y-6">
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
						disabled={isSubmitting}
						className="w-full bg-[#1C1B3A] text-white py-4 rounded-lg font-medium hover:bg-[#2A2951] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting ? 'Submitting...' : 'Complete'}
					</button>
				</div>
			</div>
		</div>
	)
} 