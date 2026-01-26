/**
 * Service de gestion des brouillons d'annonces
 * Stocke les annonces non publiées dans le localStorage
 */

const DRAFTS_KEY = 'planb_listing_drafts';

/**
 * Récupérer tous les brouillons
 */
export const getDrafts = () => {
  try {
    const drafts = localStorage.getItem(DRAFTS_KEY);
    return drafts ? JSON.parse(drafts) : [];
  } catch (error) {
    console.error('Erreur lecture brouillons:', error);
    return [];
  }
};

/**
 * Sauvegarder un nouveau brouillon
 * @param {Object} listingData - Les données de l'annonce
 * @returns {Object} Le brouillon sauvegardé avec son ID
 */
export const saveDraft = (listingData) => {
  try {
    const drafts = getDrafts();
    
    const draft = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...listingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };
    
    drafts.unshift(draft); // Ajouter en premier
    
    // Limiter à 10 brouillons max
    const limitedDrafts = drafts.slice(0, 10);
    
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(limitedDrafts));
    
    console.log('✅ Brouillon sauvegardé:', draft.id);
    return draft;
  } catch (error) {
    console.error('Erreur sauvegarde brouillon:', error);
    throw error;
  }
};

/**
 * Mettre à jour un brouillon existant
 * @param {string} draftId - L'ID du brouillon
 * @param {Object} listingData - Les nouvelles données
 */
export const updateDraft = (draftId, listingData) => {
  try {
    const drafts = getDrafts();
    const index = drafts.findIndex(d => d.id === draftId);
    
    if (index === -1) {
      throw new Error('Brouillon non trouvé');
    }
    
    drafts[index] = {
      ...drafts[index],
      ...listingData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    
    console.log('✅ Brouillon mis à jour:', draftId);
    return drafts[index];
  } catch (error) {
    console.error('Erreur mise à jour brouillon:', error);
    throw error;
  }
};

/**
 * Supprimer un brouillon
 * @param {string} draftId - L'ID du brouillon à supprimer
 */
export const deleteDraft = (draftId) => {
  try {
    const drafts = getDrafts();
    const filteredDrafts = drafts.filter(d => d.id !== draftId);
    
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(filteredDrafts));
    
    console.log('✅ Brouillon supprimé:', draftId);
    return true;
  } catch (error) {
    console.error('Erreur suppression brouillon:', error);
    throw error;
  }
};

/**
 * Récupérer un brouillon par son ID
 * @param {string} draftId - L'ID du brouillon
 */
export const getDraftById = (draftId) => {
  const drafts = getDrafts();
  return drafts.find(d => d.id === draftId) || null;
};

/**
 * Compter le nombre de brouillons
 */
export const getDraftsCount = () => {
  return getDrafts().length;
};

/**
 * Vider tous les brouillons
 */
export const clearAllDrafts = () => {
  localStorage.removeItem(DRAFTS_KEY);
  console.log('✅ Tous les brouillons supprimés');
};

export default {
  getDrafts,
  saveDraft,
  updateDraft,
  deleteDraft,
  getDraftById,
  getDraftsCount,
  clearAllDrafts
};
