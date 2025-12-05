-- ========================================
-- EPHARMA - SEED DATA (Données de démonstration)
-- ========================================
-- Exécutez ce script APRÈS avoir exécuté supabase-schema.sql

-- ========================================
-- USERS (Comptes de démonstration)
-- ========================================
INSERT INTO users (email, user_type) VALUES
('contact@pharmacie-republique.fr', 'pharmacy'),
('dr.dubois@cabinet-sante.fr', 'doctor');

-- ========================================
-- PHARMACIES (12 pharmacies)
-- ========================================
INSERT INTO pharmacies (name, address, city, postal_code, phone, email, latitude, longitude, is_open_24_7, has_parking, rating, reviews_count) VALUES
('Pharmacie de la République', '45 Avenue de la République', 'Paris', '75011', '01 43 55 12 34', 'contact@pharmacie-republique.fr', 48.8656, 2.3798, true, true, 4.5, 234),
('Pharmacie Voltaire', '123 Boulevard Voltaire', 'Paris', '75011', '01 43 71 23 45', 'contact@pharmacie-voltaire.fr', 48.8589, 2.3789, false, true, 4.3, 156),
('Pharmacie Saint-Maur', '67 Rue Saint-Maur', 'Paris', '75011', '01 43 57 34 56', 'contact@pharmacie-stmaur.fr', 48.8623, 2.3812, false, false, 4.7, 189),
('Pharmacie Oberkampf', '89 Rue Oberkampf', 'Paris', '75011', '01 43 38 45 67', 'contact@pharmacie-oberkampf.fr', 48.8645, 2.3789, false, true, 4.2, 98),
('Pharmacie Parmentier', '34 Avenue Parmentier', 'Paris', '75011', '01 43 55 56 78', 'contact@pharmacie-parmentier.fr', 48.8634, 2.3745, false, false, 4.6, 167),
('Pharmacie Charonne', '156 Rue de Charonne', 'Paris', '75011', '01 43 71 67 89', 'contact@pharmacie-charonne.fr', 48.8534, 2.3856, false, true, 4.4, 145),
('Pharmacie Roquette', '78 Rue de la Roquette', 'Paris', '75011', '01 43 57 78 90', 'contact@pharmacie-roquette.fr', 48.8556, 2.3722, true, false, 4.8, 278),
('Pharmacie Bastille', '12 Place de la Bastille', 'Paris', '75011', '01 43 38 89 01', 'contact@pharmacie-bastille.fr', 48.8532, 2.3689, false, true, 4.1, 123),
('Pharmacie Nation', '45 Avenue de la Nation', 'Paris', '75012', '01 43 43 90 12', 'contact@pharmacie-nation.fr', 48.8489, 2.3956, false, true, 4.5, 201),
('Pharmacie Ledru-Rollin', '23 Avenue Ledru-Rollin', 'Paris', '75012', '01 43 43 01 23', 'contact@pharmacie-ledru.fr', 48.8512, 2.3734, false, false, 4.3, 134),
('Pharmacie Daumesnil', '67 Avenue Daumesnil', 'Paris', '75012', '01 43 43 12 34', 'contact@pharmacie-daumesnil.fr', 48.8423, 2.3867, false, true, 4.6, 189),
('Pharmacie Reuilly', '89 Rue de Reuilly', 'Paris', '75012', '01 43 43 23 45', 'contact@pharmacie-reuilly.fr', 48.8445, 2.3912, false, false, 4.4, 156);

