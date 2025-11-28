<?php

namespace App\Controller;

use App\Entity\Payment;
use App\Entity\Subscription;
use App\Entity\User;
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
        private EntityManagerInterface $entityManager
    ) {}

    /**
     * Créer un paiement pour abonnement PRO
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
        
        // Durée d'abonnement (30 ou 90 jours)
        $duration = $data['duration'] ?? 30;
        if (!in_array($duration, [30, 90])) {
            return $this->json(['error' => 'Durée invalide (30 ou 90 jours)'], 400);
        }

        // Calcul du montant
        $amounts = [
            30 => 5000,  // 5000 XOF pour 1 mois
            90 => 12000  // 12000 XOF pour 3 mois (économie de 3000 XOF)
        ];
        $amount = $amounts[$duration];

        // Créer l'enregistrement de paiement
        $payment = new Payment();
        $payment->setUser($user);
        $payment->setAmount($amount);
        $payment->setCurrency('XOF');
        $payment->setPaymentMethod('mobile_money');
        $payment->setStatus('pending');
        $payment->setDescription("Abonnement PRO {$duration} jours");
        $payment->setMetadata([
            'duration' => $duration,
            'type' => 'subscription'
        ]);
        $payment->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($payment);
        $this->entityManager->flush();

        try {
            // Créer la transaction Wave
            $waveResult = $this->waveService->createTransaction(
                $amount,
                "Abonnement PRO Plan B - {$duration} jours",
                [
                    'firstname' => $user->getFirstName(),
                    'lastname' => $user->getLastName(),
                    'email' => $user->getEmail(),
                    'phone' => $user->getPhone()
                ]
            );

            // Mettre à jour avec l'ID de transaction Wave
            $payment->setTransactionId($waveResult['transaction_id']);
            $this->entityManager->flush();

            return $this->json([
                'payment' => [
                    'id' => $payment->getId(),
                    'amount' => $amount,
                    'currency' => 'XOF',
                    'duration' => $duration,
                    'status' => 'pending',
                    'wave_url' => $waveResult['payment_url']
                ],
                'message' => 'Paiement créé. Redirigez l\'utilisateur vers wave_url'
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
