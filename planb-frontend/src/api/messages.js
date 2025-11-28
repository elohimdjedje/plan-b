import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const messagesApi = {
  // Envoyer un message
  send: async (conversationId, content) => {
    const response = await axios.post(
      `${API_URL}/messages`,
      { conversationId, content },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Marquer un message comme lu
  markAsRead: async (messageId) => {
    const response = await axios.put(
      `${API_URL}/messages/${messageId}/read`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Compter les messages non lus
  getUnreadCount: async () => {
    const response = await axios.get(`${API_URL}/messages/unread-count`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

export default messagesApi;
