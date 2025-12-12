-- ========================================
-- EPHARMA - USER PROFILE MANAGEMENT SCHEMA
-- Extension du schéma existant pour la gestion des profils utilisateurs
-- ========================================

-- ========================================
-- TABLE: user_profiles
-- Profils détaillés des utilisateurs (patients)
-- ========================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100) DEFAULT 'Niamey',
    address TEXT,
    avatar_url TEXT,
    default_location VARCHAR(100) DEFAULT 'Niamey',
    search_radius INTEGER DEFAULT 5, -- en km
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: user_favorites
-- Favoris des utilisateurs (pharmacies, médecins, centres de santé)
-- ========================================
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    favorite_type VARCHAR(20) NOT NULL CHECK (favorite_type IN ('pharmacy', 'doctor', 'health_center')),
    favorite_id VARCHAR(100) NOT NULL, -- ID de l'entité favorite
    favorite_name VARCHAR(255) NOT NULL,
    favorite_address TEXT,
    favorite_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, favorite_type, favorite_id)
);

-- ========================================
-- TABLE: user_search_history
-- Historique des recherches des utilisateurs
-- ========================================
CREATE TABLE IF NOT EXISTS user_search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    search_type VARCHAR(20) NOT NULL CHECK (search_type IN ('pharmacy', 'doctor', 'health_center')),
    search_query TEXT,
    location VARCHAR(100),
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES pour optimiser les performances
-- ========================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_city ON user_profiles(city);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_type ON user_favorites(favorite_type);
CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_created_at ON user_search_history(created_at DESC);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_history ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_profiles
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
    ON user_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- Politiques pour user_favorites
CREATE POLICY "Users can view own favorites"
    ON user_favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
    ON user_favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
    ON user_favorites FOR DELETE
    USING (auth.uid() = user_id);

-- Politiques pour user_search_history
CREATE POLICY "Users can view own search history"
    ON user_search_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history"
    ON user_search_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own search history"
    ON user_search_history FOR DELETE
    USING (auth.uid() = user_id);

-- ========================================
-- FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour limiter l'historique à 50 entrées par utilisateur
CREATE OR REPLACE FUNCTION limit_search_history()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM user_search_history
    WHERE user_id = NEW.user_id
    AND id NOT IN (
        SELECT id FROM user_search_history
        WHERE user_id = NEW.user_id
        ORDER BY created_at DESC
        LIMIT 50
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour limiter l'historique
DROP TRIGGER IF EXISTS limit_user_search_history ON user_search_history;
CREATE TRIGGER limit_user_search_history
    AFTER INSERT ON user_search_history
    FOR EACH ROW
    EXECUTE FUNCTION limit_search_history();

-- ========================================
-- COMMENTAIRES
-- ========================================
COMMENT ON TABLE user_profiles IS 'Profils détaillés des utilisateurs (patients)';
COMMENT ON TABLE user_favorites IS 'Favoris des utilisateurs (pharmacies, médecins, centres)';
COMMENT ON TABLE user_search_history IS 'Historique des recherches (limité à 50 par utilisateur)';
