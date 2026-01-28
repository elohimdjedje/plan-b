<?php

namespace App\Service;

use Psr\Log\LoggerInterface;

/**
 * Service d'intégration Moov Money pour paiements Mobile Money
 * Documentation: https://developer.moov-africa.com/
 */
class MoovMoneyService
{
    private string $merchantCode;
    private string $merchantPin;
    private string $apiKey;
    private string $environment;
    private string $baseUrl;
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->merchantCode = $_ENV['MOOV_MERCHANT_CODE'] ?? '';
        $this->merchantPin = $_ENV['MOOV_MERCHANT_PIN'] ?? '';
        $this->apiKey = $_ENV['MOOV_API_KEY'] ?? '';
        $this->environment = $_ENV['MOOV_ENVIRONMENT'] ?? 'sandbox';
        
        // URL de l'API Moov Money
        $this->baseUrl = $this->environment === 'live' 
            ? 'https://api.moov-africa.com/api/v1'
            : 'https://sandbox.moov-africa.com/api/v1';
    }

    /**
     * Initier une demande de paiement Moov Money
     * 
     * @param float $amount Montant en XOF
     * @param string $phoneNumber Numéro du payeur
     * @param string $orderId ID de la commande
     * @param string $description Description du paiement
     * @return array Résultat de la demande
     */
    public function requestPayment(float $amount, string $phoneNumber, string $orderId, string $description = ''): array
    {
        $callbackUrl = ($_ENV['APP_URL'] ?? 'http://localhost:8000') . "/api/v1/payments/moov/callback/{$orderId}";

        $payload = [
            'merchant_code' => $this->merchantCode,
            'merchant_pin' => $this->merchantPin,
            'amount' => (int) $amount,
            'currency' => 'XOF',
            'phone_number' => $this->formatPhoneNumber($phoneNumber),
            'reference' => $orderId,
            'description' => $description ?: 'Paiement Plan B',
            'callback_url' => $callbackUrl,
            'return_url' => ($_ENV['FRONTEND_URL'] ?? 'http://localhost:5173') . '/payments?status=success'
        ];

        try {
            $ch = curl_init();
            
            $headers = [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json',
                'Accept: application/json'
            ];

            curl_setopt_array($ch, [
                CURLOPT_URL => $this->baseUrl . '/merchant/payment/request',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_SSL_VERIFYPEER => $this->environment === 'live',
                CURLOPT_TIMEOUT => 30
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $this->logger->error('Moov Money cURL error', ['error' => $curlError]);
                return ['error' => 'Erreur de connexion à Moov Money'];
            }

            $data = json_decode($response, true);

            if ($httpCode !== 200 && $httpCode !== 201) {
                $this->logger->error('Moov Money request payment error', [
                    'http_code' => $httpCode,
                    'response' => $data
                ]);
                return ['error' => 'Erreur lors de la demande de paiement', 'details' => $data];
            }

            $this->logger->info('Moov Money payment request initiated', [
                'order_id' => $orderId,
                'amount' => $amount,
                'transaction_id' => $data['transaction_id'] ?? null
            ]);

            return [
                'success' => true,
                'transaction_id' => $data['transaction_id'] ?? null,
                'reference' => $data['reference'] ?? $orderId,
                'status' => $data['status'] ?? 'pending',
                'payment_url' => $data['payment_url'] ?? null,
                'ussd_code' => $data['ussd_code'] ?? null,
                'message' => 'Demande de paiement envoyée. Veuillez confirmer sur votre téléphone.'
            ];

        } catch (\Exception $e) {
            $this->logger->error('Moov Money request payment exception', [
                'message' => $e->getMessage(),
                'order_id' => $orderId
            ]);
            return ['error' => 'Exception: ' . $e->getMessage()];
        }
    }

    /**
     * Générer un lien de paiement Moov Money
     * 
     * @param float $amount Montant en XOF
     * @param string $orderId ID de la commande
     * @param string $description Description
     * @return array Résultat avec lien de paiement
     */
    public function generatePaymentLink(float $amount, string $orderId, string $description = ''): array
    {
        $callbackUrl = ($_ENV['APP_URL'] ?? 'http://localhost:8000') . "/api/v1/payments/moov/callback/{$orderId}";

        $payload = [
            'merchant_code' => $this->merchantCode,
            'amount' => (int) $amount,
            'currency' => 'XOF',
            'reference' => $orderId,
            'description' => $description ?: 'Paiement Plan B',
            'callback_url' => $callbackUrl,
            'success_url' => ($_ENV['FRONTEND_URL'] ?? 'http://localhost:5173') . '/payments?status=success',
            'cancel_url' => ($_ENV['FRONTEND_URL'] ?? 'http://localhost:5173') . '/payments?status=cancelled',
            'validity' => 30 // Validité en minutes
        ];

        try {
            $ch = curl_init();
            
            $headers = [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json',
                'Accept: application/json'
            ];

            curl_setopt_array($ch, [
                CURLOPT_URL => $this->baseUrl . '/merchant/payment/link',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_SSL_VERIFYPEER => $this->environment === 'live'
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $this->logger->error('Moov Money payment link cURL error', ['error' => $curlError]);
                return ['error' => 'Erreur de connexion à Moov Money'];
            }

            $data = json_decode($response, true);

            if ($httpCode !== 200 && $httpCode !== 201) {
                $this->logger->error('Moov Money payment link error', [
                    'http_code' => $httpCode,
                    'response' => $data
                ]);
                return ['error' => 'Erreur lors de la génération du lien', 'details' => $data];
            }

            return [
                'success' => true,
                'payment_url' => $data['payment_url'] ?? null,
                'transaction_id' => $data['transaction_id'] ?? null,
                'validity' => 30
            ];

        } catch (\Exception $e) {
            $this->logger->error('Moov Money payment link exception', [
                'message' => $e->getMessage(),
                'order_id' => $orderId
            ]);
            return ['error' => 'Exception: ' . $e->getMessage()];
        }
    }

    /**
     * Vérifier le statut d'un paiement
     * 
     * @param string $transactionId ID de la transaction Moov
     * @return array Statut du paiement
     */
    public function checkPaymentStatus(string $transactionId): array
    {
        try {
            $ch = curl_init();
            
            $headers = [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json',
                'Accept: application/json'
            ];

            curl_setopt_array($ch, [
                CURLOPT_URL => $this->baseUrl . '/merchant/payment/status/' . $transactionId,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_SSL_VERIFYPEER => $this->environment === 'live'
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $this->logger->error('Moov Money status check cURL error', ['error' => $curlError]);
                return ['error' => 'Erreur de connexion'];
            }

            $data = json_decode($response, true);

            if ($httpCode !== 200) {
                $this->logger->error('Moov Money status check error', [
                    'http_code' => $httpCode,
                    'response' => $data
                ]);
                return ['error' => 'Erreur lors de la vérification du statut'];
            }

            // Statuts: PENDING, SUCCESS, FAILED, CANCELLED
            $status = strtolower($data['status'] ?? 'unknown');
            
            return [
                'success' => true,
                'status' => $status,
                'is_completed' => $status === 'success',
                'amount' => $data['amount'] ?? null,
                'currency' => $data['currency'] ?? 'XOF',
                'phone_number' => $data['phone_number'] ?? null,
                'transaction_id' => $data['transaction_id'] ?? null,
                'data' => $data
            ];

        } catch (\Exception $e) {
            $this->logger->error('Moov Money status check exception', [
                'message' => $e->getMessage()
            ]);
            return ['error' => 'Exception: ' . $e->getMessage()];
        }
    }

    /**
     * Vérifier la signature d'un webhook Moov Money
     */
    public function verifyWebhook(string $payload, string $signature): bool
    {
        $webhookSecret = $_ENV['MOOV_WEBHOOK_SECRET'] ?? '';
        
        if (empty($webhookSecret)) {
            $this->logger->warning('Moov Money webhook secret not configured');
            if ($_ENV['APP_ENV'] === 'dev') {
                return true;
            }
            return false;
        }

        $computedSignature = hash_hmac('sha256', $payload, $webhookSecret);
        return hash_equals($computedSignature, $signature);
    }

    /**
     * Formater le numéro de téléphone pour Moov
     */
    private function formatPhoneNumber(string $phone): string
    {
        // Supprimer espaces, tirets, +
        $phone = preg_replace('/[\s\-\+]/', '', $phone);
        
        // Si commence par 0, ajouter indicatif CI (225)
        if (str_starts_with($phone, '0')) {
            $phone = '225' . substr($phone, 1);
        }
        
        // Si ne commence pas par un indicatif, ajouter 225 (CI)
        if (strlen($phone) <= 10) {
            $phone = '225' . $phone;
        }
        
        return $phone;
    }

    /**
     * Calculer les frais Moov Money
     */
    public function calculateFees(float $amount): float
    {
        // Les frais Moov Money - à adapter selon votre contrat
        if ($amount <= 500) return 0;
        if ($amount <= 1000) return 10;
        if ($amount <= 2500) return 25;
        if ($amount <= 5000) return 50;
        if ($amount <= 10000) return 75;
        if ($amount <= 25000) return 125;
        if ($amount <= 50000) return 200;
        
        return $amount * 0.01; // 1% au-delà de 50000
    }
}
