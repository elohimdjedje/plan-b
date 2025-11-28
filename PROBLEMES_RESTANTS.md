# 🔧 Problèmes Restants à Corriger

## Vue d'ensemble

Ce document liste les problèmes identifiés qui nécessitent encore une correction.

---

## 1. 📱 Bouton Discussion WhatsApp (Mobile)

### Problème
Sur téléphone, lorsqu'on clique sur le bouton "Discuter sur WhatsApp", la redirection ne fonctionne pas correctement.

### Cause probable
- Format du numéro de téléphone incorrect
- URL WhatsApp mal formée pour mobile
- Permission manquante dans l'app mobile

### Solution proposée

#### Frontend Web (`ListingDetail.jsx`, `SellerInfo.jsx`)
```javascript
// Remplacer l'appel direct par le composant ContactOptions
import ContactOptions from '../components/listing/ContactOptions';
import { AnimatePresence } from 'framer-motion';

// Dans le composant
const [showContactModal, setShowContactModal] = useState(false);

// Au clic sur "Contacter"
<button onClick={() => setShowContactModal(true)}>
  Contacter le vendeur
</button>

// Affichage du modal
<AnimatePresence>
  {showContactModal && (
    <ContactOptions
      seller={listing.user}
      listing={listing}
      onClose={() => setShowContactModal(false)}
    />
  )}
</AnimatePresence>
```

#### Vérifier le format du numéro
```javascript
// Dans utils/whatsapp.js
export const formatPhoneForWhatsApp = (phone) => {
  // Supprimer tous les caractères non numériques
  let cleaned = phone.replace(/[^0-9+]/g, '');
  
  // Si commence par 0, remplacer par indicatif pays
  if (cleaned.startsWith('0')) {
    cleaned = '+225' + cleaned.substring(1); // Côte d'Ivoire
  }
  
  // Si ne commence pas par +, ajouter +225
  if (!cleaned.startsWith('+')) {
    cleaned = '+225' + cleaned;
  }
  
  return cleaned;
};
```

### Test
```bash
# URL WhatsApp correcte
https://wa.me/2250701020304?text=Bonjour...

# PAS
https://wa.me/07 01 02 03 04?text=...
```

---

## 2. 💾 Sauvegarde des Conversations (Site Web)

### Problème
Dans la partie "Conversations" du site, les échanges ne se sauvegardent pas.

### Cause probable
- L'API `/api/v1/conversations/start` ne crée pas la conversation
- Le message n'est pas enregistré
- Problème avec `ConversationRepository::findOrCreate()`

### Vérifications à faire

#### 1. Tester l'API
```bash
# Avec un token valide
curl -X POST http://localhost:8000/api/v1/conversations/start/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Réponse attendue
{
  "requiresAuth": true,
  "message": "Conversation créée",
  "conversationId": 123
}
```

#### 2. Vérifier ConversationRepository
```php
// planb-backend/src/Repository/ConversationRepository.php
public function findOrCreate(Listing $listing, User $buyer): Conversation
{
    // Chercher conversation existante
    $conversation = $this->createQueryBuilder('c')
        ->where('c.listing = :listing')
        ->andWhere('c.buyer = :buyer')
        ->setParameter('listing', $listing)
        ->setParameter('buyer', $buyer)
        ->getQuery()
        ->getOneOrNullResult();

    if ($conversation) {
        return $conversation;
    }

    // Créer nouvelle conversation
    $conversation = new Conversation();
    $conversation->setListing($listing)
        ->setBuyer($buyer)
        ->setSeller($listing->getUser());

    $this->_em->persist($conversation);
    $this->_em->flush();

    return $conversation;
}
```

#### 3. Frontend - Enregistrer les messages
```javascript
// planb-frontend/src/pages/ConversationsNew.jsx
// Vérifier que les messages sont bien envoyés à l'API

const sendMessage = async (content) => {
  try {
    await axios.post(
      `${API_URL}/api/v1/messages`,
      {
        conversationId: currentConversation.id,
        content
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  } catch (error) {
    console.error('Erreur envoi message:', error);
  }
};
```

