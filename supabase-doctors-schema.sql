-- ========================================
-- E-PHARMA - DOCTORS SCHEMA
-- Phase 4: Module Médecins
-- ========================================

-- ========================================
-- 1. CRÉATION DE LA TABLE DOCTORS
-- ========================================

-- Supprimer la table si elle existe (ATTENTION: perte de données)
-- DROP TABLE IF EXISTS doctors CASCADE;

CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) NOT NULL,
    health_center_id UUID REFERENCES health_centers(id),
    
    -- Informations personnelles
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    
    -- Informations professionnelles
    license_number VARCHAR(100) UNIQUE NOT NULL,
    specialties JSONB DEFAULT '[]',
    sub_specialties JSONB DEFAULT '[]',
    
    -- Expérience et formation
    years_of_experience INTEGER DEFAULT 0,
    education JSONB DEFAULT '[]',  -- Diplômes et formations
    certifications JSONB DEFAULT '[]',  -- Certifications professionnelles
    
    -- Consultation
    consultation_fee DECIMAL(10, 2),
    consultation_duration INTEGER DEFAULT 30,  -- Durée en minutes
    accepts_new_patients BOOLEAN DEFAULT true,
    
    -- Langues parlées
    languages JSONB DEFAULT '["Français"]',
    
    -- Disponibilité
    availability JSONB DEFAULT '{}',  -- Horaires de disponibilité
    is_available_online BOOLEAN DEFAULT false,
    online_consultation_fee DECIMAL(10, 2),
    
    -- Vérification et validation
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    verification_documents JSONB DEFAULT '[]',
    
    -- Statut
    is_active BOOLEAN DEFAULT true,
    
    -- Informations supplémentaires
    bio TEXT,
    profile_photo_url VARCHAR(500),
    
    -- Statistiques (mises à jour par triggers)
    total_consultations INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT valid_years_experience CHECK (years_of_experience >= 0),
    CONSTRAINT valid_consultation_fee CHECK (consultation_fee >= 0),
    CONSTRAINT valid_consultation_duration CHECK (consultation_duration > 0),
    CONSTRAINT valid_rating CHECK (average_rating >= 0 AND average_rating <= 5)
);

-- ========================================
-- 2. CRÉATION DES INDEX POUR OPTIMISATION
-- ========================================

-- Index sur l'utilisateur
CREATE INDEX IF NOT EXISTS idx_doctors_user ON doctors(user_id);

-- Index sur le centre de santé
CREATE INDEX IF NOT EXISTS idx_doctors_health_center ON doctors(health_center_id);

-- Index sur le numéro de licence
CREATE INDEX IF NOT EXISTS idx_doctors_license ON doctors(license_number);

-- Index sur le statut de vérification
CREATE INDEX IF NOT EXISTS idx_doctors_verified ON doctors(is_verified);

-- Index sur le statut actif
CREATE INDEX IF NOT EXISTS idx_doctors_active ON doctors(is_active);

-- Index composite pour les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(is_verified, is_active);

-- Index GIN pour la recherche dans les spécialités
CREATE INDEX IF NOT EXISTS idx_doctors_specialties ON doctors USING GIN (specialties);
CREATE INDEX IF NOT EXISTS idx_doctors_sub_specialties ON doctors USING GIN (sub_specialties);

-- Index pour le tri par note
CREATE INDEX IF NOT EXISTS idx_doctors_rating ON doctors(average_rating DESC);

-- Index pour la recherche par nom
CREATE INDEX IF NOT EXISTS idx_doctors_name ON doctors(last_name, first_name);

-- ========================================
-- 3. TRIGGER POUR ATTRIBUTION AUTOMATIQUE DU RÔLE
-- ========================================

-- Fonction trigger pour attribuer automatiquement le rôle DOCTOR
CREATE OR REPLACE FUNCTION assign_doctor_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Attribuer le rôle doctor
    UPDATE users 
    SET role = 'doctor',
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS trigger_assign_doctor_role ON doctors;

-- Créer le trigger
CREATE TRIGGER trigger_assign_doctor_role
AFTER INSERT ON doctors
FOR EACH ROW
EXECUTE FUNCTION assign_doctor_role();

