# 📱 Configuration MTN Mobile Money - Guide Étape par Étape

Ce guide vous accompagne pour configurer MTN Mobile Money et activer les paiements automatiques sur Plan B.

## 📋 Prérequis

- ✅ Un compte MTN Mobile Money Business (compte professionnel)
- ✅ Un compte développeur MTN MoMo (gratuit)
- ✅ Accès à votre backend Plan B
- ✅ Un numéro de téléphone MTN Mobile Money actif

---

## 🚀 Étape 1 : Créer un compte MTN Mobile Money Business

1. **Contactez MTN dans votre pays**
   - Rendez-vous dans un point de service MTN
   - Demandez l'ouverture d'un compte Mobile Money Business
   - Remplissez les formulaires requis
   - Fournissez les documents d'entreprise (statuts, RCCM, etc.)

2. **Activez votre compte**
   - Attendez la validation (généralement 3-7 jours ouvrés)
   - Vérifiez que votre compte est actif et peut recevoir des paiements

---

## 🔑 Étape 2 : Créer un compte développeur MTN MoMo

1. **Visitez le portail développeur MTN**
   - Allez sur https://momodeveloper.mtn.com
   - Cliquez sur "Sign Up" ou "Créer un compte"
   - Utilisez votre email professionnel

2. **Créez une application**
   - Connectez-vous au portail développeur
   - Allez dans "My Apps" > "Create a new app"
   - Remplissez les informations :
     - **Nom** : Plan B
     - **Description** : Plateforme de petites annonces
     - **Type** : Web Application
     - **Callback URL** : `https://votre-domaine.com/api/v1/payments/mtn/callback`

3. **Sélectionnez les APIs**
   - Cochez "Collection API" (pour recevoir des paiements)
   - Acceptez les conditions d'utilisation