### Solution
1. Vérifier que `ConversationRepository` a la méthode `findOrCreate`
2. S'assurer que `MessageController` enregistre bien les messages
3. Vérifier les logs Symfony pour les erreurs SQL

---

## 3. 📸 Photos Mobile (Import/Prise de photo)

### Problème
Sur l'application mobile (Expo), impossible de prendre ou d'importer une photo.

### Cause probable
- Permissions non demandées
- Configuration `expo-image-picker` incorrecte
- Erreur dans le composant d'upload

### Solution

#### 1. Vérifier les permissions dans `app.json`
```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "L'application a besoin d'accéder à vos photos pour publier des annonces.",
          "cameraPermission": "L'application a besoin d'accéder à la caméra pour prendre des photos."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "Plan B a besoin d'accéder à vos photos.",
        "NSCameraUsageDescription": "Plan B a besoin d'accéder à la caméra."
      }
    },
    "android": {
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

#### 2. Code du sélecteur d'image
```javascript
// planb-mobile/screens/PublishScreen.js
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  // Demander la permission
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    alert('Désolé, nous avons besoin des permissions pour accéder aux photos!');
    return;
  }

  // Ouvrir la galerie
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
    allowsMultipleSelection: true // Si vous voulez plusieurs images
  });

  if (!result.canceled) {
    setImages([...images, ...result.assets.map(asset => asset.uri)]);
  }
};

const takePhoto = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
  if (status !== 'granted') {
    alert('Désolé, nous avons besoin des permissions pour accéder à la caméra!');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8
  });

  if (!result.canceled) {
    setImages([...images, result.assets[0].uri]);
  }
};
```

#### 3. Upload vers le backend
```javascript
const uploadImages = async (images) => {
  const formData = new FormData();
  
  images.forEach((uri, index) => {
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('images[]', {
      uri,
      name: filename,
      type
    });
  });

  try {
    const response = await axios.post(
      `${API_URL}/api/v1/upload/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data.urls;
  } catch (error) {
    console.error('Erreur upload:', error);
    throw error;
  }
};
```

### Test
1. Rebuild l'app après modification de `app.json`
2. Tester sur un vrai téléphone (pas émulateur)
3. Vérifier que les permissions sont demandées

---

## 📋 Checklist de Correction

### WhatsApp Mobile
- [ ] Intégrer le composant `ContactOptions` dans les pages d'annonces
- [ ] Vérifier le format des numéros de téléphone
- [ ] Tester sur iPhone et Android
- [ ] Vérifier les logs console pour erreurs

### Sauvegarde Conversations
- [ ] Tester l'API `/conversations/start` avec Postman
- [ ] Vérifier `ConversationRepository::findOrCreate`
- [ ] Vérifier `MessageController::create`
- [ ] Consulter les logs Symfony
- [ ] Tester en tant qu'utilisateur connecté

### Photos Mobile
- [ ] Ajouter les permissions dans `app.json`
- [ ] Implémenter `ImagePicker` correctement
- [ ] Tester demande de permissions
- [ ] Vérifier l'upload vers backend
- [ ] Tester sur appareil réel

---

## 🚀 Ordre de Priorité

1. **CRITIQUE** - Photos mobile (bloque la publication)
2. **IMPORTANT** - Sauvegarde conversations (perte de données)
3. **MOYEN** - WhatsApp mobile (workaround possible)

---

## 💡 Notes

### WhatsApp
- Sur iOS, `https://wa.me/` fonctionne mieux que `whatsapp://`
- Toujours utiliser le format international: `+225XXXXXXXX`

### Conversations
- Vérifier que la table `conversations` existe bien en base
- Les messages nécessitent une conversation existante

### Photos
- L'émulateur ne peut pas tester la caméra
- Utiliser un appareil physique pour les tests
- Compresser les images avant upload (< 2MB par image)

---

## 📞 Aide Supplémentaire

Si les problèmes persistent:
1. Consulter la documentation Expo: https://docs.expo.dev/versions/latest/sdk/imagepicker/
2. Vérifier les logs Symfony: `planb-backend/var/log/dev.log`
3. Utiliser les DevTools du navigateur (F12)
4. Tester l'API avec Postman/Insomnia

**Bon courage! 💪**
