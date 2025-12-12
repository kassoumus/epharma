-- ========================================
-- SUPER ADMIN - USER MANAGEMENT SCHEMA
-- PARTIE 1: Création des colonnes
-- Exécutez cette partie EN PREMIER
-- ========================================

-- Ajouter les colonnes pour la gestion des rôles
DO $$ 
BEGIN
    -- Ajouter colonne role si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'patient';
        
        -- Ajouter contrainte pour les rôles valides APRÈS avoir créé la colonne
        ALTER TABLE users ADD CONSTRAINT check_role 
        CHECK (role IN ('patient', 'pharmacy', 'doctor', 'admin'));
        
        -- Mettre à jour les utilisateurs existants
        UPDATE users SET role = 'patient' WHERE role IS NULL;
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
END $$;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
