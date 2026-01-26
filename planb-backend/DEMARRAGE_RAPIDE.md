# 🚀 Démarrage Rapide - Plan B Backend

## ⚡ Démarrer le projet (Méthode simple)

```bash
# Double-cliquez sur ce fichier :
start-dev.bat
```

C'est tout ! Le backend sera disponible sur **http://localhost:8000**

---

## 🔧 Démarrage manuel

Si vous préférez démarrer manuellement :

### 1. Démarrer Docker PostgreSQL
```bash
docker-compose up -d database
```

### 2. Démarrer le serveur Symfony
```bash
php -S localhost:8000 -t public
```

---

## 🧪 Tester l'API

### Avec PowerShell
```powershell
# Lister les annonces
.\test-api.ps1

# Tester l'inscription
.\test-register.ps1

# Tester la connexion
.\test-login.ps1
```

### Avec un client HTTP (Postman, Insomnia, etc.)

**Inscription :**
```http
POST http://localhost:8000/api/v1/auth/register
Content-Type: application/json

{
  "email": "nouveau@example.com",
  "password": "Password123!",
  "phone": "+22507987654",
  "firstName": "Marie",
  "lastName": "Diallo",
  "country": "CI",
  "city": "Abidjan"
}
```

**Connexion :**
```http
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "username": "nouveau@example.com",
  "password": "Password123!"
}
```

**Profil (avec token JWT) :**
```http
GET http://localhost:8000/api/v1/auth/me
Authorization: Bearer VOTRE_TOKEN_JWT_ICI
```

---

## 🔍 Accès à la base de données

### Via Adminer (Interface web)
1. Ouvrez http://localhost:8080
2. Connectez-vous avec :
   - **Système :** PostgreSQL
   - **Serveur :** database
   - **Utilisateur :** postgres
   - **Mot de passe :** root
   - **Base de données :** planb

### Via ligne de commande
```bash
docker exec -it planb_postgres psql -U postgres -d planb
```

---

## 📚 Documentation complète

- **Phase 1 terminée :** Voir `PHASE1_COMPLETE.md`
- **Installation complète :** Voir `README.md`
- **Guide Docker :** Voir `GUIDE_INSTALLATION_DOCKER.md`

---

## ⚠️ Problèmes courants

### Docker ne démarre pas
→ Assurez-vous que Docker Desktop est lancé

### "Driver not found" (PostgreSQL)
→ L'extension pdo_pgsql doit être activée dans php.ini
→ Exécutez : `.\enable-pgsql.ps1`

### Port 8000 déjà utilisé
→ Changez le port : `php -S localhost:8001 -t public`

---

## 📞 Endpoints disponibles

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Inscription | ❌ |
| POST | `/api/v1/auth/login` | Connexion | ❌ |
| GET | `/api/v1/auth/me` | Profil utilisateur | ✅ |
| GET | `/api/v1/listings` | Liste des annonces | ❌ |
| GET | `/api/v1/listings/{id}` | Détail d'une annonce | ❌ |
| POST | `/api/v1/listings` | Créer une annonce | ✅ |
| PUT | `/api/v1/listings/{id}` | Modifier une annonce | ✅ |
| DELETE | `/api/v1/listings/{id}` | Supprimer une annonce | ✅ |

---

## 🎯 Prochaines étapes

La Phase 1 est terminée ! Pour continuer :
1. Implémenter les contrôleurs manquants (Payments, Images, etc.)
2. Ajouter l'intégration Cloudinary pour les images
3. Intégrer Fedapay pour les paiements Mobile Money
4. Développer le frontend

---

**Bon développement ! 🚀**
