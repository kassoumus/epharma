-- ========================================
-- E-PHARMA - APPOINTMENTS SCHEMA
-- Module Rendez-vous en Ligne
-- ========================================

-- ========================================
-- 1. CRÉATION DE LA TABLE APPOINTMENTS
-- ========================================

-- Supprimer la table si elle existe (ATTENTION: perte de données)
-- DROP TABLE IF EXISTS appointments CASCADE;

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Références
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    
    -- Informations patient (si non enregistré)
    patient_name VARCHAR(200) NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    patient_email VARCHAR(200),
    
    -- Détails du rendez-vous
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INTEGER DEFAULT 30, -- Durée en minutes
    type VARCHAR(100) DEFAULT 'Consultation générale',
    reason TEXT, -- Motif de consultation
    notes TEXT, -- Notes du médecin
    
    -- Statut du rendez-vous
    status VARCHAR(50) DEFAULT 'pending',
    -- Valeurs possibles: 'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
    
    -- Métadonnées
    created_by UUID REFERENCES users(id), -- Qui a créé (patient, médecin, admin)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Annulation
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES users(id),
    cancel_reason TEXT,
    
    -- Contraintes
    CONSTRAINT valid_duration CHECK (duration > 0 AND duration <= 240),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    CONSTRAINT valid_datetime CHECK (appointment_date IS NOT NULL AND appointment_time IS NOT NULL)
);

-- ========================================
-- 2. CRÉATION DES INDEX
-- ========================================

-- Index sur le médecin
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);

-- Index sur le patient
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);

-- Index sur la date et l'heure
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(appointment_time);

-- Index composite pour requêtes courantes
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_status ON appointments(doctor_id, status);

-- Index sur le statut
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Index pour recherche par téléphone (patients non enregistrés)
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments(patient_phone);

-- ========================================
-- 3. FONCTIONS RPC
-- ========================================

-- Fonction pour obtenir les créneaux disponibles d'un médecin
CREATE OR REPLACE FUNCTION get_available_slots(
    p_doctor_id UUID,
    p_date DATE
)
RETURNS TABLE (
    time_slot TIME,
    is_available BOOLEAN
) AS $$
DECLARE
    v_availability JSONB;
    v_day_name TEXT;
    v_day_slots JSONB;
    v_slot JSONB;
    v_start_time TIME;
    v_end_time TIME;
    v_current_time TIME;
    v_consultation_duration INTEGER;
BEGIN
    -- Récupérer la disponibilité du médecin
    SELECT availability, consultation_duration
    INTO v_availability, v_consultation_duration
    FROM doctors
    WHERE id = p_doctor_id AND is_active = true AND is_verified = true;
    
    IF v_availability IS NULL THEN
        RETURN;
    END IF;
    
    -- Obtenir le jour de la semaine (monday, tuesday, etc.)
    v_day_name := LOWER(TO_CHAR(p_date, 'Day'));
    v_day_name := TRIM(v_day_name);
    
    -- Mapper les jours français vers anglais si nécessaire
    CASE v_day_name
        WHEN 'lundi' THEN v_day_name := 'monday';
        WHEN 'mardi' THEN v_day_name := 'tuesday';
        WHEN 'mercredi' THEN v_day_name := 'wednesday';
        WHEN 'jeudi' THEN v_day_name := 'thursday';
        WHEN 'vendredi' THEN v_day_name := 'friday';
        WHEN 'samedi' THEN v_day_name := 'saturday';
        WHEN 'dimanche' THEN v_day_name := 'sunday';
        ELSE NULL;
    END CASE;
    
    -- Récupérer les créneaux du jour
    v_day_slots := v_availability->v_day_name;
    
    IF v_day_slots IS NULL OR jsonb_array_length(v_day_slots) = 0 THEN
        RETURN;
    END IF;
    
    -- Générer tous les créneaux possibles
    FOR v_slot IN SELECT * FROM jsonb_array_elements(v_day_slots)
    LOOP
        v_start_time := (v_slot->>'start')::TIME;
        v_end_time := (v_slot->>'end')::TIME;
        v_current_time := v_start_time;
        
        -- Générer les créneaux par intervalles de consultation_duration
        WHILE v_current_time + (v_consultation_duration || ' minutes')::INTERVAL <= v_end_time
        LOOP
            -- Vérifier si le créneau est déjà réservé
            time_slot := v_current_time;
            is_available := NOT EXISTS (
                SELECT 1 FROM appointments
                WHERE doctor_id = p_doctor_id
                AND appointment_date = p_date
                AND appointment_time = v_current_time
                AND status IN ('pending', 'confirmed')
            );
            
            RETURN NEXT;
            v_current_time := v_current_time + (v_consultation_duration || ' minutes')::INTERVAL;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un rendez-vous avec validation
