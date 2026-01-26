import { useState, useEffect, useCallback } from 'react';
import conversationsApi from '../api/conversations';
import { toast } from 'react-hot-toast';

export const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await conversationsApi.getAll();
      setConversations(data.conversations || []);
      setTotalUnread(data.totalUnread || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement');
      toast.error('Impossible de charger les conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const startConversation = useCallback(async (listingId) => {
    try {
      const data = await conversationsApi.start(listingId);
      toast.success('Conversation créée');
      await fetchConversations();
      return data.conversationId;
    } catch (err) {
      console.error('Error starting conversation:', err);
      const errorMsg = err.response?.data?.error || 'Impossible de créer la conversation';
      toast.error(errorMsg);
      throw err;
    }
  }, [fetchConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    totalUnread,
    refresh: fetchConversations,
    startConversation,
  };
};

export default useConversations;
