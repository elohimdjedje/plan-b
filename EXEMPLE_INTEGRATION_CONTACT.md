# 📞 Exemple d'Intégration du Composant ContactOptions

## Objectif
Remplacer le bouton WhatsApp simple par le modal multi-canal dans les pages d'annonces.

---

## 1. Dans ListingDetail.jsx

### Imports à ajouter
```javascript
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ContactOptions from '../components/listing/ContactOptions';
```

### État à ajouter
```javascript
export default function ListingDetail() {
  // ... autres états
  const [showContactModal, setShowContactModal] = useState(false);
  
  // ...
}
```

### Remplacer le bouton WhatsApp
```javascript
// AVANT (à supprimer):
<button
  onClick={handleContact}
  className="w-full bg-green-500 hover:bg-green-600..."
>
  <MessageCircle size={20} />
  <span>Discuter sur WhatsApp</span>
</button>

// APRÈS (nouveau code):
<button
  onClick={() => setShowContactModal(true)}
  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-95"
>
  <MessageCircle size={22} />
  <span className="text-lg">Contacter le vendeur</span>
</button>

{/* Modal de contact multi-canal */}
<AnimatePresence>
  {showContactModal && (
    <ContactOptions
      seller={{
        id: listing.user.id,
        firstName: listing.user.firstName,
        phone: listing.user.phone,
        whatsappPhone: listing.user.whatsappPhone,
        email: listing.user.email
      }}
      listing={{
        id: listing.id,
        title: listing.title
      }}
      onClose={() => setShowContactModal(false)}
    />
  )}
</AnimatePresence>
```

### Code complet de la section
```javascript
{/* Section Contact Vendeur */}
{!isOwner && (
  <GlassCard>
    <h2 className="text-xl font-bold text-secondary-900 mb-4">
      Contacter le vendeur
    </h2>
    
    {/* Infos vendeur */}
    <div className="flex items-center gap-4 mb-6">
      <Avatar
        src={listing.user?.profilePicture}
        alt={listing.user?.firstName}
        size="lg"
      />
      <div className="flex-1">
        <h3 className="font-bold text-secondary-900">
          {listing.user?.firstName} {listing.user?.lastName}
        </h3>
        {listing.user?.isPro && (
          <Badge variant="pro" size="sm">PRO</Badge>
        )}
      </div>
    </div>

    {/* Bouton Contact Multi-Canal */}
    <button
      onClick={() => setShowContactModal(true)}
      className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-95"
    >
      <MessageCircle size={22} />
      <span className="text-lg">Contacter le vendeur</span>
    </button>

    {/* Info sécurité */}
    <p className="text-xs text-secondary-600 text-center mt-4">
      💡 Choisissez votre moyen de contact préféré
    </p>
  </GlassCard>
)}

{/* Modal Contact Options */}
<AnimatePresence>
  {showContactModal && (
    <ContactOptions
      seller={{
        id: listing.user.id,
        firstName: listing.user.firstName,
        phone: listing.user.phone,
        whatsappPhone: listing.user.whatsappPhone,
        email: listing.user.email
      }}
      listing={{
        id: listing.id,
        title: listing.title
      }}
      onClose={() => setShowContactModal(false)}
    />
  )}
</AnimatePresence>
```

---

## 2. Dans SellerInfo.jsx

### Intégration similaire
```javascript
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ContactOptions from './ContactOptions';

export default function SellerInfo({ seller, listing }) {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div>
      {/* ... autres infos vendeur ... */}
      
      <button
        onClick={() => setShowContactModal(true)}
        className="w-full bg-green-500 hover:bg-green-600..."
      >
        Contacter
      </button>

      <AnimatePresence>
        {showContactModal && (
          <ContactOptions
            seller={seller}
            listing={listing}
            onClose={() => setShowContactModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 3. Avantages du Nouveau Système

### Avant
- ❌ WhatsApp uniquement
- ❌ Format numéro parfois incorrect
- ❌ Pas de choix pour l'utilisateur

### Après
- ✅ 4 canaux de contact (WhatsApp, Tel, SMS, Email)
- ✅ Format automatiquement corrigé
- ✅ Interface intuitive et moderne
- ✅ Flexibilité pour le client
- ✅ Fonctionne sans compte utilisateur

---

## 4. Test

### Vérifier que ça fonctionne
```bash
# 1. Démarrer le serveur
cd planb-frontend
npm run dev

# 2. Ouvrir une annonce
http://localhost:5173/listing/1

# 3. Cliquer sur "Contacter le vendeur"

# 4. Vérifier que le modal s'ouvre avec 4 options

# 5. Tester chaque option:
#    - WhatsApp → wa.me/...
#    - Appel → tel:...
#    - SMS → sms:...
#    - Email → mailto:...
```

---

## 5. Styles Personnalisables

### Modifier les couleurs du bouton
```javascript
// Bouton style 1: Gradient (recommandé)
className="bg-gradient-to-r from-primary-500 to-primary-600..."

// Bouton style 2: Solid
className="bg-primary-500 hover:bg-primary-600..."

// Bouton style 3: Outline
className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50..."

// Bouton style 4: WhatsApp green
className="bg-green-500 hover:bg-green-600..."
```

### Personnaliser le modal
Le composant `ContactOptions` accepte des props:
```javascript
<ContactOptions
  seller={...}
  listing={...}
  onClose={...}
  // Props optionnelles futures:
  // theme="light|dark"
  // primaryColor="#FF6B35"
  // showIcons={true}
/>
```

---

## 6. Gestion des Erreurs

### Si un moyen de contact n'est pas disponible
Le composant masque automatiquement les options non disponibles.

Exemple:
```javascript
seller = {
  phone: "+225...",      // ✅ Disponible
  whatsappPhone: null,   // ❌ Non disponible (masqué)
  email: null           // ❌ Non disponible (masqué)
}
// → Affichera seulement: Appel et SMS
```

### Message si aucun moyen disponible
```javascript
{availableMethods.length === 0 && (
  <div className="text-center py-8">
    <p className="text-secondary-600">
      Aucun moyen de contact disponible pour ce vendeur.
    </p>
  </div>
)}
```

---

## 7. Mobile

Sur mobile, le modal s'adapte automatiquement:
- Animation depuis le bas de l'écran
- Boutons plus espacés
- Touch-friendly
- Fermeture au swipe (futur)

---

## 8. Checklist d'Intégration

- [ ] Imports ajoutés (useState, AnimatePresence, ContactOptions)
- [ ] État `showContactModal` créé
- [ ] Bouton "Contacter" modifié avec `onClick`
- [ ] Modal `<ContactOptions>` ajouté avec `<AnimatePresence>`
- [ ] Props seller et listing passées correctement
- [ ] Testé sur desktop
- [ ] Testé sur mobile
- [ ] Vérifié que tous les canaux fonctionnent

---

## 9. Fichiers à Modifier

```
planb-frontend/src/
├── pages/
│   ├── ListingDetail.jsx ................... ✏️ À modifier
│   └── ListingDetailOptimized.jsx .......... ✏️ À modifier
└── components/
    └── listing/
        ├── SellerInfo.jsx ................... ✏️ À modifier
        └── ContactOptions.jsx ............... ✅ Déjà créé
```

---

## 10. Code Complet Exemple

Voir le fichier complet dans:
`planb-frontend/src/pages/ListingDetailWithContact.jsx.example`

---

**🎉 Une fois intégré, le système de contact multi-canal sera opérationnel!**
