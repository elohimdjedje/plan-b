# 🚀 DÉMARRAGE RAPIDE - MODE PRODUCTION

## ⚡ 3 étapes pour un site 100% fonctionnel

---

## 1️⃣ LANCER LE BACKEND (5 min)

```bash
cd C:\Users\Elohim Mickael\Documents\plan-b\planb-backend

# Démarrer le serveur
symfony server:start
```

**Vérifier:** Ouvrir http://localhost:8000/api/v1/listings
- ✅ Doit retourner un JSON

---

## 2️⃣ MIGRER LE FRONTEND (2 min)

```bash
cd C:\Users\Elohim Mickael\Documents\plan-b\planb-frontend

# Exécuter le script de migration
migrate-to-production.bat
```

**Ce script fait:**
- ✅ Sauvegarde les fichiers actuels
- ✅ Remplace par les versions production
- ✅ Crée le fichier `.env`
- ✅ Vérifie le backend

---

## 3️⃣ LANCER LE FRONTEND (1 min)

```bash
cd C:\Users\Elohim Mickael\Documents\plan-b\planb-frontend

# Lancer le serveur de dev
npm run dev
```

**Ouvrir:** http://localhost:5173

---

## ✅ TESTS RAPIDES (5 min)

### 1. Inscription
```
→ Aller sur http://localhost:5173/auth
→ Cliquer "S'inscrire"
→ Remplir et valider
→ ✅ Doit afficher "Inscription réussie"
```

### 2. Créer une annonce
```
→ Cliquer sur "+" (bottom nav)
→ Remplir le formulaire
→ Cliquer "Publier"
→ ✅ Doit apparaître dans le profil
```

### 3. Voir l'annonce
```
→ Aller sur l'accueil
→ Cliquer sur l'annonce créée
→ ✅ Doit afficher tous les détails
```

---

## 🎉 C'EST TOUT !

### Le site est maintenant 100% fonctionnel :
- ✅ Backend connecté
- ✅ Aucune donnée factice
- ✅ Toutes les fonctionnalités actives
- ✅ Prêt pour la démo

---

## 📚 Documentation complète

Pour plus de détails:
- `CHECKLIST_PRODUCTION.md` - Checklist complète
- `MIGRATION_PRODUCTION.md` - Guide détaillé
- `VERIFICATION_CONCORDANCE.md` - Vérification frontend/backend

---

## 🆘 Problèmes ?

### Backend ne répond pas
```bash
symfony server:stop
symfony server:start
```

### Frontend erreur
```bash
# Nettoyer et relancer
npm run dev
```

### Vider le cache
```javascript
// Console du navigateur (F12)
localStorage.clear();
```

---

## ⚡ COMMANDES RAPIDES

```bash
# Tout démarrer en 30 secondes

# Terminal 1 - Backend
cd C:\Users\Elohim Mickael\Documents\plan-b\planb-backend
symfony server:start

# Terminal 2 - Frontend
cd C:\Users\Elohim Mickael\Documents\plan-b\planb-frontend
npm run dev

# Navigateur
# → http://localhost:5173
```

---

**✅ Site prêt en 10 minutes chrono !**

*Document créé le 9 novembre 2025*
