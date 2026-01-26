# 🔧 COMMANDES TECHNIQUES - PLAN B BACKEND

**Toutes les commandes expliquées**

---

# 🚀 DÉMARRAGE

## Docker PostgreSQL

### Démarrer PostgreSQL
```bash
docker-compose up -d database
```
**Explication :**
- `docker-compose` : Outil de gestion multi-conteneurs
- `up` : Démarrer les services
- `-d` : Mode détaché (arrière-plan)
- `database` : Nom du service dans docker-compose.yml

**Résultat :** PostgreSQL démarre sur port 5432

---

### Vérifier les conteneurs actifs
```bash
docker ps
```
**Résultat attendu :**
```
CONTAINER ID   IMAGE                NAMES
363f33de4bac   postgres:15-alpine   planb_postgres
7325561610d7   adminer:latest       planb_adminer
```

---

### Arrêter les conteneurs
```bash
docker-compose down
```
**Explication :** Arrête et supprime les conteneurs (données préservées)

---

### Voir les logs PostgreSQL
```bash
docker-compose logs database
```
**Utilité :** Débogage des erreurs de connexion

---

### Voir les logs en temps réel
```bash
docker-compose logs -f database
```
**Explication :** `-f` = follow (suit les nouveaux logs)

---

## Serveur Symfony

### Démarrer le serveur
```bash
php -S localhost:8000 -t public
```
**Explication :**
- `php -S` : Serveur PHP intégré
- `localhost:8000` : IP:Port d'écoute
- `-t public` : Document root (dossier web)

---

### Démarrer sur un autre port
```bash
php -S localhost:8001 -t public
```
**Utilité :** Si le port 8000 est déjà utilisé

---

### Arrêter le serveur
**Appuyer sur :** `Ctrl + C`

---

# 🗄️ BASE DE DONNÉES

## Commandes Symfony Doctrine

### Créer la base de données
```bash
php bin/console doctrine:database:create
```
**Explication :** Créer la BDD "planb" dans PostgreSQL

---

### Vérifier la connexion
```bash
php bin/console doctrine:schema:validate
```
**Résultat attendu :** "The mapping files are correct"

---

### Créer une migration
```bash
php bin/console make:migration
```
**Explication :** Génère un fichier de migration SQL

---

### Exécuter les migrations
```bash
php bin/console doctrine:migrations:migrate --no-interaction
```
**Explication :**
- `migrate` : Applique les migrations
- `--no-interaction` : Pas de confirmation

---

### Voir l'état des migrations
```bash
php bin/console doctrine:migrations:status
```

---

### Revenir en arrière (rollback)
```bash
php bin/console doctrine:migrations:migrate prev
```

---

## Commandes SQL directes

### Se connecter à PostgreSQL
```bash
docker exec -it planb_postgres psql -U postgres -d planb
```
**Explication :**
- `docker exec` : Exécuter une commande dans un conteneur
- `-it` : Mode interactif
- `psql` : Client PostgreSQL
- `-U postgres` : Utilisateur
- `-d planb` : Base de données

---

### Lister les tables
```sql
\dt
```

---

### Voir la structure d'une table
```sql
\d users
```

---

### Compter les utilisateurs
```sql
SELECT COUNT(*) FROM users;
```

---

### Voir tous les utilisateurs
```sql
SELECT id, email, first_name, last_name, account_type, created_at FROM users;
```

---

### Voir les annonces actives
```sql
SELECT id, title, price, category, status FROM listings WHERE status = 'active';
```

---

### Supprimer un utilisateur
```sql
DELETE FROM users WHERE id = 1;
```
**⚠️ Attention :** Supprime aussi les annonces (CASCADE)

---

### Quitter psql
```sql
\q
```

---

# 🔐 JWT (Authentification)

## Générer les clés JWT

### Méthode 1 : Avec Symfony (si OpenSSL configuré)
```bash
php bin/console lexik:jwt:generate-keypair
```

---

### Méthode 2 : Avec Docker (RECOMMANDÉ)
```bash
.\generate-keys.bat
```
**Génère :**
- `config/jwt/private.pem` (clé privée RSA 4096)
- `config/jwt/public.pem` (clé publique)

---

### Vérifier les clés
```bash
dir config\jwt\
```
**Résultat attendu :**
```
private.pem  (3272 bytes)
public.pem   (800 bytes)
```

---

## Tester JWT

### Obtenir un token
```powershell
.\test-login.ps1
```

---

### Vérifier un token (sur jwt.io)
1. Copier le token
2. Aller sur https://jwt.io/
3. Coller le token
4. Voir le payload décodé

---

# 🧪 TESTS

## Scripts PowerShell

### Test liste des annonces
```powershell
.\test-api.ps1
```

---

### Test inscription
```powershell
.\test-register.ps1
```

---

### Test connexion
```powershell
.\test-login.ps1
```

---

## Tests manuels avec curl (PowerShell)

### Inscription
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" -Method POST -ContentType "application/json" -Body '{
  "email": "nouveau@test.com",
  "password": "Password123!",
  "phone": "+22507888777",
  "firstName": "Marie",
  "lastName": "Kone",
  "country": "CI",
  "city": "Abidjan"
}'
```

---

### Connexion
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{
  "username": "nouveau@test.com",
  "password": "Password123!"
}'
```

