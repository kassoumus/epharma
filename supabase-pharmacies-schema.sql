-- ========================================
-- SUPER ADMIN - GESTION DES PHARMACIES
-- Vues et Fonctions SQL
-- ========================================

-- ========================================
-- 1. VUE ADMIN PHARMACIES
-- ========================================

-- Vue combinant pharmacies et utilisateurs pour une gestion facile
CREATE OR REPLACE VIEW admin_pharmacies_view AS
SELECT 
    p.id,
    p.user_id,
    p.name,
    p.address,
    p.city,
    p.postal_code,
    p.phone,
    p.email,
    p.latitude,
    p.longitude,
    p.is_open_24_7,
    p.has_parking,
    p.rating,
    p.reviews_count,
    p.created_at,
    p.updated_at,
    u.email as user_email,
    u.role as user_role,
    u.is_active as user_is_active,
    CASE 
        WHEN u.id IS NOT NULL THEN true
        ELSE false
    END as has_user
FROM public.pharmacies p
LEFT JOIN public.users u ON p.user_id = u.id
ORDER BY p.created_at DESC;

-- ========================================
-- 2. FONCTION: CRÉER PHARMACIE AVEC UTILISATEUR
-- ========================================

CREATE OR REPLACE FUNCTION create_pharmacy_with_user(
    p_user_id UUID,
    p_pharmacy_name VARCHAR,
    p_address VARCHAR,
    p_city VARCHAR,
    p_phone VARCHAR,
    p_postal_code VARCHAR DEFAULT NULL,
    p_email VARCHAR DEFAULT NULL,
    p_latitude NUMERIC DEFAULT NULL,
    p_longitude NUMERIC DEFAULT NULL,
    p_is_open_24_7 BOOLEAN DEFAULT false,
    p_has_parking BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
    v_pharmacy_id UUID;
BEGIN
    -- Vérifier que l'utilisateur existe et a le bon rôle
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = p_user_id AND role = 'pharmacy'
    ) THEN
        RAISE EXCEPTION 'Utilisateur invalide ou rôle incorrect';
    END IF;

    -- Vérifier que l'utilisateur n'a pas déjà une pharmacie
    IF EXISTS (
        SELECT 1 FROM public.pharmacies WHERE user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Cet utilisateur gère déjà une pharmacie';
    END IF;

    -- Créer la pharmacie
    INSERT INTO public.pharmacies (
        user_id,
        name,
        address,
        city,
        postal_code,
        phone,
        email,
        latitude,
        longitude,
        is_open_24_7,
        has_parking
    )
    VALUES (
        p_user_id,
        p_pharmacy_name,
        p_address,
        p_city,
        p_postal_code,
        p_phone,
        p_email,
        p_latitude,
        p_longitude,
        p_is_open_24_7,
        p_has_parking
    )
    RETURNING id INTO v_pharmacy_id;

    RETURN v_pharmacy_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 3. FONCTION: CRÉER PHARMACIE SANS UTILISATEUR
-- ========================================

CREATE OR REPLACE FUNCTION create_pharmacy_standalone(
    p_pharmacy_name VARCHAR,
    p_address VARCHAR,
    p_city VARCHAR,
    p_phone VARCHAR,
    p_postal_code VARCHAR DEFAULT NULL,
    p_email VARCHAR DEFAULT NULL,
    p_latitude NUMERIC DEFAULT NULL,
    p_longitude NUMERIC DEFAULT NULL,
    p_is_open_24_7 BOOLEAN DEFAULT false,
    p_has_parking BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
    v_pharmacy_id UUID;
BEGIN
    -- Créer la pharmacie sans user_id
    INSERT INTO public.pharmacies (
        name,
        address,
        city,
        postal_code,
        phone,
        email,
        latitude,
        longitude,
        is_open_24_7,
        has_parking
    )
    VALUES (
        p_pharmacy_name,
        p_address,
        p_city,
        p_postal_code,
        p_phone,
        p_email,
        p_latitude,
        p_longitude,
        p_is_open_24_7,
        p_has_parking
    )
    RETURNING id INTO v_pharmacy_id;

    RETURN v_pharmacy_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 4. FONCTION: METTRE À JOUR PHARMACIE
-- ========================================

CREATE OR REPLACE FUNCTION update_pharmacy(
    p_pharmacy_id UUID,
    p_name VARCHAR DEFAULT NULL,
    p_address VARCHAR DEFAULT NULL,
    p_city VARCHAR DEFAULT NULL,
    p_postal_code VARCHAR DEFAULT NULL,
    p_phone VARCHAR DEFAULT NULL,
    p_email VARCHAR DEFAULT NULL,
    p_latitude NUMERIC DEFAULT NULL,
    p_longitude NUMERIC DEFAULT NULL,
    p_is_open_24_7 BOOLEAN DEFAULT NULL,
    p_has_parking BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.pharmacies
    SET 
        name = COALESCE(p_name, name),
        address = COALESCE(p_address, address),
        city = COALESCE(p_city, city),
        postal_code = COALESCE(p_postal_code, postal_code),
        phone = COALESCE(p_phone, phone),
        email = COALESCE(p_email, email),
        latitude = COALESCE(p_latitude, latitude),
        longitude = COALESCE(p_longitude, longitude),
        is_open_24_7 = COALESCE(p_is_open_24_7, is_open_24_7),
        has_parking = COALESCE(p_has_parking, has_parking),
        updated_at = NOW()
    WHERE id = p_pharmacy_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. FONCTION: AFFECTER UTILISATEUR À PHARMACIE
-- ========================================

CREATE OR REPLACE FUNCTION assign_user_to_pharmacy(
    p_pharmacy_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que l'utilisateur existe et a le bon rôle
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = p_user_id AND role = 'pharmacy'
    ) THEN
        RAISE EXCEPTION 'Utilisateur invalide ou rôle incorrect';
    END IF;

    -- Vérifier que l'utilisateur n'a pas déjà une pharmacie
    IF EXISTS (
        SELECT 1 FROM public.pharmacies 
        WHERE user_id = p_user_id AND id != p_pharmacy_id
    ) THEN
        RAISE EXCEPTION 'Cet utilisateur gère déjà une autre pharmacie';
    END IF;

    -- Affecter l'utilisateur
    UPDATE public.pharmacies
    SET user_id = p_user_id,
        updated_at = NOW()
    WHERE id = p_pharmacy_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 6. FONCTION: RETIRER UTILISATEUR DE PHARMACIE
-- ========================================

CREATE OR REPLACE FUNCTION remove_user_from_pharmacy(
    p_pharmacy_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.pharmacies
    SET user_id = NULL,
        updated_at = NOW()
    WHERE id = p_pharmacy_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 7. FONCTION: SUPPRIMER PHARMACIE
-- ========================================

CREATE OR REPLACE FUNCTION delete_pharmacy(
    p_pharmacy_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Supprimer les produits associés
    DELETE FROM public.products WHERE pharmacy_id = p_pharmacy_id;
    
    -- Supprimer les réservations associées
    DELETE FROM public.reservations WHERE pharmacy_id = p_pharmacy_id;
    
    -- Supprimer les avis associés
    DELETE FROM public.reviews 
    WHERE entity_type = 'pharmacy' AND entity_id = p_pharmacy_id;
    
    -- Supprimer la pharmacie
    DELETE FROM public.pharmacies WHERE id = p_pharmacy_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 8. FONCTION: OBTENIR STATISTIQUES PHARMACIES
-- ========================================

CREATE OR REPLACE FUNCTION get_pharmacies_stats()
RETURNS TABLE (
    total_pharmacies BIGINT,
    active_pharmacies BIGINT,
    pharmacies_24_7 BIGINT,
    pharmacies_with_parking BIGINT,
    pharmacies_with_user BIGINT,
    pharmacies_without_user BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_pharmacies,
        COUNT(*) FILTER (WHERE user_id IS NOT NULL)::BIGINT as active_pharmacies,
        COUNT(*) FILTER (WHERE is_open_24_7 = true)::BIGINT as pharmacies_24_7,
        COUNT(*) FILTER (WHERE has_parking = true)::BIGINT as pharmacies_with_parking,
        COUNT(*) FILTER (WHERE user_id IS NOT NULL)::BIGINT as pharmacies_with_user,
        COUNT(*) FILTER (WHERE user_id IS NULL)::BIGINT as pharmacies_without_user
    FROM public.pharmacies;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 9. COMMENTAIRES
-- ========================================

COMMENT ON VIEW admin_pharmacies_view IS 'Vue combinant pharmacies et utilisateurs pour le super-admin';
COMMENT ON FUNCTION create_pharmacy_with_user IS 'Créer une pharmacie avec un utilisateur existant';
COMMENT ON FUNCTION create_pharmacy_standalone IS 'Créer une pharmacie sans utilisateur';
COMMENT ON FUNCTION update_pharmacy IS 'Mettre à jour les informations d''une pharmacie';
COMMENT ON FUNCTION assign_user_to_pharmacy IS 'Affecter un utilisateur à une pharmacie';
COMMENT ON FUNCTION remove_user_from_pharmacy IS 'Retirer l''utilisateur d''une pharmacie';
COMMENT ON FUNCTION delete_pharmacy IS 'Supprimer une pharmacie et toutes ses données associées';
COMMENT ON FUNCTION get_pharmacies_stats IS 'Obtenir les statistiques des pharmacies';
