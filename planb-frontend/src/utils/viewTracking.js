/**
 * Système de tracking des vues - Optimisé comme les réseaux sociaux
 * 
 * Fonctionnalités:
 * - Tracking local pour éviter les doublons
 * - Délai minimum avant comptage (preuve de lecture)
 * - Storage des vues dans localStorage
 */

const VIEW_STORAGE_KEY = 'planb_viewed_listings';
const MIN_VIEW_DURATION = 3000; // 3 secondes minimum sur la page
const VIEW_EXPIRY_HOURS = 24; // Une vue par 24h

/**
 * Obtenir les annonces déjà vues depuis le localStorage
 */
function getViewedListings() {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    if (!stored) return {};

    const viewed = JSON.parse(stored);
    
    // Nettoyer les vues expirées
    const now = Date.now();
    const cleaned = {};
    
    for (const [listingId, timestamp] of Object.entries(viewed)) {
      const hoursSinceView = (now - timestamp) / (1000 * 60 * 60);
      if (hoursSinceView < VIEW_EXPIRY_HOURS) {
        cleaned[listingId] = timestamp;
      }
    }

    // Sauvegarder la version nettoyée
    localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(cleaned));
    
    return cleaned;
  } catch (error) {
    console.error('Erreur lecture vues:', error);
    return {};
  }
}

/**
 * Marquer une annonce comme vue
 */
function markAsViewed(listingId) {
  try {
    const viewed = getViewedListings();
    viewed[listingId] = Date.now();
    localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(viewed));
  } catch (error) {
    console.error('Erreur sauvegarde vue:', error);
  }
}

/**
 * Vérifier si une annonce a déjà été vue récemment
 */
export function hasRecentlyViewed(listingId) {
  const viewed = getViewedListings();
  return listingId in viewed;
}

/**
 * Enregistrer une vue d'annonce (avec délai)
 * 
 * @param {number|string} listingId - ID de l'annonce
 * @param {Function} onViewCounted - Callback quand la vue est comptée
 * @returns {Function} Fonction de nettoyage
 */
export function trackListingView(listingId, onViewCounted = null) {
  // Vérifier si déjà vue récemment
  if (hasRecentlyViewed(listingId)) {
    console.log(`Annonce ${listingId} déjà vue récemment`);
    return () => {}; // Pas de nettoyage nécessaire
  }

  let viewCounted = false;
  let startTime = Date.now();

  // Timer pour compter la vue après le délai minimum
  const viewTimer = setTimeout(() => {
    const timeSpent = Date.now() - startTime;
    
    // Compter uniquement si l'utilisateur est resté assez longtemps
    if (timeSpent >= MIN_VIEW_DURATION) {
      markAsViewed(listingId);
      viewCounted = true;
      
      if (onViewCounted) {
        onViewCounted();
      }
      
      console.log(`Vue comptée pour l'annonce ${listingId}`);
    }
  }, MIN_VIEW_DURATION);

  // Fonction de nettoyage
  return () => {
    clearTimeout(viewTimer);
    
    // Si l'utilisateur quitte rapidement, ne pas compter
    if (!viewCounted) {
      const timeSpent = Date.now() - startTime;
      console.log(`Vue non comptée pour l'annonce ${listingId} (temps: ${timeSpent}ms)`);
    }
  };
}

/**
 * Obtenir le temps de lecture estimé basé sur le contenu
 */
export function getEstimatedReadTime(description = '', imagesCount = 0) {
  // ~200 mots par minute de lecture
  const words = description.split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(words / 200);
  
  // + 2 secondes par image pour la visualisation
  const imageTimeSeconds = imagesCount * 2;
  
  const totalSeconds = (readingTimeMinutes * 60) + imageTimeSeconds;
  
  return Math.max(totalSeconds, MIN_VIEW_DURATION / 1000); // Minimum 3 secondes
}

/**
 * Nettoyer les anciennes vues du localStorage
 */
export function cleanOldViews() {
  try {
    const viewed = getViewedListings();
    const now = Date.now();
    const cleaned = {};
    let removedCount = 0;

    for (const [listingId, timestamp] of Object.entries(viewed)) {
      const hoursSinceView = (now - timestamp) / (1000 * 60 * 60);
      if (hoursSinceView < VIEW_EXPIRY_HOURS) {
        cleaned[listingId] = timestamp;
      } else {
        removedCount++;
      }
    }

    localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(cleaned));
    
    if (removedCount > 0) {
      console.log(`${removedCount} vues expirées nettoyées`);
    }
    
    return removedCount;
  } catch (error) {
    console.error('Erreur nettoyage vues:', error);
    return 0;
  }
}

/**
 * Obtenir les statistiques des vues locales
 */
export function getLocalViewStats() {
  const viewed = getViewedListings();
  const viewedIds = Object.keys(viewed);
  
  return {
    totalViewed: viewedIds.length,
    viewedListings: viewedIds,
    oldestView: viewedIds.length > 0 
      ? Math.min(...Object.values(viewed))
      : null,
    newestView: viewedIds.length > 0
      ? Math.max(...Object.values(viewed))
      : null
  };
}

/**
 * Reset complet du tracking (pour tests)
 */
export function resetViewTracking() {
  try {
    localStorage.removeItem(VIEW_STORAGE_KEY);
    console.log('Tracking des vues réinitialisé');
  } catch (error) {
    console.error('Erreur reset tracking:', error);
  }
}
