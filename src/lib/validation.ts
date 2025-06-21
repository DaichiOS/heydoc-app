import type { FormData } from '@/types'

export function validateStep1(formData: FormData): Partial<FormData> {
	const errors: Partial<FormData> = {}
	
	if (!formData.firstName.trim()) errors.firstName = 'First name is required'
	if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
	if (!formData.email.trim()) errors.email = 'Email is required'
	else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email'
	if (!formData.phone.trim()) errors.phone = 'Phone number is required'
	if (!formData.specialty) errors.specialty = 'Please select your specialty'
	
	if (!formData.password.trim()) errors.password = 'Password is required'
	else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters'
	else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
		errors.password = 'Password must contain uppercase, lowercase, and number'
	}
	
	if (!formData.confirmPassword.trim()) errors.confirmPassword = 'Please confirm your password'
	else if (formData.password !== formData.confirmPassword) {
		errors.confirmPassword = 'Passwords do not match'
	}
	
	return errors
}

export function validateStep2(formData: FormData): Partial<FormData> {
	const errors: Partial<FormData> = {}
	
	if (!formData.ahpraNumber.trim()) errors.ahpraNumber = 'AHPRA number is required'
	if (!formData.ahpraRegistrationDate) errors.ahpraRegistrationDate = 'Registration date is required'
	if (!formData.practiceName.trim()) errors.practiceName = 'Practice name is required'
	if (!formData.practiceAddress.trim()) errors.practiceAddress = 'Practice address is required'
	if (!formData.city.trim()) errors.city = 'City is required'
	if (!formData.state) errors.state = 'Please select a state'
	if (!formData.postcode.trim()) errors.postcode = 'Postcode is required'
	
	return errors
}

export function validateStep3(formData: FormData): Partial<FormData> {
	const errors: Partial<FormData> = {}
	
	if (!formData.yearsExperience) errors.yearsExperience = 'Please select years of experience'
	
	return errors
} 