# 🟠 Configuration Orange Money - Guide Étape par Étape

Ce guide vous accompagne pour configurer Orange Money et activer les paiements automatiques sur Plan B.

## 📋 Prérequis

- ✅ Un compte Orange Money Business (compte professionnel)
- ✅ Un compte développeur Orange (gratuit)
- ✅ Accès à votre backend Plan B
- ✅ Un numéro de téléphone Orange Money actif

---

## 🚀 Étape 1 : Créer un compte Orange Money Business

1. **Ouvrez un compte Orange Money Business**
   - Contactez Orange dans votre pays
   - Remplissez les formulaires de création de compte professionnel
   - Complétez la vérification KYC (pièce d'identité, documents d'entreprise)

2. **Activez votre compte**
   - Attendez la validation (généralement 3-5 jours ouvrés)
   - Vérifiez que votre compte est actif et peut recevoir des paiements

---

## 🔑 Étape 2 : Créer un compte développeur Orange

1. **Visitez le portail développeur Orange**
   - Allez sur https://developer.orange.com
   - Cliquez sur "S'inscrire" ou "Créer un compte"
   - Utilisez votre email professionnel

2. **Créez une application**
   - Connectez-vous au portail développeur
   - Allez dans "My Apps" > "Create a new app"
   - Remplissez les informations :
     - **Nom** : Plan B
     - **Description** : Plateforme de petites annonces
     - **Type** : Web Application
     - **Redirect URI** : `https://votre-domaine.com/api/v1/payments/orange/callback`

3. **Sélectionnez les APIs**
   - Cochez "Orange Money API" ou "eWallet API"
   - Acceptez les conditions d'utilisation

4. **Récupérez vos credentials**
   - **Client ID** : Copiez l'ID client (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   - **Client Secret** : Copiez le secret client
   - ⚠️ **IMPORTANT** : Gardez ces informations secrètes !

---

## ⚙️ Étape 3 : Obtenir le Code Marchand

1. **Contactez le support Orange Money**
   - Appelez le service client Orange Money de votre pays
   - Demandez l'activation de l'API pour votre compte Business
   - Demandez votre **Code Marchand** (Merchant Code)

2. **Notez les informations**
   - Code Marchand
   - Numéro de téléphone Orange Money Business
   - Informations de contact du support

---

## 🔧 Étape 4 : Configurer le backend

1. **Ouvrez le fichier `.env`** dans `planb-backend/`

2. **Ajoutez les variables Orange Money** :
   ```env
   # Orange Money Configuration
   OM_TOKEN_URL=https://api.orange.com/oauth/v2/token
   OM_CLIENT_ID=votre_client_id_ici
   OM_CLIENT_SECRET=votre_client_secret_ici
   OM_API_URL=https://api.orange.com
   OM_MERCHANT_CODE=votre_code_marchand_ici
   OM_WEBHOOK_SECRET=votre_webhook_secret_ici
   APP_URL=http://localhost:8000
   ```

3. **Pour la production**, changez :
   ```env
   OM_API_URL=https://api.orange.com  # URL de production
   APP_URL=https://votre-domaine.com
   ```

4. **Redémarrez le backend** pour charger les nouvelles variables

---

## 🔔 Étape 5 : Configurer le Webhook Orange Money

Le webhook permet à Orange Money de notifier votre backend quand un paiement est effectué.

### En mode Sandbox (Test)

