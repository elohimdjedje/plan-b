import api from './axios';

export const availabilityAPI = {
  /**
   * Récupérer le calendrier de disponibilité
   */
  get: async (listingId, startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get(`/availability/listing/${listingId}`, { params });
    return response.data;
  },

  /**
   * Bloquer des dates
   */
  block: async (listingId, dates, reason = null) => {
    const response = await api.post(`/availability/listing/${listingId}/block`, {
      dates,
      reason
    });
    return response.data;
  },

  /**
   * Débloquer des dates
   */
  unblock: async (listingId, dates) => {
    const response = await api.post(`/availability/listing/${listingId}/unblock`, {
      dates
    });
    return response.data;
  }
};
