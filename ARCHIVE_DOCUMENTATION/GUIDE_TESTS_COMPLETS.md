# 🧪 GUIDE DE TESTS COMPLETS - PLAN B

**Date** : 10 novembre 2025  
**Durée estimée** : 30-45 minutes  
**Objectif** : Vérifier que tout fonctionne correctement

---

## 📋 CHECKLIST PRÉALABLE

Avant de commencer les tests :

- [ ] Backend démarré sur http://localhost:8000
- [ ] Frontend démarré sur http://localhost:5173
- [ ] PostgreSQL en cours d'exécution
- [ ] Migrations exécutées (34 tables créées)
- [ ] Variables d'environnement configurées (.env)

---

## 🚀 PARTIE 1 : TESTS BACKEND (15 min)

### 🔧 Préparation

```bash
# Terminal 1 : Démarrer le serveur backend
cd planb-backend
php -S localhost:8000 -t public

# Terminal 2 : Voir les logs en temps réel (optionnel)
tail -f var/log/dev.log
```

---

### ✅ TEST 1 : Endpoints de Base

#### 1.1 Vérifier que le serveur répond
```bash
curl http://localhost:8000
# Attendu : Erreur 404 normal (pas de route /)
```

#### 1.2 Test endpoint API racine
```bash
curl http://localhost:8000/api/v1
# Attendu : Message d'accueil ou 404
```

---

### ✅ TEST 2 : Système OTP

#### 2.1 Envoyer un code OTP
```bash
curl -X POST http://localhost:8000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+225070000000"}'
```

**Résultat attendu** :
```json
{
  "message": "Code envoyé par SMS",
  "expiresIn": 300
}
```

**📝 Note** : En mode dev, le code OTP est visible dans les logs backend. Regardez le terminal du serveur PHP ou `var/log/dev.log`.

#### 2.2 Vérifier le code OTP
```bash
# Remplacez 123456 par le code réel des logs
curl -X POST http://localhost:8000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+225070000000",
    "code": "123456"
  }'
```

**Résultat attendu** :
```json
{
  "message": "Téléphone vérifié avec succès"
}
```

---

### ✅ TEST 3 : Inscription avec OTP

#### 3.1 Inscription complète
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+225070000000",
    "email": "test1@planb.ci",
    "password": "Test1234!",
    "firstName": "Test",
    "lastName": "User",
    "country": "CI",
    "city": "Abidjan"
  }'
```

**Résultat attendu** :
```json
{
  "message": "Inscription réussie",
  "user": {
    "id": 1,
    "email": "test1@planb.ci",
    "firstName": "Test",
    "lastName": "User",
    "accountType": "FREE"
  }
}
```

**❌ Si erreur** "Veuillez d'abord vérifier votre numéro" :
- Le téléphone n'a pas été vérifié via OTP
- Refaire TEST 2.1 et 2.2 puis réessayer

---

### ✅ TEST 4 : Connexion

#### 4.1 Login utilisateur
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test1@planb.ci",
    "password": "Test1234!"
  }'
```

**Résultat attendu** :
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "test1@planb.ci",
    ...
  }
}
```

**📝 Important** : Copiez le token JWT, vous en aurez besoin pour les tests suivants !

#### 4.2 Récupérer profil utilisateur
```bash
# Remplacez YOUR_JWT_TOKEN par le token reçu
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Résultat attendu** : Profil utilisateur complet

---

### ✅ TEST 5 : Quota FREE (3 annonces max)

#### 5.1 Créer 1ère annonce
```bash
curl -X POST http://localhost:8000/api/v1/listings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPhone 13 Pro",
    "description": "Excellent état, 128GB",
    "price": 450000,
    "currency": "XOF",
    "category": "Electronique",
    "subcategory": "Smartphones",
    "type": "vente",
    "country": "CI",
    "city": "Abidjan"
  }'
```

**Résultat attendu** : Annonce créée (HTTP 201)

#### 5.2 Créer 2ème et 3ème annonce
```bash
# Répétez la commande ci-dessus 2 fois avec des titres différents
# Changez "iPhone 13 Pro" en "MacBook Air" et "AirPods Pro"
```

**Résultat attendu** : 3 annonces créées avec succès

#### 5.3 Créer 4ème annonce (doit échouer)
```bash
curl -X POST http://localhost:8000/api/v1/listings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPad Pro",
    "description": "Quota test",
    "price": 300000,
    "currency": "XOF",
    "category": "Electronique",
    "type": "vente",
    "country": "CI",
    "city": "Abidjan"
  }'
```

