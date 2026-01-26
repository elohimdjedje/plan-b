# 💳 Intégration Paiement Wave - Guide Complet

## 📋 Comment fonctionne le paiement Wave ?

### Flux Utilisateur Complet

```
1. Client clique "Passer PRO"
   ↓
2. Page WavePayment.jsx
   → Client saisit son numéro Wave
   ↓
3. Redirection vers Wave
   → URL: https://pay.wave.com/m/M_qMsEKvTXZo-1
   ↓
4. Wave envoie notification au téléphone
   → Client valide sur son app Wave
   ↓
5. Wave redirige vers votre site
   → Succès: /payment/success
   → Annulation: /payment/cancel
   ↓
6. Mise à jour du compte en PRO
```

---

## 🎯 Méthodes d'Intégration

### Méthode 1: Redirection Simple (IMPLÉMENTÉE)

**Avantages:**
- ✅ Simple et rapide
- ✅ Pas besoin d'API Wave
- ✅ Wave gère tout le processus

**Code actuel dans WavePayment.jsx:**
```javascript
const wavePaymentLink = 'https://pay.wave.com/m/M_qMsEKvTXZo-1';

const params = new URLSearchParams({
  amount: 10000,
  phone: phoneNumber,
  currency: 'XOF',
  return_url: `${window.location.origin}/payment/success`,
  cancel_url: `${window.location.origin}/payment/cancel`
});

window.location.href = `${wavePaymentLink}?${params.toString()}`;
```

**Ce qui se passe:**
1. Client entre son numéro: `77 123 45 67`
2. On redirige vers Wave avec ces infos
3. Wave vérifie si le numéro a un compte actif
4. Si OUI → Envoie notification push
5. Client valide sur son téléphone
6. Wave redirige vers `/payment/success`

---

### Méthode 2: API Backend (RECOMMANDÉE pour Production)

**Pourquoi c'est mieux?**
- ✅ Plus sécurisé (pas d'infos sensibles dans l'URL)
- ✅ Vous contrôlez la vérification du paiement
- ✅ Historique des transactions
- ✅ Webhooks pour confirmation automatique

**Architecture:**
```
Frontend (React)
    ↓ POST /api/payment/wave/init
Backend (Symfony)
    ↓ Appel API Wave
Wave API
    ↓ Retour payment_url
Frontend
    ↓ Redirection
Wave Page Paiement
    ↓ Client valide
Wave Webhook → Backend
    ↓ Confirmation
Backend → Base de données
    ↓ Mise à jour statut PRO
Frontend → /payment/success
```

---

## 🔧 Configuration Backend Symfony

### 1. Créer le contrôleur de paiement

**Fichier: `src/Controller/PaymentController.php`**
```php
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/api/payment')]
class PaymentController extends AbstractController
{
    private $httpClient;
    
    public function __construct(HttpClientInterface $httpClient)
    {
        $this->httpClient = $httpClient;
    }
    
    /**
     * Initier un paiement Wave
     */
    #[Route('/wave/init', methods: ['POST'])]
    public function initiateWavePayment(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $phoneNumber = $data['phoneNumber'];
        $amount = $data['amount'];
        $currency = $data['currency'] ?? 'XOF';
        
        // Appel API Wave pour créer une transaction
        $response = $this->httpClient->request('POST', 'https://api.wave.com/v1/checkout/sessions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $_ENV['WAVE_API_KEY'],
                'Content-Type' => 'application/json'
            ],
            'json' => [
                'amount' => $amount,
                'currency' => $currency,
                'client_reference' => uniqid('planb_'),
                'success_url' => $_ENV['FRONTEND_URL'] . '/payment/success',
                'cancel_url' => $_ENV['FRONTEND_URL'] . '/payment/cancel',
                'metadata' => [
                    'phone' => $phoneNumber,
                    'user_id' => $this->getUser()->getId()
                ]
            ]
        ]);
        
        $waveData = $response->toArray();
        
        // Sauvegarder la transaction en base
        // ... (code de sauvegarde)
        
        return new JsonResponse([
            'payment_url' => $waveData['wave_launch_url'],
            'transaction_id' => $waveData['id']
        ]);
    }
    
    /**
     * Webhook Wave pour confirmation automatique
     */
    #[Route('/wave/webhook', methods: ['POST'])]
    public function handleWaveWebhook(Request $request): JsonResponse
    {
        $signature = $request->headers->get('X-Wave-Signature');
        
        // Vérifier la signature Wave
        // ...
        
        $data = json_decode($request->getContent(), true);
        
        if ($data['type'] === 'checkout.completed') {
            $transactionId = $data['id'];
            $userId = $data['metadata']['user_id'];
            
            // Mettre à jour l'utilisateur en PRO
            // $userRepository->upgradeToPro($userId);
            
            // Envoyer email de confirmation
            // ...
        }
        
        return new JsonResponse(['status' => 'ok']);
    }
}
```

### 2. Configurer les variables d'environnement

