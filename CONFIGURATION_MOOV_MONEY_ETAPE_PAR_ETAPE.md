# 📱 Configuration Moov Money - Guide Étape par Étape

Ce guide vous accompagne pour configurer Moov Money et activer les paiements automatiques sur Plan B.

## 📋 Prérequis

- ✅ Un compte Moov Money Business (compte professionnel)
- ✅ Un compte développeur Moov (gratuit)
- ✅ Accès à votre backend Plan B
- ✅ Un numéro de téléphone Moov Money actif

---

## 🚀 Étape 1 : Créer un compte Moov Money Business

1. **Contactez Moov dans votre pays**
   - Rendez-vous dans un point de service Moov
   - Demandez l'ouverture d'un compte Moov Money Business
   - Remplissez les formulaires requis
   - Fournissez les documents d'entreprise (statuts, RCCM, etc.)

2. **Activez votre compte**
   - Attendez la validation (généralement 3-7 jours ouvrés)
   - Vérifiez que votre compte est actif et peut recevoir des paiements

---

## 🔑 Étape 2 : Créer un compte développeur Moov

1. **Visitez le portail développeur Moov**
   - Allez sur https://developer.moov-africa.com
   - Cliquez sur "Sign Up" ou "Créer un compte"
   - Utilisez votre email professionnel

2. **Créez une application**
   - Connectez-vous au portail développeur
   - Allez dans "My Apps" > "Create a new app"
   - Remplissez les informations :
     - **Nom** : Plan B
     - **Description** : Plateforme de petites annonces
     - **Type** : Web Application
     - **Callback URL** : `https://votre-domaine.com/api/v1/payments/moov/callback`

3. **Sélectionnez les APIs**
   - Cochez "Merchant API" (pour recevoir des paiements)
   - Acceptez les conditions d'utilisation

4. **Récupérez vos credentials**
   - **API Key** : Copiez la clé API
   - **Merchant Code** : Copiez le code marchand
   - **Merchant PIN** : Copiez le PIN marchand
   - ⚠️ **IMPORTANT** : Gardez ces informations secrètes !

---

## ⚙️ Étape 3 : Configurer le backend

1. **Ouvrez le fichier `.env`** dans `planb-backend/`

2. **Ajoutez les variables Moov** :
   ```env
   # Moov Money Configuration
   MOOV_API_KEY=votre_api_key_ici
   MOOV_MERCHANT_CODE=votre_merchant_code_ici
   MOOV_MERCHANT_PIN=votre_merchant_pin_ici
   MOOV_ENVIRONMENT=sandbox
   MOOV_WEBHOOK_SECRET=votre_webhook_secret_ici
   APP_URL=http://localhost:8000
   FRONTEND_URL=http://localhost:5173
   ```

3. **Pour la production**, changez :
   ```env
   MOOV_ENVIRONMENT=live
   MOOV_API_KEY=votre_api_key_production
   MOOV_MERCHANT_CODE=votre_merchant_code_production
   MOOV_MERCHANT_PIN=votre_merchant_pin_production
   APP_URL=https://votre-domaine.com
   FRONTEND_URL=https://votre-domaine.com
   ```

4. **Redémarrez le backend** pour charger les nouvelles variables

---

## 🔔 Étape 4 : Configurer le Webhook Moov

Le webhook permet à Moov de notifier votre backend quand un paiement est effectué.

### En mode Sandbox (Test)

