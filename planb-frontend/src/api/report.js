/**
 * API Report - Signalements
 */
import api from './axios';

export const reportAPI = {
  /**
   * Signaler une annonce
   */
  create: async (data) => {
    const response = await api.post('/api/v1/reports', data);
    return response.data;
  },

  /**
   * Mes signalements
   */
  getMyReports: async () => {
    const response = await api.get('/api/v1/reports/my');
    return response.data;
  },
};


