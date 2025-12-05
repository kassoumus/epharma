# 🚀 Guide de Déploiement Epharma

## ⚠️ SÉCURITÉ IMPORTANTE

**NE PARTAGEZ JAMAIS vos clés API publiquement !**

Les informations sensibles doivent être stockées dans des fichiers `.env.local` qui ne sont **JAMAIS** partagés ou commités sur Git.

---

## 📋 Étape 1 : Configuration Supabase

### 1.1 Créer le fichier `.env.local`

Dans le dossier `Epharma`, créez un fichier nommé `.env.local` :

```env
SUPABASE_URL=https://jdsjpdpdcbbphelrohjr.supabase.co
SUPABASE_ANON_KEY=votre_cle_publique
SUPABASE_SERVICE_KEY=votre_cle_secrete
```

**⚠️ Remplacez les valeurs par vos vraies clés Supabase**

### 1.2 Créer la base de données

1. Allez sur [supabase.com](https://supabase.com)
2. Ouvrez votre projet
3. Allez dans **SQL Editor**
4. Copiez tout le contenu du fichier `supabase-schema.sql`
5. Collez-le dans l'éditeur SQL
6. Cliquez sur **Run**

✅ Votre base de données est maintenant créée !

---

## 📋 Étape 2 : Ajouter les données de démonstration

### 2.1 Via l'interface Supabase

1. Allez dans **Table Editor**
2. Pour chaque table, cliquez sur **Insert** → **Insert row**
3. Remplissez les données

### 2.2 Via SQL (plus rapide)

Je vais créer un fichier `seed-data.sql` avec toutes les données de démonstration.

---

## 📋 Étape 3 : Configuration Vercel

### 3.1 Préparer le projet

1. Créez un compte sur [vercel.com](https://vercel.com)
2. Connectez votre compte GitHub
3. Créez un nouveau repository GitHub pour Epharma

### 3.2 Déployer

1. Sur Vercel, cliquez sur **New Project**
2. Importez votre repository GitHub
3. Ajoutez les **Environment Variables** :
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
4. Cliquez sur **Deploy**

✅ Votre application est en ligne !

---

## 🔐 Bonnes pratiques de sécurité

### ✅ À FAIRE
- Stocker les clés dans `.env.local`
- Ajouter `.env.local` au `.gitignore`
- Utiliser les variables d'environnement sur Vercel
- Régénérer les clés si elles sont exposées

### ❌ À NE JAMAIS FAIRE
- Partager vos clés dans un chat/email
- Committer `.env.local` sur Git
- Mettre les clés directement dans le code
- Utiliser les mêmes clés en dev et prod

---

## 📞 Support

Si vous avez des questions, consultez :
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Vercel](https://vercel.com/docs)

---

## 🎯 Prochaines étapes

Une fois déployé, vous pourrez :
- Tester avec de vrais utilisateurs
- Ajouter/modifier des données via le dashboard Supabase
- Monitorer les performances
- Scaler automatiquement selon le trafic
