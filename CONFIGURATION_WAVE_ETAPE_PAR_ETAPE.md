# 🌊 Configuration Wave - Guide Étape par Étape

Ce guide vous accompagne pour configurer Wave et activer les paiements automatiques sur Plan B.

## 📋 Prérequis

- ✅ Un compte Wave Business (téléchargez l'app Wave et créez un compte professionnel)
- ✅ Un compte développeur Wave (gratuit)
- ✅ Accès à votre backend Plan B

---

## 🚀 Étape 1 : Créer un compte Wave Business

1. **Téléchargez l'application Wave** sur votre smartphone
   - iOS : App Store
   - Android : Google Play Store

2. **Créez un compte Wave Business**
   - Ouvrez l'app Wave
   - Choisissez "Créer un compte Business"
   - Suivez les instructions
   - Complétez la vérification KYC (pièce d'identité, etc.)

3. **Vérifiez votre compte**
   - Attendez la validation (généralement 24-48h)
   - Vérifiez que votre compte est actif

---

## 🔑 Étape 2 : Obtenir vos clés API Wave

1. **Visitez le portail développeur Wave**
   - Allez sur https://developer.wave.com
   - Connectez-vous avec votre compte Wave Business

2. **Créez une application**
   - Cliquez sur "Créer une application"
   - Donnez un nom (ex: "Plan B")
   - Sélectionnez "Côte d'Ivoire" comme pays

3. **Récupérez vos clés**
   - **API Key** : Copiez la clé API (format: `wave_ci_sandbox_xxxxx` ou `wave_ci_prod_xxxxx`)
   - **Merchant ID** : Copiez l'ID du marchand agrégé
   - ⚠️ **IMPORTANT** : Gardez ces clés secrètes !

---

## ⚙️ Étape 3 : Configurer le backend

1. **Ouvrez le fichier `.env`** dans `planb-backend/`

2. **Ajoutez les variables Wave** :
   ```env
   # Wave Configuration
   WAVE_API_KEY=wave_ci_sandbox_VOTRE_CLE_ICI
   WAVE_AGGREGATED_MERCHANT_ID=VOTRE_MERCHANT_ID_ICI
   WAVE_ENVIRONMENT=sandbox
   WAVE_WEBHOOK_SECRET=
   APP_URL=http://localhost:8000
   ```

3. **Pour la production**, changez :
   ```env
   WAVE_ENVIRONMENT=live
   WAVE_API_KEY=wave_ci_prod_VOTRE_CLE_PRODUCTION
   APP_URL=https://votre-domaine.com
   ```

4. **Redémarrez le backend** pour charger les nouvelles variables

---

## 🔔 Étape 4 : Configurer le Webhook Wave

Le webhook permet à Wave de notifier votre backend quand un paiement est effectué.

### En mode Sandbox (Test)

1. Dans le portail développeur Wave, allez dans "Webhooks"
2. Créez un nouveau webhook avec l'URL :
   ```
   http://localhost:8000/api/v1/payments/callback
   ```
   ⚠️ **Note** : Pour tester en local, utilisez un outil comme [ngrok](https://ngrok.com) pour exposer votre localhost

3. Copiez le **Webhook Secret** généré
4. Ajoutez-le dans votre `.env` :
   ```env
   WAVE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### En mode Production

1. Créez un webhook avec l'URL de votre serveur :
   ```
   https://votre-domaine.com/api/v1/payments/callback
   ```
2. Copiez le Webhook Secret et ajoutez-le dans `.env`

---

## 🧪 Étape 5 : Tester en mode Sandbox

1. **Utilisez les numéros de test Wave** :
   - **Paiement réussi** : `+225 07 00 00 00 01`
   - **Paiement échoué** : `+225 07 00 00 00 02`
   - **Paiement annulé** : `+225 07 00 00 00 03`

2. **Testez un paiement** :
   - Connectez-vous sur Plan B
   - Allez sur "Passer au PRO"
   - Sélectionnez 1 mois
   - Entrez un numéro de test
   - Cliquez sur "Payer"
   - Vous serez redirigé vers Wave
   - Utilisez le numéro de test pour valider

3. **Vérifiez les logs** :
   - Regardez les logs du backend
   - Vérifiez que le paiement est enregistré
   - Vérifiez que le webhook est reçu

---

## ✅ Étape 6 : Vérifier que tout fonctionne

### Checklist

- [ ] Les clés API sont configurées dans `.env`
- [ ] Le backend démarre sans erreur
- [ ] Le frontend peut créer un paiement
- [ ] La redirection vers Wave fonctionne
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
       "paymentMethod": "wave",
       "phoneNumber": "+2250700000001"
     }'
   ```

2. **Vérifier la réponse** :
   - Doit contenir `paymentUrl`
   - Doit contenir `payment.id`
   - Le statut doit être `pending`

---

## 🚨 Résolution des Problèmes

### Erreur "Invalid API Key"

**Solution** :
- Vérifiez que la clé API est correcte
- Assurez-vous d'utiliser le bon environnement (sandbox/live)
- Vérifiez que votre compte Wave Business est actif

### Erreur "Merchant ID not found"

**Solution** :
- Vérifiez que `WAVE_AGGREGATED_MERCHANT_ID` est correct
- Assurez-vous que le Merchant ID correspond à votre compte

### Webhook non reçu

**Solution** :
- Vérifiez que l'URL du webhook est accessible publiquement
- En local, utilisez ngrok pour exposer votre serveur
- Vérifiez les logs du backend
- Vérifiez que le Webhook Secret est correct

### Redirection vers Wave ne fonctionne pas

**Solution** :
- Vérifiez que `paymentUrl` est présent dans la réponse
- Vérifiez les logs du backend pour les erreurs
- Assurez-vous que le frontend utilise bien l'API (pas le lien personnel)

---

## 📱 Passage en Production

Quand vous êtes prêt pour la production :

1. **Changez l'environnement** dans `.env` :
   ```env
   WAVE_ENVIRONMENT=live
   WAVE_API_KEY=wave_ci_prod_VOTRE_CLE_PRODUCTION
   ```

2. **Mettez à jour l'URL de l'app** :
   ```env
   APP_URL=https://votre-domaine.com
   ```

3. **Configurez le webhook de production** :
   - URL : `https://votre-domaine.com/api/v1/payments/callback`
   - Copiez le nouveau Webhook Secret

4. **Testez avec de vrais paiements** (petits montants d'abord)

---

## 💡 Conseils

1. **Toujours tester en sandbox** avant la production
2. **Garder les clés secrètes** - ne jamais les commiter dans Git
3. **Logger tous les paiements** pour le suivi
4. **Gérer les erreurs** de manière appropriée
5. **Surveiller les webhooks** pour détecter les problèmes

---

## 📞 Support

- **Documentation Wave** : https://developer.wave.com/docs
- **Support Wave** : support@wave.com
- **Guide Plan B** : Voir `GUIDE_PAIEMENTS.md`

---

**Bon courage avec la configuration ! 🚀**
