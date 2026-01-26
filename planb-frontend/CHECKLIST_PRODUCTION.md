# ✅ CHECKLIST COMPLÈTE - PASSAGE EN PRODUCTION

## 📋 Vue d'ensemble

Ce document contient la checklist complète pour passer le site en mode production à 100% fonctionnel.

---

## 🎯 OBJECTIF

Avoir un prototype **100% fonctionnel** avec:
- ✅ Aucune donnée factice
- ✅ Connexion backend complète
- ✅ Toutes les routes fonctionnelles
- ✅ Tous les boutons fonctionnels
- ✅ Toutes les redirections correctes
- ✅ Logique frontend ↔ backend alignée

---

## 📂 PHASE 1: PRÉPARATION

### ✅ 1.1 Backend

**Vérifier que le backend est prêt:**

```bash
cd C:\Users\Elohim Mickael\Documents\plan-b\planb-backend

# Vérifier la base de données
php bin/console doctrine:schema:validate

# Lancer le serveur
symfony server:start
# ou
php bin/console server:start
```

**Tester les endpoints:**
```bash
# Test simple
curl http://localhost:8000/api/v1/listings

# Doit retourner un JSON valide
```

**Status:** ⬜ À faire

---

### ✅ 1.2 Variables d'environnement

**Créer le fichier `.env`:**

```bash
cd C:\Users\Elohim Mickael\Documents\plan-b\planb-frontend

# Créer .env
echo VITE_APP_MODE=production > .env
echo VITE_API_URL=http://localhost:8000/api/v1 >> .env
```

**Contenu du `.env`:**
```env
VITE_APP_MODE=production
VITE_API_URL=http://localhost:8000/api/v1
```

**Status:** ⬜ À faire

---

### ✅ 1.3 Migration des fichiers

**Exécuter le script automatique:**
```bash
cd C:\Users\Elohim Mickael\Documents\plan-b\planb-frontend
migrate-to-production.bat
```

**OU manuellement:**
```bash
# Sauvegardes
mkdir backup
copy src\utils\listings.js backup\
copy src\utils\auth.js backup\
copy src\utils\subscription.js backup\

# Remplacements
copy /Y src\utils\listings.clean.js src\utils\listings.js
copy /Y src\utils\auth.clean.js src\utils\auth.js
copy /Y src\utils\subscription.clean.js src\utils\subscription.js
```

**Status:** ⬜ À faire

---

## 📝 PHASE 2: MODIFICATIONS DU CODE

### ✅ 2.1 Désactiver le Debug Panel

**Fichier:** `src/App.jsx`

```javascript
// AVANT
import DebugPanel from './components/debug/DebugPanel';

function App() {
  return (
    <Router>
      <DebugPanel /> {/* ❌ À désactiver */}
      ...
    </Router>
  );
}

// APRÈS
import DebugPanel from './components/debug/DebugPanel';

const SHOW_DEBUG_PANEL = import.meta.env.DEV; // ✅ Seulement en dev

function App() {
  return (
    <Router>
      {SHOW_DEBUG_PANEL && <DebugPanel />}
      ...
    </Router>
  );
}
```

**Status:** ⬜ À faire

---

### ✅ 2.2 Supprimer initializeDemoListings()

**Fichier:** `src/App.jsx`

```javascript
// AVANT
import { checkFavoritesChanges } from './utils/notifications';
import { getAllListings, initializeDemoListings } from './utils/listings';

useEffect(() => {
  initializeSubscription();
  initializeDemoListings(); // ❌ À supprimer
  const listings = getAllListings();
  checkFavoritesChanges(listings);
}, []);

// APRÈS
import { checkFavoritesChanges } from './utils/notifications';

useEffect(() => {
  initializeSubscription();
  // initializeDemoListings() supprimé ✅
  // checkFavoritesChanges sera appelé après chargement des vraies données
}, []);
```

**Status:** ⬜ À faire

---

### ✅ 2.3 Adapter Home.jsx

**Fichier:** `src/pages/Home.jsx`

