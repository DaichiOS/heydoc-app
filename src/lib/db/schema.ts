import { sql } from 'drizzle-orm'
import {
	bigint,
	date,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'

// Doctor status enum - covers the full workflow
export const doctorStatusEnum = pgEnum('doctor_status', [
	'email_unconfirmed',
	'pending', 
	'interview_scheduled',
	'documentation_required',
	'active',
	'rejected',
	'suspended'
])

// Users table (linked to Cognito)
export const users = pgTable('users', {
	id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
	cognitoUserId: varchar('cognito_user_id', { length: 255 }).notNull().unique(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	role: varchar('role', { length: 20 }).notNull(),
	status: varchar('status', { length: 20 }).notNull().default('pending'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
	emailIdx: index('idx_users_email').on(table.email),
	cognitoIdx: index('idx_users_cognito_id').on(table.cognitoUserId),
	roleIdx: index('idx_users_role').on(table.role),
}))

// Doctors table (detailed professional information)
export const doctors = pgTable('doctors', {
	id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
	userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	
	// Personal Information
	firstName: varchar('first_name', { length: 100 }).notNull(),
	lastName: varchar('last_name', { length: 100 }).notNull(),
	dateOfBirth: date('date_of_birth'),
	phone: varchar('phone', { length: 20 }).notNull(),
	addressStreet: varchar('address_street', { length: 255 }),
	addressCity: varchar('address_city', { length: 100 }),
	addressState: varchar('address_state', { length: 50 }),
	addressPostcode: varchar('address_postcode', { length: 10 }),
	addressCountry: varchar('address_country', { length: 50 }).default('Australia'),
	
	// Professional Information
	ahpraNumber: varchar('ahpra_number', { length: 50 }).notNull().unique(),
	ahpraRegistrationDate: date('ahpra_registration_date').notNull(),
	medicalSpecialty: varchar('medical_specialty', { length: 100 }),
	yearsExperience: integer('years_experience'),
	currentRegistrationStatus: varchar('current_registration_status', { length: 50 }),
	qualifications: text('qualifications').array(),
	
	// Practice Information
	currentRoles: text('current_roles').array(),
	workingHours: text('working_hours'),
	languagesSpoken: text('languages_spoken').array(),
	consultationTypes: text('consultation_types').array(),
	
	// Banking Information
	abn: varchar('abn', { length: 11 }),
	bankAccountName: varchar('bank_account_name', { length: 255 }),
	bsb: varchar('bsb', { length: 6 }),
	accountNumber: varchar('account_number', { length: 20 }),
	taxFileNumber: varchar('tax_file_number', { length: 20 }),
	
	// Insurance Information
	insuranceProviderName: varchar('insurance_provider_name', { length: 255 }),
	insurancePolicyNumber: varchar('insurance_policy_number', { length: 100 }),
	insuranceExpiryDate: date('insurance_expiry_date'),
	insuranceCoverageAmount: varchar('insurance_coverage_amount', { length: 50 }),
	
	// Document Information
	documents: jsonb('documents').default({}),
	
	// Status and Approval
	status: doctorStatusEnum('status').notNull().default('email_unconfirmed'),
	approvedAt: timestamp('approved_at', { withTimezone: true }),
	approvedBy: uuid('approved_by').references(() => users.id),
	
	// Timestamps
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
	userIdIdx: index('idx_doctors_user_id').on(table.userId),
	statusIdx: index('idx_doctors_status').on(table.status),
	ahpraIdx: index('idx_doctors_ahpra').on(table.ahpraNumber),
	specialtyIdx: index('idx_doctors_specialty').on(table.medicalSpecialty),
}))

// Patients table (for future use)
export const patients = pgTable('patients', {
	id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
	userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	
	// Personal Information
	firstName: varchar('first_name', { length: 100 }).notNull(),
	lastName: varchar('last_name', { length: 100 }).notNull(),
	dateOfBirth: date('date_of_birth'),
	phone: varchar('phone', { length: 20 }),
	addressStreet: varchar('address_street', { length: 255 }),
	addressCity: varchar('address_city', { length: 100 }),
	addressState: varchar('address_state', { length: 50 }),
	addressPostcode: varchar('address_postcode', { length: 10 }),
	addressCountry: varchar('address_country', { length: 50 }).default('Australia'),
	
	// Medical Information
	medicalInfo: jsonb('medical_info').default({}),
	
	// Status
	status: varchar('status', { length: 20 }).notNull().default('active'),
	
	// Timestamps
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
	userIdIdx: index('idx_patients_user_id').on(table.userId),
	statusIdx: index('idx_patients_status').on(table.status),
}))