CREATE OR REPLACE FUNCTION create_appointment_with_validation(
    p_doctor_id UUID,
    p_patient_name VARCHAR(200),
    p_patient_phone VARCHAR(20),
    p_patient_email VARCHAR(200),
    p_appointment_date DATE,
    p_appointment_time TIME,
    p_type VARCHAR(100),
    p_reason TEXT,
    p_patient_id UUID DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_appointment_id UUID;
    v_doctor_active BOOLEAN;
    v_doctor_verified BOOLEAN;
    v_duration INTEGER;
BEGIN
    -- Vérifier que le médecin est actif et vérifié
    SELECT is_active, is_verified, consultation_duration
    INTO v_doctor_active, v_doctor_verified, v_duration
    FROM doctors
    WHERE id = p_doctor_id;
    
    IF NOT v_doctor_active OR NOT v_doctor_verified THEN
        RAISE EXCEPTION 'Ce médecin n''est pas disponible pour les rendez-vous';
    END IF;
    
    -- Vérifier que la date n'est pas dans le passé
    IF p_appointment_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Impossible de réserver un rendez-vous dans le passé';
    END IF;
    
    -- Vérifier qu'il n'y a pas déjà un RDV à ce créneau
    IF EXISTS (
        SELECT 1 FROM appointments
        WHERE doctor_id = p_doctor_id
        AND appointment_date = p_appointment_date
        AND appointment_time = p_appointment_time
        AND status IN ('pending', 'confirmed')
    ) THEN
        RAISE EXCEPTION 'Ce créneau n''est plus disponible';
    END IF;
    
    -- Créer le rendez-vous
    INSERT INTO appointments (
        doctor_id,
        patient_id,
        patient_name,
        patient_phone,
        patient_email,
        appointment_date,
        appointment_time,
        duration,
        type,
        reason,
        status,
        created_by
    ) VALUES (
        p_doctor_id,
        p_patient_id,
        p_patient_name,
        p_patient_phone,
        p_patient_email,
        p_appointment_date,
        p_appointment_time,
        v_duration,
        p_type,
        p_reason,
        'pending',
        COALESCE(p_created_by, auth.uid())
    )
    RETURNING id INTO v_appointment_id;
    
    RETURN v_appointment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour confirmer un rendez-vous
CREATE OR REPLACE FUNCTION confirm_appointment(
    p_appointment_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_doctor_user_id UUID;
BEGIN
    -- Vérifier que l'utilisateur est le médecin ou un admin
    SELECT d.user_id INTO v_doctor_user_id
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    WHERE a.id = p_appointment_id;
    
    IF v_doctor_user_id != p_user_id AND NOT is_super_admin(p_user_id) THEN
        RAISE EXCEPTION 'Non autorisé à confirmer ce rendez-vous';
    END IF;
    
    -- Confirmer le rendez-vous
    UPDATE appointments
    SET status = 'confirmed',
        updated_at = NOW()
    WHERE id = p_appointment_id
    AND status = 'pending';
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour annuler un rendez-vous
CREATE OR REPLACE FUNCTION cancel_appointment(
    p_appointment_id UUID,
    p_user_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_doctor_user_id UUID;
    v_appointment_date DATE;
    v_appointment_time TIME;
BEGIN
    -- Récupérer les infos du RDV
    SELECT d.user_id, a.appointment_date, a.appointment_time
    INTO v_doctor_user_id, v_appointment_date, v_appointment_time
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    WHERE a.id = p_appointment_id;
    
    -- Vérifier que l'utilisateur est autorisé (médecin, patient, ou admin)
    IF v_doctor_user_id != p_user_id 
       AND NOT is_super_admin(p_user_id)
       AND NOT EXISTS (
           SELECT 1 FROM appointments 
           WHERE id = p_appointment_id 
           AND (patient_id = p_user_id OR created_by = p_user_id)
       )
    THEN
        RAISE EXCEPTION 'Non autorisé à annuler ce rendez-vous';
    END IF;
    
    -- Annuler le rendez-vous
    UPDATE appointments
    SET status = 'cancelled',
        cancelled_at = NOW(),
        cancelled_by = p_user_id,
        cancel_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_appointment_id
    AND status IN ('pending', 'confirmed');
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer un RDV comme terminé
CREATE OR REPLACE FUNCTION complete_appointment(
    p_appointment_id UUID,
    p_doctor_user_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que l'utilisateur est le médecin
    IF NOT EXISTS (
        SELECT 1 FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.id = p_appointment_id AND d.user_id = p_doctor_user_id
    ) THEN
        RAISE EXCEPTION 'Non autorisé';
    END IF;
    
    -- Marquer comme terminé
    UPDATE appointments
    SET status = 'completed',
        notes = COALESCE(p_notes, notes),
        updated_at = NOW()
    WHERE id = p_appointment_id
    AND status = 'confirmed';
    
    -- Mettre à jour les statistiques du médecin
    UPDATE doctors d
    SET total_consultations = total_consultations + 1,
        updated_at = NOW()
    FROM appointments a
    WHERE a.id = p_appointment_id AND a.doctor_id = d.id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les statistiques des RDV d'un médecin
CREATE OR REPLACE FUNCTION get_doctor_appointment_stats(p_doctor_id UUID)
RETURNS TABLE (
    today_appointments INTEGER,
    week_appointments INTEGER,
    month_appointments INTEGER,
    pending_appointments INTEGER,
    upcoming_appointments INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM appointments 
         WHERE doctor_id = p_doctor_id 
         AND appointment_date = CURRENT_DATE 
         AND status IN ('pending', 'confirmed'))::INTEGER as today_appointments,
        
        (SELECT COUNT(*)::INTEGER FROM appointments 
         WHERE doctor_id = p_doctor_id 
         AND appointment_date >= CURRENT_DATE 
         AND appointment_date < CURRENT_DATE + INTERVAL '7 days'
         AND status IN ('pending', 'confirmed'))::INTEGER as week_appointments,
        
        (SELECT COUNT(*)::INTEGER FROM appointments 
         WHERE doctor_id = p_doctor_id 
         AND appointment_date >= DATE_TRUNC('month', CURRENT_DATE)
         AND appointment_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
         AND status IN ('pending', 'confirmed', 'completed'))::INTEGER as month_appointments,
        
        (SELECT COUNT(*)::INTEGER FROM appointments 
         WHERE doctor_id = p_doctor_id 
         AND status = 'pending')::INTEGER as pending_appointments,
        
        (SELECT COUNT(*)::INTEGER FROM appointments 
         WHERE doctor_id = p_doctor_id 
         AND appointment_date >= CURRENT_DATE
         AND status IN ('pending', 'confirmed'))::INTEGER as upcoming_appointments;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 4. POLITIQUES RLS
-- ========================================

-- Activer RLS sur la table appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Politique: Super admins voient tous les RDV
CREATE POLICY "Super admins can view all appointments"
ON appointments FOR SELECT
USING (is_super_admin(auth.uid()));

-- Politique: Super admins peuvent gérer tous les RDV
CREATE POLICY "Super admins can manage appointments"
ON appointments FOR ALL
USING (is_super_admin(auth.uid()));

-- Politique: Médecins voient leurs RDV
CREATE POLICY "Doctors can view their appointments"
ON appointments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM doctors
        WHERE doctors.id = appointments.doctor_id
        AND doctors.user_id = auth.uid()
    )
);

-- Politique: Médecins peuvent modifier leurs RDV
CREATE POLICY "Doctors can update their appointments"
ON appointments FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM doctors
        WHERE doctors.id = appointments.doctor_id
        AND doctors.user_id = auth.uid()
    )
);

