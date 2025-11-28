# 🚀 GUIDE D'INSTALLATION PLAN B BACKEND - WINDOWS/XAMPP

## ⚡ INSTALLATION RAPIDE (30 MINUTES)

Bienvenue ! Ce guide vous aidera à installer le backend Plan B sur votre machine Windows avec XAMPP.

---

## 📋 PRÉREQUIS

### 1. XAMPP (déjà installé chez vous)
✅ Vous avez déjà XAMPP dans `D:\xamps`

### 2. PHP 8.2+ (vérifions)
Ouvrez le cmd et tapez :
```cmd
D:\xamps\php\php.exe -v
```

**Si vous voyez PHP 8.2 ou plus** → Parfait ! ✅  
**Si vous voyez PHP 7.x ou moins** → Il faut mettre à jour XAMPP

### 3. Composer (gestionnaire de packages PHP)
Téléchargez et installez depuis : https://getcomposer.org/Composer-Setup.exe

Après installation, vérifiez :
```cmd
composer -V
```
Vous devriez voir quelque chose comme `Composer version 2.x.x`

### 4. PostgreSQL (base de données recommandée)
**Option A : PostgreSQL (RECOMMANDÉ)**
1. Téléchargez depuis : https://www.postgresql.org/download/windows/
2. Installez avec le mot de passe : `root` (ou notez votre mot de passe !)
3. Port par défaut : `5432`

**Option B : MySQL (déjà dans XAMPP)**
Si vous préférez MySQL, vous pouvez l'utiliser. Il suffit de modifier une ligne dans `.env`

---

## 🎯 INSTALLATION ÉTAPE PAR ÉTAPE

### ÉTAPE 1 : Extraire le ZIP

1. Extrayez le fichier `planb-backend.zip` quelque part, par exemple :
   ```
   C:\Users\VotreNom\Documents\planb-backend
   ```

2. Ouvrez ce dossier dans VS Code (ou votre éditeur préféré)

### ÉTAPE 2 : Installer les dépendances

1. Ouvrez un terminal (cmd ou PowerShell) dans le dossier du projet

2. Installez les dépendances PHP :
   ```cmd
   composer install
   ```

   ⏳ Cela va prendre 2-5 minutes. Attendez que tout se télécharge.

### ÉTAPE 3 : Configuration de la base de données