-- ========================================
-- 4. FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour vérifier un médecin
CREATE OR REPLACE FUNCTION verify_doctor(
    p_doctor_id UUID,
    p_admin_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que l'admin est bien un super admin
    IF NOT is_super_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Only super admins can verify doctors';
    END IF;

    -- Vérifier le médecin
    UPDATE doctors
    SET is_verified = true,
        verified_at = NOW(),
        verified_by = p_admin_id,
        updated_at = NOW()
    WHERE id = p_doctor_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour révoquer la vérification d'un médecin
CREATE OR REPLACE FUNCTION revoke_doctor_verification(
    p_doctor_id UUID,
    p_admin_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que l'admin est bien un super admin
    IF NOT is_super_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Only super admins can revoke doctor verification';
    END IF;

    -- Révoquer la vérification
    UPDATE doctors
    SET is_verified = false,
        verified_at = NULL,
        verified_by = NULL,
        updated_at = NOW()
    WHERE id = p_doctor_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour changer le centre de santé d'un médecin
CREATE OR REPLACE FUNCTION change_doctor_health_center(
    p_doctor_id UUID,
    p_new_health_center_id UUID,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que l'admin est bien un super admin
    IF NOT is_super_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Only super admins can change doctor health center';
    END IF;

    -- Mettre à jour le centre de santé
    UPDATE doctors
    SET health_center_id = p_new_health_center_id,
        updated_at = NOW()
    WHERE id = p_doctor_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour activer/désactiver un médecin
CREATE OR REPLACE FUNCTION toggle_doctor_status(
    p_doctor_id UUID,
    p_is_active BOOLEAN,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que l'admin est bien un super admin
    IF NOT is_super_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Only super admins can change doctor status';
    END IF;

    -- Mettre à jour le statut
    UPDATE doctors
    SET is_active = p_is_active,
        updated_at = NOW()
    WHERE id = p_doctor_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour les statistiques d'un médecin
CREATE OR REPLACE FUNCTION update_doctor_stats(p_doctor_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE doctors
    SET total_consultations = (
            SELECT COUNT(*) FROM appointments 
            WHERE doctor_id = p_doctor_id AND status = 'completed'
        ),
        average_rating = (
            SELECT COALESCE(AVG(rating), 0) FROM doctor_reviews 
            WHERE doctor_id = p_doctor_id
        ),
        total_reviews = (
            SELECT COUNT(*) FROM doctor_reviews 
            WHERE doctor_id = p_doctor_id
        ),
        updated_at = NOW()
    WHERE id = p_doctor_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. VUE ENRICHIE POUR LA GESTION DES MÉDECINS
-- ========================================

-- Supprimer la vue si elle existe
DROP VIEW IF EXISTS admin_doctors_view CASCADE;

-- Créer la vue enrichie
CREATE OR REPLACE VIEW admin_doctors_view AS
SELECT 
    d.id,
    d.user_id,
    d.health_center_id,
    d.first_name,
    d.last_name,
    d.first_name || ' ' || d.last_name as full_name,
    d.date_of_birth,
    d.gender,
    d.license_number,
    d.specialties,
    d.sub_specialties,
    d.years_of_experience,
    d.education,
    d.certifications,
    d.consultation_fee,
    d.consultation_duration,
    d.accepts_new_patients,
    d.languages,
    d.availability,
    d.is_available_online,
    d.online_consultation_fee,
    d.is_verified,
    d.verified_at,
    d.verified_by,
    d.verification_documents,
    d.is_active,
    d.bio,
    d.profile_photo_url,
    d.total_consultations,
    d.average_rating,
    d.total_reviews,
    d.created_at,
    d.updated_at,
    -- Informations de l'utilisateur
    u.email as user_email,
    u.role as user_role,
    -- Informations du centre de santé
    hc.name as health_center_name,
    hc.type as health_center_type,
    hc.city as health_center_city,
    -- Informations du vérificateur
    verifier.email as verified_by_email,
    verifier_profile.full_name as verified_by_name,
    -- Statistiques
    (SELECT COUNT(*) FROM appointments WHERE doctor_id = d.id AND status = 'pending') as pending_appointments,
    (SELECT COUNT(*) FROM appointments WHERE doctor_id = d.id AND appointment_date >= CURRENT_DATE) as upcoming_appointments
FROM doctors d
LEFT JOIN users u ON d.user_id = u.id
LEFT JOIN health_centers hc ON d.health_center_id = hc.id
LEFT JOIN users verifier ON d.verified_by = verifier.id
LEFT JOIN user_profiles verifier_profile ON verifier.id = verifier_profile.user_id
ORDER BY d.created_at DESC;

-- ========================================
-- 6. POLITIQUES RLS
-- ========================================

-- Activer RLS sur la table doctors
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Politique: Les super admins peuvent voir tous les médecins
CREATE POLICY "Super admins can view all doctors"
ON doctors FOR SELECT
USING (is_super_admin(auth.uid()));

-- Politique: Les super admins peuvent gérer tous les médecins
CREATE POLICY "Super admins can manage doctors"
ON doctors FOR ALL
USING (is_super_admin(auth.uid()));

-- Politique: Les médecins peuvent voir leur propre profil
CREATE POLICY "Doctors can view own profile"
ON doctors FOR SELECT
USING (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'doctor')
);

-- Politique: Les médecins peuvent modifier leur propre profil
CREATE POLICY "Doctors can update own profile"
ON doctors FOR UPDATE
USING (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'doctor')
);

-- Politique: Les health center admins peuvent voir les médecins de leur centre
CREATE POLICY "Health center admins can view their doctors"
ON doctors FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM health_centers hc
        WHERE hc.id = doctors.health_center_id
        AND hc.manager_id = auth.uid()
        AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'health_center_admin')
    )
);