-- Politique: Médecins peuvent créer des RDV
CREATE POLICY "Doctors can create appointments"
ON appointments FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM doctors
        WHERE doctors.id = appointments.doctor_id
        AND doctors.user_id = auth.uid()
    )
);

-- Politique: Patients enregistrés voient leurs RDV
CREATE POLICY "Patients can view their appointments"
ON appointments FOR SELECT
USING (
    patient_id = auth.uid()
    OR created_by = auth.uid()
);

-- Politique: Patients peuvent créer des RDV (via fonction RPC)
CREATE POLICY "Patients can create appointments"
ON appointments FOR INSERT
WITH CHECK (
    created_by = auth.uid()
    OR auth.uid() IS NOT NULL
);

-- Politique: Patients peuvent annuler leurs RDV (via fonction RPC)
CREATE POLICY "Patients can cancel their appointments"
ON appointments FOR UPDATE
USING (
    (patient_id = auth.uid() OR created_by = auth.uid())
    AND status IN ('pending', 'confirmed')
);

-- ========================================
-- 5. TRIGGER POUR MISE À JOUR AUTOMATIQUE
-- ========================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe
DROP TRIGGER IF EXISTS trigger_update_appointments_timestamp ON appointments;

-- Créer le trigger
CREATE TRIGGER trigger_update_appointments_timestamp
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_appointments_updated_at();

-- ========================================
-- 6. COMMENTAIRES
-- ========================================

COMMENT ON TABLE appointments IS 'Table des rendez-vous médicaux';
COMMENT ON COLUMN appointments.doctor_id IS 'ID du médecin';
COMMENT ON COLUMN appointments.patient_id IS 'ID du patient (null si non enregistré)';
COMMENT ON COLUMN appointments.status IS 'Statut: pending, confirmed, cancelled, completed, no_show';
COMMENT ON COLUMN appointments.duration IS 'Durée en minutes';
COMMENT ON FUNCTION get_available_slots IS 'Retourne les créneaux disponibles d''un médecin pour une date donnée';
COMMENT ON FUNCTION create_appointment_with_validation IS 'Crée un RDV avec validation de disponibilité';
COMMENT ON FUNCTION confirm_appointment IS 'Confirme un rendez-vous (médecin ou admin)';
COMMENT ON FUNCTION cancel_appointment IS 'Annule un rendez-vous';
COMMENT ON FUNCTION complete_appointment IS 'Marque un RDV comme terminé et met à jour les stats';
COMMENT ON FUNCTION get_doctor_appointment_stats IS 'Retourne les statistiques des RDV d''un médecin';
