<?php

namespace App\Controller;

use App\Entity\Payment;
use App\Entity\Subscription;
use App\Entity\User;
use App\Service\WaveService;
use App\Service\OrangeMoneyService;
use App\Service\MtnMobileMoneyService;
use App\Service\MoovMoneyService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/payments')]
class PaymentController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private WaveService $waveService,
        private OrangeMoneyService $orangeMoneyService,
        private MtnMobileMoneyService $mtnService,
        private MoovMoneyService $moovService
    ) {}

    /**
     * Confirmer le paiement Wave et activer le compte PRO
     * Cette route est appelée quand l'utilisateur revient de Wave après paiement
     * SANS API Wave payante - basé sur la confiance (à vérifier manuellement)
     */
    #[Route('/confirm-wave', name: 'app_payment_confirm_wave', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function confirmWavePayment(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        
        // Récupérer les données du paiement
        $months = $data['months'] ?? 1;
        $amount = $data['amount'] ?? 10000;
        $phoneNumber = $data['phoneNumber'] ?? null;
        
        // Valider les données
        if ($months < 1 || $months > 12) {
            return $this->json(['error' => 'Durée invalide (1-12 mois)'], 400);
        }
        
        // Calculer la date d'expiration
        $durationDays = $months * 30;
        $startDate = new \DateTimeImmutable();
        
        // Si l'utilisateur a déjà un abonnement actif, prolonger
        $currentExpiry = $user->getSubscriptionExpiresAt();
        if ($currentExpiry && $currentExpiry > $startDate) {
            $expiresAt = $currentExpiry->modify("+{$durationDays} days");
        } else {
            $expiresAt = $startDate->modify("+{$durationDays} days");
        }

        // Créer un enregistrement de paiement (pour historique)
        $payment = new Payment();
        $payment->setUser($user);
        $payment->setAmount($amount);
        $payment->setCurrency('XOF');
        $payment->setPaymentMethod('wave_link');
        $payment->setStatus('pending_verification'); // À vérifier manuellement
        $payment->setDescription("Abonnement PRO {$months} mois via Wave Link");
        $payment->setMetadata([
            'months' => $months,
            'type' => 'subscription',
            'phone' => $phoneNumber,
            'needs_manual_verification' => true
        ]);
        $payment->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($payment);

        // Vérifier/créer l'abonnement
        $subscription = $this->entityManager->getRepository(Subscription::class)
            ->findOneBy(['user' => $user]);

        if (!$subscription) {
            $subscription = new Subscription();
            $subscription->setUser($user);
            $subscription->setAccountType('PRO');
            $subscription->setStartDate($startDate);
            $subscription->setCreatedAt($startDate);
            $this->entityManager->persist($subscription);
        }

        $subscription->setStatus('active');
        $subscription->setExpiresAt($expiresAt);
        $subscription->setUpdatedAt(new \DateTimeImmutable());

        // Mettre à jour l'utilisateur en PRO
        $user->setAccountType('PRO');
        $user->setSubscriptionExpiresAt($expiresAt);
        $user->setUpdatedAt(new \DateTimeImmutable());

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Compte PRO activé avec succès',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'accountType' => 'PRO',
                'subscriptionExpiresAt' => $expiresAt->format('c')
            ],
            'subscription' => [
                'months' => $months,
                'amount' => $amount,
                'expiresAt' => $expiresAt->format('c'),
                'daysRemaining' => $durationDays
            ],
            'payment' => [
                'id' => $payment->getId(),
                'status' => 'pending_verification',
                'note' => 'Paiement à vérifier dans les transactions Wave'
            ]
        ], 200);
    }

    /**
     * Créer un paiement pour abonnement PRO avec choix du moyen de paiement
     * Supporte: wave, orange_money, mtn_money, moov_money, card
     */
    #[Route('/create-subscription', name: 'app_payment_create_subscription', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function createSubscriptionPayment(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        
        // Nombre de mois d'abonnement (1, 3, 6 ou 12)
        $months = $data['months'] ?? 1;
        if (!in_array($months, [1, 3, 6, 12])) {
            return $this->json(['error' => 'Durée invalide (1, 3, 6 ou 12 mois)'], 400);
        }

        // Méthode de paiement
        $paymentMethod = $data['paymentMethod'] ?? 'wave';
        $validMethods = ['wave', 'orange_money', 'mtn_money', 'moov_money', 'card'];
        if (!in_array($paymentMethod, $validMethods)) {
            return $this->json(['error' => 'Méthode de paiement invalide'], 400);
        }

        // Numéro de téléphone (requis pour mobile money)
        $phoneNumber = $data['phoneNumber'] ?? $user->getPhone();

        // Calcul du montant selon la durée
        $amounts = [
            1 => 5000,    // 5000 XOF pour 1 mois
            3 => 12000,   // 12000 XOF pour 3 mois (économie 3000)
            6 => 22000,   // 22000 XOF pour 6 mois (économie 8000)
            12 => 40000   // 40000 XOF pour 12 mois (économie 20000)
        ];
        $amount = $amounts[$months];
        $durationDays = $months * 30;

        // Créer l'enregistrement de paiement
        $payment = new Payment();
        $payment->setUser($user);
        $payment->setAmount($amount);
        $payment->setCurrency('XOF');
        $payment->setPaymentMethod($paymentMethod);
        $payment->setStatus('pending');
        $payment->setDescription("Abonnement PRO {$months} mois");
        $payment->setMetadata([
            'months' => $months,
            'duration_days' => $durationDays,
            'type' => 'subscription',
            'phone' => $phoneNumber
        ]);
        $payment->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($payment);
        $this->entityManager->flush();

        try {
            $result = $this->processPaymentByMethod($payment, $paymentMethod, $phoneNumber, $user);

            if (isset($result['error'])) {
                $payment->setStatus('failed');
                $payment->setErrorMessage($result['error']);
                $this->entityManager->flush();

                return $this->json([
                    'error' => $result['error'],
                    'details' => $result['details'] ?? null
                ], 400);
            }

            // Mettre à jour avec l'ID de transaction
            if (isset($result['transaction_id'])) {
                $payment->setTransactionId($result['transaction_id']);
            }
            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'payment' => [
                    'id' => $payment->getId(),
                    'amount' => $amount,
                    'currency' => 'XOF',
                    'months' => $months,
                    'status' => 'pending',
                    'paymentMethod' => $paymentMethod,
                    'paymentUrl' => $result['payment_url'] ?? null,
                    'transactionId' => $result['transaction_id'] ?? null,
                    'ussdCode' => $result['ussd_code'] ?? null
                ],
                'message' => $result['message'] ?? 'Paiement initié'
            ], 201);

        } catch (\Exception $e) {
            $payment->setStatus('failed');
            $payment->setErrorMessage($e->getMessage());
            $this->entityManager->flush();

            return $this->json([
                'error' => 'Erreur lors de la création du paiement',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Traiter le paiement selon la méthode choisie
     */
    private function processPaymentByMethod(Payment $payment, string $method, ?string $phone, User $user): array
    {
        $amount = (float) $payment->getAmount();
        $orderId = (string) $payment->getId();
        $description = $payment->getDescription();

        switch ($method) {
            case 'wave':
                $result = $this->waveService->createTransaction(
                    (int) $amount,
                    $description,
                    [
                        'firstname' => $user->getFirstName(),
                        'lastname' => $user->getLastName(),
                        'email' => $user->getEmail(),
                        'phone' => $phone ?? $user->getPhone()
                    ]
                );
                return [
                    'transaction_id' => $result['transaction_id'] ?? null,
                    'payment_url' => $result['payment_url'] ?? null,
                    'message' => 'Vous allez être redirigé vers Wave pour le paiement'
                ];

            case 'orange_money':
                $result = $this->orangeMoneyService->generatePaymentLink($amount, $orderId, $phone);
                if (isset($result['error'])) {
                    return $result;
                }
                return [
                    'transaction_id' => $result['payment_token'] ?? null,
                    'payment_url' => $result['payment_url'] ?? null,
                    'message' => 'Veuillez confirmer le paiement Orange Money sur votre téléphone'
                ];

            case 'mtn_money':
                if (!$phone) {
                    return ['error' => 'Numéro de téléphone requis pour MTN Mobile Money'];
                }
                $result = $this->mtnService->requestToPay($amount, $phone, $orderId, $description);
                if (isset($result['error'])) {
                    return $result;
                }
                return [
                    'transaction_id' => $result['reference_id'] ?? null,
                    'message' => 'Demande de paiement MTN envoyée. Veuillez confirmer sur votre téléphone.'
                ];

            case 'moov_money':
                if (!$phone) {
                    return ['error' => 'Numéro de téléphone requis pour Moov Money'];
                }
                $result = $this->moovService->requestPayment($amount, $phone, $orderId, $description);
                if (isset($result['error'])) {
                    return $result;
                }
                return [
                    'transaction_id' => $result['transaction_id'] ?? null,
                    'payment_url' => $result['payment_url'] ?? null,
                    'ussd_code' => $result['ussd_code'] ?? null,
                    'message' => 'Demande de paiement Moov envoyée. Veuillez confirmer sur votre téléphone.'
                ];

            case 'card':
                // Pour la carte bancaire, on utilise un provider comme Stripe ou Fedapay
                // Pour l'instant, retourner un placeholder
                return [
                    'message' => 'Paiement par carte bancaire - Intégration à venir',
                    'payment_url' => null
                ];

            default:
                return ['error' => 'Méthode de paiement non supportée'];
        }
    }

    /**
     * Callback MTN Mobile Money
     */
    #[Route('/mtn/callback/{orderId}', name: 'app_payment_mtn_callback', methods: ['POST'])]
    public function mtnCallback(int $orderId, Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->headers->get('X-Mtn-Signature', '');

        if (!$this->mtnService->verifyWebhook($payload, $signature)) {
            return $this->json(['error' => 'Signature invalide'], 401);
        }

        $data = json_decode($payload, true);
        $payment = $this->entityManager->getRepository(Payment::class)->find($orderId);

        if (!$payment) {
            return $this->json(['error' => 'Paiement non trouvé'], 404);
        }

        $status = strtolower($data['status'] ?? 'unknown');
        
        if ($status === 'successful') {
            $payment->setStatus('completed');
            $payment->setCompletedAt(new \DateTimeImmutable());
            $this->processSuccessfulPayment($payment);
        } elseif (in_array($status, ['failed', 'cancelled'])) {
            $payment->setStatus('failed');
            $payment->setErrorMessage($data['reason'] ?? 'Paiement refusé');
        }

        $this->entityManager->flush();
        return $this->json(['message' => 'Webhook traité'], 200);
    }

    /**
     * Callback Moov Money
     */
    #[Route('/moov/callback/{orderId}', name: 'app_payment_moov_callback', methods: ['POST'])]
    public function moovCallback(int $orderId, Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->headers->get('X-Moov-Signature', '');

        if (!$this->moovService->verifyWebhook($payload, $signature)) {
            return $this->json(['error' => 'Signature invalide'], 401);
        }

        $data = json_decode($payload, true);
        $payment = $this->entityManager->getRepository(Payment::class)->find($orderId);

        if (!$payment) {
            return $this->json(['error' => 'Paiement non trouvé'], 404);
        }

        $status = strtolower($data['status'] ?? 'unknown');
        
        if ($status === 'success') {
            $payment->setStatus('completed');
            $payment->setCompletedAt(new \DateTimeImmutable());
            $this->processSuccessfulPayment($payment);
        } elseif (in_array($status, ['failed', 'cancelled'])) {
            $payment->setStatus('failed');
            $payment->setErrorMessage($data['message'] ?? 'Paiement refusé');
        }

        $this->entityManager->flush();
        return $this->json(['message' => 'Webhook traité'], 200);
    }

    /**
     * Callback Orange Money
     */
    #[Route('/orange-money/callback/{orderId}', name: 'app_payment_orange_callback', methods: ['POST'])]
    public function orangeMoneyCallback(int $orderId, Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->headers->get('X-Orange-Signature', '');

        if (!$this->orangeMoneyService->verifyWebhook($payload, $signature)) {
            return $this->json(['error' => 'Signature invalide'], 401);
        }

        $data = json_decode($payload, true);
        $payment = $this->entityManager->getRepository(Payment::class)->find($orderId);

        if (!$payment) {
            return $this->json(['error' => 'Paiement non trouvé'], 404);
        }

        $status = strtolower($data['status'] ?? 'unknown');
        
        if ($status === 'success' || $status === 'completed') {
            $payment->setStatus('completed');
            $payment->setCompletedAt(new \DateTimeImmutable());
            $this->processSuccessfulPayment($payment);
        } elseif (in_array($status, ['failed', 'cancelled', 'expired'])) {
            $payment->setStatus('failed');
            $payment->setErrorMessage($data['message'] ?? 'Paiement refusé');
        }

        $this->entityManager->flush();
        return $this->json(['message' => 'Webhook traité'], 200);
    }

    /**
     * Traiter un paiement réussi (activer abonnement ou boost)
     */
    private function processSuccessfulPayment(Payment $payment): void
    {
        $metadata = $payment->getMetadata();
        $type = $metadata['type'] ?? null;

        if ($type === 'subscription') {
            $durationDays = $metadata['duration_days'] ?? ($metadata['months'] ?? 1) * 30;
            $this->activateSubscription($payment->getUser(), $durationDays);
        } elseif ($type === 'boost') {
            $listingId = $metadata['listing_id'] ?? null;
            if ($listingId) {
                $this->boostListingFeature($listingId);
            }
        }
    }

    /**
     * Obtenir les méthodes de paiement disponibles
     */
    #[Route('/methods', name: 'app_payment_methods', methods: ['GET'])]
    public function getPaymentMethods(): JsonResponse
    {
        return $this->json([
            'methods' => [
                [
                    'id' => 'wave',
                    'name' => 'Wave',
                    'description' => 'Paiement mobile Wave',
                    'countries' => ['SN', 'CI', 'ML', 'BF'],
                    'requiresPhone' => true,
                    'enabled' => true
                ],
                [
                    'id' => 'orange_money',
                    'name' => 'Orange Money',
                    'description' => 'Paiement mobile Orange',
                    'countries' => ['SN', 'CI', 'ML', 'BF', 'GN'],
                    'requiresPhone' => true,
                    'enabled' => true
                ],
                [
                    'id' => 'mtn_money',
                    'name' => 'MTN Mobile Money',
                    'description' => 'Paiement mobile MTN',
                    'countries' => ['CI', 'GH', 'CM', 'BJ'],
                    'requiresPhone' => true,
                    'enabled' => true
                ],
                [
                    'id' => 'moov_money',
                    'name' => 'Moov Money',
                    'description' => 'Paiement mobile Moov',
                    'countries' => ['CI', 'BF', 'BJ', 'TG'],
                    'requiresPhone' => true,
                    'enabled' => true
                ],
                [
                    'id' => 'card',
                    'name' => 'Carte Bancaire',
                    'description' => 'Visa, Mastercard',
                    'countries' => ['*'],
                    'requiresPhone' => false,
                    'enabled' => true
                ]
            ],
            'subscriptionPrices' => [
                1 => ['price' => 5000, 'label' => '1 mois'],
                3 => ['price' => 12000, 'label' => '3 mois', 'savings' => 3000],
                6 => ['price' => 22000, 'label' => '6 mois', 'savings' => 8000],
                12 => ['price' => 40000, 'label' => '12 mois', 'savings' => 20000]
            ]
        ]);
    }

    /**
     * Créer un paiement pour boost d'annonce
     */
    #[Route('/boost-listing', name: 'app_payment_boost_listing', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function boostListing(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);
        $listingId = $data['listing_id'] ?? null;

        if (!$listingId) {
            return $this->json(['error' => 'listing_id requis'], 400);
        }

        // Vérifier que l'annonce appartient à l'utilisateur
        $listing = $this->entityManager->getRepository('App\Entity\Listing')->find($listingId);
        if (!$listing || $listing->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Annonce non trouvée'], 404);
        }

        // Montant du boost: 1000 XOF pour 7 jours de mise en avant
        $amount = 1000;

        $payment = new Payment();
        $payment->setUser($user);
        $payment->setAmount($amount);
        $payment->setCurrency('XOF');
        $payment->setPaymentMethod('mobile_money');
        $payment->setStatus('pending');
        $payment->setDescription("Boost annonce #{$listingId}");
        $payment->setMetadata([
            'listing_id' => $listingId,
            'type' => 'boost',
            'duration_days' => 7
        ]);
        $payment->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($payment);
        $this->entityManager->flush();

        try {
            $waveResult = $this->waveService->createTransaction(
                $amount,
                "Boost annonce Plan B",
                [
                    'firstname' => $user->getFirstName(),
                    'lastname' => $user->getLastName(),
                    'email' => $user->getEmail(),
                    'phone' => $user->getPhone()
                ]
            );

            $payment->setTransactionId($waveResult['transaction_id']);
            $this->entityManager->flush();

            return $this->json([
                'payment' => [
                    'id' => $payment->getId(),
                    'amount' => $amount,
                    'currency' => 'XOF',
                    'listing_id' => $listingId,
                    'status' => 'pending',
                    'wave_url' => $waveResult['payment_url']
                ]
            ], 201);

        } catch (\Exception $e) {
            $payment->setStatus('failed');
            $payment->setErrorMessage($e->getMessage());
            $this->entityManager->flush();

            return $this->json([
                'error' => 'Erreur lors de la création du paiement',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Webhook Wave (notification de paiement)
     */
    #[Route('/callback', name: 'app_payment_callback', methods: ['POST'])]
    public function waveCallback(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->headers->get('X-Wave-Signature', '');

        // Vérifier la signature du webhook
        if (!$this->waveService->verifyWebhook($payload, $signature)) {
            return $this->json(['error' => 'Signature invalide'], 401);
        }

        $data = json_decode($payload, true);
        $transactionId = $data['transaction']['id'] ?? null;

        if (!$transactionId) {
            return $this->json(['error' => 'Transaction ID manquant'], 400);
        }

        // Trouver le paiement correspondant
        $payment = $this->entityManager->getRepository(Payment::class)
            ->findOneBy(['transactionId' => $transactionId]);

        if (!$payment) {
            return $this->json(['error' => 'Paiement non trouvé'], 404);
        }

        // Mettre à jour le statut (Wave utilise 'success', 'failed', 'cancelled')
        $status = $data['payment_status'] ?? $data['transaction']['status'] ?? 'unknown';
        
        if ($status === 'success' || $status === 'completed') {
            $payment->setStatus('completed');
            $payment->setCompletedAt(new \DateTimeImmutable());

            // Traiter le paiement selon le type
            $metadata = $payment->getMetadata();
            
            if ($metadata['type'] === 'subscription') {
                $this->activateSubscription($payment->getUser(), $metadata['duration']);
            } elseif ($metadata['type'] === 'boost') {
                $this->boostListingFeature($metadata['listing_id']);
            }

        } elseif ($status === 'failed' || $status === 'cancelled' || $status === 'canceled') {
            $payment->setStatus('failed');
            $payment->setErrorMessage('Paiement refusé ou annulé');
        }

        $this->entityManager->flush();

        return $this->json(['message' => 'Webhook traité'], 200);
    }

    /**
     * Vérifier le statut d'un paiement
     */
    #[Route('/{id}/status', name: 'app_payment_status', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getPaymentStatus(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $payment = $this->entityManager->getRepository(Payment::class)->find($id);

        if (!$payment || $payment->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Paiement non trouvé'], 404);
        }

        // Si le paiement est en attente, vérifier le statut sur Wave
        if ($payment->getStatus() === 'pending' && $payment->getTransactionId()) {
            try {
                $waveStatus = $this->waveService->getTransactionStatus($payment->getTransactionId());
                
                if ($waveStatus['status'] === 'success') {
                    $payment->setStatus('completed');
                    $payment->setCompletedAt(new \DateTimeImmutable());
                    
                    // Activer l'abonnement ou le boost
                    $metadata = $payment->getMetadata();
                    if ($metadata['type'] === 'subscription') {
                        $this->activateSubscription($user, $metadata['duration']);
                    }
                    
                    $this->entityManager->flush();
                }
            } catch (\Exception $e) {
                // Ignorer les erreurs de vérification
            }
        }

        return $this->json([
            'payment' => [
                'id' => $payment->getId(),
                'amount' => $payment->getAmount(),
                'currency' => $payment->getCurrency(),
                'status' => $payment->getStatus(),
                'description' => $payment->getDescription(),
                'createdAt' => $payment->getCreatedAt()->format('c'),
                'completedAt' => $payment->getCompletedAt()?->format('c')
            ]
        ]);
    }

    /**
     * Obtenir l'historique des paiements de l'utilisateur
     */
    #[Route('/history', name: 'app_payment_history', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getPaymentHistory(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $payments = $this->entityManager->getRepository(Payment::class)
            ->findBy(['user' => $user], ['createdAt' => 'DESC'], 50);

        $data = array_map(function($payment) {
            return [
                'id' => $payment->getId(),
                'amount' => $payment->getAmount(),
                'currency' => $payment->getCurrency(),
                'status' => $payment->getStatus(),
                'description' => $payment->getDescription(),
                'createdAt' => $payment->getCreatedAt()->format('c'),
                'completedAt' => $payment->getCompletedAt()?->format('c')
            ];
        }, $payments);

        return $this->json(['payments' => $data]);
    }

    /**
     * Activer l'abonnement PRO
     */
    private function activateSubscription(User $user, int $durationDays): void
    {
        $startDate = new \DateTimeImmutable();
        $expiresAt = $startDate->modify("+{$durationDays} days");

        // Vérifier si l'utilisateur a déjà un abonnement
        $subscription = $this->entityManager->getRepository(Subscription::class)
            ->findOneBy(['user' => $user]);

        if (!$subscription) {
            $subscription = new Subscription();
            $subscription->setUser($user);
            $subscription->setAccountType('PRO');
            $subscription->setStartDate($startDate);
            $subscription->setCreatedAt($startDate);
            $this->entityManager->persist($subscription);
        }

        $subscription->setStatus('active');
        $subscription->setExpiresAt($expiresAt);
        $subscription->setUpdatedAt(new \DateTimeImmutable());

        // Mettre à jour l'utilisateur
        $user->setAccountType('PRO');
        $user->setSubscriptionExpiresAt($expiresAt);
        $user->setUpdatedAt(new \DateTimeImmutable());
    }

    /**
     * Activer le boost d'une annonce
     */
    private function boostListingFeature(int $listingId): void
    {
        $listing = $this->entityManager->getRepository('App\Entity\Listing')->find($listingId);
        
        if ($listing) {
            $listing->setIsFeatured(true);
            $listing->setUpdatedAt(new \DateTimeImmutable());
            // Note: Ajouter un champ featuredUntil pour limiter la durée du boost
        }
    }
}
