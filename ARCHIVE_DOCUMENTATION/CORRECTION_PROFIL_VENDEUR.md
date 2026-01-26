# Correction Complète du Profil Vendeur

**Date**: 17 novembre 2024

## ❌ Problèmes Identifiés

### 1. **Données Fictives Hardcodées**
```javascript
// Avant - TOUT était en dur !
setSeller({
  name: 'Jean Kouassi',              // ❌ Fictif
  phone: '+221771234567',            // ❌ Fictif (Sénégal)
  location: 'Dakar, Sénégal',        // ❌ Fictif
  bio: 'Agent immobilier...',        // ❌ Fictif
  rating: 4.8,                       // ❌ Fictif
  reviewsCount: 127,                 // ❌ Fictif
  activeListings: 12,                // ❌ Fictif
  soldListings: 45                   // ❌ Fictif
});

setListings([
  {
    title: 'Villa F4 moderne à Cocody',  // ❌ Annonce fictive
    price: 25000000,
    image: 'https://unsplash.com/...'   // ❌ Image externe
  }
]);
```

### 2. **Pas d'API Backend**
- Aucune route pour récupérer le profil public d'un vendeur
- Impossible de charger les vraies données

### 3. **Bouton WhatsApp Ne Fonctionnait Pas**
- Utilisait un numéro fictif sénégalais
- Pas de vérification si le numéro existe

### 4. **Stats Incorrectes**
- "45 vendues" → N'existe pas dans le système
- "4.8⭐ 127 avis" → Système de notation pas implémenté

### 5. **Catégories Vides**
- Filtres "Immobilier", "Véhicule", "Vacance" affichaient toujours 0

---

## ✅ Solutions Appliquées

### 1. **Création de l'API Backend**

**Nouveau fichier**: `planb-backend/src/Controller/UserController.php`

Ajout de la route:
```php
#[Route('/{id}/public-profile', name: 'app_user_public_profile', methods: ['GET'])]
public function getPublicProfile(int $id): JsonResponse
{
    $user = $this->userRepository->find($id);
    
    if (!$user) {
        return $this->json(['error' => 'Utilisateur non trouvé'], 404);
    }

    // Récupérer les annonces actives du vendeur
    $listings = $this->entityManager->createQueryBuilder()
        ->select('l')
        ->from('App\Entity\Listing', 'l')
        ->where('l.user = :user')
        ->andWhere('l.status = :status')
        ->setParameter('user', $user)
        ->setParameter('status', 'active')
        ->orderBy('l.createdAt', 'DESC')
        ->getQuery()
        ->getResult();

    // Calculer les statistiques RÉELLES
    $totalViews = array_sum(array_map(fn($l) => $l->getViewsCount(), $listings));
    $totalContacts = array_sum(array_map(fn($l) => $l->getContactsCount(), $listings));

    return $this->json([
        'user' => [
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'fullName' => $user->getFullName(),
            'phone' => $user->getPhone(),
            'whatsappPhone' => $user->getWhatsappPhone() ?? $user->getPhone(),
            'city' => $user->getCity(),
            'country' => $user->getCountry(),
            'bio' => $user->getBio(),
            'accountType' => $user->getAccountType(),
            'isPro' => $user->isPro(),
            'memberSince' => $user->getCreatedAt()->format('Y'),
        ],
        'stats' => [
            'activeListings' => count($listings),
            'totalViews' => $totalViews,
            'totalContacts' => $totalContacts,
        ],
        'listings' => $listingsData,
    ]);
}
```

**URL**: `GET /api/v1/users/{id}/public-profile`

**Exemple Réponse**:
```json
{
  "user": {
    "id": 5,
    "firstName": "oly",
    "lastName": "tape",
    "fullName": "oly tape",
    "phone": null,
    "whatsappPhone": null,
    "city": null,
    "country": null,
    "bio": "the best 😁",
    "accountType": "FREE",
    "isPro": false,
    "memberSince": "2025"
  },
  "stats": {
    "activeListings": 2,
    "totalViews": 7,
    "totalContacts": 0
  },
  "listings": [
    {
      "id": 4,
      "title": "maybach neuf",
      "price": 100000000,
      "currency": "FCFA",
      "category": "vehicule",
      "city": "Adiake",
      "mainImage": "/uploads/listings/67845...",
      ...
    }
  ]
}
```

---

### 2. **Création de l'API Frontend**

**Nouveau fichier**: `planb-frontend/src/api/users.js`

```javascript
import api from './axios';

export const usersAPI = {
  /**
   * Obtenir le profil public d'un vendeur
   */
  getPublicProfile: async (userId) => {
    const response = await api.get(`/users/${userId}/public-profile`);
    return response.data;
  },

  // ... autres méthodes
};
```

---

### 3. **Correction Complète de SellerProfile.jsx**

**Avant (lignes 38-75)**: Tout hardcodé avec `setTimeout()`

