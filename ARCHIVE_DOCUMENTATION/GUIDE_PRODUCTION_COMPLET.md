# 🚀 GUIDE COMPLET - PASSAGE EN PRODUCTION

## 📋 VOTRE SITUATION ACTUELLE

**✅ Ce que vous avez :**
- Docker Desktop installé ✅
- 3 containers qui tournent :
  - `planb-backend` - API Symfony
  - `planb_admin` - Adminer (interface base de données)
  - `planb_postgre` - PostgreSQL (base de données)

**❌ Ce qui ne fonctionne pas :**
- Le frontend n'est pas connecté au backend
- Vous utilisez encore localStorage (données temporaires)
- L'authentification n'utilise pas la vraie base de données

---

## 🎯 OBJECTIF

**Passer du mode DEMO au mode PRODUCTION :**
- ✅ Frontend connecté au backend
- ✅ Authentification avec PostgreSQL
- ✅ Données persistantes en base de données
- ✅ Produit final fonctionnel

---

## 📊 ÉTAPE 1 : VÉRIFIER QUE DOCKER FONCTIONNE

### **1.1 Vérifier les containers**

**Ouvrez PowerShell et tapez :**
```powershell
docker ps
```

**Vous devez voir 3 containers en état "Up" :**
```
CONTAINER ID   IMAGE              STATUS         PORTS                    NAMES
xxxxx          planb-backend      Up x hours     0.0.0.0:8000->80         planb-backend
xxxxx          adminer:latest     Up x hours     0.0.0.0:8080->8080       planb_admin
xxxxx          postgres:14        Up x hours     0.0.0.0:5432->5432       planb_postgre
```

**Si vous ne voyez pas ces 3 containers :**
```powershell
cd c:\Users\Elohim Mickael\Documents\plan-b\planb-backend
docker-compose up -d
```

---

### **1.2 Tester le backend**

**Ouvrez votre navigateur et allez sur :**
```
http://localhost:8000
```

