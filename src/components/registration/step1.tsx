import { FormField } from '@/components/form/form-field'
import { MEDICAL_SPECIALTIES } from '@/lib/constants'
import type { FormData } from '@/types'

interface Step1Props {
	formData: FormData
	errors: Partial<FormData>
	updateFormData: (field: keyof FormData, value: string) => void
	onNext: () => void
}

export function Step1({ formData, errors, updateFormData, onNext }: Step1Props) {
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			onNext()
		}
	}

	return (
		<div className="flex-1 flex items-start justify-center px-6 pt-12 pb-6">
			<div className="max-w-2xl mx-auto w-full text-center">
				<div className="mb-6">
					<span className="text-[#1C1B3A]/60 text-lg font-medium">Step 1</span>
					<h1 className="text-3xl font-bold text-[#1C1B3A] mt-2 mb-3 font-['Karla']">
						Basic information
					</h1>
					<p className="text-base text-slate-600 font-['Karla']">
						Let's start with your name, contact details, and specialty.
					</p>
				</div>
				
				<div className="bg-blue-50/60 rounded-2xl p-8 shadow-lg border border-blue-100/80">
					<div className="space-y-5">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								label="First Name"
								name="firstName"
								placeholder="Enter your first name"
								value={formData.firstName}
								onChange={(value) => updateFormData('firstName', value)}
								onKeyDown={handleKeyDown}
								error={errors.firstName}
								required
							/>
							<FormField
								label="Last Name"
								name="lastName"
								placeholder="Enter your last name"
								value={formData.lastName}
								onChange={(value) => updateFormData('lastName', value)}
								onKeyDown={handleKeyDown}
								error={errors.lastName}
								required
							/>
						</div>
						
						<FormField
							label="Email Address"
							name="email"
							type="email"
							placeholder="Enter your email address"
							value={formData.email}
							onChange={(value) => updateFormData('email', value)}
							onKeyDown={handleKeyDown}
							error={errors.email}
							required
						/>
						
						<FormField
							label="Phone Number"
							name="phone"
							type="tel"
							placeholder="Enter your phone number"
							value={formData.phone}
							onChange={(value) => updateFormData('phone', value)}
							onKeyDown={handleKeyDown}
							error={errors.phone}
							required
						/>
						
						<FormField
							label="Medical Specialty"
							name="specialty"
							type="select"
							placeholder="Select your specialty"
							value={formData.specialty}
							onChange={(value) => updateFormData('specialty', value)}
							onKeyDown={handleKeyDown}
							error={errors.specialty}
							options={MEDICAL_SPECIALTIES}
							required
						/>
					</div>
				</div>
			</div>
		</div>
	)
} 