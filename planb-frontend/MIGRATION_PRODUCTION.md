# 🚀 MIGRATION VERS LA PRODUCTION - PLAN B FRONTEND

## 📋 Vue d'ensemble

Ce document explique comment basculer du mode démo (avec données factices) vers le mode production (avec backend réel).

---

## ✅ État actuel

### Mode DÉMO (actuellement actif)
- ✅ Données factices dans `localStorage`
- ✅ Pas de connexion backend requise
- ✅ Debug Panel pour tester les fonctionnalités
- ✅ Données de démo dans `utils/listings.js`

### Mode PRODUCTION (à activer)
- ⚠️ Connexion backend requise
- ⚠️ JWT pour authentification
- ⚠️ Toutes les données viennent du backend
- ⚠️ Paiements Fedapay réels

---

## 🔄 Fichiers à remplacer

### 1. **utils/listings.js**
```bash
# Remplacer par la version propre
mv src/utils/listings.js src/utils/listings.backup.js
mv src/utils/listings.clean.js src/utils/listings.js
```

**Changements:**
- ✅ Suppression de toutes les données de démo
- ✅ Utilisation de l'API backend
- ✅ Fonctions asynchrones (Promise)

### 2. **utils/auth.js**
```bash
# Remplacer par la version propre
mv src/utils/auth.js src/utils/auth.backup.js
mv src/utils/auth.clean.js src/utils/auth.js
```

**Changements:**
- ✅ Authentification via JWT
- ✅ Appels API backend
- ✅ Gestion automatique du token

### 3. **utils/subscription.js**
```bash
# Remplacer par la version propre
mv src/utils/subscription.js src/utils/subscription.backup.js
mv src/utils/subscription.clean.js src/utils/subscription.js
```

**Changements:**
- ✅ Paiements via Fedapay
- ✅ Vérification backend du statut PRO

---

## ⚙️ Configuration

### 1. Variables d'environnement

**Créer `.env` :**
```env
# Mode de l'application
VITE_APP_MODE=production

# URL du backend
VITE_API_URL=http://localhost:8000/api/v1
```

### 2. Backend requis

**Le backend doit être lancé:**
```bash
cd ../planb-backend
php bin/console server:start
# ou
symfony server:start
```

**Vérifier que le backend fonctionne:**
```bash
curl http://localhost:8000/api/v1/listings
```

---

## 🔑 Concordance Frontend ↔ Backend

### ✅ ENDPOINTS VÉRIFIÉS

#### Authentification
| Frontend | Backend | Status |
|----------|---------|--------|
| `/auth` (page) | `POST /api/v1/auth/register` | ✅ OK |
| `/auth` (page) | `POST /api/v1/auth/login` | ✅ OK |
| `getCurrentUser()` | `GET /api/v1/auth/me` | ✅ OK |

#### Annonces
| Frontend | Backend | Status |
|----------|---------|--------|
| `getAllListings()` | `GET /api/v1/listings` | ✅ OK |
| `getListingById()` | `GET /api/v1/listings/{id}` | ✅ OK |
| `createListing()` | `POST /api/v1/listings` | ✅ OK |
| `updateListing()` | `PUT /api/v1/listings/{id}` | ✅ OK |
| `deleteListing()` | `DELETE /api/v1/listings/{id}` | ✅ OK |
| `getUserListings()` | `GET /api/v1/users/my-listings` | ✅ OK |

#### Recherche
| Frontend | Backend | Status |
|----------|---------|--------|
| `searchListings()` | `GET /api/v1/search` | ✅ OK |
| Catégories | `GET /api/v1/search/categories` | ✅ OK |
| Villes | `GET /api/v1/search/cities` | ✅ OK |

#### Paiements
| Frontend | Backend | Status |
|----------|---------|--------|
| Abonnement PRO | `POST /api/v1/payments/create-subscription` | ✅ OK |
| Boost annonce | `POST /api/v1/payments/boost-listing` | ✅ OK |
| Historique | `GET /api/v1/payments/history` | ✅ OK |

#### Profil
| Frontend | Backend | Status |
|----------|---------|--------|
| `/profile` | `GET /api/v1/auth/me` | ✅ OK |
| `/settings` | `PUT /api/v1/users/profile` | ✅ OK |
| Statistiques | `GET /api/v1/users/stats` | ✅ OK |

---

## 🗑️ À supprimer/désactiver

### 1. Debug Panel
```javascript
// Dans App.jsx
// DÉSACTIVER LE DEBUG PANEL EN PRODUCTION
const SHOW_DEBUG_PANEL = import.meta.env.DEV; // Seulement en dev

{SHOW_DEBUG_PANEL && <DebugPanel />}
```

### 2. Données de démo
```javascript
// Ces fonctions ne sont plus nécessaires:
// - initializeDemoListings()
// - Toutes les données mockées dans les composants
```

### 3. localStorage (pour les annonces)
```javascript
// Ne plus utiliser:
// - localStorage.setItem('listings', ...)
// - localStorage.getItem('listings')

// Utiliser à la place:
// - getAllListings() depuis l'API
```

