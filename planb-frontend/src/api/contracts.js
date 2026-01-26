import api from './axios';

export const contractsAPI = {
  /**
   * Générer un contrat
   */
  generate: async (bookingId, templateType = 'furnished_rental') => {
    const response = await api.post('/contracts/generate', {
      booking_id: bookingId,
      template_type: templateType
    });
    return response.data;
  },

  /**
   * Récupérer le contrat d'une réservation
   */
  get: async (bookingId) => {
    const response = await api.get(`/contracts/booking/${bookingId}`);
    return response.data;
  },

  /**
   * Signer le contrat (propriétaire)
   */
  signOwner: async (contractId, signatureUrl) => {
    const response = await api.post(`/contracts/${contractId}/sign-owner`, {
      signature_url: signatureUrl
    });
    return response.data;
  },

  /**
   * Signer le contrat (locataire)
   */
  signTenant: async (contractId, signatureUrl) => {
    const response = await api.post(`/contracts/${contractId}/sign-tenant`, {
      signature_url: signatureUrl
    });
    return response.data;
  }
};