1. **Créer la base de données**

   **Si PostgreSQL :**
   Ouvrez pgAdmin (installé avec PostgreSQL) ou le terminal PostgreSQL :
   ```sql
   CREATE DATABASE planb;
   ```

   **Si MySQL :**
   Ouvrez phpMyAdmin (http://localhost/phpmyadmin) et créez une base nommée `planb`

2. **Configurer les variables d'environnement**

   Copiez le fichier `.env.example` et renommez-le en `.env` :
   ```cmd
   copy .env.example .env
   ```

3. **Modifier le fichier `.env`**

   Ouvrez `.env` et modifiez ces lignes :

   **Pour PostgreSQL :**
   ```env
   DATABASE_URL="postgresql://postgres:root@127.0.0.1:5432/planb?serverVersion=15&charset=utf8"
   ```
   (Remplacez `root` par votre mot de passe PostgreSQL)

   **Pour MySQL :**
   ```env
   DATABASE_URL="mysql://root:@127.0.0.1:3306/planb?serverVersion=8.0.32&charset=utf8mb4"
   ```

   Modifiez aussi :
   ```env
   APP_SECRET=changez_cette_valeur_par_quelque_chose_de_random
   JWT_PASSPHRASE=changez_aussi_cette_valeur
   ```

### ÉTAPE 4 : Générer les clés JWT

Les clés JWT permettent de sécuriser les connexions des utilisateurs.

```cmd
php bin/console lexik:jwt:generate-keypair
```

Vous devriez voir : `✓ Keys have been generated successfully!`

### ÉTAPE 5 : Créer les tables de la base de données

1. **Créer la migration** (génère le SQL nécessaire) :
   ```cmd
   php bin/console make:migration
   ```

2. **Appliquer la migration** (crée les tables) :
   ```cmd
   php bin/console doctrine:migrations:migrate
   ```

   Tapez `yes` quand demandé.

   ✅ Vos tables sont créées : `users`, `listings`, `images`, `payments`, `subscriptions`

### ÉTAPE 6 : Lancer le serveur

**Option A : Avec Symfony CLI (recommandé si installé)**
```cmd
symfony server:start
```

**Option B : Avec PHP natif**
```cmd
php -S localhost:8000 -t public
```

🎉 **Votre API est maintenant accessible sur : http://localhost:8000**

---

## 🧪 TESTER L'API

### 1. Test simple (dans votre navigateur)

Ouvrez : http://localhost:8000/api/v1/categories

Vous devriez voir un résultat (même si vide pour l'instant).

### 2. Test d'inscription (avec curl ou Postman)

**Avec curl (dans cmd) :**
```cmd
curl -X POST http://localhost:8000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@planb.ci\",\"password\":\"Password123!\",\"phone\":\"+22507123456\",\"firstName\":\"Test\",\"lastName\":\"User\",\"country\":\"CI\",\"city\":\"Abidjan\"}"
```

**Avec Postman :**
1. Créez une requête POST vers `http://localhost:8000/api/v1/auth/register`
2. Dans Body → raw → JSON, collez :
```json
{
  "email": "test@planb.ci",
  "password": "Password123!",
  "phone": "+22507123456",
  "firstName": "Test",
  "lastName": "User",
  "country": "CI",
  "city": "Abidjan"
}
```
3. Envoyez

✅ Vous devriez recevoir une réponse avec `"message": "Inscription réussie"`

### 3. Test de connexion

**Avec Postman :**
1. POST vers `http://localhost:8000/api/v1/auth/login`
2. Body → raw → JSON :
```json
{
  "username": "test@planb.ci",
  "password": "Password123!"
}
```

✅ Vous recevez un `token` et un `refresh_token`

### 4. Test d'une route protégée

1. Copiez le token reçu lors de la connexion
2. GET vers `http://localhost:8000/api/v1/users/me`
3. Dans Headers, ajoutez :
   - Key: `Authorization`
   - Value: `Bearer VOTRE_TOKEN_ICI`

✅ Vous voyez vos informations utilisateur

---

## 📱 ENDPOINTS DISPONIBLES

### Authentification (PUBLIC)
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `GET /api/v1/users/me` - Profil utilisateur (protégé)
- `POST /api/v1/auth/verify-email` - Vérifier email (protégé)
- `POST /api/v1/auth/verify-phone` - Vérifier téléphone (protégé)

### Annonces
- `GET /api/v1/listings` - Liste des annonces (PUBLIC)
- `GET /api/v1/listings/{id}` - Détails d'une annonce (PUBLIC)
- `POST /api/v1/listings` - Créer une annonce (PROTÉGÉ)
- `PUT /api/v1/listings/{id}` - Modifier une annonce (PROTÉGÉ)
- `DELETE /api/v1/listings/{id}` - Supprimer une annonce (PROTÉGÉ)

---

## 🔧 COMMANDES UTILES

### Voir toutes les routes
```cmd
php bin/console debug:router
```

### Vider le cache
```cmd
php bin/console cache:clear
```

### Créer une nouvelle entité
```cmd
php bin/console make:entity
```

### Créer un contrôleur
```cmd
php bin/console make:controller
```

### Voir la structure de la BDD
```cmd
php bin/console doctrine:mapping:info
```

---

## ⚠️ PROBLÈMES COURANTS

### Erreur : "Class 'DOMDocument' not found"
➡️ Activez l'extension `php_dom` dans `D:\xamps\php\php.ini`
```ini
extension=dom
```
Redémarrez Apache.

### Erreur : "Could not find driver"
➡️ Activez l'extension PDO dans `php.ini` :
```ini
extension=pdo_pgsql    ; Pour PostgreSQL
; OU
extension=pdo_mysql    ; Pour MySQL
```

### Erreur JWT : "Unable to load key"
➡️ Regénérez les clés :
```cmd
php bin/console lexik:jwt:generate-keypair --overwrite
```

### Port 8000 déjà utilisé
➡️ Utilisez un autre port :
```cmd
php -S localhost:8080 -t public
```

### Connexion base de données refusée
➡️ Vérifiez que PostgreSQL ou MySQL est bien démarré dans XAMPP Control Panel

---

## 🎓 POUR VOTRE SOUTENANCE

### Points forts à présenter :
1. ✅ **Architecture RESTful** bien structurée
2. ✅ **Sécurité JWT** pour l'authentification
3. ✅ **Validation des données** côté serveur
4. ✅ **Séparation des responsabilités** (Controller/Entity/Repository/Service)
5. ✅ **Support multi-pays** (CI, BJ, SN, ML)
6. ✅ **Comptes FREE et PRO** avec limitations différentes
7. ✅ **API documentée** et testable

### Démonstration recommandée :
1. Montrez Postman avec les requêtes d'inscription/connexion
2. Créez une annonce via l'API
3. Montrez la base de données avec les données créées
4. Expliquez la structure du code (MVC)

---

## 📞 SUPPORT

En cas de problème :
1. Consultez le fichier `BACKEND_README.md`
2. Vérifiez les logs dans `var/log/dev.log`
3. Email : mickael.djedje@example.com

---

## 🚀 ÉTAPES SUIVANTES

1. ✅ Installer et tester le backend → **VOUS ÊTES ICI**
2. ⬜ Implémenter les services (Fedapay, upload images)
3. ⬜ Créer le frontend PWA (React/Vue)
4. ⬜ Connecter frontend et backend
5. ⬜ Tester et déboguer
6. ⬜ Déployer sur Render.com (gratuit)

---

**Bon courage pour votre projet ! 🎓💪**

*Mickael Elohim DJEDJE - Bachelor 3 - 2024/2025*