```javascript
// AVANT
const loadListings = async () => {
  try {
    setLoading(true);
    initializeDemoListings(); // ❌
    let allListings = getAllListings(); // ❌ Synchrone
    allListings = allListings.filter(l => l.status === 'active');
    setListings(allListings);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setLoading(false);
  }
};

// APRÈS
const loadListings = async () => {
  try {
    setLoading(true);
    let allListings = await getAllListings(); // ✅ Asynchrone
    allListings = allListings.filter(l => l.status === 'active');
    setListings(allListings);
  } catch (error) {
    console.error('Erreur:', error);
    toast.error('Impossible de charger les annonces');
    setListings([]);
  } finally {
    setLoading(false);
  }
};
```

**Status:** ⬜ À faire

---

### ✅ 2.4 Adapter Profile.jsx

**Fichier:** `src/pages/Profile.jsx`

```javascript
// SUPPRIMER ces imports
import { 
  getUserListings, 
  getUserStats, 
  updateListing, 
  deleteListing,
  initializeDemoListings, // ❌ Supprimer
  getAllListings
} from '../utils/listings';

// APRÈS
import { 
  getUserListings, 
  updateListing, 
  deleteListing
} from '../utils/listings';
import api from '../api/axios'; // ✅ Pour getUserStats
```

**Adapter useEffect:**
```javascript
// AVANT
useEffect(() => {
  const userProfile = getUserProfile();
  setCurrentUserProfile(userProfile);
  
  initializeDemoListings(); // ❌
  
  if (userProfile.id) {
    const userListings = getUserListings(userProfile.id); // ❌ Synchrone
    if (userListings.length > 0) {
      setListings(userListings);
    }
  }
}, []);

// APRÈS
useEffect(() => {
  const loadProfile = async () => {
    const userProfile = await getUserProfile(); // ✅ Asynchrone
    setCurrentUserProfile(userProfile);
    
    if (userProfile?.id) {
      const userListings = await getUserListings(); // ✅ Asynchrone
      setListings(userListings);
    }
  };
  
  loadProfile();
}, []);
```

**Status:** ⬜ À faire

---

### ✅ 2.5 Adapter ListingDetail.jsx

**Fichier:** `src/pages/ListingDetail.jsx`

```javascript
// AVANT
const loadListing = async () => {
  try {
    setLoading(true);
    const localListing = getListingById(id); // ❌ localStorage
    if (localListing) {
      setListing(localListing);
    } else {
      const response = await listingsAPI.getListing(id);
      setListing(response.data);
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setLoading(false);
  }
};

// APRÈS
const loadListing = async () => {
  try {
    setLoading(true);
    const listing = await getListingById(id); // ✅ Backend uniquement
    setListing(listing);
  } catch (error) {
    console.error('Erreur:', error);
    toast.error('Annonce introuvable');
    setListing(null);
  } finally {
    setLoading(false);
  }
};
```

**Status:** ⬜ À faire

---

### ✅ 2.6 Adapter Auth.jsx

**Fichier:** `src/pages/Auth.jsx`

**Vérifier que `login()` sauvegarde le token:**

```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // ✅ login() sauvegarde automatiquement le token dans localStorage
    const token = await login(loginData.email, loginData.password);
    
    if (token) {
      toast.success('✅ Connexion réussie !');
      navigate('/'); // Redirection vers accueil
    }
  } catch (error) {
    toast.error('Email ou mot de passe incorrect');
  } finally {
    setLoading(false);
  }
};
```

**Status:** ⬜ À faire

---

## 🗑️ PHASE 3: NETTOYAGE

### ✅ 3.1 Supprimer les fichiers de démo

```bash
# Supprimer les backups des fichiers
del src\utils\listings.backup.js
del src\utils\auth.backup.js
del src\utils\subscription.backup.js
```

**Status:** ⬜ À faire

---

### ✅ 3.2 Supprimer les données localStorage

**Ouvrir la console du navigateur et exécuter:**
```javascript
// Nettoyer toutes les données de test
localStorage.clear();
```

**Status:** ⬜ À faire

---

## 🧪 PHASE 4: TESTS COMPLETS

### ✅ 4.1 Test Authentification

**Inscription:**
1. ⬜ Aller sur `/auth`
2. ⬜ Cliquer sur "S'inscrire"
3. ⬜ Remplir le formulaire :
   - Email: test@planb.ci
   - Password: Test123!
   - Téléphone: +2250707123456
   - Prénom: Test
   - Nom: User
   - Ville: Abidjan
4. ⬜ Cliquer "S'inscrire"
5. ⬜ Vérifier le toast "✅ Inscription réussie"
6. ⬜ Vérifier la redirection vers `/`

