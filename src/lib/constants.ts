export const MEDICAL_SPECIALTIES = [
	// General Medicine
	{ value: 'general-practice', label: 'General Practice (GP)' },
	{ value: 'general-medicine', label: 'General Medicine (Physician)' },
	{ value: 'emergency-medicine', label: 'Emergency Medicine' },
	{ value: 'anaesthetics', label: 'Anaesthetics' },
	{ value: 'paediatrics', label: 'Paediatrics' },
	{ value: 'obstetrics-gynaecology', label: 'Obstetrics & Gynaecology (O&G)' },
	{ value: 'psychiatry', label: 'Psychiatry' },
	{ value: 'rehabilitation-pain-medicine', label: 'Rehabilitation & Pain Medicine' },
	{ value: 'radiology-imaging', label: 'Radiology / Imaging' },
	{ value: 'pathology-laboratory-medicine', label: 'Pathology / Laboratory Medicine' },
	{ value: 'intensive-care-medicine', label: 'Intensive Care Medicine (ICU)' },
	{ value: 'public-health-preventive-medicine', label: 'Public Health / Preventive Medicine' },
	{ value: 'occupational-environmental-medicine', label: 'Occupational & Environmental Medicine' },
	{ value: 'medical-administration', label: 'Medical Administration' },
	{ value: 'medical-education', label: 'Medical Education' },
	{ value: 'telehealth-virtual-care', label: 'Telehealth / Virtual Care' },
	
	// Surgical Specialties
	{ value: 'general-surgery', label: 'General Surgery' },
	{ value: 'orthopaedic-surgery', label: 'Orthopaedic Surgery' },
	{ value: 'neurosurgery', label: 'Neurosurgery' },
	{ value: 'urology', label: 'Urology' },
	{ value: 'plastic-reconstructive-surgery', label: 'Plastic & Reconstructive Surgery' },
	{ value: 'cardiothoracic-surgery', label: 'Cardiothoracic Surgery' },
	{ value: 'vascular-surgery', label: 'Vascular Surgery' },
	{ value: 'ent-otolaryngology', label: 'ENT (Otolaryngology – Head & Neck Surgery)' },
	{ value: 'paediatric-surgery', label: 'Paediatric Surgery' },
	
	// Other option
	{ value: 'other', label: 'Other' },
]

export const AUSTRALIAN_STATES = [
	{ value: 'NSW', label: 'NSW' },
	{ value: 'VIC', label: 'VIC' },
	{ value: 'QLD', label: 'QLD' },
	{ value: 'WA', label: 'WA' },
	{ value: 'SA', label: 'SA' },
	{ value: 'TAS', label: 'TAS' },
	{ value: 'ACT', label: 'ACT' },
	{ value: 'NT', label: 'NT' },
]

export const EXPERIENCE_RANGES = [
	{ value: '0-2', label: '0-2 years' },
	{ value: '3-5', label: '3-5 years' },
	{ value: '6-10', label: '6-10 years' },
	{ value: '11-15', label: '11-15 years' },
	{ value: '16-20', label: '16-20 years' },
	{ value: '20+', label: '20+ years' },
]

export const TRAINING_LEVELS = [
	{ value: 'specialist-gp', label: 'Specialist GP (Fellow of RACGP or ACRRM)' },
	{ value: 'non-gp-specialist', label: 'Non-GP Specialist (e.g. Fellow of RACP, RACS, etc.)' },
	{ value: 'specialist-training', label: 'Specialist in training (e.g. Registrar on a College training program)' },
	{ value: 'gp-training', label: 'General Practitioner in training (RACGP or ACRRM pathway)' },
	{ value: 'hospital-non-specialist', label: 'Hospital non-specialist doctor (e.g. Resident, Intern, or Career Medical Officer)' },
	{ value: 'img-fellow', label: 'International Medical Graduate (IMG) working toward fellowship' },
	{ value: 'other', label: 'Other' },
]

export const WORK_SITUATIONS = [
	{ value: 'solely-here', label: 'Exclusively consulting on HeyDoc' },
	{ value: 'part-time-here', label: 'Part-time - HeyDoc platform' },
	{ value: 'part-time-hospital', label: 'Part-time - Hospital setting' },
	{ value: 'part-time-clinic', label: 'Part-time - Private clinic (e.g., GP, urgent care)' },
	{ value: 'part-time-telehealth', label: 'Part-time - Other telehealth platforms' },
	{ value: 'full-time-hospital', label: 'Full-time - Hospital setting' },
	{ value: 'full-time-clinic', label: 'Full-time - Private clinic' },
	{ value: 'full-time-telehealth', label: 'Full-time - Other telehealth platforms' },
	{ value: 'on-leave', label: 'Currently on leave or reduced workload' },
	{ value: 'studying-part-time', label: 'Part-time study commitments' },
	{ value: 'studying-full-time', label: 'Full-time study commitments' },
	{ value: 'other', label: 'Other work arrangement' },
]

// Generate AHPRA registration years from 70 years ago to current year
export const AHPRA_REGISTRATION_YEARS = (() => {
	const currentYear = new Date().getFullYear()
	const startYear = currentYear - 70
	const years = []
	
	for (let year = currentYear; year >= startYear; year--) {
		years.push({ value: year.toString(), label: year.toString() })
	}
	
	return years
})() 