**Résultat attendu** :
```json
{
  "error": "QUOTA_EXCEEDED",
  "message": "Vous avez atteint la limite de 3 annonces actives. Passez PRO pour publier sans limite.",
  "currentListings": 3,
  "maxListings": 3
}
```

**✅ Test réussi** si vous obtenez cette erreur !

---

### ✅ TEST 6 : Favoris

#### 6.1 Ajouter une annonce aux favoris
```bash
curl -X POST http://localhost:8000/api/v1/favorites/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Résultat attendu** :
```json
{
  "message": "Ajouté aux favoris",
  "favoriteId": 1
}
```

#### 6.2 Lister les favoris
```bash
curl -X GET http://localhost:8000/api/v1/favorites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Résultat attendu** : Liste avec 1 favori

#### 6.3 Vérifier si en favoris
```bash
curl -X GET http://localhost:8000/api/v1/favorites/check/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Résultat attendu** :
```json
{
  "isFavorite": true
}
```

#### 6.4 Retirer des favoris
```bash
curl -X DELETE http://localhost:8000/api/v1/favorites/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Résultat attendu** :
```json
{
  "message": "Retiré des favoris"
}
```

---

### ✅ TEST 7 : Messagerie

**Prérequis** : Créer un 2ème utilisateur pour la conversation

#### 7.1 Créer 2ème utilisateur
```bash
# 1. Envoyer OTP
curl -X POST http://localhost:8000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+225080000000"}'

# 2. Vérifier OTP (regarder logs pour le code)
curl -X POST http://localhost:8000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+225080000000", "code": "CODE_DES_LOGS"}'

# 3. Inscription
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+225080000000",
    "email": "test2@planb.ci",
    "password": "Test1234!",
    "firstName": "User",
    "lastName": "Two",
    "country": "CI",
    "city": "Abidjan"
  }'

# 4. Login et copier le TOKEN2
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test2@planb.ci", "password": "Test1234!"}'
```

#### 7.2 Démarrer une conversation
```bash
# User 2 contacte l'annonce de User 1 (ID=1)
curl -X POST http://localhost:8000/api/v1/conversations/start/1 \
  -H "Authorization: Bearer TOKEN_USER2"
```

**Résultat attendu** :
```json
{
  "message": "Conversation créée",
  "conversationId": 1
}
```

#### 7.3 Envoyer un message
```bash
curl -X POST http://localhost:8000/api/v1/messages \
  -H "Authorization: Bearer TOKEN_USER2" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": 1,
    "content": "Bonjour, l'\''iPhone est-il toujours disponible ?"
  }'
```

**Résultat attendu** : Message créé (HTTP 201)

#### 7.4 Lister les conversations (User 1)
```bash
curl -X GET http://localhost:8000/api/v1/conversations \
  -H "Authorization: Bearer TOKEN_USER1"
```

**Résultat attendu** : 1 conversation avec message non lu

#### 7.5 Voir détails conversation
```bash
curl -X GET http://localhost:8000/api/v1/conversations/1 \
  -H "Authorization: Bearer TOKEN_USER1"
```

**Résultat attendu** : Messages de la conversation

#### 7.6 Compter messages non lus
```bash
curl -X GET http://localhost:8000/api/v1/messages/unread-count \
  -H "Authorization: Bearer TOKEN_USER1"
```

**Résultat attendu** :
```json
{
  "unreadCount": 1
}
```

---

### ✅ TEST 8 : Signalements

#### 8.1 Signaler une annonce
```bash
curl -X POST http://localhost:8000/api/v1/reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": 1,
    "reason": "spam",
    "description": "Annonce suspecte"
  }'
```

**Résultat attendu** :
```json
{
  "message": "Signalement enregistré. Notre équipe va examiner cette annonce.",
  "reportId": 1
}
```

#### 8.2 Lister mes signalements
```bash
curl -X GET http://localhost:8000/api/v1/reports/my \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Résultat attendu** : Liste des signalements

---

### ✅ TEST 9 : Rate Limiting

#### 9.1 Tester limite SMS (3 par 10min)
```bash
# Envoyer 4 SMS rapidement
for i in {1..4}; do
  curl -X POST http://localhost:8000/api/v1/auth/send-otp \
    -H "Content-Type: application/json" \
    -d '{"phone": "+225070000000"}'
  echo "\n--- Tentative $i ---\n"
