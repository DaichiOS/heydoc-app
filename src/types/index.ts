// User Roles and Authentication Types
export type UserRole = 'admin' | 'doctor' | 'patient'

export interface User {
	id: string
	cognitoUserId: string
	email: string
	role: UserRole
	status: 'active' | 'inactive' | 'pending'
	createdAt: Date
	updatedAt: Date
}

export interface AuthUser {
	id: string
	email: string
	role: UserRole
	status: string
	accessToken: string
	refreshToken: string
}

// Doctor Types
export interface Doctor {
	id: string
	userId: string
	personalInfo: PersonalInfo
	professionalInfo: ProfessionalInfo
	practiceInfo: PracticeInfo
	bankingInfo: BankingInfo
	insuranceInfo: InsuranceInfo
	documents: DocumentInfo
	status: 'pending' | 'approved' | 'rejected' | 'suspended'
	approvedAt?: Date
	approvedBy?: string
	createdAt: Date
	updatedAt: Date
}

export interface PersonalInfo {
	firstName: string
	lastName: string
	dateOfBirth: string
	phone: string
	address: {
		street: string
		city: string
		state: string
		postcode: string
		country: string
	}
}

export interface ProfessionalInfo {
	ahpraNumber: string
	medicalSpecialty: string
	yearsExperience: number
	currentRegistrationStatus: string
	qualifications: string[]
}

export interface PracticeInfo {
	currentRoles: string[]
	workingHours: string
	languagesSpoken: string[]
	consultationTypes: string[]
}

export interface BankingInfo {
	abn: string
	bankAccountName: string
	bsb: string
	accountNumber: string
	taxFileNumber?: string
}

export interface InsuranceInfo {
	providerName: string
	policyNumber: string
	expiryDate: string
	coverageAmount: string
}

export interface DocumentInfo {
	ahpraCertificate?: FileUpload
	medicalDegree?: FileUpload
	photoId?: FileUpload
	cv?: FileUpload
	insuranceCertificate?: FileUpload
	professionalHeadshot?: FileUpload
}

export interface FileUpload {
	fileName: string
	originalName: string
	s3Key: string
	url: string
	size: number
	mimeType: string
	uploadedAt: Date
}

// Form Types for Onboarding
export interface OnboardingFormData {
	step: number
	personalInfo: Partial<PersonalInfo>
	professionalInfo: Partial<ProfessionalInfo>
	practiceInfo: Partial<PracticeInfo>
	bankingInfo: Partial<BankingInfo>
	insuranceInfo: Partial<InsuranceInfo>
	documents: Partial<DocumentInfo>
	termsAccepted: boolean
	privacyAccepted: boolean
}

// API Response Types
export interface ApiResponse<T = any> {
	success: boolean
	data?: T
	error?: string
	message?: string
}

export interface PaginatedResponse<T> {
	items: T[]
	total: number
	page: number
	limit: number
	totalPages: number
}

// Admin Types
export interface AdminAction {
	id: string
	adminId: string
	targetId: string
	action: 'approve' | 'reject' | 'suspend' | 'activate'
	reason?: string
	createdAt: Date
}

// Patient Types (for future use)
export interface Patient {
	id: string
	userId: string
	personalInfo: PersonalInfo
	medicalInfo?: any
	status: 'active' | 'inactive'
	createdAt: Date
	updatedAt: Date
}

// Cognito Types
export interface CognitoSignUpData {
	email: string
	password?: string
	firstName?: string
	lastName?: string
	role: UserRole
}

export interface CognitoUser {
	Username: string
	Attributes: Array<{
		Name: string
		Value: string
	}>
	UserStatus: string
	Enabled: boolean
	UserCreateDate: Date
	UserLastModifiedDate: Date
}

export interface CognitoAuthResult {
	accessToken: string
	refreshToken: string
	idToken: string
	user: {
		email: string
		role: UserRole
		cognitoUserId: string
	}
}

// S3 Upload Types
export interface S3UploadConfig {
	bucket: string
	key: string
	contentType: string
	presignedUrl: string
	expiresIn: number
}

export interface UploadProgress {
	loaded: number
	total: number
	percentage: number
}

// Database Types
export interface DatabaseConfig {
	host: string
	port: number
	database: string
	username: string
	password: string
	ssl: boolean
}

export type RegistrationStep = 'selection' | 'intro' | 'step1' | 'step2' | 'step3'
export type UserType = 'doctor' | 'patient' | null

export interface FormData {
	firstName: string
	lastName: string
	email: string
	phone: string
	specialty: string
	customSpecialty: string
	ahpraNumber: string
	ahpraRegistrationDate: string
	practiceName: string
	experience: string
	practiceDescription: string
}

export interface SubmissionState {
	isSubmitting: boolean
	showModal: boolean
	success: boolean
	message: string
	redirectUrl?: string
} 