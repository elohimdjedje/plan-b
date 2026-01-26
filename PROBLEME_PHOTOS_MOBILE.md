# 📷 Problème : Photos non fonctionnelles sur mobile

## 🔍 Diagnostic

L'annonce **"Villa meublée chez nico"** (ID: 8) a été créée **sans image** malgré qu'une photo ait été sélectionnée lors de la publication.

### Cause du problème

La **WebView** utilisée dans l'application mobile ne peut pas accéder correctement au système de fichiers du téléphone pour uploader les photos. C'est une limitation technique des WebView HTML dans React Native.

---

## ✅ Solutions

### Solution 1 : Utiliser le navigateur mobile (TEMPORAIRE)

**Au lieu d'utiliser l'app Expo Go**, ouvrez directement le site web dans votre navigateur mobile :

1. **Ouvrez Chrome** (ou Safari sur iPhone) sur votre téléphone
2. **Tapez** : `http://10.5.19.118:5173`
3. **Publiez** votre annonce avec photos

✅ **Avantages** :
- Fonctionne immédiatement
- Accès complet à toutes les fonctionnalités
- Upload de photos garanti

❌ **Inconvénients** :
- Moins fluide qu'une app native
- Nécessite de taper l'URL

---

### Solution 2 : Amélioration de l'app (EN COURS)

J'ai ajouté le code nécessaire pour gérer la sélection de photos depuis le téléphone, mais il faut :

1. **Packages installés** : ✅ `expo-image-picker`, `expo-file-system`
2. **Code frontend à adapter** : En attente
3. **Tests nécessaires**

---

## 🛠️ Modifications techniques apportées

### App.js (Mobile)
- ✅ Ajout de `expo-image-picker` pour sélectionner les photos
- ✅ Ajout de `expo-file-system` pour lire les fichiers
- ✅ Gestion des permissions d'accès à la galerie
- ✅ Communication WebView ↔ Native via messages

### Ce qu'il reste à faire

1. **Modifier Publish.jsx** pour :
   - Détecter si l'app tourne dans une WebView mobile
   - Envoyer un message `SELECT_IMAGE` au lieu d'ouvrir le sélecteur HTML
   - Recevoir les images en base64 depuis l'app native
   - Convertir base64 → File pour l'upload

2. **Tester sur mobile** :
   - Sélection de photos depuis la galerie
   - Upload vers le backend
   - Affichage des photos dans l'annonce

---

## 📱 Pour l'instant

### Recommandation

**Utilisez le navigateur mobile** plutôt que l'app Expo Go pour publier des annonces avec photos :

```
http://10.5.19.118:5173
```

Toutes les fonctionnalités sont disponibles, y compris l'upload de photos ! 📸

---

## 🚀 Prochaines étapes

1. Adapter le frontend pour communiquer avec l'app native
2. Tester l'upload de photos depuis l'app
3. Publier une mise à jour avec photos fonctionnelles

---

**Date** : 26 novembre 2025  
**Status** : En cours de résolution  
**Priorité** : Haute

---

## 💡 Alternative rapide

Si vous voulez **MAINTENANT** ajouter une photo à votre annonce existante :

1. Connectez-vous sur **http://10.5.19.118:5173** (navigateur mobile)
2. Allez dans **Profil** → **Mes annonces**
3. Cliquez sur **"Villa meublée chez nico"**
4. Cliquez sur **Modifier** (icône crayon)
5. Ajoutez vos photos
6. Enregistrez

✅ La photo s'affichera immédiatement !