done
```

**Résultat attendu** : Les 3 premiers passent, le 4ème est bloqué (HTTP 429)

---

## 🎨 PARTIE 2 : TESTS FRONTEND (15 min)

### 🔧 Préparation

```bash
# Ouvrir navigateur sur http://localhost:5173
```

---

### ✅ TEST 10 : OTP Frontend

#### 10.1 Page d'inscription
1. Aller sur `/register` (ou créer la route vers `RegisterWithOTP`)
2. Entrer numéro : `+225090000000`
3. Cliquer "Recevoir le code"
4. ✅ Toast "Code envoyé par SMS"
5. ✅ Timer démarre à 05:00

#### 10.2 Saisie code OTP
1. Regarder logs backend pour le code
2. Coller le code dans les 6 champs
3. ✅ Auto-distribution dans les champs
4. ✅ Vérification automatique
5. ✅ Toast "Téléphone vérifié"
6. ✅ Passage au formulaire

#### 10.3 Compléter inscription
1. Remplir email, password, nom, prénom, ville
2. Soumettre formulaire
3. ✅ Inscription réussie
4. ✅ Redirection vers login

---

### ✅ TEST 11 : Messagerie Frontend

**Prérequis** : Avoir une conversation créée (voir TEST 7)

#### 11.1 Page conversations
1. Se connecter en tant que User 1
2. Aller sur `/conversations`
3. ✅ Liste des conversations affichée
4. ✅ Badge "1" sur conversation non lue

#### 11.2 Ouvrir conversation
1. Cliquer sur la conversation
2. ✅ Messages affichés
3. ✅ Scroll automatique vers le bas
4. ✅ Badge disparaît

#### 11.3 Envoyer message
1. Taper "Oui, toujours disponible"
2. Appuyer Entrée
3. ✅ Message envoyé
4. ✅ Apparaît à droite (bulle orange)
5. ✅ Scroll automatique

#### 11.4 Auto-refresh
1. Avec User 2, envoyer un message via API :
```bash
curl -X POST http://localhost:8000/api/v1/messages \
  -H "Authorization: Bearer TOKEN_USER2" \
  -H "Content-Type: application/json" \
  -d '{"conversationId": 1, "content": "Parfait ! Quel est le prix ?"}'
```
2. ✅ Attendre maximum 5 secondes
3. ✅ Message apparaît automatiquement chez User 1

---

### ✅ TEST 12 : Favoris Frontend

#### 12.1 Bouton favori sur annonce
1. Aller sur une page d'annonce (créer `ListingDetail` si nécessaire)
2. Ajouter `<FavoriteButton listingId={id} />` dans le code
3. Cliquer sur le cœur
4. ✅ Animation scale + fill rouge
5. ✅ Toast "Ajouté aux favoris"

#### 12.2 Page liste favoris
1. Aller sur `/favorites`
2. ✅ Annonce favorite affichée
3. ✅ Card complète avec image, prix, localisation
4. Cliquer sur card
5. ✅ Navigation vers détail

#### 12.3 Retirer favori
1. Sur `/favorites`, cliquer sur cœur rouge
2. ✅ Animation particules
3. ✅ Toast "Retiré des favoris"
4. ✅ Card disparaît avec animation
5. Rafraîchir page
6. ✅ Favori bien retiré (pas dans la liste)

---

## 📱 PARTIE 3 : TESTS RESPONSIVE (5 min)

### ✅ TEST 13 : Mobile

1. Ouvrir DevTools (F12)
2. Activer mode responsive (Ctrl+Shift+M)
3. Choisir iPhone 12 (390×844)

#### Messagerie
- ✅ Liste conversations en plein écran
- ✅ Clic sur conversation → thread affiché
- ✅ Bouton retour visible
- ✅ Input message adapté

#### Favoris
- ✅ Grille 1 colonne
- ✅ Cards lisibles
- ✅ Bouton cœur cliquable

#### OTP
- ✅ Champs 48×56px
- ✅ Clavier numérique sur mobile
- ✅ Timer visible

---

### ✅ TEST 14 : Desktop

1. Basculer en mode Desktop (1920×1080)

#### Messagerie
- ✅ Split view (liste à gauche, thread à droite)
- ✅ Proportions 1/3 - 2/3
- ✅ Scroll indépendant

#### Favoris
- ✅ Grille 3 colonnes
- ✅ Spacing harmonieux
- ✅ Hover effects

---

## 🔍 PARTIE 4 : TESTS DE SÉCURITÉ (5 min)

### ✅ TEST 15 : Accès non autorisé

#### 15.1 Endpoints protégés sans token
```bash
curl -X GET http://localhost:8000/api/v1/favorites
# Attendu : HTTP 401 Unauthorized
```

#### 15.2 Token invalide
```bash
curl -X GET http://localhost:8000/api/v1/favorites \
  -H "Authorization: Bearer FAKE_TOKEN"
