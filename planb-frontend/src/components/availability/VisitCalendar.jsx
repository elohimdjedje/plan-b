import { useState, useEffect } from 'react';
import { Calendar, Clock, Phone, MessageCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';
import { visitSlotsAPI } from '../../api/visitSlots';
import { useAuthStore } from '../../store/authStore';

/**
 * Calendrier des visites avec créneaux intégrés
 */
export default function VisitCalendar({ listingId, ownerId }) {
  const { user } = useAuthStore();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({ message: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

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

  // Grouper les créneaux par date
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});

  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Jours vides du début
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      days.push({
        day,
        date,
        dateStr,
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today,
        hasSlots: slotsByDate[dateStr]?.length > 0,
        slotsCount: slotsByDate[dateStr]?.length || 0,
      });
    }
    
    return days;
  };

  const handleDateClick = (dayInfo) => {
    if (!dayInfo || dayInfo.isPast || !dayInfo.hasSlots) return;
    
    setSelectedDate(dayInfo);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    if (!user) {
      toast.error('Connectez-vous pour réserver une visite');
      return;
    }
    
    if (user.id === ownerId) {
      toast.error('Vous ne pouvez pas réserver votre propre annonce');
      return;
    }

    setSelectedSlot(slot);
    setBookingData({ message: '', phone: user.phone || '' });
    setShowBookingModal(true);
  };

  const submitBooking = async () => {
    if (!selectedSlot) return;

    setSubmitting(true);
    try {
      await visitSlotsAPI.book(selectedSlot.id, bookingData);
      toast.success('Visite réservée avec succès !');
      setShowBookingModal(false);
      setSelectedSlot(null);
      setSelectedDate(null);
      loadSlots();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const calendarDays = generateCalendarDays();

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Visites disponibles</h3>
        </div>
        <p className="text-gray-400 text-center py-8">
          Aucun créneau de visite disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Réserver une visite</h3>
      </div>

      {/* Calendrier */}
      <div className="mb-6">
        {/* Navigation mois */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h4 className="text-lg font-bold text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h4>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayInfo, index) => (
            <div
              key={index}
              onClick={() => handleDateClick(dayInfo)}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all flex flex-col items-center justify-center relative
                ${!dayInfo ? 'invisible' : ''}
                ${dayInfo?.isPast ? 'opacity-30 cursor-not-allowed text-gray-500' : ''}
                ${dayInfo?.hasSlots && !dayInfo?.isPast
                  ? 'bg-orange-500/20 hover:bg-orange-500/40 cursor-pointer text-white border border-orange-500/50'
                  : 'text-gray-400'
                }
                ${dayInfo?.isToday ? 'ring-2 ring-orange-400' : ''}
                ${selectedDate?.dateStr === dayInfo?.dateStr ? 'bg-orange-500 text-white' : ''}
              `}
            >
              {dayInfo?.day}
              {dayInfo?.hasSlots && !dayInfo?.isPast && (
                <div className="absolute bottom-1 w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
              )}
            </div>
          ))}
        </div>

        {/* Légende */}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500/20 border border-orange-500/50 rounded"></div>
            <span>Visite disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-orange-400 rounded"></div>
            <span>Aujourd'hui</span>
          </div>
        </div>
      </div>

      {/* Créneaux de la date sélectionnée */}
      <AnimatePresence mode="wait">
        {selectedDate && slotsByDate[selectedDate.dateStr] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-t border-white/10 pt-4"
          >
            <h4 className="text-white font-medium mb-3">
              Créneaux du {new Date(selectedDate.dateStr).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {slotsByDate[selectedDate.dateStr].map((slot) => (
                <motion.button
                  key={slot.id}
                  onClick={() => handleSlotSelect(slot)}
                  className="p-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 rounded-xl text-white transition-all flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                </motion.button>
              ))}
            </div>

            {slotsByDate[selectedDate.dateStr][0]?.notes && (
              <p className="text-sm text-gray-400 mt-3 italic">
                {slotsByDate[selectedDate.dateStr][0].notes}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de réservation */}
      <AnimatePresence>
        {showBookingModal && selectedSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Confirmer la visite</h3>
              
              <div className="bg-orange-500/10 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-orange-400 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">
                    {new Date(selectedSlot.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <span className="font-medium">{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                </div>
                {selectedSlot.notes && (
                  <p className="text-sm text-gray-400 mt-2">{selectedSlot.notes}</p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Votre téléphone
                  </label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    placeholder="Ex: 07 00 00 00 00"
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    Message pour le propriétaire (optionnel)
                  </label>
                  <textarea
                    value={bookingData.message}
                    onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                    placeholder="Présentez-vous, posez vos questions..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowBookingModal(false)}
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
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Réservation...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Réserver
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
