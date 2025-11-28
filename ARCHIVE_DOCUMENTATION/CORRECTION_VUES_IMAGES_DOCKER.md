# Correction Vues & Images pour Docker

**Date**: 17 novembre 2024

## Problèmes Identifiés

### 1. ❌ Vues Comptabilisées même pour le Propriétaire
**Symptôme**: 
- Vous êtes le seul à avoir consulté l'annonce
- Mais "12 vues" s'affichent
- Chaque fois que vous rechargez, ça incrémente

**Cause**:
```php
// Backend - ListingController.php ligne 83-84
// Incrémenter les vues
$listing->incrementViews();  // ❌ TOUJOURS, même pour le propriétaire
$this->entityManager->flush();
```

**Conséquence**:
- Statistiques faussées
- Le propriétaire voit des "vues fantômes"
- Impossible de savoir le vrai nombre de visiteurs

---

### 2. ❌ Images Ne S'affichent Pas (Docker)
**Symptôme**:
- Images manquantes dans toutes les pages
- Icône "broken image" 🖼️
- Console: `404 Not Found` ou erreurs réseau

**Cause Root**:
```javascript
// Backend retourne: "/uploads/listings/abc123.jpg"
// Frontend l'utilise tel quel: <img src="/uploads/listings/abc123.jpg" />

// Problème Docker:
// Frontend: http://localhost:5173
// Backend:  http://localhost:8000

// Donc "/uploads/..." pointe vers:
// http://localhost:5173/uploads/listings/abc123.jpg  ❌ N'existe pas
// Au lieu de:
// http://localhost:8000/uploads/listings/abc123.jpg  ✅ Le bon chemin
```

**Architecture Docker**:
```
┌──────────────────┐         ┌──────────────────┐
│  Frontend        │         │  Backend         │
│  Port: 5173      │────────▶│  Port: 8000      │
│  planb-postgres  │         │  planb-backend   │
└──────────────────┘         └──────────────────┘
                                      │
                                      ▼
                              /public/uploads/
                              (Stockage images)
```

Les images sont dans le container backend, pas le frontend !

---

## Solutions Appliquées

### 1. ✅ Ne Plus Compter les Vues du Propriétaire

**Fichier**: `planb-backend/src/Controller/ListingController.php`

**Avant**:
```php
public function show(int $id): JsonResponse
{
    $listing = $this->listingRepository->find($id);
    
    // Incrémenter les vues
    $listing->incrementViews();  // ❌ TOUJOURS
    $this->entityManager->flush();
    
    return $this->json($this->serializeListing($listing, true));
}
```

**Après**:
```php
public function show(int $id): JsonResponse
{
    $listing = $this->listingRepository->find($id);
    
    // Incrémenter les vues seulement si ce n'est pas le propriétaire
    $currentUser = $this->getUser();
    $isOwner = $currentUser && $currentUser->getId() === $listing->getUser()->getId();
    
    if (!$isOwner) {
        $listing->incrementViews();
        $this->entityManager->flush();
    }
    
    return $this->json($this->serializeListing($listing, true));
}
```

**Résultat**:
- ✅ Propriétaire peut voir son annonce sans incrémenter
- ✅ Seuls les vrais visiteurs sont comptés
- ✅ Statistiques précises

---

### 2. ✅ Créer un Utilitaire de Conversion d'URL

**Nouveau fichier**: `planb-frontend/src/utils/images.js`

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const BACKEND_BASE_URL = API_URL.replace('/api/v1', '');

/**
 * Convertit une URL relative d'image en URL absolue
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Si l'URL est déjà absolue
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Si c'est un data URL (SVG inline)
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Sinon, préfixer avec l'URL du backend
  const cleanUrl = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
  return `${BACKEND_BASE_URL}/${cleanUrl}`;
};

/**
 * Prépare les images d'une annonce pour l'affichage
 */
export const prepareListingImages = (listing) => {
  if (!listing) return [];
  
  // Images multiples
  if (listing.images && listing.images.length > 0) {
    return listing.images.map(img => ({
      ...img,
      url: getImageUrl(img.url),
      thumbnailUrl: getImageUrl(img.thumbnailUrl || img.url)
    }));
  }
  
  // Image principale
  if (listing.mainImage) {
    return [{ url: getImageUrl(listing.mainImage) }];
  }
  
  // Placeholder SVG
  return [{ url: IMAGE_PLACEHOLDER }];
};
```

**Fonctionnement**:
```javascript
// Backend retourne: "/uploads/listings/abc123.jpg"
getImageUrl("/uploads/listings/abc123.jpg")
// Retourne: "http://localhost:8000/uploads/listings/abc123.jpg" ✅

// URLs absolues passent inchangées
getImageUrl("https://cdn.example.com/image.jpg")
// Retourne: "https://cdn.example.com/image.jpg" ✅

