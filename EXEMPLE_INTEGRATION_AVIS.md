# ⭐ Intégration du Système d'Avis

## Guide complet pour afficher les avis dans l'application

---

## 1. Page Profil Vendeur (`SellerProfile.jsx`)

### Imports nécessaires
```javascript
import SellerReviews from '../components/listing/SellerReviews';
```

### Intégration dans le profil
```javascript
export default function SellerProfile() {
  const { userId } = useParams();
  const [seller, setSeller] = useState(null);

  // ... chargement du vendeur ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
      <MobileContainer>
        {/* En-tête vendeur */}
        <GlassCard>
          <div className="text-center">
            <Avatar
              src={seller.profilePicture}
              alt={seller.fullName}
              size="2xl"
            />
            <h1 className="text-2xl font-bold mt-4">
              {seller.fullName}
            </h1>
            {seller.isPro && (
              <Badge variant="pro">PRO</Badge>
            )}
          </div>
        </GlassCard>

        {/* 🆕 Section Avis - À AJOUTER ICI */}
        <SellerReviews sellerId={userId} />

        {/* Annonces du vendeur */}
        <GlassCard>
          <h2 className="text-xl font-bold mb-4">
            Annonces de {seller.firstName}
          </h2>
          {/* ... liste annonces ... */}
        </GlassCard>
      </MobileContainer>
    </div>
  );
}
```

---

## 2. Page Détail Annonce (`ListingDetail.jsx`)

### Pour les annonces de vacances (hôtel, résidence)

```javascript
import { useState } from 'react';
import { Star } from 'lucide-react';
import ReviewModal from '../components/listing/ReviewModal';
import { getListingReviews } from '../api/reviews';
import { AnimatePresence } from 'framer-motion';

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    loadListing();
    loadReviews();
    checkCanReview();
  }, [id]);

  const loadReviews = async () => {
    try {
      const data = await getListingReviews(id);
      setReviews(data.reviews);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    }
  };

  const checkCanReview = () => {
    // Pour les hôtels/vacances, tout le monde peut laisser un avis
    const isVacation = ['hotel', 'residence-meublee', 'vacances'].includes(
      listing?.subcategory
    );
    setCanReview(isVacation && !isOwner);
  };

  return (
    <div>
      {/* ... autres sections ... */}

      {/* Section Avis pour annonces de vacances */}
      {listing?.subcategory === 'hotel' && (
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">
              Avis des clients
            </h2>
            
            {/* Bouton pour laisser un avis */}
            {canReview && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
              >
                <Star size={18} />
                <span>Laisser un avis</span>
              </button>
            )}
          </div>

          {/* Note moyenne */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-yellow-50 rounded-xl">
              <div className="text-4xl font-bold text-secondary-900">
                {reviews.averageRating.toFixed(1)}
              </div>
              <div>
                <ReviewStars rating={Math.round(reviews.averageRating)} size={24} />
                <p className="text-sm text-secondary-600 mt-1">
                  {reviews.totalReviews} avis
                </p>
              </div>
            </div>
          )}

          {/* Liste des avis */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-secondary-600">
                <Star size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Soyez le premier à laisser un avis !</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 bg-white/50 rounded-xl border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={review.reviewer.profilePicture}
                      alt={review.reviewer.firstName}
                      size="sm"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-secondary-900">
                          {review.reviewer.firstName}
                        </p>
                        <ReviewStars rating={review.rating} size={14} />
                      </div>
                      {review.comment && (
                        <p className="text-sm text-secondary-700">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-xs text-secondary-500 mt-2">
                        {formatRelativeDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      )}

      {/* Modal pour créer un avis */}
      <AnimatePresence>
        {showReviewModal && (
          <ReviewModal
            listing={listing}
            onClose={() => setShowReviewModal(false)}
            onSuccess={loadReviews}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 3. Composant Badge Note Moyenne

### Créer un badge réutilisable
```javascript
// components/listing/RatingBadge.jsx
import ReviewStars from './ReviewStars';

export default function RatingBadge({ rating, count, size = 'md' }) {
  if (!rating || rating === 0) return null;

  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className={`inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg ${sizes[size]}`}>
      <ReviewStars rating={Math.round(rating)} size={size === 'sm' ? 12 : 14} />
      <span className="font-semibold text-secondary-900">
        {rating.toFixed(1)}
      </span>
      {count && (
        <span className="text-secondary-600">
          ({count})
        </span>
      )}
    </div>
  );
}
```

### Utilisation dans ListingCard
```javascript
// components/listing/ListingCard.jsx
import RatingBadge from './RatingBadge';

