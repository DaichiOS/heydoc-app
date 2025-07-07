'use client'

import { encodeEmailToken } from '@/lib/utils/token'
import { validateStep1, validateStep2, validateStep3, type ValidationErrors } from '@/lib/validation'
import type { FormData, RegistrationStep, SubmissionState, UserType } from '@/types'
import { useState } from 'react'

const initialFormData: FormData = {
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	specialty: '',
	customSpecialty: '',
	ahpraNumber: '',
	ahpraRegistrationDate: '',
	practiceName: '',
	experience: '',
	practiceDescription: '',
	trainingLevel: '',
	workSituation: [],
}

const initialSubmission: SubmissionState = {
	isSubmitting: false,
	showModal: false,
	success: false,
	message: '',
}

export function useRegistrationForm() {
	const [currentStep, setCurrentStep] = useState<RegistrationStep>('selection')
	const [selectedType, setSelectedType] = useState<UserType>(() => {
		// Restore from localStorage if available (with Safari compatibility)
		if (typeof window !== 'undefined') {
			try {
				const stored = localStorage.getItem('registrationSelectedType')
				console.log('🔍 Restoring selectedType from localStorage:', stored)
				if (stored === 'doctor' || stored === 'patient') {
					return stored
				}
			} catch (error) {
				console.error('❌ localStorage access failed (possibly Safari private mode):', error)
			}
		}
		return null
	})
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [formData, setFormData] = useState<FormData>(initialFormData)
	const [errors, setErrors] = useState<ValidationErrors>({})
	const [submission, setSubmission] = useState<SubmissionState>(initialSubmission)

	const handleTransition = (nextStep: RegistrationStep) => {
		setIsTransitioning(true)
		setTimeout(() => {
			setCurrentStep(nextStep)
			setIsTransitioning(false)
		}, 300)
	}

	const handleTypeSelection = (type: UserType) => {
		console.log('🔍 Type selected:', type)
		setSelectedType(type)
		// Persist to localStorage (with Safari error handling)
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('registrationSelectedType', type || '')
				console.log('✅ Type saved to localStorage:', type)
			} catch (error) {
				console.error('❌ Failed to save to localStorage (possibly Safari private mode):', error)
			}
		}
		setTimeout(() => {
			handleTransition('intro')
		}, 500)
	}

	const updateFormData = (field: keyof FormData, value: string | string[]) => {
		setFormData(prev => ({ ...prev, [field]: value }))
		// Clear error for updated field
		if (errors[field as keyof ValidationErrors]) {
			setErrors(prev => ({ ...prev, [field]: undefined }))
		}
	}

	const validateCurrentStep = () => {
		let newErrors: ValidationErrors = {}
		
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
		
		// Comprehensive debug logging for Safari/browser-specific debugging
		console.log('🔍 Debug - Browser info:', {
			userAgent: navigator.userAgent,
			localStorage: typeof window !== 'undefined' ? !!window.localStorage : false,
			isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
		})
		console.log('🔍 Debug - selectedType:', selectedType)
		console.log('🔍 Debug - currentStep:', currentStep)
		console.log('🔍 Debug - formData:', formData)
		console.log('🔍 Debug - localStorage registrationType:', 
			typeof window !== 'undefined' ? localStorage.getItem('registrationSelectedType') : 'N/A'
		)
		
		// Safeguard: If selectedType is null (due to page refresh or direct access),
		// and we're past the selection step, default to 'doctor'
		const registrationType = selectedType || (currentStep !== 'selection' ? 'doctor' : null)
		
		if (!registrationType) {
			console.error('❌ No registration type selected')
			setSubmission({
				isSubmitting: false,
				showModal: true,
				success: false,
				message: 'Please select whether you are registering as a doctor or patient.',
			})
			handleTransition('selection')
			return
		}
		
		console.log('🔍 Debug - Using registration type:', registrationType)
		
		try {
			setSubmission({
				isSubmitting: true,
				showModal: true,
				success: false,
				message: '',
			})
			
			const requestBody = {
				type: registrationType,
				...formData,
			}
			
			console.log('🔍 Debug - Request body being sent:', requestBody)
			
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			})
			
			console.log('🔍 Debug - Response status:', response.status)
			console.log('🔍 Debug - Response headers:', Object.fromEntries(response.headers.entries()))
			
			if (response.ok) {
				const data = await response.json()
				
				// For email verification flow, store email and redirect with loading state
				if (data.requiresEmailVerification && data.email) {
					// Store email in localStorage for the profile page
					if (typeof window !== 'undefined') {
						localStorage.setItem('registrationEmail', data.email)
						// Clear registration type after successful registration
						localStorage.removeItem('registrationSelectedType')
					}
					
					// Show redirect loading state
					setSubmission({
						isSubmitting: false,
						showModal: true,
						success: true,
						message: '',
						redirecting: true,
					})
					
					// Generate token from email and redirect after a brief delay for user experience
					const emailToken = encodeEmailToken(data.email)
					setTimeout(() => {
						window.location.href = `/verify-email/${emailToken}`
					}, 1500) // 1.5 second delay to show the loading state with GIF
				} else {
					setSubmission({
						isSubmitting: false,
						showModal: true,
						success: true,
						message: data.message || 'Registration successful!',
					})
				}
			} else {
				const error = await response.json()
				console.error('❌ Registration failed with status:', response.status)
				console.error('❌ Error details:', error)
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