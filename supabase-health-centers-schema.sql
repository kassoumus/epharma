-- ========================================
-- E-PHARMA - HEALTH CENTERS SCHEMA
-- Phase 3: Module Centres de Santé
-- ========================================

-- ========================================
-- 1. CRÉATION DU TYPE ENUM POUR LES TYPES DE CENTRES
-- ========================================

-- Supprimer le type s'il existe déjà
DROP TYPE IF EXISTS health_center_type CASCADE;

-- Créer le type ENUM pour les types de centres de santé
CREATE TYPE health_center_type AS ENUM (
    'hospital',                    -- Hôpital
    'clinic',                      -- Clinique
    'community_health_center',     -- Centre de Santé Communautaire
    'specialized_center',          -- Centre Spécialisé
    'maternity',                   -- Maternité
    'dispensary'                   -- Dispensaire
);

-- ========================================
-- 2. CRÉATION DE LA TABLE HEALTH_CENTERS
-- ========================================

-- Supprimer la table si elle existe (ATTENTION: perte de données)
-- DROP TABLE IF EXISTS health_centers CASCADE;

CREATE TABLE IF NOT EXISTS health_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID REFERENCES users(id),
    
    -- Informations de base
    name VARCHAR(255) NOT NULL,
    type health_center_type NOT NULL,
    
    -- Adresse
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    
    -- Contact
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Localisation GPS
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Services et équipements (stockés en JSONB pour flexibilité)
    services JSONB DEFAULT '[]',
    specialties JSONB DEFAULT '[]',
    
    -- Équipements d'urgence
    has_emergency BOOLEAN DEFAULT false,
    has_ambulance BOOLEAN DEFAULT false,
    has_laboratory BOOLEAN DEFAULT false,
    has_pharmacy BOOLEAN DEFAULT false,
    has_radiology BOOLEAN DEFAULT false,
    
    -- Capacité
    bed_capacity INTEGER DEFAULT 0,
    icu_beds INTEGER DEFAULT 0,
    
    -- Horaires (JSONB pour flexibilité)
    opening_hours JSONB DEFAULT '{}',
    is_24_7 BOOLEAN DEFAULT false,
    
    -- Statuts
    is_approved BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Approbation
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    
    -- Métadonnées
    description TEXT,
    logo_url VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT valid_bed_capacity CHECK (bed_capacity >= 0),
    CONSTRAINT valid_icu_beds CHECK (icu_beds >= 0 AND icu_beds <= bed_capacity)
);

-- ========================================
-- 3. CRÉATION DES INDEX POUR OPTIMISATION
-- ========================================

-- Index sur le gérant
CREATE INDEX IF NOT EXISTS idx_health_centers_manager ON health_centers(manager_id);

-- Index sur la ville
CREATE INDEX IF NOT EXISTS idx_health_centers_city ON health_centers(city);

-- Index sur le type
CREATE INDEX IF NOT EXISTS idx_health_centers_type ON health_centers(type);

-- Index sur le statut d'approbation
CREATE INDEX IF NOT EXISTS idx_health_centers_approved ON health_centers(is_approved);

-- Index sur le statut actif
CREATE INDEX IF NOT EXISTS idx_health_centers_active ON health_centers(is_active);

-- Index composite pour les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_health_centers_status ON health_centers(is_approved, is_active);

-- Index pour la recherche géographique
CREATE INDEX IF NOT EXISTS idx_health_centers_location ON health_centers(latitude, longitude);

-- Index GIN pour la recherche dans les services et spécialités
CREATE INDEX IF NOT EXISTS idx_health_centers_services ON health_centers USING GIN (services);
CREATE INDEX IF NOT EXISTS idx_health_centers_specialties ON health_centers USING GIN (specialties);

-- ========================================
-- 4. TRIGGER POUR ATTRIBUTION AUTOMATIQUE DU RÔLE
-- ========================================

-- Fonction trigger pour attribuer automatiquement le rôle HEALTH_CENTER_ADMIN
CREATE OR REPLACE FUNCTION assign_health_center_admin_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Attribuer le rôle health_center_admin si l'utilisateur est un simple user
    UPDATE users 
    SET role = 'health_center_admin',
        updated_at = NOW()
    WHERE id = NEW.manager_id 
    AND role = 'user';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS trigger_assign_health_center_admin ON health_centers;