**Fichier: `.env`**
```env
# API Wave
WAVE_API_KEY=your_wave_api_key_here
WAVE_WEBHOOK_SECRET=your_webhook_secret

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 3. Créer l'entité Transaction

```php
<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Transaction
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $waveTransactionId = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    private ?User $user = null;

    #[ORM\Column]
    private ?int $amount = null;

    #[ORM\Column(length: 50)]
    private ?string $status = 'pending'; // pending, completed, failed

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    // Getters et Setters...
}
```

---

## 🌐 Comment obtenir une clé API Wave

### Option 1: Wave Business (RECOMMANDÉE)

1. **Créer un compte Wave Business**
   - Allez sur: https://www.wave.com/business
   - Inscrivez-vous avec votre entreprise

2. **Accéder au Dashboard**
   - Se connecter à l'espace marchand
   - Aller dans "Paramètres" → "Développeurs"

3. **Créer une clé API**
   - Cliquez sur "Nouvelle clé API"
   - Notez la clé secrète (elle ne sera affichée qu'une fois!)

4. **Configurer le Webhook**
   - URL Webhook: `https://votre-domaine.com/api/payment/wave/webhook`
   - Événements à écouter: `checkout.completed`, `checkout.failed`

### Option 2: Lien de Paiement Simple (ACTUEL)

Votre lien actuel: `https://pay.wave.com/m/M_qMsEKvTXZo-1`

**Fonctionnement:**
- ✅ Pas besoin d'API
- ✅ Redirection directe
- ❌ Pas de vérification automatique
- ❌ Pas d'historique dans votre app

---

## 📱 Test en Développement

### Simuler un paiement Wave

Wave n'a pas d'environnement de test public. Vous devez :

1. **Utiliser un compte Wave réel** en mode test
2. **Faire de vrais petits paiements** (100 FCFA pour tester)
3. **Rembourser après test**

### Code de test dans WavePayment.jsx

```javascript
// Mode développement - Simuler le paiement
if (import.meta.env.DEV) {
  console.log('Mode DEV: Simulation paiement');
  
  setTimeout(() => {
    // Simuler succès
    window.location.href = '/payment/success?test=true';
    
    // OU simuler échec
    // window.location.href = '/payment/cancel?test=true';
  }, 2000);
  
  return;
}

// Mode production - Vrai paiement Wave
window.location.href = `${wavePaymentLink}?${params.toString()}`;
```

---

## ✅ Checklist d'Intégration

### Frontend (FAIT ✅)
- [x] Page WavePayment.jsx avec formulaire
- [x] Redirection vers Wave avec paramètres
- [x] Page PaymentSuccess.jsx
- [x] Page PaymentCancel.jsx
- [x] Routes configurées dans App.jsx
- [x] Mise à jour du statut PRO dans authStore

### Backend (À FAIRE)
- [ ] Contrôleur PaymentController.php
- [ ] Entité Transaction
- [ ] Route `/api/payment/wave/init`
- [ ] Route `/api/payment/wave/webhook`
- [ ] Enregistrement des transactions en BDD
- [ ] Email de confirmation
- [ ] Logs des paiements

### Configuration Wave
- [ ] Créer compte Wave Business
- [ ] Obtenir clé API
- [ ] Configurer webhook
- [ ] Tester en production

---

## 🔒 Sécurité

### Bonnes Pratiques

1. **Vérifier la signature du webhook**
```php
$signature = $request->headers->get('X-Wave-Signature');
$payload = $request->getContent();
$computedSignature = hash_hmac('sha256', $payload, $_ENV['WAVE_WEBHOOK_SECRET']);

if (!hash_equals($signature, $computedSignature)) {
    return new JsonResponse(['error' => 'Invalid signature'], 401);
}
```

2. **Valider le montant côté backend**
```php
// Toujours vérifier que le montant correspond
if ($data['amount'] !== 10000) {
    // Alerte fraude
}
```

3. **Idempotence (éviter les doubles paiements)**
```php
// Vérifier si la transaction existe déjà
$existing = $transactionRepo->findOneBy(['waveTransactionId' => $data['id']]);
if ($existing) {
    return; // Déjà traité
}
```

---

## 📊 Tableau de Bord des Paiements

Créez une page admin pour voir :
- Liste des transactions
- Statuts (pending, completed, failed)
- Montants
- Utilisateurs
- Dates

```javascript
// Frontend: src/pages/Admin/Transactions.jsx
// Backend: src/Controller/Admin/TransactionController.php
```

---

## 🆘 Debugging

### Logs à activer

**Frontend (console.log):**
```javascript
console.log('Numéro Wave:', phoneNumber);
console.log('URL de redirection:', fullUrl);
console.log('Retour Wave:', window.location.search);
```

**Backend (Monolog):**
```php
$this->logger->info('Wave payment initiated', [
    'user_id' => $userId,
    'amount' => $amount,
    'phone' => $phoneNumber
]);
```

---

## 📞 Support Wave

- **Email:** support@wave.com
- **Docs API:** https://developers.wave.com (si accessible)
- **WhatsApp Business:** Vérifier sur leur site

---

**Tout est prêt côté frontend ! Il reste juste à configurer le backend et obtenir les accès Wave.** 🚀
