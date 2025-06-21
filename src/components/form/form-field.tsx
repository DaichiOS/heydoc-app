interface FormFieldProps {
	label: string
	name: string
	type?: 'text' | 'email' | 'tel' | 'password' | 'date' | 'select' | 'textarea'
	placeholder?: string
	value: string
	onChange: (value: string) => void
	onKeyDown?: (e: React.KeyboardEvent) => void
	error?: string
	required?: boolean
	options?: Array<{ value: string; label: string }>
	rows?: number
	helperText?: string
}

export function FormField({
	label,
	name,
	type = 'text',
	placeholder,
	value,
	onChange,
	onKeyDown,
	error,
	required = false,
	options,
	rows = 4,
	helperText,
}: FormFieldProps) {
	const baseClasses = `w-full px-4 py-3.5 border rounded-xl bg-white transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-200/50 focus:border-blue-300 focus:shadow-md autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_white] ${
		error ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-blue-300/60 hover:shadow-sm'
	}`

	const renderInput = () => {
		if (type === 'select' && options) {
			return (
				<select
					name={name}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={onKeyDown}
					className={baseClasses}
				>
					<option value="">{placeholder}</option>
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			)
		}

		if (type === 'textarea') {
			return (
				<textarea
					name={name}
					placeholder={placeholder}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={(e) => {
						// Only trigger onKeyDown for Ctrl+Enter or Cmd+Enter in textarea
						if (onKeyDown && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
							onKeyDown(e)
						}
					}}
					rows={rows}
					className={`${baseClasses} resize-none`}
				/>
			)
		}

		return (
			<input
				type={type}
				name={name}
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={onKeyDown}
				className={baseClasses}
			/>
		)
	}

	return (
		<div>
			<label className="block text-sm font-medium text-slate-700 mb-2">
				{label} {required && '*'}
			</label>
			{renderInput()}
			{helperText && (
				<p className="text-xs text-slate-500 mt-1">{helperText}</p>
			)}
			{error && (
				<p className="text-red-500 text-sm mt-2 flex items-center gap-1">
					<span className="text-red-400">•</span> {error}
				</p>
			)}
		</div>
	)
} 