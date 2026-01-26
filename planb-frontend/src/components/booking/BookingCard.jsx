import { useState } from 'react';
import { Calendar, MapPin, User, DollarSign, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatRelativeDate } from '../../utils/format';

/**
 * Carte de réservation
 */
export default function BookingCard({ booking, onAction }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'accepted':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'active':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'completed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      accepted: 'Acceptée',
      confirmed: 'Confirmée',
      active: 'Active',
      completed: 'Terminée',
      rejected: 'Refusée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
      case 'active':
      case 'completed':
        return CheckCircle2;
      case 'rejected':
      case 'cancelled':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const handleViewDetails = () => {
    navigate(`/bookings/${booking.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-orange-500/50 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">
            {booking.listing_title || `Réservation #${booking.id}`}
          </h3>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
            {(() => {
              const Icon = getStatusIcon(booking.status);
              return <Icon className="w-3 h-3" />;
            })()}
            {getStatusLabel(booking.status)}
          </div>
        </div>
      </div>

      {/* Informations */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Clock className="w-4 h-4" />
          <span>{booking.duration_days} jours</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-300">
          <DollarSign className="w-4 h-4" />
          <span className="font-semibold text-orange-400">
            {formatPrice(booking.total_amount)} XOF
          </span>
        </div>

        {booking.tenant_name && (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <User className="w-4 h-4" />
            <span>Locataire: {booking.tenant_name}</span>
          </div>
        )}
      </div>

      {/* Paiements */}
      <div className="bg-white/5 rounded-lg p-3 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Caution</span>
          <span className={booking.deposit_paid ? 'text-green-400' : 'text-yellow-400'}>
            {booking.deposit_paid ? '✓ Payée' : 'En attente'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">1er Loyer</span>
          <span className={booking.first_rent_paid ? 'text-green-400' : 'text-yellow-400'}>
            {booking.first_rent_paid ? '✓ Payé' : 'En attente'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleViewDetails}
          className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
        >
          Voir détails
        </button>
        {onAction && (
          <button
            onClick={() => onAction(booking)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium transition-colors"
          >
            Action
          </button>
        )}
      </div>
    </motion.div>
  );
}
