# 🐳 Guide Docker - Plan B

## 📋 Conteneurs Utilisés

Plan B utilise Docker uniquement pour PostgreSQL. Voici les conteneurs :

### Conteneur Principal
- **`planb-postgres`** - Base de données PostgreSQL 15
  - Port: `5432`
  - Database: `planb`
  - User: `postgres`
  - Password: `root`

---

## 🚀 Commandes Docker Utiles

### Gérer PostgreSQL

```powershell
# Démarrer PostgreSQL
docker start planb-postgres

# Arrêter PostgreSQL
docker stop planb-postgres

# Redémarrer PostgreSQL
docker restart planb-postgres

# Vérifier l'état
docker ps --filter "name=planb-postgres"

# Voir les logs
docker logs planb-postgres

# Voir les logs en temps réel
docker logs -f planb-postgres
```

### Accéder à PostgreSQL

```powershell
# Via Docker exec
docker exec -it planb-postgres psql -U postgres -d planb

# Commandes SQL utiles dans psql
\l              # Liste des bases de données
\dt             # Liste des tables
\d+ users       # Détails d'une table
\q              # Quitter
```

### Nettoyer Docker

```powershell
# Supprimer les conteneurs arrêtés
docker container prune -f

# Supprimer les images inutilisées
docker image prune -f

# Nettoyer tout (ATTENTION)
docker system prune -a -f

# Avec le script Plan B
.\DEMARRAGE\NETTOYER-DOCKER.ps1
```

---

## 🔧 Résolution de Problèmes

### Port 5432 déjà utilisé

```powershell
# Trouver le processus qui utilise le port
netstat -ano | findstr :5432

# Arrêter le conteneur existant
docker stop planb-postgres

# Ou supprimer et recréer
docker rm -f planb-postgres
.\DEMARRAGE\DEMARRER.ps1
```

### Conteneur ne démarre pas

```powershell
# Voir les logs d'erreur
docker logs planb-postgres

# Supprimer et recréer le conteneur
docker rm -f planb-postgres

# Le script DEMARRER.ps1 le recréera automatiquement
.\DEMARRAGE\DEMARRER.ps1
```

### Données perdues après suppression

```powershell
# IMPORTANT: Les données sont dans le conteneur
# Pour sauvegarder avant suppression:

# Créer un dump
docker exec planb-postgres pg_dump -U postgres planb > backup.sql

# Restaurer après recréation
docker exec -i planb-postgres psql -U postgres planb < backup.sql
```

---

## 📊 Vérifier l'État des Conteneurs

### Via PowerShell

```powershell
# État de tous les conteneurs
docker ps -a

# État de Plan B uniquement
docker ps -a --filter "name=planb"

# Format personnalisé
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Via Docker Desktop

1. Ouvrir Docker Desktop
2. Onglet "Containers"
3. Chercher "planb-postgres"
4. Vérifier le statut (vert = actif)

---

## 🔐 Sécurité

### Mots de passe

Les identifiants par défaut sont dans `.env` :
- User: `postgres`
- Password: `root`
- Database: `planb`

**⚠️ En production, changez ces valeurs !**

### Ports exposés

- Port `5432` est exposé uniquement sur `localhost`
- Non accessible depuis l'extérieur
- Parfait pour le développement

---

## 📝 Volumes Docker

### Où sont les données ?

Les données sont stockées dans le volume Docker du conteneur.

```powershell
# Lister les volumes
docker volume ls

# Inspecter un volume
docker volume inspect <volume_name>
```

### Backup automatique

Pour un backup régulier en production :

```bash
# Script de backup quotidien (Linux/Mac)
docker exec planb-postgres pg_dump -U postgres planb | gzip > backup_$(date +%Y%m%d).sql.gz
```

---

## 🆘 Commandes de Dépannage

### Reset complet de la base de données

```powershell
# 1. Arrêter et supprimer le conteneur
docker stop planb-postgres
docker rm planb-postgres

# 2. Redémarrer via le script (recrée tout)
.\DEMARRAGE\DEMARRER.ps1

# 3. Réappliquer les migrations
cd planb-backend
php bin/console doctrine:migrations:migrate
```

### Vérifier la connexion réseau

```powershell
# Tester la connexion au port
Test-NetConnection localhost -Port 5432

# Devrait retourner: TcpTestSucceeded : True
```

---

## 💡 Astuces

### Démarrage automatique de Docker

1. Docker Desktop → Settings → General
2. Cocher "Start Docker Desktop when you log in"
3. Cocher "Start Docker Desktop when you start Windows"

### Limiter l'utilisation des ressources

1. Docker Desktop → Settings → Resources
2. Ajuster CPU, Memory, Swap
3. Pour Plan B, 2 CPU + 2GB RAM suffisent

---

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Guide PostgreSQL](https://www.postgresql.org/docs/)

---

**Créé pour Plan B | Développement Local**
