#!/usr/bin/env node

/**
 * Script pour créer automatiquement les utilisateurs de test dans Supabase
 * IMPORTANT: Ce script nécessite les variables d'environnement Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://jdsjpdpdcbbphelrohjr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ ERREUR: SUPABASE_SERVICE_KEY non défini dans .env.local');
    process.exit(1);
}

// Créer le client Supabase avec la clé de service (admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Utilisateurs de test à créer
const testUsers = [
    {
        email: 'superadmin@epharma.ne',
        password: 'Test@2024',
        role: 'Super Admin',
        fullName: 'Amadou Diallo'
    },
    {
        email: 'pharmacie.test@epharma.ne',
        password: 'Test@2024',
        role: 'Pharmacy Admin',
        fullName: 'Fatima Moussa'
    },
    {
        email: 'centre.test@epharma.ne',
        password: 'Test@2024',
        role: 'Health Center Admin',
        fullName: 'Ibrahim Souley'
    },
    {
        email: 'docteur.test@epharma.ne',
        password: 'Test@2024',
        role: 'Doctor',
        fullName: 'Dr. Aïssata Hamani'
    },
    {
        email: 'cardiologue.test@epharma.ne',
        password: 'Test@2024',
        role: 'Doctor',
        fullName: 'Dr. Moussa Issoufou'
    },
    {
        email: 'patient.test@epharma.ne',
        password: 'Test@2024',
        role: 'User',
        fullName: 'Mariama Abdou'
    }
];

async function createTestUsers() {
    console.log('🚀 Création des utilisateurs de test...\n');

    for (const user of testUsers) {
        try {
            console.log(`📧 Création de: ${user.email} (${user.role})`);

            // Créer l'utilisateur dans Supabase Auth
            const { data, error } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true, // Auto-confirmer l'email
                user_metadata: {
                    full_name: user.fullName
                }
            });

            if (error) {
                if (error.message.includes('already registered')) {
                    console.log(`   ⚠️  L'utilisateur existe déjà`);
                } else {
                    console.error(`   ❌ Erreur: ${error.message}`);
                }
            } else {
                console.log(`   ✅ Créé avec succès! ID: ${data.user.id}`);
            }
        } catch (err) {
            console.error(`   ❌ Exception: ${err.message}`);
        }
    }

    console.log('\n✨ Processus terminé!');
    console.log('\n📝 Prochaines étapes:');
    console.log('1. Exécutez le fichier test-users-seed.sql dans l\'éditeur SQL de Supabase');
    console.log('2. Consultez COMPTES-TEST.md pour les informations de connexion');
    console.log('3. Testez chaque compte sur les pages de connexion appropriées\n');
}

// Exécuter le script
createTestUsers().catch(console.error);
