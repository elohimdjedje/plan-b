# 📡 API ENDPOINTS - Plan B

## Base URL
```
http://localhost:8000/api/v1
```

---

## 🆕 NOUVEAUX ENDPOINTS (Reviews)

### Créer un avis
```http
POST /reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "listingId": 123,
  "rating": 5,
  "comment": "Excellent service!",
  "reviewType": "vacation" // ou "transaction"
}
```

**Réponse:**
```json
{
  "message": "Avis ajouté avec succès",
  "review": {
    "id": 1,
    "rating": 5,
    "comment": "Excellent service!",
    "createdAt": "2024-11-27T15:30:00+00:00"
  }
}
```

---

### Obtenir les avis d'un vendeur
```http
GET /reviews/seller/{sellerId}?page=1&limit=10
```

**Réponse:**
```json
{
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Excellent!",
      "reviewType": "vacation",
      "isVerified": true,
      "createdAt": "2024-11-27T15:30:00+00:00",
      "reviewer": {
        "id": 10,
        "firstName": "Jean",
        "profilePicture": "..."
      },
      "listing": {
        "id": 123,
        "title": "Villa bord de mer",
        "category": "vacance",
        "subcategory": "hotel"
      }
    }
  ],
  "stats": {
    "averageRating": 4.5,
    "totalReviews": 42,
    "distribution": {
      "5": 25,
      "4": 10,
      "3": 5,
      "2": 1,
      "1": 1
    }
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42
  }
}
```

---

### Obtenir les avis d'une annonce
```http
GET /reviews/listing/{listingId}
```

**Réponse:**
```json
{
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Parfait!",
      "createdAt": "2024-11-27T15:30:00+00:00",
      "reviewer": {
        "id": 10,
        "firstName": "Jean",
        "profilePicture": "..."
      }
    }
  ],
  "averageRating": 4.8,
  "totalReviews": 12
}
```

---

### Supprimer un avis
```http
DELETE /reviews/{id}
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "message": "Avis supprimé avec succès"
}
```

---

## ✏️ ENDPOINT MODIFIÉ (Conversations)

### Démarrer une conversation
```http
POST /conversations/start/{listingId}
Authorization: Bearer {token} (OPTIONNEL maintenant)
```

**Réponse si NON connecté:**
```json
{
  "requiresAuth": false,
  "message": "Contactez le vendeur directement",
  "seller": {
    "id": 5,
    "firstName": "Marie",
    "phone": "+225...",
    "whatsappPhone": "+225...",
    "email": "marie@example.com"
  }
}
```

**Réponse si connecté:**
```json
{
  "requiresAuth": true,
  "message": "Conversation créée",
  "conversationId": 42
}
```

---

## 🔒 ENDPOINTS EXISTANTS (Inchangés)

### Authentification

```http
POST /auth/login
POST /auth/register
GET /auth/me
POST /auth/update-profile
```

### Annonces

```http
GET /listings?page=1&limit=20
GET /listings/{id}
POST /listings
PUT /listings/{id}
DELETE /listings/{id}
```

### Conversations

```http
GET /conversations
GET /conversations/{id}
POST /conversations/start/{listingId}
```

### Messages

```http
POST /messages
GET /messages/conversation/{conversationId}
```

### Favoris

```http
POST /favorites/{listingId}
DELETE /favorites/{listingId}
GET /favorites
```

---

## 🧪 EXEMPLES DE TEST (Postman/Insomnia)

### 1. Créer un avis sur une annonce

```javascript
// Request
POST http://localhost:8000/api/v1/reviews
Headers:
  Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
  Content-Type: application/json

Body:
{
  "listingId": 123,
  "rating": 5,
  "comment": "Excellent séjour dans cette villa!"
}

// Expected: 201 Created
```

---

### 2. Voir les avis d'un vendeur

```javascript
// Request
GET http://localhost:8000/api/v1/reviews/seller/5

// Expected: 200 OK avec liste des avis
```

---

### 3. Contacter un vendeur SANS être connecté

```javascript
// Request
POST http://localhost:8000/api/v1/conversations/start/123
// PAS de header Authorization

// Expected: 200 OK avec infos du vendeur
{
  "requiresAuth": false,
  "seller": {
    "firstName": "Jean",
    "phone": "+225...",
    "whatsappPhone": "+225...",
    "email": "jean@example.com"
  }
}
```

---

## ⚠️ CODES D'ERREUR

### 400 Bad Request
```json
{
  "error": "Le champ rating est requis"
}
```

### 401 Unauthorized
```json
{
  "error": "Non authentifié"
}
```

### 403 Forbidden
```json
{
  "error": "QUOTA_EXCEEDED",
  "message": "Vous avez atteint la limite de 4 annonces...",
  "currentListings": 4,
  "maxListings": 4
}
```

```json
{
  "error": "Vous avez déjà laissé un avis pour cette annonce"
}
```

### 404 Not Found
```json
{
  "error": "Annonce introuvable"
}
```

### 500 Internal Server Error
```json
{
  "error": "Erreur lors de la création de l'avis",
  "message": "..."
}
```

---

## 📊 STATISTIQUES D'UTILISATION

### Compteur de vues
Le compteur de vues est automatique:
- 1 utilisateur connecté = 1 vue unique
- 1 IP anonymisée = 1 vue unique (si non connecté)
- Le propriétaire ne compte pas
- Pas d'endpoint dédié, intégré dans `GET /listings/{id}`

---

## 🔐 AUTHENTIFICATION

Toutes les routes marquées `Authorization: Bearer {token}` nécessitent un JWT valide.

**Obtenir un token:**
```http
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": { ... }
}
```

**Utilisation:**
```http
GET /api/v1/listings
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

## 📝 NOTES

### Reviews
- Un utilisateur ne peut laisser qu'**1 avis par annonce**
- Les avis pour les hôtels/vacances sont automatiquement vérifiés
- Le commentaire est **facultatif**, la note est **obligatoire**

### Conversations
- Les utilisateurs **non connectés** peuvent maintenant obtenir les infos du vendeur
- Les conversations ne sont créées que pour les utilisateurs connectés

### Vues
- Le comptage est **unique** par utilisateur ou IP
- Les vues du propriétaire **ne comptent pas**
- Nettoyage automatique des vues > 90 jours

---

## 🛠️ DEBUGGING

### Logs Symfony
```bash
tail -f planb-backend/var/log/dev.log
```

### Tester avec curl
```bash
# Créer un avis
curl -X POST http://localhost:8000/api/v1/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"listingId":123,"rating":5,"comment":"Top!"}'

# Voir les avis d'un vendeur
curl http://localhost:8000/api/v1/reviews/seller/5
```

---

**Documentation complète des API disponibles. Pour plus de détails, consultez les contrôleurs Symfony.**
