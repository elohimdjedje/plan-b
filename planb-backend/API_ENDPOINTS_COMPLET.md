# 📚 TOUS LES ENDPOINTS API - PLAN B BACKEND

**25 endpoints disponibles**

---

## 🔐 AUTHENTIFICATION (3 endpoints)

### 1. POST /api/v1/auth/register
**Inscription d'un nouvel utilisateur**

**Body:**
```json
{
  "email": "utilisateur@example.com",
  "password": "Password123!",
  "phone": "+22507123456",
  "firstName": "Kouadio",
  "lastName": "Yao",
  "country": "CI",
  "city": "Abidjan"
}
```

**Réponse:** 201 Created
```json
{
  "message": "Inscription réussie",
  "user": {
    "id": 1,
    "email": "utilisateur@example.com",
    "firstName": "Kouadio",
    "lastName": "Yao",
    "accountType": "FREE"
  }
}
```

---

### 2. POST /api/v1/auth/login
**Connexion et obtention du token JWT**

**Body:**
```json
{
  "username": "utilisateur@example.com",
  "password": "Password123!"
}
```

**Réponse:** 200 OK
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 3. GET /api/v1/auth/me
**Obtenir son profil** 🔒 Authentifié

**Header:**
```
Authorization: Bearer VOTRE_TOKEN_JWT
```

**Réponse:** 200 OK
```json
{
  "id": 1,
  "email": "utilisateur@example.com",
  "phone": "+22507123456",
  "firstName": "Kouadio",
  "lastName": "Yao",
  "fullName": "Kouadio Yao",
  "accountType": "FREE",
  "isPro": false,
  "country": "CI",
  "city": "Abidjan",
  "profilePicture": null,
  "isEmailVerified": false,
  "isPhoneVerified": false,
  "subscriptionExpiresAt": null,
  "createdAt": "2025-11-03T10:30:00+01:00"
}
```

---

## 📝 ANNONCES (5 endpoints)

### 4. GET /api/v1/listings
**Liste des annonces avec pagination**

**Query params:**
- `limit` (défaut: 20)
- `lastId` (pour pagination)

**URL:** `http://localhost:8000/api/v1/listings?limit=10`

**Réponse:** 200 OK
```json
{
  "data": [
    {
      "id": 1,
      "title": "Appartement 3 pièces Cocody",
      "description": "Bel appartement meublé...",
      "price": 150000,
      "currency": "XOF",
      "category": "immobilier",
      "type": "location",
      "city": "Abidjan",
      "status": "active",
      "viewsCount": 45,
      "createdAt": "2025-11-02T14:20:00+01:00"
    }
  ],
  "hasMore": true,
  "lastId": 1
}
```

---

### 5. GET /api/v1/listings/{id}
**Détail d'une annonce**

**URL:** `http://localhost:8000/api/v1/listings/1`

**Réponse:** 200 OK
```json
{
  "id": 1,
  "title": "Appartement 3 pièces Cocody",
  "description": "Bel appartement meublé avec climatisation...",
  "price": 150000,
  "currency": "XOF",
  "category": "immobilier",
  "subcategory": "appartement",
  "type": "location",
  "country": "CI",
  "city": "Abidjan",
  "address": "Cocody, Riviera 3",
  "status": "active",
  "specifications": {
    "chambres": 3,
    "superficie": "100m²"
  },
  "viewsCount": 45,
  "contactsCount": 12,
  "isFeatured": false,
  "createdAt": "2025-11-02T14:20:00+01:00",
  "expiresAt": "2025-12-02T14:20:00+01:00",
  "user": {
    "id": 2,
    "fullName": "Jean Kouassi",
    "accountType": "PRO"
  },
  "images": [
    {
      "id": 1,
      "url": "https://...",
      "thumbnailUrl": "https://..."
    }
  ]
}
```

---

### 6. POST /api/v1/listings
**Créer une annonce** 🔒 Authentifié