-- Créer le trigger
CREATE TRIGGER trigger_assign_health_center_admin
AFTER INSERT ON health_centers
FOR EACH ROW
WHEN (NEW.manager_id IS NOT NULL)
EXECUTE FUNCTION assign_health_center_admin_role();

-- ========================================
-- 5. FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour approuver un centre de santé
CREATE OR REPLACE FUNCTION approve_health_center(
    p_health_center_id UUID,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que l'admin est bien un super admin
    IF NOT is_super_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Only super admins can approve health centers';
    END IF;

    -- Approuver le centre de santé
    UPDATE health_centers
    SET is_approved = true,
        approved_at = NOW(),
        approved_by = p_admin_id,
        updated_at = NOW()
    WHERE id = p_health_center_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour changer le gérant d'un centre de santé
CREATE OR REPLACE FUNCTION change_health_center_manager(
    p_health_center_id UUID,
    p_new_manager_id UUID,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_old_manager_id UUID;
BEGIN
    -- Vérifier que l'admin est bien un super admin
    IF NOT is_super_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Only super admins can change health center management';
    END IF;

    -- Récupérer l'ancien gérant
    SELECT manager_id INTO v_old_manager_id
    FROM health_centers
    WHERE id = p_health_center_id;

    -- Mettre à jour le gérant
    UPDATE health_centers
    SET manager_id = p_new_manager_id,
        updated_at = NOW()
    WHERE id = p_health_center_id;

    -- Attribuer le rôle health_center_admin au nouveau gérant
    UPDATE users
    SET role = 'health_center_admin',
        updated_at = NOW()
    WHERE id = p_new_manager_id
    AND role = 'user';

    -- Si l'ancien gérant n'a plus de centres, repasser son rôle à 'user'
    IF v_old_manager_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM health_centers WHERE manager_id = v_old_manager_id) THEN
            UPDATE users
            SET role = 'user',
                updated_at = NOW()
            WHERE id = v_old_manager_id
            AND role = 'health_center_admin';
        END IF;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour activer/désactiver un centre de santé
CREATE OR REPLACE FUNCTION toggle_health_center_status(
    p_health_center_id UUID,
    p_is_active BOOLEAN,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que l'admin est bien un super admin
    IF NOT is_super_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Only super admins can change health center status';
    END IF;

    -- Mettre à jour le statut
    UPDATE health_centers
    SET is_active = p_is_active,
        updated_at = NOW()
    WHERE id = p_health_center_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 6. VUE ENRICHIE POUR LA GESTION DES CENTRES DE SANTÉ
-- ========================================

-- Supprimer la vue si elle existe
DROP VIEW IF EXISTS admin_health_centers_view CASCADE;

-- Créer la vue enrichie
CREATE OR REPLACE VIEW admin_health_centers_view AS
SELECT 
    hc.id,
    hc.name,
    hc.type,
    hc.address,
    hc.city,
    hc.postal_code,
    hc.phone,
    hc.email,
    hc.website,
    hc.latitude,
    hc.longitude,
    hc.services,
    hc.specialties,
    hc.has_emergency,
    hc.has_ambulance,
    hc.has_laboratory,
    hc.has_pharmacy,
    hc.has_radiology,
    hc.bed_capacity,
    hc.icu_beds,
    hc.opening_hours,
    hc.is_24_7,
    hc.manager_id,
    hc.is_approved,
    hc.is_active,
    hc.approved_at,
    hc.approved_by,
    hc.description,
    hc.logo_url,
    hc.created_at,
    hc.updated_at,
    -- Informations du gérant
    manager.email as manager_email,
    manager_profile.full_name as manager_name,
    manager_profile.phone as manager_phone,
    manager.role as manager_role,
    -- Informations de l'approbateur
    approver.email as approved_by_email,
    approver_profile.full_name as approved_by_name,
    -- Statistiques
    (SELECT COUNT(*) FROM doctors WHERE health_center_id = hc.id) as doctors_count,
    (SELECT COUNT(*) FROM appointments WHERE health_center_id = hc.id) as appointments_count
FROM health_centers hc
LEFT JOIN users manager ON hc.manager_id = manager.id
LEFT JOIN user_profiles manager_profile ON manager.id = manager_profile.user_id
LEFT JOIN users approver ON hc.approved_by = approver.id
LEFT JOIN user_profiles approver_profile ON approver.id = approver_profile.user_id
ORDER BY hc.created_at DESC;

-- ========================================
-- 7. POLITIQUES RLS
-- ========================================

-- Activer RLS sur la table health_centers
ALTER TABLE health_centers ENABLE ROW LEVEL SECURITY;

-- Politique: Les super admins peuvent voir tous les centres
CREATE POLICY "Super admins can view all health centers"
ON health_centers FOR SELECT
USING (is_super_admin(auth.uid()));

-- Politique: Les super admins peuvent gérer tous les centres
CREATE POLICY "Super admins can manage health centers"
ON health_centers FOR ALL
USING (is_super_admin(auth.uid()));

-- Politique: Les health center admins peuvent voir leurs centres
CREATE POLICY "Health center admins can view their centers"
ON health_centers FOR SELECT
USING (
    manager_id = auth.uid()
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'health_center_admin')
);

-- Politique: Les health center admins peuvent modifier leurs centres
CREATE POLICY "Health center admins can update their centers"
ON health_centers FOR UPDATE
USING (
    manager_id = auth.uid()
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'health_center_admin')
);

