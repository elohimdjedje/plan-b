# Affichage Grille 2x2 sur Mobile (Style Leboncoin)

**Date**: 17 novembre 2024

## 🎯 Objectif

Afficher les annonces en **grille 2 colonnes** sur mobile, exactement comme sur **Leboncoin**, avec un design compact et optimisé pour petits écrans.

---

## 📱 Design Leboncoin

### Caractéristiques
- ✅ **2 colonnes** sur mobile
- ✅ **Images carrées** compactes
- ✅ **Textes petits** mais lisibles
- ✅ **Espacement réduit** entre les cartes
- ✅ **Informations essentielles** uniquement
- ✅ **Badge favoris** en petit

---

## ✅ Modifications Appliquées

### 1. Home.jsx - Grille 2 Colonnes

**Fichier**: `planb-frontend/src/pages/Home.jsx`

**Avant** ❌:
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
  {/* 1 colonne sur mobile ❌ */}
```

**Après** ✅:
```jsx
<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
  {/* 2 colonnes sur mobile ✅ */}
```

**Changements**:
- ✅ `grid-cols-1` → `grid-cols-2` (2 colonnes dès le mobile)
- ✅ `gap-3` → `gap-2` (espacement réduit sur mobile)
- ✅ Supprimé `sm:grid-cols-2` (inutile maintenant)

---

### 2. ListingCard.jsx - Design Compact Mobile

**Fichier**: `planb-frontend/src/components/listing/ListingCard.jsx`

#### A. Hauteur de Carte Réduite

**Avant** ❌:
```jsx
<div className="min-h-[380px] md:min-h-[420px]">
  {/* Trop haut sur mobile ❌ */}
```

**Après** ✅:
```jsx
<div className="min-h-[280px] md:min-h-[420px]">
  {/* Compact sur mobile ✅ */}
```

**Réduction**: 380px → 280px (100px de moins)

---

#### B. Image Plus Petite

**Avant** ❌:
```jsx
<div className="relative h-48 md:h-56 lg:h-64">
  {/* Image: 192px (h-48) sur mobile ❌ */}
```

**Après** ✅:
```jsx
<div className="relative h-32 md:h-56 lg:h-64">
  {/* Image: 128px (h-32) sur mobile ✅ */}
```

**Réduction**: 192px → 128px (64px de moins)

---

#### C. Bouton Favoris Plus Petit

**Avant** ❌:
```jsx
<button className="w-9 h-9 top-2 right-2">
  <Heart size={18} />
```

**Après** ✅:
```jsx
<button className="w-7 h-7 top-1.5 right-1.5">
  <Heart size={14} />
```

**Changements**:
- ✅ Taille: 36px → 28px (bouton)
- ✅ Icône: 18px → 14px
- ✅ Position: plus proche du bord

---

#### D. Paddings Réduits

**Avant** ❌:
```jsx
<div className="p-3 md:p-4 space-y-2">
  {/* Trop d'espace sur mobile ❌ */}
```

**Après** ✅:
```jsx
<div className="p-2 md:p-4 space-y-1 md:space-y-2">
  {/* Compact sur mobile ✅ */}
```

**Changements**:
- ✅ Padding: 12px → 8px
- ✅ Espacement vertical: 8px → 4px

---

#### E. Titre Plus Petit

**Avant** ❌:
```jsx
<h3 className="text-sm md:text-base line-clamp-1">
  {/* Une seule ligne, texte moyen ❌ */}
```

**Après** ✅:
```jsx
<h3 className="text-xs md:text-base line-clamp-2 leading-tight">
  {/* 2 lignes, texte petit, lignes serrées ✅ */}
```

**Changements**:
- ✅ Taille: 14px → 12px
- ✅ Lignes: 1 → 2
- ✅ Interligne: réduit (`leading-tight`)

---

#### F. Prix Plus Petit

**Avant** ❌:
```jsx
<p className="text-base md:text-lg font-bold">
  {/* 16px sur mobile ❌ */}
```

**Après** ✅:
```jsx
<p className="text-sm md:text-lg font-bold">
  {/* 14px sur mobile ✅ */}
