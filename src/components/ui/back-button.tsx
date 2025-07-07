'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface BackButtonProps {
	href: string
	label: string
	className?: string
}

export function BackButton({ href, label, className = '' }: BackButtonProps) {
	return (
		<Link
			href={href}
			className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur-sm hover:bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
		>
			<ChevronLeft className="w-4 h-4" />
			{label}
		</Link>
	)
} 