**Vous devriez voir :**
- Une page Symfony ou
- Un message JSON ou
- Une erreur 404 (c'est normal, l'API n'a pas de route racine)

**Pour tester l'API :**
```
http://localhost:8000/api/v1/
```

---

### **1.3 Accéder à la base de données avec Adminer**

**C'EST ICI QUE VOUS POUVEZ VOIR VOS UTILISATEURS !**

**1. Ouvrez votre navigateur :**
```
http://localhost:8080
```

**2. Connectez-vous avec :**
```
Système : PostgreSQL
Serveur : planb_postgre
Utilisateur : planb_user
Mot de passe : planb_password
Base de données : planb_db
```

**3. Une fois connecté, cliquez sur :**
- `planb_db` (à gauche)
- `public` → `Tables`
- `user` (pour voir les utilisateurs)

**Vous verrez tous les comptes créés dans un tableau !**

---

## 📡 ÉTAPE 2 : CONFIGURER LE FRONTEND POUR LE BACKEND

### **2.1 Vérifier le fichier .env**

**Fichier : `planb-frontend/.env`**

```env
# MODE PRODUCTION
VITE_APP_MODE=production
VITE_API_URL=http://localhost:8000/api/v1
```

**Vérifiez que ces 2 lignes sont bien là !**

---

### **2.2 Utiliser les fichiers "clean"**

**Dans le dossier `planb-frontend/src/utils/`, vous avez :**
- `auth.js` (mode démo avec localStorage)
- `auth.clean.js` (mode production avec backend)

**Il faut remplacer les fichiers :**

```powershell
cd c:\Users\Elohim Mickael\Documents\plan-b\planb-frontend\src\utils

# Sauvegarder les anciens
Copy-Item auth.js auth.js.backup
Copy-Item listings.js listings.js.backup
Copy-Item subscription.js subscription.js.backup

# Utiliser les versions production
Copy-Item auth.clean.js auth.js -Force
Copy-Item listings.clean.js listings.js -Force
Copy-Item subscription.clean.js subscription.js -Force
```

---

## 🔐 ÉTAPE 3 : TESTER L'AUTHENTIFICATION RÉELLE

### **3.1 Créer un compte via le frontend**

**1. Lancez le frontend :**
```powershell
cd c:\Users\Elohim Mickael\Documents\plan-b\planb-frontend
npm run dev
```

**2. Allez sur :**
```
http://localhost:5174/auth/register
```

**3. Inscrivez-vous :**
```
Nom complet : Test Production
Email : test@planb.com
Téléphone : 0707123456
Mot de passe : Test123!
```

**4. Cliquez sur "Créer mon compte"**

---

### **3.2 Vérifier dans la base de données**

**1. Ouvrez Adminer :**
```
http://localhost:8080
```

**2. Connectez-vous (voir étape 1.3)**

**3. Allez dans :**
```
planb_db → public → Tables → user
```

**4. Cliquez sur "Sélectionner les données"**

**Vous devriez voir votre compte "test@planb.com" dans la liste ! 🎉**

---

## 📂 ÉTAPE 4 : STRUCTURE DE LA BASE DE DONNÉES

### **Tables principales :**

```
user
- id
- email
- password (hashé)
- first_name
- last_name
- phone
- account_type (FREE/PRO)
- created_at
- updated_at

listing
- id
- user_id (lien avec user)
- title
- description
- price
- category
- city
- status (active/sold/expired)
- created_at
- views_count

subscription
- id
- user_id
- type (PRO_MONTHLY/PRO_QUARTERLY)
- start_date
- end_date
- status (active/expired)

payment
- id
- user_id
- amount
- type (SUBSCRIPTION/LISTING_EDIT)
- status (pending/completed/failed)
- created_at
```

---

## 🧪 ÉTAPE 5 : TESTS COMPLETS

### **Test 1 : Inscription**
```
1. Aller sur http://localhost:5174/auth/register
2. S'inscrire avec un nouvel email
3. ✅ Vérifier dans Adminer (table user)
```

### **Test 2 : Connexion**
```
1. Se déconnecter
2. Aller sur http://localhost:5174/auth/login
3. Se connecter avec l'email et mot de passe
4. ✅ Devrait être redirigé vers l'accueil
```

### **Test 3 : Créer une annonce**
```
1. Connecté, aller sur http://localhost:5174/publish
2. Créer une annonce
3. ✅ Vérifier dans Adminer (table listing)
```

### **Test 4 : Vérifier les données**
```
1. Ouvrir Adminer : http://localhost:8080
2. Voir la table user → Vos utilisateurs
3. Voir la table listing → Vos annonces
4. Voir la table payment → Vos paiements
```

---

## 🔧 COMMANDES UTILES

### **Docker**

```powershell
# Voir les containers actifs
docker ps

# Voir tous les containers (même arrêtés)
docker ps -a

# Démarrer les containers
cd c:\Users\Elohim Mickael\Documents\plan-b\planb-backend
docker-compose up -d

# Arrêter les containers
docker-compose down

# Voir les logs du backend
docker logs planb-backend

# Voir les logs de PostgreSQL
docker logs planb_postgre

# Redémarrer un container
docker restart planb-backend
```

---

### **Backend**

```powershell
# Entrer dans le container backend
docker exec -it planb-backend bash

# Une fois dans le container :
php bin/console doctrine:migrations:migrate  # Migrer la base de données
php bin/console doctrine:schema:update --force  # Mettre à jour le schéma
php bin/console cache:clear  # Vider le cache
exit  # Sortir du container
```

---

### **Frontend**

```powershell
# Lancer le serveur de développement
cd c:\Users\Elohim Mickael\Documents\plan-b\planb-frontend
npm run dev

# Construire pour la production
npm run build

# Vider le cache du navigateur
# Dans la console (F12)
localStorage.clear();
location.reload();
```

---

## 📊 ACCÉDER À VOS DONNÉES

### **Méthode 1 : Adminer (Interface Web)**

```
URL : http://localhost:8080

Connexion :
- Système : PostgreSQL
- Serveur : planb_postgre
- Utilisateur : planb_user
- Mot de passe : planb_password
- Base de données : planb_db

Actions possibles :
- ✅ Voir tous les utilisateurs
- ✅ Voir toutes les annonces
- ✅ Modifier des données
- ✅ Exécuter des requêtes SQL
```

---

### **Méthode 2 : Ligne de commande PostgreSQL**

```powershell
# Se connecter à PostgreSQL
docker exec -it planb_postgre psql -U planb_user -d planb_db

# Une fois connecté :
\dt                          # Lister les tables
SELECT * FROM "user";        # Voir tous les utilisateurs
SELECT * FROM listing;       # Voir toutes les annonces
SELECT COUNT(*) FROM "user"; # Compter les utilisateurs
\q                           # Quitter
```

---

## 🎯 RÉSUMÉ DES URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5174 | Votre site web |
| **Backend API** | http://localhost:8000 | API Symfony |
| **Adminer** | http://localhost:8080 | Interface base de données |
| **PostgreSQL** | localhost:5432 | Base de données (accès direct) |

---

## ✅ CHECKLIST FINALE

### **Avant de dire "Ça marche !" :**

- [ ] Docker containers actifs (`docker ps`)
- [ ] Backend accessible (http://localhost:8000)
- [ ] Adminer accessible (http://localhost:8080)
- [ ] Frontend lancé (`npm run dev`)
- [ ] `.env` configuré en mode production
- [ ] Fichiers `*.clean.js` copiés vers `*.js`
- [ ] Test inscription → Compte visible dans Adminer
- [ ] Test connexion → Redirection fonctionne
- [ ] Test création annonce → Annonce visible dans Adminer

---

## 🆘 DÉPANNAGE

### **Problème : Backend ne démarre pas**

```powershell
# Voir les logs
docker logs planb-backend

# Redémarrer
docker restart planb-backend
```

---

### **Problème : "Connection refused" dans le frontend**

**Vérifier que le backend tourne :**
```powershell
curl http://localhost:8000
```

**Vérifier le `.env` :**
```
VITE_API_URL=http://localhost:8000/api/v1
```

---

### **Problème : Ne vois pas mes utilisateurs dans Adminer**

**1. Vérifier la connexion Adminer :**
- Serveur : `planb_postgre` (PAS `localhost`)
- Utilisateur : `planb_user`
- Mot de passe : `planb_password`

**2. Vérifier que la table existe :**
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'user';
```

---

## 🎉 VOUS AVEZ RÉUSSI SI...

- ✅ Vous pouvez créer un compte sur http://localhost:5174/auth/register
- ✅ Vous voyez le compte dans Adminer (http://localhost:8080)
- ✅ Vous pouvez vous connecter
- ✅ Vous pouvez créer une annonce
- ✅ L'annonce apparaît dans Adminer

---

**🚀 C'EST PARTI ! SUIVEZ LES ÉTAPES DANS L'ORDRE !**

*Guide créé le 9 novembre 2025 - 15:55*
