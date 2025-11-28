# 🎯 PLAN D'IMPLÉMENTATION BACKEND - CORRECTIONS

---

## ✅ FICHIERS DÉJÀ CRÉÉS (Phases 1-3)

### Phase 1 : Entités ✅
- ✅ `src/Entity/Favorite.php`
- ✅ `src/Repository/FavoriteRepository.php`
- ✅ `src/Entity/Conversation.php`
- ✅ `src/Repository/ConversationRepository.php`
- ✅ `src/Entity/Message.php`
- ✅ `src/Repository/MessageRepository.php`
- ✅ `src/Entity/Report.php`
- ✅ `src/Repository/ReportRepository.php`
- ✅ `src/Entity/RefreshToken.php`
- ✅ `src/Repository/RefreshTokenRepository.php`
- ✅ `src/Entity/SecurityLog.php`
- ✅ `src/Repository/SecurityLogRepository.php`

### Phase 2 : Controllers ✅
- ✅ `src/Controller/FavoriteController.php`
- ✅ `src/Controller/ConversationController.php`
- ✅ `src/Controller/MessageController.php`
- ✅ `src/Controller/ReportController.php`

### Phase 3 : Services ✅
- ✅ `src/Service/SMSService.php`
- ✅ `src/Service/SecurityLogger.php`
- ✅ `src/Service/NotificationService.php`

### Phase 4 : Corrections .env ✅
- ✅ Prix PRO corrigé : 10,000 FCFA
- ✅ Configuration SMS ajoutée

---

## 🔧 ÉTAPES SUIVANTES À FAIRE MANUELLEMENT

### 1. Créer les Migrations SQL

```bash
cd planb-backend

# Générer migrations pour toutes les nouvelles entités
php bin/console make:migration

# Exécuter les migrations
php bin/console doctrine:migrations:migrate
```

### 2. Corriger AuthController pour Vérification SMS

**Fichier** : `src/Controller/AuthController.php`

**Ajouter ces routes** :

```php
use App\Service\SMSService;
use App\Service\SecurityLogger;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

// Dans le constructeur, ajouter :
private SMSService $smsService,
private SecurityLogger $securityLogger,
private SessionInterface $session

// Route : Envoyer OTP
#[Route('/send-otp', name: 'auth_send_otp', methods: ['POST'])]
public function sendOTP(Request $request): JsonResponse
{
    $data = json_decode($request->getContent(), true);
    $phone = $data['phone'] ?? null;

    if (!$phone || !$this->smsService->validatePhoneNumber($phone)) {
        return $this->json(['error' => 'Numéro invalide'], 400);
    }

    // Générer code
    $code = $this->smsService->generateOTP();
    
    // Stocker en session (ou Redis en production)
    $this->session->set("otp_{$phone}", [
        'code' => $code,
        'expires' => time() + 300 // 5 minutes
    ]);

    // Envoyer SMS
    $sent = $this->smsService->sendOTP($phone, $code);

    if (!$sent) {
        return $this->json(['error' => 'Échec envoi SMS'], 500);
    }

    return $this->json([
        'message' => 'Code envoyé',
        'expiresIn' => 300
    ]);
}

// Route : Vérifier OTP
#[Route('/verify-otp', name: 'auth_verify_otp', methods: ['POST'])]
public function verifyOTP(Request $request): JsonResponse
{
    $data = json_decode($request->getContent(), true);
    $phone = $data['phone'] ?? null;
    $code = $data['code'] ?? null;

    if (!$phone || !$code) {
        return $this->json(['error' => 'Données manquantes'], 400);
    }

    // Récupérer OTP stocké
    $storedData = $this->session->get("otp_{$phone}");

    if (!$storedData) {
        return $this->json(['error' => 'Code expiré'], 400);
    }

    if ($storedData['expires'] < time()) {
        $this->session->remove("otp_{$phone}");
        return $this->json(['error' => 'Code expiré'], 400);
    }

    if ($storedData['code'] !== $code) {
        return $this->json(['error' => 'Code incorrect'], 400);
    }

    // Code valide
    $this->session->remove("otp_{$phone}");
    $this->session->set("phone_verified_{$phone}", true);

    return $this->json(['message' => 'Téléphone vérifié']);
}

// Modifier register() pour vérifier OTP d'abord
#[Route('/register', name: 'auth_register', methods: ['POST'])]
public function register(Request $request): JsonResponse
{
    $data = json_decode($request->getContent(), true);

    // NOUVEAU : Vérifier que le téléphone a été vérifié
    $phone = $data['phone'] ?? null;
    if (!$this->session->get("phone_verified_{$phone}")) {
        return $this->json([
            'error' => 'Veuillez d\'abord vérifier votre numéro'
        ], 403);
    }

    // ... reste du code existant ...
    
    // Après création, logger
    $this->securityLogger->logRegister($user, $request);
}
```

