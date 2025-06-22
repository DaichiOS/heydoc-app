import type { RegistrationStep, SubmissionState } from '@/types'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

interface RegistrationFooterProps {
	currentStep: RegistrationStep
	submission: SubmissionState
	onBack: () => void
	onNext: () => void
	onGetStarted: () => void
	onSubmit: () => void
}

export function RegistrationFooter({
	currentStep,
	submission,
	onBack,
	onNext,
	onGetStarted,
	onSubmit,
}: RegistrationFooterProps) {
	const steps = ['selection', 'intro', 'step1', 'step2', 'step3']
	const currentStepIndex = steps.indexOf(currentStep)

	const renderBackButton = () => {
		if (currentStep === 'selection') {
			return (
				<Link
					href="/login"
					className="text-[#1C1B3A] hover:text-[#2A2951] font-medium underline transition-colors cursor-pointer"
				>
					Back to login
				</Link>
			)
		}

		return (
			<button
				onClick={onBack}
				className="text-[#1C1B3A] hover:text-[#2A2951] font-medium underline transition-colors cursor-pointer"
			>
				Back
			</button>
		)
	}

	const renderActionButton = () => {
		if (currentStep === 'selection') {
			return <div className="h-12 w-24"></div>
		}

		if (currentStep === 'intro') {
			return (
				<button
					onClick={onGetStarted}
					className="bg-[#1C1B3A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2A2951] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
				>
					Get Started
				</button>
			)
		}

		if (currentStep === 'step1' || currentStep === 'step2') {
			return (
				<button
					onClick={onNext}
					className="bg-[#1C1B3A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2A2951] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
				>
					Next
				</button>
			)
		}

		if (currentStep === 'step3') {
			return (
				<button
					onClick={onSubmit}
					disabled={submission.isSubmitting}
					className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-3 ${
						submission.isSubmitting
							? 'bg-slate-400 cursor-not-allowed'
							: 'bg-[#1C1B3A] hover:bg-[#2A2951] cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105'
					} text-white`}
				>
					{submission.isSubmitting ? (
						<>
							<Loader2 className="w-5 h-5 animate-spin" />
							Confirming...
						</>
					) : (
						'Complete'
					)}
				</button>
			)
		}

		return null
	}

	return (
		<div className="bg-[#DBEAFE]/80 backdrop-blur-sm mt-auto relative">
			<div className="absolute top-0 left-0 right-0 flex gap-1 w-full px-2">
				{Array.from({ length: 5 }, (_, index) => {
					const isActive = index <= currentStepIndex
					return (
						<div
							key={index}
							className={`flex-1 h-1 transition-all duration-300 ${
								isActive ? 'bg-[#1C1B3A]' : 'bg-slate-300'
							}`}
						/>
					)
				})}
			</div>
			<div className="max-w-none px-6 py-8">
				<div className="flex justify-between items-center min-h-[48px]">
					{renderBackButton()}
					<div className="flex-1"></div>
					{renderActionButton()}
				</div>
			</div>
		</div>
	)
} 