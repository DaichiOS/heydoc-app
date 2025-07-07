'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function PatientRegistrationPage() {
	return (
		<div className="min-h-screen bg-white flex flex-col">
			{/* Header - Exact Airbnb Style */}
			<div className="flex items-center justify-between px-6 py-6">
				<div className="flex items-center">
					<Image
						src="/logos/heydoc.png"
						alt="HeyDoc"
						width={200}
						height={80}
						className="h-16 w-auto"
						priority
					/>
				</div>
				<div className="flex items-center gap-6">
					<button className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
						Questions?
					</button>
					<Link 
						href="/login"
						className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
					>
						Exit
					</Link>
				</div>
			</div>

			{/* Main Content - Full Screen */}
			<div className="flex-1 flex items-center justify-center px-6 py-12">
				<div className="w-full max-w-2xl text-center">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						Patient Registration
					</h1>
					<p className="text-xl text-gray-600 max-w-lg mx-auto mb-8">
						Coming soon! Patient registration will be available shortly.
					</p>
					<Link
						href="/register"
						className="inline-flex items-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors"
					>
						← Back to Registration
					</Link>
				</div>
			</div>

			{/* Footer - Exact Airbnb Navigation */}
			<div className="border-t border-gray-200 bg-white">
				<div className="max-w-none px-6 py-6">
					{/* Progress Bar - Thin like Airbnb */}
					<div className="mb-4">
						<div className="w-full bg-gray-200 rounded-full h-1">
							<div 
								className="bg-gray-800 h-1 rounded-full transition-all duration-300"
								style={{ width: '25%' }}
							/>
						</div>
					</div>
					
					{/* Navigation - Exact Airbnb Layout */}
					<div className="flex justify-between items-center">
						<Link
							href="/register"
							className="text-gray-700 hover:text-gray-900 font-medium underline transition-colors"
						>
							Back
						</Link>
						<div className="flex-1"></div>
					</div>
				</div>
			</div>
		</div>
	)
} 