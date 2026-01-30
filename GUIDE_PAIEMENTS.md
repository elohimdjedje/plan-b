# 💳 Guide d'Intégration des Moyens de Paiement - Plan B

Ce guide explique comment configurer et activer les différents moyens de paiement pour Plan B.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Wave](#wave)
3. [Orange Money](#orange-money)
4. [MTN Mobile Money](#mtn-mobile-money)
5. [Moov Money](#moov-money)
6. [Cartes Bancaires](#cartes-bancaires)
7. [Configuration Backend](#configuration-backend)
8. [Webhooks](#webhooks)
9. [Tests](#tests)

---

## 🎯 Vue d'ensemble

Plan B supporte actuellement les moyens de paiement suivants:
- **Wave** (Sénégal, Côte d'Ivoire, Mali, Burkina Faso)
- **Orange Money** (Multi-pays)
- **MTN Mobile Money** (Multi-pays)
- **Moov Money** (Côte d'Ivoire, Burkina Faso, Bénin, Togo)
- **Cartes bancaires** (Visa, Mastercard via Stripe)

---

## 📱 Wave

### Option 1: Lien de Paiement Personnel (Gratuit - Déjà implémenté)

**Avantages:**
- ✅ Gratuit
- ✅ Pas besoin d'API
- ✅ Simple à configurer

**Inconvénients:**
- ❌ Vérification manuelle nécessaire
- ❌ Pas de confirmation automatique

**Configuration actuelle:**
Le lien Wave est déjà configuré dans `src/pages/WavePayment.jsx`:
```javascript
const wavePaymentLink = 'https://pay.wave.com/m/M_ci_cCLTAMUtr2FQ/c/ci/';
```

**Pour utiliser votre propre lien:**
1. Connectez-vous à votre compte Wave
2. Allez dans "Recevoir de l'argent" > "Lien de paiement"
3. Créez un lien de paiement
4. Remplacez le lien dans le code

**Processus actuel:**
1. L'utilisateur entre son numéro Wave
2. Redirection vers Wave
3. L'utilisateur paie manuellement
4. L'utilisateur doit envoyer une capture d'écran pour activation

### Option 2: API Wave (Payant - Recommandé pour production)

**Étapes:**

1. **Créer un compte développeur Wave**
   - Allez sur https://developer.wave.com
   - Créez un compte
   - Obtenez vos clés API (Client ID, Client Secret)

2. **Installer le SDK Wave (Backend)**
   ```bash
   cd planb-backend
   composer require wave/wave-sdk
   ```

3. **Configurer les variables d'environnement**
   ```env
   # .env
   WAVE_CLIENT_ID=your_client_id
   WAVE_CLIENT_SECRET=your_client_secret
   WAVE_MERCHANT_ID=your_merchant_id
   WAVE_ENVIRONMENT=sandbox  # ou 'production'
   ```

4. **Mettre à jour le service Wave (Backend)**
   ```php
   // src/Service/WaveService.php
   public function initiatePayment($amount, $phoneNumber, $metadata = [])
   {
       $client = new WaveClient(
           $_ENV['WAVE_CLIENT_ID'],
           $_ENV['WAVE_CLIENT_SECRET'],
           $_ENV['WAVE_ENVIRONMENT']
       );
       
       $payment = $client->createPayment([
           'amount' => $amount,
           'currency' => 'XOF',
           'phone_number' => $phoneNumber,
           'merchant_reference' => $metadata['reference'],
           'callback_url' => $_ENV['APP_URL'] . '/api/v1/payments/wave/callback',
       ]);
       
       return [
           'payment_url' => $payment->payment_url,
           'transaction_id' => $payment->id,
       ];
   }
   ```

5. **Créer l'endpoint de callback**
   ```php
   // src/Controller/PaymentController.php
   #[Route('/wave/callback', name: 'wave_callback', methods: ['POST'])]
   public function waveCallback(Request $request): JsonResponse
   {
       $data = json_decode($request->getContent(), true);
       
       // Vérifier la signature
       if (!$this->waveService->verifySignature($data)) {
           return $this->json(['error' => 'Signature invalide'], 401);
       }
       
       // Traiter le paiement
       if ($data['status'] === 'SUCCESS') {
           $this->processSuccessfulPayment($data['transaction_id']);
       }
       
       return $this->json(['message' => 'OK'], 200);
   }
   ```

---

## 🟠 Orange Money

### Configuration

1. **Créer un compte développeur Orange Money**
   - Allez sur https://developer.orange.com
   - Créez un compte
   - Obtenez vos clés API

2. **Installer le SDK Orange Money**
   ```bash
   composer require orange/orange-money-sdk
   ```

3. **Variables d'environnement**
   ```env
   ORANGE_MONEY_CLIENT_ID=your_client_id
   ORANGE_MONEY_CLIENT_SECRET=your_client_secret
   ORANGE_MONEY_MERCHANT_KEY=your_merchant_key
   ORANGE_MONEY_ENVIRONMENT=sandbox
   ```

4. **Mettre à jour OrangeMoneyService**
   ```php
   // src/Service/OrangeMoneyService.php
   public function initiatePayment($amount, $phoneNumber, $metadata = [])
   {
       $client = new OrangeMoneyClient(
           $_ENV['ORANGE_MONEY_CLIENT_ID'],
           $_ENV['ORANGE_MONEY_CLIENT_SECRET'],
           $_ENV['ORANGE_MONEY_ENVIRONMENT']
       );
       
       $payment = $client->requestPayment([
           'amount' => $amount,
           'currency' => 'XOF',
           'phone_number' => $phoneNumber,
           'order_id' => $metadata['reference'],
           'notif_url' => $_ENV['APP_URL'] . '/api/v1/payments/orange/callback',
       ]);
       
       return [
           'payment_url' => $payment->payment_url,
           'transaction_id' => $payment->id,
       ];
   }
   ```

---

## 📱 MTN Mobile Money

### Configuration

1. **Créer un compte MTN Mobile Money API**
   - Contactez MTN pour obtenir l'accès API
   - Obtenez vos credentials

2. **Variables d'environnement**
   ```env
   MTN_API_KEY=your_api_key
   MTN_API_SECRET=your_api_secret
   MTN_SUBSCRIPTION_KEY=your_subscription_key
   MTN_ENVIRONMENT=sandbox
   ```

3. **Mettre à jour MtnMobileMoneyService**
   ```php
   // src/Service/MtnMobileMoneyService.php
   public function initiatePayment($amount, $phoneNumber, $metadata = [])
   {
       $client = new MtnClient(
           $_ENV['MTN_API_KEY'],
           $_ENV['MTN_API_SECRET'],
           $_ENV['MTN_ENVIRONMENT']
       );
       
       $payment = $client->requestPayment([
           'amount' => $amount,
           'currency' => 'XOF',
           'externalId' => $metadata['reference'],
           'payer' => [
               'partyIdType' => 'MSISDN',
               'partyId' => $phoneNumber,
           ],
           'callbackUrl' => $_ENV['APP_URL'] . '/api/v1/payments/mtn/callback',
       ]);
       
       return [
           'transaction_id' => $payment->transactionId,
           'status' => $payment->status,
       ];
   }
   ```

---

## 📱 Moov Money

### Configuration

1. **Contacter Moov pour l'accès API**
   - Les APIs Moov Money varient selon les pays
   - Contactez le support Moov de votre pays

2. **Variables d'environnement**
   ```env
   MOOV_API_KEY=your_api_key
   MOOV_API_SECRET=your_api_secret
   MOOV_MERCHANT_ID=your_merchant_id
   ```

---

## 💳 Cartes Bancaires (Stripe)

### Configuration

1. **Créer un compte Stripe**
   - Allez sur https://stripe.com
   - Créez un compte
   - Obtenez vos clés API (Test et Live)

2. **Installer Stripe PHP SDK**
   ```bash
   composer require stripe/stripe-php
   ```

3. **Variables d'environnement**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. **Créer le service Stripe**
   ```php
   // src/Service/StripeService.php
   use Stripe\Stripe;
   use Stripe\PaymentIntent;

   class StripeService
   {
       public function __construct()
       {
           Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);
       }
       
       public function createPaymentIntent($amount, $currency = 'xof', $metadata = [])
       {
           $intent = PaymentIntent::create([
               'amount' => $amount * 100, // Stripe utilise les centimes
               'currency' => $currency,
               'metadata' => $metadata,
           ]);
           
           return [
               'client_secret' => $intent->client_secret,
               'payment_intent_id' => $intent->id,
           ];
       }
   }
   ```

5. **Frontend - Intégrer Stripe Elements**
   ```bash
   npm install @stripe/stripe-js @stripe/react-stripe-js
   ```

   ```jsx
   // src/components/payment/StripePayment.jsx
   import { loadStripe } from '@stripe/stripe-js';
   import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

   const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

   export default function StripePayment({ amount, onSuccess }) {
       const stripe = useStripe();
       const elements = useElements();
       
       const handleSubmit = async (e) => {
           e.preventDefault();
           
           const { error, paymentMethod } = await stripe.createPaymentMethod({
               type: 'card',
               card: elements.getElement(CardElement),
           });
           
           if (error) {
               toast.error(error.message);
               return;
           }
           
           // Confirmer le paiement avec le backend
           const response = await fetch('/api/v1/payments/stripe/confirm', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                   payment_method_id: paymentMethod.id,
                   amount: amount,
               }),
           });
           
           const result = await response.json();
           if (result.success) {
               onSuccess(result);
           }
       };
       
       return (
           <form onSubmit={handleSubmit}>
               <CardElement />
               <button type="submit">Payer</button>
           </form>
       );
   }
   ```

---

## ⚙️ Configuration Backend

### 1. Mettre à jour les services de paiement

Tous les services doivent implémenter une interface commune:

```php
// src/Service/PaymentGatewayInterface.php
interface PaymentGatewayInterface
{
    public function initiatePayment(array $data): array;
    public function verifyPayment(string $transactionId): bool;
    public function handleWebhook(array $data): void;
}
```

### 2. Créer un PaymentGatewayFactory

```php
// src/Service/PaymentGatewayFactory.php
class PaymentGatewayFactory
{
    public static function create(string $method): PaymentGatewayInterface
    {
        return match($method) {
            'wave' => new WaveService(),
            'orange_money' => new OrangeMoneyService(),
            'mtn_money' => new MtnMobileMoneyService(),
            'moov_money' => new MoovMoneyService(),
            'card' => new StripeService(),
            default => throw new \InvalidArgumentException("Méthode de paiement inconnue: $method"),
        };
    }
}
```

### 3. Mettre à jour PaymentController

```php
#[Route('/initiate', name: 'payment_initiate', methods: ['POST'])]
public function initiatePayment(Request $request): JsonResponse
{
    $data = json_decode($request->getContent(), true);
    $method = $data['payment_method'] ?? null;
    
    if (!$method) {
        return $this->json(['error' => 'Méthode de paiement requise'], 400);
    }
    
    $gateway = PaymentGatewayFactory::create($method);
    $result = $gateway->initiatePayment($data);
    
    // Sauvegarder le paiement en base
    $payment = new Payment();
    $payment->setUser($this->getUser());
    $payment->setAmount($data['amount']);
    $payment->setPaymentMethod($method);
    $payment->setStatus('pending');
    $payment->setTransactionId($result['transaction_id'] ?? null);
    $payment->setMetadata($data);
    
    $this->entityManager->persist($payment);
    $this->entityManager->flush();
    
    return $this->json([
        'success' => true,
        'payment_url' => $result['payment_url'] ?? null,
        'payment_id' => $payment->getId(),
    ]);
}
```

---

## 🔔 Webhooks

### Configuration des Webhooks

Chaque service de paiement nécessite un endpoint webhook pour confirmer les paiements:

```php
// src/Controller/PaymentController.php

#[Route('/webhook/{method}', name: 'payment_webhook', methods: ['POST'])]
public function webhook(string $method, Request $request): JsonResponse
{
    $gateway = PaymentGatewayFactory::create($method);
    $data = json_decode($request->getContent(), true);
    
    // Vérifier la signature
    if (!$gateway->verifyWebhook($data, $request->headers->all())) {
        return $this->json(['error' => 'Signature invalide'], 401);
    }
    
    // Traiter le webhook
    $gateway->handleWebhook($data);
    
    return $this->json(['message' => 'OK'], 200);
}
```

### URLs de Webhook à configurer

- **Wave**: `https://votre-domaine.com/api/v1/payments/webhook/wave`
- **Orange Money**: `https://votre-domaine.com/api/v1/payments/webhook/orange_money`
- **MTN**: `https://votre-domaine.com/api/v1/payments/webhook/mtn_money`
- **Stripe**: `https://votre-domaine.com/api/v1/payments/webhook/card`

---

## 🧪 Tests

### Tests en Mode Sandbox

1. **Wave Sandbox**
   - Utilisez les numéros de test fournis par Wave
   - Les paiements ne sont pas réels

2. **Orange Money Sandbox**
   - Créez un compte de test
   - Utilisez les credentials de test

3. **Stripe Test Mode**
   - Utilisez les cartes de test: `4242 4242 4242 4242`
   - CVV: n'importe quel 3 chiffres
   - Date: n'importe quelle date future

### Checklist de Tests

- [ ] Initiation de paiement fonctionne
- [ ] Redirection vers le service de paiement
- [ ] Webhook reçoit les notifications
- [ ] Paiement réussi active l'abonnement
- [ ] Paiement échoué affiche un message d'erreur
- [ ] Les transactions sont enregistrées en base
- [ ] Les emails de confirmation sont envoyés

---

## 📝 Checklist de Déploiement

### Avant la mise en production:

- [ ] Tous les services sont configurés avec les clés de production
- [ ] Les webhooks sont configurés sur les plateformes de paiement
- [ ] Les URLs de callback sont en HTTPS
- [ ] Les tests en mode sandbox sont réussis
- [ ] La gestion d'erreurs est complète
- [ ] Les logs sont configurés
- [ ] Le monitoring est en place
- [ ] Les emails de confirmation sont testés

---

## 🔒 Sécurité

### Bonnes Pratiques

1. **Ne jamais exposer les clés secrètes**
   - Utiliser les variables d'environnement
   - Ne pas commiter les `.env` dans Git

2. **Vérifier les signatures des webhooks**
   - Toujours valider les signatures avant de traiter

3. **Utiliser HTTPS**
   - Tous les endpoints de paiement doivent être en HTTPS

4. **Limiter les tentatives**
   - Implémenter un rate limiting sur les endpoints de paiement

5. **Logger toutes les transactions**
   - Garder un historique complet pour le debugging

---

## 📞 Support

Pour toute question ou problème:
- **Wave**: https://help.wave.com
- **Orange Money**: https://developer.orange.com
- **MTN**: Contactez le support MTN de votre pays
- **Stripe**: https://support.stripe.com

---

**Dernière mise à jour**: 2026
**Version**: 1.0.0
