'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export function RegistrationHeader() {
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
											Coming Soon!
										</h4>
										<p className="text-slate-600 text-xs leading-relaxed">
											Hey Albert, if you could think of some FAQ, etc that doctors may ask so we can put it here, that would be helpful. Thanks!
										</p>
									</div>
								</div>
							</div>
						)}
					</div>
					
					<Link 
						href="/login"
						className="text-[#1C1B3A] hover:text-white bg-white hover:bg-[#2A2951] font-medium transition-all duration-200 px-4 py-2 rounded-lg border border-white"
					>
						Exit
					</Link>
				</div>
			</div>
		</div>
	)
} 