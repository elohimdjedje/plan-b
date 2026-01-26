# Intégration des paiements Wave et Orange Money

## 📋 Table des matières
1. [Introduction](#introduction)
2. [Architecture](#architecture)
3. [Prérequis](#prérequis)
4. [Configuration](#configuration)
5. [Utilisation](#utilisation)
6. [Tests avec Postman](#tests-avec-postman)
7. [Flux de paiement](#flux-de-paiement)
8. [Sécurité](#sécurité)
9. [Dépannage](#dépannage)

---

## 🎯 Introduction

Cette intégration permet de gérer les paiements entre clients et prestataires via **Wave** et **Orange Money**. Le système agit comme intermédiaire sécurisé pour garantir que l'argent n'est débité que lorsque le service est validé.

**Documentation source :**
- [Partie 1 - Concepts](https://www.moussasagna.com/blog/integration-payment-partie-1)
- [Partie 2 - Wave](https://www.moussasagna.com/blog/integration-payment-partie-2)
- [Partie 3 - Orange Money](https://www.moussasagna.com/blog/integration-payment-partie-3)

---

## 🏗️ Architecture

### Entités créées

1. **Order** (`src/Entity/Order.php`)
   - Gère les commandes entre clients et prestataires
   - Stocke les informations de paiement (Wave/Orange Money)
   - Suit le statut de la transaction

2. **Operation** (`src/Entity/Operation.php`)
   - Traçabilité comptable de chaque mouvement
   - Enregistre les entrées et sorties d'argent
   - Calcule les soldes avant/après transaction

### Services

1. **WaveService** (`src/Service/WaveService.php`)
   - Génération de liens de paiement Wave
   - Vérification du statut des transactions
   - Gestion des webhooks

2. **OrangeMoneyService** (`src/Service/OrangeMoneyService.php`)
   - Génération de token OAuth2
   - Création de QR codes de paiement
   - Vérification du statut des paiements
   - Paiements directs (cash-out)

### Contrôleurs

1. **OrderController** (`src/Controller/OrderController.php`)
   - Création de commandes
   - Génération des liens de paiement
   - Gestion des callbacks
   - Historique des transactions

---

## 📦 Prérequis

### Pour Wave
1. Créer un compte **Wave Business** sur [developer.wave.com](https://developer.wave.com)
2. Obtenir :
   - `WAVE_API_KEY` : Clé API
   - `WAVE_AGGREGATED_MERCHANT_ID` : ID du marchand
   - `WAVE_WEBHOOK_SECRET` : Secret pour webhooks

### Pour Orange Money
1. Créer un compte développeur sur [developer.orange.com](https://developer.orange.com)
2. Obtenir :
   - `OM_CLIENT_ID` : Client ID OAuth2
   - `OM_CLIENT_SECRET` : Client Secret OAuth2
   - `OM_MERCHANT_CODE` : Code marchand

---

## ⚙️ Configuration

### 1. Variables d'environnement

Éditer le fichier `.env` :

```bash
# Wave
WAVE_API_KEY=votre_cle_api_wave
WAVE_AGGREGATED_MERCHANT_ID=votre_merchant_id
WAVE_ENVIRONMENT=sandbox  # ou 'live' en production
WAVE_WEBHOOK_SECRET=votre_secret_webhook

# Orange Money
OM_TOKEN_URL=https://api.orange-sonatel.com/oauth/v3/token
OM_CLIENT_ID=votre_client_id
OM_CLIENT_SECRET=votre_client_secret
OM_API_URL=https://api.orange-sonatel.com
OM_MERCHANT_CODE=votre_code_marchand

# URL de l'application
APP_URL=http://localhost:8000
```

### 2. Créer les migrations

```bash
# Créer la migration pour les nouvelles entités
php bin/console make:migration

# Exécuter la migration
php bin/console doctrine:migrations:migrate
```

### 3. Vérifier les services

Les services sont automatiquement injectés grâce à l'autowiring de Symfony. Aucune configuration supplémentaire n'est nécessaire.

---

## 💻 Utilisation

### Créer une commande avec paiement

#### Avec Wave

```http
POST /api/v1/orders/create
Authorization: Bearer {token_jwt}
Content-Type: application/json

{
  "provider_id": 2,
  "amount": 10000,
  "payment_method": "wave",
  "description": "Service de développement web"
}
```

**Réponse :**
```json
{
  "success": true,
  "order_id": 123,
  "payment_method": "wave",
  "payment_link": "https://wave.com/checkout/...",
  "session_id": "sess_abc123"
}
```

#### Avec Orange Money

```http
POST /api/v1/orders/create
Authorization: Bearer {token_jwt}
Content-Type: application/json

{
  "provider_id": 2,
  "amount": 10000,
  "payment_method": "orange_money",
  "description": "Service de développement web"
}
```

**Réponse :**
```json
{
  "success": true,
  "order_id": 123,
  "payment_method": "orange_money",
  "payment_url": "https://...",
  "qr_code": "data:image/png;base64,...",
  "payment_token": "tk_abc123",
  "validity_minutes": 15
}
```

### Vérifier le statut d'une commande

```http
GET /api/v1/orders/{orderId}/status
Authorization: Bearer {token_jwt}
```

**Réponse :**
```json
{
  "order": {
    "id": 123,
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
    "transaction_id": "tx_abc123"
  }
}
```

### Obtenir l'historique des commandes

```http
GET /api/v1/orders/history?type=all
Authorization: Bearer {token_jwt}
```

**Paramètres :**
- `type` : `all` (toutes), `client` (en tant que client), `provider` (en tant que prestataire)

---

## 🧪 Tests avec Postman

### 1. Créer une collection Postman

Créer un fichier `WAVE_ORANGE_TESTS.postman_collection.json` :

```json
{
  "info": {
    "name": "Plan B - Paiements Wave & Orange Money",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Créer commande Wave",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"provider_id\": 2,\n  \"amount\": 10000,\n  \"payment_method\": \"wave\",\n  \"description\": \"Test paiement Wave\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/v1/orders/create",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "orders", "create"]
        }
      }
    },
    {
      "name": "Créer commande Orange Money",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"provider_id\": 2,\n  \"amount\": 5000,\n  \"payment_method\": \"orange_money\",\n  \"description\": \"Test paiement Orange Money\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/v1/orders/create",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "orders", "create"]
        }
      }
    },
    {
      "name": "Statut commande",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/v1/orders/:orderId/status",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "orders", ":orderId", "status"],
          "variable": [
            {
              "key": "orderId",
              "value": "1"
            }
          ]
        }
      }
    },
    {
      "name": "Historique commandes",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/v1/orders/history?type=all",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "orders", "history"],
          "query": [
            {
              "key": "type",
              "value": "all"
            }
          ]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000"
    },
    {
      "key": "jwt_token",
      "value": "your_jwt_token_here"
    }
  ]
}
```

### 2. Variables d'environnement Postman

Créer les variables suivantes :
- `base_url` : `http://localhost:8000`
- `jwt_token` : Votre token JWT (obtenu après connexion)

---

## 🔄 Flux de paiement

### Flux Wave

```
1. Client → API : Créer commande
2. API → Wave : Générer session de paiement
3. Wave → API : Retourner wave_launch_url
4. API → Client : Retourner lien de paiement
5. Client → Wave : Effectuer paiement
6. Wave → API : Callback (success_url)
7. API → BDD : Mettre à jour commande
8. API → BDD : Créer opérations comptables
9. API → Client : Notification de succès
```

### Flux Orange Money

```
1. Client → API : Créer commande
2. API → Orange : Obtenir token OAuth2
3. API → Orange : Générer QR code
4. Orange → API : Retourner payment_url + QR
5. API → Client : Retourner lien/QR
6. Client → Orange : Scanner QR et payer
7. Orange → API : Callback
8. API → BDD : Mettre à jour commande
9. API → BDD : Créer opérations comptables
10. API → Client : Notification de succès
```

---

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais exposer les clés API**
   - Toujours utiliser des variables d'environnement
   - Ne jamais commiter le fichier `.env` dans Git
   - Utiliser `.env.local` en développement

2. **Valider les webhooks**
   - Vérifier la signature des webhooks Wave
   - Valider le token OAuth2 pour Orange Money

3. **Vérifier côté serveur**
   - Toujours re-vérifier le statut d'un paiement via l'API
   - Ne jamais faire confiance uniquement aux callbacks

4. **Logger les transactions**
   - Tous les appels API sont loggés
   - Permet l'audit et le débogage

5. **Sécuriser les callbacks**
   - Utiliser HTTPS en production
   - Valider l'origine des requêtes

---

## 🐛 Dépannage

### Wave

**Erreur : "Impossible de générer le lien de paiement"**
- Vérifier `WAVE_API_KEY` et `WAVE_AGGREGATED_MERCHANT_ID`
- S'assurer que le montant est >= 100 XOF
- Vérifier les logs : `var/log/dev.log`

**Callback non reçu**
- Vérifier que `APP_URL` est accessible depuis internet
- En développement, utiliser ngrok : `ngrok http 8000`
- Configurer l'URL de callback dans le dashboard Wave

### Orange Money

**Erreur : "Impossible d'obtenir le token"**
- Vérifier `OM_CLIENT_ID` et `OM_CLIENT_SECRET`
- S'assurer que les credentials sont valides
- Le token expire après 55 minutes

**QR Code expiré**
- Les QR codes sont valides 15 minutes
- Régénérer un nouveau QR si expiré

**Erreur de paiement**
- Vérifier que le compte Orange Money a suffisamment de fonds
- S'assurer que `OM_MERCHANT_CODE` est correct

---

## 📊 Base de données

### Table `orders`

| Colonne | Type | Description |
|---------|------|-------------|
| id | int | ID de la commande |
| client_id | int | ID du client |
| provider_id | int | ID du prestataire |
| amount | decimal(12,2) | Montant en XOF |
| payment_method | varchar(50) | wave, orange_money |
| wave_session_id | varchar(255) | ID session Wave |
| om_payment_token | varchar(255) | Token Orange Money |
| api_status | varchar(100) | Statut de l'API |
| status | boolean | Complété ou non |
| created_at | timestamp | Date de création |

### Table `operations`

| Colonne | Type | Description |
|---------|------|-------------|
| id | int | ID de l'opération |
| user_id | int | ID utilisateur |
| order_id | int | ID commande |
| sens | enum | 'in' ou 'out' |
| amount | decimal(12,2) | Montant |
| balance_before | decimal(12,2) | Solde avant |
| balance_after | decimal(12,2) | Solde après |
| created_at | timestamp | Date |

---

## 🚀 Mise en production

### Checklist

- [ ] Obtenir les clés API de production (Wave et Orange Money)
- [ ] Configurer `WAVE_ENVIRONMENT=live`
- [ ] Configurer les URLs de production dans `.env`
- [ ] Mettre en place HTTPS
- [ ] Configurer les webhooks dans les dashboards
- [ ] Tester les callbacks en production
- [ ] Mettre en place un monitoring des transactions
- [ ] Configurer les alertes email pour les erreurs

### Variables en production

```bash
WAVE_API_KEY=wave_ci_prod_VOTRE_CLE_PRODUCTION
WAVE_AGGREGATED_MERCHANT_ID=VOTRE_MERCHANT_ID_PROD
WAVE_ENVIRONMENT=live
WAVE_WEBHOOK_SECRET=VOTRE_SECRET_PROD

OM_CLIENT_ID=VOTRE_CLIENT_ID_PROD
OM_CLIENT_SECRET=VOTRE_SECRET_PROD
OM_API_URL=https://api.orange.com  # URL de production

APP_URL=https://votre-domaine.com
```

---

## 📞 Support

Pour toute question :
- Documentation Wave : [developer.wave.com](https://developer.wave.com)
- Documentation Orange Money : [developer.orange.com](https://developer.orange.com)
- Blog Moussa Sagna : [moussasagna.com/blog](https://www.moussasagna.com/blog)

---

## 📝 Changelog

### Version 1.0.0 (16/11/2024)
- Intégration complète Wave
- Intégration complète Orange Money
- Gestion des commandes entre clients et prestataires
- Traçabilité comptable avec les opérations
- Documentation complète
- Tests Postman

---

**Développé pour Plan B** | Basé sur la documentation de [Moussa Sagna](https://www.moussasagna.com)
