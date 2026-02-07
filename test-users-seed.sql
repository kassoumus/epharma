-- ========================================
-- E-PHARMA - TEST USERS SEED DATA
-- Utilisateurs de test pour tous les rôles
-- ========================================
-- IMPORTANT: Ce fichier crée des utilisateurs de test pour le développement
-- NE PAS UTILISER EN PRODUCTION!
-- ========================================

-- ========================================
-- INSTRUCTIONS D'UTILISATION
-- ========================================
-- ÉTAPE 1: Créer les utilisateurs dans Supabase Auth
--   - Allez sur votre projet Supabase > Authentication > Users
--   - Créez chaque utilisateur avec l'email et le mot de passe Test@2024
--   - Cochez "Auto Confirm User"
--
-- ÉTAPE 2: Exécuter le schéma des rôles (SI PAS DÉJÀ FAIT)
--   - Exécutez d'abord: supabase-roles-schema.sql
--   - Cela ajoute les colonnes role, is_active, is_approved à la table users
--
-- ÉTAPE 3: Exécuter ce script
--   - Ce script créera les profils et entités associées
-- ========================================

-- ========================================
-- VÉRIFICATION: Ajouter les colonnes manquantes si nécessaire
-- ========================================
DO $$ 
BEGIN
    -- Vérifier si la colonne role existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='role') THEN
        RAISE EXCEPTION 'ERREUR: La table users n''a pas la colonne "role". Veuillez d''abord exécuter supabase-roles-schema.sql';
    END IF;
    
    -- Vérifier si la colonne is_active existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_active') THEN
        RAISE EXCEPTION 'ERREUR: La table users n''a pas la colonne "is_active". Veuillez d''abord exécuter supabase-roles-schema.sql';
    END IF;
    
    -- Vérifier si la colonne is_approved existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_approved') THEN
        RAISE EXCEPTION 'ERREUR: La table users n''a pas la colonne "is_approved". Veuillez d''abord exécuter supabase-roles-schema.sql';
    END IF;
    
    RAISE NOTICE 'Vérification réussie: La table users a toutes les colonnes nécessaires.';
END $$;

-- ========================================
-- 1. SUPER ADMIN
-- ========================================
-- Email: superadmin@epharma.ne
-- Mot de passe: Test@2024
-- Rôle: super_admin

-- Créer le profil utilisateur pour le super admin
INSERT INTO user_profiles (user_id, full_name, phone, city, address)
SELECT 
    id,
    'Amadou Diallo',
    '+227 90 12 34 56',
    'Niamey',
    'Quartier Plateau, Avenue de la République'
