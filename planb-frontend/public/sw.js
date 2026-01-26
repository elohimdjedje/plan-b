/**
 * Service Worker pour PWA Plan B
 * Gestion du cache, notifications push, mode hors ligne
 */

const CACHE_VERSION = 'planb-v1.0.0';
const CACHE_NAME = `planb-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = 'planb-runtime';

// Assets à mettre en cache au moment de l'installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Stratégies de cache
const CACHE_STRATEGIES = {
  // Cache First : pour les assets statiques
  CACHE_FIRST: 'cache-first',
  // Network First : pour les données dynamiques
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate : pour les ressources importantes
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
};

/**
 * Installation du Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Forcer l'activation immédiate
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Install error:', error);
      })
  );
});

/**
 * Activation du Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Supprimer les anciens caches
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Prendre le contrôle de toutes les pages
        return self.clients.claim();
      })
  );
});

/**
 * Interception des requêtes réseau
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET et les requêtes vers des domaines externes (API)
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    // Pour les API, utiliser network-first
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(networkFirst(request));
      return;
    }
    return;
  }

  // Stratégie selon le type de ressource
  if (isStaticAsset(request.url)) {
    // Assets statiques : Cache First
    event.respondWith(cacheFirst(request));
  } else if (isHTML(request.url)) {
    // Pages HTML : Network First avec fallback
    event.respondWith(networkFirstWithFallback(request));
  } else {
    // Autres ressources : Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request));
  }
});

/**
 * Vérifier si c'est un asset statique
 */
function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico|webp|avif)$/i.test(url);
}

/**
 * Vérifier si c'est une page HTML
 */
function isHTML(url) {
  return /\.html$/.test(url) || !/\./.test(new URL(url).pathname);
}

/**
 * Stratégie Cache First
 * Pour les assets statiques qui changent rarement
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[Service Worker] Cache First error:', error);
    // Retourner une réponse par défaut si possible
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Stratégie Network First
 * Pour les données dynamiques (API)
 */
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Mettre en cache pour usage hors ligne
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', error);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // Retourner une réponse d'erreur hors ligne
    return new Response(
      JSON.stringify({ error: 'Vous êtes hors ligne', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Stratégie Network First avec fallback HTML
 */
async function networkFirstWithFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, serving cached HTML');
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // Fallback vers index.html pour SPA
    const indexCache = await cache.match('/index.html');
    return indexCache || new Response('Offline', { status: 503 });
  }
}

/**
 * Stratégie Stale While Revalidate
 * Pour les ressources importantes qui doivent être à jour
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  
  // Lancer la mise à jour en arrière-plan
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Ignorer les erreurs de réseau
  });
  
  // Retourner le cache immédiatement si disponible
  return cached || fetchPromise;
}

/**
 * Réception des notifications push
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  let data = {
    title: 'Plan B',
    body: 'Vous avez une nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    image: data.image,
    tag: data.tag || 'planb-notification',
    data: data.data || {},
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    vibrate: data.vibrate || [200, 100, 200],
    timestamp: Date.now(),
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Clic sur une notification
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);
  
  event.notification.close();

  const data = event.notification.data || {};
  const url = data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si une fenêtre est déjà ouverte, la focus
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

/**
 * Gestion des messages depuis le client
 */
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    // Mettre en cache des URLs spécifiques
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    // Retourner la version du cache
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

/**
 * Gestion des erreurs
 */
self.addEventListener('error', (event) => {
  console.error('[Service Worker] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[Service Worker] Unhandled rejection:', event.reason);
});
