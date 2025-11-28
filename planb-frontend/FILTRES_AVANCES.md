# 🎯 Filtres Avancés (Style Le Bon Coin)

## ✅ Nouveau Design Implémenté !

Le modal de filtres avancés est maintenant exactement comme Le Bon Coin ! 🎨

---

## 🌐 Comment Accéder

### Sur la Page d'Accueil
1. Rechargez : **http://localhost:5173**
2. Cliquez sur l'**icône filtres** (⚙️) à droite de la recherche
3. Le modal s'ouvre en plein écran depuis le bas !

---

## 📋 Sections du Filtre

### 1. **Catégorie**
- Bouton "Locations" avec flèche →
- Permet de choisir entre Vente/Location

### 2. **Type de Bien** ✅
Checkboxes avec compteurs :
- ☐ Maison (1)
- ☐ Appartement (15)
- ☐ Terrain (0)
- ☐ Parking (0)
- ☐ Autre (0)

### 3. **Loyer / Prix** 💰
Deux champs côte à côte :
- Loyer minimum (FCFA)
- Loyer maximum (FCFA)

### 4. **Pièces** 🏠
Sélection multiple avec boutons :
```
[1] [2] [3] [4] [5] [6]
[7] [8+]
```
- Fond gris par défaut
- **Fond orange** quand sélectionné
- Texte : "Sélectionnez un minimum et un maximum"

### 5. **Chambres** 🛏️
Même système que Pièces :
```
[1] [2] [3] [4] [5] [6]
[7] [8+]
```

### 6. **Surface Habitable** 📐
Deux champs :
- Surface min (m²)
- Surface max (m²)

### 7. **Surface du Terrain** 🌳
Deux champs :
- Surface min (m²)
- Surface max (m²)

---

## 🎨 Design

### Header
```
┌────────────────────────┐
│  Rechercher        ✕   │
└────────────────────────┘
```

### Corps
```
┌────────────────────────┐
│ Catégorie              │
│ [Locations          >] │
├────────────────────────┤
│ Type de bien           │
│ ☐ Maison 1             │
│ ☐ Appartement 15       │
│ ☐ Terrain 0            │
├────────────────────────┤
│ Loyer                  │
│ [Min FCFA] [Max FCFA]  │
├────────────────────────┤
│ Pièces                 │
│ Sélectionnez un min... │
│ [1][2][3][4][5][6]     │
│ [7][8+]                │
├────────────────────────┤
│ ... (autres filtres)   │
└────────────────────────┘
```

### Footer
```
┌────────────────────────┐
│ [Effacer] [Rechercher(16)] │
└────────────────────────┘
```

---

## 🎯 Interactions

### Ouvrir le Modal
1. Cliquez sur l'icône ⚙️ filtres
2. Animation : modal glisse du bas vers le haut
3. Fond sombre derrière (overlay)

### Fermer le Modal
- Cliquez sur le ✕ en haut à droite
- Cliquez sur le fond sombre
- Animation : modal glisse vers le bas

### Sélectionner des Filtres

**Checkboxes (Type de bien) :**
- Cliquez pour cocher/décocher
- Compteur affiché à droite

**Boutons (Pièces/Chambres) :**
- Cliquez pour sélectionner
- Fond devient orange
- Texte devient blanc
- Peut sélectionner plusieurs boutons

**Champs de Texte :**
- Tapez le nombre
- Unité affichée à droite (FCFA ou m²)

### Appliquer les Filtres
1. Remplissez les filtres souhaités
2. Cliquez sur **"Rechercher (X)"**
   - (X) = nombre de filtres actifs
3. Le modal se ferme
4. Les résultats sont filtrés

### Effacer
- Cliquez sur **"Effacer"**
- Tous les filtres sont réinitialisés
- Reste sur le modal (ne ferme pas)

---

## 📊 Compteur de Filtres

Sur l'icône ⚙️ dans la page d'accueil :
- Badge rouge avec le nombre de filtres actifs
- Exemple : **3** si 3 filtres sont appliqués

---

## 🎨 Couleurs

| Élément | Couleur | État |
|---------|---------|------|
| Background modal | Blanc | - |
| Bouton pièce inactif | Gris clair | `bg-secondary-50` |
| Bouton pièce actif | Orange | `bg-primary-500` |
| Checkbox cochée | Orange | `text-primary-500` |
| Bouton Rechercher | Orange | `bg-primary-500` |
| Bouton Effacer | Blanc bordure | `variant="outline"` |
| Badge compteur | Rouge | `bg-red-500` |

---

## ✨ Animations

**Ouverture :**
- Modal glisse du bas (`translateY: 100%` → `0`)
- Fond sombre apparaît (`opacity: 0` → `1`)
- Durée : 300ms
- Type : Spring (rebond léger)

**Fermeture :**
- Modal glisse vers le bas
- Fond sombre disparaît
- Durée : 200ms

**Scroll :**
- Header et footer fixes
- Contenu scrollable entre les deux
- Max hauteur : 90% de l'écran

---

## 🔧 Fonctionnalités Techniques

### Multi-Sélection
- **Type de bien** : Peut cocher plusieurs types
- **Pièces** : Peut sélectionner min ET max (ou plusieurs)
- **Chambres** : Idem

### Validation
- Aucune validation stricte
- Tous les champs sont optionnels
- Si vide, le filtre n'est pas appliqué

### Persistance
- Les filtres sont passés à `onApply()`
- Sauvegardés dans le state de la page Home
- Affichés dans le compteur

---

## 🎯 Exemple d'Utilisation

### Scénario 1 : Recherche Simple
1. Ouvrir le modal
2. Cocher "Appartement"
3. Sélectionner "3" pièces
4. Cliquer "Rechercher (2)"

### Scénario 2 : Recherche Avancée
1. Ouvrir le modal
2. Cocher "Maison" ET "Villa"
3. Prix : 200 000 - 500 000 FCFA
4. Pièces : 3, 4, 5
5. Chambres : 2, 3
6. Surface : 100 - 200 m²
7. Cliquer "Rechercher (6)"

### Scénario 3 : Réinitialiser
1. Modal ouvert avec filtres actifs
2. Cliquer "Effacer"
3. Tous les champs sont vides
4. Peut fermer ou appliquer

---

## 📱 Responsive

**Mobile :**
- Modal prend 90% de la hauteur
- Grille 4 colonnes pour pièces/chambres
- Grille 2 colonnes pour min/max
- Scroll fluide

**Tablette/Desktop :**
- Modal centré avec max-width
- Même comportement que mobile

---

## 🎉 Résultat Final

Votre filtre avancé est maintenant :
- ✅ **Identique au design Le Bon Coin**
- ✅ **Modal plein écran** qui glisse
- ✅ **Animations fluides**
- ✅ **Tous les filtres** (type, prix, pièces, surface)
- ✅ **Compteur** de filtres actifs
- ✅ **Boutons Effacer/Rechercher**

---

## 🌐 Testez Maintenant !

### Rechargez : **http://localhost:5173**

1. Cliquez sur l'**icône ⚙️** (filtres)
2. Le modal s'ouvre !
3. Testez tous les filtres
4. Cliquez sur "Rechercher"

---

**Le filtre avancé est prêt ! Exactement comme sur les images ! 🎨✨**