-- ========================================
-- HEALTH CENTERS (10 centres)
-- ========================================
INSERT INTO health_centers (name, type, category, address, city, postal_code, phone, email, latitude, longitude, has_emergency, has_parking, rating, reviews_count) VALUES
('Hôpital Saint-Louis', 'hospital', 'public', '1 Avenue Claude Vellefaux', 'Paris', '75010', '01 42 49 49 49', 'contact@hopital-stlouis.fr', 48.8717, 2.3698, true, true, 4.3, 892),
('Hôpital Bichat-Claude Bernard', 'hospital', 'public', '46 Rue Henri Huchard', 'Paris', '75018', '01 40 25 80 80', 'contact@hopital-bichat.fr', 48.8978, 2.3307, true, true, 4.1, 654),
('Clinique du Parc Monceau', 'clinic', 'private', '21 Rue de Chazelles', 'Paris', '75017', '01 56 21 21 21', 'contact@clinique-monceau.fr', 48.8814, 2.3089, false, true, 4.7, 234),
('Centre Médical Europe', 'medical-center', 'private', '55 Rue Saint-Lazare', 'Paris', '75009', '01 48 74 75 76', 'contact@centre-europe.fr', 48.8762, 2.3296, false, false, 4.5, 187),
('Hôpital Lariboisière', 'hospital', 'public', '2 Rue Ambroise Paré', 'Paris', '75010', '01 49 95 65 65', 'contact@hopital-lariboisiere.fr', 48.8811, 2.3525, true, true, 4.2, 756),
('Clinique Sainte-Isabelle', 'clinic', 'private', '77 Rue de la Pompe', 'Paris', '75016', '01 45 53 33 33', 'contact@clinique-isabelle.fr', 48.8654, 2.2794, false, true, 4.8, 421),
('Centre de Santé Montmartre', 'medical-center', 'public', '12 Rue Ramey', 'Paris', '75018', '01 42 54 32 10', 'contact@cs-montmartre.fr', 48.8897, 2.3456, false, false, 4.4, 156),
('Hôpital Cochin', 'hospital', 'public', '27 Rue du Faubourg Saint-Jacques', 'Paris', '75014', '01 58 41 41 41', 'contact@hopital-cochin.fr', 48.8388, 2.3394, true, true, 4.3, 983),
('Clinique du Sport Paris V', 'clinic', 'private', '36 Boulevard Saint-Marcel', 'Paris', '75005', '01 43 31 77 77', 'contact@clinique-sport.fr', 48.8389, 2.3567, false, true, 4.6, 298),
('Centre Médical Bastille', 'medical-center', 'private', '15 Rue de la Roquette', 'Paris', '75011', '01 43 57 89 90', 'contact@cm-bastille.fr', 48.8556, 2.3722, false, false, 4.5, 203);