1. Dans le portail développeur Orange, allez dans "Webhooks" ou "Notifications"
2. Créez un nouveau webhook avec l'URL :
   ```
   http://localhost:8000/api/v1/webhooks/orange-money
   ```
   ⚠️ **Note** : Pour tester en local, utilisez [ngrok](https://ngrok.com) pour exposer votre localhost

3. Copiez le **Webhook Secret** généré
4. Ajoutez-le dans votre `.env` :
   ```env
   OM_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### En mode Production

1. Créez un webhook avec l'URL de votre serveur :
   ```
   https://votre-domaine.com/api/v1/webhooks/orange-money
   ```
2. Copiez le Webhook Secret et ajoutez-le dans `.env`
3. Vérifiez que votre serveur accepte les requêtes POST depuis Orange

---

## 🧪 Étape 6 : Tester en mode Sandbox

1. **Utilisez les numéros de test Orange Money** (si disponibles) :
   - Consultez la documentation Orange pour les numéros de test
   - Ou utilisez votre propre numéro Orange Money en mode test

2. **Testez un paiement** :
   - Connectez-vous sur Plan B
   - Allez sur "Passer au PRO"
   - Sélectionnez Orange Money comme méthode de paiement
   - Entrez un numéro de téléphone Orange Money
   - Cliquez sur "Payer"
   - Vous recevrez une demande de paiement sur votre téléphone
   - Confirmez le paiement

3. **Vérifiez les logs** :
   - Regardez les logs du backend
   - Vérifiez que le paiement est enregistré
   - Vérifiez que le webhook est reçu

---

## ✅ Étape 7 : Vérifier que tout fonctionne

### Checklist

- [ ] Les credentials Orange Money sont configurés dans `.env`
- [ ] Le backend démarre sans erreur
- [ ] Le token d'accès Orange Money est obtenu (vérifiez les logs)
- [ ] Le frontend peut créer un paiement Orange Money
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
       "paymentMethod": "orange_money",
       "phoneNumber": "+225XXXXXXXXX"
     }'
   ```

2. **Vérifier la réponse** :
   - Doit contenir `paymentUrl` ou `qr_code`
   - Doit contenir `payment.id`
   - Le statut doit être `pending`

---

## 🚨 Résolution des Problèmes

### Erreur "Invalid Client ID or Secret"

**Solution** :
- Vérifiez que le Client ID et Client Secret sont corrects
- Assurez-vous qu'il n'y a pas d'espaces avant/après
- Vérifiez que votre application est activée dans le portail développeur

### Erreur "Token expired" ou "Unable to get access token"

**Solution** :
- Vérifiez que `OM_TOKEN_URL` est correct
- Vérifiez que les credentials sont valides
- Vérifiez votre connexion internet
- Consultez les logs pour plus de détails

### Erreur "Merchant Code not found"

**Solution** :
- Vérifiez que `OM_MERCHANT_CODE` est correct
- Contactez le support Orange Money pour confirmer votre code marchand
- Assurez-vous que votre compte Business est actif

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

1. **Changez les URLs** dans `.env` :
   ```env
   OM_API_URL=https://api.orange.com  # URL de production
   APP_URL=https://votre-domaine.com
   ```

2. **Utilisez les credentials de production** :
   - Obtenez un nouveau Client ID/Secret pour la production
   - Utilisez votre Code Marchand de production

3. **Configurez le webhook de production** :
   - URL : `https://votre-domaine.com/api/v1/webhooks/orange-money`
   - Copiez le nouveau Webhook Secret

4. **Testez avec de vrais paiements** (petits montants d'abord)

---

## 💰 Tarification Orange Money

Les frais Orange Money varient selon :
- Le montant de la transaction
- Le type d'opération
- Votre contrat avec Orange

**Frais approximatifs** (à confirmer avec Orange) :
- Jusqu'à 500 XOF : Gratuit
- 500 - 1000 XOF : 25 XOF
- 1000 - 2500 XOF : 50 XOF
- 2500 - 5000 XOF : 100 XOF
- 5000 - 10000 XOF : 150 XOF
- 10000 - 15000 XOF : 200 XOF
- 15000 - 20000 XOF : 300 XOF
- Au-delà : ~1.5% du montant

---

## 💡 Conseils

1. **Toujours tester en sandbox** avant la production
2. **Garder les credentials secrètes** - ne jamais les commiter dans Git
3. **Logger tous les paiements** pour le suivi
4. **Gérer les erreurs** de manière appropriée
5. **Surveiller les webhooks** pour détecter les problèmes
6. **Tester régulièrement** les paiements pour s'assurer que tout fonctionne

---

## 📞 Support

- **Documentation Orange** : https://developer.orange.com/apis/
- **Support Orange Money** : Contactez le service client Orange de votre pays
- **Portail développeur** : https://developer.orange.com
- **Guide Plan B** : Voir `GUIDE_PAIEMENTS.md`

---

## 🔄 Différences avec Wave

| Caractéristique | Wave | Orange Money |
|----------------|------|--------------|
| **Pays** | CI, SN, ML, BF | Multi-pays (CI, SN, ML, BF, GN, etc.) |
| **QR Code** | Non | Oui |
| **Paiement direct** | Oui | Oui |
| **Webhook** | Oui | Oui |
| **Frais** | ~1% + 50 XOF | Variable selon montant |

---

**Bon courage avec la configuration ! 🚀**
