import type { UserType } from '@/types'
import Image from 'next/image'

interface IntroStepProps {
	selectedType: UserType
}

export function IntroStep({ selectedType }: IntroStepProps) {
	if (selectedType === 'doctor') {
		return (
			<div className="flex-1 flex items-center justify-center px-6 py-12">
				<div className="max-w-7xl mx-auto w-full">
					<div className="grid lg:grid-cols-2 gap-32 items-center min-h-[700px]">
						<div className="space-y-8">
							<div className="space-y-0">
								<Image
									src="/logos/heydoc.png"
									alt="HeyDoc"
									width={700}
									height={210}
									className="h-40 lg:h-48 w-auto"
								/>
								<p className="text-3xl lg:text-4xl font-bold text-slate-700 font-['Karla'] leading-tight -mt-2">
									Access thousands of patients from a click of a button.
								</p>
							</div>
						</div>

						<div className="space-y-12 py-8">
							<div className="pb-10 border-b border-slate-200">
								<div className="flex items-start space-x-6">
									<div className="pt-1 flex-1">
										<div className="text-2xl font-semibold text-slate-900 mb-4 font-['Karla']">
											<span className="text-slate-400 mr-6 text-3xl font-light">1</span>
											Basic information
										</div>
										<p className="text-slate-600 leading-relaxed font-['Karla'] text-lg ml-12">
											Tell us about yourself and your medical practice.
										</p>
									</div>
								</div>
							</div>

							<div className="pb-10 border-b border-slate-200">
								<div className="flex items-start space-x-6">
									<div className="pt-1 flex-1">
										<div className="text-2xl font-semibold text-slate-900 mb-4 font-['Karla']">
											<span className="text-slate-400 mr-6 text-3xl font-light">2</span>
											Practice details
										</div>
										<p className="text-slate-600 leading-relaxed font-['Karla'] text-lg ml-12">
											Share your AHPRA registration and practice location details.
										</p>
									</div>
								</div>
							</div>

							<div className="pb-10">
								<div className="flex items-start space-x-6">
									<div className="pt-1 flex-1">
										<div className="text-2xl font-semibold text-slate-900 mb-4 font-['Karla']">
											<span className="text-slate-400 mr-6 text-3xl font-light">3</span>
											Experience & background
										</div>
										<p className="text-slate-600 leading-relaxed font-['Karla'] text-lg ml-12">
											Tell us about your experience and practice.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="flex-1 flex items-center justify-center px-6 py-12">
			<div className="max-w-4xl mx-auto text-center">
				<Image
					src="/logos/heydoc.png"
					alt="HeyDoc"
					width={400}
					height={120}
					className="h-32 w-auto mx-auto mb-8"
				/>
				<h1 className="text-4xl font-bold text-slate-900 mb-4">
					Get connected with fertility specialists
				</h1>
				<p className="text-xl text-slate-600">
					We'll help you find the right specialist through your GP
				</p>
			</div>
		</div>
	)
} 