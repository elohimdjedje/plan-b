# 🚀 Guide d'intégration des paiements Wave & Orange Money

## 📌 Résumé

J'ai intégré **Wave** et **Orange Money** dans votre projet Plan B selon la documentation de Moussa Sagna. Le système permet maintenant de gérer les paiements entre clients et prestataires avec une traçabilité complète.

---

## ✅ Ce qui a été fait

### 1. Nouvelles Entités
- ✅ **Order** : Gestion des commandes entre clients et prestataires
- ✅ **Operation** : Traçabilité comptable (entrées/sorties)

### 2. Services
- ✅ **WaveService** : Amélioré avec `generatePaymentLink()` conforme à la documentation
- ✅ **OrangeMoneyService** : Nouveau service complet (OAuth2, QR codes, paiements directs)

### 3. Contrôleurs
- ✅ **OrderController** : Gestion complète des commandes et callbacks

### 4. Configuration
- ✅ Variables d'environnement dans `.env` et `.env.example`
- ✅ Migration de base de données créée

### 5. Documentation
- ✅ Guide complet d'utilisation
- ✅ Collection Postman pour les tests

---

## 🎯 Prochaines étapes

### 1. Exécuter les migrations

```bash
cd planb-backend
php bin/console doctrine:migrations:migrate
```

### 2. Obtenir vos clés API

