# 💾 STOCKAGE DES UTILISATEURS - PLAN B

## 📊 ÉTAT ACTUEL

### **Mode actuel : DÉMO (localStorage)**

**❌ Les comptes ne sont PAS stockés en base de données pour le moment**

**✅ Ils sont stockés dans le navigateur (localStorage)**

---

## 🔍 EXPLICATION

### **Qu'est-ce que localStorage ?**

Le `localStorage` est un espace de stockage dans le navigateur web :
- ✅ Permet de sauvegarder des données localement
- ✅ Les données persistent même si on ferme le navigateur
- ❌ Les données sont LOCALES au navigateur
- ❌ Si on change de navigateur/ordinateur, les données sont perdues

### **Pourquoi on utilise localStorage actuellement ?**

Pour tester l'application **SANS avoir besoin du backend** :
- ✅ Tests rapides
- ✅ Développement frontend sans dépendances
- ✅ Démonstration des fonctionnalités

---

## 🎯 PASSAGE À LA BASE DE DONNÉES

### **Quand passer en production ?**

Une fois le backend lancé et fonctionnel, les utilisateurs seront stockés dans :
- ✅ **Base de données MySQL/PostgreSQL**
- ✅ Persistant (ne disparaît jamais)
- ✅ Accessible depuis n'importe quel appareil
- ✅ Sécurisé avec authentification JWT

### **Ce qui doit être fait :**

#### **1. Activer le mode production**
```bash
# Dans .env
VITE_APP_MODE=production
VITE_API_URL=http://localhost:8000/api/v1
```

#### **2. Migrer les fichiers**
```bash
# Remplacer les utils
cp src/utils/auth.clean.js src/utils/auth.js
```

#### **3. Les appels API seront automatiques**

**Inscription :**
```javascript
// Au lieu de localStorage
const response = await api.post('/auth/register', {
  email: formData.email,
  password: formData.password,
  phone: formData.phone,
  firstName: formData.name.split(' ')[0],
  lastName: formData.name.split(' ')[1]
});
// Sauvegarde en base de données ✅
```

**Connexion :**
```javascript
// Au lieu de localStorage
const response = await api.post('/auth/login', {
  username: formData.email,
  password: formData.password
});
// Token JWT retourné
localStorage.setItem('token', response.data.token);
```

---

## 📂 OÙ SONT STOCKÉES LES DONNÉES ACTUELLEMENT ?

### **localStorage (Mode démo actuel)**

**Clés utilisées :**
```javascript
localStorage.setItem('user', JSON.stringify({
  id: 1234567890,
  name: "Jean Kouassi",
  email: "jean@example.com",
  phone: "+2250707123456",
  accountType: "FREE",
  memberSince: "2025"
}));
```

**Voir vos données :**
1. Ouvrir la console (F12)
2. Onglet "Application" ou "Storage"
3. Cliquer sur "Local Storage"
4. Voir la clé `user`

---

## 🔄 COMPARAISON

| Aspect | localStorage (Actuel) | Base de données (Production) |
|--------|----------------------|-------------------------------|
| **Persistance** | ⚠️ Local seulement | ✅ Persistant global |
| **Sécurité** | ❌ Visible dans le navigateur | ✅ Sécurisé backend |
| **Multi-appareils** | ❌ Non | ✅ Oui |
| **Perte de données** | ⚠️ Si on vide le cache | ✅ Jamais |
| **Tests** | ✅ Parfait | ✅ Production |

---

## ✅ CE QUI FONCTIONNE MAINTENANT

### **Corrections appliquées :**

1. **✅ Sauvegarde utilisateur**
   ```javascript
   setCurrentUser(mockUser); // localStorage
   ```

2. **✅ Redirection après connexion**
   ```javascript
   setTimeout(() => {
     navigate(from, { replace: true });
   }, 100);
   ```

3. **✅ ID unique pour chaque utilisateur**
   ```javascript
   id: Date.now() // Timestamp unique
   ```

---

## 🧪 TESTS À FAIRE

### **Test 1 : Inscription**
```
1. Aller sur /auth
2. Cliquer "Inscription"
3. Remplir :
   - Email: test@example.com
   - Nom: Test User
   - Téléphone: 0707123456
   - Password: 123456
4. Cliquer "Créer mon compte"
5. ✅ Toast "Compte créé avec succès !"
6. ✅ Redirection automatique
```

### **Test 2 : Vérifier le stockage**
```
1. F12 → Console
2. Taper : localStorage.getItem('user')
3. ✅ Voir les données JSON
```

### **Test 3 : Scénario complet**
```
# En tant que visiteur
1. Cliquer sur "Profil"
2. ✅ Redirigé vers /auth
3. S'inscrire
4. ✅ Redirigé automatiquement vers /profile
5. ✅ Profil accessible
```

### **Test 4 : Poster une annonce**
```
# En tant que visiteur
1. Cliquer sur "+"
2. ✅ Redirigé vers /auth
3. S'inscrire
4. ✅ Redirigé automatiquement vers /publish
5. ✅ Formulaire de création visible
```

### **Test 5 : Discuter avec vendeur**
```
# En tant que visiteur
1. Voir une annonce
2. Cliquer "Discuter sur WhatsApp"
3. ✅ Modale "Connexion requise" apparaît
4. Cliquer "S'inscrire"
5. S'inscrire
6. ✅ Retour sur la page de l'annonce
7. Cliquer "Discuter sur WhatsApp"
8. ✅ Ouverture WhatsApp
9. ✅ Profil vendeur sauvegardé dans conversations
```

---

## 🔮 MIGRATION FUTURE VERS BASE DE DONNÉES

### **Étapes :**

1. **Backend prêt**
   - ✅ Symfony lancé
   - ✅ Base de données configurée
   - ✅ Endpoints fonctionnels

2. **Frontend adapté**
   ```bash
   # Migrer vers mode production
   ./migrate-to-production.bat
   ```

3. **Appels API automatiques**
   - Les fonctions dans `auth.clean.js` utiliseront l'API
   - JWT gérera l'authentification
   - Données sauvegardées en DB

4. **Aucun changement UI**
   - L'interface reste identique
   - Seul le backend change
   - Migration transparente

---

## 📝 RÉSUMÉ

### **Actuellement (Mode Démo) :**
- ❌ Comptes stockés dans localStorage (navigateur)
- ✅ Parfait pour tests et développement
- ⚠️ Données locales uniquement

### **Bientôt (Mode Production) :**
- ✅ Comptes stockés en base de données
- ✅ Persistant et sécurisé
- ✅ Multi-appareils

### **Ce qui est corrigé maintenant :**
- ✅ Sauvegarde utilisateur fonctionnelle
- ✅ Redirection après connexion/inscription
- ✅ ID unique pour chaque compte
- ✅ Toutes les redirections fonctionnent

---

## 🎯 POUR VÉRIFIER

### **Voir vos utilisateurs stockés :**

**Console du navigateur (F12) :**
```javascript
// Voir l'utilisateur connecté
console.log(localStorage.getItem('user'));

// Voir toutes les données localStorage
for(let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key, localStorage.getItem(key));
}
```

---

**✅ Les comptes sont actuellement en localStorage, mais la migration vers la base de données est prête !**

*Document créé le 9 novembre 2025 - 15:18*
