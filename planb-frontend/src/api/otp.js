import api from './axios';

/**
 * API pour la gestion OTP
 */
export const otpApi = {
  /**
   * Envoyer un code OTP par SMS
   * @param {string} phone - Numéro de téléphone au format international (+225...)
   * @returns {Promise<Object>}
   */
  sendOTP: async (phone) => {
    const response = await api.post('/auth/send-otp', { phone });
    return response.data;
  },

  /**
   * Vérifier un code OTP
   * @param {string} phone - Numéro de téléphone
   * @param {string} code - Code OTP à 6 chiffres
   * @returns {Promise<Object>}
   */
  verifyOTP: async (phone, code) => {
    const response = await api.post('/auth/verify-otp', { phone, code });
    return response.data;
  },
};

export default otpApi;
