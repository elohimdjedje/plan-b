# 📋 Messages d'erreur de l'application Plan B

## 🔐 Authentification (Auth.jsx)

### Connexion
- ❌ **Email ou mot de passe incorrect** - Code 401
- ❌ **Compte introuvable** - Code 404
- 🔌 **Erreur de connexion réseau**

### Inscription
- ⚠️ **Compte existe déjà** - Email déjà utilisé
- ❌ **Adresse email invalide**
- ❌ **Mot de passe trop faible** - Minimum 8 caractères requis
- 🔌 **Erreur de connexion réseau**

---

## 📝 Publication d'annonces (Publish.jsx)

### Quota atteint
- ⚠️ **Limite atteinte ! Vous avez X/3 annonces actives**
- 🌟 **Passez au compte PRO pour publier sans limite !**
- Proposition automatique de passer PRO après 3 secondes

### Erreurs de validation
- ❌ **Titre invalide** - Minimum 10 caractères
- ❌ **Description invalide** - Minimum 20 caractères
- ❌ **Prix invalide** - Montant incorrect
- 📷 **Erreur avec les images** - Format ou taille

### Autres erreurs
- 🔐 **Session expirée** - Redirection vers /auth
- 🔌 **Erreur de connexion réseau**
- 📷 **Images trop volumineuses** - Max 5 Mo par photo
- ⚠️ **Erreur serveur** - Code 500

---

## ✏️ Modification d'annonces (EditListing.jsx)

### Autorisations
- 🔐 **Session expirée** - Redirection vers /auth
- ⛔ **Pas d'autorisation** - Annonce d'un autre utilisateur
- ❌ **Annonce introuvable** - Peut-être supprimée

### Validation
- ❌ **Titre invalide** - Minimum 10 caractères
- ❌ **Prix invalide** - Montant incorrect
- ❌ **Informations invalides**

### Réseau
- 🔌 **Erreur de connexion réseau**

---

## 👤 Modification du profil (EditProfile.jsx)

### Validation
- ❌ **Email invalide**
- ❌ **Numéro de téléphone invalide**
- ⚠️ **Email déjà utilisé** - Conflit avec autre compte
- ❌ **Informations invalides**

### Authentification
- 🔐 **Session expirée** - Redirection vers /auth
- 🔌 **Erreur de connexion réseau**

---

## 🎨 Caractéristiques des messages

### Icônes utilisées
- ❌ Erreur critique
- ⚠️ Avertissement
- 🔐 Authentification requise
- 🔌 Problème réseau
- 📷 Problème images
- 🌟 Suggestion PRO
- ✅ Succès
- ⛔ Accès refusé

### Durée d'affichage
- Messages d'erreur standard : **5-6 secondes**
- Erreur quota atteint : **8 secondes** (+ popup après 3s)
- Messages de succès : **2-3 secondes**

### Actions automatiques
1. **Session expirée** → Redirection vers `/auth` après 2s
2. **Quota atteint** → Popup "Passer PRO ?" après 3s
3. **Annonce introuvable** → Retour vers `/profile` après 2s

---

## 🚀 Améliorations futures possibles

1. **Messages multilingues** (Français/Anglais)
2. **Suggestions contextuelles** (ex: "Contactez le support")
3. **Codes d'erreur visibles** pour le débogage
4. **Historique des erreurs** dans les paramètres
5. **Mode hors ligne** avec messages spécifiques

---

## 📱 Messages backend (API)

### ListingController.php
- `QUOTA_EXCEEDED` - Limite de 10 annonces atteinte (test)
- Détails : `currentListings`, `maxListings`

### AuthController.php
- `Identifiants invalides` - Login échoué
- `Email et mot de passe requis` - Champs manquants

---

**Date de mise à jour** : 26 novembre 2025  
**Version** : 1.0
