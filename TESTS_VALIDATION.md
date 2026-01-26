# ✅ Tests de Validation - Plan B v2.0

## Guide complet pour tester toutes les nouvelles fonctionnalités

---

## 🎯 Préparation des Tests

### Environnement Requis
- ✅ Backend démarré: `http://localhost:8000`
- ✅ Frontend démarré: `http://localhost:5173`
- ✅ Base de données avec table `reviews` créée
- ✅ Au moins 2 comptes utilisateurs
- ✅ Au moins 3 annonces publiées

### Comptes de Test Recommandés
```
Utilisateur 1 (FREE):
  Email: user1@test.com
  Password: Test1234!
  
Utilisateur 2 (PRO):
  Email: user2@test.com
  Password: Test1234!
```

---

## 📊 TEST 1: Système d'Avis et Étoiles

### Test 1.1: Créer un avis
**Objectif:** Vérifier qu'un utilisateur peut laisser un avis

**Étapes:**
1. Se connecter avec `user1@test.com`
2. Aller sur une annonce d'un autre utilisateur
3. Cliquer sur "Laisser un avis" (ou similaire)
4. Sélectionner 5 étoiles
5. Écrire un commentaire: "Excellent séjour!"
6. Cliquer sur "Publier l'avis"

**Résultat attendu:**
- ✅ Toast: "Merci pour votre avis ! 🌟"
- ✅ Avis visible sur l'annonce
- ✅ Avis visible sur le profil du vendeur

**Capture d'écran:** `tests/screenshots/test1_1.png`

---

### Test 1.2: Impossible de noter 2 fois
**Objectif:** Vérifier qu'un utilisateur ne peut pas laisser 2 avis

**Étapes:**
1. Avec le même compte, essayer de laisser un autre avis
2. Sur la même annonce

**Résultat attendu:**
- ❌ Message: "Vous avez déjà laissé un avis pour cette annonce"
- ✅ Le formulaire ne se soumet pas

---

### Test 1.3: Note moyenne vendeur
**Objectif:** Vérifier le calcul de la note moyenne

**Étapes:**
1. Créer 3 avis sur différentes annonces du même vendeur:
   - Avis 1: 5 étoiles
   - Avis 2: 4 étoiles
   - Avis 3: 5 étoiles
2. Aller sur le profil du vendeur
3. Vérifier la note moyenne

**Résultat attendu:**
- ✅ Note moyenne affichée: 4.7/5
- ✅ Distribution des notes visible (graphique)
- ✅ Total: 3 avis

---

## 👁️ TEST 2: Compteur de Vues Unique

### Test 2.1: Vue unique par utilisateur
**Objectif:** Vérifier qu'un utilisateur = 1 vue

**Étapes:**
1. Se connecter avec `user1@test.com`
2. Aller sur une annonce (noter le compteur: ex. 10 vues)
3. Rafraîchir la page (F5)
4. Vérifier le compteur

**Résultat attendu:**
- ✅ Première visite: Compteur passe à 11 vues
- ✅ Rafraîchissement: Compteur reste à 11 vues
- ✅ Le propriétaire ne compte pas dans les vues

**Test avec un autre compte:**
5. Se déconnecter
6. Se connecter avec `user2@test.com`
7. Visiter la même annonce
8. Vérifier le compteur

**Résultat attendu:**
- ✅ Compteur passe à 12 vues
- ✅ Chaque utilisateur unique = 1 vue

---

### Test 2.2: Propriétaire exclu
**Objectif:** Le propriétaire ne compte pas dans les vues

**Étapes:**
1. Se connecter avec le compte propriétaire de l'annonce
2. Visiter sa propre annonce
3. Vérifier le compteur

**Résultat attendu:**
- ✅ Le compteur ne bouge pas
- ✅ Les vues du propriétaire ne comptent jamais

---

## 📞 TEST 3: Contact Multi-Canal

### Test 3.1: Modal de contact
**Objectif:** Vérifier l'ouverture du modal

**Étapes:**
1. Aller sur une annonce
2. Cliquer sur "Contacter le vendeur"
3. Observer le modal

**Résultat attendu:**
- ✅ Modal s'ouvre avec animation
- ✅ 4 options visibles (WhatsApp, Tel, SMS, Email)
- ✅ Nom du vendeur affiché
- ✅ Bouton "Annuler" fonctionnel

---

