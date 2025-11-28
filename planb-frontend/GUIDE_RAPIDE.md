# 🚀 GUIDE RAPIDE - Plan B Frontend

**Démarrage ultra-rapide du frontend React**

---

## ⚡ Installation (Première fois)

```bash
cd planb-frontend
npm install
```

**Temps :** 2-3 minutes

---

## 🎨 Développement

### Démarrer le serveur

```bash
npm run dev
```

**Le frontend sera accessible sur :** http://localhost:3000

### Backend requis

**Le backend doit tourner en parallèle :**
```bash
# Dans un autre terminal
cd ../planb-backend
start-dev.bat
```

**Backend accessible sur :** http://localhost:8000

---

## 📁 Dossiers Importants

```
planb-frontend/
├── src/
│   ├── components/    # 👉 Créer vos composants ici
│   ├── pages/         # 👉 Créer vos pages ici
│   ├── services/      # 👉 API calls au backend
│   └── App.jsx        # Composant principal
└── public/            # Images, favicon, etc.
```

---

## 🎯 Prochaines Étapes

### 1. Créer la maquette (Figma/Adobe XD)
- Page d'accueil
- Liste des annonces
- Détail d'une annonce
- Login/Register
- Profil utilisateur

### 2. Développer les pages
Une fois la maquette validée, créer :
- `src/pages/Home.jsx`
- `src/pages/Listings.jsx`
- `src/pages/ListingDetail.jsx`
- `src/pages/Login.jsx`
- `src/pages/Register.jsx`
- `src/pages/Profile.jsx`

### 3. Connecter au backend
- Utiliser `axios` pour les appels API
- Endpoints disponibles : voir `planb-backend/API_ENDPOINTS_COMPLET.md`

---

## 🔗 API Backend

**Base URL :** `http://localhost:8000/api/v1`

**Endpoints principaux :**
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /listings` - Liste annonces
- `GET /listings/{id}` - Détail annonce
- `POST /listings` - Créer annonce (auth requise)

**Documentation complète :** `../planb-backend/API_ENDPOINTS_COMPLET.md`

---

## 🎨 TailwindCSS

**Utilisez les classes Tailwind directement :**

```jsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  <h1 className="text-2xl font-bold">Plan B</h1>
  <p className="text-sm">Petites annonces</p>
</div>
```

**Documentation :** https://tailwindcss.com/docs

---

## 📦 Dépendances Installées

- **React** - Framework UI
- **React Router** - Navigation
- **Axios** - Requêtes HTTP
- **Lucide React** - Icônes
- **TailwindCSS** - Styles

---

## ✅ Checklist Avant Développement

- [ ] `npm install` exécuté
- [ ] Backend démarré (http://localhost:8000)
- [ ] Frontend démarré (http://localhost:3000)
- [ ] Maquette validée
- [ ] Structure des pages définie

---

## 🆘 Problèmes Courants

### Port 3000 déjà utilisé
```bash
# Changer le port dans vite.config.js
# Ou tuer le processus sur le port 3000
```

### Backend non accessible
```bash
# Vérifier que le backend tourne
curl http://localhost:8000/api/v1/listings
```

### Erreurs npm install
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

---

**🎉 Vous êtes prêt à développer ! Envoyez la maquette pour commencer ! 🚀**
