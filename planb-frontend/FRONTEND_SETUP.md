# 🚀 Plan B Frontend - Guide Complet

## ✅ Ce qui a été créé

### 📦 Configuration
- [x] Tailwind CSS avec couleurs Plan B (orange #FF6B35)
- [x] Animations personnalisées (fade-in, slide-up, bounce)
- [x] Effet glassmorphism dans index.css
- [x] Configuration Vite avec React

### 🎨 Constantes & Configuration
- [x] `src/constants/categories.js` - Catégories avec sous-catégories :
  - **IMMOBILIER** : Appartement, Villa, Studio
  - **VÉHICULE** : Voiture, Moto
  - **VACANCE** : Appartement meublé, Villa meublée, Studio meublé, Hôtel
- [x] Pays supportés (CI, BJ, SN, ML)
- [x] Filtres de prix en FCFA
- [x] États des biens et types de véhicules

### 🔐 Store & API
- [x] `src/store/authStore.js` - Zustand pour l'authentification
- [x] `src/api/axios.js` - Configuration Axios avec intercepteurs
- [x] `src/api/auth.js` - API d'authentification
- [x] `src/api/listings.js` - API des annonces

### 🛠️ Utilitaires
- [x] `src/utils/format.js` - Formatage (prix, dates, téléphone)
- [x] `src/utils/whatsapp.js` - Intégration WhatsApp

### 🎭 Composants
- [x] `src/components/animations/CarAnimation.jsx` - Animation voiture avec homme & femme
  - Loading normal : voiture avance et part
  - Mauvaise connexion : voiture roule sur place
- [x] `src/components/common/GlassCard.jsx` - Carte avec effet glassmorphism
- [x] `src/components/common/Button.jsx` - Bouton réutilisable

## 📋 Ce qu'il reste à créer

### 🎯 Composants Essentiels à Créer
```
src/components/
├── common/
│   ├── Input.jsx
│   ├── Select.jsx
│   ├── Badge.jsx
│   ├── Avatar.jsx
│   └── Skeleton.jsx
├── layout/
│   ├── Header.jsx
│   ├── BottomNav.jsx (3 onglets : Accueil, Publier, Profil)
│   └── MobileContainer.jsx
├── listing/
│   ├── ListingCard.jsx (avec effet glassmorphism)
│   ├── ListingGrid.jsx
│   ├── FilterBar.jsx (filtres poussés)
│   ├── CategoryTabs.jsx (Immobilier, Véhicule, Vacance)
│   └── SubcategoryMenu.jsx (menu déroulant)
└── auth/
    ├── LoginForm.jsx
    └── RegisterForm.jsx
```

### 📄 Pages à Créer
```
src/pages/
├── Home.jsx (liste d'annonces avec filtres)
├── ListingDetail.jsx (détail avec galerie)
├── Publish.jsx (formulaire multi-step)
├── Profile.jsx (compte utilisateur)
├── Auth.jsx (login/register)
└── UpgradePro.jsx (paiement Wave)
```

### 🎨 Fonctionnalités Clés à Implémenter

#### 1. Page Accueil (Home)
- ✅ Barre de recherche avec suggestions
- ✅ Filtres horizontaux (chips)
- ✅ 3 Catégories (tabs) : Immobilier, Véhicule, Vacance
- ✅ **Menu déroulant des sous-catégories**
- ✅ Grille 2 colonnes d'annonces
- ✅ Cartes transparentes (glassmorphism)
- ✅ Infinite scroll
- ✅ Animation iOS entre onglets

#### 2. Filtres Poussés
```javascript
Filtres disponibles :
- Prix (min/max en FCFA)
- Localisation (pays + ville)
- Type (Vente/Location)
- État du bien (Neuf, Bon, À rénover)
- Nombre de pièces (pour immobilier)
- Année (pour véhicules)
- Carburant (pour véhicules)
```

#### 3. Carte d'Annonce (glassmorphism)
- Image avec overlay transparent
- Badge PRO vérifié
- Badge "EN VEDETTE"
- Prix en gros sur l'image
- Localisation avec drapeau
- Date relative
- Nombre de vues

#### 4. Navigation (3 onglets)
- 🏠 Accueil
- ➕ Publier
- 👤 Profil

Animation iOS style :
- Transition fluide (0.3s)
- Effet de zoom + flou
- Easing cubic-bezier(0.4, 0.0, 0.2, 1)

#### 5. Formulaire de Publication (Multi-step)
**Step 1** : Choisir catégorie
**Step 2** : Sous-catégorie + Type (Vente/Location)
**Step 3** : Photos (3 pour FREE, 10 pour PRO)
**Step 4** : Informations (titre, description, prix, localisation)
**Step 5** : Caractéristiques spécifiques
**Step 6** : Contact (WhatsApp)
**Step 7** : Récapitulatif + Publication

#### 6. Intégration WhatsApp
```javascript
// Bouton contact dans détail d'annonce
<button onClick={() => openWhatsApp(phone, message)}>
  Contacter via WhatsApp
</button>
```

#### 7. Logo Plan B
- Utiliser : `/PlanB_Logo/planb.png`
- Afficher dans le header
- Animation au chargement

#### 8. Animations
- ✅ **CarAnimation** : Homme & femme dans voiture
- ✅ Loading normal : voiture avance et part
- ✅ Mauvaise connexion : voiture roule sur place
- Transitions entre pages (iOS style)
- Skeleton loading

## 🎨 Design Glassmorphism

Appliquer sur **tous les composants** :

```jsx
<div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/20">
  {/* Contenu */}
</div>
```

Ou utiliser le composant `<GlassCard>` :
```jsx
<GlassCard hover padding="p-6">
  {/* Contenu */}
</GlassCard>
```

## 📱 Responsive Mobile-First

Toutes les pages doivent être optimisées pour mobile :
- Grid 2 colonnes sur mobile
- Touch-friendly (min 44px de hauteur)
- Safe area pour les notches
- Animations fluides 60fps

## 🚀 Commandes de Développement

### Installation des dépendances (en cours)
```bash
npm install react-router-dom zustand axios framer-motion lucide-react react-hot-toast react-hook-form @hookform/resolvers zod react-lazy-load-image-component browser-image-compression lottie-react
```

### Lancer le projet
```bash
npm run dev
```

### Build production
```bash
npm run build
```

## 🎯 Prochaines Étapes

1. ✅ **Attendre la fin de l'installation des dépendances**
2. Créer les composants communs (Input, Select, Badge, etc.)
3. Créer le BottomNav (3 onglets)
4. Créer la page Home avec filtres
5. Créer ListingCard avec glassmorphism
6. Créer le menu déroulant des sous-catégories
7. Implémenter les filtres poussés
8. Créer la page de détail d'annonce
9. Créer le formulaire de publication
10. Créer la page profil avec upgrade PRO
11. Intégrer Wave pour les paiements
12. Tester l'animation de la voiture
13. Copier le logo dans `public/`

## 📝 Variables d'Environnement

Créer `.env` :
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## 🎨 Palette de Couleurs

| Couleur | Code | Usage |
|---------|------|-------|
| Orange principal | #FF6B35 | Boutons, liens, accents |
| Gris foncé | #2C3E50 | Texte |
| Vert WhatsApp | #25D366 | Bouton contact |
| Blanc transparent | rgba(255,255,255,0.7) | Cartes glassmorphism |

## ✨ Effet Glassmorphism

Classes CSS disponibles :
- `.glass` - Fond blanc transparent avec flou
- `.glass-dark` - Fond sombre transparent avec flou

## 📦 Structure Finale

```
planb-frontend/
├── public/
│   ├── planb-logo.png (à copier)
│   └── favicon.ico
├── src/
│   ├── api/
│   │   ├── axios.js ✅
│   │   ├── auth.js ✅
│   │   └── listings.js ✅
│   ├── components/
│   │   ├── animations/
│   │   │   └── CarAnimation.jsx ✅
│   │   ├── common/
│   │   │   ├── GlassCard.jsx ✅
│   │   │   └── Button.jsx ✅
│   │   ├── layout/
│   │   └── listing/
│   ├── constants/
│   │   └── categories.js ✅
│   ├── pages/
│   ├── store/
│   │   └── authStore.js ✅
│   ├── utils/
│   │   ├── format.js ✅
│   │   └── whatsapp.js ✅
│   ├── App.jsx (à mettre à jour)
│   ├── main.jsx
│   └── index.css ✅
├── .env
├── tailwind.config.js ✅
└── package.json ✅
```

## 🎬 Animation de la Voiture

L'animation `CarAnimation` a deux modes :

### Mode Normal (Loading)
```jsx
<CarAnimation isLoading={true} hasBadConnection={false} />
```
- Voiture entre de la gauche
- Avance et sort à droite
- Disparaît après 3 secondes

### Mode Mauvaise Connexion
```jsx
<CarAnimation isLoading={true} hasBadConnection={true} />
```
- Voiture roule sur place
- Message "Connexion instable..."
- Reste visible jusqu'à rétablissement

## 💡 Conseils de Développement

1. **Mobile First** : Commencez par la version mobile
2. **Glassmorphism** : Utilisez `<GlassCard>` partout
3. **Animations** : Utilisez Framer Motion pour les transitions
4. **WhatsApp** : Intégrez dès le début
5. **Tests** : Testez sur vrais mobiles iOS et Android

## 🔗 Intégration Backend

L'API backend est déjà configurée dans `src/api/axios.js` avec :
- Intercepteurs pour JWT
- Gestion automatique des erreurs
- Toasts pour les notifications

Base URL : `http://localhost:8000/api/v1`

Endpoints disponibles :
- `POST /auth/register`
- `POST /auth/login`
- `GET /listings`
- `POST /listings` (create)
- `GET /users/me`
- etc.

---

**Prêt à continuer le développement !** 🚀
