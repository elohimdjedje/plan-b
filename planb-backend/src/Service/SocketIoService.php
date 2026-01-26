<?php

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Service pour communiquer avec le serveur Socket.io
 */
class SocketIoService
{
    private string $socketIoUrl;

    public function __construct(
        private HttpClientInterface $httpClient,
        private LoggerInterface $logger
    ) {
        // URL du serveur Socket.io (depuis .env ou par défaut)
        $this->socketIoUrl = $_ENV['SOCKETIO_URL'] ?? 'http://localhost:3001';
    }

    /**
     * Émettre un nouveau message via Socket.io
     * 
     * @param int $conversationId
     * @param array $message Données du message (id, content, senderId, createdAt, etc.)
     * @return bool
     */
    public function emitNewMessage(int $conversationId, array $message): bool
    {
        try {
            $response = $this->httpClient->request('POST', $this->socketIoUrl . '/emit-message', [
                'json' => [
                    'conversationId' => $conversationId,
                    'message' => $message,
                    'senderId' => $message['senderId'] ?? null
                ],
                'timeout' => 5
            ]);

            if ($response->getStatusCode() === 200) {
                $this->logger->info('Message émis via Socket.io', [
                    'conversationId' => $conversationId,
                    'messageId' => $message['id'] ?? null
                ]);
                return true;
            }

            return false;
        } catch (\Exception $e) {
            $this->logger->error('Erreur émission Socket.io', [
                'conversationId' => $conversationId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Vérifier si un utilisateur est en ligne
     * 
     * @param int $userId
     * @return bool
     */
    public function isUserOnline(int $userId): bool
    {
        try {
            $response = $this->httpClient->request('GET', $this->socketIoUrl . '/user/' . $userId . '/online', [
                'timeout' => 2
            ]);

            if ($response->getStatusCode() === 200) {
                $data = $response->toArray();
                return $data['online'] ?? false;
            }

            return false;
        } catch (\Exception $e) {
            $this->logger->warning('Impossible de vérifier le statut en ligne', [
                'userId' => $userId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}


