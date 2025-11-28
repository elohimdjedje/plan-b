# 🧹 NETTOYAGE LOCALSTORAGE - PLAN B

## ⚠️ PROBLÈME

Vous voyez un utilisateur de démo "John Doe" alors que vous n'êtes pas connecté ?

C'est parce que des données de test sont stockées dans le **localStorage** du navigateur.

---

## ✅ SOLUTION 1 : Page de nettoyage automatique

1. **Ouvrir la page de nettoyage** :
   ```
   http://localhost:5173/clear-storage.html
   ```

2. **Cliquer sur "Nettoyer tout"**

3. **Rafraîchir la page** et retourner sur :
   ```
   http://localhost:5173
   ```

---

## ✅ SOLUTION 2 : Console du navigateur

### Méthode rapide (1 ligne)

1. **Ouvrir la console** :
   - Appuyez sur `F12` ou `Ctrl+Shift+I` (Windows/Linux)
   - Appuyez sur `Cmd+Option+I` (Mac)

2. **Aller dans l'onglet "Console"**

3. **Copier-coller cette commande** :
   ```javascript
   localStorage.clear(); sessionStorage.clear(); location.reload();
   ```

4. **Appuyer sur Entrée**

### Méthode détaillée

1. **Ouvrir les DevTools** (`F12`)

2. **Aller dans "Application"** (ou "Stockage" selon le navigateur)

3. **Cliquer sur "Local Storage"** dans le menu de gauche

4. **Sélectionner votre site** (http://localhost:5173)

5. **Clic droit** → **"Effacer"** ou **"Clear"**

6. **Faire pareil pour "Session Storage"**

7. **Rafraîchir la page** (`F5`)

---

## ✅ SOLUTION 3 : PowerShell (Via commande)

**Non applicable** - Le localStorage est côté navigateur uniquement.

---

## 🔍 VÉRIFICATION

Après le nettoyage, vous devriez :

✅ Ne plus voir "John Doe"  
✅ Être redirigé vers `/auth` quand vous cliquez sur "Profil"  
✅ Être redirigé vers `/auth` quand vous cliquez sur "Publier"  
✅ Voir le formulaire de connexion/inscription

---

## 📝 CE QUI A ÉTÉ CORRIGÉ

### 1. **RequireAuth.jsx** ✅
- Maintenant asynchrone et vérifie correctement l'authentification
- Redirige vers `/auth` si pas d'utilisateur
- Affiche un loader pendant la vérification

### 2. **Profile.jsx** ✅
- Supprimé l'utilisateur de démo "John Doe"
- Utilise uniquement les vrais utilisateurs de l'API
- Redirige vers `/auth` si pas connecté

### 3. **Page de nettoyage** ✅
- Créée : `/clear-storage.html`
- Permet de nettoyer facilement localStorage et sessionStorage

---

## 🧪 TESTER LA CORRECTION

### Test 1 : Accès Profil
1. Nettoyer le localStorage (voir ci-dessus)
2. Rafraîchir la page
3. Cliquer sur "Profil" dans le menu
4. **Résultat attendu** : Redirection vers `/auth`

### Test 2 : Accès Publier
1. Cliquer sur le bouton "Publier" (+)
2. **Résultat attendu** : Redirection vers `/auth`

### Test 3 : Inscription
1. Aller sur `/auth/register-otp`
2. Créer un vrai compte
3. Se connecter
4. Cliquer sur "Profil"
5. **Résultat attendu** : Voir VOTRE profil (pas John Doe)

---

## 💡 POURQUOI CE PROBLÈME ?

Le localStorage est une fonctionnalité du navigateur qui permet de stocker des données localement. Pendant le développement, des données de test (comme "John Doe") ont été stockées et persistent même après avoir fermé le navigateur.

**Solution permanente** : Toujours nettoyer le localStorage quand vous testez l'authentification.

---

## 🔧 COMMANDES UTILES

### Voir ce qui est stocké
```javascript
// Dans la console
console.log(localStorage);
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

### Nettoyer sélectivement
```javascript
// Supprimer juste le token
localStorage.removeItem('token');

// Supprimer juste l'utilisateur
localStorage.removeItem('user');

// Tout nettoyer
localStorage.clear();
sessionStorage.clear();
```

### Recharger la page
```javascript
location.reload();
// ou
window.location.reload();
```

---

## ✅ CHECKLIST POST-NETTOYAGE

- [ ] localStorage nettoyé
- [ ] sessionStorage nettoyé
- [ ] Page rafraîchie
- [ ] "Profil" redirige vers `/auth`
- [ ] "Publier" redirige vers `/auth`
- [ ] Pas d'utilisateur "John Doe"

---

## 📞 AIDE

Si le problème persiste :

1. **Vider le cache complet** du navigateur (`Ctrl+Shift+Delete`)
2. **Mode navigation privée** pour tester
3. **Vérifier les logs** de la console (`F12` → Console)

---

**Créé le 11 novembre 2025**  
**Guide de nettoyage localStorage**