# Attendu : HTTP 401 Unauthorized
```

---

### ✅ TEST 16 : Validation données

#### 16.1 Téléphone invalide
```bash
curl -X POST http://localhost:8000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "0123456789"}'
# Attendu : HTTP 400 + erreur validation
```

#### 16.2 Code OTP incorrect
```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+225070000000", "code": "000000"}'
# Attendu : HTTP 400 + "Code incorrect"
```

---

## 📊 CHECKLIST FINALE

### Backend ✅
- [ ] OTP : Envoi + Vérification
- [ ] Inscription avec téléphone vérifié
- [ ] Login + JWT
- [ ] Quota FREE (3 annonces max)
- [ ] Favoris : Ajouter, Lister, Retirer
- [ ] Conversations : Créer, Lister, Détails
- [ ] Messages : Envoyer, Compter non lus
- [ ] Signalements : Créer, Lister
- [ ] Rate limiting fonctionne

### Frontend ✅
- [ ] OTP : Timer + Auto-focus + Paste
- [ ] Messagerie : Liste + Thread + Auto-refresh
- [ ] Favoris : Bouton animé + Page liste
- [ ] Responsive : Mobile + Desktop
- [ ] Animations fluides (60fps)
- [ ] Toast notifications
- [ ] Loading states

### Sécurité ✅
- [ ] Endpoints protégés (JWT requis)
- [ ] Validation téléphone
- [ ] Validation données
- [ ] Rate limiting actif

---

## 🎯 RÉSULTATS ATTENDUS

Si tous les tests passent :

```
✅ Backend : 100% fonctionnel
✅ Frontend : 100% fonctionnel
✅ Intégration : 100% OK
✅ Sécurité : Renforcée
✅ UX : Excellente
```

**→ Projet prêt pour la production ! 🚀**

---

## 🐛 DÉPANNAGE

### Erreur : "Class not found"
```bash
cd planb-backend
composer dump-autoload
php bin/console cache:clear
```

### Erreur : "Connection refused"
```bash
# Vérifier PostgreSQL
pg_isready

# Redémarrer PostgreSQL si nécessaire
```

### Erreur frontend : "Network Error"
```bash
# Vérifier que backend tourne sur :8000
curl http://localhost:8000

# Vérifier CORS dans backend
# Fichier : config/packages/nelmio_cors.yaml
```

### Code OTP non reçu
```bash
# En dev, regarder les logs backend
tail -f planb-backend/var/log/dev.log

# Ou dans le terminal du serveur PHP
# Le code s'affiche : "OTP Code: 123456"
```

---

## 📝 RAPPORT DE TESTS

Complétez ce tableau après vos tests :

| Test | Status | Notes |
|------|--------|-------|
| OTP Backend | ⬜ | |
| Inscription | ⬜ | |
| Quota FREE | ⬜ | |
| Favoris | ⬜ | |
| Messagerie | ⬜ | |
| OTP Frontend | ⬜ | |
| Responsive | ⬜ | |
| Sécurité | ⬜ | |

**Légende** : ✅ OK | ⚠️ Partiel | ❌ KO | ⬜ Non testé

---

## 🎉 FÉLICITATIONS !

Si vous avez terminé tous les tests, vous avez :

✅ **Vérifié** que tout fonctionne  
✅ **Validé** l'intégration backend/frontend  
✅ **Testé** la sécurité  
✅ **Confirmé** la qualité du code  

**Votre projet Plan B est maintenant production-ready ! 🚀**

---

## 💬 PROCHAINES ÉTAPES

**D) Pause & Review**
- Documentation utilisateur finale
- Guide de déploiement
- Optimisations performance

**Ou autre ?**
- Dites-moi ce que vous voulez faire !

---

**Bon courage pour les tests ! 💪**
