import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar, Home, Car, Building2, 
  Eye, Clock, Phone, MessageSquare, Check, X, Loader2, 
  BedDouble, Users, Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { visitSlotsAPI } from '../../api/visitSlots';
import { roomsAPI } from '../../api/rooms';
import { bookingsAPI } from '../../api/bookings';
import useAuthStore from '../../store/authStore';

/**
 * Calendrier intelligent adapté selon le type de bien
 * - Immobilier (appartement/villa) → Visites uniquement
 * - Vacances (résidence meublée) → Location par période
 * - Véhicules → Location par période
 * - Hôtels → Sélection chambre + période
 */
export default function SmartBookingCalendar({ 
  listing,
  onBookingRequest,
  className = ''
}) {
  const { user } = useAuthStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  // Dates sélectionnées pour location
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // Créneaux de visite (immobilier)
  const [visitSlots, setVisitSlots] = useState([]);
  const [selectedVisitDate, setSelectedVisitDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Chambres (hôtels)
  const [rooms, setRooms] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Disponibilités
  const [availability, setAvailability] = useState({});
  const [amounts, setAmounts] = useState(null);
  
  // Modal de réservation
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({ message: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  // Déterminer le type de réservation selon la catégorie
  const bookingType = useMemo(() => {
    if (!listing) return 'period';
    
    const { category, subcategory } = listing;
    
    // Immobilier (appartements, villas) → Visites
    if (category === 'immobilier' && ['appartement', 'villa', 'maison', 'studio'].includes(subcategory)) {
      return 'visit';
    }
    
    // Hôtels → Chambres
    if (subcategory === 'hotel') {
      return 'hotel';
    }
    
    // Résidences meublées, voitures → Location période
    return 'period';
  }, [listing]);

  // Charger les données selon le type
  useEffect(() => {
    if (!listing?.id) return;
    loadData();
  }, [listing?.id, bookingType]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (bookingType === 'visit') {
        const data = await visitSlotsAPI.getByListing(listing.id);
        setVisitSlots(data.data || []);
      } else if (bookingType === 'hotel') {
        const data = await roomsAPI.getByListing(listing.id);
        setRooms(data.data || []);
        if (data.data?.length > 0) {
          setSelectedRoomType(data.data[0].type);
        }
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier disponibilité quand période sélectionnée
  useEffect(() => {
    if (bookingType === 'period' && startDate && endDate) {
      checkPeriodAvailability();
    } else if (bookingType === 'hotel' && startDate && endDate && selectedRoom) {
      checkRoomAvailability();
    }
  }, [startDate, endDate, selectedRoom]);

  const checkPeriodAvailability = async () => {
    try {
      const data = await bookingsAPI.checkAvailability(
        listing.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setAmounts(data.amounts);
      setAvailability({ available: data.available });
    } catch (error) {
      console.error('Erreur vérification disponibilité:', error);
    }
  };

  const checkRoomAvailability = async () => {
    try {
      const data = await roomsAPI.checkAvailability(
        selectedRoom.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setAmounts(data.amounts);
      setAvailability({ available: data.available });
    } catch (error) {
      console.error('Erreur vérification chambre:', error);
    }
  };

  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    
    // Jours vides avant le 1er
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    // Grouper les créneaux par date
    const slotsByDate = {};
    visitSlots.forEach(slot => {
      if (slot.status === 'available') {
        if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
        slotsByDate[slot.date].push(slot);
      }
    });

    // Jours du mois
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      days.push({
        day,
        date,
        dateStr,
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today,
        hasVisitSlots: slotsByDate[dateStr]?.length > 0,
        visitSlots: slotsByDate[dateStr] || [],
        isSelected: startDate && endDate && date >= startDate && date <= endDate,
        isStartDate: startDate?.toDateString() === date.toDateString(),
        isEndDate: endDate?.toDateString() === date.toDateString(),
      });
    }
    
    return days;
  };

  // Gérer le clic sur une date
  const handleDateClick = (dayInfo) => {
    if (!dayInfo || dayInfo.isPast) return;

    if (bookingType === 'visit') {
      if (dayInfo.hasVisitSlots) {
        setSelectedVisitDate(dayInfo);
        setSelectedSlot(null);
      }
    } else {
      // Location par période
      if (!startDate || (startDate && endDate)) {
        setStartDate(dayInfo.date);
        setEndDate(null);
        setAmounts(null);
      } else if (startDate && !endDate) {
        if (dayInfo.date < startDate) {
          setEndDate(startDate);
          setStartDate(dayInfo.date);
        } else {
          setEndDate(dayInfo.date);
        }
      }
    }
  };

  // Réserver un créneau de visite
  const handleVisitBooking = async () => {
    if (!user) {
      toast.error('Connectez-vous pour réserver une visite');
      return;
    }

    if (user.id === listing.user?.id) {
      toast.error('Vous ne pouvez pas réserver votre propre bien');
      return;
    }

    setSubmitting(true);
    try {
      await visitSlotsAPI.book(selectedSlot.id, {
        message: bookingData.message,
        phone: bookingData.phone
      });
      toast.success('Visite réservée avec succès !');
      setShowBookingModal(false);
      setSelectedSlot(null);
      setSelectedVisitDate(null);
      setBookingData({ message: '', phone: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  // Demander une réservation de location
  const handlePeriodBooking = async () => {
    if (!user) {
      toast.error('Connectez-vous pour réserver');
      return;
    }

    if (user.id === listing.user?.id) {
      toast.error('Vous ne pouvez pas réserver votre propre bien');
      return;
    }

    if (!availability?.available) {
      toast.error('Cette période n\'est pas disponible');
      return;
    }

    setSubmitting(true);
    try {
      const result = await bookingsAPI.create(
        listing.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        bookingData.message
      );
      toast.success('Demande de réservation envoyée !');
      setShowBookingModal(false);
      if (onBookingRequest) onBookingRequest(result);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  // Icône selon le type
  const TypeIcon = bookingType === 'visit' ? Eye : bookingType === 'hotel' ? Building2 : Home;
  const typeLabel = bookingType === 'visit' ? 'Visite guidée' : 
                    bookingType === 'hotel' ? 'Réserver une chambre' : 'Réserver';

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden ${className}`}>
      {/* En-tête avec type */}
      <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <TypeIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{typeLabel}</h3>
            <p className="text-sm text-gray-400">
              {bookingType === 'visit' && 'Sélectionnez un créneau disponible'}
              {bookingType === 'period' && 'Choisissez vos dates de séjour'}
              {bookingType === 'hotel' && 'Choisissez une chambre et vos dates'}
            </p>
          </div>
        </div>
      </div>

      {/* Onglets pour hôtels (types de chambres) */}
      {bookingType === 'hotel' && rooms.length > 0 && (
        <div className="flex overflow-x-auto border-b border-white/10">
          {rooms.map(roomType => (
            <button
              key={roomType.type}
              onClick={() => {
                setSelectedRoomType(roomType.type);
                setSelectedRoom(null);
              }}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-all ${
                selectedRoomType === roomType.type
                  ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{roomType.typeLabel}</span>
              <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                {roomType.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Liste des chambres pour hôtels */}
      {bookingType === 'hotel' && selectedRoomType && (
        <div className="p-4 border-b border-white/10 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {rooms.find(r => r.type === selectedRoomType)?.rooms.map(room => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`p-3 rounded-lg text-left transition-all ${
                  selectedRoom?.id === room.id
                    ? 'bg-blue-500/20 border-2 border-blue-500'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white">N° {room.number}</span>
                  {room.status !== 'available' && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                      Indisponible
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Users className="w-3 h-3" />
                  <span>{room.capacity} pers.</span>
                  <BedDouble className="w-3 h-3 ml-2" />
                  <span>{room.beds} lit(s)</span>
                </div>
                <div className="mt-1 text-orange-400 font-semibold text-sm">
                  {parseInt(room.pricePerNight).toLocaleString()} XOF/nuit
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendrier */}
      <div className="p-4">
        {/* Navigation mois */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <h3 className="font-semibold text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div key={day} className="text-center text-xs text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayInfo, index) => (
              <button
                key={index}
                disabled={!dayInfo || dayInfo.isPast || (bookingType === 'visit' && !dayInfo.hasVisitSlots)}
                onClick={() => handleDateClick(dayInfo)}
                className={`
                  aspect-square p-1 rounded-lg text-sm font-medium transition-all relative
                  ${!dayInfo ? 'invisible' : ''}
                  ${dayInfo?.isPast ? 'text-gray-600 cursor-not-allowed' : ''}
                  ${dayInfo?.isToday ? 'ring-2 ring-orange-500' : ''}
                  ${dayInfo?.isSelected ? 'bg-orange-500/30' : ''}
                  ${dayInfo?.isStartDate || dayInfo?.isEndDate ? 'bg-orange-500 text-white' : ''}
                  ${bookingType === 'visit' && dayInfo?.hasVisitSlots && !dayInfo?.isPast 
                    ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 cursor-pointer' 
                    : ''}
                  ${bookingType !== 'visit' && dayInfo && !dayInfo.isPast && !dayInfo.isSelected
                    ? 'hover:bg-white/10 text-gray-300 cursor-pointer' 
                    : ''}
                  ${selectedVisitDate?.dateStr === dayInfo?.dateStr ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                {dayInfo?.day}
                {bookingType === 'visit' && dayInfo?.hasVisitSlots && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Légende */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10 text-xs">
          {bookingType === 'visit' ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500/30 rounded" />
                <span className="text-gray-400">Visite disponible</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded" />
                <span className="text-gray-400">Sélectionné</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 ring-2 ring-orange-500 rounded" />
                <span className="text-gray-400">Aujourd'hui</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Créneaux disponibles (visites) */}
      {bookingType === 'visit' && selectedVisitDate && (
        <div className="p-4 border-t border-white/10 bg-white/5">
          <h4 className="font-medium text-white mb-3">
            Créneaux du {new Date(selectedVisitDate.dateStr).toLocaleDateString('fr-FR', { 
              weekday: 'long', day: 'numeric', month: 'long' 
            })}
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedVisitDate.visitSlots.map(slot => (
              <button
                key={slot.id}
                onClick={() => {
                  setSelectedSlot(slot);
                  setShowBookingModal(true);
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  selectedSlot?.id === slot.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{slot.startTime} - {slot.endTime}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Résumé de réservation (location période) */}
      {bookingType !== 'visit' && startDate && endDate && (
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-400">Période sélectionnée</p>
              <p className="font-medium text-white">
                {startDate.toLocaleDateString('fr-FR')} → {endDate.toLocaleDateString('fr-FR')}
              </p>
              <p className="text-sm text-gray-400">
                {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} {bookingType === 'hotel' ? 'nuit(s)' : 'jour(s)'}
              </p>
            </div>
            {amounts && (
              <div className="text-right">
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-xl font-bold text-orange-400">
                  {parseInt(amounts.total_amount).toLocaleString()} XOF
                </p>
              </div>
            )}
          </div>
          
          {availability?.available === false && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg mb-3">
              <p className="text-red-400 text-sm">Cette période n'est pas disponible</p>
            </div>
          )}

          <button
            onClick={() => setShowBookingModal(true)}
            disabled={!availability?.available}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            Demander une réservation
          </button>
        </div>
      )}

      {/* Modal de réservation */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-secondary-800 rounded-2xl p-6 w-full max-w-md border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {bookingType === 'visit' ? 'Réserver cette visite' : 'Confirmer la réservation'}
              </h3>

              {/* Résumé */}
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                {bookingType === 'visit' && selectedSlot && (
                  <>
                    <p className="text-gray-400 text-sm">Créneau</p>
                    <p className="text-white font-medium">
                      {new Date(selectedSlot.date).toLocaleDateString('fr-FR', {
                        weekday: 'long', day: 'numeric', month: 'long'
                      })}
                    </p>
                    <p className="text-orange-400">{selectedSlot.startTime} - {selectedSlot.endTime}</p>
                  </>
                )}
                {bookingType !== 'visit' && (
                  <>
                    <p className="text-gray-400 text-sm">Période</p>
                    <p className="text-white font-medium">
                      {startDate?.toLocaleDateString('fr-FR')} → {endDate?.toLocaleDateString('fr-FR')}
                    </p>
                    {selectedRoom && (
                      <p className="text-blue-400 mt-1">Chambre N° {selectedRoom.number}</p>
                    )}
                    {amounts && (
                      <p className="text-orange-400 font-bold mt-2">
                        Total: {parseInt(amounts.total_amount).toLocaleString()} XOF
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Formulaire */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={e => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Ex: 07 00 00 00 00"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Message (optionnel)
                  </label>
                  <textarea
                    value={bookingData.message}
                    onChange={e => setBookingData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Ajoutez un message pour le propriétaire..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={bookingType === 'visit' ? handleVisitBooking : handlePeriodBooking}
                  disabled={submitting}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Confirmer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