-- Politique: Le public peut voir les médecins vérifiés et actifs
CREATE POLICY "Public can view verified active doctors"
ON doctors FOR SELECT
USING (is_verified = true AND is_active = true);

-- ========================================
-- 7. TRIGGER POUR MISE À JOUR AUTOMATIQUE
-- ========================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_doctors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe
DROP TRIGGER IF EXISTS trigger_update_doctors_timestamp ON doctors;

-- Créer le trigger
CREATE TRIGGER trigger_update_doctors_timestamp
BEFORE UPDATE ON doctors
FOR EACH ROW
EXECUTE FUNCTION update_doctors_updated_at();

-- ========================================
-- 8. COMMENTAIRES
-- ========================================

COMMENT ON TABLE doctors IS 'Table des médecins de la plateforme';
COMMENT ON COLUMN doctors.user_id IS 'ID de l''utilisateur associé (role = doctor)';
COMMENT ON COLUMN doctors.health_center_id IS 'ID du centre de santé où exerce le médecin';
COMMENT ON COLUMN doctors.license_number IS 'Numéro de licence professionnelle unique';
COMMENT ON COLUMN doctors.specialties IS 'Spécialités médicales (JSONB array)';
COMMENT ON COLUMN doctors.is_verified IS 'Indique si le médecin a été vérifié par un super admin';
COMMENT ON COLUMN doctors.verification_documents IS 'Documents de vérification (JSONB array)';
COMMENT ON FUNCTION assign_doctor_role IS 'Attribue automatiquement le rôle doctor à l''utilisateur';
COMMENT ON FUNCTION verify_doctor IS 'Vérifie un médecin (super admin uniquement)';
COMMENT ON FUNCTION revoke_doctor_verification IS 'Révoque la vérification d''un médecin (super admin uniquement)';
COMMENT ON FUNCTION change_doctor_health_center IS 'Change le centre de santé d''un médecin (super admin uniquement)';
COMMENT ON FUNCTION toggle_doctor_status IS 'Active/désactive un médecin (super admin uniquement)';
COMMENT ON FUNCTION update_doctor_stats IS 'Met à jour les statistiques d''un médecin';
COMMENT ON VIEW admin_doctors_view IS 'Vue complète pour la gestion des médecins par le super admin';

-- ========================================
-- 9. DONNÉES DE RÉFÉRENCE (OPTIONNEL)
-- ========================================

-- Exemples de spécialités médicales
/*
Spécialités principales:
["Médecine générale", "Cardiologie", "Pédiatrie", "Gynécologie-Obstétrique", "Chirurgie générale", 
 "Ophtalmologie", "Dermatologie", "ORL", "Neurologie", "Orthopédie", "Psychiatrie", "Radiologie",
 "Anesthésie-Réanimation", "Médecine interne", "Pneumologie", "Gastro-entérologie", "Urologie",
 "Néphrologie", "Endocrinologie", "Rhumatologie", "Oncologie"]

Langues:
["Français", "Anglais", "Arabe", "Haoussa", "Zarma", "Tamajaq"]

Exemple de disponibilité:
{
  "monday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
  "tuesday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
  "wednesday": [{"start": "08:00", "end": "12:00"}],
  "thursday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
  "friday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
  "saturday": [],
  "sunday": []
}
*/
