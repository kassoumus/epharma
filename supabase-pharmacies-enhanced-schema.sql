-- ========================================
-- E-PHARMA - PHARMACIES ENHANCED SCHEMA
-- Phase 2: Amélioration du module Pharmacies
-- Liaison avec propriétaires et système d'approbation
-- ========================================

-- ========================================
-- 1. MISE À JOUR DE LA TABLE PHARMACIES
-- ========================================

-- Ajouter les nouvelles colonnes si elles n'existent pas
DO $$ 
BEGIN
    -- Ajouter la colonne owner_id (propriétaire de la pharmacie)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pharmacies' AND column_name='owner_id') THEN
        ALTER TABLE pharmacies ADD COLUMN owner_id UUID REFERENCES users(id);
    END IF;

    -- Ajouter la colonne is_approved
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pharmacies' AND column_name='is_approved') THEN
        ALTER TABLE pharmacies ADD COLUMN is_approved BOOLEAN DEFAULT false;
    END IF;

    -- Ajouter la colonne is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pharmacies' AND column_name='is_active') THEN
        ALTER TABLE pharmacies ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- Ajouter la colonne approved_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pharmacies' AND column_name='approved_at') THEN
        ALTER TABLE pharmacies ADD COLUMN approved_at TIMESTAMPTZ;
    END IF;

    -- Ajouter la colonne approved_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pharmacies' AND column_name='approved_by') THEN
        ALTER TABLE pharmacies ADD COLUMN approved_by UUID REFERENCES users(id);
    END IF;
END $$;

-- ========================================
-- 2. CRÉATION DES INDEX POUR OPTIMISATION
-- ========================================

-- Index sur le propriétaire
CREATE INDEX IF NOT EXISTS idx_pharmacies_owner ON pharmacies(owner_id);

-- Index sur le statut d'approbation
CREATE INDEX IF NOT EXISTS idx_pharmacies_approved ON pharmacies(is_approved);

-- Index sur le statut actif
CREATE INDEX IF NOT EXISTS idx_pharmacies_active ON pharmacies(is_active);

-- Index composite pour les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_pharmacies_status ON pharmacies(is_approved, is_active);

-- ========================================
-- 3. TRIGGER POUR ATTRIBUTION AUTOMATIQUE DU RÔLE
-- ========================================

-- Fonction trigger pour attribuer automatiquement le rôle PHARMACY_ADMIN
CREATE OR REPLACE FUNCTION assign_pharmacy_admin_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Attribuer le rôle pharmacy_admin si l'utilisateur est un simple user
    UPDATE users 
    SET role = 'pharmacy_admin',
        updated_at = NOW()
    WHERE id = NEW.owner_id 
    AND role = 'user';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS trigger_assign_pharmacy_admin ON pharmacies;

-- Créer le trigger
CREATE TRIGGER trigger_assign_pharmacy_admin
AFTER INSERT ON pharmacies
FOR EACH ROW
WHEN (NEW.owner_id IS NOT NULL)
EXECUTE FUNCTION assign_pharmacy_admin_role();

