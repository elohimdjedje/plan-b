# 🚀 Serveurs Actifs - Plan B

## État des Serveurs

### ✅ Base de Données PostgreSQL
- **Conteneur** : `planb_postgres`
- **Image** : postgres:15-alpine
- **Port** : 5432
- **Status** : ✅ ACTIF (démarré il y a 37 minutes)
- **Configuration** :
  - Database: `planb`
  - User: `postgres`
  - Password: `root`

**URL de connexion** :
```
postgresql://postgres:root@localhost:5432/planb
```

---

### ✅ Backend API (Symfony 7.0)
- **Conteneur** : `planb_api`
- **Port** : 8000
- **Status** : ✅ ACTIF (démarré il y a 37 minutes)
- **Environnement** : Docker

**URL accessible** :
```
http://localhost:8000
```

**Endpoints principaux** :
- `GET  /api/v1/listings` - Liste des annonces
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/register` - Inscription
- `GET  /api/doc` - Documentation API

---

### ✅ Adminer (Interface DB)
- **Conteneur** : `planb_adminer`
- **Port** : 8080
- **Status** : ✅ ACTIF (démarré il y a 37 minutes)

**URL accessible** :
```
http://localhost:8080
```

**Connexion** :
- Système : PostgreSQL
- Serveur : database
- Utilisateur : postgres
- Mot de passe : root
- Base : planb

---

### ✅ Frontend React (Vite)
- **Port** : 5173 (Vite dev server)
- **Status** : ✅ EN COURS DE DÉMARRAGE
- **Node modules** : ✅ Installés (267 packages, 0 vulnérabilités)

**URL accessible** :
```
http://localhost:5173
```

---

## 🔍 Tests Rapides

### 1. Vérifier l'API Backend
```bash
# Windows PowerShell
curl http://localhost:8000/api/v1/listings

# Ou dans un navigateur
http://localhost:8000/api/doc
```

### 2. Accéder au Frontend
Ouvrir dans le navigateur :
```
http://localhost:5173
```

### 3. Vérifier la base de données
Ouvrir Adminer :
```
http://localhost:8080
```

---

## 📊 Améliorations de Sécurité Appliquées

**Phase 1 - Sécurité Critique** : ✅ TERMINÉE 

- ✅ `.gitignore` protège maintenant le fichier `.env`
- ✅ Cost de hachage des mots de passe : **4 → 12** (256x plus sécurisé)
- ✅ Fichiers backup nettoyés (6 fichiers supprimés)
- ✅ Nouveaux secrets générés (APP_SECRET, JWT_PASSPHRASE)

---

## ⚠️ Notes Importantes

1. **Nouveaux secrets** : Les nouveaux APP_SECRET et JWT_PASSPHRASE ont été générés mais nécessitent une application manuelle dans `.env`
   - Exécuter : `cd planb-backend && .\generate-secrets.ps1`

2. **Hachage des mots de passe** : À partir de maintenant, tous les nouveaux mots de passe seront hachés avec cost=12 (plus sécurisé)

3. **Ports utilisés** :
   - 5432 : PostgreSQL
   - 8000 : Backend API
   - 8080 : Adminer
   - 5173 : Frontend Vite

---

## 🎯 Prochaines Étapes

**Phase 2 - Sécurité Importante** (En attente) :
- Rate Limiting sur login/register
- Restriction CORS pour production
- Security Headers
- Validation stricte upload d'images

**Tests recommandés** :
1. Créer un compte utilisateur
2. Se connecter
3. Publier une annonce
4. Tester l'upload d'images
5. Naviguer dans l'application

---

## 🛠️ Commandes Utiles

```powershell
# Arrêter tous les conteneurs Docker
docker-compose down

# Redémarrer les conteneurs
docker-compose up -d

# Voir les logs du backend
docker logs planb_api -f

# Vider le cache Symfony
cd planb-backend
php bin/console cache:clear

# Rebuild frontend
cd planb-frontend
npm run build
```

---

**Application prête pour les tests !** 🎉