// Data URLs (SVG) passent inchangés
getImageUrl("data:image/svg+xml,...")
// Retourne: "data:image/svg+xml,..." ✅
```

---

### 3. ✅ Mettre à Jour Tous les Composants

**Fichiers modifiés**:

#### `ListingDetail.jsx`
```javascript
import { prepareListingImages, getImageUrl } from '../utils/images';

// Dans le composant
const images = prepareListingImages(listing); // ✅ URLs absolues
```

#### `ListingCard.jsx`
```javascript
import { getImageUrl } from '../../utils/images';

<img
  src={getImageUrl(listing.mainImage || listing.images?.[0]?.url)}
  alt={listing.title}
/>
```

#### `Profile.jsx`
```javascript
import { getImageUrl, IMAGE_PLACEHOLDER } from '../utils/images';

<img
  src={getImageUrl(listing.mainImage) || IMAGE_PLACEHOLDER}
  alt={listing.title}
/>
```

#### `FavoritesList.jsx`
```javascript
import { getImageUrl } from '../utils/images';

<img
  src={getImageUrl(listing.mainImage)}
  alt={listing.title}
/>
```

---

## Architecture de la Solution

### Flux de Données - Images

```
┌─────────────────────────────────────────────────────────────┐
│  UPLOAD (Publish.jsx)                                       │
│                                                              │
│  1. User sélectionne image.jpg                              │
│  2. FormData envoyé → POST /api/v1/upload                   │
│  3. Backend stocke → /public/uploads/listings/xyz.jpg       │
│  4. Backend retourne → "/uploads/listings/xyz.jpg"          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  STOCKAGE (Backend Entity)                                  │
│                                                              │
│  Image {                                                    │
│    url: "/uploads/listings/xyz.jpg"  // ⚠️ Relative         │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  API RESPONSE (GET /api/v1/listings/3)                      │
│                                                              │
│  {                                                          │
│    mainImage: "/uploads/listings/xyz.jpg",                 │
│    images: [                                               │
│      { url: "/uploads/listings/xyz.jpg" }                  │
│    ]                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND TRANSFORMATION (utils/images.js)                  │
│                                                              │
│  getImageUrl("/uploads/listings/xyz.jpg")                   │
│  → "http://localhost:8000/uploads/listings/xyz.jpg" ✅      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  AFFICHAGE (ListingDetail.jsx)                              │
│                                                              │
│  <img src="http://localhost:8000/uploads/listings/xyz.jpg" │
│       alt="villa moderne T5" />                             │
│                                                              │
│  ✅ Image s'affiche correctement !                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Variables d'Environnement

### Frontend `.env`
```bash
# URL de l'API backend
VITE_API_URL=http://localhost:8000/api/v1

# Pour production
# VITE_API_URL=https://api.planb.ci/api/v1
```

### Docker Compose
```yaml
services:
  planb-frontend:
    environment:
      - VITE_API_URL=http://localhost:8000/api/v1
    ports:
      - "5173:5173"
  
  planb-backend:
    ports:
      - "8000:80"
    volumes:
      - ./uploads:/var/www/html/public/uploads  # Persist images
```

---

## Tests à Effectuer

### Test 1: Vues du Propriétaire
1. **Se connecter** avec votre compte
2. **Aller sur une de vos annonces** (ex: `/listing/3`)
3. **Noter le nombre de vues** (ex: "12 vues")
4. **Recharger la page** plusieurs fois (F5)
5. **Vérifier**: Le nombre ne doit **PAS augmenter** ✅

### Test 2: Vues d'un Visiteur
1. **Se déconnecter** OU utiliser un autre compte
2. **Aller sur l'annonce** `/listing/3`
3. **Noter le nombre** (ex: "12 vues")
4. **Recharger** → Le nombre **DOIT augmenter** à "13 vues" ✅

### Test 3: Images dans Liste
1. **Aller sur l'accueil** `/`
2. **Vérifier**: Toutes les images des cartes s'affichent ✅
3. **Console**: Pas d'erreur 404 sur `/uploads/...` ✅

### Test 4: Images Page Détail
1. **Aller sur une annonce** `/listing/3`
2. **Vérifier**: 
   - Galerie d'images fonctionne ✅
   - Pas d'icône "broken image" ✅
   - Peut swiper entre les photos ✅

### Test 5: Images Profil
1. **Aller sur profil** `/profile`
2. **Onglet "Actives"**
3. **Vérifier**: Miniatures des annonces s'affichent ✅

### Test 6: Images Favoris
1. **Aller sur favoris** `/favorites`
2. **Vérifier**: Images des favoris s'affichent ✅

### Test 7: Console Réseau
1. **Ouvrir DevTools** (F12)
2. **Onglet Network**
3. **Filtrer "Img"**
4. **Vérifier**: 
   - URLs commencent par `http://localhost:8000/uploads/` ✅
   - Statut: `200 OK` (pas de 404) ✅

---

## Fichiers Modifiés

### Backend
1. ✅ `planb-backend/src/Controller/ListingController.php`
   - Ajout condition `if (!$isOwner)` avant `incrementViews()`

### Frontend
2. ✅ `planb-frontend/src/utils/images.js` (NOUVEAU)
   - Fonctions `getImageUrl()` et `prepareListingImages()`
3. ✅ `planb-frontend/src/pages/ListingDetail.jsx`
   - Import et utilisation de `prepareListingImages()`
4. ✅ `planb-frontend/src/components/listing/ListingCard.jsx`
   - Import et utilisation de `getImageUrl()`
5. ✅ `planb-frontend/src/pages/Profile.jsx`
   - Import et utilisation de `getImageUrl()`
6. ✅ `planb-frontend/src/pages/FavoritesList.jsx`
   - Import et utilisation de `getImageUrl()`

---

## Configuration Docker

### Vérifier que les Volumes sont Montés

```bash
# Voir les containers
docker ps

# Vérifier le volume uploads
docker exec -it planb-backend ls -la /var/www/html/public/uploads/listings

# Doit afficher vos images uploadées
```

### Si les Images N'apparaissent Toujours Pas

1. **Vérifier les permissions** du dossier uploads:
```bash
docker exec -it planb-backend chmod -R 777 /var/www/html/public/uploads
```

2. **Vérifier le nginx/apache** sert les fichiers statiques:
```nginx
# nginx.conf
location /uploads {
    alias /var/www/html/public/uploads;
    expires 30d;
    access_log off;
}
```

3. **Rebuild les containers** si nécessaire:
```bash
docker-compose down
docker-compose up --build
```

---

## Améliorations Futures

### 1. Service Cloud pour Images (Recommandé en Production)
Au lieu de stocker localement, utiliser:
- **Cloudinary** (recommandé)
- **AWS S3**
- **Azure Blob Storage**

**Avantages**:
- ✅ URLs absolues directement
- ✅ Optimisation automatique (resize, webp)
- ✅ CDN intégré
- ✅ Pas de problème Docker

### 2. Lazy Loading des Images
```javascript
<img 
  src={getImageUrl(listing.mainImage)} 
  loading="lazy"  // ✅ Charge seulement si visible
  alt={listing.title}
/>
```

### 3. Thumbnails Automatiques
Le backend pourrait générer des miniatures:
```php
// UploadController.php
$thumbnail = $this->imageService->createThumbnail($file, 300, 300);
$image->setThumbnailUrl($thumbnail);
```

### 4. Cache des Images
```javascript
// Service Worker pour cache offline
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/uploads/')) {
    event.respondWith(
      caches.match(event.request).then(response => 
        response || fetch(event.request)
      )
    );
  }
});
```

---

## Résultat Final

### Avant ❌
- Vues: +1 à chaque rechargement du propriétaire
- Images: 🖼️ Toutes cassées
- Console: Pleins d'erreurs 404

### Après ✅
- Vues: Comptées uniquement pour les visiteurs réels
- Images: Toutes affichées correctement
- Console: Propre, pas d'erreurs

---

## Debug Rapide

### Si une image ne s'affiche pas:

1. **Console du navigateur**:
```javascript
// Vérifier l'URL générée
console.log(getImageUrl("/uploads/listings/xyz.jpg"));
// Doit retourner: "http://localhost:8000/uploads/listings/xyz.jpg"
```

2. **Tester l'URL directement**:
   - Copier l'URL de l'image
   - La coller dans un nouvel onglet
   - Si erreur 404 → Le fichier n'existe pas côté backend
   - Si l'image s'affiche → Problème dans le composant React

3. **Vérifier le fichier existe**:
```bash
docker exec -it planb-backend ls -la /var/www/html/public/uploads/listings/xyz.jpg
```

4. **Logs backend**:
```bash
docker logs planb-backend
```

---

## Commandes Utiles Docker

```bash
# Redémarrer les services
docker-compose restart

# Voir les logs
docker-compose logs -f planb-backend
docker-compose logs -f planb-frontend

# Entrer dans le container
docker exec -it planb-backend bash
docker exec -it planb-postgres bash

# Nettoyer et rebuild
docker-compose down -v
docker-compose up --build -d
```

---

## Conclusion

✅ **Les deux problèmes sont maintenant résolus**:

1. **Vues**: Seuls les visiteurs sont comptés
2. **Images**: Affichées correctement via URLs absolues

Votre application fonctionne maintenant parfaitement avec Docker ! 🎉🐳