---

### Profil (avec token)
```powershell
$token = "VOTRE_TOKEN_ICI"
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/me" -Method GET -Headers @{Authorization="Bearer $token"}
```

---

# 🔧 COMMANDES SYMFONY UTILES

## Informations système

### Version de Symfony
```bash
php bin/console --version
```

---

### Liste des routes
```bash
php bin/console debug:router
```

---

### Détails d'une route
```bash
php bin/console debug:router app_auth_register
```

---

### Liste des services
```bash
php bin/console debug:container
```

---

### Configuration
```bash
php bin/console debug:config security
```

---

## Cache

### Vider le cache
```bash
php bin/console cache:clear
```

---

### Réchauffer le cache
```bash
php bin/console cache:warmup
```

---

## Fixtures (données de test)

### Créer des fixtures
```bash
php bin/console make:fixtures
```

---

### Charger les fixtures
```bash
php bin/console doctrine:fixtures:load
```
**⚠️ Attention :** Supprime toutes les données existantes

---

# 📦 COMPOSER (Dépendances)

## Installer les dépendances
```bash
composer install
```

---

## Mettre à jour les dépendances
```bash
composer update
```

---

## Ajouter une dépendance
```bash
composer require nom-du-package
```

---

## Supprimer une dépendance
```bash
composer remove nom-du-package
```

---

## Voir les dépendances installées
```bash
composer show
```

---

# 🐛 DÉBOGAGE

## Logs Symfony

### Voir les logs en temps réel
```bash
tail -f var/log/dev.log
```

---

### Logs des erreurs uniquement
```bash
grep ERROR var/log/dev.log
```

---

## Informations PHP

### Version PHP
```bash
php -v
```

---

### Extensions PHP installées
```bash
php -m
```

---

### Configuration PHP
```bash
php --ini
```

---

### Tester une extension
```bash
php -r "echo extension_loaded('pdo_pgsql') ? 'OK' : 'NON';"
```

---

# 🔄 WORKFLOW COMPLET

## Ajouter une nouvelle fonctionnalité

### 1. Créer une entité
```bash
php bin/console make:entity NomEntite
```

---

### 2. Générer la migration
```bash
php bin/console make:migration
```

---

### 3. Vérifier le SQL généré
```bash
cat migrations/VersionXXXXXXXX.php
```

---

### 4. Appliquer la migration
```bash
php bin/console doctrine:migrations:migrate
```

---

### 5. Créer un contrôleur
```bash
php bin/console make:controller NomController
```

---

### 6. Vider le cache
```bash
php bin/console cache:clear
```

---

### 7. Tester
```bash
php bin/console debug:router
```

---

# 📊 MONITORING

## Performances

### Vérifier l'utilisation CPU/Mémoire Docker
```bash
docker stats
```

---

### Taille de la base de données
```sql
SELECT pg_size_pretty(pg_database_size('planb'));
```
**Dans psql**

---

### Nombre d'enregistrements par table
```sql
SELECT 
  'users' as table, COUNT(*) as count FROM users
UNION ALL
SELECT 'listings', COUNT(*) FROM listings
UNION ALL
SELECT 'images', COUNT(*) FROM images
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions;
```

---

# 🚀 DÉPLOIEMENT

## Préparation production

### Vérifier les requirements
```bash
php bin/console check:requirements
```

---

### Optimiser l'autoloader
```bash
composer install --no-dev --optimize-autoloader
```

---

### Vider et réchauffer le cache
```bash
php bin/console cache:clear --env=prod
php bin/console cache:warmup --env=prod
```

---

### Variables d'environnement
```bash
# Modifier .env
APP_ENV=prod
APP_DEBUG=0
```

---

# 🆘 DÉPANNAGE

## Problème : "Driver not found"

**Solution :**
```bash
.\enable-pgsql.ps1
```
Puis redémarrer le terminal

---

## Problème : "Port 8000 already in use"

**Solution :**
```bash
php -S localhost:8001 -t public
```

---

## Problème : "Database connection error"

**Vérifications :**
1. Docker est démarré ?
```bash
docker ps
```

2. PostgreSQL est actif ?
```bash
docker-compose up -d database
```

3. Tester la connexion
```bash
docker exec -it planb_postgres psql -U postgres -c "SELECT version();"
```

---

## Problème : "JWT token invalid"

**Solutions :**
1. Régénérer les clés
```bash
.\generate-keys.bat
```

2. Vider le cache
```bash
php bin/console cache:clear
```

---

## Problème : "Migration already executed"

**Solution :**
```bash
php bin/console doctrine:migrations:version --delete --all
php bin/console doctrine:migrations:migrate
```

---

# 📚 RESSOURCES

## Documentation officielle
- Symfony : https://symfony.com/doc/current/
- Doctrine : https://www.doctrine-project.org/
- Docker : https://docs.docker.com/
- PostgreSQL : https://www.postgresql.org/docs/

## Outils recommandés
- **Postman** : https://www.postman.com/
- **DBeaver** : Client PostgreSQL gratuit
- **VSCode** : Éditeur de code
- **Docker Desktop** : https://www.docker.com/products/docker-desktop

---

**Document mis à jour le 3 novembre 2025**
