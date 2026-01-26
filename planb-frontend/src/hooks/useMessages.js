import { useState, useEffect, useCallback, useRef } from 'react';
import conversationsApi from '../api/conversations';
import messagesApi from '../api/messages';
import { toast } from 'react-hot-toast';
import useWebSocket from './useWebSocket';

export const useMessages = (conversationId) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const ws = useWebSocket();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const data = await conversationsApi.getById(conversationId);
      setConversation(data);
      setMessages(data.messages || []);
      setError(null);
      
      // Scroll après chargement
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement');
      toast.error('Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, scrollToBottom]);

  const sendMessage = useCallback(async (content) => {
    if (!conversationId || !content.trim()) return;

    try {
      setSending(true);
      const response = await messagesApi.send(conversationId, content);
      
      // Ajouter le nouveau message à la liste
      setMessages(prev => [...prev, response.data]);
      
      // Scroll vers le bas
      setTimeout(scrollToBottom, 100);
      
      return response;
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Impossible d\'envoyer le message');
      throw err;
    } finally {
      setSending(false);
    }
  }, [conversationId, scrollToBottom]);

  const markAsRead = useCallback(async (messageId) => {
    try {
      await messagesApi.markAsRead(messageId);
      
      // Mettre à jour localement
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Socket.io temps réel (remplace le polling)
  useEffect(() => {
    if (!conversationId) return;

    // Rejoindre la conversation (room Socket.io)
    if (ws.isConnected()) {
      ws.joinConversation(conversationId);
    }

    // Écouter les nouveaux messages
    const unsubscribeNewMessage = ws.on('new_message', (payload) => {
      if (payload.conversationId === conversationId || payload.message?.conversationId === conversationId) {
        const message = payload.message || payload;
        setMessages(prev => {
          // Éviter les doublons
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
        setTimeout(scrollToBottom, 100);
      }
    });

    // Écouter les messages lus
    const unsubscribeMessageRead = ws.on('message_read', (payload) => {
      if (payload.conversationId === conversationId) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === payload.messageId ? { ...msg, isRead: true } : msg
          )
        );
      }
    });

    // Écouter l'indicateur de frappe
    const unsubscribeTyping = ws.on('typing', (payload) => {
      if (payload.conversationId === conversationId) {
        setTyping(payload.isTyping !== false);
        // Retirer après 3 secondes si isTyping est true
        if (payload.isTyping) {
          setTimeout(() => setTyping(false), 3000);
        }
      }
    });

    // Fallback: polling si Socket.io non connecté
    let interval = null;
    if (!ws.isConnected()) {
      interval = setInterval(() => {
        fetchMessages();
      }, 10000); // Polling toutes les 10s en fallback
    }

    return () => {
      // Quitter la conversation
      if (ws.isConnected()) {
        ws.leaveConversation(conversationId);
      }
      unsubscribeNewMessage?.();
      unsubscribeMessageRead?.();
      unsubscribeTyping?.();
      if (interval) clearInterval(interval);
    };
  }, [conversationId, ws, fetchMessages, scrollToBottom]);

  return {
    conversation,
    messages,
    loading,
    sending,
    error,
    typing,
    sendMessage,
    markAsRead,
    refresh: fetchMessages,
    messagesEndRef,
    scrollToBottom,
    sendTyping: () => {
      if (ws.isConnected()) {
        ws.sendTyping(conversationId);
      }
    },
    stopTyping: () => {
      if (ws.isConnected()) {
        ws.stopTyping(conversationId);
      }
    },
  };
};

export default useMessages;
