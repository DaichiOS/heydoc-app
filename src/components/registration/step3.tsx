import { FormField } from '@/components/form/form-field'
import { EXPERIENCE_RANGES } from '@/lib/constants'
import type { FormData } from '@/types'

interface Step3Props {
	formData: FormData
	errors: Partial<FormData>
	updateFormData: (field: keyof FormData, value: string) => void
	onSubmit: () => void
}

export function Step3({ formData, errors, updateFormData, onSubmit }: Step3Props) {
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			onSubmit()
		}
	}

	return (
		<div className="flex-1 flex items-start justify-center px-6 pt-12 pb-6">
			<div className="max-w-2xl mx-auto w-full text-center">
				<div className="mb-6">
					<span className="text-[#1C1B3A]/60 text-lg font-medium">Step 3</span>
					<h1 className="text-3xl font-bold text-[#1C1B3A] mt-2 mb-3 font-['Karla']">
						Experience and background
					</h1>
					<p className="text-base text-slate-600 font-['Karla']">
						Tell us about your professional background and experience.
					</p>
				</div>
				
				<div className="bg-blue-50/60 rounded-2xl p-8 shadow-lg border border-blue-100/80">
					<div className="space-y-5">
						<FormField
							label="Years of Experience"
							name="experience"
							type="select"
							placeholder="Select your experience level"
							value={formData.experience}
							onChange={(value) => updateFormData('experience', value)}
							onKeyDown={handleKeyDown}
							error={errors.experience}
							options={EXPERIENCE_RANGES}
						/>
						
						<FormField
							label="About Your Practice"
							name="practiceDescription"
							type="textarea"
							placeholder="Tell us a bit more about your practice and what you'd like to achieve with HeyDoc (optional)"
							value={formData.practiceDescription}
							onChange={(value) => updateFormData('practiceDescription', value)}
							onKeyDown={handleKeyDown}
							error={errors.practiceDescription}
						/>
					</div>
				</div>
			</div>
		</div>
	)
} 