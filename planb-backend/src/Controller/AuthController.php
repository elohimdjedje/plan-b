<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\SMSService;
use App\Service\SecurityLogger;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Rfc\RFC2104TokenGenerator;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

#[Route('/api/v1/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private ValidatorInterface $validator,
        private SMSService $smsService,
        private SecurityLogger $securityLogger,
        private RequestStack $requestStack,
        private CacheInterface $cache,
        private JWTTokenManagerInterface $jwtManager
    ) {
    }

#[Route('/send-otp', name: 'auth_send_otp', methods: ['POST'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function sendOTP(Request $request, RateLimiterFactory $loginLimiter): JsonResponse
    {
        $limiter = $loginLimiter->create($request->getClientIp());
        if (!$limiter->consume(1)->isAccepted()) {
            return $this->json(['error' => 'Trop de tentatives. Réessayez dans 10 minutes.'], Response::HTTP_TOO_MANY_REQUESTS);
        }

        $data = json_decode($request->getContent(), true);
        $phone = $data['phone'] ?? null;

        if (!$phone || !$this->smsService->validatePhoneNumber($phone)) {
            return $this->json(['error' => 'Numéro de téléphone invalide'], Response::HTTP_BAD_REQUEST);
        }

        $code = $this->smsService->generateOTP();
        
        // Stocker dans le cache (CORRECTEMENT)
        $cacheKey = "otp_{$phone}";
        $cacheItem = $this->cache->getItem($cacheKey);
        $cacheItem->set($code);
        $cacheItem->expiresAfter(300); // 5 minutes
        $this->cache->save($cacheItem);

        // Log du code OTP en mode développement
        if ($_ENV['APP_ENV'] === 'dev') {
            error_log("\n========================================");
            error_log("📱 OTP CODE FOR {$phone}");
            error_log("🔐 CODE: {$code}");
            error_log("⏰ Valid for 5 minutes");
            error_log("✅ Stored in cache: {$cacheKey}");
            error_log("========================================\n");
        }

        $sent = $this->smsService->sendOTP($phone, $code);

        if (!$sent) {
            return $this->json([
                'error' => 'Échec de l\'envoi du SMS. Veuillez réessayer.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json([
            'message' => 'Code envoyé par SMS',
            'expiresIn' => 300
        ]);
    }

    #[Route('/verify-otp', name: 'auth_verify_otp', methods: ['POST'])]
    public function verifyOTP(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $phone = $data['phone'] ?? null;
        $code = $data['code'] ?? null;

        // Log pour debug
        if ($_ENV['APP_ENV'] === 'dev') {
            error_log("🔍 Verify OTP - Phone: {$phone}, Code: {$code}");
        }

        if (!$phone || !$code) {
            return $this->json(['error' => 'Téléphone et code requis'], Response::HTTP_BAD_REQUEST);
        }

        $cacheKey = "otp_{$phone}";
        $cacheItem = $this->cache->getItem($cacheKey);
        $storedCode = $cacheItem->isHit() ? $cacheItem->get() : null;

        // Log pour debug
        if ($_ENV['APP_ENV'] === 'dev') {
            error_log("🔍 Cache Key: {$cacheKey}");
            error_log("🔍 Stored Code: " . ($storedCode ?? 'NULL'));
            error_log("🔍 Cache Hit: " . ($cacheItem->isHit() ? 'YES' : 'NO'));
        }

        if (!$storedCode) {
            return $this->json(['error' => 'Code expiré ou introuvable'], Response::HTTP_BAD_REQUEST);
        }

        if ($storedCode !== $code) {
            error_log("❌ Code mismatch - Expected: {$storedCode}, Got: {$code}");
            return $this->json(['error' => 'Code incorrect'], Response::HTTP_BAD_REQUEST);
        }

        // Supprimer l'OTP et marquer le téléphone comme vérifié
        $this->cache->deleteItem($cacheKey);
        
        $verifiedKey = "phone_verified_{$phone}";
        $verifiedItem = $this->cache->getItem($verifiedKey);
        $verifiedItem->set(true);
        $verifiedItem->expiresAfter(3600); // 1 heure pour compléter l'inscription
        $this->cache->save($verifiedItem);

        if ($_ENV['APP_ENV'] === 'dev') {
            error_log("✅ Phone verified: {$phone}");
        }

        return $this->json(['message' => 'Téléphone vérifié avec succès']);
    }

    #[Route('/login', name: 'auth_login', methods: ['POST'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function login(Request $request, RateLimiterFactory $loginLimiter): JsonResponse
    {
        $limiter = $loginLimiter->create($request->getClientIp());
        if (!$limiter->consume(1)->isAccepted()) {
            return $this->json(['error' => 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'], Response::HTTP_TOO_MANY_REQUESTS);
        }

        $data = json_decode($request->getContent(), true);
        
        $username = $data['username'] ?? $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!$username || !$password) {
            return $this->json([
                'error' => 'Email et mot de passe requis'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Chercher l'utilisateur par email
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $username]);

        if (!$user) {
            $this->securityLogger->logFailedLogin($username, $request, 'Utilisateur introuvable');
            return $this->json([
                'error' => 'Identifiants invalides'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier le mot de passe
        if (!$this->passwordHasher->isPasswordValid($user, $password)) {
            $this->securityLogger->logFailedLogin($username, $request, 'Mot de passe incorrect');
            return $this->json([
                'error' => 'Identifiants invalides'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Générer un JWT token avec Lexik
        $token = $this->jwtManager->create($user);

        $this->securityLogger->logLogin($user, $request);

        return $this->json([
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'fullName' => $user->getFullName(),
                'accountType' => $user->getAccountType(),
                'isPro' => $user->isPro(),
            ]
        ]);
    }

    #[Route('/register', name: 'auth_register', methods: ['POST'])]
    #[IsGranted('PUBLIC_ACCESS')]
    public function register(Request $request, RateLimiterFactory $registerLimiter): JsonResponse
    {
        $limiter = $registerLimiter->create($request->getClientIp());
        if (!$limiter->consume(1)->isAccepted()) {
            return $this->json(['error' => 'Trop d\'inscriptions. Veuillez réessayer après 1 heure.'], Response::HTTP_TOO_MANY_REQUESTS);
        }

        $data = json_decode($request->getContent(), true);

        // Champs requis simplifiés : email, password, firstName, lastName
        $requiredFields = ['email', 'password', 'firstName', 'lastName'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return $this->json([
                    'error' => "Le champ $field est requis"
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        $user = new User();
        $user->setEmail($data['email'])
            ->setFirstName($data['firstName'])
            ->setLastName($data['lastName'])
            ->setAccountType('FREE')
            ->setIsEmailVerified(false)
            ->setIsPhoneVerified(false);

        // Champs optionnels
        if (isset($data['country']) && !empty($data['country'])) {
            $user->setCountry($data['country']);
        }
        if (isset($data['nationality']) && !empty($data['nationality'])) {
            $user->setNationality($data['nationality']);
        }

        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()][] = $error->getMessage();
            }
            
            // Log pour debug
            if ($_ENV['APP_ENV'] === 'dev') {
                error_log("❌ Validation errors:");
                error_log(json_encode($errorMessages, JSON_PRETTY_PRINT));
            }
            
            return $this->json([
                'error' => 'Erreur de validation',
                'details' => $errorMessages
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $this->entityManager->persist($user);
            $this->entityManager->flush();

            $this->securityLogger->logRegister($user, $request);

            return $this->json([
                'message' => 'Inscription réussie',
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'accountType' => $user->getAccountType(),
                ]
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            // Log pour debug
            if ($_ENV['APP_ENV'] === 'dev') {
                error_log("❌ Registration exception:");
                error_log($e->getMessage());
                error_log($e->getTraceAsString());
            }
            
            return $this->json([
                'error' => 'Erreur lors de l\'inscription',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/me', name: 'auth_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'phone' => $user->getPhone(),
            'whatsappPhone' => $user->getWhatsappPhone(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'fullName' => $user->getFullName(),
            'bio' => $user->getBio(),
            'roles' => $user->getRoles(),
            'accountType' => $user->getAccountType(),
            'isPro' => $user->isPro(),
            'isLifetimePro' => $user->isLifetimePro(),
            'country' => $user->getCountry(),
            'nationality' => $user->getNationality(),
            'city' => $user->getCity(),
            'profilePicture' => $user->getProfilePicture(),
            'isEmailVerified' => $user->isEmailVerified(),
            'isPhoneVerified' => $user->isPhoneVerified(),
            'subscriptionExpiresAt' => $user->getSubscriptionExpiresAt()?->format('c'),
            'subscriptionStartDate' => $user->getSubscriptionStartDate()?->format('c'),
            'createdAt' => $user->getCreatedAt()?->format('c'),
        ]);
    }

    #[Route('/verify-email', name: 'auth_verify_email', methods: ['POST'])]
    public function verifyEmail(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $user->setIsEmailVerified(true);
        $this->entityManager->flush();

        return $this->json(['message' => 'Email vérifié avec succès']);
    }

    #[Route('/verify-phone', name: 'auth_verify_phone', methods: ['POST'])]
    public function verifyPhone(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        $code = $data['code'] ?? null;

        if (!$code) {
            return $this->json(['error' => 'Code requis'], Response::HTTP_BAD_REQUEST);
        }

        $cacheKey = "otp_{$user->getPhone()}";
        $storedCode = $this->cache->get($cacheKey, fn() => null);

        if (!$storedCode || $storedCode !== $code) {
            return $this->json(['error' => 'Code invalide ou expiré'], Response::HTTP_BAD_REQUEST);
        }

        $user->setIsPhoneVerified(true);
        $this->entityManager->flush();

        $this->cache->delete($cacheKey);

        return $this->json(['message' => 'Téléphone vérifié avec succès']);
    }

    #[Route('/update-profile', name: 'auth_update_profile', methods: ['PUT', 'PATCH'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        // Mettre à jour les champs optionnels
        if (isset($data['bio'])) {
            $user->setBio($data['bio']);
        }
        if (isset($data['whatsappPhone'])) {
            $user->setWhatsappPhone($data['whatsappPhone']);
        }
        if (isset($data['country'])) {
            $user->setCountry($data['country']);
        }
        if (isset($data['city'])) {
            $user->setCity($data['city']);
        }
        if (isset($data['firstName'])) {
            $user->setFirstName($data['firstName']);
        }
        if (isset($data['lastName'])) {
            $user->setLastName($data['lastName']);
        }

        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()][] = $error->getMessage();
            }
            
            return $this->json([
                'error' => 'Erreur de validation',
                'details' => $errorMessages
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Profil mis à jour avec succès',
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'bio' => $user->getBio(),
                    'whatsappPhone' => $user->getWhatsappPhone(),
                    'country' => $user->getCountry(),
                    'city' => $user->getCity(),
                ]
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la mise à jour du profil',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
