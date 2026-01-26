/**
 * Service Socket.io pour le chat en temps réel
 * Remplace le service WebSocket natif
 */
import { io } from 'socket.io-client';

class SocketIoService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnecting = false;
  }

  /**
   * Connecter au serveur Socket.io
   */
  connect(token) {
    if (this.socket?.connected) {
      console.log('Socket.io already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('Socket.io connection in progress');
      return;
    }

    if (!token) {
      console.warn('No token provided for Socket.io connection');
      return;
    }

    this.isConnecting = true;

    const socketUrl = import.meta.env.VITE_SOCKETIO_URL || 'http://localhost:3001';

    try {
      this.socket = io(socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts
      });

      // Événements de connexion
      this.socket.on('connect', () => {
        console.log('✅ Socket.io connected:', this.socket.id);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected', { socketId: this.socket.id });
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket.io disconnected:', reason);
        this.isConnecting = false;
        this.emit('disconnected', { reason });
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error);
        this.isConnecting = false;
        this.emit('error', error);
      });

      // Écouter les nouveaux messages
      this.socket.on('new_message', (data) => {
        this.emit('new_message', data);
      });

      // Écouter les messages lus
      this.socket.on('message_read', (data) => {
        this.emit('message_read', data);
      });

      // Écouter l'indicateur de frappe
      this.socket.on('typing', (data) => {
        this.emit('typing', data);
      });

      // Écouter les mises à jour de conversation
      this.socket.on('conversation_updated', (data) => {
        this.emit('conversation_updated', data);
      });

    } catch (error) {
      console.error('Error creating Socket.io connection:', error);
      this.isConnecting = false;
    }
  }

  /**
   * Rejoindre une conversation (room)
   */
  joinConversation(conversationId) {
    if (!this.socket?.connected) {
      console.warn('Socket.io not connected, cannot join conversation');
      return;
    }

    this.socket.emit('join_conversation', conversationId);
    console.log(`👥 Joined conversation: ${conversationId}`);
  }

  /**
   * Quitter une conversation
   */
  leaveConversation(conversationId) {
    if (!this.socket?.connected) return;

    this.socket.emit('leave_conversation', conversationId);
    console.log(`👋 Left conversation: ${conversationId}`);
  }

  /**
   * Envoyer un indicateur de frappe
   */
  sendTyping(conversationId) {
    if (!this.socket?.connected) return;

    this.socket.emit('typing', { conversationId });
  }

  /**
   * Arrêter l'indicateur de frappe
   */
  stopTyping(conversationId) {
    if (!this.socket?.connected) return;

    this.socket.emit('stop_typing', { conversationId });
  }

  /**
   * Marquer un message comme lu
   */
  markAsRead(messageId, conversationId) {
    if (!this.socket?.connected) return;

    this.socket.emit('message_read', { messageId, conversationId });
  }

  /**
   * S'abonner à un événement
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Retourner une fonction pour se désabonner
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Émettre un événement aux listeners
   */
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in Socket.io listener:', error);
        }
      });
    }
  }

  /**
   * Se déconnecter
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  /**
   * Vérifier si connecté
   */
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Instance singleton
const socketIoService = new SocketIoService();

export default socketIoService;


