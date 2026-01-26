# Guide de test - Menu déroulant unité de prix

## ✅ Modifications appliquées

### Frontend - 6 fichiers modifiés
1. ✅ **Publish.jsx** - Formulaire de publication
2. ✅ **EditListing.jsx** - Formulaire d'édition  
3. ✅ **ListingCard.jsx** - Carte d'annonce
4. ✅ **ListingDetail.jsx** - Page de détail
5. ✅ **ListingDetailOptimized.jsx** - Page de détail optimisée
6. ✅ **Map.jsx** - Carte interactive

### Backend - 3 fichiers modifiés
1. ✅ **Listing.php** - Entité (champ + getters/setters)
2. ✅ **ListingController.php** - Contrôleur (création/modification/sérialisation)
3. ✅ **Version20241118_AddPriceUnitToListings.php** - Migration SQL

## 📝 Instructions de déploiement

### Étape 1: Appliquer la migration base de données

```powershell
# Option A: Utiliser le script PowerShell
.\appliquer-migration-prix.ps1

# Option B: Manuellement
cd planb-backend
php bin/console doctrine:migrations:migrate
```

### Étape 2: Redémarrer le backend

```powershell
# Arrêter le serveur (Ctrl+C si déjà lancé)
# Puis redémarrer
cd planb-backend
php -S localhost:8000 -t public
```

### Étape 3: Lancer le frontend

```powershell
cd planb-frontend
npm run dev
```

## 🧪 Scénarios de test

### Test 1: Publication d'une annonce de LOCATION

1. Aller sur `/publish`
2. Choisir une catégorie (ex: Immobilier)
3. Sélectionner une sous-catégorie (ex: Appartement)
4. **Choisir "Location"** comme type d'annonce
5. Remplir le formulaire jusqu'à l'étape "Prix"
6. **Vérifier que :**
   - ✅ Un menu déroulant apparaît à côté du champ prix
   - ✅ Les options sont : `/mois` et `/heure`
   - ✅ `/mois` est sélectionné par défaut
7. Saisir un prix (ex: 150000)
8. Sélectionner `/heure` dans le menu déroulant
9. Continuer jusqu'au récapitulatif
10. **Vérifier que :**
    - ✅ Le prix s'affiche : `150 000 FCFA /heure`
11. Publier l'annonce

### Test 2: Publication d'une annonce de VENTE

1. Répéter le Test 1 mais choisir **"Vente"**
2. **Vérifier que :**
   - ✅ Le menu déroulant d'unité **N'APPARAIT PAS**
   - ✅ Seul le champ prix est visible
3. Publier l'annonce

### Test 3: Affichage sur la liste d'annonces

1. Retourner sur la page d'accueil `/`
2. **Vérifier que :**
   - ✅ Annonces de vente : `25 000 000 FCFA`
   - ✅ Annonces de location : `150 000 FCFA /mois` ou `/heure`

### Test 4: Page de détail

1. Cliquer sur une annonce de location
2. **Vérifier que :**
   - ✅ Le prix principal affiche : `150 000 FCFA /mois`
   - ✅ L'unité est bien visible

### Test 5: Édition d'une annonce

1. Aller sur `/profile`
2. Cliquer sur "Modifier" sur une annonce de location
3. **Vérifier que :**
   - ✅ Le menu déroulant affiche l'unité actuelle
   - ✅ On peut changer l'unité de `/mois` à `/heure`
4. Modifier et sauvegarder
5. Vérifier que le changement est appliqué

### Test 6: Carte interactive

1. Aller sur `/map`
2. Cliquer sur un marqueur d'annonce de location
3. **Vérifier que :**
   - ✅ La popup affiche : `Prix FCFA /mois` ou `/heure`

### Test 7: Partage d'annonce

1. Ouvrir une annonce de location
2. Cliquer sur "Partager"
3. **Vérifier que :**
   - ✅ Le texte du partage inclut : `Villa F4 - 150 000 FCFA /mois`

## ⚠️ Points à vérifier

### Validation backend
- [ ] Le champ `priceUnit` accepte uniquement `'mois'` ou `'heure'`
- [ ] Par défaut : `'mois'`
- [ ] Le champ est nullable (compatibilité anciennes annonces)

### Validation frontend
- [ ] Le menu déroulant n'apparaît QUE pour les locations
- [ ] Les annonces de vente n'affichent PAS d'unité
- [ ] L'unité s'affiche sur TOUTES les pages (liste, détail, carte, profil)

### Base de données
- [ ] La colonne `price_unit` existe dans la table `listings`
- [ ] Type: VARCHAR(10)
- [ ] Défaut: 'mois'
- [ ] Nullable: true

```sql
-- Vérifier la colonne
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'listings' AND column_name = 'price_unit';
```

## 🐛 Résolution de problèmes

### Le menu déroulant n'apparaît pas
- Vérifier que `type === 'location'`
- Vérifier les imports du composant `Select`
- Rafraîchir la page (Ctrl+F5)

### Erreur "priceUnit is not defined"
- Appliquer la migration backend
- Redémarrer le serveur backend

### Les anciennes annonces n'affichent pas d'unité
- C'est normal ! La valeur par défaut 'mois' sera utilisée
- Mettre à jour manuellement si nécessaire

### Le prix ne s'affiche pas correctement
- Vérifier que `listing.priceUnit` existe dans la réponse API
- Vérifier la sérialisation dans `ListingController.php`

## ✅ Checklist finale

- [ ] Migration appliquée avec succès
- [ ] Backend redémarré
- [ ] Frontend compilé sans erreurs
- [ ] Menu déroulant visible sur publication de location
- [ ] Menu déroulant caché sur publication de vente
- [ ] Unité affichée sur les cartes d'annonces
- [ ] Unité affichée sur la page de détail
- [ ] Unité affichée sur la carte interactive
- [ ] Édition fonctionne correctement
- [ ] Anciennes annonces fonctionnent toujours

## 🎉 Résultat attendu

### Avant
```
Prix: 150000 FCFA
```

### Après (Location)
```
Prix: 150 000 FCFA /mois
     └── ou ──┘
Prix: 5 000 FCFA /heure
```

### Après (Vente)
```
Prix: 25 000 000 FCFA
(Pas de changement)
```
