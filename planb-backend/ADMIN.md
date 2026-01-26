# 👨‍💼 PANEL ADMIN - DOCUMENTATION COMPLÈTE

**Plan B Backend - Administration**

---

## 🎯 VUE D'ENSEMBLE

Le panel admin vous permet de **gérer entièrement la plateforme** :

- ✅ Voir statistiques globales (dashboard)
- ✅ Gérer tous les utilisateurs
- ✅ Modérer les annonces
- ✅ Voir les revenus totaux
- ✅ Donner PRO illimité
- ✅ Exporter les données

**🔐 Sécurité :** Tous les endpoints nécessitent `ROLE_ADMIN`

---

## 🚀 DÉMARRAGE

### 1️⃣ Créer votre compte admin

```bash
php bin/console app:create-admin admin@planb.com VotreMotDePasse123! +22507123456
```

**Résultat :**
```
✅ Administrateur créé avec succès !

Email         : admin@planb.com
Téléphone     : +22507123456
Rôles         : ROLE_USER, ROLE_ADMIN
Compte        : PRO (illimité)
```

---

### 2️⃣ Se connecter

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@planb.com",
    "password": "VotreMotDePasse123!"
  }'
```

**Réponse :**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@planb.com",
    "roles": ["ROLE_USER", "ROLE_ADMIN"],
    "accountType": "PRO",
    "isLifetimePro": true
  }
}
```

**💡 Sauvegardez le token JWT !**

---

## 📡 ENDPOINTS ADMIN (10)

### 1. Dashboard - Statistiques globales

```
GET /api/v1/admin/dashboard
```

**Headers :**
```
Authorization: Bearer VOTRE_TOKEN_ADMIN
```

**Réponse :**
```json
{
  "dashboard": {
    "users": {
      "total": 156,
      "free": 134,
      "pro": 22,
      "newThisMonth": 45
    },
    "listings": {
      "total": 567,
      "active": 423,
      "draft": 89,
      "expired": 55,
      "newThisMonth": 123
    },
    "payments": {
      "total": 78,
      "completed": 65,
      "pending": 13
    },
    "revenue": {
      "total": 325000,
      "currency": "XOF"
    }
  }
}
```

---

### 2. Liste tous les utilisateurs

```
GET /api/v1/admin/users?limit=50&offset=0&accountType=PRO&search=email
```

**Paramètres :**
- `limit` : Nombre de résultats (max 100)
- `offset` : Pagination
- `accountType` : FREE ou PRO (optionnel)
- `search` : Chercher par email ou téléphone (optionnel)

**Réponse :**
```json
{
  "users": [
    {
      "id": 5,
      "email": "user@example.com",
      "phone": "+22507123456",
      "fullName": "Jean Kouassi",
      "accountType": "PRO",
      "isLifetimePro": false,
      "country": "CI",
      "city": "Abidjan",
      "subscriptionExpiresAt": "2025-12-03T00:00:00+00:00",
      "createdAt": "2025-10-01T10:00:00+00:00",
      "totalListings": 12,
      "totalPayments": 3
    }
  ],
  "total": 156,
  "limit": 50,
  "offset": 0
}
```

---

### 3. Détail d'un utilisateur

```
GET /api/v1/admin/users/{id}
```

**Réponse :**
```json
{
  "user": {
    "id": 5,
    "email": "user@example.com",
    "phone": "+22507123456",
    "firstName": "Jean",
    "lastName": "Kouassi",
    "fullName": "Jean Kouassi",
    "accountType": "PRO",
    "isLifetimePro": false,
    "country": "CI",
    "city": "Abidjan",
    "profilePicture": "https://...",
    "isEmailVerified": true,
    "isPhoneVerified": true,
    "subscriptionExpiresAt": "2025-12-03T00:00:00+00:00",
    "createdAt": "2025-10-01T10:00:00+00:00",
    "updatedAt": "2025-11-01T15:30:00+00:00"
  },
  "stats": {
    "totalListings": 12,
    "activeListings": 8,
    "totalPayments": 3,
    "completedPayments": 3,
    "totalRevenue": 15000,
    "currency": "XOF"
  }
}
```

---

### 4. Mettre un utilisateur en PRO illimité

```
PUT /api/v1/admin/users/{id}/lifetime-pro
```

**Cas d'usage :**
- Partenaires VIP
- Staff de la plateforme
- Compte de test
- Récompenses

**Réponse :**
```json
{
  "message": "Utilisateur mis en PRO illimité",
  "user": {
    "id": 5,
    "email": "vip@example.com",
    "accountType": "PRO",
    "isLifetimePro": true,
    "subscriptionExpiresAt": null
  }
}
```

