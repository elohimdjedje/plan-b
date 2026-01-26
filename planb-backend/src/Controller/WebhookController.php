<?php

namespace App\Controller;

use App\Entity\Payment;
use App\Entity\WebhookLog;
use App\Service\OrangeMoneyService;
use App\Service\WaveService;
use App\Service\WebhookProcessor;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Contrôleur pour gérer les webhooks de paiement
 * Routes publiques mais sécurisées par signature
 */
#[Route('/api/v1/webhooks')]
class WebhookController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private WaveService $waveService,
        private OrangeMoneyService $orangeMoneyService,
        private WebhookProcessor $webhookProcessor,
        private LoggerInterface $logger
    ) {
    }

    /**
     * Webhook Wave - Notification de paiement
     * 
     * POST /api/v1/webhooks/wave
     * 
     * Headers requis:
     * - X-Wave-Signature: Signature HMAC-SHA256
     */
    #[Route('/wave', name: 'app_webhook_wave', methods: ['POST'])]
    public function waveWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->headers->get('X-Wave-Signature', '');
        $ipAddress = $request->getClientIp();

        // Logger le webhook reçu
        $this->logger->info('Wave webhook received', [
            'ip' => $ipAddress,
            'signature' => substr($signature, 0, 20) . '...',
            'payload_size' => strlen($payload)
        ]);

        // Créer un log du webhook
        $webhookLog = new WebhookLog();
        $webhookLog->setProvider('wave');
        $webhookLog->setPayload($payload);
        $webhookLog->setSignature($signature);
        $webhookLog->setIpAddress($ipAddress);
        $webhookLog->setStatus('received');
        $webhookLog->setCreatedAt(new \DateTimeImmutable());

        try {
            // Vérifier la signature
            if (!$this->waveService->verifyWebhook($payload, $signature)) {
                $webhookLog->setStatus('failed');
                $webhookLog->setErrorMessage('Signature invalide');
                $this->entityManager->persist($webhookLog);
                $this->entityManager->flush();

                $this->logger->warning('Wave webhook: Invalid signature', [
                    'ip' => $ipAddress,
                    'signature' => substr($signature, 0, 20) . '...'
                ]);

                return $this->json(['error' => 'Signature invalide'], Response::HTTP_UNAUTHORIZED);
            }

            $data = json_decode($payload, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON payload: ' . json_last_error_msg());
            }

            // Extraire les informations de la transaction
            $transactionId = $data['transaction']['id'] ?? $data['id'] ?? null;
            $eventType = $data['event'] ?? $data['type'] ?? 'payment.completed';
            $status = $data['payment_status'] ?? $data['transaction']['status'] ?? $data['status'] ?? 'unknown';

            if (!$transactionId) {
                throw new \Exception('Transaction ID manquant dans le webhook');
            }

            $webhookLog->setTransactionId($transactionId);
            $webhookLog->setEventType($eventType);
            $webhookLog->setStatus('processing');

            // Traiter le webhook de manière asynchrone
            $result = $this->webhookProcessor->processWaveWebhook($data, $webhookLog);

            if ($result['success']) {
                $webhookLog->setStatus('processed');
                $webhookLog->setProcessedAt(new \DateTimeImmutable());
                
                $this->logger->info('Wave webhook processed successfully', [
                    'transaction_id' => $transactionId,
                    'payment_id' => $result['payment_id'] ?? null
                ]);
            } else {
                $webhookLog->setStatus('failed');
                $webhookLog->setErrorMessage($result['error'] ?? 'Erreur inconnue');
                
                $this->logger->error('Wave webhook processing failed', [
                    'transaction_id' => $transactionId,
                    'error' => $result['error'] ?? 'Erreur inconnue'
                ]);
            }

        } catch (\Exception $e) {
            $webhookLog->setStatus('failed');
            $webhookLog->setErrorMessage($e->getMessage());
            
            $this->logger->error('Wave webhook error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }

        $this->entityManager->persist($webhookLog);
        $this->entityManager->flush();

        // Toujours retourner 200 pour éviter les retries inutiles
        return $this->json([
            'success' => true,
            'message' => 'Webhook reçu'
        ], Response::HTTP_OK);
    }

    /**
     * Webhook Orange Money - Notification de paiement
     * 
     * POST /api/v1/webhooks/orange-money
     * 
     * Headers requis:
     * - X-Orange-Signature: Signature HMAC-SHA256
     */
    #[Route('/orange-money', name: 'app_webhook_orange_money', methods: ['POST'])]
    public function orangeMoneyWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->headers->get('X-Orange-Signature', '');
        $ipAddress = $request->getClientIp();

        $this->logger->info('Orange Money webhook received', [
            'ip' => $ipAddress,
            'signature' => substr($signature, 0, 20) . '...',
            'payload_size' => strlen($payload)
        ]);

        $webhookLog = new WebhookLog();
        $webhookLog->setProvider('orange_money');
        $webhookLog->setPayload($payload);
        $webhookLog->setSignature($signature);
        $webhookLog->setIpAddress($ipAddress);
        $webhookLog->setStatus('received');
        $webhookLog->setCreatedAt(new \DateTimeImmutable());

        try {
            // Vérifier la signature
            if (!$this->orangeMoneyService->verifyWebhook($payload, $signature)) {
                $webhookLog->setStatus('failed');
                $webhookLog->setErrorMessage('Signature invalide');
                $this->entityManager->persist($webhookLog);
                $this->entityManager->flush();

                $this->logger->warning('Orange Money webhook: Invalid signature', [
                    'ip' => $ipAddress
                ]);

                return $this->json(['error' => 'Signature invalide'], Response::HTTP_UNAUTHORIZED);
            }

            $data = json_decode($payload, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON payload: ' . json_last_error_msg());
            }

            $transactionId = $data['transaction_id'] ?? $data['order_id'] ?? $data['payment_token'] ?? null;
            $eventType = $data['event'] ?? $data['type'] ?? 'payment.completed';
            $status = $data['status'] ?? $data['payment_status'] ?? 'unknown';

            if (!$transactionId) {
                throw new \Exception('Transaction ID manquant dans le webhook');
            }

            $webhookLog->setTransactionId($transactionId);
            $webhookLog->setEventType($eventType);
            $webhookLog->setStatus('processing');

            // Traiter le webhook
            $result = $this->webhookProcessor->processOrangeMoneyWebhook($data, $webhookLog);

            if ($result['success']) {
                $webhookLog->setStatus('processed');
                $webhookLog->setProcessedAt(new \DateTimeImmutable());
                
                $this->logger->info('Orange Money webhook processed successfully', [
                    'transaction_id' => $transactionId,
                    'payment_id' => $result['payment_id'] ?? null
                ]);
            } else {
                $webhookLog->setStatus('failed');
                $webhookLog->setErrorMessage($result['error'] ?? 'Erreur inconnue');
                
                $this->logger->error('Orange Money webhook processing failed', [
                    'transaction_id' => $transactionId,
                    'error' => $result['error'] ?? 'Erreur inconnue'
                ]);
            }

        } catch (\Exception $e) {
            $webhookLog->setStatus('failed');
            $webhookLog->setErrorMessage($e->getMessage());
            
            $this->logger->error('Orange Money webhook error', [
                'error' => $e->getMessage()
            ]);
        }

        $this->entityManager->persist($webhookLog);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Webhook reçu'
        ], Response::HTTP_OK);
    }

    /**
     * Endpoint de test pour les webhooks (développement uniquement)
     * 
     * POST /api/v1/webhooks/test
     */
    #[Route('/test', name: 'app_webhook_test', methods: ['POST'])]
    public function testWebhook(Request $request): JsonResponse
    {
        // Désactiver en production
        if ($_ENV['APP_ENV'] === 'prod') {
            return $this->json(['error' => 'Non disponible en production'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);
        $provider = $data['provider'] ?? 'wave';

        $this->logger->info('Test webhook received', [
            'provider' => $provider,
            'data' => $data
        ]);

        return $this->json([
            'success' => true,
            'message' => 'Webhook de test reçu',
            'provider' => $provider,
            'data' => $data
        ]);
    }

    /**
     * Liste des webhooks reçus (admin uniquement)
     * 
     * GET /api/v1/webhooks/logs
     */
    #[Route('/logs', name: 'app_webhook_logs', methods: ['GET'])]
    public function getWebhookLogs(Request $request): JsonResponse
    {
        // TODO: Ajouter vérification admin
        // if (!$this->isGranted('ROLE_ADMIN')) {
        //     return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        // }

        $limit = (int) ($request->query->get('limit') ?? 50);
        $offset = (int) ($request->query->get('offset') ?? 0);
        $provider = $request->query->get('provider');

        $repository = $this->entityManager->getRepository(WebhookLog::class);
        $queryBuilder = $repository->createQueryBuilder('w')
            ->orderBy('w.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->setFirstResult($offset);

        if ($provider) {
            $queryBuilder->andWhere('w.provider = :provider')
                ->setParameter('provider', $provider);
        }

        $webhooks = $queryBuilder->getQuery()->getResult();

        $data = array_map(function($webhook) {
            return [
                'id' => $webhook->getId(),
                'provider' => $webhook->getProvider(),
                'transaction_id' => $webhook->getTransactionId(),
                'event_type' => $webhook->getEventType(),
                'status' => $webhook->getStatus(),
                'error_message' => $webhook->getErrorMessage(),
                'ip_address' => $webhook->getIpAddress(),
                'created_at' => $webhook->getCreatedAt()->format('c'),
                'processed_at' => $webhook->getProcessedAt()?->format('c')
            ];
        }, $webhooks);

        return $this->json([
            'webhooks' => $data,
            'total' => count($data)
        ]);
    }
}


