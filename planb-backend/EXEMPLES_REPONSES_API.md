# 📝 Exemples de réponses API - Paiements Wave & Orange Money

Ce document présente des exemples de réponses pour chaque endpoint de l'API de paiement.

---

## 🔐 Authentification

### POST `/api/v1/auth/login`

**Request:**
```json
{
  "email": "client@test.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "client@test.com",
    "firstName": "John",
    "lastName": "Doe",
    "accountType": "FREE"
  }
}
```

---

## 💳 Création de commandes

### POST `/api/v1/orders/create` - Wave

**Request:**
```json
{
  "provider_id": 2,
  "amount": 10000,
  "payment_method": "wave",
  "description": "Service de développement web"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "order_id": 42,
  "payment_method": "wave",
  "payment_link": "https://wave.com/checkout/sess_abc123def456",
  "session_id": "sess_abc123def456"
}
```

**Response Error - Sans clés API (500):**
```json
{
  "error": "Impossible de générer le lien de paiement",
  "details": {
    "response": {
      "error": "Unauthorized",
      "message": "Invalid API key"
    }
  }
}
```

**Response Error - Montant invalide (400):**
```json
{
  "error": "Le montant minimum est de 100 XOF"
}
```

**Response Error - Paramètres manquants (400):**
```json
{
  "error": "Paramètres manquants",
  "required": ["provider_id", "amount", "payment_method"]
}
```

---

### POST `/api/v1/orders/create` - Orange Money

**Request:**
```json
{
  "provider_id": 2,
  "amount": 5000,
  "payment_method": "orange_money",
  "description": "Consultation design"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "order_id": 43,
  "payment_method": "orange_money",
  "payment_url": "https://maxit.orange.sn/pay/tk_xyz789",
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "payment_token": "tk_xyz789abc",
  "validity_minutes": 15
}
```

**Response Error - Token OAuth2 (500):**
```json
{
  "error": "Impossible d'obtenir le token Orange Money",
  "details": {
    "message": "Invalid client credentials"
  }
}
```

---

## 📊 Statut et historique

### GET `/api/v1/orders/{orderId}/status`

**Response - Commande en attente (200):**
```json
{
  "order": {
    "id": 42,
    "amount": "10000.00",
    "status": "pending",
    "payment_method": "wave",
    "description": "Service de développement web",
    "client": {
      "id": 1,
      "name": "John Doe"
    },
    "provider": {
      "id": 2,
      "name": "Jane Smith"
    },
    "created_at": "2024-11-16T10:30:00+00:00",
    "api_status": null,
    "transaction_id": null
  }
}
```

**Response - Commande complétée (200):**
```json
{
  "order": {
    "id": 42,
    "amount": "10000.00",
    "status": "completed",
    "payment_method": "wave",
    "description": "Service de développement web",
    "client": {
      "id": 1,
      "name": "John Doe"
    },
    "provider": {
      "id": 2,
      "name": "Jane Smith"
    },
    "created_at": "2024-11-16T10:30:00+00:00",
    "api_status": "success",
    "transaction_id": "tx_wave_abc123"
  }
}
```

**Response Error - Commande non trouvée (404):**
```json
{
  "error": "Commande non trouvée"
}
```

**Response Error - Accès non autorisé (403):**
```json
{
  "error": "Accès non autorisé"
}
```

---

### GET `/api/v1/orders/history?type=all`

**Response (200):**
```json
{
  "orders": [
    {
      "id": 43,
      "amount": "5000.00",
      "status": "completed",
      "payment_method": "orange_money",
      "description": "Consultation design",
      "role": "client",
      "other_party": {
        "id": 2,
        "name": "Jane Smith"
      },
      "created_at": "2024-11-16T14:30:00+00:00"
    },
    {
      "id": 42,
      "amount": "10000.00",
      "status": "completed",
      "payment_method": "wave",
      "description": "Service de développement web",
      "role": "client",
      "other_party": {
        "id": 2,
        "name": "Jane Smith"
      },
      "created_at": "2024-11-16T10:30:00+00:00"
    },
    {
      "id": 41,
      "amount": "15000.00",
      "status": "pending",
      "payment_method": "wave",
      "description": "Formation React",
      "role": "provider",
      "other_party": {
        "id": 3,
        "name": "Bob Martin"
      },
      "created_at": "2024-11-15T16:00:00+00:00"
    }
  ],
  "total": 3
}
```

---

### GET `/api/v1/orders/history?type=client`

**Response (200):**
```json
{
  "orders": [
    {
      "id": 43,
      "amount": "5000.00",
      "status": "completed",
      "payment_method": "orange_money",
      "description": "Consultation design",
      "role": "client",
      "other_party": {
        "id": 2,
        "name": "Jane Smith"
      },
      "created_at": "2024-11-16T14:30:00+00:00"
    },
    {
      "id": 42,
      "amount": "10000.00",
      "status": "completed",
      "payment_method": "wave",
      "description": "Service de développement web",
      "role": "client",
      "other_party": {
        "id": 2,
        "name": "Jane Smith"
      },
      "created_at": "2024-11-16T10:30:00+00:00"
    }
  ],
  "total": 2
}
```

---

### GET `/api/v1/orders/history?type=provider`

**Response (200):**
```json
{
  "orders": [
    {
      "id": 41,
      "amount": "15000.00",
      "status": "pending",
      "payment_method": "wave",
      "description": "Formation React",
      "role": "provider",
      "other_party": {
        "id": 3,
        "name": "Bob Martin"
      },
      "created_at": "2024-11-15T16:00:00+00:00"
    }
  ],
  "total": 1
}
```