**💡 Cet utilisateur restera PRO pour toujours, même sans paiement !**

---

### 5. Retirer le PRO illimité

```
PUT /api/v1/admin/users/{id}/remove-lifetime-pro
```

**Réponse :**
```json
{
  "message": "PRO illimité retiré",
  "user": {
    "id": 5,
    "email": "user@example.com",
    "accountType": "FREE",
    "isLifetimePro": false
  }
}
```

---

### 6. Liste toutes les annonces

```
GET /api/v1/admin/listings?limit=50&status=active&category=Immobilier
```

**Paramètres :**
- `limit` : Nombre de résultats (max 100)
- `offset` : Pagination
- `status` : draft, active, expired, sold (optionnel)
- `category` : Filtrer par catégorie (optionnel)

**Réponse :**
```json
{
  "listings": [
    {
      "id": 123,
      "title": "Appartement 3 pièces à Cocody",
      "price": 150000,
      "currency": "XOF",
      "category": "Immobilier",
      "type": "vente",
      "status": "active",
      "city": "Abidjan",
      "country": "CI",
      "isFeatured": true,
      "viewsCount": 234,
      "contactsCount": 12,
      "createdAt": "2025-11-01T10:00:00+00:00",
      "expiresAt": "2025-12-01T10:00:00+00:00",
      "user": {
        "id": 5,
        "email": "user@example.com",
        "accountType": "PRO"
      }
    }
  ],
  "total": 567,
  "limit": 50,
  "offset": 0
}
```

---

### 7. Supprimer une annonce (modération)

```
DELETE /api/v1/admin/listings/{id}
```

**Cas d'usage :**
- Contenu inapproprié
- Spam
- Arnaques
- Violations des règles

**Réponse :**
```json
{
  "message": "Annonce supprimée avec succès"
}
```

**⚠️ Suppression définitive (avec images en cascade)**

---

### 8. Revenus totaux

```
GET /api/v1/admin/revenues
```

**Réponse :**
```json
{
  "revenues": {
    "total": 325000,
    "currency": "XOF",
    "byType": [
      {
        "type": "subscription",
        "amount": 245000,
        "count": 49
      },
      {
        "type": "boost",
        "amount": 80000,
        "count": 80
      }
    ]
  }
}
```

---

### 9. Revenus par mois

```
GET /api/v1/admin/revenues/monthly
```

**Réponse :**
```json
{
  "revenues": {
    "monthly": [
      {
        "month": "2025-10",
        "amount": 125000,
        "count": 25
      },
      {
        "month": "2025-11",
        "amount": 200000,
        "count": 40
      }
    ],
    "currency": "XOF"
  }
}
```

---

### 10. Statistiques de croissance

```
GET /api/v1/admin/stats/growth
```

**Réponse :**
```json
{
  "growth": {
    "usersByDay": [
      {
        "date": "2025-11-01",
        "count": 5
      },
      {
        "date": "2025-11-02",
        "count": 8
      }
    ],
    "listingsByDay": [
      {
        "date": "2025-11-01",
        "count": 15
      },
      {
        "date": "2025-11-02",
        "count": 23
      }
    ]
  }
}
```

---

## 🔄 EXPIRATION AUTOMATIQUE DES ABONNEMENTS

### Système automatique en temps réel

**Fonctionnement :**
- À chaque requête d'un utilisateur PRO
- Vérifie si son abonnement a expiré
- Si oui → Repasse automatiquement en FREE

**Avantages :**
- ✅ Pas besoin de CRON
- ✅ Temps réel
- ✅ Transparent pour l'utilisateur

---

### Commande CRON (production)

Pour un traitement par batch (recommandé en production) :

```bash
# Exécuter manuellement
php bin/console app:expire-subscriptions

# Résultat
3 abonnement(s) PRO expiré(s) trouvé(s)
 - user1@example.com : PRO → FREE
 - user2@example.com : PRO → FREE
 - user3@example.com : PRO → FREE
✅ 3 utilisateur(s) repassé(s) en FREE avec succès !
```

**Configuration CRON (tous les jours à minuit) :**
```cron
0 0 * * * cd /path/to/planb-backend && php bin/console app:expire-subscriptions
```

---

## 🛡️ SÉCURITÉ

### Protection multi-niveaux

#### 1. Rôle ROLE_ADMIN requis
```php
#[Route('/api/v1/admin')]
#[IsGranted('ROLE_ADMIN')]
class AdminController
```

#### 2. Vérification JWT
Tous les endpoints admin nécessitent un token JWT valide avec ROLE_ADMIN.

#### 3. Tentative d'accès non autorisée

**Si un utilisateur normal essaie :**
```bash
curl http://localhost:8000/api/v1/admin/dashboard \
  -H "Authorization: Bearer USER_TOKEN"
```

