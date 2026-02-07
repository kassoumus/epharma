# 🚀 Guide d'Installation des Utilisateurs de Test

## ⚠️ Problème rencontré

Si vous avez l'erreur:
```
ERROR: column "is_approved" of relation "users" does not exist
```

Cela signifie que le schéma des rôles n'a pas encore été appliqué à votre base de données.

---

## ✅ Solution: Installation en 3 étapes

### ÉTAPE 1: Créer les utilisateurs dans Supabase Auth

1. Allez sur votre projet Supabase: https://jdsjpdpdcbbphelrohjr.supabase.co
2. Naviguez vers **Authentication** > **Users**
3. Cliquez sur **Add user** > **Create new user**
4. Pour chaque compte, créez un utilisateur avec:
   - **Email**: (voir liste ci-dessous)
   - **Password**: `Test@2024`
   - **Auto Confirm User**: ✅ **COCHÉ OBLIGATOIREMENT**

**Liste des emails à créer:**
```
superadmin@epharma.ne
pharmacie.test@epharma.ne
centre.test@epharma.ne
docteur.test@epharma.ne
cardiologue.test@epharma.ne
patient.test@epharma.ne
```

---

### ÉTAPE 2: Appliquer le schéma des rôles

1. Dans Supabase, allez dans **SQL Editor**
2. Cliquez sur **New query**
3. Ouvrez le fichier `supabase-roles-schema.sql`
4. Copiez tout le contenu
5. Collez-le dans l'éditeur SQL
6. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter)

**Ce que fait ce script:**
- Crée le type ENUM `user_role` avec les valeurs: super_admin, pharmacy_admin, health_center_admin, doctor, user
- Ajoute les colonnes `role`, `is_active`, `is_approved` à la table `users`
- Crée les fonctions utilitaires pour la gestion des rôles
- Configure les politiques RLS (Row Level Security)

---

### ÉTAPE 3: Exécuter le script de seed des utilisateurs de test

1. Toujours dans **SQL Editor**
2. Créez une **nouvelle requête**
3. Ouvrez le fichier `test-users-seed.sql`
4. Copiez tout le contenu
5. Collez-le dans l'éditeur SQL
6. Cliquez sur **Run**

**Ce que fait ce script:**
- Vérifie que le schéma des rôles est bien en place
- Crée les profils utilisateurs dans `user_profiles`
- Crée les entrées dans la table `users` avec les bons rôles
- Crée une pharmacie de test
- Crée un centre de santé de test
- Crée 2 profils de médecins

---

## 📋 Ordre d'exécution des scripts SQL

Si vous partez de zéro, voici l'ordre recommandé:

1. ✅ `supabase-schema.sql` - Schéma de base (si pas déjà fait)
2. ✅ `supabase-user-schema.sql` - Profils utilisateurs (si pas déjà fait)
3. ✅ **`supabase-roles-schema.sql`** - **OBLIGATOIRE AVANT test-users-seed.sql**
4. ✅ `supabase-pharmacies-enhanced-schema.sql` - Schéma pharmacies amélioré
5. ✅ `supabase-health-centers-schema.sql` - Schéma centres de santé
6. ✅ `supabase-doctors-schema.sql` - Schéma médecins
7. ✅ `supabase-appointments-schema-fixed.sql` - Schéma rendez-vous
8. ✅ **`test-users-seed.sql`** - Utilisateurs de test (APRÈS tous les schémas)

---

## 🔍 Vérification

Après avoir exécuté tous les scripts, vérifiez que tout fonctionne:

```sql
-- Vérifier que les utilisateurs ont été créés
SELECT 
    u.email,
    ut.role,
    up.full_name,
    ut.is_active,
    ut.is_approved
FROM auth.users u
LEFT JOIN users ut ON u.id = ut.id
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email LIKE '%@epharma.ne'
ORDER BY ut.role;
```

Vous devriez voir 6 utilisateurs avec leurs rôles respectifs.

---

## 🎯 Résultat attendu

| Email | Rôle | Nom | Actif | Approuvé |
|-------|------|-----|-------|----------|
| superadmin@epharma.ne | super_admin | Amadou Diallo | ✅ | ✅ |
| pharmacie.test@epharma.ne | pharmacy_admin | Fatima Moussa | ✅ | ✅ |
| centre.test@epharma.ne | health_center_admin | Ibrahim Souley | ✅ | ✅ |
| docteur.test@epharma.ne | doctor | Dr. Aïssata Hamani | ✅ | ✅ |
| cardiologue.test@epharma.ne | doctor | Dr. Moussa Issoufou | ✅ | ✅ |
| patient.test@epharma.ne | user | Mariama Abdou | ✅ | ✅ |

---

## ❓ Dépannage

### Erreur: "type user_role does not exist"
**Solution:** Exécutez d'abord `supabase-roles-schema.sql`

### Erreur: "column role does not exist"
**Solution:** Exécutez d'abord `supabase-roles-schema.sql`

### Erreur: "relation pharmacies does not exist"
**Solution:** Exécutez d'abord `supabase-pharmacies-enhanced-schema.sql`

### Erreur: "relation health_centers does not exist"
**Solution:** Exécutez d'abord `supabase-health-centers-schema.sql`

### Erreur: "relation doctors does not exist"
**Solution:** Exécutez d'abord `supabase-doctors-schema.sql`

### Les utilisateurs n'apparaissent pas dans auth.users
**Solution:** Créez-les manuellement dans Supabase Auth (Étape 1)

---

## 📞 Support

Si vous rencontrez toujours des problèmes:
1. Vérifiez que tous les schémas ont été exécutés dans l'ordre
2. Vérifiez que les utilisateurs existent dans Authentication > Users
3. Consultez les logs d'erreur dans Supabase pour plus de détails

---

**Date de création:** 7 février 2026  
**Version:** 1.1 (avec vérifications)
