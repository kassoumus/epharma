-- ========================================
-- E-PHARMA - ROLE-BASED ACCESS CONTROL SCHEMA
-- Phase 1: Système de Rôles et Permissions
-- ========================================

-- ========================================
-- 1. CRÉATION DU TYPE ENUM POUR LES RÔLES
-- ========================================

-- Supprimer le type s'il existe déjà
DROP TYPE IF EXISTS user_role CASCADE;

-- Créer le type ENUM pour les rôles
CREATE TYPE user_role AS ENUM (
    'super_admin',           -- Gestion globale de la plateforme
    'pharmacy_admin',        -- Propriétaire/Gérant de pharmacie
    'health_center_admin',   -- Gérant de centre de santé/hôpital
    'doctor',               -- Médecin prescripteur
    'user'                  -- Utilisateur final (patient)
);

-- ========================================
-- 2. MISE À JOUR DE LA TABLE USERS
-- ========================================

-- Ajouter les nouvelles colonnes si elles n'existent pas
DO $$ 
BEGIN
    -- Ajouter la colonne role
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role user_role DEFAULT 'user';
    END IF;

    -- Ajouter la colonne is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- Ajouter la colonne is_approved
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_approved') THEN
        ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT false;
    END IF;

    -- Ajouter la colonne approved_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='approved_at') THEN
        ALTER TABLE users ADD COLUMN approved_at TIMESTAMPTZ;
    END IF;

    -- Ajouter la colonne approved_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='approved_by') THEN
        ALTER TABLE users ADD COLUMN approved_by UUID REFERENCES users(id);
    END IF;
END $$;

-- ========================================
-- 3. CRÉATION DES INDEX POUR OPTIMISATION
-- ========================================

-- Index sur le rôle pour les requêtes de filtrage
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Index sur le statut actif
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Index sur le statut d'approbation
CREATE INDEX IF NOT EXISTS idx_users_is_approved ON users(is_approved);

-- Index composite pour les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);

