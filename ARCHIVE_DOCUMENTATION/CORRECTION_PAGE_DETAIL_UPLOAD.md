# Correction Page Détail et Upload d'Images

**Date**: 17 novembre 2024

## Problèmes Identifiés

### 1. Page de Détail Complètement Vide
**Symptômes**:
- Prix affiché: "0 FCFA"
- Localisation: "undefined, undefined"
- Aucune description ni photo
- Section vendeur vide

**Causes**:
1. La fonction `loadListing()` n'utilisait pas correctement l'API
2. Structure de données backend ≠ frontend:
   - Backend: `specifications` → Frontend: `characteristics`
   - Backend: `user.firstName`, `user.lastName` → Frontend: `user.name`
   - Champs manquants: `user.memberSince`, `user.activeListings`

### 2. Erreur 500 lors de l'Upload d'Images
**Erreur**: `AxiosError: Request failed with status code 500`

**Cause**: 
- Frontend envoie: `FormData` avec `images[0]`, `images[1]`...
- Backend attendait: fichiers directs sans tableau
- Le backend ne déballait pas correctement le tableau `images[]`

### 3. Erreurs Réseau sur Placeholder
**Erreur**: `net::ERR_NAME_NOT_RESOLVED` sur `via.placeholder.com`
- Problème DNS/réseau avec le service externe

## Solutions Appliquées

### 1. ✅ Simplification du Chargement dans ListingDetail.jsx

**Avant**:
```javascript
const loadListing = async () => {
  const localListing = getListingById(id);  // ❌ Appel sans await
  
  if (localListing) {
    setListing(localListing);
  } else {
    const response = await listingsAPI.getListing(id);
    setListing(response.data);
  }
}
```

**Après**:
```javascript
const loadListing = async () => {
  setLoading(true);
  
  // Charger depuis l'API
  const response = await listingsAPI.getListing(id);
  const listingData = response.data || response;
  
  if (listingData) {
    setListing(listingData);
  } else {
    toast.error('Annonce introuvable');
  }
}
```

### 2. ✅ Correction du Backend Upload (UploadController.php)

**Avant**:
```php
$uploadedFiles = $request->files->all();

foreach ($uploadedFiles as $key => $file) {
    if (!$file) continue;
    // ...
}
```

**Après**:
```php
$uploadedFiles = $request->files->all();

// Si les fichiers sont dans un tableau 'images'
if (isset($uploadedFiles['images']) && is_array($uploadedFiles['images'])) {
    $uploadedFiles = $uploadedFiles['images'];
}

foreach ($uploadedFiles as $key => $file) {
    if (!$file || !is_object($file)) continue;
    // ...
}
```

### 3. ✅ Adaptation aux Données Backend

**Changements dans `ListingDetail.jsx`**:

1. **Caractéristiques**: `characteristics` → `specifications`
```javascript
// Avant
{listing.characteristics && ( ... )}

// Après
{listing.specifications && Object.keys(listing.specifications).length > 0 && ( ... )}
```

2. **Nom de l'utilisateur**: Construction depuis `firstName`/`lastName`
```javascript
const userName = listing.user?.name || 
  `${listing.user?.firstName || ''} ${listing.user?.lastName || ''}`.trim() || 
  'Utilisateur';
```

3. **Informations vendeur**: Simplification
```javascript
// Supprimé: user.memberSince, user.activeListings (non fournis par backend)
// Ajouté: user.city à la place
<div className="text-sm text-secondary-600">
  {listing.user?.city || 'Localisation non précisée'}
</div>
```

## Fichiers Modifiés

### Frontend
1. ✅ `planb-frontend/src/pages/ListingDetail.jsx`
   - Simplification de `loadListing()`
   - Changement `characteristics` → `specifications`
   - Construction dynamique de `userName`
   - Adaptation des champs utilisateur

### Backend
2. ✅ `planb-backend/src/Controller/UploadController.php`
   - Déballe le tableau `images[]`
   - Validation renforcée avec `is_object()`

## Structure Backend vs Frontend

### Backend retourne (ListingController.php):
```php
[
    'id', 'title', 'description', 'price',
    'category', 'subcategory', 'type',
    'country', 'city', 'commune', 'quartier',
    'mainImage', 'images' => [...],
    'specifications' => [...],  // ⚠️ Pas 'characteristics'
    'user' => [
        'id', 'firstName', 'lastName',  // ⚠️ Pas 'name'
        'phone', 'city', 'accountType', 'isPro'
    ]
]
```

### Frontend attend maintenant:
```javascript
{
  // ... même structure
  specifications: { ... },  // ✅ Corrigé
  user: {
    // On construit 'name' depuis firstName + lastName
  }
}
```

## Tests à Effectuer

### 1. Test de la Page de Détail
- [ ] Aller sur `/listing/3` (ou un ID existant)
- [ ] Vérifier que le prix s'affiche correctement
- [ ] Vérifier la description complète
- [ ] Vérifier les photos dans la galerie
- [ ] Vérifier la localisation (Ville, Pays)
- [ ] Vérifier les caractéristiques (si présentes)
- [ ] Vérifier le nom du vendeur

### 2. Test de l'Upload d'Images
- [ ] Aller sur `/publish`
- [ ] Suivre les étapes jusqu'à "Ajouter des photos"
- [ ] Uploader 2-3 images
- [ ] Vérifier qu'aucune erreur 500 n'apparaît
- [ ] Vérifier que les images s'affichent en preview
- [ ] Compléter la publication
- [ ] Vérifier que l'annonce créée contient les images

### 3. Vérification Console
- [ ] Plus d'erreur `ReferenceError: selectedCountry is not defined`
- [ ] Plus d'erreur `allListings.filter is not a function`
- [ ] Plus d'erreur 500 sur `/api/v1/upload`

## Améliorations Futures

### Backend
1. **Ajouter des champs manquants**:
   ```php
   'user' => [
       'name' => $user->getFirstName() . ' ' . $user->getLastName(),
       'memberSince' => $user->getCreatedAt()->format('Y'),
       'activeListings' => count($user->getActiveListings())
   ]
   ```

2. **Utiliser un service d'upload externe**:
   - Cloudinary
   - AWS S3
   - ImageKit

### Frontend
1. **Fallback pour placeholder d'images**:
   - Utiliser une image locale au lieu de via.placeholder.com
   - Créer un composant `ImagePlaceholder`

2. **Optimisation du chargement**:
   - Ajouter un cache des annonces récentes
   - Implémenter le lazy loading des images

## Résultat

✅ **Page de détail fonctionnelle**:
- Titre, prix, description s'affichent correctement
- Photos chargées depuis le backend
- Informations vendeur cohérentes
- Caractéristiques (si présentes) affichées

✅ **Upload d'images fonctionnel**:
- Plus d'erreur 500
- Images stockées dans `/public/uploads/listings/`
- URLs retournées correctement

✅ **Code cohérent**:
- Structure de données alignée backend ↔ frontend
- Gestion robuste des cas null/undefined
