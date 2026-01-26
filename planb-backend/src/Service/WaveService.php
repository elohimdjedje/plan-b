<?php

namespace App\Service;

use App\Entity\Order;
use Psr\Log\LoggerInterface;

/**
 * Service d'intégration Wave pour paiements Mobile Money
 * Documentation: https://developer.wave.com
 * Basé sur: https://www.moussasagna.com/blog/integration-payment-partie-2
 */
class WaveService
{
    private string $apiKey;
    private string $merchantId;
    private string $environment;
    private string $baseUrl;
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->apiKey = $_ENV['WAVE_API_KEY'] ?? '';
        $this->merchantId = $_ENV['WAVE_AGGREGATED_MERCHANT_ID'] ?? '';
        $this->environment = $_ENV['WAVE_ENVIRONMENT'] ?? 'sandbox';
        
        // URL de l'API Wave
        $this->baseUrl = $this->environment === 'live' 
            ? 'https://api.wave.com/v1'
            : 'https://api.wave.com/v1'; // Wave utilise la même URL
    }

    /**
     * Générer un lien de paiement Wave pour une commande
     * Basé sur la documentation de Moussa Sagna
     * 
     * @param Order $order Commande à payer
     * @return array Résultat avec le lien de paiement Wave
     */
    public function generatePaymentLink(Order $order): array
    {
        $callbackUrl = ($_ENV['APP_URL'] ?? 'http://localhost:8000') . "/api/v1/payment/wave/callback/{$order->getId()}";

        $payload = [
            'amount' => (float) $order->getAmount(),
            'currency' => 'XOF',
            'aggregated_merchant_id' => $this->merchantId,
            'client_reference' => (string) $order->getId(),
            'success_url' => $callbackUrl,
            'error_url' => $callbackUrl,
        ];

        try {
            $ch = curl_init();
            
            curl_setopt_array($ch, [
                CURLOPT_URL => $this->baseUrl . '/checkout/sessions',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_HTTPHEADER => [
                    'Authorization: Bearer ' . $this->apiKey,
                    'Content-Type: application/json'
                ],
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $this->logger->error('Wave cURL error', ['error' => $curlError]);
                return ['error' => 'Erreur de connexion à Wave'];
            }

            $data = json_decode($response, true);

            $this->logger->info('Wave API Response', [
                'code' => $httpCode,
                'response' => $data,
                'order_id' => $order->getId()
            ]);

            if ($httpCode !== 200 || empty($data['wave_launch_url'])) {
                return [
                    'error' => 'Impossible de générer le lien de paiement',
                    'response' => $data
                ];
            }

            return [
                'success' => true,
                'wave_launch_url' => $data['wave_launch_url'],
                'session_id' => $data['id'] ?? null,
                'status' => 'pending'
            ];

        } catch (\Exception $e) {
            $this->logger->error('Wave exception', [
                'message' => $e->getMessage(),
                'order_id' => $order->getId()
            ]);
            return ['error' => 'Exception: ' . $e->getMessage()];
        }
    }

    /**
     * Créer une transaction Wave (méthode legacy - conservée pour compatibilité)
     * 
     * @param int $amount Montant en XOF (Francs CFA)
     * @param string $description Description du paiement
     * @param array $customer Informations client ['firstname', 'lastname', 'email', 'phone']
     * @return array Détails de la transaction
     */
    public function createTransaction(int $amount, string $description, array $customer): array
    {
        $callbackUrl = $_ENV['APP_URL'] . '/api/v1/payment/wave/callback';

        $data = [
            'amount' => $amount,
            'currency' => 'XOF',
            'aggregated_merchant_id' => $this->merchantId,
            'success_url' => $callbackUrl,
            'error_url' => $callbackUrl,
            'metadata' => [
                'customer_firstname' => $customer['firstname'],
                'customer_lastname' => $customer['lastname'],
                'customer_email' => $customer['email'],
                'customer_phone' => $customer['phone'],
                'description' => $description
            ]
        ];

        try {
            $response = $this->makeRequest('POST', '/checkout/sessions', $data);

            return [
                'transaction_id' => $response['id'] ?? null,
                'payment_url' => $response['wave_launch_url'] ?? null,
                'status' => $response['payment_status'] ?? 'pending'
            ];
        } catch (\Exception $e) {
            throw new \Exception("Erreur lors de la création de la transaction Wave: " . $e->getMessage());
        }
    }

    /**
     * Vérifier le statut d'une transaction
     * 
     * @param string $transactionId ID de la transaction Wave
     * @return array Statut de la transaction
     */
    public function getTransactionStatus(string $transactionId): array
    {
        try {
            $response = $this->makeRequest('GET', "/checkout/sessions/{$transactionId}");

            return [
                'id' => $response['id'] ?? null,
                'status' => $response['payment_status'] ?? 'unknown', // pending, success, failed, cancelled
                'amount' => $response['amount'] ?? 0,
                'currency' => $response['currency'] ?? 'XOF',
                'completed_at' => $response['when_completed'] ?? null,
                'receipt_url' => $response['receipt_url'] ?? null
            ];
        } catch (\Exception $e) {
            throw new \Exception("Erreur lors de la vérification du statut: " . $e->getMessage());
        }
    }

    /**
     * Vérifier le webhook de Wave
     * 
     * @param string $payload Payload JSON du webhook
     * @param string $signature Signature HTTP header X-Wave-Signature
     * @return bool
     */
    public function verifyWebhook(string $payload, string $signature): bool
    {
        $webhookSecret = $_ENV['WAVE_WEBHOOK_SECRET'] ?? '';
        
        if (empty($webhookSecret)) {
            return false;
        }

        $computedSignature = hash_hmac('sha256', $payload, $webhookSecret);

        return hash_equals($computedSignature, $signature);
    }

    /**
     * Effectuer une requête à l'API Wave
     * 
     * @param string $method Méthode HTTP (GET, POST, PUT, DELETE)
     * @param string $endpoint Endpoint de l'API
     * @param array|null $data Données à envoyer
     * @return array Réponse de l'API
     */
    private function makeRequest(string $method, string $endpoint, ?array $data = null): array
    {
        $ch = curl_init();

        $url = $this->baseUrl . $endpoint;
        
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json'
        ];

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, $this->environment === 'live');

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data !== null) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        } elseif ($method === 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            if ($data !== null) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        } elseif ($method === 'DELETE') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            throw new \Exception("Erreur cURL: {$curlError}");
        }

        if ($httpCode >= 400) {
            $error = json_decode($response, true);
            $errorMessage = $error['message'] ?? $error['error'] ?? 'Erreur API Wave';
            throw new \Exception($errorMessage, $httpCode);
        }

        $decodedResponse = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("Erreur de décodage JSON: " . json_last_error_msg());
        }

        return $decodedResponse;
    }

    /**
     * Calculer les frais de transaction Wave
     * 
     * @param int $amount Montant en XOF
     * @return int Frais en XOF
     */
    public function calculateFees(int $amount): int
    {
        // Frais Wave CI: 1% + 50 XOF (à vérifier selon votre contrat)
        // Les frais peuvent varier selon le type de compte
        $percentage = $amount * 0.01;
        $fixed = 50;
        
        return (int) ceil($percentage + $fixed);
    }

    /**
     * Rembourser une transaction
     * 
     * @param string $transactionId ID de la transaction à rembourser
     * @param int|null $amount Montant à rembourser (null = remboursement total)
     * @return array Détails du remboursement
     */
    public function refundTransaction(string $transactionId, ?int $amount = null): array
    {
        $data = ['checkout_id' => $transactionId];
        
        if ($amount !== null) {
            $data['amount'] = $amount;
        }

        try {
            $response = $this->makeRequest('POST', '/refunds', $data);

            return [
                'refund_id' => $response['id'] ?? null,
                'status' => $response['status'] ?? 'pending',
                'amount' => $response['amount'] ?? 0
            ];
        } catch (\Exception $e) {
            throw new \Exception("Erreur lors du remboursement: " . $e->getMessage());
        }
    }
}
