-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "admin_actions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"admin_id" uuid NOT NULL,
	"target_id" uuid NOT NULL,
	"target_type" varchar(20) NOT NULL,
	"action" varchar(50) NOT NULL,
	"reason" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"date_of_birth" date,
	"phone" varchar(20) NOT NULL,
	"address_street" varchar(255),
	"address_city" varchar(100),
	"address_state" varchar(50),
	"address_postcode" varchar(10),
	"address_country" varchar(50) DEFAULT 'Australia',
	"ahpra_number" varchar(50) NOT NULL,
	"ahpra_registration_date" date NOT NULL,
	"medical_specialty" varchar(100),
	"years_experience" integer,
	"current_registration_status" varchar(50),
	"qualifications" text[],
	"current_roles" text[],
	"working_hours" text,
	"languages_spoken" text[],
	"consultation_types" text[],
	"abn" varchar(11),
	"bank_account_name" varchar(255),
	"bsb" varchar(6),
	"account_number" varchar(20),
	"tax_file_number" varchar(20),
	"insurance_provider_name" varchar(255),
	"insurance_policy_number" varchar(100),
	"insurance_expiry_date" date,
	"insurance_coverage_amount" varchar(50),
	"documents" jsonb DEFAULT '{}'::jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"approved_at" timestamp with time zone,
	"approved_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "doctors_ahpra_number_unique" UNIQUE("ahpra_number")
);
--> statement-breakpoint
CREATE TABLE "document_uploads" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"doctor_id" uuid,
	"file_name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"s3_key" varchar(500) NOT NULL,
	"s3_url" varchar(1000),
	"file_size" bigint,
	"mime_type" varchar(100),
	"document_type" varchar(50),
	"description" text,
	"status" varchar(20) DEFAULT 'active',
	"uploaded_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "document_uploads_s3_key_unique" UNIQUE("s3_key")
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"date_of_birth" date,
	"phone" varchar(20),
	"address_street" varchar(255),
	"address_city" varchar(100),
	"address_state" varchar(50),
	"address_postcode" varchar(10),
	"address_country" varchar(50) DEFAULT 'Australia',
	"medical_info" jsonb DEFAULT '{}'::jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"cognito_user_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_cognito_user_id_unique" UNIQUE("cognito_user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_uploads" ADD CONSTRAINT "document_uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_uploads" ADD CONSTRAINT "document_uploads_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admin_actions_admin_id" ON "admin_actions" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_admin_actions_target" ON "admin_actions" USING btree ("target_id","target_type");--> statement-breakpoint
CREATE INDEX "idx_admin_actions_action" ON "admin_actions" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_admin_actions_created_at" ON "admin_actions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_doctors_user_id" ON "doctors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_doctors_status" ON "doctors" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_doctors_ahpra" ON "doctors" USING btree ("ahpra_number");--> statement-breakpoint
CREATE INDEX "idx_doctors_specialty" ON "doctors" USING btree ("medical_specialty");--> statement-breakpoint
CREATE INDEX "idx_document_uploads_user_id" ON "document_uploads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_document_uploads_doctor_id" ON "document_uploads" USING btree ("doctor_id");--> statement-breakpoint
CREATE INDEX "idx_document_uploads_type" ON "document_uploads" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "idx_document_uploads_s3_key" ON "document_uploads" USING btree ("s3_key");--> statement-breakpoint
CREATE INDEX "idx_patients_user_id" ON "patients" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_patients_status" ON "patients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_cognito_id" ON "users" USING btree ("cognito_user_id");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");