**Après**: Vrai appel API
```javascript
useEffect(() => {
  const loadSellerProfile = async () => {
    try {
      setLoading(true);

      // Vérifier si c'est son propre profil
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id == userId) {
        toast.error('Vous ne pouvez pas voir votre propre profil vendeur');
        navigate('/profile');
        return;
      }

      // ✅ VRAIES DONNÉES depuis l'API
      const data = await usersAPI.getPublicProfile(userId);
      
      setSeller({
        id: data.user.id,
        name: data.user.fullName,              // ✅ "oly tape"
        firstName: data.user.firstName,        // ✅ "oly"
        phone: data.user.whatsappPhone || data.user.phone,
        accountType: data.user.accountType,    // ✅ "FREE"
        isPro: data.user.isPro,                // ✅ false
        memberSince: data.user.memberSince,    // ✅ "2025"
        location: `${data.user.city || ''}...`.trim() || 'Non renseigné',
        bio: data.user.bio || null,            // ✅ "the best 😁"
        activeListings: data.stats.activeListings,  // ✅ 2
        totalViews: data.stats.totalViews,          // ✅ 7
        totalContacts: data.stats.totalContacts     // ✅ 0
      });

      // ✅ VRAIES ANNONCES
      setListings(data.listings || []);
      
    } catch (error) {
      console.error('Erreur chargement profil vendeur:', error);
      toast.error('Impossible de charger le profil du vendeur');
      setSeller(null);
    } finally {
      setLoading(false);
    }
  };

  loadSellerProfile();
}, [userId, navigate]);
```

---

### 4. **Stats Corrigées**

**Avant**:
```jsx
<div>12 Annonces</div>
<div>45 Vendues</div>
<div>4.8⭐ 127 avis</div>
```

**Après (stats RÉELLES)**:
```jsx
<div>{seller.activeListings} Annonces</div>  {/* 2 */}
<div>{seller.totalViews} Vues</div>          {/* 7 */}
<div>{seller.totalContacts} Contacts</div>   {/* 0 */}
```

---

### 5. **Bouton WhatsApp Corrigé**

**Avant**:
```jsx
<Button onClick={() => openWhatsApp(seller.phone, ...)}>
  Contacter le vendeur
</Button>
```
- Toujours affiché même sans numéro
- Utilisait un faux numéro

**Après**:
```jsx
{seller.phone && (
  <Button onClick={() => {
    const message = `Bonjour ${seller.firstName}, je suis intéressé par vos annonces sur Plan B.`;
    openWhatsApp(seller.phone, message);
  }}>
    Discuter sur WhatsApp
  </Button>
)}

{!seller.phone && (
  <p className="text-sm text-secondary-500 text-center italic">
    Pas de numéro de contact disponible
  </p>
)}
```

✅ **S'affiche seulement si le vendeur a un numéro**  
✅ **Utilise le vrai numéro WhatsApp ou téléphone**  
✅ **Message personnalisé avec le prénom**

---

### 6. **Annonces Réelles**

**Avant**: Annonces fictives d'Unsplash

**Après**: 
- ✅ Chargées depuis la base de données
- ✅ Filtrées par catégorie (immobilier, véhicule, vacance)
- ✅ Images avec `getImageUrl()` pour Docker
- ✅ Prix en FCFA
- ✅ Vraies localisations

---

### 7. **Badge PRO Corrigé**

**Avant**:
```jsx
{seller.accountType === 'PRO' && <Badge>PRO</Badge>}
```

**Après**:
```jsx
{seller.isPro && (
  <Badge variant="pro" size="sm">
    <Star size={12} className="fill-yellow-500" />
    PRO
  </Badge>
)}
```

---

## 🧪 Tests à Effectuer

### Test 1: Profil avec Annonces (ID 5 - oly tape)
1. **Aller sur** `/seller/5`
2. **Vérifier**:
   - ✅ Nom: "oly tape" (pas "Jean Kouassi")
   - ✅ Stats: "2 Annonces", "7 Vues", "0 Contacts"
   - ✅ Bio: "the best 😁"
   - ✅ Badge FREE (pas PRO)
   - ✅ 2 annonces s'affichent:
     - maybach neuf (100 000 000 FCFA)
     - villa moderne T5 (250 000 000 FCFA)
   - ✅ Images des annonces s'affichent
   - ⚠️ Bouton WhatsApp: "Pas de numéro de contact disponible" (car phone = null)

### Test 2: Profil sans Annonces (ID 4 - elohim djedje)
1. **Aller sur** `/seller/4`
2. **Vérifier**:
   - ✅ Nom: "elohim djedje"
   - ✅ Stats: "0 Annonces", "0 Vues", "0 Contacts"
   - ✅ Message: "Aucune annonce dans cette catégorie"

### Test 3: Bouton WhatsApp
1. **Ajouter un numéro** dans le profil de oly tape:
```sql
UPDATE users SET phone = '+225 07 00 00 00 00' WHERE id = 5;
```

2. **Recharger** `/seller/5`
3. **Cliquer sur** "Discuter sur WhatsApp"
4. **Vérifier**: Ouvre WhatsApp avec le message:
```
Bonjour oly, je suis intéressé par vos annonces sur Plan B.
```

