# 💬 Chat en Temps Réel avec Socket.io - Analyse

## 📋 Situation Actuelle

### Ce qui existe déjà ✅
- Système de conversations (Conversation entity)
- Système de messages (Message entity)
- API REST pour envoyer/récupérer messages
- Frontend avec polling toutes les 10 secondes
- Mobile avec polling toutes les 10 secondes

### Problèmes actuels ❌
- **Polling inefficace** : Requêtes toutes les 10s même sans nouveaux messages
- **Délai de réception** : Jusqu'à 10 secondes de latence
- **Charge serveur** : Beaucoup de requêtes inutiles
- **Pas d'indicateurs** : Pas de "typing..." ou "en ligne"

---

## 🎯 Solution : Socket.io

### Architecture

```
Frontend (React)
    ↓ WebSocket
Serveur Socket.io (Node.js)
    ↓ HTTP/Events
Backend Symfony (PHP)
    ↓
Base de données PostgreSQL
```

### Avantages
- ✅ **Temps réel** : Messages instantanés
- ✅ **Efficace** : Pas de polling inutile
- ✅ **Fonctionnalités** : Typing indicators, online status
- ✅ **Scalable** : Supporte des milliers de connexions
- ✅ **Reconnexion automatique** : Gestion des déconnexions

---

## 🏗️ Architecture Technique

### 1. Serveur Socket.io (Node.js)

**Fichier:** `planb-socketio-server/server.js`

**Fonctionnalités:**
- Connexion WebSocket
- Authentification JWT
- Rooms par conversation
- Émission d'événements
- Gestion des déconnexions

### 2. Backend Symfony

**Modifications:**
- `MessageController` : Émettre événement HTTP vers Socket.io
- Service `SocketIoService` : Communication avec serveur Node.js

### 3. Frontend React

**Nouveaux fichiers:**
- `useSocket.js` : Hook pour connexion Socket.io
- `SocketProvider.jsx` : Context pour Socket.io
- Modification des composants de chat

---

## 📦 Dépendances

### Backend (Node.js)
```json
{
  "socket.io": "^4.7.0",
  "express": "^4.18.0",
  "jsonwebtoken": "^9.0.0",
  "cors": "^2.8.5"
}
```

### Frontend (React)
```json
{
  "socket.io-client": "^4.7.0"
}
```

---

## 🔄 Flux de Messages

### Envoi d'un message

```
1. Utilisateur tape message
2. Frontend → API REST Symfony (POST /api/v1/messages)
3. Symfony sauvegarde en DB
4. Symfony → HTTP POST vers Socket.io server
5. Socket.io → Émet événement 'new_message' dans la room
6. Tous les clients de la conversation reçoivent le message
```

### Réception d'un message

```
1. Socket.io émet 'new_message'
2. Frontend reçoit via WebSocket
3. Mise à jour de l'interface en temps réel
4. Notification si fenêtre inactive
```

---

## 🎨 Fonctionnalités à Ajouter

### Phase 1 (MVP)
- ✅ Messages en temps réel
- ✅ Indicateur "en ligne"
- ✅ Reconnexion automatique

### Phase 2 (Améliorations)
- ✅ Indicateur "typing..."
- ✅ Messages lus/non lus en temps réel
- ✅ Notifications push
- ✅ Son de notification

### Phase 3 (Premium)
- ✅ Appels vocaux (WebRTC)
- ✅ Partage de fichiers
- ✅ Messages vocaux

---

## 🔒 Sécurité

### Authentification
- JWT token dans la connexion Socket.io
- Vérification côté serveur Node.js
- Validation des permissions par conversation

### Validation
- Vérifier que l'utilisateur appartient à la conversation
- Limiter la taille des messages
- Rate limiting (anti-spam)

---

## 📊 Performance

### Avant (Polling)
- 6 requêtes/minute par utilisateur
- 100 utilisateurs = 600 requêtes/minute
- Latence : 0-10 secondes

### Après (Socket.io)
- 1 connexion WebSocket par utilisateur
- 100 utilisateurs = 100 connexions
- Latence : < 100ms

**Gain : 6x moins de requêtes, 100x moins de latence**

---

## 🚀 Plan d'Implémentation

1. **Serveur Socket.io** (1-2 heures)
2. **Backend Symfony** (1 heure)
3. **Frontend React** (2-3 heures)
4. **Tests** (1 heure)

**Total : 5-7 heures**

---

## ✅ Prêt à implémenter !


