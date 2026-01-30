<?php

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Service pour communiquer avec le service IA Python
 */
class AIService
{
    private string $aiServiceUrl;
    private HttpClientInterface $httpClient;
    private LoggerInterface $logger;

    public function __construct(
        HttpClientInterface $httpClient,
        LoggerInterface $logger
    ) {
        $this->httpClient = $httpClient;
        $this->logger = $logger;
        $this->aiServiceUrl = $_ENV['AI_SERVICE_URL'] ?? 'http://localhost:5000';
    }

    /**
     * Obtenir des recommandations pour un utilisateur
     */
    public function getRecommendations(int $userId, array $userHistory, int $limit = 10): array
    {
        try {
            $response = $this->httpClient->request('POST', $this->aiServiceUrl . '/recommendations', [
                'json' => [
                    'user_id' => $userId,
                    'user_history' => $userHistory,
                    'limit' => $limit
                ],
                'timeout' => 5
            ]);

            $data = $response->toArray();
            return $data['recommendations'] ?? [];
        } catch (\Exception $e) {
            $this->logger->error('AI Service error (recommendations): ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Recherche sémantique
     */
    public function semanticSearch(string $query, array $listings, int $limit = 10): array
    {
        try {
            $response = $this->httpClient->request('POST', $this->aiServiceUrl . '/semantic-search', [
                'json' => [
                    'query' => $query,
                    'listings' => $listings,
                    'limit' => $limit
                ],
                'timeout' => 10
            ]);

            $data = $response->toArray();
            return $data['results'] ?? [];
        } catch (\Exception $e) {
            $this->logger->error('AI Service error (semantic search): ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Catégoriser automatiquement une annonce
     */
    public function categorize(string $title, string $description = ''): array
    {
        try {
            $response = $this->httpClient->request('POST', $this->aiServiceUrl . '/categorize', [
                'json' => [
                    'title' => $title,
                    'description' => $description
                ],
                'timeout' => 5
            ]);

            $data = $response->toArray();
            return [
                'category' => $data['category'] ?? 'autre',
                'subcategory' => $data['subcategory'] ?? null,
                'confidence' => $data['confidence'] ?? 0.0
            ];
        } catch (\Exception $e) {
            $this->logger->error('AI Service error (categorize): ' . $e->getMessage());
            return [
                'category' => 'autre',
                'subcategory' => null,
                'confidence' => 0.0
            ];
        }
    }

    /**
     * Détecter le spam
     */
    public function detectSpam(string $title, string $description = '', ?float $price = null, ?int $userId = null): array
    {
        try {
            $response = $this->httpClient->request('POST', $this->aiServiceUrl . '/detect-spam', [
                'json' => [
                    'title' => $title,
                    'description' => $description,
                    'price' => $price,
                    'user_id' => $userId
                ],
                'timeout' => 5
            ]);

            $data = $response->toArray();
            return [
                'is_spam' => $data['is_spam'] ?? false,
                'confidence' => $data['confidence'] ?? 0.0,
                'reasons' => $data['reasons'] ?? []
            ];
        } catch (\Exception $e) {
            $this->logger->error('AI Service error (spam detection): ' . $e->getMessage());
            return [
                'is_spam' => false,
                'confidence' => 0.0,
                'reasons' => []
            ];
        }
    }

    /**
     * Analyser le sentiment
     */
    public function analyzeSentiment(string $text): array
    {
        try {
            $response = $this->httpClient->request('POST', $this->aiServiceUrl . '/analyze-sentiment', [
                'json' => [
                    'text' => $text
                ],
                'timeout' => 5
            ]);

            $data = $response->toArray();
            return [
                'sentiment' => $data['sentiment'] ?? 'neutral',
                'score' => $data['score'] ?? 0.0,
                'confidence' => $data['confidence'] ?? 0.0
            ];
        } catch (\Exception $e) {
            $this->logger->error('AI Service error (sentiment): ' . $e->getMessage());
            return [
                'sentiment' => 'neutral',
                'score' => 0.0,
                'confidence' => 0.0
            ];
        }
    }

    /**
     * Trouver des annonces similaires
     */
    public function findSimilarListings(int $listingId, string $title, string $description = '', ?string $category = null, int $limit = 5): array
    {
        try {
            $response = $this->httpClient->request('POST', $this->aiServiceUrl . '/similar-listings', [
                'json' => [
                    'listing_id' => $listingId,
                    'title' => $title,
                    'description' => $description,
                    'category' => $category,
                    'limit' => $limit
                ],
                'timeout' => 5
            ]);

            $data = $response->toArray();
            return $data['similar_listings'] ?? [];
        } catch (\Exception $e) {
            $this->logger->error('AI Service error (similar listings): ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Vérifier si le service IA est disponible
     */
    public function isAvailable(): bool
    {
        try {
            $response = $this->httpClient->request('GET', $this->aiServiceUrl . '/health', [
                'timeout' => 2
            ]);

            return $response->getStatusCode() === 200;
        } catch (\Exception $e) {
            return false;
        }
    }
}
