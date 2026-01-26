/**
 * API Client pour les visites virtuelles
 */
import api from './axios';

export const virtualTourAPI = {
  /**
   * Upload une visite virtuelle
   * @param {number} listingId - ID de l'annonce
   * @param {File} file - Fichier image 360°
   * @returns {Promise<Object>}
   */
  upload: async (listingId, file) => {
    const formData = new FormData();
    formData.append('virtual_tour', file);

    const response = await api.post(
      `/listings/${listingId}/virtual-tour`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Récupérer la visite virtuelle d'une annonce
   * @param {number} listingId - ID de l'annonce
   * @returns {Promise<Object>}
   */
  get: async (listingId) => {
    try {
      const response = await api.get(`/listings/${listingId}/virtual-tour`);
      return response.data;
    } catch (error) {
      // Si 404, pas de visite virtuelle disponible
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Supprimer la visite virtuelle
   * @param {number} listingId - ID de l'annonce
   * @returns {Promise<Object>}
   */
  delete: async (listingId) => {
    const response = await api.delete(`/listings/${listingId}/virtual-tour`);
    return response.data;
  },
};


