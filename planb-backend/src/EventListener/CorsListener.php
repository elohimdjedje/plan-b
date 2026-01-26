<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Custom CORS Listener - remplace NelmioCorsBundle
 */
class CorsListener
{
    private const ALLOWED_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        'http://localhost:5175',
        'http://127.0.0.1:5175',
    ];

    private const ALLOWED_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
    private const ALLOWED_HEADERS = 'Content-Type, Authorization, X-Requested-With, Accept';
    private const MAX_AGE = 3600;

    #[AsEventListener(event: KernelEvents::REQUEST, priority: 250)]
    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        
        // Gérer les requêtes OPTIONS (preflight)
        if ($request->getMethod() === 'OPTIONS') {
            $response = new Response('', 204);
            $this->addCorsHeaders($request, $response);
            $event->setResponse($response);
        }
    }

    #[AsEventListener(event: KernelEvents::RESPONSE, priority: 0)]
    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $response = $event->getResponse();
        
        // Toujours remplacer les headers CORS (pour éviter les duplications de Nginx)
        $this->addCorsHeaders($request, $response);
    }

    private function addCorsHeaders($request, Response $response): void
    {
        $origin = $request->headers->get('Origin');
        
        // Vérifier si l'origine est autorisée
        if ($origin && in_array($origin, self::ALLOWED_ORIGINS, true)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Methods', self::ALLOWED_METHODS);
            $response->headers->set('Access-Control-Allow-Headers', self::ALLOWED_HEADERS);
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Max-Age', (string) self::MAX_AGE);
        }
    }
}
