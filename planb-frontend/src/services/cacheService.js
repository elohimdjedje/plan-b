/**
 * Service de cache intelligent pour optimiser les performances
 * Cache en mémoire avec expiration automatique
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map(); // Pour éviter les requêtes dupliquées
    
    // Durées de cache par type de données (en millisecondes)
    this.TTL = {
      listings: 2 * 60 * 1000,      // 2 minutes pour les listes d'annonces
      listing: 5 * 60 * 1000,       // 5 minutes pour une annonce individuelle
      categories: 30 * 60 * 1000,   // 30 minutes pour les catégories
      search: 1 * 60 * 1000,        // 1 minute pour les recherches
      profile: 3 * 60 * 1000,       // 3 minutes pour le profil
      recentListings: 2 * 60 * 1000, // 2 minutes pour annonces récentes
      proListings: 2 * 60 * 1000,   // 2 minutes pour annonces PRO
    };
  }

  /**
   * Générer une clé de cache unique
   */
  generateKey(type, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${type}:${sortedParams || 'default'}`;
  }

  /**
   * Récupérer une donnée du cache
   */
  get(type, params = {}) {
    const key = this.generateKey(type, params);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Vérifier si le cache a expiré
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    console.log(`[CACHE] HIT: ${key}`);
    return cached.data;
  }

  /**
   * Stocker une donnée dans le cache
   */
  set(type, params, data) {
    const key = this.generateKey(type, params);
    const ttl = this.TTL[type] || 60000; // Par défaut 1 minute

    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    });

    console.log(`[CACHE] SET: ${key} (TTL: ${ttl / 1000}s)`);
  }

  /**
   * Invalider une entrée du cache
   */
  invalidate(type, params = {}) {
    const key = this.generateKey(type, params);
    this.cache.delete(key);
    console.log(`[CACHE] INVALIDATE: ${key}`);
  }

  /**
   * Invalider tout le cache d'un type
   */
  invalidateType(type) {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${type}:`)) {
        this.cache.delete(key);
        count++;
      }
    }
    console.log(`[CACHE] INVALIDATE TYPE: ${type} (${count} entries)`);
  }

  /**
   * Nettoyer tout le cache
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`[CACHE] CLEAR: ${size} entries removed`);
  }

  /**
   * Éviter les requêtes dupliquées - déduplication
   * Si une requête identique est déjà en cours, retourne la même promesse
   */
  async dedupe(key, fetchFn) {
    // Si une requête identique est en cours, attendre son résultat
    if (this.pendingRequests.has(key)) {
      console.log(`[CACHE] DEDUPE: Waiting for existing request ${key}`);
      return this.pendingRequests.get(key);
    }

    // Créer la promesse et la stocker
    const promise = fetchFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Wrapper pour les requêtes API avec cache
   */
  async cachedFetch(type, params, fetchFn, options = {}) {
    const { forceRefresh = false, skipCache = false } = options;

    // Vérifier le cache d'abord (sauf si forceRefresh)
    if (!forceRefresh && !skipCache) {
      const cached = this.get(type, params);
      if (cached) return cached;
    }

    // Générer une clé unique pour la déduplication
    const key = this.generateKey(type, params);

    try {
      // Utiliser la déduplication pour éviter les requêtes multiples
      const data = await this.dedupe(key, fetchFn);

      // Mettre en cache le résultat
      if (!skipCache) {
        this.set(type, params, data);
      }

      return data;
    } catch (error) {
      console.error(`[CACHE] Error fetching ${key}:`, error);
      throw error;
    }
  }

  /**
   * Précharger des données en arrière-plan
   */
  prefetch(type, params, fetchFn) {
    // Ne pas bloquer, exécuter en arrière-plan
    setTimeout(() => {
      const cached = this.get(type, params);
      if (!cached) {
        this.cachedFetch(type, params, fetchFn).catch(() => {
          // Ignorer les erreurs de préchargement silencieusement
        });
      }
    }, 100);
  }

  /**
   * Obtenir les statistiques du cache
   */
  getStats() {
    let validEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();

    for (const [, value] of this.cache) {
      if (now <= value.expiry) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
      pending: this.pendingRequests.size
    };
  }
}

// Export singleton
export const cacheService = new CacheService();
export default cacheService;
