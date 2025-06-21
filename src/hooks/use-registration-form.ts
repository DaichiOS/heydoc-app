'use client'

import { validateStep1, validateStep2, validateStep3 } from '@/lib/validation'
import type { FormData, RegistrationStep, SubmissionState, UserType } from '@/types'
import { useState } from 'react'

const initialFormData: FormData = {
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	specialty: '',
	password: '',
	confirmPassword: '',
	ahpraNumber: '',
	ahpraRegistrationDate: '',
	practiceName: '',
	city: '',
	state: '',
	postcode: '',
	experience: '',
	practiceDescription: '',
}

const initialSubmission: SubmissionState = {
	isSubmitting: false,
	showModal: false,
	success: false,
	message: '',
}

export function useRegistrationForm() {
	const [currentStep, setCurrentStep] = useState<RegistrationStep>('selection')
	const [selectedType, setSelectedType] = useState<UserType>(null)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [formData, setFormData] = useState<FormData>(initialFormData)
	const [errors, setErrors] = useState<Partial<FormData>>({})
	const [submission, setSubmission] = useState<SubmissionState>(initialSubmission)

	const handleTransition = (nextStep: RegistrationStep) => {
		setIsTransitioning(true)
		setTimeout(() => {
			setCurrentStep(nextStep)
			setIsTransitioning(false)
		}, 300)
	}

	const handleTypeSelection = (type: UserType) => {
		setSelectedType(type)
		setTimeout(() => {
			handleTransition('intro')
		}, 500)
	}

	const updateFormData = (field: keyof FormData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }))
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: undefined }))
		}
	}

	const validateCurrentStep = () => {
		let newErrors: Partial<FormData> = {}
		
		if (currentStep === 'step1') {
			newErrors = validateStep1(formData)
		} else if (currentStep === 'step2') {
			newErrors = validateStep2(formData)
		} else if (currentStep === 'step3') {
			newErrors = validateStep3(formData)
		}
		
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleNext = () => {
		if (!validateCurrentStep()) return

		if (currentStep === 'step1') {
			handleTransition('step2')
		} else if (currentStep === 'step2') {
			handleTransition('step3')
		}
	}

	const handleSubmit = async () => {
		if (!validateCurrentStep()) return
		
		try {
			setSubmission({
				isSubmitting: true,
				showModal: true,
				success: false,
				message: '',
			})
			
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					type: selectedType,
					...formData,
					confirmPassword: undefined,
				}),
			})
			
			if (response.ok) {
				setSubmission({
					isSubmitting: false,
					showModal: true,
					success: true,
					message: 'Registration submitted successfully! We\'ll be in touch soon.',
				})
			} else {
				const error = await response.json()
				setSubmission({
					isSubmitting: false,
					showModal: true,
					success: false,
					message: error.error || 'Registration failed. Please try again.',
				})
			}
		} catch (error) {
			console.error('Registration error:', error)
			setSubmission({
				isSubmitting: false,
				showModal: true,
				success: false,
				message: 'Registration failed. Please try again.',
			})
		}
	}

	const getProgressWidth = () => {
		switch (currentStep) {
			case 'selection': return '0%'
			case 'intro': return '20%'
			case 'step1': return '40%'
			case 'step2': return '70%'
			case 'step3': return '100%'
			default: return '0%'
		}
	}

	return {
		currentStep,
		selectedType,
		isTransitioning,
		formData,
		errors,
		submission,
		handleTransition,
		handleTypeSelection,
		updateFormData,
		handleNext,
		handleSubmit,
		setSubmission,
		getProgressWidth,
	}
} 