FROM auth.users
WHERE email = 'superadmin@epharma.ne'
ON CONFLICT (user_id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    address = EXCLUDED.address;

-- Mettre à jour le rôle dans la table users
INSERT INTO users (id, email, role, is_active, is_approved)
SELECT 
    id,
    email,
    'super_admin'::user_role,
    true,
    true
FROM auth.users
WHERE email = 'superadmin@epharma.ne'
ON CONFLICT (id) DO UPDATE
SET role = 'super_admin',
    is_active = true,
    is_approved = true;

-- ========================================
-- 2. PHARMACY ADMIN (Gérant de Pharmacie)
-- ========================================
-- Email: pharmacie.test@epharma.ne
-- Mot de passe: Test@2024
-- Rôle: pharmacy_admin

-- Créer le profil utilisateur
INSERT INTO user_profiles (user_id, full_name, phone, city, address)
SELECT 
    id,
    'Fatima Moussa',
    '+227 90 23 45 67',
    'Niamey',
    'Quartier Yantala'
FROM auth.users
WHERE email = 'pharmacie.test@epharma.ne'
ON CONFLICT (user_id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    address = EXCLUDED.address;

-- Créer l'entrée dans users
INSERT INTO users (id, email, role, is_active, is_approved)
SELECT 
    id,
    email,
    'pharmacy_admin'::user_role,
    true,
    true
FROM auth.users
WHERE email = 'pharmacie.test@epharma.ne'
ON CONFLICT (id) DO UPDATE
SET role = 'pharmacy_admin',
    is_active = true,
    is_approved = true;

-- Créer la pharmacie de test
INSERT INTO pharmacies (
    name, 
    address, 
    city, 
    postal_code, 
    phone, 
    email, 
    latitude, 
    longitude,
    is_24_7,
    has_parking,
    owner_id,
    is_approved,
    is_active,
    approved_at,
    approved_by
)
SELECT 
    'Pharmacie Test Niamey',
    'Avenue de la Liberté, près du Rond-Point Kennedy',
    'Niamey',
    '8000',
    '+227 20 73 45 67',
    'contact@pharmacie-test.ne',
    13.5116,
    2.1254,
    false,
    true,
    u.id,
    true,
    true,
    NOW(),
    (SELECT id FROM auth.users WHERE email = 'superadmin@epharma.ne')
FROM auth.users u
WHERE u.email = 'pharmacie.test@epharma.ne'
ON CONFLICT DO NOTHING;

-- ========================================
-- 3. HEALTH CENTER ADMIN (Gérant de Centre de Santé)
-- ========================================
-- Email: centre.test@epharma.ne
-- Mot de passe: Test@2024
-- Rôle: health_center_admin

-- Créer le profil utilisateur
INSERT INTO user_profiles (user_id, full_name, phone, city, address)
SELECT 
    id,
    'Ibrahim Souley',
    '+227 90 34 56 78',
    'Niamey',
    'Quartier Lazaret'
FROM auth.users
WHERE email = 'centre.test@epharma.ne'
ON CONFLICT (user_id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    address = EXCLUDED.address;

-- Créer l'entrée dans users
INSERT INTO users (id, email, role, is_active, is_approved)
SELECT 
    id,
    email,
    'health_center_admin'::user_role,
    true,
    true
FROM auth.users
WHERE email = 'centre.test@epharma.ne'
ON CONFLICT (id) DO UPDATE
SET role = 'health_center_admin',
    is_active = true,
    is_approved = true;

-- Créer le centre de santé de test
INSERT INTO health_centers (
    name,
    type,
    address,
    city,
    postal_code,
    phone,
    email,
    website,
    latitude,
    longitude,
    services,
    specialties,
    has_emergency,
    has_ambulance,
    has_laboratory,
    has_pharmacy,
    has_radiology,
    bed_capacity,
    icu_beds,
    is_24_7,
    manager_id,
    is_approved,
    is_active,
    approved_at,
    approved_by,
    description
)
SELECT 
    'Centre de Santé Test Niamey',
    'community_health_center'::health_center_type,
    'Rue de la Santé, Quartier Lazaret',
    'Niamey',
    '8000',
    '+227 20 73 56 78',
    'contact@centre-test.ne',
    'www.centre-test.ne',
    13.5089,
    2.1106,
    '["Consultation générale", "Urgences", "Hospitalisation", "Laboratoire", "Pharmacie"]'::jsonb,
    '["Médecine générale", "Pédiatrie", "Gynécologie"]'::jsonb,
    true,
    true,
    true,
    true,
    false,
    50,
    5,
    false,
    u.id,
    true,
    true,
    NOW(),
    (SELECT id FROM auth.users WHERE email = 'superadmin@epharma.ne'),
    'Centre de santé communautaire offrant des services de base et des urgences 24/7'
FROM auth.users u
WHERE u.email = 'centre.test@epharma.ne'
ON CONFLICT DO NOTHING;

-- ========================================
-- 4. DOCTOR (Médecin)
-- ========================================
-- Email: docteur.test@epharma.ne
-- Mot de passe: Test@2024
-- Rôle: doctor

-- Créer le profil utilisateur
INSERT INTO user_profiles (user_id, full_name, phone, city, address)
SELECT 
    id,
    'Dr. Aïssata Hamani',
    '+227 90 45 67 89',
    'Niamey',
    'Quartier Plateau'
FROM auth.users
WHERE email = 'docteur.test@epharma.ne'
ON CONFLICT (user_id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    address = EXCLUDED.address;

-- Créer l'entrée dans users
INSERT INTO users (id, email, role, is_active, is_approved)
SELECT 
    id,
    email,
    'doctor'::user_role,
    true,
    true
FROM auth.users
WHERE email = 'docteur.test@epharma.ne'
ON CONFLICT (id) DO UPDATE
SET role = 'doctor',
    is_active = true,
    is_approved = true;

-- Créer le profil de médecin
INSERT INTO doctors (
    user_id,
    health_center_id,
    first_name,
    last_name,
    date_of_birth,
    gender,
    license_number,
    specialties,
    sub_specialties,
    years_of_experience,
    education,
    certifications,
    consultation_fee,
    consultation_duration,
    accepts_new_patients,
    languages,
    availability,
    is_available_online,
    online_consultation_fee,
    is_verified,
    verified_at,
    verified_by,
    is_active,
    bio
)
SELECT 
    u.id,
    (SELECT id FROM health_centers WHERE email = 'contact@centre-test.ne' LIMIT 1),
    'Aïssata',
    'Hamani',
    '1985-03-15'::date,
    'F',
    'MED-NE-2024-001',
    '["Médecine générale", "Pédiatrie"]'::jsonb,
    '["Vaccination", "Suivi de grossesse"]'::jsonb,
    10,
    '[{"degree": "Doctorat en Médecine", "institution": "Université Abdou Moumouni", "year": 2014}, {"degree": "Spécialisation en Pédiatrie", "institution": "CHU Niamey", "year": 2017}]'::jsonb,
    '[{"name": "Certification en Pédiatrie", "issuer": "Ordre des Médecins du Niger", "year": 2017}]'::jsonb,
    15000,
    30,
    true,
    '["Français", "Haoussa", "Zarma"]'::jsonb,
    '{
        "monday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "tuesday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "wednesday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "thursday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "friday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "saturday": [{"start": "08:00", "end": "13:00"}],
        "sunday": []
    }'::jsonb,
    true,
    10000,
    true,
    NOW(),
    (SELECT id FROM auth.users WHERE email = 'superadmin@epharma.ne'),
    true,
    'Médecin généraliste avec spécialisation en pédiatrie. Plus de 10 ans d''expérience dans le suivi des enfants et des femmes enceintes.'
FROM auth.users u
WHERE u.email = 'docteur.test@epharma.ne'
ON CONFLICT (user_id) DO UPDATE
SET first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    is_verified = true,
    is_active = true;

-- ========================================
-- 5. REGULAR USER (Patient/Utilisateur)
-- ========================================
-- Email: patient.test@epharma.ne
-- Mot de passe: Test@2024
-- Rôle: user

-- Créer le profil utilisateur
INSERT INTO user_profiles (user_id, full_name, phone, city, address)
SELECT 
    id,
    'Mariama Abdou',
    '+227 90 56 78 90',
    'Niamey',
    'Quartier Yantala Haut'
FROM auth.users
WHERE email = 'patient.test@epharma.ne'
ON CONFLICT (user_id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    address = EXCLUDED.address;

-- Créer l'entrée dans users
INSERT INTO users (id, email, role, is_active, is_approved)
SELECT 
    id,
    email,
    'user'::user_role,
    true,
    true
FROM auth.users
WHERE email = 'patient.test@epharma.ne'
ON CONFLICT (id) DO UPDATE
SET role = 'user',
    is_active = true,
    is_approved = true;

-- ========================================
-- 6. DOCTOR #2 (Médecin Spécialiste)
-- ========================================
-- Email: cardiologue.test@epharma.ne
-- Mot de passe: Test@2024
-- Rôle: doctor

-- Créer le profil utilisateur
INSERT INTO user_profiles (user_id, full_name, phone, city, address)
SELECT 
    id,
    'Dr. Moussa Issoufou',
    '+227 90 67 89 01',
    'Niamey',
    'Quartier Plateau'
FROM auth.users
WHERE email = 'cardiologue.test@epharma.ne'
ON CONFLICT (user_id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    address = EXCLUDED.address;

-- Créer l'entrée dans users
INSERT INTO users (id, email, role, is_active, is_approved)
SELECT 
    id,
    email,
    'doctor'::user_role,
    true,
    true
FROM auth.users
WHERE email = 'cardiologue.test@epharma.ne'
ON CONFLICT (id) DO UPDATE
SET role = 'doctor',
    is_active = true,
    is_approved = true;

-- Créer le profil de médecin cardiologue
INSERT INTO doctors (
    user_id,
    health_center_id,
    first_name,
    last_name,
    date_of_birth,
    gender,
    license_number,
    specialties,
    sub_specialties,
    years_of_experience,
    education,
    certifications,
    consultation_fee,
    consultation_duration,
    accepts_new_patients,
    languages,
    availability,
    is_available_online,
    online_consultation_fee,
    is_verified,
    verified_at,
    verified_by,
    is_active,
    bio
)
SELECT 
    u.id,
    (SELECT id FROM health_centers WHERE email = 'contact@centre-test.ne' LIMIT 1),
    'Moussa',
    'Issoufou',
    '1978-07-22'::date,
    'M',
    'MED-NE-2024-002',
    '["Cardiologie"]'::jsonb,
    '["Échocardiographie", "Électrocardiographie"]'::jsonb,
    18,
    '[{"degree": "Doctorat en Médecine", "institution": "Université Abdou Moumouni", "year": 2006}, {"degree": "Spécialisation en Cardiologie", "institution": "Hôpital Bichat, Paris", "year": 2010}]'::jsonb,
    '[{"name": "Certification en Cardiologie", "issuer": "Ordre des Médecins du Niger", "year": 2010}, {"name": "Formation en Échocardiographie", "issuer": "Société Française de Cardiologie", "year": 2012}]'::jsonb,
    25000,
    45,
    true,
    '["Français", "Haoussa", "Anglais"]'::jsonb,
    '{
        "monday": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "19:00"}],
        "tuesday": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "19:00"}],
        "wednesday": [{"start": "09:00", "end": "13:00"}],
        "thursday": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "19:00"}],
        "friday": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "19:00"}],
        "saturday": [],
        "sunday": []
    }'::jsonb,
    true,
    20000,
    true,
    NOW(),
    (SELECT id FROM auth.users WHERE email = 'superadmin@epharma.ne'),
    true,
    'Cardiologue expérimenté spécialisé dans le diagnostic et le traitement des maladies cardiovasculaires. Formation en France avec plus de 18 ans d''expérience.'
FROM auth.users u
WHERE u.email = 'cardiologue.test@epharma.ne'
ON CONFLICT (user_id) DO UPDATE
SET first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    is_verified = true,
    is_active = true;

-- ========================================
-- VÉRIFICATION DES DONNÉES
-- ========================================
-- Afficher tous les utilisateurs de test créés
SELECT 
    u.email,
    ut.role,
    up.full_name,
    up.phone,
    ut.is_active,
    ut.is_approved
FROM auth.users u
LEFT JOIN users ut ON u.id = ut.id
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email IN (
    'superadmin@epharma.ne',
    'pharmacie.test@epharma.ne',
    'centre.test@epharma.ne',
    'docteur.test@epharma.ne',
    'cardiologue.test@epharma.ne',
    'patient.test@epharma.ne'
)
ORDER BY 
    CASE ut.role
        WHEN 'super_admin' THEN 1
        WHEN 'pharmacy_admin' THEN 2
        WHEN 'health_center_admin' THEN 3
        WHEN 'doctor' THEN 4
        WHEN 'user' THEN 5
        ELSE 6
    END;

COMMIT;
