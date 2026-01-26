# 🔍 DEBUG - Historique des Conversations WhatsApp

## 🎯 Objectif

J'ai ajouté des logs de débogage détaillés pour identifier exactement pourquoi l'historique WhatsApp n'affiche pas vos conversations.

## 📝 Instructions de test

### 1. Ouvrir la console du navigateur

- Appuyez sur **F12** ou **Ctrl+Shift+I** dans Chrome/Edge
- Allez dans l'onglet **Console**

### 2. Tester l'enregistrement d'une conversation

1. **Allez sur une annonce** (n'importe laquelle)
2. **Cliquez sur "Discuter sur WhatsApp"**
3. **Observez les logs dans la console**

Vous devriez voir des messages comme :

```
💾 [Conversations] saveConversation appelée
💾 [Conversations] Seller info: {id: ..., name: ..., phone: ...}
💾 [Conversations] Listing info: {id: ..., title: ..., image: ...}
🔍 [Conversations] Auth storage brut: {...}
🔍 [Conversations] Auth storage parsé: {...}
🔍 [Conversations] User extrait: {...}
🔍 [Conversations] User ID: 123
➕ [Conversations] Ajout d'une nouvelle conversation
💾 [Conversations] Sauvegarde des conversations
💾 [Conversations] User ID: 123
💾 [Conversations] Conversations à sauvegarder: [...]
✅ [Conversations] Conversation sauvegardée avec succès
```

### 3. Tester l'affichage de l'historique

1. **Allez sur la page "Conversations"** (icône chat en haut)
2. **Observez les logs dans la console**

Vous devriez voir :

```
📖 [Conversations] getUserConversations appelée
🔍 [Conversations] Auth storage brut: {...}
🔍 [Conversations] Auth storage parsé: {...}
🔍 [Conversations] User extrait: {...}
🔍 [Conversations] User ID: 123
📖 [Conversations] Toutes les conversations: {...}
📖 [Conversations] Conversations de l'utilisateur: [...]
```

## 🔎 Ce qu'il faut vérifier

### Si vous voyez "❌ Impossible de sauvegarder: pas de user ID"

**Problème** : L'utilisateur n'est pas correctement récupéré du localStorage

**Vérifiez dans la console** :
```javascript
// Copier-coller ceci dans la console
JSON.parse(localStorage.getItem('planb-auth-storage'))
```

Envoyez-moi le résultat pour que je puisse ajuster le code.

### Si vous voyez "⚠️ Aucun auth storage trouvé"

**Problème** : La clé de stockage est différente

**Vérifiez dans la console** :
```javascript
// Copier-coller ceci dans la console
Object.keys(localStorage).filter(k => k.includes('auth') || k.includes('user'))
```

### Si le User ID est `null` ou `undefined`

**Problème** : La structure des données est différente

**Vérifiez dans la console** :
```javascript
// Copier-coller ceci dans la console
const storage = JSON.parse(localStorage.getItem('planb-auth-storage'));
console.log('Structure:', storage);
console.log('State:', storage.state);
console.log('User:', storage.state?.user);
```

## 📊 Informations à me communiquer

Si le problème persiste, envoyez-moi une capture d'écran de :

1. ✅ **Les logs de la console** quand vous cliquez sur "Discuter sur WhatsApp"
2. ✅ **Les logs de la console** quand vous allez sur la page "Conversations"
3. ✅ **Le résultat de** : `JSON.parse(localStorage.getItem('planb-auth-storage'))`

## 🛠️ Prochaines étapes

Avec ces informations, je pourrai :
- Identifier exactement où est stocké l'ID utilisateur
- Corriger la fonction `getCurrentUserId()` avec la bonne structure
- Résoudre définitivement le problème d'affichage de l'historique

## 🧪 Test rapide dans la console

Pour tester rapidement si tout fonctionne, copiez-collez ce code dans la console :

```javascript
// Test de récupération de l'utilisateur
const authStorage = localStorage.getItem('planb-auth-storage');
if (authStorage) {
  const parsed = JSON.parse(authStorage);
  console.log('✅ Auth storage trouvé');
  console.log('Structure:', parsed);
  console.log('User:', parsed.state?.user);
  console.log('User ID:', parsed.state?.user?.id);
} else {
  console.log('❌ Pas d\'auth storage');
}

// Test de récupération des conversations
const conversations = localStorage.getItem('planb_conversations');
if (conversations) {
  console.log('✅ Conversations trouvées');
  console.log('Conversations:', JSON.parse(conversations));
} else {
  console.log('❌ Pas de conversations enregistrées');
}
```
