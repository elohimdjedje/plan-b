# 🌊 Configuration Wave Côte d'Ivoire

## 📋 Prérequis

Avant de commencer, vous devez :
1. Avoir un compte Wave professionnel (Wave Business)
2. Être basé en Côte d'Ivoire
3. Avoir validé votre identité Wave

## 🚀 Étapes de Configuration

### 1. Créer un compte Wave Business

1. Téléchargez l'application Wave sur votre smartphone
2. Créez un compte Wave Business
3. Complétez la vérification KYC (Know Your Customer)

### 2. Accéder au portail développeur

1. Visitez [https://developer.wave.com](https://developer.wave.com)
2. Connectez-vous avec votre compte Wave Business
3. Accédez à la section "API Keys"

### 3. Générer vos clés API

#### Environnement Sandbox (Test)
```
WAVE_API_KEY=wave_ci_sandbox_xxxxxxxxxxxxxxxxxx
WAVE_ENVIRONMENT=sandbox
```

#### Environnement Production (Live)
```
WAVE_API_KEY=wave_ci_prod_xxxxxxxxxxxxxxxxxx
WAVE_ENVIRONMENT=live
```

### 4. Configurer le Webhook Secret

1. Dans le portail développeur, allez dans "Webhooks"
2. Créez un nouveau webhook avec l'URL :
   ```
   https://votre-domaine.com/api/v1/payments/callback
   ```
3. Copiez le `Webhook Secret` généré
4. Ajoutez-le dans votre `.env` :
   ```
   WAVE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxx
   ```

## 📝 Configuration Complète

Mettez à jour votre fichier `.env` :

```env
# Wave Côte d'Ivoire (paiements Mobile Money)
WAVE_API_KEY=wave_ci_prod_VOTRE_CLE_API_ICI
WAVE_ENVIRONMENT=sandbox  # ou 'live' pour la production
WAVE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_WEBHOOK_ICI
APP_URL=http://localhost:8000  # URL de votre backend
```

## 💰 Tarification Wave

Les frais Wave CI sont généralement :
- **1% + 50 XOF** par transaction (à confirmer selon votre contrat)
- Pas de frais d'inscription
- Pas de frais mensuels

## 🧪 Test en mode Sandbox

En mode sandbox, vous pouvez tester les paiements sans argent réel :

```bash
# Créer un paiement test
curl -X POST http://localhost:8000/api/v1/payments/create-subscription \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 30
  }'
```

## 📱 Numéros de test Wave

En environnement sandbox, Wave fournit des numéros de téléphone de test :
- **+225 07 00 00 00 01** - Paiement réussi
- **+225 07 00 00 00 02** - Paiement échoué
- **+225 07 00 00 00 03** - Paiement annulé

## 🔐 Sécurité

### Protection des clés API
- ✅ Ne JAMAIS commiter les clés API dans Git
- ✅ Utiliser uniquement les variables d'environnement
- ✅ Générer de nouvelles clés si compromises
- ✅ Utiliser des clés différentes pour dev/prod

### Vérification des webhooks
Le système vérifie automatiquement la signature des webhooks Wave pour garantir leur authenticité.

## 🚨 Résolution des problèmes

### Erreur "Invalid API Key"
- Vérifiez que votre clé API est correcte
- Assurez-vous d'utiliser le bon environnement (sandbox/live)
- Vérifiez que votre compte Wave Business est actif

### Erreur "Transaction failed"
- Vérifiez que le numéro de téléphone est au bon format : +225XXXXXXXXX
- Assurez-vous que le compte Wave a suffisamment de fonds (en production)
- Vérifiez les logs Wave dans le portail développeur

### Webhook non reçu
- Vérifiez que l'URL du webhook est accessible publiquement
- Assurez-vous que votre serveur accepte les requêtes POST
- Vérifiez les logs de votre serveur

## 📚 Documentation Wave

- [API Reference](https://developer.wave.com/docs/api)
- [Guide d'intégration](https://developer.wave.com/docs/integration)
- [Support Wave](https://support.wave.com)

## 💡 Conseils

1. **Toujours tester en sandbox** avant de passer en production
2. **Gérer les erreurs** de manière appropriée pour une bonne UX
3. **Logger tous les paiements** pour le suivi et le débogage
4. **Implémenter un système de retry** pour les webhooks manqués

## 📞 Support

Pour toute question sur l'intégration Wave :
- Email : support@wave.com
- Téléphone : +225 XX XX XX XX XX (Support Wave CI)
- Documentation : https://developer.wave.com

---

**Note importante** : Ce document est basé sur la documentation publique Wave. Les détails peuvent varier selon votre contrat spécifique avec Wave. Consultez toujours la documentation officielle la plus récente.