```

---

#### G. Surface Cachée sur Mobile

**Avant** ❌:
```jsx
{listing.specifications?.surface && (
  <p className="text-sm">
    {listing.specifications.surface} m²
  </p>
)}
```

**Après** ✅:
```jsx
{listing.specifications?.surface && (
  <p className="hidden md:block text-sm">
    {listing.specifications.surface} m²
  </p>
)}
```

**Raison**: Économiser de l'espace sur mobile

---

#### H. Badge PRO Caché sur Mobile

**Avant** ❌:
```jsx
{listing.user?.accountType === 'PRO' && (
  <div className="inline-flex">
    <span className="px-2 py-0.5">Pro</span>
  </div>
)}
```

**Après** ✅:
```jsx
{listing.user?.accountType === 'PRO' && (
  <div className="hidden md:inline-flex">
    <span className="px-2 py-0.5">Pro</span>
  </div>
)}
```

**Raison**: Badge visible seulement sur tablette/desktop

---

#### I. Type "Locations/Ventes" Caché sur Mobile

**Avant** ❌:
```jsx
<p className="text-sm font-medium">
  {listing.type === 'location' ? 'Locations' : 'Ventes'}
</p>
```

**Après** ✅:
```jsx
<p className="hidden md:block text-sm font-medium">
  {listing.type === 'location' ? 'Locations' : 'Ventes'}
</p>
```

**Raison**: Information secondaire, pas essentielle sur mobile

---

#### J. Localisation et Date Plus Petites

**Avant** ❌:
```jsx
<p className="text-xs text-secondary-600">
  {listing.city}
</p>
<p className="text-xs text-secondary-500">
  {formatRelativeDate(listing.createdAt)}
</p>
```

**Après** ✅:
```jsx
<p className="text-[10px] md:text-xs text-secondary-600">
  {listing.city}
</p>
<p className="text-[10px] md:text-xs text-secondary-500">
  {formatRelativeDate(listing.createdAt)}
