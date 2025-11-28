/**
 * Utilitaires pour les images
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const BACKEND_BASE_URL = API_URL.replace('/api/v1', '');

/**
 * Convertit une URL relative d'image en URL absolue
 * @param {string} imageUrl - URL de l'image (peut être relative ou absolue)
 * @returns {string} URL absolue
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Si l'URL est déjà absolue (commence par http:// ou https://)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Si l'URL est un data URL (SVG inline, etc.)
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Sinon, préfixer avec l'URL du backend
  // Supprimer le / initial si présent pour éviter les doubles //
  const cleanUrl = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
  return `${BACKEND_BASE_URL}/${cleanUrl}`;
};

/**
 * Prépare les images d'une annonce pour l'affichage
 * @param {Object} listing - Annonce
 * @returns {Array} Tableau d'images avec URLs absolues
 */
export const prepareListingImages = (listing) => {
  if (!listing) return [];
  
  // Si l'annonce a des images
  if (listing.images && listing.images.length > 0) {
    return listing.images.map(img => ({
      ...img,
      url: getImageUrl(img.url),
      thumbnailUrl: img.thumbnailUrl ? getImageUrl(img.thumbnailUrl) : getImageUrl(img.url)
    }));
  }
  
  // Si l'annonce a une image principale
  if (listing.mainImage) {
    return [{
      url: getImageUrl(listing.mainImage),
      thumbnailUrl: getImageUrl(listing.mainImage)
    }];
  }
  
  // Placeholder SVG
  return [{
    url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%23f0f0f0" width="800" height="600"/%3E%3Ctext fill="%23999" font-family="Arial" font-size="48" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EAucune image%3C/text%3E%3C/svg%3E'
  }];
};

/**
 * Placeholder pour image manquante
 */
export const IMAGE_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%23f0f0f0" width="800" height="600"/%3E%3Ctext fill="%23999" font-family="Arial" font-size="48" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EAucune image%3C/text%3E%3C/svg%3E';
