# 🧪 COMPTES DE TEST E-PHARMA

Ce document contient tous les comptes de test pour l'application E-Pharma. **NE PAS UTILISER EN PRODUCTION!**

---

## 📋 Instructions d'utilisation

### Étape 1: Créer les comptes dans Supabase Auth

Vous devez d'abord créer ces comptes dans Supabase Authentication:

1. Allez sur votre projet Supabase: https://jdsjpdpdcbbphelrohjr.supabase.co
2. Naviguez vers **Authentication** > **Users**
3. Cliquez sur **Add user** > **Create new user**
4. Pour chaque compte ci-dessous, créez un utilisateur avec:
   - **Email**: (voir ci-dessous)
   - **Password**: `Test@2024`
   - **Auto Confirm User**: ✅ Coché

### Étape 2: Exécuter le script SQL

Après avoir créé tous les comptes dans Supabase Auth, exécutez le fichier `test-users-seed.sql` dans l'éditeur SQL de Supabase pour créer les profils et entités associées.

---

## 👥 COMPTES DE TEST

### 1. 🔐 SUPER ADMINISTRATEUR

**Accès**: Page de connexion Super Admin (`super-admin-login.html`)

```
Email:        superadmin@epharma.ne
Mot de passe: Test@2024
Rôle:         Super Admin
```

**Informations du profil:**
- Nom complet: Amadou Diallo
- Téléphone: +227 90 12 34 56
- Ville: Niamey
- Adresse: Quartier Plateau, Avenue de la République

**Permissions:**
- ✅ Gestion complète de la plateforme
- ✅ Gestion des utilisateurs (tous rôles)
- ✅ Approbation des pharmacies
- ✅ Approbation des centres de santé
- ✅ Vérification des médecins
- ✅ Accès à toutes les statistiques

---

### 2. 💊 GÉRANT DE PHARMACIE

**Accès**: Page de connexion Admin Pharmacie (`admin-login.html`)

```
Email:        pharmacie.test@epharma.ne
Mot de passe: Test@2024
Rôle:         Pharmacy Admin
```

**Informations du profil:**
- Nom complet: Fatima Moussa
- Téléphone: +227 90 23 45 67
- Ville: Niamey
- Adresse: Quartier Yantala

**Pharmacie associée:**
- Nom: Pharmacie Test Niamey
- Adresse: Avenue de la Liberté, près du Rond-Point Kennedy
- Téléphone: +227 20 73 45 67
- Email: contact@pharmacie-test.ne
- Statut: ✅ Approuvée et Active
- Parking: ✅ Oui
- 24/7: ❌ Non

**Permissions:**
- ✅ Gestion du stock de médicaments
- ✅ Gestion des commandes
- ✅ Modification des informations de la pharmacie
- ✅ Gestion des horaires d'ouverture

---

### 3. 🏥 GÉRANT DE CENTRE DE SANTÉ

**Accès**: Page de connexion Admin Centre (`admin-login.html` ou page dédiée)

```
Email:        centre.test@epharma.ne
Mot de passe: Test@2024
Rôle:         Health Center Admin
```

**Informations du profil:**
- Nom complet: Ibrahim Souley
- Téléphone: +227 90 34 56 78
- Ville: Niamey
- Adresse: Quartier Lazaret

**Centre de santé associé:**
- Nom: Centre de Santé Test Niamey
- Type: Centre de Santé Communautaire
- Adresse: Rue de la Santé, Quartier Lazaret
- Téléphone: +227 20 73 56 78
- Email: contact@centre-test.ne
- Site web: www.centre-test.ne
- Statut: ✅ Approuvé et Actif

**Équipements:**
- ✅ Urgences 24/7
- ✅ Ambulance
- ✅ Laboratoire
- ✅ Pharmacie
- ❌ Radiologie
- Capacité: 50 lits (dont 5 en soins intensifs)

**Services:**
- Consultation générale
- Urgences
- Hospitalisation
- Laboratoire
- Pharmacie

**Spécialités:**
- Médecine générale
- Pédiatrie
- Gynécologie

**Permissions:**
- ✅ Gestion des informations du centre
- ✅ Gestion des médecins du centre
- ✅ Gestion des rendez-vous
- ✅ Gestion des services et équipements

---

### 4. 👨‍⚕️ MÉDECIN GÉNÉRALISTE

**Accès**: Page de connexion Docteur (`doctor-login.html`)

```
Email:        docteur.test@epharma.ne
Mot de passe: Test@2024
Rôle:         Doctor
```

**Informations du profil:**
- Nom complet: Dr. Aïssata Hamani
- Téléphone: +227 90 45 67 89
- Ville: Niamey
- Adresse: Quartier Plateau
- Genre: Féminin
- Date de naissance: 15 mars 1985

**Informations professionnelles:**
- Numéro de licence: MED-NE-2024-001
- Spécialités: Médecine générale, Pédiatrie
- Sous-spécialités: Vaccination, Suivi de grossesse
- Expérience: 10 ans
- Statut: ✅ Vérifié et Actif
- Centre: Centre de Santé Test Niamey

**Consultation:**
- Tarif: 15 000 FCFA
- Durée: 30 minutes
- Consultation en ligne: ✅ Oui (10 000 FCFA)
- Accepte nouveaux patients: ✅ Oui

**Langues:**
- Français
- Haoussa
- Zarma

