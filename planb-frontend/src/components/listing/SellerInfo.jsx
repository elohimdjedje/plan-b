import { useNavigate } from 'react-router-dom';
import { Crown, Package, Calendar, MessageCircle, ChevronRight } from 'lucide-react';
import GlassCard from '../common/GlassCard';

/**
 * Informations sur le vendeur avec description et autres annonces
 */
export default function SellerInfo({ 
  seller, 
  otherListings = [],
  showContactButton = true,
  onContact
}) {
  const navigate = useNavigate();

  if (!seller) return null;

  // Initiales du vendeur
  const initials = seller.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <GlassCard>
      <h3 className="font-semibold text-lg mb-4">Vendeur</h3>
      
      {/* Profil vendeur */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar avec initiales */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
            {initials}
          </div>
          {/* Badge PRO */}
          {seller.accountType === 'PRO' && (
            <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-yellow-400 rounded-full flex items-center gap-1">
              <Crown size={10} className="text-yellow-900" />
              <span className="text-xs font-bold text-yellow-900">PRO</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-secondary-900 mb-1">{seller.name}</h4>
          {seller.accountType === 'PRO' && (
            <div className="flex items-center gap-1 text-xs text-yellow-700 mb-2">
              <Crown size={12} />
              <span className="font-medium">Certifié Professionnel</span>
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-secondary-600">
            {seller.activeListings && (
              <div className="flex items-center gap-1">
                <Package size={12} />
                <span>{seller.activeListings} annonces</span>
              </div>
            )}
            {seller.memberSince && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>Depuis {seller.memberSince}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description du vendeur (si disponible) */}
      {seller.description && (
        <div className="bg-secondary-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-secondary-700 leading-relaxed">
            {seller.description}
          </p>
        </div>
      )}

      {/* Bouton contact */}
      {showContactButton && (
        <button
          onClick={onContact}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle size={20} />
          <span>Discuter sur WhatsApp</span>
        </button>
      )}

      {/* Autres annonces du vendeur */}
      {otherListings.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-secondary-900">
              Autres annonces ({otherListings.length})
            </h4>
            <button 
              onClick={() => navigate(`/seller/${seller.id}`)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {otherListings.slice(0, 4).map((listing) => (
              <button
                key={listing.id}
                onClick={() => navigate(`/listing/${listing.id}`)}
                className="bg-white/50 rounded-xl overflow-hidden hover:bg-white/70 transition-all text-left"
              >
                <img
                  src={listing.images?.[0]?.url || listing.image}
                  alt={listing.title}
                  className="w-full h-24 object-cover"
                />
                <div className="p-2">
                  <p className="text-xs font-semibold text-secondary-900 line-clamp-1">
                    {listing.title}
                  </p>
                  <p className="text-sm font-bold text-primary-600 mt-1">
                    {listing.price?.toLocaleString()} FCFA
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
