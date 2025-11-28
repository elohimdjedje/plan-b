# 🎯 Système de Filtres Dynamiques Complet

## ✅ Filtres Avancés Adaptés à Vos 3 Catégories !

Le modal de filtres s'adapte maintenant automatiquement selon la catégorie sélectionnée !

---

## 📋 Filtres Communs (Toutes Catégories)

Ces filtres apparaissent **toujours**, quelle que soit la catégorie :

### 1. **Type d'annonce**
- ✅ Vente
- ✅ Location

### 2. **Localisation**
- ✅ Pays (CI, BJ, SN, ML)
- ✅ Ville (dépend du pays sélectionné)

### 3. **Prix**
- ✅ Prix minimum (FCFA)
- ✅ Prix maximum (FCFA)
- Label dynamique : "Loyer" si Location, "Prix" si Vente

---

## 🏠 Filtres IMMOBILIER

**Uniquement si catégorie = Immobilier**

### Type de bien (Checkboxes)
- ☐ Appartement
- ☐ Maison
- ☐ Villa
- ☐ Terrain
- ☐ Bureau
- ☐ Commerce

### Pièces (Boutons 1-8+)
- Sélection multiple
- Fond orange si sélectionné

### Chambres (Boutons 1-8+)
- Sélection multiple
- Fond orange si sélectionné

### Surface Habitable
- Surface min (m²)
- Surface max (m²)

### Surface du Terrain
- Surface min (m²)
- Surface max (m²)

**Total : 5 sections**

---

## 🚗 Filtres VÉHICULES

**Uniquement si catégorie = Véhicule**

### Type de véhicule (Boutons)
- Voiture
- Moto
- Camion
- Bus

### Marque et Modèle
- Champ texte : Marque (Ex: Toyota)
- Champ texte : Modèle (Ex: Corolla)

### Année
- Année min (1900 - 2025)
- Année max (1900 - 2025)

### Kilométrage
- Km min
- Km max

### Carburant (Boutons)
- Essence
- Diesel
- Électrique
- Hybride

### Boîte de Vitesse (Boutons)
- Manuelle
- Automatique

**Total : 6 sections**

---

## 🌴 Filtres VACANCES

**Uniquement si catégorie = Vacance**

### Type d'hébergement (Boutons)
- Hôtel
- Appartement
- Villa
- Chambre d'hôte

### Nombre de Voyageurs (Boutons 1-7+)
- Sélection multiple
- Fond orange si sélectionné

### Dates
- Date d'arrivée (input date)
- Date de départ (input date)

**Total : 3 sections**

---

## 🎯 Comment Ça Marche

### Changement Automatique
1. Sélectionnez une catégorie (🏠 Immobilier, 🚗 Véhicules, 🌴 Vacances)
2. Cliquez sur l'icône filtres ⚙️
3. **Le modal affiche les filtres adaptés à la catégorie !**

### Exemple : Immobilier
```
┌────────────────────────┐
│ Type d'annonce         │
│ [Vente] [Location]     │
├────────────────────────┤
│ Localisation           │
│ [Pays] [Ville]         │
├────────────────────────┤
│ Prix                   │
│ [Min] [Max]            │
├────────────────────────┤
│ Type de bien           │ ← Spécifique Immobilier
│ ☐ Appartement          │
│ ☐ Maison               │
├────────────────────────┤
│ Pièces                 │ ← Spécifique Immobilier
│ [1][2][3][4][5][6][7][8+] │
└────────────────────────┘
```

### Exemple : Véhicules
```
┌────────────────────────┐
│ Type d'annonce         │
│ [Vente] [Location]     │
├────────────────────────┤
│ Localisation           │
│ [Pays] [Ville]         │
├────────────────────────┤
│ Prix                   │
│ [Min] [Max]            │
├────────────────────────┤
│ Type de véhicule       │ ← Spécifique Véhicules
│ [Voiture] [Moto]       │
│ [Camion] [Bus]         │
├────────────────────────┤
│ Marque | Modèle        │ ← Spécifique Véhicules
│ [Toyota] [Corolla]     │
├────────────────────────┤
│ Carburant              │ ← Spécifique Véhicules
│ [Essence] [Diesel]     │
└────────────────────────┘
```

### Exemple : Vacances
```
┌────────────────────────┐
│ Type d'annonce         │
│ [Vente] [Location]     │
├────────────────────────┤
│ Localisation           │
│ [Pays] [Ville]         │
├────────────────────────┤
│ Prix                   │
│ [Min] [Max]            │
├────────────────────────┤
│ Type d'hébergement     │ ← Spécifique Vacances
│ [Hôtel] [Appartement]  │
├────────────────────────┤
│ Nombre de voyageurs    │ ← Spécifique Vacances
│ [1][2][3][4][5][6][7+] │
├────────────────────────┤
│ Dates                  │ ← Spécifique Vacances
│ Arrivée | Départ       │
└────────────────────────┘
```

---

## 🎨 Design