// Admins table (admin-specific information)
export const admins = pgTable('admins', {
	id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
	userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	
	// Personal Information
	firstName: varchar('first_name', { length: 100 }).notNull(),
	lastName: varchar('last_name', { length: 100 }).notNull(),
	phone: varchar('phone', { length: 20 }),
	
	// Admin-specific Information
	calendlyLink: varchar('calendly_link', { length: 500 }),
	department: varchar('department', { length: 100 }),
	title: varchar('title', { length: 100 }),
	
	// Status
	status: varchar('status', { length: 20 }).notNull().default('active'),
	
	// Timestamps
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
	userIdIdx: index('idx_admins_user_id').on(table.userId),
	statusIdx: index('idx_admins_status').on(table.status),
}))

// Admin actions table (audit trail)
export const adminActions = pgTable('admin_actions', {
	id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
	adminId: uuid('admin_id').notNull().references(() => users.id),
	targetId: uuid('target_id').notNull(),
	targetType: varchar('target_type', { length: 20 }).notNull(),
	action: varchar('action', { length: 50 }).notNull(),
	reason: text('reason'),
	metadata: jsonb('metadata').default({}),
	
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
	adminIdIdx: index('idx_admin_actions_admin_id').on(table.adminId),
	targetIdx: index('idx_admin_actions_target').on(table.targetId, table.targetType),
	actionIdx: index('idx_admin_actions_action').on(table.action),
	createdAtIdx: index('idx_admin_actions_created_at').on(table.createdAt),
}))

// Document uploads table (for tracking file uploads)
export const documentUploads = pgTable('document_uploads', {
	id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
	userId: uuid('user_id').notNull().references(() => users.id),
	doctorId: uuid('doctor_id').references(() => doctors.id),
	
	// File information
	fileName: varchar('file_name', { length: 255 }).notNull(),
	originalName: varchar('original_name', { length: 255 }).notNull(),
	s3Key: varchar('s3_key', { length: 500 }).notNull().unique(),
	s3Url: varchar('s3_url', { length: 1000 }),
	fileSize: bigint('file_size', { mode: 'number' }),
	mimeType: varchar('mime_type', { length: 100 }),
	
	// Document metadata
	documentType: varchar('document_type', { length: 50 }),
	description: text('description'),
	
	// Status
	status: varchar('status', { length: 20 }).default('active'),
	
	// Timestamps
	uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
	userIdIdx: index('idx_document_uploads_user_id').on(table.userId),
	doctorIdIdx: index('idx_document_uploads_doctor_id').on(table.doctorId),
	typeIdx: index('idx_document_uploads_type').on(table.documentType),
	s3KeyIdx: index('idx_document_uploads_s3_key').on(table.s3Key),
}))

// Admin settings table to store admin preferences like Calendly links
export const adminSettings = pgTable('admin_settings', {
	id: uuid('id').primaryKey().defaultRandom(),
	adminId: uuid('admin_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	settingKey: varchar('setting_key', { length: 100 }).notNull(),
	settingValue: text('setting_value'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
	uniqueAdminSetting: unique().on(table.adminId, table.settingKey),
}))

// Export types for use in the application
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Doctor = typeof doctors.$inferSelect
export type NewDoctor = typeof doctors.$inferInsert
export type DoctorStatus = typeof doctorStatusEnum.enumValues[number]
export type Patient = typeof patients.$inferSelect
export type NewPatient = typeof patients.$inferInsert
export type Admin = typeof admins.$inferSelect
export type NewAdmin = typeof admins.$inferInsert
export type AdminAction = typeof adminActions.$inferSelect
export type NewAdminAction = typeof adminActions.$inferInsert
export type DocumentUpload = typeof documentUploads.$inferSelect
export type NewDocumentUpload = typeof documentUploads.$inferInsert
export type AdminSetting = typeof adminSettings.$inferSelect
export type NewAdminSetting = typeof adminSettings.$inferInsert 