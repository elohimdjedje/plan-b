# 🔧 Correction du système de filtrage des annonces

## ✅ Problèmes corrigés

### 1. Filtrage par catégorie ne fonctionnait pas ❌ → ✅

**Problème** : Le backend ne prenait pas en compte les paramètres `category` et `subcategory`

**Solution** : Modification de `ListingController::list()` pour utiliser `searchListings()` quand des filtres sont fournis

```php
// AVANT : Ignorait les filtres
$listings = $this->listingRepository->findActiveListings($limit, $lastId);

// APRÈS : Utilise les filtres
if (count($filters) > 0) {
    $listings = $this->listingRepository->searchListings($filters, $limit);
} else {
    $listings = $this->listingRepository->findActiveListings($limit, $lastId);
}
```

---

### 2. Incohérence des noms de catégories ❌ → ✅

**Problème** : 
- Frontend : `vehicule`, `vacance`
- Backend : `vehicules`, `vacances` (avec S)

**Solution** : Mise à jour de l'entité `Listing.php`

```php
// AVANT
#[Assert\Choice(choices: ['immobilier', 'vehicules', 'vacances', ...])]

// APRÈS
#[Assert\Choice(choices: ['immobilier', 'vehicule', 'vacance'])]
```

---

## 📊 Fonctionnement attendu

### Page d'accueil (/)

**Affiche** : Toutes les annonces actives de toutes les catégories

```
GET /api/v1/listings
→ Retourne TOUTES les annonces
```

---

### Catégorie Immobilier

**Affiche** : Uniquement les annonces de la catégorie `immobilier`

```
GET /api/v1/listings?category=immobilier
→ Retourne uniquement les annonces d'immobilier
```

**Sous-catégories disponibles** :
- Appartement
- Villa
- Studio
- Terrain
- Magasin

---

### Catégorie Véhicule

**Affiche** : Uniquement les annonces de la catégorie `vehicule`

```
GET /api/v1/listings?category=vehicule
→ Retourne uniquement les annonces de véhicules
```

**Sous-catégories disponibles** :
- Voiture
- Moto

---

### Catégorie Vacance

**Affiche** : Uniquement les annonces de la catégorie `vacance`

```
GET /api/v1/listings?category=vacance
→ Retourne uniquement les annonces de vacances
```

**Sous-catégories disponibles** :
- Appartement meublé
- Villa meublée
- Studio meublé
- Hôtel

---

### Filtrage par sous-catégorie

**Exemple** : Afficher uniquement les villas dans l'immobilier

```
GET /api/v1/listings?category=immobilier&subcategory=villa
→ Retourne uniquement les villas
```

---

## 📱 Page Profil utilisateur

### Compteur d'annonces

**Code** (Profile.jsx ligne 123) :
```javascript
listings: currentListings.filter(l => l.status === 'active').length
```

**Affiche** : Le nombre d'annonces actives de l'utilisateur

---

### Compteur de vues

**Code** (Profile.jsx ligne 125) :
```javascript
views: currentListings.reduce((total, listing) => 
    total + (listing.viewsCount || 0), 0
)
```

**Affiche** : La somme de toutes les vues de toutes les annonces

---

### Incrémentation des vues

**Code** (ListingController.php ligne 51-53) :
```php
// À chaque consultation d'une annonce
$listing->incrementViews();
$this->entityManager->flush();
```

**Fonctionnement** :
1. Utilisateur ouvre une annonce : `/listing/123`
2. Le backend incrémente automatiquement `viewsCount`
3. Le compteur est affiché dans le profil

---

## 🧪 Tests à effectuer

### Test 1 : Publier 3 annonces dans des catégories différentes

1. Se connecter sur http://localhost:5173
2. Publier une annonce **Immobilier** (villa)
3. Publier une annonce **Véhicule** (voiture)
4. Publier une annonce **Vacance** (hôtel)

---

### Test 2 : Vérifier le filtrage par catégorie

**Test Immobilier** :
1. Cliquer sur l'onglet "Immobilier"
2. ✅ Doit afficher UNIQUEMENT la villa
3. ❌ Ne doit PAS afficher la voiture ni l'hôtel

**Test Véhicule** :
1. Cliquer sur l'onglet "Véhicule"
2. ✅ Doit afficher UNIQUEMENT la voiture
3. ❌ Ne doit PAS afficher la villa ni l'hôtel

**Test Vacance** :
1. Cliquer sur l'onglet "Vacance"
2. ✅ Doit afficher UNIQUEMENT l'hôtel
3. ❌ Ne doit PAS afficher la villa ni la voiture

**Test Accueil** :
1. Cliquer sur l'onglet "Accueil" ou revenir à "/"
2. ✅ Doit afficher LES 3 annonces

---

### Test 3 : Vérifier le filtrage par sous-catégorie

