import { useEffect, useRef } from 'react';
import socketIoService from '../services/socketio';

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
      socketIoService.connect(token);
      isInitialized.current = true;
    }

    // Déconnecter au démontage
    return () => {
      // Ne pas déconnecter car d'autres composants peuvent l'utiliser
      // socketIoService.disconnect();
    };
  }, []);

  return {
    // Méthodes
    on: socketIoService.on.bind(socketIoService),
    disconnect: socketIoService.disconnect.bind(socketIoService),
    joinConversation: socketIoService.joinConversation.bind(socketIoService),
    leaveConversation: socketIoService.leaveConversation.bind(socketIoService),
    sendTyping: socketIoService.sendTyping.bind(socketIoService),
    stopTyping: socketIoService.stopTyping.bind(socketIoService),
    markAsRead: socketIoService.markAsRead.bind(socketIoService),
    isConnected: socketIoService.isConnected.bind(socketIoService),
  };
};

export default useWebSocket;
