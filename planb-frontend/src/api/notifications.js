import api from './axios';

/**
 * API pour gérer les notifications utilisateur
 */

// Récupérer toutes les notifications
export const getNotifications = async (status = null, limit = 50) => {
  const params = { limit };
  if (status) {
    params.status = status;
  }
  const response = await api.get('/notifications', { params });
  return response.data;
};

// Récupérer le nombre de notifications non lues
export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

// Marquer une notification comme lue
export const markAsRead = async (notificationId) => {
  const response = await api.post(`/notifications/${notificationId}/read`);
  return response.data;
};

// Marquer toutes les notifications comme lues
export const markAllAsRead = async () => {
  const response = await api.post('/notifications/read-all');
  return response.data;
};

// Archiver une notification
export const archiveNotification = async (notificationId) => {
  const response = await api.post(`/notifications/${notificationId}/archive`);
  return response.data;
};

// Supprimer une notification
export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

// Récupérer les préférences de notification
export const getNotificationPreferences = async () => {
  const response = await api.get('/notifications/preferences');
  return response.data;
};

// Mettre à jour les préférences de notification
export const updateNotificationPreferences = async (preferences) => {
  const response = await api.put('/notifications/preferences', preferences);
  return response.data;
};

// Récupérer les statistiques des notifications
export const getNotificationStats = async () => {
  const response = await api.get('/notifications/stats');
  return response.data;
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationStats
};
