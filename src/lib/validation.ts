import type { FormData } from '@/types'

export interface ValidationErrors {
	firstName?: string
	lastName?: string
	email?: string
	phone?: string
	specialty?: string
	customSpecialty?: string
	ahpraNumber?: string
	ahpraRegistrationDate?: string
	practiceName?: string
	experience?: string
	practiceDescription?: string
	trainingLevel?: string
	workSituation?: string
}

export function validateStep1(formData: FormData): ValidationErrors {
	const errors: ValidationErrors = {}
	
	if (!formData.firstName.trim()) errors.firstName = 'First name is required'
	if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
	if (!formData.email.trim()) errors.email = 'Email is required'
	else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email'
	if (!formData.phone.trim()) errors.phone = 'Phone number is required'
	if (!formData.specialty) errors.specialty = 'Please select your specialty'
	if (formData.specialty === 'other' && !formData.customSpecialty.trim()) {
		errors.customSpecialty = 'Please specify your specialty'
	}
	
	return errors
}

export function validateStep2(formData: FormData): ValidationErrors {
	const errors: ValidationErrors = {}
	
	if (!formData.ahpraNumber.trim()) errors.ahpraNumber = 'AHPRA number is required'
	if (!formData.ahpraRegistrationDate.trim()) {
		errors.ahpraRegistrationDate = 'Registration year is required'
	} else if (!/^\d{4}$/.test(formData.ahpraRegistrationDate)) {
		errors.ahpraRegistrationDate = 'Please enter a valid year (e.g., 2015)'
	}
	
	return errors
}

export function validateStep3(formData: FormData): ValidationErrors {
	const errors: ValidationErrors = {}
	
	if (!formData.trainingLevel) errors.trainingLevel = 'Training level is required'
	if (!formData.workSituation || formData.workSituation.length === 0) {
		errors.workSituation = 'Please select at least one work situation'
	}
	
	return errors
} 