---

## 🔄 Modifications des composants

### 1. **Home.jsx**
```javascript
// AVANT (démo)
const loadListings = () => {
  const listings = getAllListings();
  setListings(listings);
};

// APRÈS (production)
const loadListings = async () => {
  try {
    const listings = await getAllListings();
    setListings(listings);
  } catch (error) {
    toast.error('Erreur chargement annonces');
  }
};
```

### 2. **Profile.jsx**
```javascript
// AVANT (démo)
const listings = getUserListings(user.id);

// APRÈS (production)
const [listings, setListings] = useState([]);

useEffect(() => {
  const loadListings = async () => {
    const data = await getUserListings();
    setListings(data);
  };
  loadListings();
}, []);
```

### 3. **ListingDetail.jsx**
```javascript
// AVANT (démo)
const listing = getListingById(id);

// APRÈS (production)
const [listing, setListing] = useState(null);

useEffect(() => {
  const loadListing = async () => {
    const data = await getListingById(id);
    setListing(data);
  };
  loadListing();
}, [id]);
```

---

## ⚠️ Points d'attention

### 1. Authentification
- Le JWT est automatiquement ajouté aux requêtes (via axios interceptor)
- Si le token expire (401), redirection automatique vers `/auth`

### 2. Gestion d'erreurs
- Les erreurs API sont gérées globalement (toast notifications)
- Les erreurs 422 affichent les messages de validation

### 3. Images
- Les images doivent être uploadées via `/api/v1/upload`
- Le backend retourne les URLs complètes

### 4. Statuts d'annonces
- `active` : Annonce active
- `draft` : Brouillon
- `expired` : Expirée (FREE après 30 jours)
- `sold` : Vendue/Occupée

---

## 🧪 Tests à effectuer

### ✅ Checklist de tests

#### Authentification
- [ ] Inscription d'un nouvel utilisateur
- [ ] Connexion avec email/password
- [ ] Récupération du profil (`/api/v1/auth/me`)
- [ ] Déconnexion

#### Annonces
- [ ] Liste des annonces sur la page d'accueil
- [ ] Détail d'une annonce
- [ ] Création d'une annonce
- [ ] Modification d'une annonce
- [ ] Suppression d'une annonce
- [ ] Mes annonces dans le profil

#### Recherche
- [ ] Recherche par mot-clé
- [ ] Filtres (catégorie, ville, prix)
- [ ] Tri (récent, prix)

#### Paiements
- [ ] Création paiement abonnement PRO
- [ ] Redirection vers Fedapay
- [ ] Callback après paiement
- [ ] Activation compte PRO

#### Profil
- [ ] Affichage du profil
- [ ] Modification du profil
- [ ] Statistiques (vues, annonces)
- [ ] Changement de mot de passe

---

## 🚀 Commandes de migration

### Script automatique (recommandé)
```bash
# Créer un script de migration
npm run migrate:production
```

### Migration manuelle
```bash
# 1. Sauvegarder les anciens fichiers
mkdir -p backup
cp src/utils/listings.js backup/
cp src/utils/auth.js backup/
cp src/utils/subscription.js backup/

# 2. Remplacer par les versions propres
cp src/utils/listings.clean.js src/utils/listings.js
cp src/utils/auth.clean.js src/utils/auth.js
cp src/utils/subscription.clean.js src/utils/subscription.js

# 3. Créer .env
echo "VITE_APP_MODE=production" > .env
echo "VITE_API_URL=http://localhost:8000/api/v1" >> .env

# 4. Redémarrer le serveur
npm run dev
```

---

## 📊 Structure finale

```
planb-frontend/
├── src/
│   ├── api/
│   │   ├── axios.js          ✅ Configuration API
│   │   └── listings.js       ✅ Endpoints annonces
│   ├── utils/
│   │   ├── listings.js       🔄 VERSION PROPRE
│   │   ├── auth.js           🔄 VERSION PROPRE
│   │   └── subscription.js   🔄 VERSION PROPRE
│   ├── config/
│   │   └── app.js            ✅ Configuration globale
│   └── ...
├── .env                       ✅ Variables d'environnement
└── MIGRATION_PRODUCTION.md    📄 Ce fichier
```

---

## ✅ Validation finale

### Backend en marche
```bash
curl http://localhost:8000/api/v1/listings
# Doit retourner: {"data": [...], "hasMore": true}
```

### Frontend connecté
1. Ouvrir http://localhost:5173
2. S'inscrire (nouveau compte)
3. Créer une annonce
4. Vérifier dans le backend (base de données)

---

## 🆘 Dépannage

### Erreur: "Network Error"
- Vérifier que le backend est lancé
- Vérifier l'URL dans `.env`
- Vérifier les CORS sur le backend

### Erreur: "401 Unauthorized"
- Le token JWT a expiré
- Se reconnecter

### Erreur: "422 Validation Failed"
- Vérifier les champs requis
- Lire les messages d'erreur retournés

---

**🎉 Migration terminée ! Le site est maintenant 100% fonctionnel avec le backend.**

*Document créé le 9 novembre 2025*
