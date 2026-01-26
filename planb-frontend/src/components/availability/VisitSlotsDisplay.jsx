import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, MessageCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';
import { visitSlotsAPI } from '../../api/visitSlots';
import { useAuthStore } from '../../store/authStore';

/**
 * Affichage des créneaux de visite disponibles pour une annonce (côté client)
 */
export default function VisitSlotsDisplay({ listingId, ownerId }) {
  const { user } = useAuthStore();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    message: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (listingId) {
      loadSlots();
    }
  }, [listingId]);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const data = await visitSlotsAPI.getByListing(listingId);
      setSlots(data.data || []);
    } catch (error) {
      console.error('Erreur chargement créneaux:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = (slot) => {
    if (!user) {
      toast.error('Connectez-vous pour réserver une visite');
      return;
    }
    
    if (user.id === ownerId) {
      toast.error('Vous ne pouvez pas réserver votre propre annonce');
      return;
    }

    setBookingSlot(slot);
    setBookingData({
      message: '',
      phone: user.phone || '',
    });
    setShowBookingForm(true);
  };

  const submitBooking = async () => {
    if (!bookingSlot) return;

    setSubmitting(true);
    try {
      await visitSlotsAPI.book(bookingSlot.id, bookingData);
      toast.success('Visite réservée avec succès !');
      setShowBookingForm(false);
      setBookingSlot(null);
      loadSlots();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  const groupSlotsByDate = () => {
    const grouped = {};
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (slots.length === 0) {
    return null;
  }

  const groupedSlots = groupSlotsByDate();

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-400" />
        Créneaux de visite disponibles
      </h3>

      <div className="space-y-4">
        {Object.entries(groupedSlots).map(([date, dateSlots]) => (
          <div key={date}>
            <div className="text-sm font-medium text-gray-300 mb-2">
              {new Date(date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {dateSlots.map((slot) => (
                <motion.button
                  key={slot.id}
                  onClick={() => handleBookSlot(slot)}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-white text-sm transition-all flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Clock className="w-4 h-4" />
                  {slot.startTime} - {slot.endTime}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de réservation */}
      <AnimatePresence>
        {showBookingForm && bookingSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBookingForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Réserver une visite</h3>
              
              <div className="bg-blue-500/10 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">
                    {new Date(bookingSlot.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span>{bookingSlot.startTime} - {bookingSlot.endTime}</span>
                </div>
                {bookingSlot.notes && (
                  <p className="text-sm text-gray-400 mt-2">{bookingSlot.notes}</p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Téléphone de contact
                  </label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    placeholder="Votre numéro de téléphone"
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <MessageCircle className="w-4 h-4 inline mr-1" />
                    Message (optionnel)
                  </label>
                  <textarea
                    value={bookingData.message}
                    onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                    placeholder="Un message pour le propriétaire..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1"
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={submitBooking}
                  className="flex-1 flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    'Réservation...'
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirmer
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