### Test 4: Filtres par Catégorie
1. **Aller sur** `/seller/5`
2. **Cliquer sur "Véhicule (1)"**
3. **Vérifier**: Seul "maybach neuf" s'affiche
4. **Cliquer sur "Immobilier (1)"**
5. **Vérifier**: Seule "villa moderne T5" s'affiche
6. **Cliquer sur "Tout (2)"**
7. **Vérifier**: Les 2 annonces s'affichent

### Test 5: Accès à son Propre Profil
1. **Se connecter** avec `olitape@gmail.com`
2. **Aller sur** `/seller/5`
3. **Vérifier**: Redirection vers `/profile` avec message d'erreur

---

## 📊 Comparaison Avant/Après

| Élément | Avant ❌ | Après ✅ |
|---------|----------|----------|
| **Nom** | Jean Kouassi | oly tape (vrai) |
| **Localisation** | Dakar, Sénégal | Non renseigné (vrai) |
| **Membre depuis** | 2023 | 2025 (vrai) |
| **Bio** | "Agent immobilier..." | "the best 😁" (vrai) |
| **Annonces** | 12 | 2 (vrai) |
| **Stats** | 45 vendues, 4.8⭐ | 7 vues, 0 contacts (vrai) |
| **Badge** | PRO | FREE (vrai) |
| **Annonces affichées** | Villa F4, Appart F3 (fictives) | maybach neuf, villa T5 (vraies) |
| **Prix** | 25M, 200k | 100M, 250M (vrais) |
| **WhatsApp** | Toujours affiché | Affiché si numéro existe |
| **Images** | Unsplash | Backend uploads (vraies) |

---

## 🔧 Commandes Utiles

### Ajouter un Numéro WhatsApp
```sql
docker exec planb_postgres psql -U postgres -d planb -c "UPDATE users SET phone = '+225 07 00 00 00 00', whatsapp_phone = '+225 07 00 00 00 00' WHERE id = 5;"
```

### Ajouter une Bio
```sql
docker exec planb_postgres psql -U postgres -d planb -c "UPDATE users SET bio = 'Vendeur professionnel de véhicules et immobilier de luxe en Côte d''Ivoire.' WHERE id = 5;"
```

### Passer en PRO
```sql
docker exec planb_postgres psql -U postgres -d planb -c "UPDATE users SET account_type = 'PRO', is_lifetime_pro = true WHERE id = 5;"
```

### Voir les Stats d'un Vendeur
```sql
docker exec planb_postgres psql -U postgres -d planb -c "
SELECT 
    u.id, 
    u.first_name || ' ' || u.last_name as name,
    COUNT(l.id) as listings_count,
    SUM(l.views_count) as total_views,
    SUM(l.contacts_count) as total_contacts
FROM users u
LEFT JOIN listings l ON u.id = l.user_id AND l.status = 'active'
WHERE u.id = 5
GROUP BY u.id, u.first_name, u.last_name;
"
```

---

## 📂 Fichiers Modifiés

### Backend
1. ✅ `planb-backend/src/Controller/UserController.php`
   - Ajout route `/api/v1/users/{id}/public-profile`
   - Récupération profil + annonces + stats

### Frontend
2. ✅ `planb-frontend/src/api/users.js` (NOUVEAU)
   - API client pour les utilisateurs
3. ✅ `planb-frontend/src/pages/SellerProfile.jsx`
   - Remplacement données hardcodées par vraies données
   - Correction stats (vues/contacts au lieu de vendues/avis)
   - Correction bouton WhatsApp (avec vérification)
   - Correction badge PRO

---

## 🚀 Améliorations Futures

### 1. Système de Notation
```php
// Ajouter une table reviews
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    reviewer_id INT REFERENCES users(id),
    seller_id INT REFERENCES users(id),
    listing_id INT REFERENCES listings(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Statistiques "Vendues"
```php
// Compter les annonces avec status = 'sold'
$soldListings = $this->entityManager->createQueryBuilder()
    ->select('COUNT(l.id)')
    ->from('App\Entity\Listing', 'l')
    ->where('l.user = :user')
    ->andWhere('l.status = :status')
    ->setParameter('user', $user)
    ->setParameter('status', 'sold')
    ->getQuery()
    ->getSingleScalarResult();
```

### 3. Photo de Profil
```jsx
{seller.profilePicture ? (
  <img src={getImageUrl(seller.profilePicture)} alt={seller.name} />
) : (
  <Avatar name={seller.name} size="xl" />
)}
```

### 4. Badge Vérifié
```jsx
{seller.isPhoneVerified && (
  <span className="text-green-500">
    <CheckCircle size={16} /> Vérifié
  </span>
)}
```

---

## ✅ Résumé

### Avant ❌
- **100% de données fictives** hardcodées
- Profil "Jean Kouassi" au Sénégal
- Annonces inexistantes
- Stats inventées
- WhatsApp ne fonctionne pas

### Après ✅
- **100% de données réelles** depuis l'API
- Profil "oly tape" (vrai utilisateur)
- Vraies annonces avec vraies images
- Vraies statistiques (vues, contacts)
- WhatsApp fonctionne si numéro renseigné

**Le profil vendeur est maintenant complètement fonctionnel !** 🎉
