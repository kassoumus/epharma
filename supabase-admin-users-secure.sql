-- ========================================
-- SÉCURISATION - ADMIN USERS VIEW
-- Remplace la vue vulnérable par une fonction sécurisée
-- ========================================

-- ========================================
-- 1. SUPPRIMER LA VUE VULNÉRABLE
-- ========================================

DROP VIEW IF EXISTS admin_users_view CASCADE;

-- ========================================
-- 2. CRÉER UNE FONCTION SÉCURISÉE
-- ========================================

CREATE OR REPLACE FUNCTION get_admin_users_list()
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    email_confirmed_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    full_name TEXT,
    phone TEXT,
    city TEXT,
    address TEXT,
    role TEXT,
    is_active BOOLEAN,
    last_login TIMESTAMPTZ,
    user_type TEXT,
    email_status TEXT
) AS $$
BEGIN
    -- Vérifier que l'utilisateur connecté est un admin
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: admin role required'
            USING HINT = 'Only users with admin role can access this function';
    END IF;

    -- Retourner les données si l'utilisateur est autorisé
    RETURN QUERY
    SELECT 
        u.id,
        u.email::TEXT,
        u.created_at,
        u.last_sign_in_at,
        u.email_confirmed_at,
        u.confirmed_at,
        up.full_name,
        up.phone,
        up.city,
        up.address,
        COALESCE(users_table.role, users_table.user_type, 'patient')::TEXT as role,
        COALESCE(users_table.is_active, true) as is_active,
        users_table.last_login,
        users_table.user_type,
        CASE 
            WHEN u.email_confirmed_at IS NOT NULL THEN 'confirmed'
            ELSE 'pending'
        END::TEXT as email_status
    FROM auth.users u
    LEFT JOIN public.user_profiles up ON u.id = up.user_id
    LEFT JOIN public.users users_table ON u.id = users_table.id
    ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 3. CONFIGURER LES PERMISSIONS
-- ========================================

-- Révoquer tous les accès publics
REVOKE ALL ON FUNCTION get_admin_users_list() FROM PUBLIC;
REVOKE ALL ON FUNCTION get_admin_users_list() FROM anon;

-- Accorder l'exécution uniquement aux utilisateurs authentifiés
-- (la fonction elle-même vérifie le rôle admin)
GRANT EXECUTE ON FUNCTION get_admin_users_list() TO authenticated;

-- ========================================
-- 4. AJOUTER DES COMMENTAIRES
-- ========================================

COMMENT ON FUNCTION get_admin_users_list IS 
'Fonction sécurisée pour récupérer la liste complète des utilisateurs.
Accessible uniquement aux utilisateurs avec le rôle admin.
Remplace la vue admin_users_view qui était vulnérable.';

-- ========================================
-- 5. VÉRIFICATION DE SÉCURITÉ
-- ========================================

-- Vérifier que la vue n'existe plus
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users_view'
    ) THEN
        RAISE WARNING 'La vue admin_users_view existe encore! Elle devrait être supprimée.';
    ELSE
        RAISE NOTICE 'Sécurisation réussie: la vue admin_users_view a été supprimée.';
    END IF;
END $$;

-- Vérifier que la fonction existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'get_admin_users_list'
    ) THEN
        RAISE NOTICE 'Fonction get_admin_users_list créée avec succès.';
    ELSE
        RAISE WARNING 'La fonction get_admin_users_list n''a pas été créée!';
    END IF;
END $$;
