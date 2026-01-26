/**
 * Service WebSocket pour la messagerie temps réel
 * Remplace le polling pour une meilleure performance
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.listeners = new Map();
    this.isConnecting = false;
  }

  /**
   * Établir la connexion WebSocket
   */
  connect(token) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('WebSocket connection in progress');
      return;
    }

    this.isConnecting = true;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
    const urlWithToken = `${wsUrl}?token=${token}`;

    try {
      this.ws = new WebSocket(urlWithToken);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.emit('disconnected');
        this.attemptReconnect(token);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.isConnecting = false;
    }
  }

  /**
   * Tenter une reconnexion automatique
   */
  attemptReconnect(token) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect(token);
    }, this.reconnectDelay);
  }

  /**
   * Gérer les messages reçus
   */
  handleMessage(data) {
    const { type, payload } = data;

    switch (type) {
      case 'new_message':
        this.emit('new_message', payload);
        break;
      case 'message_read':
        this.emit('message_read', payload);
        break;
      case 'typing':
        this.emit('typing', payload);
        break;
      case 'conversation_updated':
        this.emit('conversation_updated', payload);
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  }

  /**
   * Envoyer un message via WebSocket
   */
  send(type, payload) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      this.ws.send(JSON.stringify({ type, payload }));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
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
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  /**
   * Se déconnecter
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    this.listeners.clear();
  }

  /**
   * Envoyer une notification de frappe
   */
  sendTyping(conversationId) {
    return this.send('typing', { conversationId });
  }

  /**
   * Marquer un message comme lu
   */
  markAsRead(messageId) {
    return this.send('mark_read', { messageId });
  }

  /**
   * Obtenir l'état de la connexion
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Instance singleton
const websocketService = new WebSocketService();

export default websocketService;
