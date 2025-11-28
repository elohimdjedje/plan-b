# 📤 Comment partager le code avec votre collègue

## 🎯 Méthode 1 : GitHub (RECOMMANDÉ)

### Avantages
- ✅ Gratuit
- ✅ Collaboration facile
- ✅ Historique des modifications
- ✅ Votre collègue peut cloner et travailler dessus
- ✅ Idéal pour le travail en équipe

### Étapes

#### 1. Créer un compte GitHub (si pas encore fait)
- Allez sur https://github.com
- Cliquez sur "Sign up"
- Créez votre compte gratuitement

#### 2. Créer un nouveau repository

Sur GitHub :
- Cliquez sur "New repository" (bouton vert)
- Nom : `plan-b`
- Description : "Plateforme de petites annonces - Plan B"
- Choisir : **Private** (pour que ce soit privé)
- NE PAS cocher "Initialize with README"
- Cliquez sur "Create repository"

#### 3. Uploader le code

**Option A : Depuis PowerShell (dans le dossier plan-b)**

```powershell
# Se placer dans le dossier
cd "c:\Users\Elohim Mickael\Documents\plan-b"

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - Plan B Application"

# Lier au repository GitHub (remplacer VOTRE_USERNAME)
git remote add origin https://github.com/VOTRE_USERNAME/plan-b.git

# Pousser le code
git push -u origin main
```

**Option B : Depuis GitHub Desktop (plus simple)**

1. Télécharger GitHub Desktop : https://desktop.github.com
2. Installer et se connecter avec votre compte GitHub
3. File → Add Local Repository
4. Sélectionner le dossier `plan-b`
5. Cliquer sur "Publish repository"
6. Choisir "Private" et publier

#### 4. Inviter votre collègue

Sur GitHub :
- Allez dans Settings → Collaborators
- Cliquez sur "Add people"
- Entrez l'email ou le username GitHub de votre collègue
- Il recevra une invitation par email

#### 5. Votre collègue clone le projet

```powershell
git clone https://github.com/VOTRE_USERNAME/plan-b.git
cd plan-b
```

---

## 🎯 Méthode 2 : GitLab

Même principe que GitHub, mais sur https://gitlab.com
- Plus de fonctionnalités CI/CD gratuites
- Repositories privés illimités gratuits

---

## 🎯 Méthode 3 : Fichier ZIP

### Avantages
- ✅ Simple et rapide
- ✅ Pas besoin de compte

### Étapes

#### 1. Créer un fichier .gitignore d'abord

Créer un fichier `.gitignore` à la racine de `plan-b` :

```
# Dependencies
planb-frontend/node_modules/
planb-backend/vendor/

# Cache
planb-backend/var/cache/
planb-backend/var/log/

# Environment
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Build
planb-frontend/dist/
planb-frontend/build/

# Uploads (ne pas partager les images uploadées)
planb-backend/public/uploads/
```

#### 2. Compresser le dossier

**Avec PowerShell** :
```powershell
cd "c:\Users\Elohim Mickael\Documents"
Compress-Archive -Path "plan-b" -DestinationPath "plan-b-complet.zip"
```

**Ou manuellement** :
- Clic droit sur le dossier `plan-b`
- "Envoyer vers" → "Dossier compressé"

#### 3. Partager le fichier ZIP

**Option A : Google Drive**
1. Uploader sur Google Drive
2. Clic droit → "Obtenir le lien"
3. Partager le lien avec votre collègue