-- Politique: Le public peut voir les centres approuvés et actifs
CREATE POLICY "Public can view approved active health centers"
ON health_centers FOR SELECT
USING (is_approved = true AND is_active = true);

-- ========================================
-- 8. TRIGGER POUR MISE À JOUR AUTOMATIQUE
-- ========================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_health_centers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe
DROP TRIGGER IF EXISTS trigger_update_health_centers_timestamp ON health_centers;

-- Créer le trigger
CREATE TRIGGER trigger_update_health_centers_timestamp
BEFORE UPDATE ON health_centers
FOR EACH ROW
EXECUTE FUNCTION update_health_centers_updated_at();

-- ========================================
-- 9. COMMENTAIRES
-- ========================================

COMMENT ON TYPE health_center_type IS 'Types de centres de santé disponibles';
COMMENT ON TABLE health_centers IS 'Table des centres de santé, hôpitaux et cliniques';
COMMENT ON COLUMN health_centers.manager_id IS 'ID du gérant du centre (health_center_admin)';
COMMENT ON COLUMN health_centers.services IS 'Services disponibles (JSONB array)';
COMMENT ON COLUMN health_centers.specialties IS 'Spécialités médicales disponibles (JSONB array)';
COMMENT ON COLUMN health_centers.is_approved IS 'Indique si le centre a été approuvé par un super admin';
COMMENT ON COLUMN health_centers.is_active IS 'Indique si le centre est actif';
COMMENT ON FUNCTION assign_health_center_admin_role IS 'Attribue automatiquement le rôle health_center_admin au gérant';
COMMENT ON FUNCTION approve_health_center IS 'Approuve un centre de santé (super admin uniquement)';
COMMENT ON FUNCTION change_health_center_manager IS 'Change le gérant d''un centre de santé (super admin uniquement)';
COMMENT ON FUNCTION toggle_health_center_status IS 'Active/désactive un centre de santé (super admin uniquement)';
COMMENT ON VIEW admin_health_centers_view IS 'Vue complète pour la gestion des centres de santé par le super admin';

-- ========================================
-- 10. DONNÉES DE TEST (OPTIONNEL)
-- ========================================

-- Exemples de services et spécialités
/*
-- Services disponibles:
["Consultation générale", "Urgences", "Hospitalisation", "Chirurgie", "Maternité", "Pédiatrie", "Radiologie", "Laboratoire", "Pharmacie", "Ambulance"]

-- Spécialités médicales:
["Médecine générale", "Cardiologie", "Pédiatrie", "Gynécologie", "Chirurgie", "Ophtalmologie", "Dermatologie", "ORL", "Neurologie", "Orthopédie"]

-- Horaires d'ouverture (exemple):
{
  "monday": {"open": "08:00", "close": "18:00"},
  "tuesday": {"open": "08:00", "close": "18:00"},
  "wednesday": {"open": "08:00", "close": "18:00"},
  "thursday": {"open": "08:00", "close": "18:00"},
  "friday": {"open": "08:00", "close": "18:00"},
  "saturday": {"open": "08:00", "close": "13:00"},
  "sunday": {"closed": true}
}
*/
