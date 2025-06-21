import { CheckCircle2, Clock, FileText, Mail } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function DoctorPendingPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
			{/* Header */}
			<div className="bg-[#1C1B3A] border-b border-[#2A2951] shadow-lg">
				<div className="flex items-center justify-between px-6 py-6">
						<div className="flex items-center">
							<Image
								src="/logos/heydoc.png"
								alt="HeyDoc"
							width={280}
							height={112}
							className="h-20 w-auto"
								priority
							/>
						</div>
					<div className="flex items-center gap-4 mr-4">
						<span className="text-white/80 text-sm font-medium">Application Status</span>
						<div className="flex items-center gap-2 bg-amber-100/90 text-amber-800 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
								<Clock className="w-4 h-4" />
								Under Review
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex items-start justify-center px-6 pt-12 pb-6">
				<div className="max-w-4xl mx-auto w-full">
				{/* Status Card */}
					<div className="bg-blue-50/60 rounded-2xl shadow-lg border border-blue-100/80 p-12 mb-8">
					<div className="text-center mb-8">
							<div className="w-20 h-20 mx-auto bg-amber-100/80 rounded-full flex items-center justify-center mb-6">
							<Clock className="w-10 h-10 text-amber-600" />
						</div>
							<h1 className="text-3xl font-bold text-[#1C1B3A] mb-4 font-['Karla']">
							Application Under Review
						</h1>
							<p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-['Karla']">
							Thank you for applying to join HeyDoc! We've received your application and our team is currently reviewing your credentials.
						</p>
					</div>

					{/* Timeline */}
					<div className="max-w-2xl mx-auto">
						<div className="space-y-6">
							{/* Step 1 - Complete */}
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
										<CheckCircle2 className="w-5 h-5 text-white" />
									</div>
								</div>
								<div className="ml-4 flex-1">
									<h3 className="text-sm font-medium text-slate-900">Application Submitted</h3>
									<p className="text-sm text-slate-500">Your application has been successfully received</p>
								</div>
								<div className="text-sm text-slate-500">
									Completed
								</div>
							</div>

							{/* Step 2 - In Progress */}
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
										<Clock className="w-5 h-5 text-white animate-pulse" />
									</div>
								</div>
								<div className="ml-4 flex-1">
									<h3 className="text-sm font-medium text-slate-900">Credential Verification</h3>
									<p className="text-sm text-slate-500">We're verifying your AHPRA registration and professional details</p>
								</div>
								<div className="text-sm text-amber-600 font-medium">
									In Progress
								</div>
							</div>

							{/* Step 3 - Pending */}
							<div className="flex items-center opacity-50">
								<div className="flex-shrink-0">
									<div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
										<Mail className="w-5 h-5 text-slate-500" />
									</div>
								</div>
								<div className="ml-4 flex-1">
									<h3 className="text-sm font-medium text-slate-900">Account Activation</h3>
									<p className="text-sm text-slate-500">You'll receive login credentials via email once approved</p>
								</div>
								<div className="text-sm text-slate-500">
									Pending
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Information Cards */}
				<div className="grid md:grid-cols-2 gap-6 mb-8">
					{/* What's Next */}
						<div className="bg-blue-50/40 rounded-xl shadow-sm border border-blue-100/60 p-6">
						<div className="flex items-center mb-4">
								<div className="w-10 h-10 bg-blue-100/80 rounded-lg flex items-center justify-center">
								<FileText className="w-5 h-5 text-blue-600" />
							</div>
								<h3 className="text-lg font-semibold text-[#1C1B3A] ml-3 font-['Karla']">What's Next?</h3>
						</div>
						<ul className="space-y-3 text-sm text-slate-600">
							<li className="flex items-start">
								<div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
								<span>We'll verify your AHPRA registration details</span>
							</li>
							<li className="flex items-start">
								<div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
								<span>Our team will review your professional background</span>
							</li>
							<li className="flex items-start">
								<div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
								<span>You'll receive login credentials within 24-48 hours</span>
							</li>
						</ul>
					</div>

					{/* Contact Support */}
						<div className="bg-blue-50/40 rounded-xl shadow-sm border border-blue-100/60 p-6">
						<div className="flex items-center mb-4">
								<div className="w-10 h-10 bg-green-100/80 rounded-lg flex items-center justify-center">
								<Mail className="w-5 h-5 text-green-600" />
							</div>
								<h3 className="text-lg font-semibold text-[#1C1B3A] ml-3 font-['Karla']">Need Help?</h3>
						</div>
						<p className="text-sm text-slate-600 mb-4">
							Have questions about your application or need to update your information?
						</p>
						<a
							href="mailto:support@heydochealth.com.au"
							className="inline-flex items-center text-[#1C1B3A] hover:text-[#2A2951] font-medium text-sm transition-colors"
						>
							<Mail className="w-4 h-4 mr-2" />
							support@heydochealth.com.au
						</a>
					</div>
				</div>

				{/* Back to Home */}
				<div className="text-center">
					<Link
						href="/"
							className="inline-flex items-center text-slate-600 hover:text-[#1C1B3A] font-medium transition-colors"
					>
						← Back to Home
					</Link>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="bg-[#DBEAFE]/80 backdrop-blur-sm mt-auto">
				<div className="max-w-none px-6 py-6">
					<div className="flex justify-center items-center">
						<p className="text-slate-600 text-sm">
							Questions about your application? Contact us at{' '}
							<a
								href="mailto:support@heydochealth.com.au"
								className="text-[#1C1B3A] hover:text-[#2A2951] font-medium transition-colors"
							>
								support@heydochealth.com.au
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
} 