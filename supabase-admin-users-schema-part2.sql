-- ========================================
-- SUPER ADMIN - USER MANAGEMENT SCHEMA
-- PARTIE 2: Vue, Fonctions et Politiques RLS
-- Exécutez cette partie APRÈS la partie 1
-- ========================================

-- ========================================
-- VUE POUR LE SUPER ADMIN
-- ========================================

-- Vue combinant auth.users et user_profiles pour une gestion facile
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    u.confirmed_at,
    up.full_name,
    up.phone,
    up.city,
    up.address,
    COALESCE(users_table.role, 'patient') as role,
    COALESCE(users_table.is_active, true) as is_active,
    users_table.last_login,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN 'confirmed'
        ELSE 'pending'
    END as email_status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN users users_table ON u.id = users_table.id
ORDER BY u.created_at DESC;

-- ========================================
-- FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour mettre à jour le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION update_user_role(
    p_user_id UUID,
    p_new_role VARCHAR(20)
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que le rôle est valide
    IF p_new_role NOT IN ('patient', 'pharmacy', 'doctor', 'admin') THEN
        RAISE EXCEPTION 'Invalid role: %', p_new_role;
    END IF;

    -- Mettre à jour ou insérer le rôle
    INSERT INTO users (id, email, role, user_type)
    SELECT id, email, p_new_role, p_new_role
    FROM auth.users
    WHERE id = p_user_id
    ON CONFLICT (id) DO UPDATE
    SET role = p_new_role,
        user_type = p_new_role,
        updated_at = NOW();

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour activer/désactiver un utilisateur
CREATE OR REPLACE FUNCTION toggle_user_status(
    p_user_id UUID,
    p_is_active BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users
    SET is_active = p_is_active,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can update user roles" ON users;
DROP POLICY IF EXISTS "Super admins can delete users" ON users;

-- Politique pour que les super-admins puissent voir tous les utilisateurs
CREATE POLICY "Super admins can view all users"
ON users FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
    OR id = auth.uid()
);

-- Politique pour que les super-admins puissent modifier les rôles
CREATE POLICY "Super admins can update user roles"
ON users FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Politique pour que les super-admins puissent supprimer des utilisateurs
CREATE POLICY "Super admins can delete users"
ON users FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
    AND id != auth.uid() -- Ne peut pas se supprimer soi-même
);

-- ========================================
-- COMMENTAIRES
-- ========================================

COMMENT ON COLUMN users.role IS 'Rôle de l''utilisateur: patient, pharmacy, doctor, admin';
COMMENT ON COLUMN users.is_active IS 'Indique si le compte utilisateur est actif';
COMMENT ON COLUMN users.last_login IS 'Date et heure de la dernière connexion';
COMMENT ON VIEW admin_users_view IS 'Vue pour le super-admin combinant auth.users et user_profiles';
COMMENT ON FUNCTION update_user_role IS 'Fonction pour mettre à jour le rôle d''un utilisateur';
COMMENT ON FUNCTION toggle_user_status IS 'Fonction pour activer/désactiver un compte utilisateur';
