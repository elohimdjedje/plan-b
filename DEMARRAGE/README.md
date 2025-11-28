# 🚀 DOSSIER DE DÉMARRAGE - PLAN B

Ce dossier contient tous les scripts nécessaires pour démarrer et gérer l'application Plan B.

## 📋 Scripts Disponibles

### ⭐ `DEMARRER.ps1` - SCRIPT PRINCIPAL
**Démarre tous les serveurs automatiquement**
- Arrête les serveurs existants
- Démarre PostgreSQL (Docker)
- Démarre le Backend Symfony (port 8000)
- Démarre le Frontend React (port 5173)

```powershell
.\DEMARRAGE\DEMARRER.ps1
```

### 🛑 `ARRETER.ps1`
**Arrête tous les serveurs**
- Arrête le Frontend
- Arrête le Backend
- Arrête PostgreSQL

```powershell
.\DEMARRAGE\ARRETER.ps1
```

### ✅ `VERIFIER.ps1`
**Vérifie l'état de tous les serveurs**
- PostgreSQL
- Backend API
- Frontend

```powershell
.\DEMARRAGE\VERIFIER.ps1
```

### 🔧 `4-INSTALLATION-COMPLETE.ps1`
**Installation complète de l'application (première utilisation uniquement)**
- Installe les dépendances Backend
- Génère les clés JWT
- Configure la base de données
- Installe les dépendances Frontend

```powershell
.\DEMARRAGE\4-INSTALLATION-COMPLETE.ps1
```

### 🧹 `NETTOYER-DOCKER.ps1`
**Nettoie les conteneurs Docker inutilisés**
- Supprime les conteneurs arrêtés
- Libère de l'espace disque

```powershell
.\DEMARRAGE\NETTOYER-DOCKER.ps1
```

### 🔍 `DIAGNOSTIC-COMPLET.ps1`
**Diagnostic complet du système**
- Vérifie tous les prérequis
- Détecte les problèmes
- Propose des solutions

```powershell
.\DEMARRAGE\DIAGNOSTIC-COMPLET.ps1
```

## 🎯 Démarrage Rapide

### Première Installation
```powershell
# 1. Installation complète
.\DEMARRAGE\4-INSTALLATION-COMPLETE.ps1

# 2. Démarrer tous les serveurs
.\DEMARRAGE\DEMARRER.ps1
```

### Utilisation Quotidienne
```powershell
# Démarrer
.\DEMARRAGE\DEMARRER.ps1

# Vérifier l'état
.\DEMARRAGE\VERIFIER.ps1

# Arrêter
.\DEMARRAGE\ARRETER.ps1
```

## 🌐 URLs d'Accès

| Service | URL | Description |
|---------|-----|-------------|
| **Application** | http://localhost:5173 | Interface utilisateur |
| **API Backend** | http://localhost:8000/api/v1 | API REST |
| **PostgreSQL** | localhost:5432 | Base de données |

## 📊 Configuration Base de Données

- **Database**: planb
- **User**: postgres
- **Password**: root
- **Host**: localhost
- **Port**: 5432

## ⚙️ Prérequis

- ✅ Docker (pour PostgreSQL)
- ✅ PHP 8.1+ avec Composer
- ✅ Node.js 18+ avec npm
- ✅ PowerShell

## 🔧 Dépannage

### Diagnostic Complet
```powershell
# Vérifier tous les composants
.\DEMARRAGE\DIAGNOSTIC-COMPLET.ps1
```

### Les serveurs ne démarrent pas
```powershell
# Vérifier l'état
.\DEMARRAGE\VERIFIER.ps1

# Arrêter et redémarrer
.\DEMARRAGE\ARRETER.ps1
.\DEMARRAGE\DEMARRER.ps1
```

### PostgreSQL ne démarre pas
```powershell
# Vérifier Docker
docker ps -a

# Redémarrer le conteneur
docker restart planb-postgres

# Voir le guide complet
Get-Content .\DEMARRAGE\GUIDE-DOCKER.md
```

### Erreurs de connexion à l'API
```powershell
# Vérifier que le backend est démarré
.\DEMARRAGE\VERIFIER.ps1

# Tester l'API
curl http://localhost:8000
```

### Nettoyer Docker
```powershell
# Supprimer les conteneurs inutilisés
.\DEMARRAGE\NETTOYER-DOCKER.ps1
```

## 📝 Notes Importantes

- 🔴 **Ne jamais supprimer** ce dossier DEMARRAGE
- 🔄 Les scripts arrêtent automatiquement les serveurs existants avant de redémarrer
- 📱 Trois fenêtres PowerShell s'ouvriront (Backend, Frontend, et le script principal)
- ⏱️ Attendez quelques secondes entre chaque démarrage pour que les serveurs s'initialisent

## 🎨 Fonctionnalités de l'Application

- 📝 Publication d'annonces immobilières
- 🔍 Recherche avancée
- 💬 Messagerie en temps réel
- ⭐ Favoris
- 👤 Gestion de profil
- 📱 Interface mobile responsive
- 🌍 70+ villes de Côte d'Ivoire

---

**🚀 Prêt à démarrer ? Lancez `.\DEMARRAGE\DEMARRER.ps1` !**
