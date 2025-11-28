import { useEffect, useRef } from 'react';
import websocketService from '../services/websocket';

/**
 * Hook pour utiliser WebSocket dans les composants
 * Gère automatiquement la connexion/déconnexion
 */
export const useWebSocket = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    // Connecter au montage si on a un token
    const token = localStorage.getItem('token');
    if (token && !isInitialized.current) {
      websocketService.connect(token);
      isInitialized.current = true;
    }

    // Déconnecter au démontage
    return () => {
      // Ne pas déconnecter car d'autres composants peuvent l'utiliser
      // websocketService.disconnect();
    };
  }, []);

  return {
    // Méthodes
    send: websocketService.send.bind(websocketService),
    on: websocketService.on.bind(websocketService),
    disconnect: websocketService.disconnect.bind(websocketService),
    sendTyping: websocketService.sendTyping.bind(websocketService),
    markAsRead: websocketService.markAsRead.bind(websocketService),
    isConnected: websocketService.isConnected.bind(websocketService),
  };
};

export default useWebSocket;
