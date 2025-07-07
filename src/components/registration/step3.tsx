import { FormField } from '@/components/form/form-field'
import { EXPERIENCE_RANGES, TRAINING_LEVELS, WORK_SITUATIONS } from '@/lib/constants'
import type { FormData } from '@/types'

interface Step3Props {
	formData: FormData
	errors: Partial<FormData>
	updateFormData: (field: keyof FormData, value: string | string[]) => void
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
							label="Training Level"
							name="trainingLevel"
							type="select"
							placeholder="Select your training level"
							value={formData.trainingLevel}
							onChange={(value) => updateFormData('trainingLevel', value)}
							onKeyDown={handleKeyDown}
							error={errors.trainingLevel}
							options={TRAINING_LEVELS}
							required
						/>
						
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">
								Work Situation <span className="text-red-500">*</span>
							</label>
							<div className="border border-slate-200 rounded-xl bg-white p-4 max-h-64 overflow-y-auto">
								<div className="grid grid-cols-1 gap-3">
									{WORK_SITUATIONS.map((option: { value: string; label: string }) => (
										<label 
											key={option.value}
											className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
										>
											<input
												type="checkbox"
												checked={formData.workSituation.includes(option.value)}
												onChange={(e) => {
													if (e.target.checked) {
														updateFormData('workSituation', [...formData.workSituation, option.value])
													} else {
														updateFormData('workSituation', formData.workSituation.filter(s => s !== option.value))
													}
												}}
												className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
											/>
											<span className="text-slate-700 text-sm">{option.label}</span>
										</label>
									))}
								</div>
							</div>
							{formData.workSituation.length > 0 && (
								<div className="mt-3">
									<p className="text-xs text-slate-500 mb-2">Selected ({formData.workSituation.length}):</p>
									<div className="flex flex-wrap gap-2">
										{formData.workSituation.map((situation: string) => {
											const label = WORK_SITUATIONS.find((w: { value: string; label: string }) => w.value === situation)?.label || situation
											return (
												<span
													key={situation}
													className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
												>
													{label}
													<button
														type="button"
														onClick={() => {
															const updated = formData.workSituation.filter((s: string) => s !== situation)
															updateFormData('workSituation', updated)
														}}
														className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
													>
														×
													</button>
												</span>
											)
										})}
									</div>
								</div>
							)}
							{errors.workSituation && (
								<p className="text-red-500 text-sm mt-2 flex items-center gap-1">
									<span className="text-red-400">•</span> {errors.workSituation}
								</p>
							)}
						</div>
						
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