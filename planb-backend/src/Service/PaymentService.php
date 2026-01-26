<?php

namespace App\Service;

use App\Entity\Booking;
use App\Entity\BookingPayment;
use App\Entity\User;
use App\Repository\BookingPaymentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * Service de gestion des paiements de réservation
 */
class PaymentService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private BookingPaymentRepository $paymentRepository,
        private WaveService $waveService,
        private OrangeMoneyService $orangeMoneyService,
        private EscrowService $escrowService,
        private LoggerInterface $logger
    ) {
    }

    /**
     * Crée un paiement pour une réservation
     */
    public function createPayment(
        Booking $booking,
        User $user,
        string $type,
        string $paymentMethod,
        ?\DateTimeInterface $dueDate = null
    ): BookingPayment {
        // Calculer le montant selon le type
        $amount = $this->calculatePaymentAmount($booking, $type);

        $payment = new BookingPayment();
        $payment->setBooking($booking);
        $payment->setUser($user);
        $payment->setType($type);
        $payment->setAmount((string)$amount);
        $payment->setPaymentMethod($paymentMethod);
        $payment->setStatus('pending');
        $payment->setDueDate($dueDate ?? new \DateTime('+7 days'));

        $this->entityManager->persist($payment);
        $this->entityManager->flush();

        $this->logger->info('Paiement créé', [
            'payment_id' => $payment->getId(),
            'booking_id' => $booking->getId(),
            'type' => $type,
            'amount' => $amount
        ]);

        return $payment;
    }

    /**
     * Traite un paiement via Wave
     */
    public function processWavePayment(BookingPayment $payment, array $waveData): array
    {
        try {
            $user = $payment->getUser();
            $booking = $payment->getBooking();
            
            // Créer une commande temporaire pour Wave
            $order = new \App\Entity\Order();
            $order->setClient($user);
            $order->setProvider($booking->getOwner());
            $order->setAmount($payment->getAmount());
            $order->setPaymentMethod('wave');
            
            // Générer le lien de paiement Wave
            $result = $this->waveService->generatePaymentLink($order);

            if (isset($result['error'])) {
                throw new \Exception($result['error']);
            }

            $payment->setTransactionId($result['session_id'] ?? null);
            $payment->setExternalReference((string)$payment->getId());
            $payment->setStatus('processing');
            $payment->setMetadata(array_merge($waveData, ['wave_url' => $result['wave_launch_url'] ?? null]));

            $this->entityManager->flush();

            return [
                'success' => true,
                'payment_url' => $result['wave_launch_url'] ?? null,
                'session_id' => $result['session_id'] ?? null
            ];
        } catch (\Exception $e) {
            $this->logger->error('Erreur traitement paiement Wave', [
                'payment_id' => $payment->getId(),
                'error' => $e->getMessage()
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Traite un paiement via Orange Money
     */
    public function processOrangeMoneyPayment(BookingPayment $payment, array $omData): bool
    {
        try {
            $transaction = $this->orangeMoneyService->initiatePayment(
                (float)$payment->getAmount(),
                $payment->getUser()->getPhone() ?? '',
                "Paiement réservation #{$payment->getBooking()->getId()}"
            );

            $payment->setTransactionId($transaction['transaction_id'] ?? null);
            $payment->setExternalReference($transaction['reference'] ?? null);
            $payment->setStatus('processing');
            $payment->setMetadata($omData);

            $this->entityManager->flush();

            return true;
        } catch (\Exception $e) {
            $this->logger->error('Erreur traitement paiement Orange Money', [
                'payment_id' => $payment->getId(),
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Confirme un paiement (webhook)
     */
    public function confirmPayment(BookingPayment $payment, array $transactionData): void
    {
        $payment->setStatus('completed');
        $payment->setPaidAt(new \DateTime());
        $payment->setMetadata(array_merge($payment->getMetadata() ?? [], $transactionData));

        // Mettre à jour la réservation
        $booking = $payment->getBooking();
        if ($payment->getType() === 'deposit') {
            $booking->setDepositPaid(true);
        } elseif ($payment->getType() === 'first_rent') {
            $booking->setFirstRentPaid(true);
        }

        // Si caution + premier loyer payés, créer le compte escrow
        if ($booking->isDepositPaid() && $booking->isFirstRentPaid()) {
            $this->escrowService->createEscrowAccount($booking);
        }

        $this->entityManager->flush();

        $this->logger->info('Paiement confirmé', [
            'payment_id' => $payment->getId(),
            'booking_id' => $booking->getId()
        ]);
    }

    /**
     * Calcule le montant d'un paiement selon son type
     */
    private function calculatePaymentAmount(Booking $booking, string $type): float
    {
        return match($type) {
            'deposit' => (float)$booking->getDepositAmount(),
            'first_rent' => (float)$booking->getMonthlyRent(),
            'monthly_rent' => (float)$booking->getMonthlyRent(),
            'charges' => (float)$booking->getCharges(),
            default => throw new \InvalidArgumentException("Type de paiement invalide: $type")
        };
    }

    /**
     * Trouve les paiements en retard
     */
    public function findOverduePayments(): array
    {
        return $this->paymentRepository->findOverduePayments();
    }

    /**
     * Crée les paiements mensuels récurrents pour une réservation active
     */
    public function createMonthlyPayments(Booking $booking): void
    {
        if ($booking->getStatus() !== 'active') {
            return;
        }

        $startDate = $booking->getStartDate();
        $endDate = $booking->getEndDate();
        $currentDate = clone $startDate;
        $currentDate->modify('+1 month'); // Premier paiement déjà fait

        while ($currentDate < $endDate) {
            // Vérifier si le paiement existe déjà
            $existingPayment = $this->paymentRepository->findOneBy([
                'booking' => $booking,
                'type' => 'monthly_rent',
                'dueDate' => $currentDate
            ]);

            if (!$existingPayment) {
                $this->createPayment(
                    $booking,
                    $booking->getTenant(),
                    'monthly_rent',
                    'wave', // Par défaut
                    $currentDate
                );
            }

            $currentDate->modify('+1 month');
        }
    }
}
