-- ========================================
-- PATIENTS TABLE SCHEMA
-- For Doctor Dashboard - Patient Management
-- ========================================

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
    
    -- Personal Information
    name TEXT NOT NULL,
    age INTEGER,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('M', 'F', 'Autre')),
    
    -- Contact Information
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    
    -- Medical Information
    blood_type TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    current_medications TEXT[],
    
    -- Visit Tracking
    last_visit DATE,
    next_appointment DATE,
    total_visits INTEGER DEFAULT 0,
    
    -- Notes
    medical_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_patients_doctor ON patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_last_visit ON patients(last_visit);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Doctors can only see their own patients
CREATE POLICY "Doctors can view own patients" 
ON patients FOR SELECT
USING (
    doctor_id IN (
        SELECT id FROM doctors WHERE user_id = auth.uid()
    )
);

-- Doctors can create patients
CREATE POLICY "Doctors can create patients" 
ON patients FOR INSERT
WITH CHECK (
    doctor_id IN (
        SELECT id FROM doctors WHERE user_id = auth.uid()
    )
);

-- Doctors can update their own patients
CREATE POLICY "Doctors can update own patients" 
ON patients FOR UPDATE
USING (
    doctor_id IN (
        SELECT id FROM doctors WHERE user_id = auth.uid()
    )
);

-- Doctors can delete their own patients
CREATE POLICY "Doctors can delete own patients" 
ON patients FOR DELETE
USING (
    doctor_id IN (
        SELECT id FROM doctors WHERE user_id = auth.uid()
    )
);

-- ========================================
-- TRIGGER FOR UPDATED_AT
-- ========================================

CREATE OR REPLACE FUNCTION update_patients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_patients_timestamp ON patients;

CREATE TRIGGER trigger_update_patients_timestamp
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION update_patients_updated_at();

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE patients IS 'Table des patients pour chaque médecin';
COMMENT ON COLUMN patients.doctor_id IS 'ID du médecin qui gère ce patient';
COMMENT ON COLUMN patients.allergies IS 'Liste des allergies du patient';
COMMENT ON COLUMN patients.chronic_conditions IS 'Conditions chroniques du patient';
COMMENT ON COLUMN patients.current_medications IS 'Médicaments actuels du patient';
