import api from './axios';

export const offersAPI = {
  /**
   * Créer une offre d'achat
   */
  create: async (listingId, amount, message = null, phone = null) => {
    const response = await api.post('/offers', {
      listing_id: listingId,
      amount,
      message,
      phone
    });
    return response.data;
  },

  /**
   * Liste des offres (buyer/seller/all)
   */
  list: async (role = 'all', status = null) => {
    const params = { role };
    if (status) params.status = status;
    const response = await api.get('/offers', { params });
    return response.data;
  },

  /**
   * Détail d'une offre
   */
  get: async (offerId) => {
    const response = await api.get(`/offers/${offerId}`);
    return response.data;
  },

  /**
   * Accepter une offre (vendeur)
   */
  accept: async (offerId, responseMessage = null) => {
    const response = await api.post(`/offers/${offerId}/accept`, {
      response: responseMessage
    });
    return response.data;
  },

  /**
   * Refuser une offre (vendeur)
   */
  reject: async (offerId, reason = null) => {
    const response = await api.post(`/offers/${offerId}/reject`, { reason });
    return response.data;
  },

  /**
   * Faire une contre-offre (vendeur)
   */
  counter: async (offerId, amount, message = null) => {
    const response = await api.post(`/offers/${offerId}/counter`, {
      amount,
      message
    });
    return response.data;
  },

  /**
   * Accepter une contre-offre (acheteur)
   */
  acceptCounter: async (offerId) => {
    const response = await api.post(`/offers/${offerId}/accept-counter`);
    return response.data;
  },

  /**
   * Annuler une offre (acheteur)
   */
  cancel: async (offerId) => {
    const response = await api.post(`/offers/${offerId}/cancel`);
    return response.data;
  },

  /**
   * Offres pour un listing (vendeur)
   */
  getByListing: async (listingId) => {
    const response = await api.get(`/offers/listing/${listingId}`);
    return response.data;
  },

  /**
   * Statistiques des offres
   */
  getStats: async () => {
    const response = await api.get('/offers/stats');
    return response.data;
  }
};
