/**
 * Serveur Socket.io pour le chat en temps réel
 * Plan B - Plateforme de petites annonces
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configuration CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Stockage des utilisateurs connectés
const connectedUsers = new Map(); // userId -> socketId
const userRooms = new Map(); // userId -> Set<conversationIds>

/**
 * Vérifier le token JWT
 * 
 * Note: Pour une vérification complète, il faudrait utiliser la clé publique JWT de Symfony.
 * Pour simplifier, on utilise la passphrase JWT ou on décode sans vérification de signature.
 * En production, utilisez la clé publique depuis config/jwt/public.pem
 */
function verifyToken(token) {
  try {
    // Option 1: Utiliser la passphrase JWT (si disponible)
    const passphrase = process.env.JWT_PASSPHRASE;
    
    // Option 2: Décoder sans vérification (pour développement)
    // En production, utilisez la clé publique
    if (passphrase) {
      // Si on a la passphrase, on peut vérifier avec la clé publique
      // Pour l'instant, on décode simplement le token
      return jwt.decode(token, { complete: true });
    }
    
    // Décoder le token (sans vérification de signature pour développement)
    // En production, chargez la clé publique depuis config/jwt/public.pem
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded || !decoded.payload) {
      return null;
    }
    
    // Retourner le payload avec les infos utilisateur
    return {
      sub: decoded.payload.sub || decoded.payload.id || decoded.payload.user_id,
      id: decoded.payload.sub || decoded.payload.id || decoded.payload.user_id,
      user_id: decoded.payload.sub || decoded.payload.id || decoded.payload.user_id,
      email: decoded.payload.email,
      ...decoded.payload
    };
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

/**
 * Authentification Socket.io
 */
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  
  if (!token) {
    return next(new Error('Token manquant'));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return next(new Error('Token invalide'));
  }

  socket.userId = decoded.sub || decoded.id || decoded.user_id;
  socket.user = decoded;
  next();
});

/**
 * Gestion des connexions
 */
io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log(`✅ Utilisateur connecté: ${userId} (socket: ${socket.id})`);

  // Enregistrer l'utilisateur comme connecté
  connectedUsers.set(userId, socket.id);
  socket.emit('connected', { userId });

  /**
   * Rejoindre une conversation (room)
   */
  socket.on('join_conversation', (conversationId) => {
    if (!conversationId) return;

    socket.join(`conversation_${conversationId}`);
    console.log(`👥 Utilisateur ${userId} a rejoint la conversation ${conversationId}`);

    // Stocker les rooms de l'utilisateur
    if (!userRooms.has(userId)) {
      userRooms.set(userId, new Set());
    }
    userRooms.get(userId).add(conversationId);

    // Notifier les autres participants
    socket.to(`conversation_${conversationId}`).emit('user_joined', {
      userId,
      conversationId
    });
  });

  /**
   * Quitter une conversation
   */
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`👋 Utilisateur ${userId} a quitté la conversation ${conversationId}`);

    if (userRooms.has(userId)) {
      userRooms.get(userId).delete(conversationId);
    }
  });

  /**
   * Nouveau message (reçu depuis Symfony)
   * Émis via HTTP POST depuis le backend
   */
  socket.on('new_message', (data) => {
    // Cette fonction est appelée depuis Symfony via HTTP
    // Voir SocketIoService.php
  });

  /**
   * Indicateur de frappe (typing)
   */
  socket.on('typing', (data) => {
    const { conversationId } = data;
    if (!conversationId) return;

    socket.to(`conversation_${conversationId}`).emit('typing', {
      userId,
      conversationId,
      isTyping: true
    });
  });

  /**
   * Arrêter la frappe
   */
  socket.on('stop_typing', (data) => {
    const { conversationId } = data;
    if (!conversationId) return;

    socket.to(`conversation_${conversationId}`).emit('typing', {
      userId,
      conversationId,
      isTyping: false
    });
  });

  /**
   * Message lu
   */
  socket.on('message_read', (data) => {
    const { messageId, conversationId } = data;
    if (!messageId || !conversationId) return;

    socket.to(`conversation_${conversationId}`).emit('message_read', {
      messageId,
      conversationId,
      readBy: userId
    });
  });

  /**
   * Déconnexion
   */
  socket.on('disconnect', () => {
    console.log(`❌ Utilisateur déconnecté: ${userId} (socket: ${socket.id})`);
    
    // Retirer de la liste des connectés
    connectedUsers.delete(userId);
    userRooms.delete(userId);

    // Notifier toutes les conversations
    if (userRooms.has(userId)) {
      userRooms.get(userId).forEach(conversationId => {
        socket.to(`conversation_${conversationId}`).emit('user_left', {
          userId,
          conversationId
        });
      });
    }
  });
});

/**
 * Endpoint HTTP pour recevoir les messages depuis Symfony
 * Symfony fait un POST ici après avoir sauvegardé le message
 */
app.post('/emit-message', (req, res) => {
  const { conversationId, message } = req.body;

  if (!conversationId || !message) {
    return res.status(400).json({ error: 'conversationId et message requis' });
  }

  // Émettre le message à tous les participants de la conversation
  io.to(`conversation_${conversationId}`).emit('new_message', {
    conversationId,
    message
  });

  console.log(`📨 Message émis pour la conversation ${conversationId}`);
  res.json({ success: true });
});

/**
 * Endpoint pour vérifier si un utilisateur est en ligne
 */
app.get('/user/:userId/online', (req, res) => {
  const { userId } = req.params;
  const isOnline = connectedUsers.has(parseInt(userId));
  res.json({ online: isOnline });
});

/**
 * Endpoint de santé
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connectedUsers: connectedUsers.size,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Serveur Socket.io démarré sur le port ${PORT}`);
  console.log(`📡 Prêt à recevoir les connexions WebSocket`);
});

