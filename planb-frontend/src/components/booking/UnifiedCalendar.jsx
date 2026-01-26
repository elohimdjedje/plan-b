import { useState, useEffect } from 'react';
import { Calendar, Clock, Home, Eye, Phone, MessageCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';
import { visitSlotsAPI } from '../../api/visitSlots';
import { availabilityAPI } from '../../api/availability';
import { useAuthStore } from '../../store/authStore';

/**
 * Calendrier unifié - Réservation (location) + Visites
 */
export default function UnifiedCalendar({ 
  listingId, 
  ownerId,
  onDateSelect,
  selectedStartDate,
  selectedEndDate,
  showRentalTab = true,
  onTabChange
}) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState(showRentalTab ? 'rental' : 'visit');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // État pour les visites
  const [visitSlots, setVisitSlots] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({ message: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  // État pour la location
  const [availability, setAvailability] = useState({});
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  useEffect(() => {
    if (listingId) {
      loadVisitSlots();
      if (showRentalTab) {
        loadAvailability();
      }
    }
  }, [listingId, currentMonth]);

  const loadVisitSlots = async () => {
    setLoadingVisits(true);
    try {
      const data = await visitSlotsAPI.getByListing(listingId);
      setVisitSlots(data.data || []);
    } catch (error) {
      console.error('Erreur chargement créneaux:', error);
    } finally {
      setLoadingVisits(false);
    }
  };

  const loadAvailability = async () => {
    setLoadingAvailability(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const data = await availabilityAPI.getCalendar(listingId, year, month);
      const availMap = {};
      (data.data || data || []).forEach(item => {
        availMap[item.date] = item.isAvailable;
      });
      setAvailability(availMap);
    } catch (error) {
      console.error('Erreur chargement disponibilités:', error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Grouper les créneaux de visite par date
  const slotsByDate = visitSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      days.push({
        day,
        date,
        dateStr,
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today,
        hasVisitSlots: slotsByDate[dateStr]?.length > 0,
        isAvailableForRental: availability[dateStr] !== false,
        isSelected: selectedStartDate && selectedEndDate && 
          date >= selectedStartDate && date <= selectedEndDate,
        isStartDate: selectedStartDate?.toDateString() === date.toDateString(),
        isEndDate: selectedEndDate?.toDateString() === date.toDateString(),
      });
    }
    
    return days;
  };

  const handleDateClick = (dayInfo) => {
    if (!dayInfo || dayInfo.isPast) return;

    if (activeTab === 'visit') {
      if (!dayInfo.hasVisitSlots) return;
      setSelectedDate(dayInfo);
      setSelectedSlot(null);
    } else {
      // Location - gestion des dates de début/fin
      if (onDateSelect) {
        // Si pas de date de début ou si on a déjà les deux dates, on recommence
        if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
          onDateSelect(dayInfo.date, null);
        } 
        // Si on a une date de début, on définit la date de fin
        else if (selectedStartDate && !selectedEndDate) {
          // Si la date cliquée est avant la date de début, on inverse
          if (dayInfo.date < selectedStartDate) {
            onDateSelect(dayInfo.date, selectedStartDate);
          } else {
            onDateSelect(selectedStartDate, dayInfo.date);
          }
        }
      }
    }
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
      loadVisitSlots();
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
  const loading = activeTab === 'visit' ? loadingVisits : loadingAvailability;
  const hasVisitSlots = visitSlots.length > 0;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
      {/* Onglets */}
      <div className="flex border-b border-white/10">
        {showRentalTab && (
          <button
            onClick={() => handleTabChange('rental')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-medium transition-all ${
              activeTab === 'rental'
                ? 'bg-orange-500/20 text-orange-400 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Réserver</span>
          </button>
        )}
        {hasVisitSlots && (
          <button
            onClick={() => handleTabChange('visit')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-medium transition-all ${
              activeTab === 'visit'
                ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Eye className="w-5 h-5" />
            <span>Visite guidée</span>
          </button>
        )}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
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
              {calendarDays.map((dayInfo, index) => {
                const isClickable = dayInfo && !dayInfo.isPast && (
                  activeTab === 'rental' 
                    ? dayInfo.isAvailableForRental 
                    : dayInfo.hasVisitSlots
                );

                const isHighlighted = activeTab === 'visit' 
                  ? dayInfo?.hasVisitSlots 
                  : dayInfo?.isAvailableForRental;

                const highlightColor = activeTab === 'visit' ? 'blue' : 'orange';

                return (
                  <div
                    key={index}
                    onClick={() => isClickable && handleDateClick(dayInfo)}
                    className={`
                      aspect-square rounded-lg text-sm font-medium transition-all flex flex-col items-center justify-center relative
                      ${!dayInfo ? 'invisible' : ''}
                      ${dayInfo?.isPast ? 'opacity-30 cursor-not-allowed text-gray-500' : ''}
                      ${isClickable ? 'cursor-pointer' : ''}
                      ${isHighlighted && !dayInfo?.isPast
                        ? `bg-${highlightColor}-500/20 hover:bg-${highlightColor}-500/40 text-white border border-${highlightColor}-500/50`
                        : 'text-gray-400'
                      }
                      ${activeTab === 'visit' && dayInfo?.hasVisitSlots && !dayInfo?.isPast
                        ? 'bg-blue-500/20 hover:bg-blue-500/40 text-white border border-blue-500/50'
                        : ''
                      }
                      ${activeTab === 'rental' && dayInfo?.isAvailableForRental && !dayInfo?.isPast
                        ? 'hover:bg-orange-500/20 text-white'
                        : ''
                      }
                      ${dayInfo?.isToday ? 'ring-2 ring-orange-400' : ''}
                      ${dayInfo?.isSelected ? 'bg-orange-500/30' : ''}
                      ${dayInfo?.isStartDate || dayInfo?.isEndDate ? 'bg-orange-500 text-white' : ''}
                      ${selectedDate?.dateStr === dayInfo?.dateStr ? 'bg-blue-500 text-white' : ''}
                    `}
                  >
                    {dayInfo?.day}
                    {activeTab === 'visit' && dayInfo?.hasVisitSlots && !dayInfo?.isPast && (
                      <div className="absolute bottom-1 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Légende */}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
              {activeTab === 'visit' ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/50 rounded"></div>
                    <span>Visite disponible</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span>Sélectionné</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-500/50 rounded"></div>
                    <span>Indisponible</span>
                  </div>
                </>
              )}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-orange-400 rounded"></div>
                <span>Aujourd'hui</span>
              </div>
            </div>

            {/* Créneaux de visite pour la date sélectionnée */}
            <AnimatePresence mode="wait">
              {activeTab === 'visit' && selectedDate && slotsByDate[selectedDate.dateStr] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border-t border-white/10 pt-4 mt-4"
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
                        className="p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-xl text-white transition-all flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Clock className="w-4 h-4 text-blue-400" />
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
          </>
        )}
      </div>

      {/* Modal de réservation de visite */}
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
              
              <div className="bg-blue-500/10 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
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
                  <Clock className="w-5 h-5 text-blue-400" />
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
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    Message (optionnel)
                  </label>
                  <textarea
                    value={bookingData.message}
                    onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                    placeholder="Présentez-vous, posez vos questions..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