-- ========================================
-- 4. FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour approuver une pharmacie
CREATE OR REPLACE FUNCTION approve_pharmacy(
    p_pharmacy_id UUID,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que l'admin est bien un super admin
    IF NOT is_super_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Only super admins can approve pharmacies';
    END IF;

    -- Approuver la pharmacie
    UPDATE pharmacies
    SET is_approved = true,
        approved_at = NOW(),
        approved_by = p_admin_id,
        updated_at = NOW()
    WHERE id = p_pharmacy_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour changer le propriétaire d'une pharmacie
CREATE OR REPLACE FUNCTION change_pharmacy_owner(
    p_pharmacy_id UUID,
    p_new_owner_id UUID,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_old_owner_id UUID;
BEGIN
    -- Vérifier que l'admin est bien un super admin
    IF NOT is_super_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Only super admins can change pharmacy ownership';
    END IF;

    -- Récupérer l'ancien propriétaire
    SELECT owner_id INTO v_old_owner_id
    FROM pharmacies
    WHERE id = p_pharmacy_id;

    -- Mettre à jour le propriétaire
    UPDATE pharmacies
    SET owner_id = p_new_owner_id,
        updated_at = NOW()
    WHERE id = p_pharmacy_id;

    -- Attribuer le rôle pharmacy_admin au nouveau propriétaire
    UPDATE users
    SET role = 'pharmacy_admin',
        updated_at = NOW()
    WHERE id = p_new_owner_id
    AND role = 'user';

    -- Si l'ancien propriétaire n'a plus de pharmacies, repasser son rôle à 'user'
    IF v_old_owner_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM pharmacies WHERE owner_id = v_old_owner_id) THEN
            UPDATE users
            SET role = 'user',
                updated_at = NOW()
            WHERE id = v_old_owner_id
            AND role = 'pharmacy_admin';
        END IF;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour activer/désactiver une pharmacie
CREATE OR REPLACE FUNCTION toggle_pharmacy_status(
    p_pharmacy_id UUID,
    p_is_active BOOLEAN,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que l'admin est bien un super admin
    IF NOT is_super_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Only super admins can change pharmacy status';
    END IF;

    -- Mettre à jour le statut
    UPDATE pharmacies
    SET is_active = p_is_active,
        updated_at = NOW()
    WHERE id = p_pharmacy_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. VUE ENRICHIE POUR LA GESTION DES PHARMACIES
-- ========================================

-- Supprimer la vue si elle existe
DROP VIEW IF EXISTS admin_pharmacies_view CASCADE;

-- Créer la vue enrichie
CREATE OR REPLACE VIEW admin_pharmacies_view AS
SELECT 
    p.id,
    p.name,
    p.address,
    p.city,
    p.postal_code,
    p.phone,
    p.email,
    p.latitude,
    p.longitude,
    p.is_24_7,
    p.has_parking,
    p.owner_id,
    p.is_approved,
    p.is_active,
    p.approved_at,
    p.approved_by,
    p.created_at,
    p.updated_at,
    -- Informations du propriétaire
    owner.email as owner_email,
    owner_profile.full_name as owner_name,
    owner_profile.phone as owner_phone,
    owner.role as owner_role,
    -- Informations de l'approbateur
    approver.email as approved_by_email,
    approver_profile.full_name as approved_by_name,
    -- Statistiques
    (SELECT COUNT(*) FROM products WHERE pharmacy_id = p.id) as products_count,
    (SELECT COUNT(*) FROM orders WHERE pharmacy_id = p.id) as orders_count
FROM pharmacies p
LEFT JOIN users owner ON p.owner_id = owner.id
LEFT JOIN user_profiles owner_profile ON owner.id = owner_profile.user_id
LEFT JOIN users approver ON p.approved_by = approver.id
LEFT JOIN user_profiles approver_profile ON approver.id = approver_profile.user_id
ORDER BY p.created_at DESC;

-- ========================================
-- 6. POLITIQUES RLS MISES À JOUR
-- ========================================

-- Activer RLS sur la table pharmacies si ce n'est pas déjà fait
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Super admins can view all pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Super admins can manage pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Pharmacy admins can view their pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Pharmacy admins can update their pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Public can view approved active pharmacies" ON pharmacies;

-- Politique: Les super admins peuvent voir toutes les pharmacies
CREATE POLICY "Super admins can view all pharmacies"
ON pharmacies FOR SELECT
USING (is_super_admin(auth.uid()));

-- Politique: Les super admins peuvent gérer toutes les pharmacies
CREATE POLICY "Super admins can manage pharmacies"
ON pharmacies FOR ALL
USING (is_super_admin(auth.uid()));

-- Politique: Les pharmacy admins peuvent voir leurs pharmacies
CREATE POLICY "Pharmacy admins can view their pharmacies"
ON pharmacies FOR SELECT
USING (
    owner_id = auth.uid()
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'pharmacy_admin')
);

-- Politique: Les pharmacy admins peuvent modifier leurs pharmacies
CREATE POLICY "Pharmacy admins can update their pharmacies"
ON pharmacies FOR UPDATE
USING (
    owner_id = auth.uid()
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'pharmacy_admin')
);

-- Politique: Le public peut voir les pharmacies approuvées et actives
CREATE POLICY "Public can view approved active pharmacies"
ON pharmacies FOR SELECT
USING (is_approved = true AND is_active = true);

-- ========================================
-- 7. TRIGGER POUR MISE À JOUR AUTOMATIQUE
-- ========================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_pharmacies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe
DROP TRIGGER IF EXISTS trigger_update_pharmacies_timestamp ON pharmacies;

-- Créer le trigger
CREATE TRIGGER trigger_update_pharmacies_timestamp
BEFORE UPDATE ON pharmacies
FOR EACH ROW
EXECUTE FUNCTION update_pharmacies_updated_at();

-- ========================================
-- 8. COMMENTAIRES
-- ========================================

COMMENT ON COLUMN pharmacies.owner_id IS 'ID du propriétaire de la pharmacie (pharmacy_admin)';
COMMENT ON COLUMN pharmacies.is_approved IS 'Indique si la pharmacie a été approuvée par un super admin';
COMMENT ON COLUMN pharmacies.is_active IS 'Indique si la pharmacie est active';
COMMENT ON COLUMN pharmacies.approved_at IS 'Date et heure d''approbation de la pharmacie';
COMMENT ON COLUMN pharmacies.approved_by IS 'ID du super admin qui a approuvé la pharmacie';
COMMENT ON FUNCTION assign_pharmacy_admin_role IS 'Attribue automatiquement le rôle pharmacy_admin au propriétaire';
COMMENT ON FUNCTION approve_pharmacy IS 'Approuve une pharmacie (super admin uniquement)';
COMMENT ON FUNCTION change_pharmacy_owner IS 'Change le propriétaire d''une pharmacie (super admin uniquement)';
COMMENT ON FUNCTION toggle_pharmacy_status IS 'Active/désactive une pharmacie (super admin uniquement)';
COMMENT ON VIEW admin_pharmacies_view IS 'Vue complète pour la gestion des pharmacies par le super admin';
