import api from './axios';

export const paymentsAPI = {
  /**
   * Créer un paiement
   */
  create: async (bookingId, type, paymentMethod, dueDate = null) => {
    const response = await api.post(`/bookings/${bookingId}/payments`, {
      type,
      payment_method: paymentMethod,
      due_date: dueDate
    });
    return response.data;
  },

  /**
   * Liste des paiements d'une réservation
   */
  list: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}/payments`);
    return response.data;
  },

  /**
   * Détails d'un paiement
   */
  get: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  }
};