export default function ListingCard({ listing }) {
  return (
    <div className="listing-card">
      {/* Image */}
      <img src={listing.mainImage} alt={listing.title} />
      
      {/* Contenu */}
      <div className="p-4">
        <h3>{listing.title}</h3>
        <p>{formatPrice(listing.price)}</p>
        
        {/* 🆕 Badge note si disponible */}
        {listing.averageRating && (
          <RatingBadge
            rating={listing.averageRating}
            count={listing.reviewCount}
            size="sm"
          />
        )}
      </div>
    </div>
  );
}
```

---

## 4. Widget Note Vendeur dans Header

### Afficher la note dans l'en-tête annonce
```javascript
export default function ListingDetail() {
  const [sellerStats, setSellerStats] = useState(null);

  useEffect(() => {
    loadSellerStats();
  }, [listing]);

  const loadSellerStats = async () => {
    try {
      const { data } = await axios.get(
        `/api/v1/reviews/seller/${listing.user.id}`
      );
      setSellerStats(data.stats);
    } catch (error) {
      console.error('Erreur stats vendeur:', error);
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-4">
        <Avatar src={listing.user.profilePicture} size="lg" />
        <div className="flex-1">
          <h3 className="font-bold">{listing.user.fullName}</h3>
          
          {/* 🆕 Note vendeur */}
          {sellerStats?.averageRating > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <ReviewStars rating={Math.round(sellerStats.averageRating)} size={14} />
              <span className="text-sm text-secondary-600">
                {sellerStats.averageRating.toFixed(1)} ({sellerStats.totalReviews} avis)
              </span>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
```

---

## 5. Solution pour Annonces Vendues/Occupées

### Logique recommandée

```javascript
// Déterminer si l'utilisateur peut laisser un avis
const canLeaveReview = () => {
  // Pour les vacances (hôtels), toujours possible
  if (['hotel', 'residence-meublee', 'vacances'].includes(listing.subcategory)) {
    return true;
  }

  // Pour les ventes/locations
  // Option 1: Seulement si l'annonce est "sold" ou "rented" ET l'utilisateur est l'acheteur
  if (listing.status === 'sold' && listing.buyerId === currentUser.id) {
    return true;
  }

  // Option 2: Activer quand le vendeur confirme la transaction
  if (listing.transactionConfirmed && listing.buyerId === currentUser.id) {
    return true;
  }

  return false;
};

// Dans le backend: Endpoint pour confirmer transaction
// POST /api/v1/listings/{id}/confirm-transaction
// → Permet au vendeur de marquer qu'une vente est finalisée
// → Débloque la possibilité de laisser un avis pour l'acheteur
```

### Workflow recommandé
```
1. Annonce active → Pas d'avis possible
2. Transaction finalisée → Vendeur confirme
3. Confirmation → Acheteur peut laisser avis
4. Avis laissé → Visible sur profil vendeur
```

---

## 6. Notifications pour Nouveaux Avis

### Backend: Event Listener
```php
// src/EventListener/ReviewCreatedListener.php
namespace App\EventListener;

use App\Entity\Review;
use Doctrine\Persistence\Event\LifecycleEventArgs;

class ReviewCreatedListener
{
    public function postPersist(LifecycleEventArgs $args): void
    {
        $entity = $args->getObject();

        if (!$entity instanceof Review) {
            return;
        }

        // Envoyer notification au vendeur
        // $this->notificationService->notifyNewReview($entity);
    }
}
```

### Frontend: Toast notification
```javascript
// Après création d'un avis
toast.success('Merci pour votre avis ! Le vendeur sera notifié.', {
  icon: '⭐',
  duration: 4000
});
```

---

## 7. Modération des Avis (Futur)

### Préparer le terrain
```javascript
// Ajouter champ "status" dans Review entity
status: 'pending' | 'approved' | 'rejected'

// N'afficher que les avis approuvés
const reviews = await getListingReviews(listingId);
const approvedReviews = reviews.filter(r => r.status === 'approved');
```

---

## 8. Checklist d'Intégration

- [ ] `SellerReviews` intégré dans `SellerProfile.jsx`
- [ ] Section avis ajoutée dans `ListingDetail.jsx` pour vacances
- [ ] `RatingBadge` créé et utilisé dans `ListingCard.jsx`
- [ ] Note vendeur affichée dans header annonce
- [ ] Modal `ReviewModal` fonctionnel
- [ ] API reviews testée avec Postman
- [ ] Permissions vérifiées (qui peut noter quoi)
- [ ] Messages d'erreur gérés
- [ ] Design responsive testé
- [ ] Documentation mise à jour

---

## 9. Exemple Complet Page Profil

```javascript
// pages/SellerProfile.jsx (Version complète)
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, MapPin, Calendar, Star } from 'lucide-react';
import MobileContainer from '../components/layout/MobileContainer';
import GlassCard from '../components/common/GlassCard';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import SellerReviews from '../components/listing/SellerReviews';
import ListingCard from '../components/listing/ListingCard';
import { getUserById } from '../api/users';
import { getUserListings } from '../api/listings';
import { formatRelativeDate } from '../utils/format';

export default function SellerProfile() {
  const { userId } = useParams();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeller();
    loadListings();
  }, [userId]);

  const loadSeller = async () => {
    try {
      const data = await getUserById(userId);
      setSeller(data);
    } catch (error) {
      console.error('Erreur chargement vendeur:', error);
    }
  };

  const loadListings = async () => {
    try {
      const data = await getUserListings(userId);
      setListings(data);
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
      <MobileContainer>
        {/* En-tête Vendeur */}
        <GlassCard>
          <div className="text-center">
            <Avatar
              src={seller.profilePicture}
              alt={seller.fullName}
              size="2xl"
            />
            <h1 className="text-2xl font-bold text-secondary-900 mt-4">
              {seller.fullName}
            </h1>
            {seller.isPro && (
              <Badge variant="pro" className="mt-2">
                PRO
              </Badge>
            )}
            
            {/* Infos */}
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-secondary-600">
              {seller.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {seller.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                Membre depuis {formatRelativeDate(seller.createdAt)}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* 🆕 Avis du Vendeur */}
        <SellerReviews sellerId={userId} />

        {/* Annonces */}
        <GlassCard>
          <h2 className="text-xl font-bold text-secondary-900 mb-4">
            Annonces de {seller.firstName}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </GlassCard>
      </MobileContainer>
    </div>
  );
}
```

---

**🎉 Système d'avis complètement intégré!**
