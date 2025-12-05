-- ========================================
-- EPHARMA - SUPABASE DATABASE SCHEMA
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- USERS TABLE (for authentication)
-- ========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('pharmacy', 'doctor', 'patient', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PHARMACIES
-- ========================================
CREATE TABLE pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_open_24_7 BOOLEAN DEFAULT FALSE,
    has_parking BOOLEAN DEFAULT FALSE,
    rating DECIMAL(2, 1) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PRODUCTS (Medications)
-- ========================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    price DECIMAL(10, 2),
    stock_quantity INTEGER DEFAULT 0,
    stock_status TEXT CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    requires_prescription BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- HEALTH CENTERS
-- ========================================
CREATE TABLE health_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('hospital', 'clinic', 'medical-center')),
    category TEXT CHECK (category IN ('public', 'private')),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    has_emergency BOOLEAN DEFAULT FALSE,
    has_parking BOOLEAN DEFAULT FALSE,
    rating DECIMAL(2, 1) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- DOCTORS
-- ========================================
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    type TEXT CHECK (type IN ('generaliste', 'specialiste')),
    gender TEXT CHECK (gender IN ('M', 'F')),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    sector INTEGER CHECK (sector IN (1, 2)),
    consultation_price DECIMAL(10, 2),
    accepts_new_patients BOOLEAN DEFAULT TRUE,
    experience_years INTEGER,
    rating DECIMAL(2, 1) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- APPOINTMENTS
-- ========================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_email TEXT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INTEGER DEFAULT 30,
    type TEXT,
    reason TEXT,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- RESERVATIONS (for pharmacies)
-- ========================================
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    quantity INTEGER DEFAULT 1,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'ready', 'completed', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- REVIEWS
-- ========================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT CHECK (entity_type IN ('pharmacy', 'health_center', 'doctor')),
    entity_id UUID NOT NULL,
    author_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES for performance
-- ========================================
CREATE INDEX idx_pharmacies_city ON pharmacies(city);
CREATE INDEX idx_pharmacies_location ON pharmacies(latitude, longitude);
CREATE INDEX idx_products_pharmacy ON products(pharmacy_id);
CREATE INDEX idx_products_stock ON products(stock_status);
CREATE INDEX idx_health_centers_city ON health_centers(city);
CREATE INDEX idx_health_centers_type ON health_centers(type);
CREATE INDEX idx_doctors_city ON doctors(city);
CREATE INDEX idx_doctors_specialty ON doctors(specialty);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_reservations_pharmacy ON reservations(pharmacy_id);
CREATE INDEX idx_reviews_entity ON reviews(entity_type, entity_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read access for listings
CREATE POLICY "Public can view pharmacies" ON pharmacies FOR SELECT USING (true);
CREATE POLICY "Public can view health centers" ON health_centers FOR SELECT USING (true);
CREATE POLICY "Public can view doctors" ON doctors FOR SELECT USING (true);
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can view reviews" ON reviews FOR SELECT USING (true);

-- Pharmacies can manage their own data
CREATE POLICY "Pharmacies can update own data" ON pharmacies 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Pharmacies can manage own products" ON products 
    FOR ALL USING (pharmacy_id IN (SELECT id FROM pharmacies WHERE user_id = auth.uid()));
CREATE POLICY "Pharmacies can view own reservations" ON reservations 
    FOR SELECT USING (pharmacy_id IN (SELECT id FROM pharmacies WHERE user_id = auth.uid()));

-- Doctors can manage their own data
CREATE POLICY "Doctors can update own data" ON doctors 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Doctors can manage own appointments" ON appointments 
    FOR ALL USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- Anyone can create reservations and appointments
CREATE POLICY "Anyone can create reservations" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create appointments" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create reviews" ON reviews FOR INSERT WITH CHECK (true);
