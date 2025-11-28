# 🚀 Serveurs démarrés - Prêt pour les tests !

## ✅ Statut des serveurs

### Backend (Symfony)
- **URL** : http://localhost:8000
- **Status** : ✅ Running
- **Technologie** : PHP 8 + Symfony
- **Base de données** : PostgreSQL

### Frontend (React)
- **URL** : http://localhost:5173
- **Status** : ✅ Running (Vite v7.1.12)
- **Technologie** : React 19 + Vite + TailwindCSS

---

## 🧪 Tests rapides

### 1. Tester le backend directement

**Inscription :**
```powershell
$body = @{
    email = "nouveau@test.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

**Connexion :**
```powershell
$body = @{
    email = "nouveau@test.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### 2. Tester via le frontend

1. **Ouvrir dans le navigateur :** http://localhost:5173
2. **Créer un compte :**
   - Cliquer sur "S'inscrire" ou "Inscription"
   - Remplir : Email, Password, Prénom, Nom
   - Valider
3. **Se connecter :**
   - Utiliser les mêmes identifiants
4. **Accéder aux paramètres :**
   - Aller dans Profil/Paramètres
   - Ajouter bio, WhatsApp, pays, ville
   - Enregistrer

### 3. Script de test automatique

```powershell
cd "C:\Users\Elohim Mickael\Documents\plan-b"
.\test-auth.ps1
```

---

## 📊 Endpoints API disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/v1/auth/register` | POST | Inscription (email, password, firstName, lastName) |
| `/api/v1/auth/login` | POST | Connexion |
| `/api/v1/auth/me` | GET | Profil utilisateur |
| `/api/v1/auth/update-profile` | PUT | Mise à jour profil |
| `/api/v1/orders/create` | POST | Créer commande (Wave uniquement) |
| `/api/v1/orders/{id}/status` | GET | Statut commande |
| `/api/v1/orders/history` | GET | Historique commandes |

---

## 🔍 Vérifier que tout fonctionne

### Backend
```powershell
# Test simple
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/me" -Method Get
# Devrait retourner une erreur 401 (non authentifié) = OK
```

### Frontend
```
Ouvrir http://localhost:5173 dans le navigateur
Devrait afficher la page d'accueil Plan B
```

---

## 📱 Navigation Frontend

### Pages disponibles
- `/` - Page d'accueil
- `/register` ou `/inscription` - Inscription
- `/login` ou `/connexion` - Connexion
- `/dashboard` - Tableau de bord (authentifié)
- `/settings` ou `/parametres` - Paramètres (authentifié)
- `/publish` - Publier une annonce (authentifié)
- `/listings` ou `/annonces` - Liste des annonces
- `/profile/:id` - Profil utilisateur

---

## 🛠️ Commandes utiles

### Arrêter les serveurs

**Backend :**
```powershell
Stop-Process -Name php -Force
```

**Frontend :**
```powershell
# Appuyer sur Ctrl+C dans le terminal où Vite tourne
# OU
Stop-Process -Name node -Force
```

### Redémarrer les serveurs

**Backend :**
```powershell
cd planb-backend
php -S localhost:8000 -t public
```

**Frontend :**
```powershell
cd planb-frontend
npm run dev
```

### Voir les logs

**Backend :**
```powershell
Get-Content planb-backend\var\log\dev.log -Tail 50 -Wait
```

**Frontend :**
Les logs sont dans le terminal où Vite tourne

---

## 🎨 Interface Frontend

Le frontend utilise :
- **React 19** - Framework
- **Vite** - Build tool (très rapide)
- **TailwindCSS** - Styling
- **Lucide React** - Icônes
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Zustand** - State management
- **React Hook Form + Zod** - Formulaires

---

## 🔐 Authentification

### Flux simplifié
1. **Inscription** → Seulement 4 champs (email, password, firstName, lastName)
2. **Connexion** → Génère un JWT token
3. **Token stocké** → localStorage
4. **Requêtes authentifiées** → Header `Authorization: Bearer TOKEN`

### Champs optionnels
- Bio
- WhatsApp
- Pays
- Ville

---

## 💳 Paiements

### Wave
✅ **Actif**
- Créer commande → Génère lien de paiement
- Callback automatique
- Vérification statut

### Orange Money
⚠️ **Temporairement désactivé**
- Code commenté
- Message : "temporairement indisponible"
- Prêt à réactiver

---

## 🧪 Scénario de test complet

1. **Démarrer les serveurs** ✅ (déjà fait)

2. **Créer un compte via frontend**
   - Aller sur http://localhost:5173
   - Cliquer "S'inscrire"
   - Remplir le formulaire
   - Valider

3. **Se connecter**
   - Utiliser les mêmes identifiants
   - Vérifier la redirection vers dashboard

4. **Compléter le profil**
   - Aller dans Paramètres
   - Ajouter bio, WhatsApp
   - Enregistrer

5. **Publier une annonce** (si implémenté)
   - Cliquer "Publier"
   - Remplir le formulaire
   - Soumettre

6. **Tester un paiement Wave** (si clés API configurées)
   - Créer une commande
   - Suivre le lien Wave
   - Compléter le paiement

---

## 📞 Support

### En cas de problème

**Backend ne démarre pas :**
```bash
cd planb-backend
php bin/console cache:clear
composer install
php -S localhost:8000 -t public
```

**Frontend ne démarre pas :**
```bash
cd planb-frontend
npm install
npm run dev
```

**Base de données :**
```bash
cd planb-backend
php bin/console doctrine:schema:validate
```

---

## ✨ Fonctionnalités testables

### ✅ Fonctionnel
- Inscription simplifiée (4 champs)
- Connexion par email/password
- Profil utilisateur
- Mise à jour profil (bio, WhatsApp, pays, ville)
- Paiement Wave
- Historique des commandes

### 🚧 À tester selon implémentation frontend
- Publication d'annonces
- Recherche d'annonces
- Messagerie
- Favoris
- Système de boost

---

## 🎉 Tout est prêt !

**Backend** : http://localhost:8000 ✅  
**Frontend** : http://localhost:5173 ✅  

**Vous pouvez maintenant tester l'application complète !**

---

## 📖 Documentation

- `LIRE_EN_PREMIER.md` - Vue d'ensemble
- `RESUME_CHANGEMENTS_COMPLET.md` - Tous les changements
- `INTEGRATION_FRONTEND.md` - Guide React
- `TEST_INSCRIPTION.md` - Tests détaillés