**Connexion:**
1. ⬜ Se déconnecter
2. ⬜ Aller sur `/auth`
3. ⬜ Cliquer sur "Se connecter"
4. ⬜ Entrer email et password
5. ⬜ Cliquer "Se connecter"
6. ⬜ Vérifier le toast "✅ Connexion réussie"
7. ⬜ Vérifier la redirection vers `/`

**Status:** ⬜ À tester

---

### ✅ 4.2 Test Annonces

**Page d'accueil:**
1. ⬜ Voir la liste des annonces
2. ⬜ Vérifier que les annonces s'affichent
3. ⬜ Cliquer sur une annonce
4. ⬜ Vérifier le détail complet

**Créer une annonce:**
1. ⬜ Cliquer sur "+" (bottom nav)
2. ⬜ Remplir le formulaire:
   - Titre: "Test Annonce"
   - Description: "Description test"
   - Prix: 100000
   - Catégorie: immobilier
   - Type: vente
   - Ville: Abidjan
3. ⬜ Cliquer "Publier"
4. ⬜ Vérifier le toast "✅ Annonce créée"
5. ⬜ Vérifier la redirection vers `/profile`

**Modifier une annonce:**
1. ⬜ Aller sur `/profile`
2. ⬜ Cliquer sur "..." (menu annonce)
3. ⬜ Cliquer "Modifier"
4. ⬜ Modifier le titre
5. ⬜ Cliquer "Sauvegarder"
6. ⬜ Vérifier le toast "✅ Annonce modifiée"

**Supprimer une annonce:**
1. ⬜ Cliquer sur "..." (menu annonce)
2. ⬜ Cliquer "Supprimer"
3. ⬜ Confirmer
4. ⬜ Vérifier le toast "✅ Annonce supprimée"
5. ⬜ Vérifier que l'annonce disparaît

**Status:** ⬜ À tester

---

### ✅ 4.3 Test Recherche

**Recherche simple:**
1. ⬜ Aller sur `/`
2. ⬜ Entrer "appartement" dans la barre de recherche
3. ⬜ Appuyer sur Entrée
4. ⬜ Vérifier les résultats

**Filtres:**
1. ⬜ Sélectionner catégorie "Immobilier"
2. ⬜ Sélectionner ville "Abidjan"
3. ⬜ Entrer prix min: 50000
4. ⬜ Entrer prix max: 200000
5. ⬜ Vérifier les résultats filtrés

**Status:** ⬜ À tester

---

### ✅ 4.4 Test Profil

**Affichage:**
1. ⬜ Aller sur `/profile`
2. ⬜ Vérifier les informations affichées:
   - Nom complet
   - Email
   - Téléphone
   - Badge FREE/PRO
   - Statistiques (vues, annonces)

**Modification:**
1. ⬜ Aller sur `/settings`
2. ⬜ Modifier le prénom
3. ⬜ Cliquer "Enregistrer"
4. ⬜ Vérifier le toast "✅ Profil mis à jour"
5. ⬜ Retourner sur `/profile`
6. ⬜ Vérifier que le nom a changé

**Status:** ⬜ À tester

---

### ✅ 4.5 Test Paiements

**Abonnement PRO:**
1. ⬜ Aller sur `/upgrade`
2. ⬜ Cliquer "Passer PRO"
3. ⬜ Sélectionner "1 mois"
4. ⬜ Cliquer "Payer 10 000 FCFA"
5. ⬜ Vérifier la redirection vers Fedapay
6. ⬜ (En dev) Simuler le paiement
7. ⬜ Vérifier le retour sur `/payment/success`
8. ⬜ Aller sur `/profile`
9. ⬜ Vérifier le badge "PRO"

**Status:** ⬜ À tester

---

### ✅ 4.6 Test Routes

**Vérifier toutes les routes:**
1. ⬜ `/` - Accueil
2. ⬜ `/auth` - Authentification
3. ⬜ `/listing/:id` - Détail annonce
4. ⬜ `/publish` - Créer annonce
5. ⬜ `/profile` - Profil
6. ⬜ `/settings` - Paramètres
7. ⬜ `/upgrade` - Passer PRO
8. ⬜ `/favorites` - Favoris
9. ⬜ `/notifications` - Notifications
10. ⬜ `/conversations` - Conversations WhatsApp
11. ⬜ `/my-subscription` - Mon abonnement
12. ⬜ `/edit-listing/:id` - Modifier annonce
13. ⬜ `/seller/:userId` - Profil vendeur