### Test 3.2: WhatsApp
**Objectif:** Vérifier la redirection WhatsApp

**Étapes:**
1. Dans le modal, cliquer sur "WhatsApp"
2. Observer ce qui se passe

**Résultat attendu:**
- ✅ URL ouverte: `https://wa.me/225XXXXXXXX?text=...`
- ✅ Message pré-rempli avec titre annonce
- ✅ Redirection vers WhatsApp (web ou app)

---

### Test 3.3: Appel téléphonique
**Objectif:** Vérifier l'appel direct

**Étapes:**
1. Cliquer sur "Appeler"
2. Observer

**Résultat attendu:**
- ✅ Application téléphone s'ouvre
- ✅ Numéro pré-rempli: `+225XXXXXXXX`

---

### Test 3.4: SMS
**Objectif:** Vérifier l'envoi SMS

**Étapes:**
1. Cliquer sur "SMS"
2. Observer

**Résultat attendu:**
- ✅ Application SMS s'ouvre
- ✅ Numéro et message pré-remplis

---

### Test 3.5: Email
**Objectif:** Vérifier l'email

**Étapes:**
1. Cliquer sur "Email"
2. Observer

**Résultat attendu:**
- ✅ Client email s'ouvre
- ✅ Email vendeur pré-rempli
- ✅ Sujet: "Intéressé par: [titre]"
- ✅ Corps du message pré-rempli

---

## 💬 TEST 4: Discussion Sans Compte

### Test 4.1: Accès sans connexion
**Objectif:** Visiteur peut voir les infos de contact

**Étapes:**
1. Se déconnecter (ou mode navigation privée)
2. Aller sur une annonce
3. Cliquer sur "Contacter le vendeur"
4. Observer

**Résultat attendu:**
- ✅ Modal s'ouvre même sans compte
- ✅ Infos de contact visibles
- ✅ Les 4 options fonctionnent
- ❌ PAS de message "Vous devez vous connecter"

---

## 📝 TEST 5: Limite Annonces

### Test 5.1: Compte FREE - 4 annonces max
**Objectif:** Vérifier la limite de 4 annonces

**Étapes:**
1. Se connecter avec un compte FREE
2. Publier une annonce (1/4)
3. Publier une annonce (2/4)
4. Publier une annonce (3/4)
5. Publier une annonce (4/4)
6. Essayer de publier une 5ème annonce

**Résultat attendu:**
- ✅ Annonces 1-4: Publication réussie
- ❌ Annonce 5: Erreur
- ✅ Message: "Vous avez atteint la limite de 4 annonces..."
- ✅ Suggestion: "Passez PRO pour publier sans limite"

---

### Test 5.2: Compte PRO - Illimité
**Objectif:** Vérifier que PRO n'a pas de limite

**Étapes:**
1. Se connecter avec un compte PRO
2. Publier 10 annonces (ou plus)

**Résultat attendu:**
- ✅ Toutes les publications réussies
- ✅ Aucun message d'erreur de quota

---

## ⚠️ TEST 6: Messages d'Erreur

### Test 6.1: Mauvais mot de passe
**Objectif:** Vérifier le nouveau message d'erreur

**Étapes:**
1. Aller sur `/auth/login`
2. Entrer email: `user1@test.com`
3. Entrer password: `mauvais123`
4. Cliquer sur "Se connecter"

**Résultat attendu:**
- ❌ PAS d'animation de démarrage
- ✅ Toast d'erreur affiché
- ✅ Message: "❌ Email ou mot de passe incorrect."
- ✅ Conseil: "💡 Vérifiez vos identifiants..."

---

### Test 6.2: Email inexistant
**Objectif:** Message pour compte introuvable

**Étapes:**
1. Entrer email: `inexistant@test.com`
2. Entrer n'importe quel password
3. Cliquer sur "Se connecter"

**Résultat attendu:**
- ✅ Message: "❌ Aucun compte trouvé avec cet email."
- ✅ Conseil: "💡 Veuillez vous inscrire..."

---

### Test 6.3: Email déjà utilisé (inscription)
**Objectif:** Message pour email existant

**Étapes:**
1. Aller sur `/auth/register`
2. Entrer un email déjà utilisé
3. Remplir le formulaire
4. Cliquer sur "Créer mon compte"