-- ========================================
-- DOCTORS (20 médecins)
-- ========================================
INSERT INTO doctors (name, specialty, type, gender, address, city, postal_code, phone, email, latitude, longitude, sector, consultation_price, accepts_new_patients, experience_years, rating, reviews_count) VALUES
('Dr. Marie Dubois', 'Médecin généraliste', 'generaliste', 'F', '45 Rue de la Santé', 'Paris', '75014', '01 45 67 89 01', 'dr.dubois@cabinet-sante.fr', 48.8356, 2.3394, 1, 25, true, 15, 4.8, 156),
('Dr. Jean Martin', 'Cardiologue', 'specialiste', 'M', '12 Avenue de la République', 'Paris', '75011', '01 43 55 22 33', 'dr.martin@cardio-paris.fr', 48.8656, 2.3798, 2, 50, true, 22, 4.9, 234),
('Dr. Sophie Bernard', 'Pédiatre', 'specialiste', 'F', '78 Rue de Charonne', 'Paris', '75011', '01 43 71 45 67', 'dr.bernard@pediatrie.fr', 48.8534, 2.3856, 1, 30, true, 12, 4.7, 189),
('Dr. Pierre Lefebvre', 'Dermatologue', 'specialiste', 'M', '23 Boulevard Voltaire', 'Paris', '75011', '01 48 05 67 89', 'dr.lefebvre@dermato.fr', 48.8589, 2.3789, 2, 60, false, 18, 4.6, 145),
('Dr. Claire Rousseau', 'Gynécologue', 'specialiste', 'F', '56 Rue de la Roquette', 'Paris', '75011', '01 43 57 12 34', 'dr.rousseau@gyneco.fr', 48.8556, 2.3722, 1, 35, true, 16, 4.9, 278),
('Dr. Thomas Petit', 'Médecin généraliste', 'generaliste', 'M', '89 Avenue Parmentier', 'Paris', '75011', '01 43 55 78 90', 'dr.petit@medecine-generale.fr', 48.8634, 2.3745, 1, 25, true, 8, 4.5, 123),
('Dr. Isabelle Moreau', 'Ophtalmologue', 'specialiste', 'F', '34 Rue Saint-Maur', 'Paris', '75011', '01 43 57 89 12', 'dr.moreau@ophtalmo.fr', 48.8623, 2.3812, 2, 55, true, 20, 4.7, 167),
('Dr. Laurent Durand', 'ORL', 'specialiste', 'M', '67 Rue Oberkampf', 'Paris', '75011', '01 43 38 45 67', 'dr.durand@orl-paris.fr', 48.8645, 2.3789, 1, 40, true, 14, 4.6, 134),
('Dr. Nathalie Simon', 'Psychiatre', 'specialiste', 'F', '45 Rue de Montreuil', 'Paris', '75011', '01 43 71 23 45', 'dr.simon@psy.fr', 48.8512, 2.3889, 2, 70, true, 19, 4.8, 198),
('Dr. Marc Leroy', 'Médecin généraliste', 'generaliste', 'M', '12 Rue Jean-Pierre Timbaud', 'Paris', '75011', '01 43 55 34 56', 'dr.leroy@cabinet.fr', 48.8667, 2.3734, 1, 25, true, 10, 4.4, 98),
('Dr. Émilie Garnier', 'Rhumatologue', 'specialiste', 'F', '90 Boulevard Richard-Lenoir', 'Paris', '75011', '01 43 38 67 89', 'dr.garnier@rhumato.fr', 48.8589, 2.3723, 2, 50, true, 17, 4.7, 142),
('Dr. Alexandre Blanc', 'Gastro-entérologue', 'specialiste', 'M', '23 Rue de la Fontaine au Roi', 'Paris', '75011', '01 43 57 78 90', 'dr.blanc@gastro.fr', 48.8678, 2.3712, 1, 45, true, 21, 4.8, 176),
('Dr. Valérie Mercier', 'Médecin généraliste', 'generaliste', 'F', '56 Avenue de la République', 'Paris', '75011', '01 43 55 90 12', 'dr.mercier@medecine.fr', 48.8634, 2.3789, 1, 25, true, 13, 4.6, 112),
('Dr. Julien Fontaine', 'Urologue', 'specialiste', 'M', '78 Rue Amelot', 'Paris', '75011', '01 43 38 12 34', 'dr.fontaine@urologie.fr', 48.8598, 2.3701, 2, 55, false, 16, 4.5, 89),
('Dr. Céline Roux', 'Endocrinologue', 'specialiste', 'F', '34 Rue du Chemin Vert', 'Paris', '75011', '01 43 71 56 78', 'dr.roux@endocrino.fr', 48.8567, 2.3823, 1, 40, true, 18, 4.9, 203),
('Dr. Olivier Vincent', 'Médecin généraliste', 'generaliste', 'M', '12 Passage Saint-Pierre Amelot', 'Paris', '75011', '01 43 55 23 45', 'dr.vincent@cabinet.fr', 48.8612, 2.3734, 1, 25, true, 20, 4.7, 167),
('Dr. Sandrine Perrin', 'Neurologue', 'specialiste', 'F', '45 Rue Popincourt', 'Paris', '75011', '01 43 38 78 90', 'dr.perrin@neuro.fr', 48.8623, 2.3789, 2, 60, true, 19, 4.8, 154),
('Dr. François Lambert', 'Pneumologue', 'specialiste', 'M', '67 Rue de Charonne', 'Paris', '75011', '01 43 71 34 56', 'dr.lambert@pneumo.fr', 48.8534, 2.3845, 1, 45, true, 15, 4.6, 128),
('Dr. Aurélie Bonnet', 'Médecin généraliste', 'generaliste', 'F', '89 Rue Saint-Maur', 'Paris', '75011', '01 43 57 45 67', 'dr.bonnet@medecine.fr', 48.8645, 2.3823, 1, 25, true, 11, 4.5, 134),
('Dr. Christophe Girard', 'Allergologue', 'specialiste', 'M', '23 Boulevard Beaumarchais', 'Paris', '75011', '01 43 38 56 78', 'dr.girard@allergo.fr', 48.8578, 2.3678, 2, 50, true, 17, 4.7, 145);

-- ========================================
-- PRODUCTS (Médicaments pour quelques pharmacies)
-- ========================================
-- Note: Vous devrez récupérer les IDs des pharmacies après insertion
-- Pour l'instant, ce sont des exemples génériques

-- Exemple de produits (à adapter avec les vrais IDs)
-- INSERT INTO products (pharmacy_id, name, category, price, stock_quantity, stock_status, requires_prescription) VALUES
-- ('pharmacy_id_here', 'Doliprane 1000mg', 'Antalgique', 3.50, 150, 'in_stock', false),
-- ('pharmacy_id_here', 'Ibuprofène 400mg', 'Anti-inflammatoire', 4.20, 80, 'in_stock', false);

-- ========================================
-- APPOINTMENTS (Rendez-vous pour Dr. Dubois)
-- ========================================
-- Note: Vous devrez récupérer l'ID du Dr. Dubois après insertion

-- Exemple de rendez-vous (à adapter avec le vrai ID)
-- INSERT INTO appointments (doctor_id, patient_name, patient_phone, appointment_date, appointment_time, duration, type, reason, status) VALUES
-- ('doctor_id_here', 'Jean Dupont', '06 12 34 56 78', '2025-12-05', '09:00', 30, 'Consultation', 'Consultation de suivi', 'confirmed');

COMMIT;
