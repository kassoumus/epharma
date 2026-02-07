# Script de Création des Utilisateurs de Test

## Description
Ce script automatise la création des utilisateurs de test dans Supabase Authentication.

## Prérequis
- Node.js installé
- Package `@supabase/supabase-js` installé
- Package `dotenv` installé
- Fichier `.env.local` configuré avec `SUPABASE_SERVICE_KEY`

## Installation des dépendances

```bash
npm install @supabase/supabase-js dotenv
```

## Utilisation

```bash
node create-test-users.js
```

## Ce que fait le script
1. Lit les variables d'environnement depuis `.env.local`
2. Crée 6 utilisateurs de test dans Supabase Auth:
   - superadmin@epharma.ne
   - pharmacie.test@epharma.ne
   - centre.test@epharma.ne
   - docteur.test@epharma.ne
   - cardiologue.test@epharma.ne
   - patient.test@epharma.ne
3. Auto-confirme les emails de tous les utilisateurs

## Après l'exécution
Exécutez le fichier `test-users-seed.sql` dans l'éditeur SQL de Supabase pour créer les profils et entités associées.

## Note
Si un utilisateur existe déjà, le script affichera un avertissement mais continuera avec les autres utilisateurs.
