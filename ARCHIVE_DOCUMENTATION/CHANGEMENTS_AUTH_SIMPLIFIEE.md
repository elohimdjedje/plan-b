# 🔐 Authentification Simplifiée - Changements

## ✅ Ce qui a été modifié

### 1. Entité User
**Nouveaux champs :**
- ✅ `whatsappPhone` (VARCHAR 20, nullable) - Pour les discussions WhatsApp
- ✅ `bio` (TEXT, nullable) - Biographie facultative

**Champs rendus optionnels :**
- ✅ `phone` - Maintenant nullable (plus obligatoire)
- ✅ `country` - Maintenant nullable
- ✅ `city` - Maintenant nullable

### 2. Inscription simplifiée (POST /api/v1/auth/register)

**Avant (ancien système) :**
```json
{
  "email": "...",
  "password": "...",
  "phone": "+22501234567",     ❌ OBLIGATOIRE + Vérification OTP
  "firstName": "...",
  "lastName": "...",
  "country": "CI",              ❌ OBLIGATOIRE
  "city": "Abidjan"             ❌ OBLIGATOIRE
}
```

**Maintenant (nouveau système) :**
```json
{
  "email": "user@example.com",          ✅ OBLIGATOIRE (identifiant)
  "password": "motdepasse123",          ✅ OBLIGATOIRE
  "firstName": "John",                  ✅ OBLIGATOIRE
  "lastName": "Doe",                    ✅ OBLIGATOIRE
  "country": "CI",                      ⭕ OPTIONNEL
  "whatsappPhone": "+22501234567"       ⭕ OPTIONNEL
}
```

**Plus de vérification OTP obligatoire !** ✨

### 3. Nouveau endpoint : Mise à jour du profil (PUT /api/v1/auth/update-profile)

Permet de mettre à jour le profil après inscription :

```json
{
  "bio": "Développeur passionné par les nouvelles technologies",
  "whatsappPhone": "+22501234567",
  "country": "CI",
  "city": "Abidjan",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Tous les champs sont optionnels !**

### 4. Orange Money temporairement désactivé

⚠️ Le paiement Orange Money est commenté en attendant la solution API.

**Seul Wave est actif** pour le moment.

---

## 🚀 Commandes à exécuter

### 1. Nettoyer la base de données

```bash
cd planb-backend

# Supprimer tous les comptes existants
php bin/console app:clean-database --force
```

### 2. Exécuter la nouvelle migration

```bash
# Appliquer les changements de structure User
php bin/console doctrine:migrations:migrate --no-interaction
```

### 3. Vérifier la structure

```bash
# Vérifier que tout est OK
php bin/console doctrine:schema:validate
```

---

## 🧪 Tests d'inscription

### Test 1 : Inscription minimale (seulement les champs requis)

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Résultat attendu :** ✅ Inscription réussie

### Test 2 : Inscription complète (avec champs optionnels)

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Smith",
    "country": "CI",
    "whatsappPhone": "+22501234567"
  }'
```

**Résultat attendu :** ✅ Inscription réussie avec tous les champs

### Test 3 : Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Résultat attendu :** ✅ Token JWT retourné

### Test 4 : Récupérer son profil

```bash
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

**Résultat attendu :** ✅ Profil complet avec bio et whatsappPhone

### Test 5 : Mettre à jour son profil (ajouter bio)

```bash
curl -X PUT http://localhost:8000/api/v1/auth/update-profile \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Développeur web passionné",
    "whatsappPhone": "+22507654321",
    "country": "CI",
    "city": "Abidjan"
  }'
```

**Résultat attendu :** ✅ Profil mis à jour

---

## 📊 Nouveaux endpoints API

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/api/v1/auth/register` | Inscription (simplifiée) | ❌ |
| POST | `/api/v1/auth/login` | Connexion | ❌ |
| GET | `/api/v1/auth/me` | Profil (avec bio/whatsapp) | ✅ |
| PUT | `/api/v1/auth/update-profile` | ✨ **NOUVEAU** - Mise à jour profil | ✅ |

---

## 🔄 Flux d'inscription

### Avant (compliqué)
```
1. Envoyer numéro de téléphone
2. Recevoir OTP par SMS
3. Vérifier OTP
4. Remplir formulaire complet (email, password, phone, prénom, nom, pays, ville)
5. Valider
```

### Maintenant (simple) ✨
```
1. Remplir formulaire basique (email, password, prénom, nom)
2. Valider
3. Connecté !
4. (Optionnel) Compléter le profil plus tard
```

---

## 💡 Paramètres utilisateur

### Page Paramètres - Structure suggérée

#### Section 1 : Informations personnelles
- Prénom ✅
- Nom ✅
- Bio (facultatif) ✅

#### Section 2 : Contact
- Email (identifiant) 🔒 non modifiable
- WhatsApp (facultatif) ✅

#### Section 3 : Localisation
- Pays (facultatif) ✅
- Ville (facultatif) ✅

#### Section 4 : Sécurité
- Mot de passe ✅
- Email vérifié ℹ️
- Téléphone vérifié ℹ️

#### Section 5 : Abonnement
- Type de compte (FREE / PRO)
- Date d'expiration (si PRO)

---

## 🔐 Réinitialisation mot de passe

⚠️ **À IMPLÉMENTER** : Système d'envoi d'email pour réinitialiser le mot de passe

Endpoint suggéré :
- `POST /api/v1/auth/forgot-password` - Demander réinitialisation
- `POST /api/v1/auth/reset-password` - Réinitialiser avec token

---

## ✅ Checklist avant test complet

- [x] Entité User modifiée (whatsappPhone, bio)
- [x] Migration créée (Version20241117000000)
- [x] AuthController simplifié (plus d'OTP obligatoire)
- [x] Endpoint update-profile créé
- [x] Orange Money commenté
- [x] Commande de nettoyage BDD créée
- [ ] Migration exécutée
- [ ] BDD nettoyée
- [ ] Tests d'inscription effectués
- [ ] Tests de login effectués
- [ ] Tests de mise à jour profil effectués

---

## 🚀 Prêt pour les tests !

Exécutez les commandes dans l'ordre :

```bash
# 1. Nettoyer
php bin/console app:clean-database --force

# 2. Migrer
php bin/console doctrine:migrations:migrate --no-interaction

# 3. Vérifier
php bin/console doctrine:schema:validate

# 4. Démarrer le serveur
symfony server:start
```

**L'authentification est maintenant simple et efficace ! 🎉**