4. **Récupérez vos credentials**
   - **API Key** : Copiez la clé API (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   - **API Secret** : Copiez le secret API
   - **Subscription Key** : Copiez la clé d'abonnement (Primary ou Secondary)
   - ⚠️ **IMPORTANT** : Gardez ces informations secrètes !

---

## ⚙️ Étape 3 : Configurer le backend

1. **Ouvrez le fichier `.env`** dans `planb-backend/`

2. **Ajoutez les variables MTN** :
   ```env
   # MTN Mobile Money Configuration
   MTN_API_KEY=votre_api_key_ici
   MTN_API_SECRET=votre_api_secret_ici
   MTN_SUBSCRIPTION_KEY=votre_subscription_key_ici
   MTN_ENVIRONMENT=sandbox
   MTN_WEBHOOK_SECRET=votre_webhook_secret_ici
   APP_URL=http://localhost:8000
   ```

3. **Pour la production**, changez :
   ```env
   MTN_ENVIRONMENT=live
   MTN_API_KEY=votre_api_key_production
   MTN_API_SECRET=votre_api_secret_production
   MTN_SUBSCRIPTION_KEY=votre_subscription_key_production
   APP_URL=https://votre-domaine.com
   ```

4. **Redémarrez le backend** pour charger les nouvelles variables

---

## 🔔 Étape 4 : Configurer le Webhook MTN

Le webhook permet à MTN de notifier votre backend quand un paiement est effectué.

### En mode Sandbox (Test)

1. Dans le portail développeur MTN, allez dans "Webhooks" ou "Notifications"
2. Créez un nouveau webhook avec l'URL :
   ```
   http://localhost:8000/api/v1/payments/mtn/callback
   ```
   ⚠️ **Note** : Pour tester en local, utilisez [ngrok](https://ngrok.com) pour exposer votre localhost

3. Copiez le **Webhook Secret** généré
4. Ajoutez-le dans votre `.env` :
   ```env
   MTN_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### En mode Production

1. Créez un webhook avec l'URL de votre serveur :
   ```
   https://votre-domaine.com/api/v1/payments/mtn/callback
   ```
2. Copiez le Webhook Secret et ajoutez-le dans `.env`
3. Vérifiez que votre serveur accepte les requêtes POST depuis MTN

---

## 🧪 Étape 5 : Tester en mode Sandbox

1. **Utilisez les numéros de test MTN** (si disponibles) :
   - Consultez la documentation MTN pour les numéros de test
   - Ou utilisez votre propre numéro MTN Mobile Money en mode test

2. **Testez un paiement** :
   - Connectez-vous sur Plan B
   - Allez sur "Passer au PRO"
   - Sélectionnez MTN Mobile Money comme méthode de paiement
   - Entrez un numéro de téléphone MTN Mobile Money
   - Cliquez sur "Payer"
   - Vous recevrez une demande de paiement sur votre téléphone
   - Confirmez le paiement avec votre code PIN MTN

3. **Vérifiez les logs** :
   - Regardez les logs du backend
   - Vérifiez que le paiement est enregistré
   - Vérifiez que le webhook est reçu

---

## ✅ Étape 6 : Vérifier que tout fonctionne

### Checklist

- [ ] Les credentials MTN sont configurés dans `.env`
- [ ] Le backend démarre sans erreur
- [ ] Le token d'accès MTN est obtenu (vérifiez les logs)
- [ ] Le frontend peut créer un paiement MTN
- [ ] La demande de paiement est envoyée
- [ ] Le webhook est configuré
- [ ] Les paiements de test fonctionnent
- [ ] Les paiements sont enregistrés en base de données

### Test complet

1. **Créer un paiement** :
   ```bash
   curl -X POST http://localhost:8000/api/v1/payments/create-subscription \
     -H "Authorization: Bearer VOTRE_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "months": 1,
       "paymentMethod": "mtn_money",
       "phoneNumber": "+225XXXXXXXXX"
     }'
   ```

2. **Vérifier la réponse** :
   - Doit contenir `transaction_id` (reference_id)
   - Le statut doit être `pending`
   - Un message doit indiquer de confirmer sur le téléphone

---

## 🚨 Résolution des Problèmes

### Erreur "Invalid API Key or Secret"

**Solution** :
- Vérifiez que l'API Key et l'API Secret sont corrects
- Assurez-vous qu'il n'y a pas d'espaces avant/après
- Vérifiez que votre application est activée dans le portail développeur

### Erreur "Invalid Subscription Key"

**Solution** :
- Vérifiez que la Subscription Key est correcte
- Assurez-vous d'utiliser la bonne clé (Primary ou Secondary)
- Vérifiez que la clé correspond à l'environnement (sandbox/live)

### Erreur "Token expired" ou "Unable to get access token"

**Solution** :
- Vérifiez que les credentials sont valides
- Vérifiez votre connexion internet
- Consultez les logs pour plus de détails
- Le token expire après 1 heure, il est renouvelé automatiquement

### Erreur "Request to Pay failed"

**Solution** :
- Vérifiez que le numéro de téléphone est au bon format (225XXXXXXXX)
- Assurez-vous que le compte MTN Mobile Money est actif
- Vérifiez que le compte a suffisamment de fonds (en production)
- Vérifiez les logs MTN dans le portail développeur

### Webhook non reçu

**Solution** :
- Vérifiez que l'URL du webhook est accessible publiquement
- En local, utilisez ngrok pour exposer votre serveur
- Vérifiez les logs du backend
- Vérifiez que le Webhook Secret est correct
- Vérifiez que votre serveur accepte les requêtes POST

### Paiement non confirmé automatiquement

**Solution** :
- Vérifiez que le webhook est bien configuré
- Vérifiez que la signature du webhook est validée
- Consultez les logs pour voir si le webhook est reçu
- Vérifiez que le statut du paiement est bien mis à jour

---

## 📱 Passage en Production

Quand vous êtes prêt pour la production :

1. **Changez l'environnement** dans `.env` :
   ```env
   MTN_ENVIRONMENT=live
   MTN_API_KEY=votre_api_key_production
   MTN_API_SECRET=votre_api_secret_production
   MTN_SUBSCRIPTION_KEY=votre_subscription_key_production
   ```

2. **Mettez à jour l'URL de l'app** :
   ```env
   APP_URL=https://votre-domaine.com
   ```

3. **Configurez le webhook de production** :
   - URL : `https://votre-domaine.com/api/v1/payments/mtn/callback`
   - Copiez le nouveau Webhook Secret

4. **Testez avec de vrais paiements** (petits montants d'abord)

---

## 💰 Tarification MTN Mobile Money

Les frais MTN Mobile Money varient selon :
- Le montant de la transaction
- Le type d'opération
- Votre contrat avec MTN

**Frais approximatifs** (à confirmer avec MTN) :
- Jusqu'à 500 XOF : Gratuit
- 500 - 2500 XOF : 25 XOF
- 2500 - 5000 XOF : 50 XOF
- 5000 - 10000 XOF : 100 XOF
- 10000 - 25000 XOF : 150 XOF
- 25000 - 50000 XOF : 250 XOF
- Au-delà : ~1% du montant

---

## 💡 Conseils

1. **Toujours tester en sandbox** avant la production
2. **Garder les credentials secrètes** - ne jamais les commiter dans Git
3. **Logger tous les paiements** pour le suivi
4. **Gérer les erreurs** de manière appropriée
5. **Surveiller les webhooks** pour détecter les problèmes
6. **Tester régulièrement** les paiements pour s'assurer que tout fonctionne
7. **Formater correctement les numéros** : MTN utilise le format 225XXXXXXXX (sans +)

---

## 📞 Support

- **Documentation MTN MoMo** : https://momodeveloper.mtn.com/docs
- **Support MTN** : Contactez le service client MTN de votre pays
- **Portail développeur** : https://momodeveloper.mtn.com
- **Guide Plan B** : Voir `GUIDE_PAIEMENTS.md`

---

## 🔄 Différences avec les autres moyens de paiement

| Caractéristique | Wave | Orange Money | MTN MoMo |
|----------------|------|--------------|----------|
| **Pays** | CI, SN, ML, BF | Multi-pays | Multi-pays (CI, SN, ML, BF, etc.) |
| **QR Code** | Non | Oui | Non |
| **Paiement direct** | Oui | Oui | Oui (Request to Pay) |
| **Webhook** | Oui | Oui | Oui |
| **Format téléphone** | +225XXXXXXXX | +225XXXXXXXX | 225XXXXXXXX (sans +) |

---

**Bon courage avec la configuration ! 🚀**
