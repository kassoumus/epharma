# ğŸ’Š Epharma - Trouvez vos mÃ©dicaments prÃ¨s de chez vous

Application web permettant de rechercher des pharmacies disposant de produits pharmaceutiques spÃ©cifiques.

## ğŸ¯ FonctionnalitÃ©s actuelles

### âœ… Ã‰tape 1 : Interface de recherche
- Barre de recherche de mÃ©dicaments avec suggestions
- Recherche par localisation avec gÃ©olocalisation
- Design moderne et responsive
- Animations fluides et interactions premium

### âœ… Ã‰tape 2 : Affichage des rÃ©sultats
- Liste de 12 pharmacies avec donnÃ©es de dÃ©monstration
- Carte interactive avec Leaflet
- Filtres (Toutes, Ouvertes, Ã€ proximitÃ©)
- Informations dÃ©taillÃ©es (distance, horaires, stock)
- Boutons d'action (Voir dÃ©tails, ItinÃ©raire)

## ğŸš€ DÃ©marrage rapide

1. Ouvrez simplement le fichier `index.html` dans votre navigateur
2. Aucune installation requise pour l'instant

## ğŸ“ Structure du projet

```
Epharma/
â”œâ”€â”€ index.html      # Page principale
â”œâ”€â”€ styles.css      # Design systÃ¨me et styles
â”œâ”€â”€ script.js       # Interactions et logique
â””â”€â”€ README.md       # Documentation
```

## ğŸ› ï¸ Technologies utilisÃ©es

- **HTML5** - Structure sÃ©mantique
- **CSS3** - Design systÃ¨me moderne avec variables CSS
- **JavaScript (Vanilla)** - Interactions et animations
- **Google Fonts (Inter)** - Typographie premium

## ğŸ¨ CaractÃ©ristiques du design

- **Palette de couleurs** : Bleu/Violet avec dÃ©gradÃ©s
- **Animations** : Orbes flottants, hover effects, micro-interactions
- **Responsive** : OptimisÃ© pour mobile, tablette et desktop
- **AccessibilitÃ©** : Structure sÃ©mantique et contrastes optimisÃ©s

## ğŸ“‹ Prochaines Ã©tapes

### Ã‰tape 2 : Affichage des rÃ©sultats
- [ ] Liste des pharmacies
- [ ] Carte interactive
- [ ] Informations dÃ©taillÃ©es
- [ ] GÃ©olocalisation

### Ã‰tape 3 : DÃ©tails et interactions
- [ ] Page dÃ©tails pharmacie
- [ ] ItinÃ©raire
- [ ] Filtres avancÃ©s

### Ã‰tape 4 : Interface admin
- [ ] Connexion pharmacie
- [ ] Gestion du stock
- [ ] Dashboard

## ğŸ“ Notes de dÃ©veloppement

- Actuellement en mode prototype avec donnÃ©es de dÃ©monstration
- La recherche affiche une alerte (sera remplacÃ©e par une vraie page de rÃ©sultats)
- La gÃ©olocalisation fonctionne mais nÃ©cessite une API de reverse geocoding pour production

## ğŸ“ Pour les dÃ©veloppeurs

### Variables CSS principales
```css
--primary-600: #0ea5e9    /* Couleur principale */
--secondary-600: #c026d3  /* Couleur secondaire */
--radius-xl: 1rem         /* Border radius */
--spacing-xl: 2rem        /* Espacement */
```

### Ã‰vÃ©nements JavaScript
- `medicamentSearch.input` - Affiche les suggestions
- `searchBtn.click` - Lance la recherche
- `locateBtn.click` - GÃ©olocalisation

---

**Version** : 1.0.0 (Ã‰tape 1)  
**DerniÃ¨re mise Ã  jour** : 5 dÃ©cembre 2025

## ?? Navigation entre les sections

La plateforme Epharma permet de naviguer facilement entre les différentes sections :

### Depuis la page d'accueil
- Sélectionnez le type de recherche (Pharmacies / Centres de santé / Médecins)
- Le champ de recherche s'adapte automatiquement
- La recherche vous redirige vers la page appropriée

### Navigation globale
Utilisez le menu en haut de chaque page pour accéder à :
- **Rechercher** : Retour à la page d'accueil
- **Pharmacies** : Liste des pharmacies
- **Centres de santé** : Liste des centres et hôpitaux
- **Médecins** : Liste des médecins
- **Espace Pro** : Interface d'administration

### Liens croisés
- Depuis une pharmacie, vous pouvez trouver des médecins à proximité
- Depuis un centre de santé, vous pouvez voir les médecins associés
- Les cartes interactives montrent tous les établissements

## ?? Utilisation complète

### Pour les patients
1. Choisissez votre besoin (médicament, consultation, urgence)
2. Recherchez dans la catégorie appropriée
3. Consultez les résultats sur la carte
4. Appelez ou prenez rendez-vous

### Pour les professionnels
1. Connectez-vous à l'Espace Pro
2. Gérez votre établissement/cabinet
3. Mettez à jour vos disponibilités
4. Consultez les statistiques

## ?? Données disponibles

- **12 Pharmacies** avec stock de médicaments
- **10 Centres de santé** (hôpitaux, cliniques, centres médicaux)
- **20 Médecins** (5 généralistes + 15 spécialistes)

Toutes les données sont des exemples de démonstration.
