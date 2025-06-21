import { FormField } from '@/components/form/form-field'
import { AUSTRALIAN_STATES } from '@/lib/constants'
import type { FormData } from '@/types'

interface Step2Props {
	formData: FormData
	errors: Partial<FormData>
	updateFormData: (field: keyof FormData, value: string) => void
}

export function Step2({ formData, errors, updateFormData }: Step2Props) {
	return (
		<div className="flex-1 flex items-start justify-center px-6 pt-12 pb-6">
			<div className="max-w-2xl mx-auto w-full text-center">
				<div className="mb-6">
					<span className="text-[#1C1B3A]/60 text-lg font-medium">Step 2</span>
					<h1 className="text-3xl font-bold text-[#1C1B3A] mt-2 mb-3 font-['Karla']">
						Practice details
					</h1>
					<p className="text-base text-slate-600 font-['Karla']">
						Your AHPRA registration and practice location details.
					</p>
				</div>
				
				<div className="bg-blue-50/60 rounded-2xl p-8 shadow-lg border border-blue-100/80">
					<div className="space-y-5">
						<FormField
							label="AHPRA Registration Number"
							name="ahpraNumber"
							placeholder="Enter your AHPRA registration number"
							value={formData.ahpraNumber}
							onChange={(value) => updateFormData('ahpraNumber', value)}
							error={errors.ahpraNumber}
							required
						/>
						
						<FormField
							label="AHPRA Registration Date"
							name="ahpraRegistrationDate"
							type="date"
							value={formData.ahpraRegistrationDate}
							onChange={(value) => updateFormData('ahpraRegistrationDate', value)}
							error={errors.ahpraRegistrationDate}
							helperText="When did you first register with AHPRA as a medical practitioner?"
						/>
						
						<FormField
							label="Practice Name"
							name="practiceName"
							placeholder="Enter your practice name"
							value={formData.practiceName}
							onChange={(value) => updateFormData('practiceName', value)}
							error={errors.practiceName}
						/>
						
						<FormField
							label="Practice Address"
							name="practiceAddress"
							placeholder="Enter your practice address"
							value={formData.practiceAddress}
							onChange={(value) => updateFormData('practiceAddress', value)}
							error={errors.practiceAddress}
						/>
						
						<div className="grid grid-cols-2 gap-4">
							<FormField
								label="City"
								name="city"
								placeholder="Enter city"
								value={formData.city}
								onChange={(value) => updateFormData('city', value)}
								error={errors.city}
							/>
							<FormField
								label="State"
								name="state"
								type="select"
								placeholder="Select state"
								value={formData.state}
								onChange={(value) => updateFormData('state', value)}
								error={errors.state}
								options={AUSTRALIAN_STATES}
							/>
						</div>
						
						<FormField
							label="Postcode"
							name="postcode"
							placeholder="Enter postcode"
							value={formData.postcode}
							onChange={(value) => updateFormData('postcode', value)}
							error={errors.postcode}
						/>
					</div>
				</div>
			</div>
		</div>
	)
} 