**Status:** ⬜ À tester

---

### ✅ 4.7 Test Boutons

**Bottom Navigation:**
1. ⬜ Bouton "Accueil" → `/`
2. ⬜ Bouton "Favoris" → `/favorites`
3. ⬜ Bouton "+" → `/publish`
4. ⬜ Bouton "Profil" → `/profile`

**Header:**
1. ⬜ Logo → `/`
2. ⬜ 💬 Conversations → `/conversations`
3. ⬜ 🔔 Notifications → `/notifications`

**Profile:**
1. ⬜ "Paramètres" → `/settings`
2. ⬜ "Mon abonnement" → `/my-subscription`
3. ⬜ "Passer PRO" → `/upgrade`
4. ⬜ "Se déconnecter" → `/auth`

**Status:** ⬜ À tester

---

### ✅ 4.8 Test Redirections

**Non authentifié:**
1. ⬜ Essayer d'accéder à `/publish`
2. ⬜ Doit rediriger vers `/auth`

**Erreur 404:**
1. ⬜ Aller sur `/page-inexistante`
2. ⬜ Doit afficher page 404

**Après connexion:**
1. ⬜ Se connecter sur `/auth`
2. ⬜ Doit rediriger vers `/`

**Après paiement:**
1. ⬜ Payer abonnement
2. ⬜ Doit rediriger vers `/payment/success`

**Status:** ⬜ À tester

---

## 📊 PHASE 5: VÉRIFICATION FINALE

### ✅ 5.1 Checklist complète

**Backend:**
- ⬜ Backend lancé et accessible
- ⬜ Base de données configurée
- ⬜ JWT fonctionnel
- ⬜ CORS activé

**Frontend:**
- ⬜ `.env` configuré
- ⬜ Mode production activé
- ⬜ Debug Panel désactivé
- ⬜ Pas de données factices
- ⬜ Tous les utilitaires utilisent l'API

**Fonctionnalités:**
- ⬜ Inscription ✅
- ⬜ Connexion ✅
- ⬜ Profil ✅
- ⬜ Créer annonce ✅
- ⬜ Modifier annonce ✅
- ⬜ Supprimer annonce ✅
- ⬜ Recherche ✅
- ⬜ Filtres ✅
- ⬜ Favoris ✅
- ⬜ Notifications ✅
- ⬜ Conversations ✅
- ⬜ Paiements ✅
- ⬜ Abonnement PRO ✅

**UI/UX:**
- ⬜ Toutes les routes accessibles ✅
- ⬜ Tous les boutons fonctionnels ✅
- ⬜ Toutes les redirections correctes ✅
- ⬜ Toasts affichés correctement ✅
- ⬜ Animations fluides ✅
- ⬜ Design responsive ✅

---

## 🎉 RÉSULTAT FINAL

### ✅ Site fonctionnel à 100% !

**Critères de validation:**
- ✅ Aucune donnée factice
- ✅ Backend connecté
- ✅ Toutes les features fonctionnent
- ✅ Prêt pour la démonstration
- ✅ Prêt pour le déploiement

---

## 📝 NOTES IMPORTANTES

### Commandes utiles

**Démarrer le backend:**
```bash
cd C:\Users\Elohim Mickael\Documents\plan-b\planb-backend
symfony server:start
```

**Démarrer le frontend:**
```bash
cd C:\Users\Elohim Mickael\Documents\plan-b\planb-frontend
npm run dev
```

**Tester un endpoint:**
```bash
curl http://localhost:8000/api/v1/listings
```

**Nettoyer localStorage:**
```javascript
localStorage.clear();
```

---

## 🆘 En cas de problème

### Backend ne répond pas
```bash
# Vérifier le serveur
symfony server:status

# Relancer
symfony server:stop
symfony server:start
```

### Erreur CORS
```php
// Dans backend config/packages/nelmio_cors.yaml
nelmio_cors:
    defaults:
        origin_regex: true
        allow_origin: ['*']
        allow_methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        allow_headers: ['*']
```

### Token expiré
```javascript
// Supprimer le token
localStorage.removeItem('token');
// Se reconnecter
```

---

**✅ Checklist complète ! Suivez les étapes une par une pour un site 100% fonctionnel !**

*Document créé le 9 novembre 2025*