### 3. Corriger ListingController pour Quota FREE

**Fichier** : `src/Controller/ListingController.php`

**Au début de la méthode `create()`, ajouter** :

```php
// VÉRIFICATION QUOTA FREE
if (!$user->isPro()) {
    $activeCount = $this->listingRepository->count([
        'user' => $user,
        'status' => 'active'
    ]);
    
    if ($activeCount >= 3) {
        return $this->json([
            'error' => 'QUOTA_EXCEEDED',
            'message' => 'Vous avez atteint la limite de 3 annonces actives. Passez en PRO pour publier sans limite.',
            'currentListings' => $activeCount,
            'maxListings' => 3
        ], 403);
    }
}

// DURÉE D'EXPIRATION SELON TYPE DE COMPTE
$duration = $user->isPro() ? 60 : 30;
$listing->setExpiresAt(new \DateTime("+{$duration} days"));
```

### 4. Ajouter Rate Limiting

**Créer** : `config/packages/rate_limiter.yaml`

```yaml
framework:
    rate_limiter:
        login:
            policy: 'sliding_window'
            limit: 5
            interval: '1 minute'
            
        register:
            policy: 'fixed_window'
            limit: 3
            interval: '1 hour'
            
        send_sms:
            policy: 'fixed_window'
            limit: 3
            interval: '10 minutes'
            
        create_listing:
            policy: 'sliding_window'
            limit: 10
            interval: '1 hour'
```

**Utiliser dans AuthController** :

```php
use Symfony\Component\RateLimiter\RateLimiterFactory;

#[Route('/login', ...)]
public function login(
    Request $request,
    #[RateLimiter('login')] RateLimiterFactory $loginLimiter
): JsonResponse {
    $limiter = $loginLimiter->create($request->getClientIp());
    
    if (!$limiter->consume(1)->isAccepted()) {
        return $this->json([
            'error' => 'Trop de tentatives. Réessayez dans 1 minute.'
        ], 429);
    }
    
    // ... reste du code
}
```

### 5. Installer Dépendances Manquantes

```bash
composer require symfony/http-client
composer require symfony/rate-limiter
composer require symfony/mailer
```

### 6. Créer Commande pour Nettoyer les Tokens Expirés

**Créer** : `src/Command/CleanupRefreshTokensCommand.php`

```php
<?php

namespace App\Command;

use App\Repository\RefreshTokenRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:cleanup-tokens',
    description: 'Supprimer les refresh tokens expirés'
)]
class CleanupRefreshTokensCommand extends Command
{
    public function __construct(
        private RefreshTokenRepository $refreshTokenRepository
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $count = $this->refreshTokenRepository->deleteExpired();
        $output->writeln("$count tokens expirés supprimés.");
        
        return Command::SUCCESS;
    }
}
```

**Configurer Cron** (en production) :

```cron
# Tous les jours à 2h du matin
0 2 * * * cd /path/to/planb-backend && php bin/console app:cleanup-tokens
```

### 7. Tester les Endpoints

```bash
# Test envoi OTP
curl -X POST http://localhost:8000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+225070000000"}'

# Test vérification OTP
curl -X POST http://localhost:8000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+225070000000", "code": "123456"}'

# Test ajout favori
curl -X POST http://localhost:8000/api/v1/favorites/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test liste conversations
curl -X GET http://localhost:8000/api/v1/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 RÉCAPITULATIF

### Ce qui est fait ✅
- ✅ 12 fichiers d'entités créés
- ✅ 4 controllers créés  
- ✅ 3 services créés
- ✅ Prix PRO corrigé
- ✅ Config SMS ajoutée

### À faire manuellement ⚠️
1. ⚠️ Exécuter migrations SQL
2. ⚠️ Modifier AuthController (ajouterOTP routes)
3. ⚠️ Modifier ListingController (ajouter vérification quota)
4. ⚠️ Créer rate_limiter.yaml
5. ⚠️ Installer dépendances
6. ⚠️ Créer commande cleanup
7. ⚠️ Tester endpoints

### Temps estimé pour finir ⏱️
**2-3 heures** pour un développeur expérimenté

---

## 🚀 PROCHAINE ÉTAPE

**Phase 5** : Créer composants React frontend

Voulez-vous que je continue avec la Phase 5 (frontend) ou préférez-vous d'abord tester le backend ?

**Répondez :**
- "Continue Phase 5" → Je crée les composants React
- "Test backend first" → Je vous donne un guide de test complet
