# 🧪 TESTS RAPIDES - PLAN B

## ✅ Serveurs lancés !

### 🟢 Backend
- URL: http://localhost:8000
- API: http://localhost:8000/api/v1
- Status: ✅ RUNNING

### 🟢 Frontend  
- URL: http://localhost:5174
- Status: ✅ RUNNING

---

## 🎯 TESTS À FAIRE (10 min)

### 1️⃣ Test Authentification (2 min)

**Inscription:**
```
1. Ouvrir http://localhost:5174/auth
2. Cliquer sur "S'inscrire"
3. Remplir:
   - Email: test@planb.ci
   - Password: Test123!
   - Téléphone: +2250707123456
   - Prénom: Test
   - Nom: User
   - Ville: Abidjan
4. Cliquer "S'inscrire"
5. ✅ Vérifier le toast "Inscription réussie"
```

**Connexion:**
```
1. Cliquer sur "Se connecter"
2. Entrer email et password
3. Cliquer "Se connecter"
4. ✅ Vérifier la redirection vers l'accueil
```

---

### 2️⃣ Test Création d'annonce (2 min)

```
1. Cliquer sur le bouton "+" (en bas)
2. Remplir le formulaire:
   - Titre: "Appartement 3 pièces Cocody"
   - Description: "Bel appartement meublé"
   - Prix: 150000
   - Catégorie: Immobilier
   - Type: Location
   - Ville: Abidjan
3. Cliquer "Publier"
4. ✅ Vérifier le toast "Annonce créée"
5. ✅ Voir l'annonce dans le profil
```

---

### 3️⃣ Test Affichage annonce (1 min)

```
1. Aller sur l'accueil
2. Cliquer sur l'annonce créée
3. ✅ Vérifier tous les détails
4. ✅ Vérifier les images
5. ✅ Vérifier le profil vendeur
```

---

### 4️⃣ Test Recherche (1 min)

```
1. Dans la barre de recherche, taper "appartement"
2. Appuyer sur Entrée
3. ✅ Vérifier les résultats
```

---

### 5️⃣ Test Modification annonce (2 min)

```
1. Aller sur le profil
2. Cliquer sur "..." (menu annonce)
3. Cliquer "Modifier"
4. Changer le titre
5. Cliquer "Sauvegarder"
6. ✅ Vérifier le toast "Annonce modifiée"
```

---

### 6️⃣ Test Navigation (2 min)

**Vérifier toutes les pages:**
```
✅ / - Accueil
✅ /auth - Authentification
✅ /profile - Profil
✅ /settings - Paramètres
✅ /favorites - Favoris
✅ /notifications - Notifications
✅ /conversations - Conversations WhatsApp
✅ /upgrade - Passer PRO
```

---

## 🔍 Points à vérifier

### ✅ Fonctionnalités de base
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Création d'annonce fonctionne
- [ ] Affichage des annonces fonctionne
- [ ] Recherche fonctionne
- [ ] Modification d'annonce fonctionne
- [ ] Suppression d'annonce fonctionne

### ✅ Interface utilisateur
- [ ] Toutes les pages s'affichent
- [ ] Tous les boutons fonctionnent
- [ ] Les toasts s'affichent
- [ ] Les redirections sont correctes
- [ ] Les animations sont fluides

### ✅ Backend
- [ ] Les données sont sauvegardées
- [ ] Les requêtes API fonctionnent
- [ ] Le JWT fonctionne
- [ ] Les erreurs sont gérées

---

## 🆘 En cas d'erreur

### Erreur 401 (Non authentifié)
```javascript
// Console du navigateur (F12)
localStorage.removeItem('token');
// Puis se reconnecter
```

### Erreur "Network Error"
```bash
# Vérifier que le backend tourne
# Dans le terminal où le backend est lancé, vérifier qu'il affiche:
# "PHP Development Server started"
```

### Backend ne répond pas
```bash
# Relancer le backend
cd C:\Users\Elohim Mickael\Documents\plan-b\planb-backend
php -S localhost:8000 -t public
```

### Frontend ne charge pas
```bash
# Relancer le frontend
cd C:\Users\Elohim Mickael\Documents\plan-b\planb-frontend
npm run dev
```

---

## 📊 Résultat attendu

Après les tests, vous devriez avoir:
- ✅ Un compte utilisateur créé
- ✅ Une annonce publiée
- ✅ L'annonce visible sur l'accueil
- ✅ L'annonce dans votre profil
- ✅ Toutes les pages accessibles

---

## 🎉 C'est tout !

Si tous les tests passent, le site est **100% fonctionnel** !

---

*Tests créés le 9 novembre 2025 - 14:42*
