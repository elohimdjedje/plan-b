/**
 * Utilitaires pour la gestion des favoris
 */

const FAVORITES_KEY = 'planb_favorites';

/**
 * Récupérer tous les favoris
 * @returns {Array<number>} Liste des IDs des annonces favorites
 */
export const getFavorites = () => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return [];
  }
};

/**
 * Sauvegarder les favoris
 * @param {Array<number>} favorites - Liste des IDs
 */
const saveFavorites = (favorites) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des favoris:', error);
  }
};

/**
 * Vérifier si une annonce est en favoris
 * @param {number|string} listingId - ID de l'annonce
 * @returns {boolean}
 */
export const isFavorite = (listingId) => {
  const favorites = getFavorites();
  return favorites.includes(Number(listingId));
};

/**
 * Ajouter une annonce aux favoris
 * @param {number|string} listingId - ID de l'annonce
 * @returns {boolean} - true si ajouté, false si déjà présent
 */
export const addFavorite = (listingId) => {
  try {
    const favorites = getFavorites();
    const id = Number(listingId);
    
    if (favorites.includes(id)) {
      return false; // Déjà en favoris
    }
    
    favorites.push(id);
    saveFavorites(favorites);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error);
    return false;
  }
};

/**
 * Retirer une annonce des favoris
 * @param {number|string} listingId - ID de l'annonce
 * @returns {boolean} - true si retiré, false si pas présent
 */
export const removeFavorite = (listingId) => {
  try {
    const favorites = getFavorites();
    const id = Number(listingId);
    
    const index = favorites.indexOf(id);
    if (index === -1) {
      return false; // Pas en favoris
    }
    
    favorites.splice(index, 1);
    saveFavorites(favorites);
    return true;
  } catch (error) {
    console.error('Erreur lors du retrait des favoris:', error);
    return false;
  }
};

/**
 * Basculer l'état favori d'une annonce
 * @param {number|string} listingId - ID de l'annonce
 * @returns {boolean} - true si ajouté, false si retiré
 */
export const toggleFavorite = (listingId) => {
  if (isFavorite(listingId)) {
    removeFavorite(listingId);
    return false;
  } else {
    addFavorite(listingId);
    return true;
  }
};

/**
 * Supprimer tous les favoris
 */
export const clearFavorites = () => {
  try {
    localStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression des favoris:', error);
  }
};

/**
 * Obtenir le nombre de favoris
 * @returns {number}
 */
export const getFavoritesCount = () => {
  return getFavorites().length;
};

/**
 * Récupérer les annonces favorites complètes
 * @param {Array} allListings - Toutes les annonces disponibles
 * @returns {Array} - Annonces favorites avec leurs détails
 */
export const getFavoriteListings = (allListings) => {
  const favoriteIds = getFavorites();
  return allListings.filter(listing => 
    favoriteIds.includes(Number(listing.id))
  );
};
