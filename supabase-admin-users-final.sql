-- ========================================
-- SUPER ADMIN - USER MANAGEMENT SCHEMA
-- VERSION FINALE - Pour table users existante
-- ========================================

-- ========================================
-- 1. AJOUTER LES COLONNES MANQUANTES
-- ========================================

-- Ajouter colonne role (basée sur user_type)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'patient';

-- Ajouter colonne is_active
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ajouter colonne last_login
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- ========================================
-- 2. COPIER user_type VERS role
-- ========================================

UPDATE public.users 
SET role = user_type 
WHERE role IS NULL OR role = 'patient';

-- ========================================
-- 3. AJOUTER LA CONTRAINTE
-- ========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_role'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT check_role 
        CHECK (role IN ('patient', 'pharmacy', 'doctor', 'admin'));
    END IF;
END $$;

-- ========================================
-- 4. CRÉER LES INDEX
-- ========================================

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

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
    COALESCE(users_table.role, users_table.user_type, 'patient') as role,
    COALESCE(users_table.is_active, true) as is_active,
    users_table.last_login,
    users_table.user_type,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN 'confirmed'
        ELSE 'pending'
    END as email_status
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
LEFT JOIN public.users users_table ON u.id = users_table.id
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

    UPDATE public.users
    SET role = p_new_role,
        user_type = p_new_role,
        updated_at = NOW()
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        INSERT INTO public.users (id, email, role, user_type)
        SELECT id, email, p_new_role, p_new_role
        FROM auth.users
        WHERE id = p_user_id;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION toggle_user_status(
    p_user_id UUID,
    p_is_active BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.users
    SET is_active = p_is_active,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 7. ACTIVER RLS
-- ========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can update user roles" ON public.users;
DROP POLICY IF EXISTS "Super admins can delete users" ON public.users;

-- Créer les nouvelles politiques
CREATE POLICY "Super admins can view all users"
ON public.users FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
    OR id = auth.uid()
);

CREATE POLICY "Super admins can update user roles"
ON public.users FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Super admins can delete users"
ON public.users FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
    AND id != auth.uid()
);

-- ========================================
-- 8. COMMENTAIRES
-- ========================================

COMMENT ON COLUMN public.users.role IS 'Rôle: patient, pharmacy, doctor, admin';
COMMENT ON COLUMN public.users.is_active IS 'Compte actif ou non';
COMMENT ON VIEW admin_users_view IS 'Vue combinant auth.users et user_profiles pour super-admin';
COMMENT ON FUNCTION update_user_role IS 'Fonction pour mettre à jour le rôle d''un utilisateur';
COMMENT ON FUNCTION toggle_user_status IS 'Fonction pour activer/désactiver un compte';
