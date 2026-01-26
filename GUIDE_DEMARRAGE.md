# 🚀 Guide de Démarrage - Plan B

Ce guide explique comment démarrer et arrêter l'application Plan B.

## 📋 Prérequis

- **Docker Desktop** installé et configuré
- **Node.js** et **npm** installés (pour le frontend)
- **PowerShell** (disponible par défaut sur Windows)

## 🎯 Démarrage Rapide

### Démarrer l'application

```powershell
.\demarrer.ps1
```

Ce script va automatiquement :
1. ✅ Vérifier que Docker Desktop est installé
2. ✅ Démarrer Docker Desktop si nécessaire (attente de 30 secondes)
3. ✅ Lancer les conteneurs Docker (PostgreSQL, Backend, Adminer)
4. ✅ Vérifier que PostgreSQL accepte les connexions
5. ✅ Démarrer le frontend React dans une fenêtre séparée

### Arrêter l'application

```powershell
.\arreter.ps1
```

Ce script va :
1. ⏹️ Arrêter le frontend React
2. ⏹️ Arrêter tous les conteneurs Docker

## 🌐 URLs de l'Application

Une fois l'application démarrée, vous pouvez accéder aux services suivants :

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Interface utilisateur React |
| **Backend API** | http://localhost:8000 | API REST Symfony |
| **API v1** | http://localhost:8000/api/v1 | Endpoints API |
| **Adminer** | http://localhost:8080 | Interface de gestion PostgreSQL |

## 🗄️ Base de Données PostgreSQL

Les informations de connexion :

```
Host     : localhost
Port     : 5432
Database : planb
User     : postgres
Password : root
```

### Connexion via Adminer

1. Ouvrez http://localhost:8080
2. Remplissez les champs :
   - **Système** : PostgreSQL
   - **Serveur** : database (ou localhost)
   - **Utilisateur** : postgres
   - **Mot de passe** : root
   - **Base de données** : planb

## 🐳 Conteneurs Docker

L'application utilise 3 conteneurs Docker :

| Conteneur | Service | Port |
|-----------|---------|------|
| `planb_postgres` | PostgreSQL 15 | 5432 |
| `planb_api` | Backend Symfony | 8000 |
| `planb_adminer` | Adminer | 8080 |

### Commandes Docker Utiles

```powershell
# Voir l'état des conteneurs
docker ps

# Voir les logs d'un conteneur
docker logs planb_postgres
docker logs planb_api
docker logs planb_adminer

# Voir les logs en temps réel
docker logs -f planb_api

# Redémarrer un conteneur spécifique
docker restart planb_api

# Voir tous les conteneurs (actifs et arrêtés)
docker ps -a

# Voir les logs de tous les services
cd planb-backend
docker-compose logs

# Voir les logs en temps réel
docker-compose logs -f
```

## 🔧 Dépannage

### Docker Desktop ne démarre pas

Si Docker Desktop ne démarre pas automatiquement :

1. Lancez manuellement Docker Desktop depuis le menu Démarrer
2. Attendez que Docker soit complètement démarré (icône dans la barre des tâches)
3. Relancez `.\demarrer.ps1`

### Le port est déjà utilisé

Si un port est déjà utilisé (5173, 8000, 5432, 8080) :

```powershell
# Vérifier quel processus utilise le port
netstat -ano | findstr :5173

# Arrêter le processus (remplacez PID par l'ID du processus)
Stop-Process -Id PID -Force
```

Ou utilisez le script d'arrêt :
```powershell
.\arreter.ps1
```

### PostgreSQL ne démarre pas

```powershell
# Vérifier les logs PostgreSQL
docker logs planb_postgres

# Redémarrer le conteneur
docker restart planb_postgres

# Vérifier que PostgreSQL accepte les connexions
docker exec planb_postgres pg_isready -U postgres
```

### Backend ne répond pas

```powershell
# Vérifier les logs du backend
docker logs planb_api

# Redémarrer le backend
docker restart planb_api

# Vérifier que le backend répond
curl http://localhost:8000
```

### Frontend ne démarre pas

```powershell
# Vérifier que npm est installé
npm --version

# Vérifier que les dépendances sont installées
cd planb-frontend
npm install

# Démarrer manuellement le frontend
npm run dev
```

## 🔄 Redémarrer l'Application

Pour redémarrer complètement l'application :

```powershell
# Arrêter tous les services
.\arreter.ps1

# Attendre 5 secondes
Start-Sleep -Seconds 5

# Redémarrer tous les services
.\demarrer.ps1
```

## 📦 Structure du Projet

```
plan-b/
├── planb-backend/           # Backend Symfony + Docker
│   ├── docker-compose.yml   # Configuration Docker
│   ├── public/              # Point d'entrée PHP
│   └── src/                 # Code source Symfony
├── planb-frontend/          # Frontend React
│   ├── src/                 # Code source React
│   └── package.json         # Dépendances npm
├── demarrer.ps1            # Script de démarrage
├── arreter.ps1             # Script d'arrêt
└── GUIDE_DEMARRAGE.md      # Ce fichier
```

## 💡 Conseils

- **Toujours** utiliser `.\arreter.ps1` avant de fermer votre session
- Les **données PostgreSQL** sont persistées dans un volume Docker
- Le **frontend** tourne dans une fenêtre PowerShell séparée
- Vous pouvez fermer la fenêtre du frontend pour l'arrêter sans affecter Docker
- Utilisez **Adminer** pour explorer et gérer facilement la base de données

## 🆘 Besoin d'Aide ?

En cas de problème :

1. Vérifiez les logs des conteneurs Docker
2. Assurez-vous que Docker Desktop est bien démarré
3. Vérifiez qu'aucun autre service n'utilise les ports nécessaires
4. Redémarrez l'application avec `.\arreter.ps1` puis `.\demarrer.ps1`