-- ========================================
-- 4. FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour vérifier si un utilisateur est super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id AND role = 'super_admin' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION update_user_role(
    p_user_id UUID,
    p_new_role user_role,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que l'admin est bien un super admin
    IF NOT is_super_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Only super admins can update user roles';
    END IF;

    -- Empêcher la modification du dernier super admin
    IF p_new_role != 'super_admin' THEN
        IF (SELECT COUNT(*) FROM users WHERE role = 'super_admin' AND is_active = true) <= 1 
           AND (SELECT role FROM users WHERE id = p_user_id) = 'super_admin' THEN
            RAISE EXCEPTION 'Cannot change role of the last super admin';
        END IF;
    END IF;

    -- Mettre à jour le rôle
    UPDATE users
    SET role = p_new_role,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour approuver un utilisateur
CREATE OR REPLACE FUNCTION approve_user(
    p_user_id UUID,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que l'admin est bien un super admin
    IF NOT is_super_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Only super admins can approve users';
    END IF;

    -- Approuver l'utilisateur
    UPDATE users
    SET is_approved = true,
        approved_at = NOW(),
        approved_by = p_admin_id,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour activer/désactiver un utilisateur
CREATE OR REPLACE FUNCTION toggle_user_active_status(
    p_user_id UUID,
    p_is_active BOOLEAN,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que l'admin est bien un super admin
    IF NOT is_super_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Only super admins can change user status';
    END IF;

    -- Empêcher la désactivation du dernier super admin
    IF NOT p_is_active THEN
        IF (SELECT COUNT(*) FROM users WHERE role = 'super_admin' AND is_active = true) <= 1 
           AND (SELECT role FROM users WHERE id = p_user_id) = 'super_admin' THEN
            RAISE EXCEPTION 'Cannot deactivate the last super admin';
        END IF;
    END IF;

    -- Mettre à jour le statut
    UPDATE users
    SET is_active = p_is_active,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. VUE AMÉLIORÉE POUR LE SUPER ADMIN
-- ========================================


-- Supprimer la vue existante si elle existe
DROP VIEW IF EXISTS admin_users_view CASCADE;

-- Créer la vue améliorée
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    users_table.role,
    users_table.is_active,
    users_table.is_approved,
    users_table.approved_at,
    users_table.approved_by,
    approver.email as approved_by_email,
    up.full_name,
    up.phone,
    up.city,
    up.address,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN 'confirmed'
        ELSE 'pending'
    END as email_status,
    -- Compter les entités liées selon le rôle
    CASE users_table.role
        WHEN 'pharmacy_admin' THEN (SELECT COUNT(*) FROM pharmacies WHERE owner_id = u.id)
        WHEN 'health_center_admin' THEN (SELECT COUNT(*) FROM health_centers WHERE manager_id = u.id)
        WHEN 'doctor' THEN (SELECT COUNT(*) FROM doctors WHERE user_id = u.id)
        ELSE 0
    END as linked_entities_count
FROM auth.users u
LEFT JOIN users users_table ON u.id = users_table.id
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN users approver ON users_table.approved_by = approver.id
ORDER BY u.created_at DESC;


-- ========================================
-- 6. POLITIQUES RLS MISES À JOUR
-- ========================================

-- Activer RLS sur la table users si ce n'est pas déjà fait
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can update user roles" ON users;
DROP POLICY IF EXISTS "Super admins can delete users" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Super admins can insert users" ON users;

-- Politique: Les super admins peuvent voir tous les utilisateurs
CREATE POLICY "Super admins can view all users"
ON users FOR SELECT
USING (
    is_super_admin(auth.uid())
    OR id = auth.uid()
);

-- Politique: Les super admins peuvent modifier les utilisateurs
CREATE POLICY "Super admins can update users"
ON users FOR UPDATE
USING (is_super_admin(auth.uid()));

-- Politique: Les super admins peuvent supprimer des utilisateurs (sauf eux-mêmes)
CREATE POLICY "Super admins can delete users"
ON users FOR DELETE
USING (
    is_super_admin(auth.uid())
    AND id != auth.uid()
);

-- Politique: Les super admins peuvent créer des utilisateurs
CREATE POLICY "Super admins can insert users"
ON users FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));

-- Politique: Les utilisateurs peuvent voir leurs propres données
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (id = auth.uid());

-- ========================================
-- 7. COMMENTAIRES
-- ========================================

COMMENT ON TYPE user_role IS 'Rôles disponibles dans la plateforme E-Pharma';
COMMENT ON COLUMN users.role IS 'Rôle de l''utilisateur dans le système';
COMMENT ON COLUMN users.is_active IS 'Indique si le compte utilisateur est actif';
COMMENT ON COLUMN users.is_approved IS 'Indique si le compte a été approuvé par un super admin';
COMMENT ON COLUMN users.approved_at IS 'Date et heure d''approbation du compte';
COMMENT ON COLUMN users.approved_by IS 'ID du super admin qui a approuvé le compte';
COMMENT ON FUNCTION is_super_admin IS 'Vérifie si un utilisateur est super admin actif';
COMMENT ON FUNCTION update_user_role IS 'Met à jour le rôle d''un utilisateur (super admin uniquement)';
COMMENT ON FUNCTION approve_user IS 'Approuve un compte utilisateur (super admin uniquement)';
COMMENT ON FUNCTION toggle_user_active_status IS 'Active/désactive un compte utilisateur (super admin uniquement)';
COMMENT ON VIEW admin_users_view IS 'Vue complète pour la gestion des utilisateurs par le super admin';

-- ========================================
-- 8. DONNÉES DE TEST (OPTIONNEL)
-- ========================================

-- Créer un super admin de test si nécessaire
-- ATTENTION: À exécuter uniquement en développement
-- Décommentez les lignes suivantes si vous voulez créer un super admin de test

/*
INSERT INTO users (id, email, role, is_active, is_approved)
SELECT 
    id, 
    email, 
    'super_admin'::user_role, 
    true, 
    true
FROM auth.users
WHERE email = 'superadmin@epharma.com'
ON CONFLICT (id) DO UPDATE
SET role = 'super_admin',
    is_active = true,
    is_approved = true;
*/