1. Aller dans "Immobilier"
2. Sélectionner la sous-catégorie "Villa"
3. ✅ Doit afficher UNIQUEMENT la villa
4. Sélectionner "Appartement"
5. ✅ Doit afficher 0 annonces (car aucun appartement publié)

---

### Test 4 : Vérifier le profil utilisateur

1. Publier 2 annonces avec des images
2. Aller dans "Profil"
3. **Vérifier** :
   - ✅ Compteur d'annonces = 2
   - ✅ Les 2 annonces s'affichent dans la liste
   - ✅ Compteur de vues = 0 (personne n'a vu les annonces)

---

### Test 5 : Vérifier le compteur de vues

1. Ouvrir une annonce (clic sur une carte)
2. Revenir en arrière
3. Aller dans "Profil"
4. **Vérifier** :
   - ✅ Compteur de vues = 1
   
5. Ouvrir la même annonce 2 fois de plus
6. **Vérifier** :
   - ✅ Compteur de vues = 3
   
7. Ouvrir la deuxième annonce 1 fois
8. **Vérifier** :
   - ✅ Compteur de vues total = 4 (3 + 1)

---

## 📝 Structure des catégories

### Frontend (constants/categories.js)

```javascript
CATEGORIES = {
  IMMOBILIER: {
    id: 'immobilier',
    subcategories: ['appartement', 'villa', 'studio', 'terrain', 'magasin']
  },
  VEHICULE: {
    id: 'vehicule',
    subcategories: ['voiture', 'moto']
  },
  VACANCE: {
    id: 'vacance',
    subcategories: ['appartement-meuble', 'villa-meublee', 'studio-meuble', 'hotel']
  }
}
```

### Backend (Entity/Listing.php)

```php
#[Assert\Choice(choices: ['immobilier', 'vehicule', 'vacance'])]
private ?string $category = null;

#[Assert\Choice(choices: ['vente', 'location', 'recherche'])]
private string $type = 'vente';
```

---

## 🔄 Flux de données

### Publication d'une annonce

```
Frontend (Publish.jsx)
    ↓
POST /api/v1/listings
{
  "category": "immobilier",
  "subcategory": "villa",
  "title": "Villa moderne",
  "type": "vente",
  ...
}
    ↓
Backend (ListingController)
    ↓
Validation (Listing entity)
    ↓
Sauvegarde en BD
    ↓
Réponse avec l'annonce créée
```

### Consultation d'une annonce

```
Frontend (clic sur ListingCard)
    ↓
GET /api/v1/listings/123
    ↓
Backend (ListingController::show)
    ↓
$listing->incrementViews()  ← Incrémente automatiquement
    ↓
Sauvegarde en BD
    ↓
Réponse avec l'annonce + viewsCount mis à jour
```

### Affichage du profil

```
Frontend (Profile.jsx)
    ↓
GET /api/v1/users/my-listings
    ↓
Backend (UserController)
    ↓
Récupère toutes les annonces de l'utilisateur
    ↓
Calcul des stats dans le frontend :
  - listings: nombre d'annonces actives
  - views: somme de tous les viewsCount
```

---

## ✅ Checklist de validation

- [ ] Cache Symfony vidé
- [ ] Backend redémarré
- [ ] Frontend redémarré
- [ ] 3 annonces publiées (une par catégorie)
- [ ] Filtrage par catégorie fonctionne
- [ ] Filtrage par sous-catégorie fonctionne
- [ ] Accueil affiche toutes les annonces
- [ ] Profil affiche le bon nombre d'annonces
- [ ] Compteur de vues fonctionne
- [ ] Les annonces ne se mélangent pas entre catégories

---

## 🚀 Commandes utiles

### Backend

```powershell
# Vider le cache (OBLIGATOIRE après modification)
cd planb-backend
php bin/console cache:clear

# Redémarrer le serveur
php -S localhost:8000 -t public

# Vérifier les annonces en BD
php bin/console doctrine:query:sql "SELECT id, title, category, subcategory FROM listings"

# Vérifier les vues
php bin/console doctrine:query:sql "SELECT id, title, views_count FROM listings"
```

### Frontend

```powershell
# Redémarrer le serveur
cd planb-frontend
npm run dev
```

---

## 🎯 Résumé des modifications

| Fichier | Modification | Status |
|---------|-------------|--------|
| `ListingController.php` | Ajout du filtrage par catégorie/sous-catégorie | ✅ |
| `Listing.php` | Correction des noms de catégories | ✅ |
| `Profile.jsx` | Calcul des stats (déjà OK) | ✅ |
| `ListingController.php::show()` | Incrémentation des vues (déjà OK) | ✅ |

---

## 📖 Documentation

**Inspiré de LeBonCoin** :
- ✅ Filtrage strict par catégorie
- ✅ Sous-catégories spécifiques
- ✅ Accueil affiche tout
- ✅ Compteurs de vues
- ✅ Profil utilisateur avec stats

**Tout est maintenant conforme au comportement de LeBonCoin !**
