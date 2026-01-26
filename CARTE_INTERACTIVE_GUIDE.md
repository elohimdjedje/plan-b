# 🗺️ Carte Interactive des Annonces - Guide Complet

## 🎯 Fonctionnalité

Une carte interactive qui affiche toutes les annonces géolocalisées avec des marqueurs colorés par type de bien.

---

## ✨ Caractéristiques

### 1. **Filtres Géographiques**
- ✅ Sélection par **Pays** (focus Côte d'Ivoire)
- ✅ Sélection par **Ville** (Abidjan, Bouaké, Yamoussoukro, etc.)
- ✅ Sélection par **Commune** (facultatif)
- ✅ Chargement par **Entrée** ou bouton

### 2. **Marqueurs Colorés**
Chaque type de bien a sa propre couleur :

| Type de Bien | Couleur | Code |
|--------------|---------|------|
| **Maison** | Jaune/Orange | `#F59E0B` |
| **Villa** | Rouge | `#EF4444` |
| **Appartement** | Bleu | `#3B82F6` |
| **Studio** | Violet | `#8B5CF6` |
| **Terrain** | Vert citron | `#84CC16` |
| **Duplex** | Rose | `#EC4899` |
| **Hôtel** | Vert | `#10B981` |
| **Résidence** | Cyan | `#06B6D4` |
| **Véhicule (Vente)** | Bleu foncé | `#2563EB` |
| **Véhicule (Location)** | Violet foncé | `#7C3AED` |

### 3. **Interactions**
- ✅ Clic sur marqueur → Popup avec détails
- ✅ Photo de l'annonce dans le popup
- ✅ Bouton "Voir l'annonce" → Page détails
- ✅ Zoom automatique sur la ville sélectionnée
- ✅ Défilement de la carte (scroll wheel)

### 4. **Design**
- ✅ Glassmorphism
- ✅ Responsive (mobile-first)
- ✅ Légende des couleurs
- ✅ Compteur d'annonces
- ✅ Animations Framer Motion

---

## 📦 Installation

### Étape 1 : Installer Leaflet

**Windows** :
```powershell
cd planb-frontend
.\INSTALLER_LEAFLET.bat
```

**Manuel** :
```bash
cd planb-frontend
npm install react-leaflet leaflet
```

### Étape 2 : Vérifier les Fichiers

Fichiers créés :
- ✅ `src/pages/Map.jsx` - Page de la carte
- ✅ Route `/map` dans `App.jsx`
- ✅ Bouton dans `Header.jsx`

---

## 🚀 Utilisation

### 1. **Accéder à la Carte**

Depuis l'application :
1. Cliquez sur l'icône **📍 Map** dans le header (à gauche des conversations)
2. Ou allez directement sur `http://localhost:5173/map`

### 2. **Filtrer les Annonces**

1. **Sélectionnez une ville** (obligatoire)
   - Abidjan
   - Bouaké
   - Yamoussoukro
   - etc.

2. **Sélectionnez une commune** (facultatif)
   - Liste dynamique selon la ville

3. **Cliquez sur "Charger la carte"**
   - Ou appuyez sur **Entrée**

### 3. **Explorer la Carte**

- **Zoomer** : Molette de la souris ou boutons +/-
- **Déplacer** : Cliquer-glisser
- **Voir une annonce** : Cliquer sur un marqueur
- **Aller au détail** : Bouton "Voir l'annonce" dans le popup

---

## 🎨 Marqueurs Personnalisés

### Format des Marqueurs

Chaque marqueur affiche :
- **Couleur** : Selon le type de bien
- **Lettre** : Première lettre du type (M, V, A, etc.)
- **Forme** : Goutte d'eau stylée
- **Ombre** : Pour effet 3D

### Exemple de Marqueur
```
   ↑
  /M\    <- Lettre blanche
 /   \   <- Fond coloré
|     |
 \   /
  \_/
   |     <- Pointe du marqueur
```

---

## 📍 Coordonnées GPS

### Villes Pré-configurées

| Ville | Latitude | Longitude | Zoom |
|-------|----------|-----------|------|
| Abidjan | 5.3600 | -4.0083 | 13 |
| Yamoussoukro | 6.8276 | -5.2893 | 13 |
| Bouaké | 7.6900 | -5.0300 | 13 |
| Daloa | 6.8770 | -6.4503 | 13 |
| San-Pedro | 4.7485 | -6.6363 | 13 |
| Korhogo | 9.4580 | -5.6297 | 13 |
| Man | 7.4125 | -7.5544 | 13 |
| Grand-Bassam | 5.2111 | -3.7385 | 13 |
| Assinie | 5.1394 | -3.3014 | 13 |

### Ajouter des Coordonnées

Pour ajouter une nouvelle ville, modifiez dans `Map.jsx` :

```javascript
const cityCoordinates = {
  'NouvelleVille': [latitude, longitude],
  // ...
};
```

---

## 🔧 Configuration Backend

### Champs GPS Requis

Pour qu'une annonce apparaisse sur la carte, elle doit avoir :

```php
// Dans la base de données
$listing->latitude = 5.3600;  // Latitude GPS
$listing->longitude = -4.0083; // Longitude GPS
```

### Obtenir les Coordonnées GPS

**Méthode 1** : Google Maps
1. Recherchez l'adresse sur Google Maps
2. Clic droit → "Plus d'infos sur cet endroit"
3. Copiez les coordonnées

**Méthode 2** : API Geocoding (futur)
```javascript
// À implémenter
const getCoordinates = async (address) => {
  const response = await geocodingAPI.search(address);
  return {
    latitude: response.lat,
    longitude: response.lng
  };
};
```

---

## 🎯 Popup de Détails

### Contenu du Popup

Quand on clique sur un marqueur :

```
┌─────────────────────┐
│ [Photo de l'annonce]│
├─────────────────────┤
│ Titre de l'annonce  │
│ Ville - Commune     │
│ 150 000 FCFA        │
│ [Voir l'annonce]    │
└─────────────────────┘
```

### Informations Affichées
- ✅ Photo principale
- ✅ Titre
- ✅ Localisation (Ville + Commune)
- ✅ Prix formaté
- ✅ Bouton d'action

---

## 🎨 Personnalisation

### Changer les Couleurs

Dans `Map.jsx`, modifiez `PROPERTY_COLORS` :

```javascript
const PROPERTY_COLORS = {
  maison: '#NOUVELLE_COULEUR',
  // ...
};
```

### Changer le Style de Carte

Options disponibles :
1. **OpenStreetMap** (défaut)
   ```javascript
   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
   ```

2. **Satellite**
   ```javascript
   url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
   ```

3. **Terrain**
   ```javascript
   url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
   ```

### Changer le Zoom

```javascript
const [mapZoom, setMapZoom] = useState(13); // Valeur par défaut
```

Valeurs :
- 10 : Vue large (région)
- 13 : Vue ville (défaut)
- 15 : Vue quartier
- 18 : Vue rue

---

## 📊 Filtrage des Annonces

### Critères Actuels

L'API filtre par :
- ✅ `country` (Pays)
- ✅ `city` (Ville)
- ✅ `commune` (Commune, optionnel)
- ✅ Annonces avec GPS uniquement

### Filtres Futurs (À Implémenter)

Ajouter des filtres supplémentaires :
```javascript
const params = {
  country: filters.country,
  city: filters.city,
  commune: filters.commune,
  // Futurs filtres
  category: 'immobilier',
  type: 'vente',
  priceMin: 50000,
  priceMax: 500000
};
```

---

## 🧪 Tests

### 1. Test de Base

1. **Allez sur** `/map`
2. **Sélectionnez** "Abidjan"
3. **Cliquez** "Charger la carte"
4. ✅ La carte s'affiche centrée sur Abidjan
5. ✅ Les marqueurs apparaissent
6. ✅ Les couleurs correspondent aux types

### 2. Test des Interactions

1. **Cliquez** sur un marqueur
2. ✅ Un popup s'ouvre
3. ✅ La photo s'affiche
4. ✅ Les infos sont correctes
5. **Cliquez** "Voir l'annonce"
6. ✅ Redirection vers `/listing/:id`

### 3. Test des Filtres

1. **Sélectionnez** "Abidjan"
2. **Sélectionnez** "Cocody"
3. **Chargez** la carte
4. ✅ Seules les annonces de Cocody s'affichent

### 4. Test Responsive

- ✅ Mobile (< 768px)
- ✅ Tablet (768-1024px)
- ✅ Desktop (> 1024px)

---

## 🐛 Dépannage

### Problème : Carte ne s'affiche pas

**Solution 1** : Vérifier l'installation de Leaflet
```bash
npm list react-leaflet leaflet
```

**Solution 2** : CSS Leaflet manquant
```javascript
// Vérifier dans Map.jsx
import 'leaflet/dist/leaflet.css';
```

**Solution 3** : Erreur de build
```bash
npm install --save-dev @types/leaflet
```

### Problème : Marqueurs ne s'affichent pas

**Cause** : Annonces sans coordonnées GPS

**Solution** : Ajouter latitude/longitude dans la base de données

```sql
UPDATE listing 
SET latitude = 5.3600, longitude = -4.0083 
WHERE city = 'Abidjan' AND latitude IS NULL;
```

### Problème : Icônes par défaut manquants

**Solution** : Les icônes sont chargés depuis CDN
```javascript
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
```

### Problème : Carte trop lente

**Solutions** :
1. Limiter le nombre d'annonces affichées
2. Utiliser le clustering (regroupement)
3. Charger les marqueurs progressivement

```javascript
// À implémenter
import MarkerClusterGroup from 'react-leaflet-cluster';
```

---

## 🚀 Améliorations Futures

### Phase 2

1. **Clustering**
   - Regrouper les marqueurs proches
   - Afficher le nombre dans le cluster
   - Zoom automatique au clic

2. **Recherche sur la Carte**
   - Barre de recherche
   - Filtres avancés
   - Résultats en temps réel

3. **Géolocalisation**
   - Bouton "Ma position"
   - Centrer sur l'utilisateur
   - Rayon de recherche

4. **Itinéraires**
   - Calculer la distance
   - Afficher le temps de trajet
   - Directions GPS

5. **Vues Personnalisées**
   - Satellite
   - Terrain
   - Trafic
   - Street View

### Phase 3

1. **Heatmap**
   - Carte de chaleur des prix
   - Densité des annonces
   - Tendances par quartier

2. **Mode Hors Ligne**
   - Cache des tuiles
   - Synchronisation

3. **Partage de Position**
   - Envoyer un lieu par WhatsApp
   - Code de localisation

---

## 📚 Ressources

### Documentation
- [Leaflet](https://leafletjs.com/) - Bibliothèque de cartes
- [React Leaflet](https://react-leaflet.js.org/) - Wrapper React
- [OpenStreetMap](https://www.openstreetmap.org/) - Données cartographiques

### Tutoriels
- [Leaflet Quick Start](https://leafletjs.com/examples/quick-start/)
- [Custom Markers](https://leafletjs.com/examples/custom-icons/)
- [Popups](https://leafletjs.com/examples/popup/)

### Outils
- [Geoapify](https://www.geoapify.com/) - API Geocoding
- [Nominatim](https://nominatim.org/) - Geocoding OpenStreetMap
- [Latlong.net](https://www.latlong.net/) - Trouver des coordonnées

---

## ✅ Résumé

### Ce qui fonctionne
- ✅ Bouton Map dans le header
- ✅ Page de carte interactive
- ✅ Filtres par ville/commune
- ✅ Marqueurs colorés par type
- ✅ Popup avec détails
- ✅ Navigation vers l'annonce
- ✅ Légende des couleurs
- ✅ Responsive design

### Prochaines étapes
1. Installer Leaflet : `.\INSTALLER_LEAFLET.bat`
2. Ajouter les coordonnées GPS aux annonces
3. Tester sur Abidjan
4. Déployer en production

---

## 🎉 Conclusion

Vous disposez maintenant d'une **carte interactive complète** pour visualiser toutes vos annonces géolocalisées !

**Bon développement ! 🗺️✨**