**Body:**
```json
{
  "title": "Toyota Corolla 2020",
  "description": "Véhicule en excellent état, première main...",
  "price": 8500000,
  "currency": "XOF",
  "category": "vehicules",
  "subcategory": "voiture",
  "type": "vente",
  "city": "Abidjan",
  "address": "Yopougon, près du marché",
  "specifications": {
    "marque": "Toyota",
    "modele": "Corolla",
    "annee": 2020,
    "kilometrage": "45000 km"
  }
}
```

**Réponse:** 201 Created

---

### 7. PUT /api/v1/listings/{id}
**Modifier une annonce** 🔒 Authentifié

**Body:** (mêmes champs que POST)

**Réponse:** 200 OK

---

### 8. DELETE /api/v1/listings/{id}
**Supprimer une annonce** 🔒 Authentifié

**Réponse:** 200 OK
```json
{
  "message": "Annonce supprimée avec succès"
}
```

---

## 👤 GESTION UTILISATEUR (5 endpoints)

### 9. PUT /api/v1/users/profile
**Modifier son profil** 🔒 Authentifié

**Body:**
```json
{
  "firstName": "Marie",
  "lastName": "Diallo",
  "phone": "+22507888999",
  "city": "Bouaké",
  "profilePicture": "https://..."
}
```

**Réponse:** 200 OK

---

### 10. PUT /api/v1/users/password
**Changer son mot de passe** 🔒 Authentifié

**Body:**
```json
{
  "currentPassword": "AncienPassword123!",
  "newPassword": "NouveauPassword123!"
}
```

**Réponse:** 200 OK
```json
{
  "message": "Mot de passe modifié avec succès"
}
```

---

### 11. GET /api/v1/users/stats
**Ses statistiques** 🔒 Authentifié

**Réponse:** 200 OK
```json
{
  "stats": {
    "totalListings": 12,
    "activeListings": 8,
    "totalViews": 450,
    "totalContacts": 23,
    "accountType": "PRO",
    "isPro": true,
    "memberSince": "2025-10-15",
    "subscriptionExpiresAt": "2025-12-15 10:30:00"
  }
}
```

---

### 12. GET /api/v1/users/my-listings
**Liste de ses annonces** 🔒 Authentifié

**Query params:**
- `status` (active, draft, expired, sold)
- `limit` (défaut: 20)

**URL:** `http://localhost:8000/api/v1/users/my-listings?status=active`

**Réponse:** 200 OK
```json
{
  "listings": [...],
  "total": 8
}
```

---

### 13. DELETE /api/v1/users/account
**Supprimer son compte** 🔒 Authentifié

**Body:**
```json
{
  "password": "MonPassword123!"
}
```

**Réponse:** 200 OK
```json
{
  "message": "Compte supprimé avec succès"
}
```

---

## 🔍 RECHERCHE AVANCÉE (5 endpoints)

### 14. GET /api/v1/search
**Recherche avancée d'annonces**

**Query params:**
- `q` - Mot-clé
- `category` - Catégorie
- `type` - Type (vente, location, recherche)
- `country` - Pays (CI, BJ, SN, ML)
- `city` - Ville
- `minPrice` - Prix minimum
- `maxPrice` - Prix maximum
- `currency` - Devise (XOF)
- `sortBy` - Tri (recent, price_asc, price_desc, popular)
- `limit` - Limite (20)
- `offset` - Offset (0)

**URL:** 
```
http://localhost:8000/api/v1/search?q=appartement&city=Abidjan&minPrice=50000&maxPrice=200000&sortBy=price_asc
```

