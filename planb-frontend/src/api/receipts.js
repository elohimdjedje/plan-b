import api from './axios';

export const receiptsAPI = {
  /**
   * Liste des quittances d'une réservation
   */
  list: async (bookingId) => {
    const response = await api.get('/receipts', {
      params: { booking_id: bookingId }
    });
    return response.data;
  },

  /**
   * Générer une quittance
   */
  generate: async (paymentId, periodStart, periodEnd) => {
    const response = await api.post('/receipts/generate', {
      payment_id: paymentId,
      period_start: periodStart,
      period_end: periodEnd
    });
    return response.data;
  },

  /**
   * Télécharger une quittance
   */
  download: async (id) => {
    const response = await api.get(`/receipts/${id}/download`);
    return response.data;
  },

  /**
   * Trouver par numéro
   */
  findByNumber: async (number) => {
    const response = await api.get(`/receipts/number/${number}`);
    return response.data;
  }
};
