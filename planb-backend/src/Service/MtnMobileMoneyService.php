<?php

namespace App\Service;

use Psr\Log\LoggerInterface;

/**
 * Service d'intégration MTN Mobile Money pour paiements Mobile Money
 * Documentation: https://momodeveloper.mtn.com/
 */
class MtnMobileMoneyService
{
    private string $apiKey;
    private string $apiSecret;
    private string $subscriptionKey;
    private string $environment;
    private string $baseUrl;
    private ?string $accessToken = null;
    private ?\DateTime $tokenExpiration = null;
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->apiKey = $_ENV['MTN_API_KEY'] ?? '';
        $this->apiSecret = $_ENV['MTN_API_SECRET'] ?? '';
        $this->subscriptionKey = $_ENV['MTN_SUBSCRIPTION_KEY'] ?? '';
        $this->environment = $_ENV['MTN_ENVIRONMENT'] ?? 'sandbox';
        
        // URL de l'API MTN MoMo
        $this->baseUrl = $this->environment === 'live' 
            ? 'https://proxy.momoapi.mtn.com'
            : 'https://sandbox.momodeveloper.mtn.com';
    }

    /**
     * Obtenir un token d'accès OAuth2 pour MTN MoMo
     * 
     * @return string|null Token d'accès
     */
    public function getAccessToken(): ?string
    {
        // Vérifier si le token existe et est encore valide
        if ($this->accessToken && $this->tokenExpiration && $this->tokenExpiration > new \DateTime()) {
            return $this->accessToken;
        }

        try {
            $ch = curl_init();
            
            $headers = [
                'Authorization: Basic ' . base64_encode($this->apiKey . ':' . $this->apiSecret),
                'Ocp-Apim-Subscription-Key: ' . $this->subscriptionKey,
                'Content-Type: application/json'
            ];

            curl_setopt_array($ch, [
                CURLOPT_URL => $this->baseUrl . '/collection/token/',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_SSL_VERIFYPEER => $this->environment === 'live'
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $this->logger->error('MTN MoMo cURL error', ['error' => $curlError]);
                return null;
            }

            if ($httpCode !== 200) {
                $this->logger->error('MTN MoMo token error', [
                    'http_code' => $httpCode,
                    'response' => $response
                ]);
                return null;
            }

            $data = json_decode($response, true);
            
            if (!isset($data['access_token'])) {
                $this->logger->error('MTN MoMo: no access token in response', ['response' => $data]);
                return null;
            }

            // Stocker le token et sa date d'expiration (généralement 1 heure)
            $this->accessToken = $data['access_token'];
            $expiresIn = $data['expires_in'] ?? 3600;
            $this->tokenExpiration = (new \DateTime())->modify("+{$expiresIn} seconds");

            $this->logger->info('MTN MoMo token obtained', ['expires_in' => $expiresIn]);

            return $this->accessToken;

        } catch (\Exception $e) {
            $this->logger->error('MTN MoMo token exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Demander un paiement (Request to Pay)
     * 
     * @param float $amount Montant en XOF
     * @param string $phoneNumber Numéro du payeur (format: 225XXXXXXXX)
     * @param string $orderId ID de la commande
     * @param string $description Description du paiement
     * @return array Résultat de la demande
     */
    public function requestToPay(float $amount, string $phoneNumber, string $orderId, string $description = ''): array
    {
        $token = $this->getAccessToken();
        
        if (!$token) {
            return ['error' => 'Impossible d\'obtenir le token MTN MoMo'];
        }

        // Générer un UUID pour la transaction
        $referenceId = $this->generateUUID();
        $callbackUrl = ($_ENV['APP_URL'] ?? 'http://localhost:8000') . "/api/v1/payments/mtn/callback/{$orderId}";

        $payload = [
            'amount' => (string) $amount,
            'currency' => 'XOF',
            'externalId' => $orderId,
            'payer' => [
                'partyIdType' => 'MSISDN',
                'partyId' => $this->formatPhoneNumber($phoneNumber)
            ],
            'payerMessage' => $description ?: 'Paiement Plan B',
            'payeeNote' => 'Plan B - ' . $orderId
        ];

        try {
            $ch = curl_init();
            
            $headers = [
                'Authorization: Bearer ' . $token,
                'X-Reference-Id: ' . $referenceId,
                'X-Target-Environment: ' . $this->environment,
                'Ocp-Apim-Subscription-Key: ' . $this->subscriptionKey,
                'X-Callback-Url: ' . $callbackUrl,
                'Content-Type: application/json'
            ];

            curl_setopt_array($ch, [
                CURLOPT_URL => $this->baseUrl . '/collection/v1_0/requesttopay',
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
                $this->logger->error('MTN MoMo request to pay cURL error', ['error' => $curlError]);
                return ['error' => 'Erreur de connexion à MTN MoMo'];
            }

            // MTN MoMo renvoie 202 Accepted pour les requêtes réussies
            if ($httpCode !== 202 && $httpCode !== 200) {
                $data = json_decode($response, true);
                $this->logger->error('MTN MoMo request to pay error', [
                    'http_code' => $httpCode,
                    'response' => $data
                ]);
                return ['error' => 'Erreur lors de la demande de paiement', 'details' => $data];
            }

            $this->logger->info('MTN MoMo request to pay initiated', [
                'reference_id' => $referenceId,
                'order_id' => $orderId,
                'amount' => $amount
            ]);

            return [
                'success' => true,
                'reference_id' => $referenceId,
                'status' => 'pending',
                'message' => 'Demande de paiement envoyée. Veuillez confirmer sur votre téléphone.'
            ];

        } catch (\Exception $e) {
            $this->logger->error('MTN MoMo request to pay exception', [
                'message' => $e->getMessage(),
                'order_id' => $orderId
            ]);
            return ['error' => 'Exception: ' . $e->getMessage()];
        }
    }

    /**
     * Vérifier le statut d'un paiement
     * 
     * @param string $referenceId UUID de la transaction
     * @return array Statut du paiement
     */
    public function checkPaymentStatus(string $referenceId): array
    {
        $token = $this->getAccessToken();
        
        if (!$token) {
            return ['error' => 'Impossible d\'obtenir le token MTN MoMo'];
        }

        try {
            $ch = curl_init();
            
            $headers = [
                'Authorization: Bearer ' . $token,
                'X-Target-Environment: ' . $this->environment,
                'Ocp-Apim-Subscription-Key: ' . $this->subscriptionKey,
                'Content-Type: application/json'
            ];

            curl_setopt_array($ch, [
                CURLOPT_URL => $this->baseUrl . '/collection/v1_0/requesttopay/' . $referenceId,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_SSL_VERIFYPEER => $this->environment === 'live'
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $this->logger->error('MTN MoMo status check cURL error', ['error' => $curlError]);
                return ['error' => 'Erreur de connexion'];
            }

            $data = json_decode($response, true);

            if ($httpCode !== 200) {
                $this->logger->error('MTN MoMo status check error', [
                    'http_code' => $httpCode,
                    'response' => $data
                ]);
                return ['error' => 'Erreur lors de la vérification du statut'];
            }

            // Statuts possibles: PENDING, SUCCESSFUL, FAILED
            $status = $data['status'] ?? 'unknown';
            
            return [
                'success' => true,
                'status' => strtolower($status),
                'is_completed' => $status === 'SUCCESSFUL',
                'amount' => $data['amount'] ?? null,
                'currency' => $data['currency'] ?? 'XOF',
                'payer' => $data['payer'] ?? null,
                'reason' => $data['reason'] ?? null,
                'data' => $data
            ];

        } catch (\Exception $e) {
            $this->logger->error('MTN MoMo status check exception', [
                'message' => $e->getMessage()
            ]);
            return ['error' => 'Exception: ' . $e->getMessage()];
        }
    }

    /**
     * Vérifier la signature d'un webhook MTN MoMo
     */
    public function verifyWebhook(string $payload, string $signature): bool
    {
        $webhookSecret = $_ENV['MTN_WEBHOOK_SECRET'] ?? '';
        
        if (empty($webhookSecret)) {
            $this->logger->warning('MTN MoMo webhook secret not configured');
            if ($_ENV['APP_ENV'] === 'dev') {
                return true;
            }
            return false;
        }

        $computedSignature = hash_hmac('sha256', $payload, $webhookSecret);
        return hash_equals($computedSignature, $signature);
    }

    /**
     * Générer un UUID v4
     */
    private function generateUUID(): string
    {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    /**
     * Formater le numéro de téléphone pour MTN (format international sans +)
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
     * Calculer les frais MTN MoMo
     */
    public function calculateFees(float $amount): float
    {
        // Les frais MTN MoMo varient selon le montant
        // À adapter selon votre contrat
        if ($amount <= 500) return 0;
        if ($amount <= 2500) return 25;
        if ($amount <= 5000) return 50;
        if ($amount <= 10000) return 100;
        if ($amount <= 25000) return 150;
        if ($amount <= 50000) return 250;
        
        return $amount * 0.01; // 1% au-delà de 50000
    }
}
