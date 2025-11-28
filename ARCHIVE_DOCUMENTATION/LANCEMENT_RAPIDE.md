# 🚀 LANCEMENT RAPIDE - PLAN B

## ⚡ Démarrage en 3 étapes

### 1️⃣ Vérifier Docker
```powershell
docker ps
```
Devrait afficher 3 containers actifs : planb_api, planb_postgres, planb_adminer

### 2️⃣ Lancer le Frontend (si pas déjà lancé)
```powershell
cd planb-frontend
npm run dev
```
Ouvrir : http://localhost:5173

### 3️⃣ Tester !
- **Inscription OTP** : http://localhost:5173/auth/register-otp
- **Voir Adminer** : http://localhost:8080 (user: postgres, pass: root, db: planb)

---

## 🧪 TEST RAPIDE DE CRÉATION DE COMPTE

### Étape 1 : Inscription
1. Aller sur http://localhost:5173/auth/register-otp
2. Entrer : +225 07 00 00 00 00
3. Cliquer "Recevoir le code"

### Étape 2 : Récupérer le code OTP
```powershell
docker logs planb_api | Select-String "OTP Code"
```
Chercher la ligne : `OTP Code for +225... : 123456`

### Étape 3 : Entrer le code
1. Saisir le code à 6 chiffres
2. Remplir le formulaire (email, mot de passe, nom, prénom, ville)
3. Cliquer "Créer mon compte"

### Étape 4 : Vérifier dans Adminer
1. Aller sur http://localhost:8080
2. Connexion : postgres / root
3. Sélectionner base : planb
4. Cliquer sur table "users"
5. Voir votre nouveau compte ! 🎉

---

## 🌐 URLs Essentielles

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Inscription OTP** | http://localhost:5173/auth/register-otp |
| **Favoris (nouveau)** | http://localhost:5173/favorites-new |
| **API Backend** | http://localhost:8000 |
| **Adminer (BDD)** | http://localhost:8080 |

---

## 🆘 Dépannage Rapide

### Frontend ne démarre pas ?
```powershell
cd planb-frontend
npm install
npm run dev
```

### Backend erreur ?
```powershell
docker logs planb_api
docker restart planb_api
```

### Base de données vide ?
```powershell
cd planb-backend
.\clean-db.ps1
```
Puis créer un nouveau compte.

---

## ✅ Checklist de Vérification

- [ ] Docker Desktop est lancé
- [ ] 3 containers actifs (docker ps)
- [ ] Frontend accessible sur :5173
- [ ] Backend accessible sur :8000
- [ ] Adminer accessible sur :8080
- [ ] Base de données "planb" existe
- [ ] Table "users" existe

---

## 📚 Documentation Complète

Voir : `IMPLEMENTATION_COMPLETE_FINAL.md`

---

**Bon test ! 🚀**
