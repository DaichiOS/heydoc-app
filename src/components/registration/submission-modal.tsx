import type { SubmissionState } from '@/types'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SubmissionModalProps {
	submission: SubmissionState
	onClose: () => void
}

export function SubmissionModal({ submission, onClose }: SubmissionModalProps) {
	const router = useRouter()

	const handleClose = () => {
		onClose()
		if (submission.success) {
			router.push('/doctor/pending')
		}
	}

	if (!submission.showModal) return null

	return (
		<div className="flex-1 flex items-center justify-center px-6 py-12">
			<div className="max-w-2xl mx-auto w-full text-center">
				{submission.isSubmitting ? (
					<div className="bg-blue-50/60 rounded-2xl p-12 shadow-lg border border-blue-100/80">
						<div className="mb-8">
							<div className="w-20 h-20 mx-auto bg-[#DBEAFE] rounded-full flex items-center justify-center">
								<Loader2 className="w-10 h-10 text-[#1C1B3A] animate-spin" />
							</div>
						</div>
						<h3 className="text-3xl font-bold text-[#1C1B3A] mb-4 font-['Karla']">
							Processing Your Application
						</h3>
						<p className="text-slate-600 mb-6 text-lg leading-relaxed">
							We're creating your account and storing your information securely...
						</p>
						<div className="flex items-center justify-center space-x-2">
							<div className="w-3 h-3 bg-[#1C1B3A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
							<div className="w-3 h-3 bg-[#1C1B3A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
							<div className="w-3 h-3 bg-[#1C1B3A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
						</div>
					</div>
				) : (
					<div className="bg-blue-50/60 rounded-2xl p-12 shadow-lg border border-blue-100/80">
						<div className="mb-8">
							<div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
								submission.success ? 'bg-green-50' : 'bg-red-50'
							}`}>
								{submission.success ? (
									<CheckCircle className="w-10 h-10 text-green-600" />
								) : (
									<XCircle className="w-10 h-10 text-red-600" />
								)}
							</div>
						</div>
						
						<h3 className="text-3xl font-bold text-[#1C1B3A] mb-4 font-['Karla']">
							{submission.success ? 'Application Submitted!' : 'Submission Failed'}
						</h3>
						
						<p className="text-slate-600 mb-8 leading-relaxed text-lg">
							{submission.success ? (
								<>
									Thank you for applying to join HeyDoc! We've received your application and will review it within 24-48 hours.
									<br /><br />
									You'll receive an email with your login credentials once approved.
								</>
							) : (
								submission.message
							)}
						</p>
						
						<button
							onClick={handleClose}
							className="bg-[#1C1B3A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2A2951] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
						>
							{submission.success ? 'Continue' : 'Try Again'}
						</button>
					</div>
				)}
			</div>
		</div>
	)
} 