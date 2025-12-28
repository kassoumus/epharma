-- ========================================
-- CRÉATION D'UN SUPER UTILISATEUR ADMIN
-- Script SQL pour Supabase
-- ========================================

-- ⚠️ IMPORTANT: Ce script crée un utilisateur directement dans la base de données
-- Pour une meilleure sécurité, utilisez plutôt l'interface Supabase Authentication

-- ========================================
-- OPTION 1: Création via l'interface Supabase (RECOMMANDÉ)
-- ========================================
-- 1. Allez dans Authentication → Users
-- 2. Cliquez sur "Add user" → "Create new user"
-- 3. Email: admin@epharma.com
-- 4. Password: VotreMotDePasseSecurise123!
-- 5. Cochez "Auto Confirm User"
-- 6. Cliquez sur "Create user"

-- ========================================
-- OPTION 2: Insertion manuelle dans la table users (si elle existe)
-- ========================================

-- Vérifier si la table users existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Insérer un super admin
        INSERT INTO users (email, user_type, created_at, updated_at)
        VALUES (
            'admin@epharma.com',
            'admin',
            NOW(),
            NOW()
        )
        ON CONFLICT (email) DO NOTHING;
        
        RAISE NOTICE 'Super utilisateur créé avec succès';
    ELSE
        RAISE NOTICE 'La table users n''existe pas. Utilisez l''interface Supabase Authentication.';
    END IF;
END $$;

-- ========================================
-- OPTION 3: Créer un profil utilisateur patient (pour tester le système)
-- ========================================

-- Note: Vous devez d'abord créer l'utilisateur via Supabase Authentication
-- Ensuite, récupérez son UUID et insérez son profil

-- Exemple (remplacez 'USER_UUID_ICI' par l'UUID réel de l'utilisateur)
/*
INSERT INTO user_profiles (
    user_id,
    full_name,
    phone,
    city,
    address,
    default_location,
    search_radius
)
VALUES (
    'USER_UUID_ICI'::uuid,  -- Remplacez par l'UUID de l'utilisateur créé
    'Super Admin',
    '+227 90 00 00 00',
    'Niamey',
    'Bureau Central, Niamey',
    'Niamey',
    10
)
ON CONFLICT (user_id) DO NOTHING;
*/

-- ========================================
-- VÉRIFICATION
-- ========================================

-- Vérifier les utilisateurs dans la table users (si elle existe)
SELECT email, user_type, created_at 
FROM users 
WHERE user_type = 'admin'
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- INSTRUCTIONS DÉTAILLÉES
-- ========================================

/*
MÉTHODE RECOMMANDÉE - Via l'interface Supabase:

1. Connectez-vous à Supabase Dashboard
2. Allez dans votre projet Epharma
3. Cliquez sur "Authentication" dans le menu de gauche
4. Cliquez sur "Users"
5. Cliquez sur "Add user" (bouton vert en haut à droite)
6. Sélectionnez "Create new user"
7. Remplissez:
   - Email: admin@epharma.com
   - Password: ChoisissezUnMotDePasseSecurise123!
   - ✅ Cochez "Auto Confirm User"
8. Cliquez sur "Create user"

RÉSULTAT:
- L'utilisateur sera créé dans auth.users
- Vous recevrez un UUID unique
- L'utilisateur pourra se connecter immédiatement

POUR CRÉER LE PROFIL UTILISATEUR:
Après avoir créé l'utilisateur, copiez son UUID et exécutez:

INSERT INTO user_profiles (user_id, full_name, phone, city)
VALUES ('UUID_COPIE_ICI'::uuid, 'Admin Epharma', '+227 90 00 00 00', 'Niamey');

*/

-- ========================================
-- COMPTES DE DÉMONSTRATION SUGGÉRÉS
-- ========================================

/*
SUPER ADMIN:
Email: admin@epharma.com
Password: Admin@Epharma2025!

UTILISATEUR TEST:
Email: test@epharma.com
Password: Test@Epharma2025!

PHARMACIE DEMO:
Email: contact@pharmacie-republique.fr
Password: Pharma@Demo2025!

MÉDECIN DEMO:
Email: dr.moussa@epharma.com
Password: Doctor@Demo2025!
*/

-- ========================================
-- NOTES DE SÉCURITÉ
-- ========================================

/*
⚠️ IMPORTANT:
1. Ne partagez JAMAIS ces identifiants publiquement
2. Changez les mots de passe par défaut immédiatement
3. Utilisez des mots de passe forts (min 12 caractères)
4. Activez l'authentification à deux facteurs si disponible
5. Créez des utilisateurs différents pour dev/staging/production
*/
