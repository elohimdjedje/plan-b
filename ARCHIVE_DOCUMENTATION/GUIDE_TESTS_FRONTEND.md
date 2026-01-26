# 🎨 GUIDE DE TESTS FRONTEND - PLAN B

**Date** : 10 novembre 2025, 21:35  
**URL** : http://localhost:5173  
**Durée estimée** : 20-30 minutes

---

## ✅ SERVEURS ACTIFS

- ✅ **Backend** : http://localhost:8000 (API)
- ✅ **Frontend** : http://localhost:5173 (React)

---

## 🧪 SCÉNARIOS DE TESTS

### 📱 TEST 1 : SYSTÈME OTP (5 min)

#### Étape 1 : Accéder à la page d'inscription
1. Ouvrir http://localhost:5173
2. Cliquer sur "S'inscrire" ou aller sur `/register`

#### Étape 2 : Vérification du téléphone
1. **Saisir numéro** : `+225090000000`
2. Cliquer "Recevoir le code"
3. ✅ **Vérifier** :
   - Toast "Code envoyé par SMS"
   - Timer démarre à 05:00
   - 6 champs OTP affichés

#### Étape 3 : Saisir le code OTP
1. **Regarder les logs backend** pour obtenir le code :
   ```bash
   # Dans un terminal, aller dans planb-backend
   Get-Content var\log\dev.log -Tail 3 | Select-String "\d{6}"
   ```
2. **Saisir le code** dans les 6 champs
3. ✅ **Vérifier** :
   - Auto-focus entre les champs
   - Validation automatique
   - Toast "Téléphone vérifié avec succès"
   - Animation de succès
   - Passage au formulaire d'inscription

#### Étape 4 : Compléter l'inscription
1. Remplir le formulaire :
   - Email : `test@planb.ci`
   - Mot de passe : `Test1234!`
   - Prénom : `Test`
   - Nom : `User`
   - Pays : `Côte d'Ivoire`
   - Ville : `Abidjan`
2. Cliquer "Créer mon compte"
3. ✅ **Vérifier** :
   - Inscription réussie
   - Redirection vers login

---

### 🔐 TEST 2 : CONNEXION (2 min)

1. Aller sur la page de connexion
2. Se connecter avec :
   - Email : `test@planb.ci`
   - Mot de passe : `Test1234!`
3. ✅ **Vérifier** :
   - Connexion réussie
   - JWT token sauvegardé
   - Redirection vers l'accueil
   - Profil utilisateur affiché

---

### 💬 TEST 3 : MESSAGERIE (10 min)

#### Prérequis : Créer un 2ème utilisateur
1. Se déconnecter
2. Refaire TEST 1 avec un autre numéro (`+225091000000`)
3. Email : `user2@planb.ci`

#### Test messagerie
1. **User 1** : Créer une annonce
2. **User 2** : Se connecter et voir l'annonce
3. **User 2** : Cliquer sur "Contacter le vendeur"
4. ✅ **Vérifier** :
   - Conversation créée
   - Redirection vers `/conversations`

#### Envoyer un message
1. Taper "Bonjour, l'article est-il disponible ?"
2. Appuyer Entrée
3. ✅ **Vérifier** :
   - Message envoyé
   - Apparaît à droite (bulle orange)
   - Scroll automatique
   - Check simple

#### Auto-refresh
1. Se connecter avec **User 1** dans un autre onglet
2. Aller sur `/conversations`
3. Ouvrir la conversation
4. Envoyer un message
5. ✅ **Vérifier sur User 2** :
   - Attendre max 5 secondes
   - Message apparaît automatiquement
   - Badge non lu s'affiche
   - Double check bleu après lecture

---

### ❤️ TEST 4 : FAVORIS (5 min)

#### Ajouter aux favoris
1. Se connecter
2. Aller sur une annonce
3. Cliquer sur le bouton cœur (en haut à droite)
4. ✅ **Vérifier** :
   - Animation scale + fill rouge
   - Toast "Ajouté aux favoris"
   - Cœur devient rouge

#### Page favoris
1. Aller sur `/favorites`
2. ✅ **Vérifier** :
   - Annonce favorite affichée
   - Card complète (image, prix, localisation)
   - Grille responsive

#### Retirer des favoris
1. Cliquer sur le cœur rouge
2. ✅ **Vérifier** :
   - Animation particules
   - Toast "Retiré des favoris"
   - Card disparaît avec animation

---

### 📱 TEST 5 : RESPONSIVE (5 min)

#### Mode Mobile
1. Ouvrir DevTools (F12)
2. Activer mode responsive (Ctrl+Shift+M)
3. Choisir iPhone 12 (390×844)

**Messagerie** :
- ✅ Liste en plein écran
- ✅ Navigation liste ↔ thread
- ✅ Bouton retour visible
- ✅ Input adapté

**Favoris** :
- ✅ Grille 1 colonne
- ✅ Cards lisibles
- ✅ Bouton cœur cliquable

