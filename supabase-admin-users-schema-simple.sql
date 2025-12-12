-- ========================================
-- SUPER ADMIN - USER MANAGEMENT SCHEMA
-- VERSION SIMPLIFIÉE - Tout en un
-- ========================================

-- ========================================
-- 1. CRÉER LA TABLE USERS SI ELLE N'EXISTE PAS
-- ========================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_type VARCHAR(20) DEFAULT 'patient',
    role VARCHAR(20) DEFAULT 'patient',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_role CHECK (role IN ('patient', 'pharmacy', 'doctor', 'admin'))
);

-- ========================================
-- 2. AJOUTER LES COLONNES SI ELLES N'EXISTENT PAS
-- (Seulement si la table existait déjà sans ces colonnes)
-- ========================================

DO $$ 
BEGIN
    -- Ajouter colonne role si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'patient';
    END IF;

    -- Ajouter colonne is_active si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- Ajouter colonne last_login si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_login'
    ) THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Ajouter la contrainte check_role si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_role'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT check_role 
        CHECK (role IN ('patient', 'pharmacy', 'doctor', 'admin'));
    END IF;
END $$;

-- ========================================
-- 3. CRÉER LES INDEX
-- ========================================

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ========================================
-- 5. CRÉER LA VUE ADMIN
-- ========================================

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
-- 6. CRÉER LES FONCTIONS
-- ========================================

CREATE OR REPLACE FUNCTION update_user_role(
    p_user_id UUID,
    p_new_role VARCHAR(20)
)
RETURNS BOOLEAN AS $$
BEGIN
    IF p_new_role NOT IN ('patient', 'pharmacy', 'doctor', 'admin') THEN
        RAISE EXCEPTION 'Invalid role: %', p_new_role;
    END IF;

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
-- 7. ACTIVER RLS
-- ========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can update user roles" ON users;
DROP POLICY IF EXISTS "Super admins can delete users" ON users;

-- Créer les nouvelles politiques
CREATE POLICY "Super admins can view all users"
ON users FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
    OR id = auth.uid()
);

CREATE POLICY "Super admins can update user roles"
ON users FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Super admins can delete users"
ON users FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
    AND id != auth.uid()
);

-- ========================================
-- 8. COMMENTAIRES
-- ========================================

COMMENT ON TABLE users IS 'Table des utilisateurs avec rôles et statuts';
COMMENT ON COLUMN users.role IS 'Rôle: patient, pharmacy, doctor, admin';
COMMENT ON COLUMN users.is_active IS 'Compte actif ou non';
COMMENT ON VIEW admin_users_view IS 'Vue combinant auth.users et user_profiles';