**Réponse:** 200 OK
```json
{
  "results": [
    {
      "id": 5,
      "title": "Studio meublé Cocody",
      "description": "Petit studio...",
      "price": 75000,
      "currency": "XOF",
      "category": "immobilier",
      "city": "Abidjan",
      "isFeatured": false,
      "viewsCount": 23,
      "mainImage": "https://...",
      "imagesCount": 3
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

---

### 15. GET /api/v1/search/categories
**Catégories avec compteurs**

**Réponse:** 200 OK
```json
{
  "categories": [
    {"name": "vehicules", "count": 234},
    {"name": "immobilier", "count": 189},
    {"name": "electronique", "count": 156},
    {"name": "mode", "count": 98}
  ]
}
```

---

### 16. GET /api/v1/search/cities
**Villes populaires avec compteurs**

**Query params:**
- `country` (optionnel)

**URL:** `http://localhost:8000/api/v1/search/cities?country=CI`

**Réponse:** 200 OK
```json
{
  "cities": [
    {"name": "Abidjan", "count": 567},
    {"name": "Bouaké", "count": 123},
    {"name": "Yamoussoukro", "count": 89}
  ]
}
```

---

### 17. GET /api/v1/search/suggestions
**Suggestions autocomplete**

**Query params:**
- `q` - Mot-clé (min 2 caractères)

**URL:** `http://localhost:8000/api/v1/search/suggestions?q=toy`

**Réponse:** 200 OK
```json
{
  "suggestions": [
    "Toyota Corolla 2020",
    "Toyota Yaris 2019",
    "Toyota Hilux 4x4 2021"
  ]
}
```

---

### 18. GET /api/v1/search/stats
**Statistiques de recherche**

**Réponse:** 200 OK
```json
{
  "stats": {
    "totalActive": 1234,
    "byType": [
      {"type": "vente", "count": 890},
      {"type": "location", "count": 244},
      {"type": "recherche", "count": 100}
    ],
    "byCountry": [
      {"country": "CI", "count": 567},
      {"country": "BJ", "count": 345}
    ]
  }
}
```

---

## 💳 PAIEMENTS (5 endpoints)

### 19. POST /api/v1/payments/create-subscription
**Créer paiement abonnement PRO** 🔒 Authentifié

**Body:**
```json
{
  "duration": 30
}
```

**Options duration:**
- `30` jours = 5000 XOF
- `90` jours = 12000 XOF

**Réponse:** 201 Created
```json
{
  "payment": {
    "id": 1,
    "amount": 5000,
    "currency": "XOF",
    "duration": 30,
    "status": "pending",
    "fedapay_url": "https://checkout.fedapay.com/..."
  },
  "message": "Paiement créé. Redirigez l'utilisateur vers fedapay_url"
}
```

**Action:** Rediriger l'utilisateur vers `fedapay_url` pour payer

---

### 20. POST /api/v1/payments/boost-listing
**Booster une annonce (7 jours)** 🔒 Authentifié

**Body:**
```json
{
  "listing_id": 5
}
```

**Prix:** 1000 XOF

**Réponse:** 201 Created (même format que create-subscription)

---

### 21. POST /api/v1/payments/callback
**Webhook Fedapay** (appelé automatiquement)

Endpoint appelé automatiquement par Fedapay après un paiement.

**Action automatique:**
- Active l'abonnement PRO si paiement approuvé
- Active le boost de l'annonce
- Met à jour le statut du paiement

---

### 22. GET /api/v1/payments/{id}/status
**Vérifier statut d'un paiement** 🔒 Authentifié

**URL:** `http://localhost:8000/api/v1/payments/1/status`

**Réponse:** 200 OK
```json
{
  "payment": {
    "id": 1,
    "amount": 5000,
    "currency": "XOF",
    "status": "completed",
    "description": "Abonnement PRO 30 jours",
    "createdAt": "2025-11-03T10:15:00+01:00",
    "completedAt": "2025-11-03T10:16:30+01:00"
  }
}
```

**Statuts possibles:**
- `pending` - En attente de paiement
- `completed` - Paiement réussi
- `failed` - Paiement échoué

---

