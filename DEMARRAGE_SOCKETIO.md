# 🚀 Démarrage Socket.io - Guide Rapide

## ✅ Serveur Socket.io : **DÉMARRÉ ET FONCTIONNEL**

Le serveur répond sur http://localhost:3001/health ✅

---

## ⚙️ Dernières Configurations (2 minutes)

### 1. Backend Symfony

Ouvrir `planb-backend/.env` et ajouter cette ligne :

```env
SOCKETIO_URL=http://localhost:3001
```

### 2. Frontend React

Ouvrir `planb-frontend/.env` (ou créer si n'existe pas) et ajouter :

```env
VITE_SOCKETIO_URL=http://localhost:3001
```

---

## 🚀 Démarrer les 3 Serveurs

### Terminal 1: Backend Symfony
```bash
cd planb-backend
php -S localhost:8000 -t public
```

### Terminal 2: Serveur Socket.io (DÉJÀ DÉMARRÉ ✅)
```bash
cd planb-socketio-server
npm start
```

**Note:** Le serveur tourne déjà en arrière-plan. Si vous le redémarrez, utilisez cette commande.

### Terminal 3: Frontend
```bash
cd planb-frontend
npm run dev
```

---

## 🧪 Test Rapide

1. Ouvrir http://localhost:5173
2. Se connecter
3. Ouvrir la console (F12)
4. ✅ Voir "✅ Socket.io connected"

---

## ✅ Checklist

- [x] Serveur Socket.io démarré
- [x] Fichier `.env` Socket.io créé
- [ ] Ajouter `SOCKETIO_URL` dans `planb-backend/.env`
- [ ] Ajouter `VITE_SOCKETIO_URL` dans `planb-frontend/.env`
- [ ] Démarrer backend Symfony
- [ ] Démarrer frontend
- [ ] Tester connexion Socket.io
- [ ] Tester messages temps réel

---

**Le serveur Socket.io est prêt ! Il reste juste à configurer les 2 variables dans les .env !** 🎉