**Réponse :**
```json
{
  "error": "Access Denied"
}
```
**Code HTTP : 403 Forbidden**

---

## 📊 EXEMPLES D'UTILISATION

### Scénario 1 : Voir le dashboard

```powershell
# PowerShell
$token = "VOTRE_TOKEN_ADMIN"

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/admin/dashboard" `
    -Method GET -Headers $headers
```

---

### Scénario 2 : Chercher un utilisateur par email

```bash
curl "http://localhost:8000/api/v1/admin/users?search=jean@example.com" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### Scénario 3 : Mettre un partenaire en PRO illimité

```bash
# 1. Trouver l'utilisateur
curl "http://localhost:8000/api/v1/admin/users?search=partenaire@example.com" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 2. Mettre en PRO illimité (id = 15)
curl -X PUT "http://localhost:8000/api/v1/admin/users/15/lifetime-pro" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### Scénario 4 : Modérer une annonce frauduleuse

```bash
# Supprimer l'annonce #123
curl -X DELETE "http://localhost:8000/api/v1/admin/listings/123" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🔐 GESTION DES ADMINS

### Promouvoir un utilisateur existant en admin

```bash
php bin/console app:create-admin existing@example.com Password123!

# Si l'email existe déjà, il sera promu en admin
✅ Utilisateur existing@example.com promu en administrateur !
```

---

### Vérifier les rôles d'un utilisateur

```sql
-- Via Adminer (http://localhost:8080)
SELECT id, email, roles, account_type, is_lifetime_pro 
FROM users 
WHERE email = 'admin@planb.com';
```

**Résultat :**
```
id  | email            | roles                      | account_type | is_lifetime_pro
1   | admin@planb.com  | ["ROLE_USER","ROLE_ADMIN"] | PRO          | true
```

---

## 💡 BONNES PRATIQUES

### 1. Ne créez qu'un seul admin
Un seul compte admin suffit. Vous pouvez en créer d'autres si nécessaire.

### 2. Mot de passe fort
Utilisez un mot de passe complexe (12+ caractères, majuscules, chiffres, symboles).

### 3. Sauvegardez le token
Le token JWT expire après 1h. Reconnectez-vous pour en obtenir un nouveau.

### 4. PRO illimité avec parcimonie
N'utilisez le PRO illimité que pour :
- Partenaires VIP
- Staff interne
- Comptes de test

### 5. Logs de modération
Gardez une trace de vos actions de modération.

---

## 🎯 DIFFÉRENCE ADMIN vs UTILISATEUR

| Fonctionnalité | Utilisateur normal | Admin |
|----------------|-------------------|-------|
| Voir ses annonces | ✅ | ✅ |
| Créer annonces | ✅ | ✅ |
| Voir TOUTES les annonces | ❌ | ✅ |
| Supprimer ses annonces | ✅ | ✅ |
| Supprimer N'IMPORTE QUELLE annonce | ❌ | ✅ |
| Voir son profil | ✅ | ✅ |
| Voir TOUS les utilisateurs | ❌ | ✅ |
| Mettre PRO illimité | ❌ | ✅ |
| Voir revenus totaux | ❌ | ✅ |
| Dashboard statistiques | ❌ | ✅ |

---

## 📈 MÉTRIQUES IMPORTANTES

### Surveiller régulièrement :

1. **Taux de conversion FREE → PRO**
   - Total users / PRO users
   - Objectif : > 10%

2. **Revenus mensuels**
   - Tendance croissante ?
   - Pic lors des promotions

3. **Nouvelles inscriptions**
   - Croissance régulière
   - Sources de trafic

4. **Annonces actives**
   - Ratio annonces/utilisateurs
   - Qualité du contenu

---

## 🚀 PROCHAINES FONCTIONNALITÉS (Optionnel)

### Phase 3 possible :

- [ ] Bannir/débannir utilisateurs
- [ ] Envoyer notifications
- [ ] Statistiques avancées (graphiques)
- [ ] Export Excel/CSV
- [ ] Logs d'activité admin
- [ ] Dashboard visuel (React Admin)

---

## ✅ RÉCAPITULATIF

### Vous pouvez maintenant :

✅ Créer des administrateurs  
✅ Voir statistiques globales  
✅ Gérer tous les utilisateurs  
✅ Donner PRO illimité  
✅ Modérer les annonces  
✅ Voir les revenus totaux  
✅ Analyser la croissance  
✅ Expiration auto des abonnements

---

**🎉 VOTRE BACKEND EST MAINTENANT 100% COMPLET AVEC PANEL ADMIN ! 🎉**

*Document créé le 3 novembre 2025*
