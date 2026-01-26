# 🐳 GUIDE COMPLET INSTALLATION AVEC DOCKER

## 📋 ÉTAPE 1 : INSTALLER DOCKER CORRECTEMENT

### 🔍 Vérifier votre système
1. Ouvrez PowerShell (en tant qu'administrateur)
2. Tapez : `systeminfo | findstr /C:"Type du système"`
3. Vous devez voir "x64-based PC" ou "ARM-based PC"

### 📥 Télécharger la BONNE version de Docker
- **Pour x64 (99% des PC)** : https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
- **Pour ARM** : https://desktop.docker.com/win/main/arm64/Docker%20Desktop%20Installer.exe

### ✅ Installation de Docker Desktop
1. Double-cliquez sur le fichier téléchargé
2. Suivez les instructions (cochez "Use WSL 2 instead of Hyper-V")
3. Redémarrez votre PC
4. Lancez Docker Desktop
5. Attendez que Docker démarre (icône Docker en bas à droite)

### 🧪 Tester Docker
Ouvrez PowerShell et tapez :
```bash
docker --version
docker-compose --version
```

Vous devez voir les versions installées.

---

## 🚀 ÉTAPE 2 : CONFIGURER VOTRE PROJET

### 1️⃣ Extraire le projet
```bash
# Allez dans votre dossier de développement (exemple)
cd C:\Users\VotreNom\Documents\projets
unzip planb-backend.zip
cd planb-backend
```

### 2️⃣ Créer le fichier .env
```bash
# Copier le fichier d'exemple
copy .env.example .env
```

**Ouvrez le fichier .env et modifiez :**
```env
DATABASE_URL="postgresql://postgres:root@database:5432/planb?serverVersion=15&charset=utf8"
```
⚠️ **Important** : Changez `127.0.0.1` par `database` (nom du conteneur Docker)

### 3️⃣ Générer un APP_SECRET sécurisé
Remplacez la ligne `APP_SECRET=...` dans .env par une chaîne aléatoire de 32 caractères.

---

## 🐳 ÉTAPE 3 : DÉMARRER DOCKER

### 📦 Lancer les conteneurs
Ouvrez PowerShell dans le dossier `planb-backend` et tapez :

```bash
# Démarrer la base de données seulement (recommandé pour débuter)
docker-compose up -d database

# OU démarrer tout (base de données + API + interface admin)
docker-compose up -d
```

### 🔍 Vérifier que tout fonctionne
```bash
# Voir les conteneurs en cours d'exécution
docker ps

# Voir les logs
docker-compose logs -f database
```

Vous devez voir :
```
planb_postgres       running       0.0.0.0:5432->5432/tcp
```

---

## 🗄️ ÉTAPE 4 : CRÉER LA BASE DE DONNÉES

### Option A : Utiliser Adminer (Interface web) 🌐

1. Allez sur http://localhost:8080
2. Connectez-vous :
   - **Système** : PostgreSQL
   - **Serveur** : database
   - **Utilisateur** : postgres
   - **Mot de passe** : root
   - **Base de données** : planb
3. La base `planb` existe déjà !

### Option B : Utiliser les commandes Symfony (Recommandé) 💻

**Si vous lancez l'API en LOCAL (hors Docker) :**

```bash
# 1. Installer les dépendances PHP
composer install

# 2. Générer les clés JWT
php bin/console lexik:jwt:generate-keypair

# 3. Créer la base de données (si elle n'existe pas)
php bin/console doctrine:database:create

# 4. Exécuter les migrations (créer les tables)
php bin/console doctrine:migrations:migrate

# 5. Vérifier la structure
php bin/console doctrine:schema:validate

# 6. Lancer le serveur
php -S localhost:8000 -t public
```

**Si vous lancez l'API DANS DOCKER :**

```bash
# Entrer dans le conteneur
docker exec -it planb_api sh

# Puis exécuter les commandes
php bin/console lexik:jwt:generate-keypair
php bin/console doctrine:migrations:migrate
php bin/console cache:clear
```

---

## 📊 ÉTAPE 5 : VÉRIFIER LA BASE DE DONNÉES

### Via Adminer (http://localhost:8080)
Vous devez voir ces tables créées :
- `users`
- `listings`
- `images`
- `payments`
- `subscriptions`
- `doctrine_migration_versions`

### Via commande SQL
Dans Adminer, cliquez sur "Commande SQL" et tapez :
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## 🧪 ÉTAPE 6 : TESTER L'API

### Test d'inscription
Ouvrez PowerShell :

```bash
curl -X POST http://localhost:8000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"Test123!\",\"phone\":\"+22507123456\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"country\":\"CI\",\"city\":\"Abidjan\"}'
```

Réponse attendue :
```json
{
  "message": "Inscription réussie",
  "user": {
    "id": 1,
    "email": "test@example.com",
    ...
  }
}
```

### Test de connexion
```bash
curl -X POST http://localhost:8000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"test@example.com\",\"password\":\"Test123!\"}'
```

Réponse attendue :
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbG...",
  "user": {...}
}
```

---

## 🛠️ COMMANDES DOCKER UTILES

```bash
# Démarrer les conteneurs
docker-compose up -d

