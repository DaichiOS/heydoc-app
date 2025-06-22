import type { FormData } from '@/types'

export function validateStep1(formData: FormData): Partial<FormData> {
	const errors: Partial<FormData> = {}
	
	if (!formData.firstName.trim()) errors.firstName = 'First name is required'
	if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
	if (!formData.email.trim()) errors.email = 'Email is required'
	else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email'
	if (!formData.phone.trim()) errors.phone = 'Phone number is required'
	if (!formData.specialty) errors.specialty = 'Please select your specialty'
	
	return errors
}

export function validateStep2(formData: FormData): Partial<FormData> {
	const errors: Partial<FormData> = {}
	
	if (!formData.ahpraNumber.trim()) errors.ahpraNumber = 'AHPRA number is required'
	if (!formData.ahpraRegistrationDate.trim()) {
		errors.ahpraRegistrationDate = 'Registration year is required'
	} else if (!/^\d{4}$/.test(formData.ahpraRegistrationDate)) {
		errors.ahpraRegistrationDate = 'Please enter a valid year (e.g., 2015)'
	}
	
	return errors
}

export function validateStep3(formData: FormData): Partial<FormData> {
	const errors: Partial<FormData> = {}
	
	if (!formData.experience) errors.experience = 'Please select years of experience'
	
	return errors
} 