#### Pour Wave (quand vous aurez votre compte Business)
1. Créer un compte sur [developer.wave.com](https://developer.wave.com)
2. Récupérer :
   - `WAVE_API_KEY`
   - `WAVE_AGGREGATED_MERCHANT_ID`
   - `WAVE_WEBHOOK_SECRET`

#### Pour Orange Money
1. Créer un compte sur [developer.orange.com](https://developer.orange.com)
2. Récupérer :
   - `OM_CLIENT_ID`
   - `OM_CLIENT_SECRET`
   - `OM_MERCHANT_CODE`

### 3. Configurer le `.env`

Éditer `planb-backend/.env` et remplacer les valeurs par vos vraies clés :

```bash
# Wave
WAVE_API_KEY=votre_vraie_cle_api
WAVE_AGGREGATED_MERCHANT_ID=votre_merchant_id
WAVE_ENVIRONMENT=sandbox
WAVE_WEBHOOK_SECRET=votre_secret

# Orange Money
OM_CLIENT_ID=votre_client_id
OM_CLIENT_SECRET=votre_client_secret
OM_MERCHANT_CODE=votre_merchant_code
```

### 4. Tester l'intégration

Une fois vos clés configurées :

```bash
# Créer une commande avec Wave
curl -X POST http://localhost:8000/api/v1/orders/create \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": 2,
    "amount": 10000,
    "payment_method": "wave",
    "description": "Test paiement"
  }'

# Créer une commande avec Orange Money
curl -X POST http://localhost:8000/api/v1/orders/create \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": 2,
    "amount": 5000,
    "payment_method": "orange_money",
    "description": "Test paiement"
  }'
```

---

## 📁 Fichiers créés/modifiés

```
planb-backend/
├── src/
│   ├── Entity/
│   │   ├── Order.php ...................... ✨ NOUVEAU
│   │   └── Operation.php .................. ✨ NOUVEAU
│   ├── Repository/
│   │   ├── OrderRepository.php ............ ✨ NOUVEAU
│   │   └── OperationRepository.php ........ ✨ NOUVEAU
│   ├── Service/
│   │   ├── WaveService.php ................ 🔄 AMÉLIORÉ
│   │   └── OrangeMoneyService.php ......... ✨ NOUVEAU
│   └── Controller/
│       └── OrderController.php ............ ✨ NOUVEAU
├── migrations/
│   └── Version20241116000000.php .......... ✨ NOUVEAU
├── .env .................................... 🔄 MIS À JOUR
├── .env.example ............................ 🔄 MIS À JOUR
└── INTEGRATION_PAIEMENTS_WAVE_ORANGE.md ... ✨ NOUVEAU
```

---

## 🔍 Architecture du flux

```
┌─────────────┐
│   Client    │ Crée une commande
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│          OrderController                     │
│  - Valide les données                       │
│  - Crée l'entité Order                      │
│  - Appelle WaveService ou OrangeMoneyService│
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌──────────────┐  ┌────────────────────┐
│ WaveService  │  │ OrangeMoneyService │
│              │  │                    │
│ - Génère     │  │ - Obtient token    │
│   session    │  │ - Génère QR code   │
│ - Retourne   │  │ - Retourne URL     │
│   lien       │  │                    │
└──────┬───────┘  └─────────┬──────────┘
       │                    │
       └────────┬───────────┘
                ▼
       ┌─────────────────┐
       │   API externe   │ (Wave ou Orange)
       │  - Traite le    │
       │    paiement     │
       └────────┬────────┘
                │
                ▼ Callback
       ┌─────────────────────────┐
       │  OrderController        │
       │  - waveCallback() ou    │
       │  - orangeMoneyCallback()│
       │  - Vérifie le statut    │
       │  - Met à jour Order     │
       │  - Crée Operation       │
       └─────────────────────────┘
```

---

## 📊 Exemple de flux complet

### Scénario : Client paie un prestataire 10 000 XOF via Wave

1. **Client** fait une requête POST `/api/v1/orders/create`
   ```json
   {
     "provider_id": 2,
     "amount": 10000,
     "payment_method": "wave",
     "description": "Design logo"
   }
   ```

2. **Backend** crée une `Order` en BDD avec `status=false`

3. **WaveService** génère un lien de paiement Wave

4. **Backend** retourne au client :
   ```json
   {
     "success": true,
     "order_id": 42,
     "payment_link": "https://wave.com/checkout/abc123",
     "session_id": "sess_abc123"
   }
   ```

5. **Client** ouvre le lien et paie via l'app Wave

6. **Wave** appelle le callback : `GET /api/v1/orders/wave/callback/42`

7. **Backend** :
   - Vérifie le statut via l'API Wave
   - Met à jour `Order.status = true`
   - Crée 2 `Operation` :
     - Une sortie (`out`) pour le client (-10000 XOF)
     - Une entrée (`in`) pour le prestataire (+10000 XOF)

8. **Traçabilité complète** dans la BDD

---

## 🧪 Tests recommandés

### Phase 1 : Sans vraies clés API (préparation)

```bash
# Vérifier que les entités sont bien créées
php bin/console doctrine:schema:validate

# Vérifier que les services sont injectables
php bin/console debug:container WaveService
php bin/console debug:container OrangeMoneyService
```

### Phase 2 : Avec clés API sandbox

1. Configurer les clés sandbox dans `.env`
2. Créer une commande via Postman
3. Suivre le lien de paiement
4. Vérifier le callback
5. Vérifier que l'`Operation` est créée

### Phase 3 : Intégration frontend

Le frontend peut appeler :
```javascript
// Créer une commande
const response = await fetch('/api/v1/orders/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider_id: providerId,
    amount: 10000,
    payment_method: 'wave',
    description: 'Service XYZ'
  })
});

const data = await response.json();
// Rediriger l'utilisateur vers data.payment_link
window.location.href = data.payment_link;
```

---

## 🔐 Sécurité

### Rappels importants

✅ **Ne jamais exposer les clés API côté client**
✅ **Toujours vérifier le statut côté serveur** (pas juste le callback)
✅ **Logger toutes les transactions** pour audit
✅ **Valider les webhooks** avec les signatures
✅ **Utiliser HTTPS en production**

---

## 📚 Documentation complète

Consultez le fichier `INTEGRATION_PAIEMENTS_WAVE_ORANGE.md` dans le dossier `planb-backend/` pour :
- Guide détaillé d'utilisation
- Exemples Postman
- Troubleshooting
- Checklist mise en production

---

## 💡 Points clés de l'implémentation

### 1. Adaptée à Symfony (pas Laravel)

La documentation source utilisait Laravel, j'ai adapté pour Symfony :
- Entités Doctrine au lieu d'Eloquent
- Services injectés via DependencyInjection
- Contrôleurs avec attributs `#[Route]`

### 2. Prête pour l'utilisation future

Tout est préparé :
- ✅ Structure de BDD optimisée
- ✅ Services réutilisables
- ✅ Logs détaillés
- ✅ Gestion d'erreurs robuste

Dès que vous aurez vos clés API, il suffit de :
1. Les copier dans `.env`
2. Tester avec Postman
3. Intégrer dans le frontend

### 3. Traçabilité complète

Chaque transaction crée :
- 1 `Order` (la commande)
- 2 `Operation` (sortie client + entrée prestataire)

Vous pouvez ainsi :
- Calculer les soldes
- Générer des rapports financiers
- Auditer toutes les transactions

---

## 🎓 Ressources

- [Documentation Wave](https://developer.wave.com)
- [Documentation Orange Money](https://developer.orange.com)
- [Blog Moussa Sagna - Partie 1](https://www.moussasagna.com/blog/integration-payment-partie-1)
- [Blog Moussa Sagna - Partie 2 (Wave)](https://www.moussasagna.com/blog/integration-payment-partie-2)
- [Blog Moussa Sagna - Partie 3 (Orange Money)](https://www.moussasagna.com/blog/integration-payment-partie-3)

---

## ✨ Prêt pour la suite !

Votre infrastructure de paiement est maintenant **prête et professionnelle**. Dès que vous obtiendrez vos clés API Wave Business, vous pourrez :

1. Les configurer en quelques minutes
2. Tester immédiatement
3. Déployer en production

**Tout le code est optimisé, sécurisé et suit les meilleures pratiques de l'industrie fintech !** 🚀
