<?php

namespace App\Service;

use Psr\Log\LoggerInterface;

/**
 * Service d'intégration Orange Money pour paiements Mobile Money
 * Documentation: https://developer.orange.com/apis/
 */
class OrangeMoneyService
{
    private string $tokenUrl;
    private string $clientId;
    private string $clientSecret;
    private string $apiUrl;
    private string $merchantCode;
    private ?string $accessToken = null;
    private ?\DateTime $tokenExpiration = null;
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->tokenUrl = $_ENV['OM_TOKEN_URL'] ?? '';
        $this->clientId = $_ENV['OM_CLIENT_ID'] ?? '';
        $this->clientSecret = $_ENV['OM_CLIENT_SECRET'] ?? '';
        $this->apiUrl = $_ENV['OM_API_URL'] ?? '';
        $this->merchantCode = $_ENV['OM_MERCHANT_CODE'] ?? '';
    }

    /**
     * Obtenir un token d'accès OAuth2 pour Orange Money
     * Le token est valide pendant 55 minutes
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
                'Content-Type: application/x-www-form-urlencoded',
                'Authorization: Basic ' . base64_encode($this->clientId . ':' . $this->clientSecret)
            ];

            $postData = http_build_query([
                'grant_type' => 'client_credentials'
            ]);

            curl_setopt_array($ch, [
                CURLOPT_URL => $this->tokenUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $postData,
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_SSL_VERIFYPEER => true
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $this->logger->error('Orange Money cURL error', ['error' => $curlError]);
                return null;
            }

            if ($httpCode !== 200) {
                $this->logger->error('Orange Money token error', [
                    'http_code' => $httpCode,
                    'response' => $response
                ]);
                return null;
            }

            $data = json_decode($response, true);
            
            if (!isset($data['access_token'])) {
                $this->logger->error('Orange Money: no access token in response', ['response' => $data]);
                return null;
            }

            // Stocker le token et sa date d'expiration (55 minutes)
            $this->accessToken = $data['access_token'];
            $expiresIn = $data['expires_in'] ?? 3300; // 55 minutes par défaut
            $this->tokenExpiration = (new \DateTime())->modify("+{$expiresIn} seconds");

            $this->logger->info('Orange Money token obtained', ['expires_in' => $expiresIn]);

            return $this->accessToken;

        } catch (\Exception $e) {
            $this->logger->error('Orange Money token exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Générer un QR Code ou un lien de paiement Orange Money
     * 
     * @param float $amount Montant en XOF
     * @param string $orderId ID de la commande
     * @param string $customerPhone Numéro du client (optionnel)
     * @return array Résultat avec le lien de paiement ou le QR code
     */
    public function generatePaymentLink(float $amount, string $orderId, ?string $customerPhone = null): array
    {
        $token = $this->getAccessToken();
        
        if (!$token) {
            return ['error' => 'Impossible d\'obtenir le token Orange Money'];
        }

        $callbackUrl = ($_ENV['APP_URL'] ?? 'http://localhost:8000') . "/api/v1/payment/orange-money/callback/{$orderId}";

        $payload = [
            'amount' => [
                'unit' => 'XOF',
                'value' => (string) $amount
            ],
            'callbackSuccessUrl' => $callbackUrl,
            'callbackCancelUrl' => $callbackUrl,
            'code' => $this->merchantCode,
            'metadata' => [
                'order_id' => $orderId,
                'customer_phone' => $customerPhone
            ],
            'name' => $_ENV['APP_NAME'] ?? 'Plan B',
            'validity' => 15 // Validité du QR code en minutes
        ];

        try {
            $ch = curl_init();
            
            $headers = [
                'Authorization: Bearer ' . $token,
                'Content-Type: application/json'
            ];

            curl_setopt_array($ch, [
                CURLOPT_URL => $this->apiUrl . '/api/eWallet/v4/qrcode',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_SSL_VERIFYPEER => true
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $this->logger->error('Orange Money QR cURL error', ['error' => $curlError]);
                return ['error' => 'Erreur de connexion à Orange Money'];
            }

            $data = json_decode($response, true);

            if ($httpCode !== 200 && $httpCode !== 201) {
                $this->logger->error('Orange Money QR generation error', [
                    'http_code' => $httpCode,
                    'response' => $data
                ]);
                return ['error' => 'Erreur lors de la génération du QR Code', 'details' => $data];
            }

            $this->logger->info('Orange Money QR generated', [
                'order_id' => $orderId,
                'amount' => $amount
            ]);

            return [
                'success' => true,
                'payment_token' => $data['payment_token'] ?? null,
                'qr_code' => $data['qr_code'] ?? null,
                'payment_url' => $data['payment_url'] ?? null,
                'notif_token' => $data['notif_token'] ?? null,
                'validity' => 15
            ];

        } catch (\Exception $e) {
            $this->logger->error('Orange Money QR exception', [
                'message' => $e->getMessage(),
                'order_id' => $orderId
            ]);
            return ['error' => 'Exception: ' . $e->getMessage()];
        }
    }

    /**
     * Vérifier le statut d'un paiement Orange Money
     * 
     * @param string $paymentToken Token de paiement Orange Money
     * @return array Statut du paiement
     */
    public function checkPaymentStatus(string $paymentToken): array
    {
        $token = $this->getAccessToken();
        
        if (!$token) {
            return ['error' => 'Impossible d\'obtenir le token Orange Money'];
        }

        try {
            $ch = curl_init();
            
            $headers = [
                'Authorization: Bearer ' . $token,
                'Content-Type: application/json'
            ];

            curl_setopt_array($ch, [
                CURLOPT_URL => $this->apiUrl . '/api/eWallet/v4/payments/' . $paymentToken,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_SSL_VERIFYPEER => true
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $this->logger->error('Orange Money status check cURL error', ['error' => $curlError]);
                return ['error' => 'Erreur de connexion'];
            }

            $data = json_decode($response, true);

            if ($httpCode !== 200) {
                $this->logger->error('Orange Money status check error', [
                    'http_code' => $httpCode,
                    'response' => $data
                ]);
                return ['error' => 'Erreur lors de la vérification du statut'];
            }

            return [
                'success' => true,
                'status' => $data['status'] ?? 'unknown',
                'amount' => $data['amount'] ?? null,
                'transaction_id' => $data['transaction_id'] ?? null,
                'payment_date' => $data['payment_date'] ?? null,
                'data' => $data
            ];

        } catch (\Exception $e) {
            $this->logger->error('Orange Money status check exception', [
                'message' => $e->getMessage()
            ]);
            return ['error' => 'Exception: ' . $e->getMessage()];
        }
    }

    /**
     * Initier un paiement direct (Cash-out vers un numéro Orange Money)
     * 
     * @param string $phoneNumber Numéro du destinataire
     * @param float $amount Montant à transférer
     * @param string $orderId Référence de la commande
     * @return array Résultat du transfert
     */
    public function initiateDirectPayment(string $phoneNumber, float $amount, string $orderId): array
    {
        $token = $this->getAccessToken();
        
        if (!$token) {
            return ['error' => 'Impossible d\'obtenir le token Orange Money'];
        }

        $payload = [
            'amount' => [
                'unit' => 'XOF',
                'value' => (string) $amount
            ],
            'recipient' => [
                'phone_number' => $phoneNumber
            ],
            'reference' => $orderId,
            'description' => 'Paiement Plan B - Commande #' . $orderId
        ];

        try {
            $ch = curl_init();
            
            $headers = [
                'Authorization: Bearer ' . $token,
                'Content-Type: application/json'
            ];

            curl_setopt_array($ch, [
                CURLOPT_URL => $this->apiUrl . '/api/eWallet/v4/payments/direct',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_SSL_VERIFYPEER => true
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $this->logger->error('Orange Money direct payment cURL error', ['error' => $curlError]);
                return ['error' => 'Erreur de connexion'];
            }

            $data = json_decode($response, true);

            if ($httpCode !== 200 && $httpCode !== 201) {
                $this->logger->error('Orange Money direct payment error', [
                    'http_code' => $httpCode,
                    'response' => $data
                ]);
                return ['error' => 'Erreur lors du transfert', 'details' => $data];
            }

            $this->logger->info('Orange Money direct payment initiated', [
                'order_id' => $orderId,
                'amount' => $amount,
                'phone' => $phoneNumber
            ]);

            return [
                'success' => true,
                'transaction_id' => $data['transaction_id'] ?? null,
                'status' => $data['status'] ?? 'pending',
                'data' => $data
            ];

        } catch (\Exception $e) {
            $this->logger->error('Orange Money direct payment exception', [
                'message' => $e->getMessage()
            ]);
            return ['error' => 'Exception: ' . $e->getMessage()];
        }
    }

    /**
     * Calculer les frais Orange Money
     * 
     * @param float $amount Montant en XOF
     * @return float Frais estimés
     */
    public function calculateFees(float $amount): float
    {
        // Les frais Orange Money varient selon le montant et le type d'opération
        // À adapter selon votre contrat avec Orange
        if ($amount <= 500) return 0;
        if ($amount <= 1000) return 25;
        if ($amount <= 2500) return 50;
        if ($amount <= 5000) return 100;
        if ($amount <= 10000) return 150;
        if ($amount <= 15000) return 200;
        if ($amount <= 20000) return 300;
        
        // Au-delà de 20000 XOF, environ 1.5% du montant
        return $amount * 0.015;
    }
}