</p>
```

**Changements**:
- ✅ Taille: 12px → 10px sur mobile
- ✅ 12px sur tablette/desktop

---

## 📊 Comparaison Avant/Après

### Grille

| Critère | Avant ❌ | Après ✅ |
|---------|----------|----------|
| **Colonnes mobile** | 1 | 2 |
| **Gap mobile** | 12px | 8px |
| **Layout** | Liste verticale | Grille 2x2 |

### Carte

| Critère | Avant ❌ | Après ✅ |
|---------|----------|----------|
| **Hauteur min** | 380px | 280px |
| **Image** | 192px | 128px |
| **Padding** | 12px | 8px |
| **Titre** | 14px, 1 ligne | 12px, 2 lignes |
| **Prix** | 16px | 14px |
| **Localisation** | 12px | 10px |
| **Bouton ❤️** | 36px | 28px |
| **Badge PRO** | Visible | Caché |
| **Surface** | Visible | Caché |
| **Type** | Visible | Caché |

---

## 📱 Breakpoints

### Mobile (< 1024px)
```
- Grille: 2 colonnes
- Gap: 8px
- Carte: 280px min
- Image: 128px
- Titre: 12px (2 lignes)
- Prix: 14px
- Localisation: 10px
- Badge ❤️: 28px
- Surface: Caché
- Badge PRO: Caché
- Type: Caché
```

### Tablette/Desktop (≥ 1024px)
```
- Grille: 3 colonnes
- Gap: 24px
- Carte: 420px min
- Image: 224px
- Titre: 16px
- Prix: 18px
- Localisation: 12px
- Badge ❤️: 40px
- Surface: Visible
- Badge PRO: Visible
- Type: Visible
```

---

## 🎨 Style Leboncoin Respecté

### ✅ Caractéristiques Appliquées

1. **Grille 2x2 Mobile**
   - 2 colonnes dès le début
   - Pas de breakpoint `sm:`
   
2. **Compact et Dense**
   - Espacement réduit (8px)
   - Paddings minimes (8px)
   - Images carrées petites (128px)
   
3. **Informations Essentielles**
   - Titre (2 lignes)
   - Prix (gras)
   - Localisation
   - Date
   - Image
   
4. **Badges Discrets**
   - Favoris petit (28px)
   - PRO caché sur mobile
   
5. **Textes Lisibles**
   - Titre: 12px
   - Prix: 14px (gras)
   - Localisation: 10px
   
6. **Responsive Adapté**
   - Mobile: ultra-compact
   - Tablette: normal
   - Desktop: large

---

## 🧪 Tests

### Test 1: Affichage Mobile (< 768px)
1. **Ouvrir** l'app en mode mobile (F12 → mode responsive)
2. **Largeur**: 375px (iPhone)
3. **Vérifier**:
   - ✅ 2 colonnes d'annonces
   - ✅ Espace réduit entre les cartes
   - ✅ Cartes compactes (~280px)
   - ✅ Images petites (~128px)
   - ✅ Titre sur 2 lignes
   - ✅ Badge PRO caché
   - ✅ Surface cachée

### Test 2: Affichage Tablette (768-1024px)
1. **Largeur**: 768px (iPad)
2. **Vérifier**:
   - ✅ 2 colonnes encore
   - ✅ Commence à s'agrandir
   - ✅ Textes moyens

### Test 3: Affichage Desktop (> 1024px)
1. **Largeur**: 1440px (Desktop)
2. **Vérifier**:
   - ✅ 3 colonnes
   - ✅ Cartes larges
   - ✅ Badge PRO visible
   - ✅ Surface visible
   - ✅ Type visible

---

## 📂 Fichiers Modifiés

1. ✅ `planb-frontend/src/pages/Home.jsx`
   - Grille: `grid-cols-2` au lieu de `grid-cols-1`
   - Gap: `gap-2` au lieu de `gap-3`

2. ✅ `planb-frontend/src/components/listing/ListingCard.jsx`
   - Hauteur carte: 280px au lieu de 380px
   - Image: h-32 au lieu de h-48
   - Padding: p-2 au lieu de p-3
   - Spacing: space-y-1 au lieu de space-y-2
   - Titre: text-xs au lieu de text-sm, line-clamp-2
   - Prix: text-sm au lieu de text-base
   - Localisation: text-[10px] au lieu de text-xs
   - Bouton ❤️: w-7 h-7 au lieu de w-9 h-9
   - Badge PRO: hidden sur mobile
   - Surface: hidden sur mobile
   - Type: hidden sur mobile

---

## 💡 Optimisations Futures

### 1. Images Lazy Loading Optimisé

```jsx
<img
  src={getImageUrl(listing.mainImage)}
  alt={listing.title}
  loading="lazy"
  decoding="async"
  className="w-full h-full object-cover"
/>
```

### 2. Skeleton Loading

Pendant le chargement, afficher des placeholders:

```jsx
{loading && (
  <div className="grid grid-cols-2 gap-2">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-gray-200 h-32 rounded-t-lg"></div>
        <div className="p-2 space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    ))}
  </div>
)}
```

### 3. Infinite Scroll

Au lieu de pagination, charger plus d'annonces en scrollant:

```jsx
const handleScroll = () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    loadMoreListings();
  }
};

useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

### 4. Filtres Sticky

Garder les filtres visibles en scrollant:

```jsx
<div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md">
  <FilterBar />
  <CategoryTabs />
</div>
```

---

## ✅ Résumé

### Problème ❌
- Grille 1 colonne sur mobile (liste verticale)
- Cartes trop grandes (380px)
- Espacement excessif (12px)
- Textes trop gros
- Informations secondaires visibles

### Solution ✅
- Grille 2 colonnes sur mobile (comme Leboncoin)
- Cartes compactes (280px)
- Espacement réduit (8px)
- Textes optimisés (10-14px)
- Informations essentielles uniquement

### Résultat 🎉
- ✅ **Affichage 2x2** sur mobile
- ✅ **Design compact** comme Leboncoin
- ✅ **Lisibilité** préservée
- ✅ **Performance** optimale
- ✅ **UX améliorée**

**Les annonces s'affichent maintenant en grille 2x2 sur mobile, exactement comme sur Leboncoin !** 📱✨