---

## 🔄 Callbacks (retours après paiement)

### GET `/api/v1/orders/wave/callback/{orderId}`

**Response Success (200):**
```json
{
  "success": true,
  "order_id": 42,
  "status": "completed"
}
```

**Response - En attente (200):**
```json
{
  "success": true,
  "order_id": 42,
  "status": "pending"
}
```

**Response Error (404):**
```json
{
  "error": "Commande non trouvée"
}
```

---

### GET `/api/v1/orders/orange-money/callback/{orderId}`

**Response Success (200):**
```json
{
  "success": true,
  "order_id": 43,
  "status": "completed"
}
```

**Response - En attente (200):**
```json
{
  "success": true,
  "order_id": 43,
  "status": "pending"
}
```

---

## 📋 Logs générés

### Création de commande - Log INFO

```
[2024-11-16 10:30:15] app.INFO: Order created {
  "order_id": 42,
  "client_id": 1,
  "provider_id": 2,
  "amount": 10000,
  "payment_method": "wave"
}
```

### Génération lien Wave - Log INFO

```
[2024-11-16 10:30:16] app.INFO: Wave API Response {
  "code": 200,
  "response": {
    "id": "sess_abc123",
    "wave_launch_url": "https://wave.com/checkout/sess_abc123"
  },
  "order_id": 42
}
```

### Callback reçu - Log INFO

```
[2024-11-16 10:35:22] app.INFO: Wave callback received {
  "order_id": 42,
  "params": {
    "status": "success",
    "transaction_id": "tx_wave_abc123"
  },
  "method": "GET"
}
```

### Opérations créées - Log INFO

```
[2024-11-16 10:35:23] app.INFO: Operations created {
  "order_id": 42,
  "client_operation_id": 101,
  "provider_operation_id": 102
}
```

### Erreur API - Log ERROR

```
[2024-11-16 10:30:16] app.ERROR: Wave cURL error {
  "error": "Could not resolve host: api.wave.com"
}
```

---

## 🗃️ Structure en base de données

### Table `orders` - Exemple de ligne

```sql
id: 42
client_id: 1
provider_id: 2
amount: 10000.00
payment_method: 'wave'
wave_session_id: 'sess_abc123def456'
om_transaction_id: NULL
om_payment_token: NULL
api_status: 'success'
api_code: 'success'
api_transaction_id: 'tx_wave_abc123'
api_transaction_date: '2024-11-16 10:35:22'
status: true
description: 'Service de développement web'
metadata: '{"client_name":"John Doe","provider_name":"Jane Smith","created_via":"api"}'
created_at: '2024-11-16 10:30:15'
updated_at: '2024-11-16 10:35:23'
```

### Table `operations` - Exemple de lignes

**Opération client (sortie):**
```sql
id: 101
user_id: 1
provider_id: 2
order_id: 42
payment_method: 'wave'
sens: 'out'
amount: 10000.00
balance_before: 50000.00
balance_after: 40000.00
description: 'Paiement pour: Service de développement web'
created_at: '2024-11-16 10:35:23'
```

**Opération prestataire (entrée):**
```sql
id: 102
user_id: 2
provider_id: 1
order_id: 42
payment_method: 'wave'
sens: 'in'
amount: 10000.00
balance_before: 75000.00
balance_after: 85000.00
description: 'Paiement reçu: Service de développement web'
created_at: '2024-11-16 10:35:23'
```

---

## 🧪 Scénarios de test

### Scénario 1 : Paiement Wave réussi

```bash
# 1. Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@test.com","password":"password123"}'
# → Récupérer le token

# 2. Créer commande
curl -X POST http://localhost:8000/api/v1/orders/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provider_id":2,"amount":10000,"payment_method":"wave","description":"Test"}'
# → Récupérer order_id et payment_link

# 3. (L'utilisateur paie via Wave)

# 4. Vérifier statut
curl http://localhost:8000/api/v1/orders/42/status \
  -H "Authorization: Bearer TOKEN"
# → status: "completed"
```

### Scénario 2 : Historique des transactions

```bash
# Voir toutes mes commandes
curl http://localhost:8000/api/v1/orders/history?type=all \
  -H "Authorization: Bearer TOKEN"

# Voir uniquement mes paiements en tant que client
curl http://localhost:8000/api/v1/orders/history?type=client \
  -H "Authorization: Bearer TOKEN"

# Voir uniquement mes revenus en tant que prestataire
curl http://localhost:8000/api/v1/orders/history?type=provider \
  -H "Authorization: Bearer TOKEN"
```

---

## 💡 Codes de statut HTTP

| Code | Signification | Exemple |
|------|---------------|---------|
| 200 | Succès | Récupération de données |
| 201 | Créé | Commande créée avec succès |
| 400 | Mauvaise requête | Paramètres manquants ou invalides |
| 401 | Non autorisé | Token JWT manquant ou invalide |
| 403 | Interdit | Accès à une commande d'un autre utilisateur |
| 404 | Non trouvé | Commande ou utilisateur inexistant |
| 500 | Erreur serveur | Erreur API Wave/Orange Money |

---

## 📞 Support

Pour toute question sur les réponses API :
- Consulter les logs : `var/log/dev.log`
- Vérifier la configuration : `.env`
- Tester avec Postman : `POSTMAN_WAVE_ORANGE.json`

---

**Tous les exemples sont basés sur des cas réels d'utilisation de l'API.**