### Boutons Type (Vente/Location, Types)
- Fond gris clair par défaut
- **Fond orange** si sélectionné
- Texte blanc si sélectionné

### Boutons Nombres (Pièces, Chambres, Voyageurs)
- Grid 4 colonnes
- Fond gris clair par défaut
- **Fond orange** si sélectionné
- Multi-sélection possible

### Checkboxes (Type de bien Immobilier)
- Liste verticale
- Checkbox orange si cochée
- Hover gris clair

### Champs Texte/Nombre
- Fond gris clair
- Border gris
- **Border orange** au focus
- Unités affichées (FCFA, m², km)

---

## 📊 Compteur de Filtres

Le badge rouge sur l'icône ⚙️ compte **tous les filtres actifs** :
- Type d'annonce (+1)
- Prix (+1 si min OU max)
- Pays (+1)
- Ville (+1)
- Et tous les filtres spécifiques selon la catégorie

**Exemple :** 
- Immobilier : Type + Prix + Pays + Appartement coché + 3 pièces = **5 filtres**
- Badge rouge affiche : **5**

---

## 🔄 Logique de Réinitialisation

Bouton **"Effacer"** :
- Efface TOUS les filtres
- De toutes les catégories
- Garde le modal ouvert
- Badge devient 0

---

## 🌐 Testez Maintenant !

### Étape 1 : Choisissez une catégorie
- Cliquez sur 🏠 **Immobilier**, 🚗 **Véhicules**, ou 🌴 **Vacances**

### Étape 2 : Ouvrez les filtres
- Cliquez sur l'icône ⚙️ (filtres)

### Étape 3 : Observez
- **Les filtres changent selon la catégorie !**

### Test Immobilier
1. Cliquez sur 🏠 Immobilier
2. Ouvrez les filtres
3. Vous voyez : Type de bien, Pièces, Chambres, Surfaces

### Test Véhicules
1. Cliquez sur 🚗 Véhicules
2. Ouvrez les filtres
3. Vous voyez : Type véhicule, Marque, Modèle, Année, Kilométrage, Carburant

### Test Vacances
1. Cliquez sur 🌴 Vacances
2. Ouvrez les filtres
3. Vous voyez : Type hébergement, Voyageurs, Dates

---

## ✨ Avantages

### 1. **Filtres Pertinents**
- Chaque catégorie a ses propres filtres
- Pas de confusion
- UX optimale

### 2. **Même Design**
- Style Le Bon Coin conservé
- Animations fluides
- Cohérence visuelle

### 3. **Extensible**
- Facile d'ajouter des filtres
- Structure modulaire
- Code propre

### 4. **Performance**
- Rendu conditionnel
- Pas de filtres inutiles affichés
- Rapide et fluide

---

## 🔧 Fichiers Modifiés

1. **AdvancedFiltersModal.jsx**
   - Ajout de tous les états pour les 3 catégories
   - Rendu conditionnel selon activeCategory
   - Handlers universels

2. **FilterBar.jsx**
   - Reçoit et transmet activeCategory
   - Passe au modal

3. **Home.jsx**
   - Transmet activeCategory au FilterBar
   - Synchronisation avec CategoryTabs

---

## 📱 Responsive

**Mobile :**
- Modal plein écran (90% hauteur)
- Grid adaptatif
- Scroll fluide
- Header et footer fixes

**Tablette/Desktop :**
- Même comportement
- Centré avec max-width

---

## 🎯 Filtres Retirés (Comme Demandé)

**PAS dans les filtres :**
- ❌ Meublé / Non meublé
- ❌ Extérieur
- ❌ Ascenseur
- ❌ Exposition
- ❌ Caractéristiques supplémentaires
- ❌ Classe énergie

**Gardé uniquement :**
- ✅ Filtres essentiels
- ✅ Adaptés à chaque catégorie
- ✅ Logique claire et simple

---

## 🚀 Prochaines Étapes (Backend)

Pour que les filtres fonctionnent avec le backend :

### 1. Mettre à jour `ListingController.php`
Ajouter le filtrage par :
- `yearMin`, `yearMax` (véhicules)
- `mileageMin`, `mileageMax` (véhicules)
- `fuelType`, `transmission` (véhicules)
- `checkIn`, `checkOut` (vacances)
- `guests` (vacances)

### 2. Mettre à jour `Listing.php` (Entity)
Ajouter les champs dans `specifications` JSON :
```php
[
  'year' => 2020,
  'mileage' => 50000,
  'fuelType' => 'diesel',
  'transmission' => 'automatique',
  'guests' => 4,
]
```

---

## ✅ Résumé

Votre système de filtres est maintenant :
- ✅ **Dynamique** (s'adapte à la catégorie)
- ✅ **Complet** (tous les filtres nécessaires)
- ✅ **Propre** (sans éléments inutiles)
- ✅ **Style Le Bon Coin** (design identique)
- ✅ **Prêt à être connecté au backend**

---

**Rechargez : http://localhost:5173 et testez les 3 catégories ! 🎉**
