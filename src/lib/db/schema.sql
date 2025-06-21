-- HeyDoc Database Schema
-- This file contains all table definitions for the HeyDoc application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to Cognito)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cognito_user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'doctor', 'patient')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cognito_id ON users(cognito_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Doctors table (detailed professional information)
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_postcode VARCHAR(10),
    address_country VARCHAR(50) DEFAULT 'Australia',
    
    -- Professional Information
    ahpra_number VARCHAR(50) UNIQUE,
    medical_specialty VARCHAR(100),
    years_experience INTEGER,
    current_registration_status VARCHAR(50),
    qualifications TEXT[], -- Array of qualifications
    
    -- Practice Information
    current_roles TEXT[], -- Array of current roles
    working_hours TEXT,
    languages_spoken TEXT[], -- Array of languages
    consultation_types TEXT[], -- Array of consultation types
    
    -- Banking Information
    abn VARCHAR(11),
    bank_account_name VARCHAR(255),
    bsb VARCHAR(6),
    account_number VARCHAR(20),
    tax_file_number VARCHAR(20),
    
    -- Insurance Information
    insurance_provider_name VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    insurance_expiry_date DATE,
    insurance_coverage_amount VARCHAR(50),
    
    -- Document Information (stored as JSONB for flexibility)
    documents JSONB DEFAULT '{}',
    
    -- Status and Approval
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for doctors table
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_doctors_ahpra ON doctors(ahpra_number);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(medical_specialty);

-- Patients table (for future use)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_postcode VARCHAR(10),
    address_country VARCHAR(50) DEFAULT 'Australia',
    
    -- Medical Information (stored as JSONB for flexibility)
    medical_info JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for patients table
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);

-- Admin actions table (audit trail)
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id),
    target_id UUID NOT NULL, -- Can reference users, doctors, or patients
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('user', 'doctor', 'patient')),
    action VARCHAR(50) NOT NULL CHECK (action IN ('approve', 'reject', 'suspend', 'activate', 'create', 'update', 'delete')),
    reason TEXT,
    metadata JSONB DEFAULT '{}', -- Additional action metadata
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for admin_actions table
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action ON admin_actions(action);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);

-- Document uploads table (for tracking file uploads)
CREATE TABLE IF NOT EXISTS document_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    doctor_id UUID REFERENCES doctors(id), -- If associated with a doctor
    
    -- File information
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    s3_key VARCHAR(500) NOT NULL UNIQUE,
    s3_url VARCHAR(1000),
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    -- Document metadata
    document_type VARCHAR(50), -- e.g., 'ahpra_certificate', 'medical_degree', etc.
    description TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
    
    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for document_uploads table
CREATE INDEX IF NOT EXISTS idx_document_uploads_user_id ON document_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_doctor_id ON document_uploads(doctor_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_type ON document_uploads(document_type);
CREATE INDEX IF NOT EXISTS idx_document_uploads_s3_key ON document_uploads(s3_key);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial admin user (this will be updated with actual admin email)
-- INSERT INTO users (cognito_user_id, email, role, status) 
-- VALUES ('admin-cognito-id', 'admin@heydochealth.com.au', 'admin', 'active')
-- ON CONFLICT (email) DO NOTHING; 