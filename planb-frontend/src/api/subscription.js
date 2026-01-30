import api from './axios';

/**
 * API pour les abonnements PRO
 */
export const subscriptionAPI = {
  /**
   * Créer un paiement pour abonnement PRO
   * @param {number} months - Nombre de mois (1, 3, 6, 12)
   * @param {string} paymentMethod - Méthode de paiement (wave, orange_money, mtn_money, moov_money, card)
   * @param {string} phoneNumber - Numéro de téléphone (requis pour mobile money)
   * @returns {Promise<object>} - Détails du paiement avec paymentUrl, qrCode, etc.
   */
  createPayment: async (months, paymentMethod = 'wave', phoneNumber = null) => {
    try {
      const response = await api.post('/payments/create-subscription', {
        months,
        paymentMethod,
        phoneNumber
      });
      return response.data;
    } catch (error) {
      console.error('Erreur création paiement abonnement:', error);
      throw error;
    }
  },

  /**
   * Confirmer un paiement Wave (pour le mode manuel)
   * @param {number} months - Nombre de mois
   * @param {number} amount - Montant payé
   * @param {string} phoneNumber - Numéro de téléphone
   * @returns {Promise<object>} - Résultat de la confirmation
   */
  confirmWavePayment: async (months, amount, phoneNumber) => {
    try {
      const response = await api.post('/payments/confirm-wave', {
        months,
        amount,
        phoneNumber
      });
      return response.data;
    } catch (error) {
      console.error('Erreur confirmation paiement Wave:', error);
      throw error;
    }
  },

  /**
   * Vérifier le statut d'un paiement
   * @param {number} paymentId - ID du paiement
   * @returns {Promise<object>} - Statut du paiement
   */
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur vérification statut paiement:', error);
      throw error;
    }
  }
};

export default subscriptionAPI;
