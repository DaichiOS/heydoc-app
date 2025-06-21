'use client'

import { IntroStep } from '@/components/registration/intro-step'
import { RegistrationFooter } from '@/components/registration/registration-footer'
import { RegistrationHeader } from '@/components/registration/registration-header'
import { SelectionStep } from '@/components/registration/selection-step'
import { Step1 } from '@/components/registration/step1'
import { Step2 } from '@/components/registration/step2'
import { Step3 } from '@/components/registration/step3'
import { SubmissionModal } from '@/components/registration/submission-modal'
import { useRegistrationForm } from '@/hooks/use-registration-form'

export default function RegisterPage() {
	const {
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
	} = useRegistrationForm()

	const handleBack = () => {
		if (currentStep === 'intro') handleTransition('selection')
		else if (currentStep === 'step1') handleTransition('intro')
		else if (currentStep === 'step2') handleTransition('step1')
		else if (currentStep === 'step3') handleTransition('step2')
	}

	const handleGetStarted = () => {
		handleTransition('step1')
	}

	const handleModalClose = () => {
		setSubmission({
			isSubmitting: false,
			showModal: false,
			success: false,
			message: '',
		})
	}

	const renderCurrentStep = () => {
		switch (currentStep) {
			case 'selection':
				return <SelectionStep onTypeSelection={handleTypeSelection} />
			case 'intro':
				return <IntroStep selectedType={selectedType} />
			case 'step1':
				return <Step1 formData={formData} errors={errors} updateFormData={updateFormData} />
			case 'step2':
				return <Step2 formData={formData} errors={errors} updateFormData={updateFormData} />
			case 'step3':
				return <Step3 formData={formData} errors={errors} updateFormData={updateFormData} />
			default:
				return null
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
			<RegistrationHeader />

			{submission.showModal ? (
				<SubmissionModal submission={submission} onClose={handleModalClose} />
			) : (
				<div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
					{renderCurrentStep()}
				</div>
			)}

			<RegistrationFooter
				currentStep={currentStep}
				submission={submission}
				onBack={handleBack}
				onNext={handleNext}
				onGetStarted={handleGetStarted}
				onSubmit={handleSubmit}
			/>
		</div>
	)
} 