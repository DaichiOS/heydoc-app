import type { UserType } from '@/types'
import { Stethoscope, User } from 'lucide-react'

interface SelectionStepProps {
	onTypeSelection: (type: UserType) => void
}

export function SelectionStep({ onTypeSelection }: SelectionStepProps) {
	return (
		<div className="flex-1 flex items-center justify-center px-6 py-8">
			<div className="w-full max-w-2xl">
				<h1 className="text-3xl font-semibold text-slate-900 mb-2">
					How would you like to use HeyDoc?
				</h1>
				<p className="text-slate-600 mb-8">
					Choose the option that best describes your role in fertility care.
				</p>

				<div className="space-y-4">
					<button
						onClick={() => onTypeSelection('doctor')}
						className="w-full p-6 border-2 border-slate-300 rounded-xl transition-all duration-200 text-left hover:border-[#1C1B3A] hover:bg-[#1C1B3A]/5 hover:shadow-lg cursor-pointer group"
					>
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-[#1C1B3A]/10 group-hover:bg-[#1C1B3A]/20 rounded-lg flex items-center justify-center transition-colors">
								<Stethoscope className="w-6 h-6 text-[#1C1B3A]" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#1C1B3A] transition-colors">
									I'm a Doctor
								</h3>
								<p className="text-slate-600 text-sm">
									Provide fertility referrals and streamline patient care
								</p>
							</div>
						</div>
					</button>

					<button
						onClick={() => onTypeSelection('patient')}
						className="w-full p-6 border-2 border-slate-300 rounded-xl transition-all duration-200 text-left hover:border-[#1C1B3A] hover:bg-[#1C1B3A]/5 hover:shadow-lg cursor-pointer group"
					>
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-[#1C1B3A]/10 group-hover:bg-[#1C1B3A]/20 rounded-lg flex items-center justify-center transition-colors">
								<User className="w-6 h-6 text-[#1C1B3A]" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#1C1B3A] transition-colors">
									I'm a Patient
								</h3>
								<p className="text-slate-600 text-sm">
									Get connected with fertility specialists through your GP
								</p>
							</div>
						</div>
					</button>
				</div>
			</div>
		</div>
	)
} 