**Disponibilités:**
- Lundi - Vendredi: 08:00-12:00 et 14:00-18:00
- Samedi: 08:00-13:00
- Dimanche: Fermé

**Formation:**
- Doctorat en Médecine - Université Abdou Moumouni (2014)
- Spécialisation en Pédiatrie - CHU Niamey (2017)

**Permissions:**
- ✅ Gestion de l'agenda
- ✅ Gestion des rendez-vous
- ✅ Gestion des patients
- ✅ Modification du profil professionnel

---

### 5. 👨‍⚕️ MÉDECIN CARDIOLOGUE

**Accès**: Page de connexion Docteur (`doctor-login.html`)

```
Email:        cardiologue.test@epharma.ne
Mot de passe: Test@2024
Rôle:         Doctor
```

**Informations du profil:**
- Nom complet: Dr. Moussa Issoufou
- Téléphone: +227 90 67 89 01
- Ville: Niamey
- Adresse: Quartier Plateau
- Genre: Masculin
- Date de naissance: 22 juillet 1978

**Informations professionnelles:**
- Numéro de licence: MED-NE-2024-002
- Spécialité: Cardiologie
- Sous-spécialités: Échocardiographie, Électrocardiographie
- Expérience: 18 ans
- Statut: ✅ Vérifié et Actif
- Centre: Centre de Santé Test Niamey

**Consultation:**
- Tarif: 25 000 FCFA
- Durée: 45 minutes
- Consultation en ligne: ✅ Oui (20 000 FCFA)
- Accepte nouveaux patients: ✅ Oui

**Langues:**
- Français
- Haoussa
- Anglais

**Disponibilités:**
- Lundi, Mardi, Jeudi, Vendredi: 09:00-13:00 et 15:00-19:00
- Mercredi: 09:00-13:00
- Samedi - Dimanche: Fermé

**Formation:**
- Doctorat en Médecine - Université Abdou Moumouni (2006)
- Spécialisation en Cardiologie - Hôpital Bichat, Paris (2010)
- Formation en Échocardiographie - Société Française de Cardiologie (2012)

**Permissions:**
- ✅ Gestion de l'agenda
- ✅ Gestion des rendez-vous
- ✅ Gestion des patients
- ✅ Modification du profil professionnel

---

### 6. 👤 UTILISATEUR/PATIENT

**Accès**: Page de connexion Utilisateur (`user-login.html`)

```
Email:        patient.test@epharma.ne
Mot de passe: Test@2024
Rôle:         User (Patient)
```

**Informations du profil:**
- Nom complet: Mariama Abdou
- Téléphone: +227 90 56 78 90
- Ville: Niamey
- Adresse: Quartier Yantala Haut

**Permissions:**
- ✅ Recherche de pharmacies
- ✅ Recherche de médecins
- ✅ Recherche de centres de santé
- ✅ Prise de rendez-vous
- ✅ Consultation du profil
- ✅ Modification du profil personnel

---

## 🔄 Récapitulatif des accès

| Rôle | Email | Page de connexion | Dashboard |
|------|-------|-------------------|-----------|
| Super Admin | superadmin@epharma.ne | `super-admin-login.html` | `super-admin-dashboard.html` |
| Pharmacy Admin | pharmacie.test@epharma.ne | `admin-login.html` | `admin-dashboard.html` |
| Health Center Admin | centre.test@epharma.ne | `admin-login.html` | (À définir) |
| Doctor #1 | docteur.test@epharma.ne | `doctor-login.html` | `doctor-dashboard.html` |
| Doctor #2 | cardiologue.test@epharma.ne | `doctor-login.html` | `doctor-dashboard.html` |
| User/Patient | patient.test@epharma.ne | `user-login.html` | `user-profile.html` |

---

## ⚠️ IMPORTANT

### Sécurité
- ❌ **NE JAMAIS** utiliser ces comptes en production
- ❌ **NE JAMAIS** committer ce fichier avec des mots de passe réels
- ✅ Changez tous les mots de passe avant le déploiement en production
- ✅ Supprimez tous les comptes de test en production

### Mot de passe par défaut
Tous les comptes utilisent le même mot de passe pour faciliter les tests:
```
Test@2024
```

### Configuration Supabase
- URL: https://jdsjpdpdcbbphelrohjr.supabase.co
- Les comptes doivent être créés manuellement dans Supabase Auth
- Assurez-vous de cocher "Auto Confirm User" lors de la création

---

## 📝 Notes de test

### Scénarios de test suggérés

1. **Super Admin:**
   - Approuver/rejeter des pharmacies
   - Vérifier des médecins
   - Gérer les utilisateurs
   - Consulter les statistiques globales

2. **Pharmacy Admin:**
   - Ajouter des produits au stock
   - Gérer les commandes
   - Modifier les horaires d'ouverture
   - Mettre à jour les informations de la pharmacie

3. **Health Center Admin:**
   - Gérer les informations du centre
   - Ajouter/modifier les services
   - Gérer les médecins du centre

4. **Doctor:**
   - Gérer l'agenda
   - Accepter/refuser des rendez-vous
   - Consulter la liste des patients
   - Modifier le profil professionnel

5. **User/Patient:**
   - Rechercher une pharmacie
   - Rechercher un médecin
   - Prendre un rendez-vous
   - Modifier son profil

---

**Date de création:** 7 février 2026  
**Version:** 1.0  
**Environnement:** Développement uniquement
