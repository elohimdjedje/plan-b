/**
 * Service PWA - Gestion de l'installation et du mode hors ligne
 */

class PWAService {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isOnline = navigator.onLine;
    this.listeners = new Map();
  }

  /**
   * Initialiser le service PWA
   */
  async initialize() {
    // Vérifier si déjà installé
    this.isInstalled = this.checkIfInstalled();

    // Écouter les événements d'installation
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.emit('installable', { prompt: e });
    });

    // Écouter les changements de connexion
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('offline');
    });

    // Enregistrer le service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        console.log('[PWA] Service Worker registered:', registration);

        // Vérifier les mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nouvelle version disponible
                this.emit('updateAvailable');
              }
            });
          }
        });
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Vérifier si l'app est installée
   */
  checkIfInstalled() {
    // Vérifier si on est en mode standalone (iOS)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Vérifier si on est en mode standalone (Android)
    if (window.navigator.standalone === true) {
      return true;
    }

    // Vérifier si l'app a été ajoutée à l'écran d'accueil
    return localStorage.getItem('pwa-installed') === 'true';
  }

  /**
   * Proposer l'installation
   */
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.warn('[PWA] No install prompt available');
      return false;
    }

    try {
      // Afficher le prompt
      this.deferredPrompt.prompt();

      // Attendre la réponse de l'utilisateur
      const { outcome } = await this.deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        this.isInstalled = true;
        localStorage.setItem('pwa-installed', 'true');
        this.emit('installed');
        return true;
      } else {
        console.log('[PWA] User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  /**
   * Vérifier si l'app peut être installée
   */
  canInstall() {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  /**
   * Vérifier si l'app est installée
   */
  getInstalled() {
    return this.isInstalled;
  }

  /**
   * Vérifier la connexion
   */
  isOnlineStatus() {
    return this.isOnline;
  }

  /**
   * Forcer la mise à jour du service worker
   */
  async updateServiceWorker() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        return true;
      }
    }
    return false;
  }

  /**
   * S'abonner à un événement
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Retourner une fonction de désabonnement
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Émettre un événement
   */
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[PWA] Error in listener for ${event}:`, error);
        }
      });
    }
  }
}

// Instance singleton
const pwaService = new PWAService();
export default pwaService;


