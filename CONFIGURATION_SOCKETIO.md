# ⚙️ Configuration Socket.io - Guide Complet

## 📋 Fichiers .env à Configurer

### 1. Serveur Socket.io

**Fichier:** `planb-socketio-server/.env`

Créer le fichier (copier depuis `env.example`) :

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_PASSPHRASE=
SYMFONY_URL=http://localhost:8000
```

**Note:** `JWT_PASSPHRASE` est optionnel. Le serveur décode les tokens JWT pour le développement.

---

### 2. Backend Symfony

**Fichier:** `planb-backend/.env`

Ajouter cette ligne :

```env
SOCKETIO_URL=http://localhost:3001
```

---

### 3. Frontend React

**Fichier:** `planb-frontend/.env`

Ajouter cette ligne :

```env
VITE_SOCKETIO_URL=http://localhost:3001
```

---

## 🚀 Démarrage

### Terminal 1: Backend Symfony
```bash
cd planb-backend
php -S localhost:8000 -t public
```

### Terminal 2: Serveur Socket.io
```bash
cd planb-socketio-server
npm start
```

### Terminal 3: Frontend
```bash
cd planb-frontend
npm run dev
```

---

## ✅ Vérification

### 1. Vérifier que Socket.io tourne

```bash
curl http://localhost:3001/health
```

**Résultat attendu:**
```json
{
  "status": "ok",
  "connectedUsers": 0,
  "timestamp": "..."
}
```

### 2. Vérifier la connexion dans le navigateur

1. Ouvrir l'app (http://localhost:5173)
2. Se connecter
3. Ouvrir la console (F12)
4. ✅ Voir "✅ Socket.io connected"

---

## 🔧 Dépannage

### Problème: "Token invalide"

**Solution:** Le serveur décode les tokens JWT sans vérification stricte en développement. 
Si vous avez des problèmes, vérifiez que le token JWT est valide.

### Problème: CORS error

**Solution:** Vérifier que `FRONTEND_URL` dans `planb-socketio-server/.env` correspond à l'URL du frontend.

### Problème: Serveur ne démarre pas

**Solution:** 
1. Vérifier que le port 3001 n'est pas utilisé
2. Vérifier que Node.js est installé
3. Vérifier les dépendances (`npm install`)

---

## 📝 Notes

- Le serveur Socket.io doit tourner **en parallèle** du backend Symfony
- Les tokens JWT sont décodés sans vérification stricte en développement
- En production, configurez la vérification complète avec la clé publique JWT

---

**Une fois configuré, le chat en temps réel sera opérationnel !** 🎉


