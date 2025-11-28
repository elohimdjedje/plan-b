# 🐘 Démarrer PostgreSQL - Guide Complet

## Votre problème actuel

```
❌ PostgreSQL n'est pas démarré
❌ Connection refused sur le port 5432
❌ Les images ne s'affichent pas car l'app ne peut pas accéder à la BD
```

## Solutions

### Option 1 : PostgreSQL avec Docker (RECOMMANDÉ)

#### 1. Démarrer Docker Desktop
- Ouvrir Docker Desktop sur Windows
- Attendre que Docker soit complètement démarré

#### 2. Démarrer PostgreSQL
```powershell
docker run -d `
  --name planb-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=root `
  -e POSTGRES_DB=planb `
  -p 5432:5432 `
  postgres:15-alpine
```

#### 3. Vérifier que ça fonctionne
```powershell
docker ps
# Vous devriez voir planb-postgres en cours d'exécution
```

#### Commandes utiles
```powershell
# Arrêter PostgreSQL
docker stop planb-postgres

# Redémarrer PostgreSQL
docker start planb-postgres

# Voir les logs
docker logs planb-postgres

# Supprimer le conteneur
docker rm -f planb-postgres
```

---

### Option 2 : PostgreSQL installé localement

#### Windows avec PostgreSQL installé

1. **Trouver où est installé PostgreSQL**
```powershell
# Rechercher postgres.exe
Get-ChildItem -Path "C:\Program Files" -Filter postgres.exe -Recurse -ErrorAction SilentlyContinue
```

2. **Démarrer le service (si installé comme service)**
```powershell
# Voir tous les services PostgreSQL
Get-Service -Name "*postgresql*"

# Démarrer le service (remplacez par le nom de votre service)
Start-Service postgresql-x64-15
```

3. **Ou démarrer manuellement**
```powershell
# Naviguer vers le dossier bin de PostgreSQL
cd "C:\Program Files\PostgreSQL\15\bin"

# Démarrer le serveur (remplacez le chemin data)
.\postgres.exe -D "C:\Program Files\PostgreSQL\15\data"
```

---

### Option 3 : Installer PostgreSQL

#### Via Docker (le plus simple)

1. **Installer Docker Desktop**
   - Télécharger : https://www.docker.com/products/docker-desktop
   - Installer et redémarrer Windows
   - Lancer Docker Desktop

2. **Utiliser Option 1 ci-dessus**

#### Via installation native

1. **Télécharger PostgreSQL**
   - Aller sur : https://www.postgresql.org/download/windows/
   - Télécharger l'installateur pour Windows
   - Version recommandée : PostgreSQL 15

2. **Installer**
   - Lancer l'installateur
   - Mot de passe : `root` (comme dans votre .env)
   - Port : `5432`
   - Cocher "PostgreSQL Server" et "pgAdmin 4"

3. **Démarrer PostgreSQL**
   - Chercher "pgAdmin 4" dans le menu Démarrer
   - Connecter avec le mot de passe `root`
   - Le serveur démarre automatiquement

---

## Vérifier que PostgreSQL fonctionne

### Test 1 : Connexion depuis le backend
```powershell
cd planb-backend
php bin/console doctrine:query:sql "SELECT 1"
```

**Résultat attendu** :
```
[
    [1 => 1]
]
```

### Test 2 : Voir les annonces
```powershell
php bin/console doctrine:query:sql "SELECT COUNT(*) FROM listings"
```

### Test 3 : Tester la connexion directement
```powershell
# Si psql est installé
psql -h localhost -U postgres -d planb

# Mot de passe : root
```

---

## Une fois PostgreSQL démarré

### 1. Appliquer les migrations (si nécessaire)
```powershell
cd planb-backend
php bin/console doctrine:migrations:migrate --no-interaction
```

### 2. Démarrer le backend
```powershell
php -S localhost:8000 -t public
```

### 3. Démarrer le frontend
```powershell
cd ..\planb-frontend
npm run dev
```

### 4. Tester l'application
- Ouvrir : http://localhost:5173
- Les images devraient maintenant s'afficher (si elles existent dans la BD)

---

## Problèmes courants

### Erreur : "Port 5432 already in use"
```powershell
# Trouver le processus qui utilise le port
netstat -ano | findstr :5432

# Tuer le processus (remplacez PID par le numéro)
taskkill /PID <PID> /F
```

### Erreur : "password authentication failed"
- Vérifier le mot de passe dans `.env` : `root`
- Réinstaller PostgreSQL si nécessaire

### Docker ne démarre pas
- Vérifier que la virtualisation est activée dans le BIOS
- Redémarrer Windows
- Réinstaller Docker Desktop

---

## Base de données actuelle

Selon votre `.env` :
```
DATABASE_URL="postgresql://postgres:root@127.0.0.1:5432/planb?serverVersion=15&charset=utf8"
```

- **Hôte** : localhost (127.0.0.1)
- **Port** : 5432
- **Utilisateur** : postgres
- **Mot de passe** : root
- **Base de données** : planb
- **Version** : PostgreSQL 15

---

## Résumé

1. ✅ PostgreSQL doit être **DÉMARRÉ** avant le backend
2. ✅ Docker est la méthode **la plus simple**
3. ✅ Une fois démarré, les images s'afficheront normalement
4. ✅ PostgreSQL ne stocke PAS les images, juste leurs URLs

**Le problème n'est PAS PostgreSQL en tant que technologie, c'est juste qu'il n'est pas démarré !**
