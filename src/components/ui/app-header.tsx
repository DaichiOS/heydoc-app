'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface AppHeaderProps {
	showQuestions?: boolean
	showExit?: boolean
	exitHref?: string
	exitText?: string
}

export function AppHeader({ 
	showQuestions = true, 
	showExit = true, 
	exitHref = '/login',
	exitText = 'Exit'
}: AppHeaderProps) {
	const [showQuestionsTooltip, setShowQuestionsTooltip] = useState(false)

	return (
		<div className="bg-[#1C1B3A] border-b border-[#2A2951] shadow-lg">
			<div className="flex items-center justify-between px-6 py-6">
				<div className="flex items-center ml-8">
					<Image
						src="/animations/heydoc-white.gif"
						alt="HeyDoc"
						width={280}
						height={112}
						className="h-20 w-auto"
						priority
						unoptimized
					/>
				</div>
				<div className="flex items-center gap-4 mr-4">
					{showQuestions && (
						<div className="relative">
							<button 
								className="text-[#1C1B3A] hover:text-[#2A2951] font-medium transition-all duration-200 bg-white hover:bg-[#DBEAFE] px-4 py-2 rounded-lg border border-white hover:border-[#DBEAFE] shadow-sm hover:shadow-md transform hover:scale-105"
								onMouseEnter={() => setShowQuestionsTooltip(true)}
								onMouseLeave={() => setShowQuestionsTooltip(false)}
							>
								Questions?
							</button>
							
							{showQuestionsTooltip && (
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
									<div className="bg-white rounded-lg shadow-xl border border-slate-200 p-4 max-w-sm w-64 relative">
										<div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45"></div>
										<div className="relative">
											<h4 className="font-semibold text-slate-900 mb-2 text-sm">
												Need Help?
											</h4>
											<p className="text-slate-600 text-xs leading-relaxed">
												Contact our support team at{' '}
												<a 
													href="mailto:admin@heydochealth.com.au" 
													className="text-[#1C1B3A] font-medium hover:underline"
												>
													admin@heydochealth.com.au
												</a>
												{' '}if you have any questions.
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
					)}
					
					{showExit && (
						<Link 
							href={exitHref}
							className="text-[#1C1B3A] hover:text-white bg-white hover:bg-[#2A2951] font-medium transition-all duration-200 px-4 py-2 rounded-lg border border-white"
						>
							{exitText}
						</Link>
					)}
				</div>
			</div>
		</div>
	)
} 