1. Dans le portail développeur Moov, allez dans "Webhooks" ou "Notifications"
2. Créez un nouveau webhook avec l'URL :
   ```
   http://localhost:8000/api/v1/payments/moov/callback
   ```
   ⚠️ **Note** : Pour tester en local, utilisez [ngrok](https://ngrok.com) pour exposer votre localhost

3. Copiez le **Webhook Secret** généré
4. Ajoutez-le dans votre `.env` :
   ```env
   MOOV_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### En mode Production

1. Créez un webhook avec l'URL de votre serveur :
   ```
   https://votre-domaine.com/api/v1/payments/moov/callback
   ```
2. Copiez le Webhook Secret et ajoutez-le dans `.env`
3. Vérifiez que votre serveur accepte les requêtes POST depuis Moov

---

## 🧪 Étape 5 : Tester en mode Sandbox

1. **Utilisez les numéros de test Moov** (si disponibles) :
   - Consultez la documentation Moov pour les numéros de test
   - Ou utilisez votre propre numéro Moov Money en mode test

2. **Testez un paiement** :
   - Connectez-vous sur Plan B
   - Allez sur "Passer au PRO"
   - Sélectionnez Moov Money comme méthode de paiement
   - Entrez un numéro de téléphone Moov Money
   - Cliquez sur "Payer"
   - Vous recevrez une demande de paiement sur votre téléphone
   - Confirmez le paiement avec votre code PIN Moov

3. **Vérifiez les logs** :
   - Regardez les logs du backend
   - Vérifiez que le paiement est enregistré
   - Vérifiez que le webhook est reçu

---

## ✅ Étape 6 : Vérifier que tout fonctionne

### Checklist

- [ ] Les credentials Moov sont configurés dans `.env`
- [ ] Le backend démarre sans erreur
- [ ] Le frontend peut créer un paiement Moov
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
       "paymentMethod": "moov_money",
       "phoneNumber": "+225XXXXXXXXX"
     }'
   ```

2. **Vérifier la réponse** :
   - Doit contenir `transaction_id`
   - Peut contenir `payment_url` ou `ussd_code`
   - Le statut doit être `pending`

---

## 🚨 Résolution des Problèmes

### Erreur "Invalid API Key"

**Solution** :
- Vérifiez que l'API Key est correcte
- Assurez-vous qu'il n'y a pas d'espaces avant/après
- Vérifiez que votre application est activée dans le portail développeur

### Erreur "Invalid Merchant Code or PIN"

**Solution** :
- Vérifiez que le Merchant Code et le Merchant PIN sont corrects
- Assurez-vous qu'ils correspondent à votre compte Business
- Contactez le support Moov pour confirmer vos credentials

### Erreur "Payment request failed"

**Solution** :
- Vérifiez que le numéro de téléphone est au bon format (225XXXXXXXX)
- Assurez-vous que le compte Moov Money est actif
- Vérifiez que le compte a suffisamment de fonds (en production)
- Vérifiez les logs Moov dans le portail développeur

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
   MOOV_ENVIRONMENT=live
   MOOV_API_KEY=votre_api_key_production
   MOOV_MERCHANT_CODE=votre_merchant_code_production
   MOOV_MERCHANT_PIN=votre_merchant_pin_production
   ```

2. **Mettez à jour les URLs** :
   ```env
   APP_URL=https://votre-domaine.com
   FRONTEND_URL=https://votre-domaine.com
   ```

3. **Configurez le webhook de production** :
   - URL : `https://votre-domaine.com/api/v1/payments/moov/callback`
   - Copiez le nouveau Webhook Secret

4. **Testez avec de vrais paiements** (petits montants d'abord)

---

## 💰 Tarification Moov Money

Les frais Moov Money varient selon :
- Le montant de la transaction
- Le type d'opération
- Votre contrat avec Moov

**Frais approximatifs** (à confirmer avec Moov) :
- Jusqu'à 500 XOF : Gratuit
- 500 - 1000 XOF : 10 XOF
- 1000 - 2500 XOF : 25 XOF
- 2500 - 5000 XOF : 50 XOF
- 5000 - 10000 XOF : 75 XOF
- 10000 - 25000 XOF : 125 XOF
- 25000 - 50000 XOF : 200 XOF
- Au-delà : ~1% du montant

---

## 💡 Conseils

1. **Toujours tester en sandbox** avant la production
2. **Garder les credentials secrètes** - ne jamais les commiter dans Git
3. **Logger tous les paiements** pour le suivi
4. **Gérer les erreurs** de manière appropriée
5. **Surveiller les webhooks** pour détecter les problèmes
6. **Tester régulièrement** les paiements pour s'assurer que tout fonctionne
7. **Formater correctement les numéros** : Moov utilise le format 225XXXXXXXX (sans +)

---

## 📞 Support

- **Documentation Moov** : https://developer.moov-africa.com/docs
- **Support Moov** : Contactez le service client Moov de votre pays
- **Portail développeur** : https://developer.moov-africa.com
- **Guide Plan B** : Voir `GUIDE_PAIEMENTS.md`

---

## 🔄 Différences avec les autres moyens de paiement

| Caractéristique | Wave | Orange Money | MTN MoMo | Moov Money |
|----------------|------|--------------|----------|------------|
| **Pays** | CI, SN, ML, BF | Multi-pays | Multi-pays | CI, BF, TG, BJ, NE |
| **QR Code** | Non | Oui | Non | Non |
| **Paiement direct** | Oui | Oui | Oui | Oui |
| **USSD Code** | Non | Non | Non | Oui (optionnel) |
| **Webhook** | Oui | Oui | Oui | Oui |
| **Format téléphone** | +225XXXXXXXX | +225XXXXXXXX | 225XXXXXXXX | 225XXXXXXXX |

---

**Bon courage avec la configuration ! 🚀**
