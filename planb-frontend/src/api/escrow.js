import api from './axios';

export const escrowAPI = {
  /**
   * Récupérer le compte séquestre d'une réservation
   */
  get: async (bookingId) => {
    const response = await api.get(`/escrow/booking/${bookingId}`);
    return response.data;
  },

  /**
   * Libérer le premier loyer
   */
  releaseFirstRent: async (escrowId) => {
    const response = await api.post(`/escrow/${escrowId}/release-first-rent`);
    return response.data;
  },

  /**
   * Libérer la caution
   */
  releaseDeposit: async (escrowId, reason = 'Fin de bail') => {
    const response = await api.post(`/escrow/${escrowId}/release-deposit`, { reason });
    return response.data;
  },

  /**
   * Retenir une partie de la caution
   */
  retainDeposit: async (escrowId, amount, reason) => {
    const response = await api.post(`/escrow/${escrowId}/retain-deposit`, {
      amount,
      reason
    });
    return response.data;
  }
};