# Arrêter les conteneurs
docker-compose down

# Voir les logs en temps réel
docker-compose logs -f

# Redémarrer un conteneur
docker-compose restart database

# Supprimer tout (ATTENTION : supprime les données)
docker-compose down -v

# Entrer dans un conteneur
docker exec -it planb_postgres psql -U postgres -d planb
docker exec -it planb_api sh

# Voir l'utilisation de l'espace disque
docker system df
```

---

## 🚨 RÉSOLUTION DES PROBLÈMES COURANTS

### ❌ Erreur : "Cannot connect to Docker daemon"
**Solution** : Lancez Docker Desktop et attendez qu'il démarre complètement.

### ❌ Erreur : "Port 5432 already in use"
**Solution** : Un autre PostgreSQL est déjà lancé sur votre PC
```bash
# Option 1 : Arrêter PostgreSQL local
# Ouvrez "Services" Windows et arrêtez "postgresql-x64-15"

# Option 2 : Changer le port dans docker-compose.yml
# Ligne 14 : "5433:5432" au lieu de "5432:5432"
# Et dans .env : DATABASE_URL="...@127.0.0.1:5433/planb..."
```

### ❌ Erreur : "Connection refused"
**Solution** : 
```bash
# Vérifier que le conteneur est bien lancé
docker ps

# Voir les logs
docker-compose logs database

# Redémarrer
docker-compose restart database
```

### ❌ Erreur JWT : "Unable to load key"
**Solution** :
```bash
php bin/console lexik:jwt:generate-keypair
# Entrez une passphrase (mot de passe) et notez-la
# Mettez-la dans .env : JWT_PASSPHRASE=votre_passphrase
```

---

## ✅ CHECKLIST FINALE

- [ ] Docker Desktop installé et lancé
- [ ] Conteneur `planb_postgres` démarré (vert dans `docker ps`)
- [ ] Fichier `.env` configuré avec DATABASE_URL
- [ ] Clés JWT générées (`config/jwt/private.pem` existe)
- [ ] Migrations exécutées (tables créées dans la BD)
- [ ] API accessible sur http://localhost:8000
- [ ] Test d'inscription réussi

---

## 🎉 FÉLICITATIONS !

Votre backend est maintenant opérationnel !

**Prochaines étapes :**
1. Tester tous les endpoints avec Postman (fichier POSTMAN_EXAMPLES.json inclus)
2. Développer le frontend (React/Vue/Next.js)
3. Configurer Cloudinary pour les images
4. Configurer Fedapay pour les paiements

**Accès rapides :**
- 🌐 API : http://localhost:8000
- 📊 Adminer (BD) : http://localhost:8080
- 📁 Fichiers logs : `var/log/`