**Résultat attendu:**
- ✅ Message: "⚠️ Un compte existe déjà avec cet email."
- ✅ Conseil: "💡 Utilisez 'Connexion'..."

---

## ⚡ TEST 7: Performance

### Test 7.1: Temps de chargement initial
**Objectif:** Vérifier l'optimisation

**Étapes:**
1. Ouvrir DevTools (F12)
2. Onglet Network
3. Rafraîchir la page d'accueil (Ctrl+R)
4. Observer le temps total

**Résultat attendu:**
- ✅ Temps de chargement: < 2 secondes
- ✅ JS initial: < 500 KB
- ✅ Chunks séparés visibles:
  - `react-vendor.js`
  - `ui-vendor.js`
  - `map-vendor.js`

---

### Test 7.2: Lazy loading
**Objectif:** Vérifier le chargement à la demande

**Étapes:**
1. DevTools Network ouvert
2. Aller sur la page d'accueil
3. Noter les fichiers chargés
4. Naviguer vers `/profile`
5. Observer les nouveaux fichiers

**Résultat attendu:**
- ✅ `/profile` charge son propre chunk
- ✅ Pas tous les fichiers chargés d'un coup
- ✅ Chargement progressif visible

---

## 📱 TEST 8: Mobile (si app Expo disponible)

### Test 8.1: Photos
**Objectif:** Vérifier l'import/prise de photo

**Étapes:**
1. Ouvrir l'app mobile
2. Aller sur "Publier une annonce"
3. Cliquer sur "Ajouter photos"
4. Choisir "Galerie" ou "Appareil photo"
5. Sélectionner/prendre une photo

**Résultat attendu:**
- ✅ Demande de permission
- ✅ Galerie/Caméra s'ouvre
- ✅ Photo sélectionnée visible
- ✅ Upload réussi

**Note:** Nécessite configuration dans `PROBLEMES_RESTANTS.md`

---

## 📊 TABLEAU RÉCAPITULATIF

| Test | Description | Statut | Notes |
|------|-------------|--------|-------|
| 1.1  | Créer un avis | ⏳ | |
| 1.2  | Avis unique | ⏳ | |
| 1.3  | Note moyenne | ⏳ | |
| 2.1  | Vues uniques | ⏳ | |
| 2.2  | Propriétaire exclu | ⏳ | |
| 3.1  | Modal contact | ⏳ | |
| 3.2  | WhatsApp | ⏳ | |
| 3.3  | Appel | ⏳ | |
| 3.4  | SMS | ⏳ | |
| 3.5  | Email | ⏳ | |
| 4.1  | Sans compte | ⏳ | |
| 5.1  | Limite FREE | ⏳ | |
| 5.2  | PRO illimité | ⏳ | |
| 6.1  | Erreur password | ⏳ | |
| 6.2  | Email inexistant | ⏳ | |
| 6.3  | Email existant | ⏳ | |
| 7.1  | Performance | ⏳ | |
| 7.2  | Lazy loading | ⏳ | |
| 8.1  | Photos mobile | ⏳ | |

**Légende:**
- ⏳ À tester
- ✅ Validé
- ❌ Échoué
- ⚠️ Problème mineur

---

## 🐛 Rapport de Bugs

### Template de Bug
```
**Bug ID:** BUG-001
**Test:** 1.1 - Créer un avis
**Sévérité:** Critique / Majeur / Mineur
**Description:** 
  [Décrire le bug]

**Étapes de reproduction:**
  1. ...
  2. ...

**Résultat attendu:**
  [Ce qui devrait se passer]

**Résultat obtenu:**
  [Ce qui s'est passé]

**Capture d'écran:**
  [Lien ou fichier]

**Environnement:**
  - OS: Windows 11
  - Navigateur: Chrome 120
  - Version: 2.0
```

---

## ✅ Validation Finale

Une fois tous les tests validés:

```
[ ] Tous les tests passent
[ ] Aucun bug critique
[ ] Performance acceptable (< 2s)
[ ] Interface responsive
[ ] Documentation à jour
[ ] Code pushed sur Git

🎉 LE SITE EST PRÊT POUR LA PRODUCTION !
```

---

## 📞 Support

En cas de problème pendant les tests:
1. Consulter `PROBLEMES_RESTANTS.md`
2. Vérifier les logs backend
3. Inspecter la console navigateur
4. Tester l'API avec Postman

---

**Bon courage pour les tests! 🧪**