### 23. GET /api/v1/payments/history
**Historique de ses paiements** 🔒 Authentifié

**Réponse:** 200 OK
```json
{
  "payments": [
    {
      "id": 1,
      "amount": 5000,
      "currency": "XOF",
      "status": "completed",
      "description": "Abonnement PRO 30 jours",
      "createdAt": "2025-11-03T10:15:00+01:00",
      "completedAt": "2025-11-03T10:16:30+01:00"
    },
    {
      "id": 2,
      "amount": 1000,
      "currency": "XOF",
      "status": "completed",
      "description": "Boost annonce #5",
      "createdAt": "2025-11-02T15:20:00+01:00",
      "completedAt": "2025-11-02T15:21:15+01:00"
    }
  ]
}
```

---

## 📊 RÉCAPITULATIF

### Par contrôleur

| Contrôleur | Public | Authentifié | Total |
|------------|--------|-------------|-------|
| AuthController | 2 | 1 | **3** |
| ListingController | 2 | 3 | **5** |
| UserController | 0 | 5 | **5** |
| SearchController | 5 | 0 | **5** |
| PaymentController | 1 | 4 | **5** |
| **TOTAL** | **10** | **13** | **23** |

### Par fonctionnalité

- 🔐 **Authentification** : 3 endpoints
- 📝 **Annonces** : 5 endpoints
- 👤 **Profil utilisateur** : 5 endpoints
- 🔍 **Recherche** : 5 endpoints
- 💳 **Paiements** : 5 endpoints

**TOTAL : 23 endpoints ✅**

---

## 🔑 AUTHENTIFICATION

Pour les endpoints marqués 🔒, ajoutez ce header :

```
Authorization: Bearer VOTRE_TOKEN_JWT
```

**Obtenir un token :**
1. POST /api/v1/auth/register (inscription)
2. POST /api/v1/auth/login (connexion)
3. Copier le token reçu
4. L'utiliser dans le header `Authorization`

---

## 🌐 BASE URL

**Développement :** `http://localhost:8000`  
**Production :** `https://votre-domaine.com`

---

## 📱 CODES HTTP

| Code | Signification |
|------|---------------|
| 200 | Succès (GET, PUT, DELETE) |
| 201 | Créé (POST) |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Non trouvé |
| 500 | Erreur serveur |

---

## 🧪 TESTER AVEC POSTMAN

1. Créer une collection "Plan B API"
2. Ajouter variable `base_url` = `http://localhost:8000`
3. Ajouter variable `token` (après login)
4. Pour chaque endpoint authentifié, ajouter header :
   ```
   Authorization: Bearer {{token}}
   ```

---

## 📚 EXEMPLES COMPLETS

### Scénario 1 : Inscription et création d'annonce

```bash
# 1. Inscription
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "phone": "+22507123456",
    "firstName": "Jean",
    "lastName": "Kouadio",
    "country": "CI",
    "city": "Abidjan"
  }'

# 2. Connexion
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "Password123!"
  }'

# Copier le token reçu

# 3. Créer une annonce
curl -X POST http://localhost:8000/api/v1/listings \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Appartement 2 pièces",
    "description": "Bel appartement...",
    "price": 120000,
    "currency": "XOF",
    "category": "immobilier",
    "type": "location",
    "city": "Abidjan"
  }'
```

### Scénario 2 : Recherche et achat abonnement PRO

```bash
# 1. Rechercher des annonces
curl "http://localhost:8000/api/v1/search?q=voiture&category=vehicules&city=Abidjan"

# 2. Acheter abonnement PRO
curl -X POST http://localhost:8000/api/v1/payments/create-subscription \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"duration": 30}'

# 3. Vérifier statut paiement
curl http://localhost:8000/api/v1/payments/1/status \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

**🎉 Tous les endpoints documentés ! Bonne utilisation ! 🚀**

---

*Document créé le 3 novembre 2025*