**Option B : WeTransfer**
1. Allez sur https://wetransfer.com
2. Uploadez le ZIP (gratuit jusqu'à 2 GB)
3. Entrez l'email de votre collègue
4. Envoyez

**Option C : OneDrive**
1. Uploadez sur OneDrive
2. Partagez le lien

---

## 🎯 Méthode 4 : Partage réseau local

Si vous êtes sur le même réseau WiFi :

### 1. Activer le partage de fichiers Windows

```powershell
# Partager le dossier
net share PlanB="c:\Users\Elohim Mickael\Documents\plan-b" /GRANT:Everyone,READ
```

### 2. Votre collègue accède depuis son PC

```
\\VOTRE_IP\PlanB
```

Pour connaître votre IP :
```powershell
ipconfig
```
Cherchez "Adresse IPv4"

---

## 📋 Fichier .gitignore recommandé

Créez ce fichier à la racine avant de partager :

```gitignore
# === BACKEND ===

# Dependencies
planb-backend/vendor/
planb-backend/composer.lock

# Cache & Logs
planb-backend/var/cache/
planb-backend/var/log/
planb-backend/var/sessions/

# Environment variables (NE PAS PARTAGER)
planb-backend/.env.local
planb-backend/.env.*.local

# Uploads
planb-backend/public/uploads/

# JWT Keys (À REGÉNÉRER par votre collègue)
planb-backend/config/jwt/*.pem

# === FRONTEND ===

# Dependencies
planb-frontend/node_modules/
planb-frontend/package-lock.json

# Build
planb-frontend/dist/
planb-frontend/build/
planb-frontend/.vite/

# Environment
planb-frontend/.env.local
planb-frontend/.env.*.local

# === IDE ===
.vscode/
.idea/
*.swp
*.swo
*.suo

# === OS ===
.DS_Store
Thumbs.db
desktop.ini

# === Autres ===
*.log
*.rar
*.zip
```

---

## 📝 Instructions pour votre collègue

Une fois qu'il a le code, il doit :

### 1. Backend

```powershell
cd planb-backend

# Installer les dépendances
composer install

# Copier le fichier .env
copy .env.example .env

# Configurer la base de données dans .env
# DATABASE_URL="postgresql://postgres:root@127.0.0.1:5432/planb?serverVersion=15&charset=utf8"

# Créer la base de données
php bin/console doctrine:database:create

# Appliquer les migrations
php bin/console doctrine:migrations:migrate

# Générer les clés JWT
php bin/console lexik:jwt:generate-keypair

# Démarrer le serveur
php -S localhost:8000 -t public
```

### 2. Frontend

```powershell
cd planb-frontend

# Installer les dépendances
npm install

# Copier le fichier .env
copy .env.example .env

# Vérifier que l'API backend est bien configurée dans .env
# VITE_API_URL=http://localhost:8000/api/v1

# Démarrer le serveur
npm run dev
```

### 3. PostgreSQL

Il doit avoir PostgreSQL installé avec :
- Utilisateur : `postgres`
- Mot de passe : `root`
- Port : `5432`

Ou modifier les identifiants dans le `.env`

---

## ✅ Checklist avant de partager

- [ ] Créer un `.gitignore`
- [ ] Supprimer `node_modules/` (frontend)
- [ ] Supprimer `vendor/` (backend)
- [ ] Supprimer les fichiers `.env` (ils contiennent des secrets)
- [ ] Garder `.env.example` (pour référence)
- [ ] Créer un fichier `README_INSTALLATION.md` avec les instructions

---

## 📄 README pour votre collègue

Créez ce fichier `README_INSTALLATION.md` :

```markdown
# Plan B - Installation

## Prérequis

- PHP 8.2+
- Composer
- PostgreSQL 15+
- Node.js 18+
- npm ou yarn

## Installation Backend

1. Installer les dépendances :
   ```bash
   cd planb-backend
   composer install
   ```

2. Configurer l'environnement :
   ```bash
   cp .env.example .env
   ```
   
3. Modifier `.env` avec vos paramètres PostgreSQL

4. Créer la base de données :
   ```bash
   php bin/console doctrine:database:create
   php bin/console doctrine:migrations:migrate
   php bin/console lexik:jwt:generate-keypair
   ```

5. Démarrer le serveur :
   ```bash
   php -S localhost:8000 -t public
   ```

## Installation Frontend

1. Installer les dépendances :
   ```bash
   cd planb-frontend
   npm install
   ```

2. Configurer l'environnement :
   ```bash
   cp .env.example .env
   ```

3. Démarrer le serveur :
   ```bash
   npm run dev
   ```

## URLs

- Frontend : http://localhost:5173
- Backend : http://localhost:8000

## Compte de test

Créer un compte via l'interface ou utiliser :
- Email : test@example.com
- Password : Test1234!
```

---

## 🎯 Ma Recommandation

**Utilisez GitHub** car :
- ✅ Collaboration facile
- ✅ Gratuit et professionnel
- ✅ Historique des modifications
- ✅ Votre collègue peut contribuer directement
- ✅ Vous pouvez tous les deux travailler en même temps
- ✅ Pas de risque de perdre le code

Si vous voulez juste envoyer le code une fois : **ZIP + WeTransfer** (le plus simple)

---

**Besoin d'aide pour configurer GitHub ?** Je peux vous guider étape par étape ! 🚀