**OTP** :
- ✅ Champs 48×56px
- ✅ Clavier numérique
- ✅ Timer visible

#### Mode Desktop
1. Basculer en Desktop (1920×1080)

**Messagerie** :
- ✅ Split view (liste + thread)
- ✅ Proportions 1/3 - 2/3

**Favoris** :
- ✅ Grille 3 colonnes
- ✅ Hover effects

---

## 🎯 CHECKLIST FINALE

### Fonctionnalités Testées
- [ ] OTP : Timer + Auto-focus + Paste
- [ ] Inscription complète
- [ ] Connexion + JWT
- [ ] Messagerie : Envoyer + Recevoir
- [ ] Auto-refresh messages (5s)
- [ ] Favoris : Ajouter + Retirer
- [ ] Animations cœur
- [ ] Responsive Mobile
- [ ] Responsive Desktop

### Animations
- [ ] OTP : Scale + Fill
- [ ] Messages : Scroll auto
- [ ] Favoris : Particules
- [ ] Cards : Apparition progressive
- [ ] Transitions fluides (60fps)

### UX
- [ ] Toast notifications
- [ ] Loading states
- [ ] Messages d'erreur clairs
- [ ] Navigation intuitive
- [ ] Boutons réactifs

---

## 🐛 PROBLÈMES COURANTS

### Le frontend ne charge pas
```bash
# Vérifier que le serveur tourne
# Ouvrir terminal dans planb-frontend
npm run dev
```

### Erreur "Network Error"
- ✅ Vérifier que le backend tourne sur :8000
- ✅ Vérifier CORS dans backend

### Code OTP non visible
```bash
# Voir les logs backend
cd planb-backend
Get-Content var\log\dev.log -Tail 5 | Select-String "\d{6}"
```

### Messages ne s'affichent pas
- ✅ Attendre 5 secondes (auto-refresh)
- ✅ Rafraîchir la page
- ✅ Vérifier le token JWT dans localStorage

---

## 🎨 FONCTIONNALITÉS À TESTER

### Navigation Clavier (OTP)
- Tab : Champ suivant
- Shift+Tab : Champ précédent
- Backspace : Retour si vide
- Flèche droite/gauche : Navigation
- Ctrl+V : Paste du code

### Messagerie
- Entrée : Envoyer
- Shift+Entrée : Nouvelle ligne
- Scroll : Doux et automatique
- Hover : Effets subtils

### Favoris
- Clic : Toggle instantané
- Animation : 300ms smooth
- Badge : Compteur temps réel

---

## 📊 CRITÈRES DE SUCCÈS

Pour valider que le frontend fonctionne correctement :

✅ **OTP**
- Timer fonctionne
- Auto-focus entre champs
- Validation automatique
- Messages d'erreur clairs

✅ **Messagerie**
- Messages envoyés/reçus
- Auto-refresh 5s
- Badges non lus
- Responsive

✅ **Favoris**
- Toggle instantané
- Animations fluides
- Sync backend
- Persistance

✅ **Performance**
- Chargement < 2s
- Animations 60fps
- Pas de lag
- Responsive < 1s

---

## 🎉 RÉSULTATS ATTENDUS

Si tous les tests passent :

```
✅ Frontend : 100% fonctionnel
✅ Intégration backend : OK
✅ Animations : Fluides
✅ Responsive : Parfait
✅ UX : Excellente
```

**→ Application prête pour démo client ! 🚀**

---

## 💡 ASTUCES

### Voir le state React (DevTools)
1. Installer React DevTools (extension Chrome/Firefox)
2. F12 → Onglet "Components"
3. Inspecter hooks, props, state

### Tester rapidement
1. Garder les logs backend ouverts
2. Utiliser 2 navigateurs (User 1 et User 2)
3. Mode incognito pour tester l'inscription

### Debug
1. F12 → Console pour voir les erreurs
2. Network → Voir les requêtes API
3. Application → localStorage pour voir le JWT

---

## 📝 RAPPORT DE TESTS

Complétez après vos tests :

| Feature | Status | Notes |
|---------|--------|-------|
| OTP Timer | ⬜ | |
| OTP Validation | ⬜ | |
| Inscription | ⬜ | |
| Connexion | ⬜ | |
| Envoyer message | ⬜ | |
| Recevoir message | ⬜ | |
| Auto-refresh | ⬜ | |
| Ajouter favori | ⬜ | |
| Retirer favori | ⬜ | |
| Mobile responsive | ⬜ | |
| Desktop responsive | ⬜ | |

**Légende** : ✅ OK | ⚠️ Partiel | ❌ KO | ⬜ Non testé

---

## 🎯 PROCHAINES ÉTAPES

Une fois les tests terminés :

1. **Noter les bugs** éventuels
2. **Prendre des screenshots** des fonctionnalités
3. **Préparer la démo** client
4. **Planifier le déploiement**

---

**Bon courage pour les tests ! Le frontend est magnifique ! 🎨✨**
