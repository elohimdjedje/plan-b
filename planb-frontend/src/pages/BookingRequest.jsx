import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, DollarSign, AlertCircle, CheckCircle2, 
  Home, Car, Building2, Eye, Clock, Phone, MessageSquare, 
  ChevronLeft, ChevronRight, Loader2, Check, X, Star,
  Users, BedDouble, Lock, Send, Heart, Share2, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Button from '../components/common/Button';
import { bookingsAPI } from '../api/bookings';
import { listingsAPI } from '../api/listings';
import { visitSlotsAPI } from '../api/visitSlots';
import { roomsAPI } from '../api/rooms';
import { offersAPI } from '../api/offers';
import { formatPrice } from '../utils/format';
import { useAuthStore } from '../store/authStore';
import { getImageUrl } from '../utils/images';

/**
 * Page de réservation complète - Adapte l'interface selon le type de bien
 * - Vente (maison, voiture, terrain) → Visite + Offre + Réservation acompte
 * - Location (appartement, résidence) → Calendrier période
 * - Hôtel → Sélection chambre + période
 */
export default function BookingRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // États généraux
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // États pour location par période
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [amounts, setAmounts] = useState(null);
  const [availability, setAvailability] = useState(null);
  
  // États pour visites
  const [visitSlots, setVisitSlots] = useState([]);
  const [selectedVisitDate, setSelectedVisitDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // États pour hôtels
  const [rooms, setRooms] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // États pour offres (vente)
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerData, setOfferData] = useState({ amount: '', message: '', phone: '' });
  
  // États formulaire
  const [bookingData, setBookingData] = useState({ message: '', phone: '' });
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Déterminer le type de réservation
  const bookingType = useMemo(() => {
    if (!listing) return 'period';
    const { category, subcategory, type } = listing;
    
    // Biens en VENTE → Visite + Offre
    if (type === 'vente') return 'sale';
    
    // Hôtels → Chambres
    if (subcategory === 'hotel') return 'hotel';
    
    // Immobilier location (appartement, villa) → Visites + Location
    if (category === 'immobilier' && ['appartement', 'villa', 'maison', 'studio'].includes(subcategory)) {
      return 'rental';
    }
    
    // Résidences meublées, voitures en location → Période
    return 'period';
  }, [listing]);

  useEffect(() => {
    loadListing();
  }, [id]);

  useEffect(() => {
    if (listing) loadAdditionalData();
  }, [listing, bookingType]);

  useEffect(() => {
    if (startDate && endDate && listing && bookingType !== 'sale') {
      checkPeriodAvailability();
    }
  }, [startDate, endDate, listing]);

  const loadListing = async () => {
    try {
      const data = await listingsAPI.getListing(id);
      setListing(data.data || data);
    } catch (error) {
      console.error('Erreur chargement annonce:', error);
      toast.error('Erreur lors du chargement de l\'annonce');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const loadAdditionalData = async () => {
    try {
      // Charger les créneaux de visite pour vente et immobilier
      if (bookingType === 'sale' || bookingType === 'rental') {
        const slotsData = await visitSlotsAPI.getByListing(listing.id);
        setVisitSlots(slotsData.data || []);
      }
      
      // Charger les chambres pour hôtels
      if (bookingType === 'hotel') {
        const roomsData = await roomsAPI.getByListing(listing.id);
        setRooms(roomsData.data || []);
        if (roomsData.data?.length > 0) {
          setSelectedRoomType(roomsData.data[0].type);
        }
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

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
      console.error('Erreur vérification:', error);
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
    for (let i = 0; i < startOffset; i++) days.push(null);

    // Grouper créneaux par date
    const slotsByDate = {};
    visitSlots.forEach(slot => {
      if (slot.status === 'available') {
        if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
        slotsByDate[slot.date].push(slot);
      }
    });

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        day, date, dateStr,
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

  const handleDateClick = (dayInfo) => {
    if (!dayInfo || dayInfo.isPast) return;

    if (bookingType === 'sale') {
      // Pour vente: sélection créneau visite
      if (dayInfo.hasVisitSlots) {
        setSelectedVisitDate(dayInfo);
        setSelectedSlot(null);
      }
    } else {
      // Pour location: sélection période
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

  // Réserver visite
  const handleVisitBooking = async () => {
    if (!user) { toast.error('Connectez-vous pour réserver'); return; }
    if (user.id === listing.user?.id) { toast.error('Vous ne pouvez pas réserver votre propre bien'); return; }

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
      loadAdditionalData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  // Envoyer offre d'achat
  const handleOfferSubmit = async () => {
    if (!user) { toast.error('Connectez-vous pour faire une offre'); return; }
    if (!offerData.amount) { toast.error('Entrez un montant'); return; }

    setSubmitting(true);
    try {
      await offersAPI.create(listing.id, offerData.amount, offerData.message, offerData.phone);
      toast.success('Offre envoyée avec succès !');
      setShowOfferModal(false);
      setOfferData({ amount: '', message: '', phone: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  };

  // Réserver location
  const handlePeriodBooking = async () => {
    if (!user) { toast.error('Connectez-vous pour réserver'); return; }
    if (!availability?.available) { toast.error('Période non disponible'); return; }

    setSubmitting(true);
    try {
      const result = await bookingsAPI.create(
        listing.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        bookingData.message
      );
      toast.success('Demande envoyée !');
      navigate(`/bookings/${result.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const isOwner = user?.id === listing?.user?.id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!listing) return null;

  const statusBadge = {
    sold: { color: 'bg-red-500', text: '🔴 Vendu' },
    reserved: { color: 'bg-blue-500', text: '🔵 Réservé' },
    negotiation: { color: 'bg-yellow-500', text: '🟡 En négociation' },
    active: { color: 'bg-green-500', text: '🟢 Disponible' }
  }[listing.status] || { color: 'bg-green-500', text: '🟢 Disponible' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white/10 rounded-lg"><Share2 className="w-5 h-5 text-gray-400" /></button>
            <button className="p-2 hover:bg-white/10 rounded-lg"><Heart className="w-5 h-5 text-gray-400" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne principale - Calendrier */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte annonce */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
              
              {/* En-tête avec type */}
              <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                      {bookingType === 'sale' ? <Home className="w-6 h-6 text-white" /> :
                       bookingType === 'hotel' ? <Building2 className="w-6 h-6 text-white" /> :
                       <Calendar className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-lg">
                        {bookingType === 'sale' ? 'Réserver / Faire une offre' :
                         bookingType === 'hotel' ? 'Réserver une chambre' : 'Réserver'}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {bookingType === 'sale' ? 'Visite, offre d\'achat ou réservation' :
                         bookingType === 'hotel' ? 'Choisissez une chambre et vos dates' :
                         'Choisissez vos dates de séjour'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${statusBadge.color}`}>
                    {statusBadge.text}
                  </span>
                </div>
              </div>

              {/* Onglets chambres pour hôtels */}
              {bookingType === 'hotel' && rooms.length > 0 && (
                <div className="flex overflow-x-auto border-b border-white/10">
                  {rooms.map(roomType => (
                    <button key={roomType.type}
                      onClick={() => { setSelectedRoomType(roomType.type); setSelectedRoom(null); }}
                      className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-all ${
                        selectedRoomType === roomType.type
                          ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}>
                      <span>{roomType.typeLabel}</span>
                      <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs">{roomType.count}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Liste des chambres pour hôtels */}
              {bookingType === 'hotel' && selectedRoomType && (
                <div className="p-4 border-b border-white/10 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {rooms.find(r => r.type === selectedRoomType)?.rooms.map(room => (
                      <button key={room.id} onClick={() => setSelectedRoom(room)}
                        className={`p-3 rounded-lg text-left transition-all ${
                          selectedRoom?.id === room.id
                            ? 'bg-blue-500/20 border-2 border-blue-500'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white">N° {room.number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Users className="w-3 h-3" /><span>{room.capacity} pers.</span>
                          <BedDouble className="w-3 h-3 ml-2" /><span>{room.beds} lit(s)</span>
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
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-white/10 rounded-lg"><ChevronLeft className="w-5 h-5 text-gray-400" /></button>
                  <h3 className="font-semibold text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-white/10 rounded-lg"><ChevronRight className="w-5 h-5 text-gray-400" /></button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                    <div key={day} className="text-center text-xs text-gray-500 py-2">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((dayInfo, index) => (
                    <button key={index}
                      disabled={!dayInfo || dayInfo.isPast || (bookingType === 'sale' && !dayInfo.hasVisitSlots)}
                      onClick={() => handleDateClick(dayInfo)}
                      className={`
                        aspect-square p-1 rounded-lg text-sm font-medium transition-all relative
                        ${!dayInfo ? 'invisible' : ''}
                        ${dayInfo?.isPast ? 'text-gray-600 cursor-not-allowed' : ''}
                        ${dayInfo?.isToday ? 'ring-2 ring-orange-500' : ''}
                        ${dayInfo?.isSelected ? 'bg-orange-500/30' : ''}
                        ${dayInfo?.isStartDate || dayInfo?.isEndDate ? 'bg-orange-500 text-white' : ''}
                        ${bookingType === 'sale' && dayInfo?.hasVisitSlots && !dayInfo?.isPast 
                          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 cursor-pointer' : ''}
                        ${bookingType !== 'sale' && dayInfo && !dayInfo.isPast && !dayInfo.isSelected
                          ? 'hover:bg-white/10 text-gray-300 cursor-pointer' : ''}
                        ${selectedVisitDate?.dateStr === dayInfo?.dateStr ? 'ring-2 ring-blue-500' : ''}
                      `}>
                      {dayInfo?.day}
                      {bookingType === 'sale' && dayInfo?.hasVisitSlots && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Légende */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10 text-xs">
                  {bookingType === 'sale' ? (
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-500/30 rounded" />
                      <span className="text-gray-400">Visite disponible</span>
                    </div>
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

              {/* Créneaux visite sélectionnés */}
              {bookingType === 'sale' && selectedVisitDate && (
                <div className="p-4 border-t border-white/10 bg-white/5">
                  <h4 className="font-medium text-white mb-3">
                    Créneaux du {new Date(selectedVisitDate.dateStr).toLocaleDateString('fr-FR', { 
                      weekday: 'long', day: 'numeric', month: 'long' 
                    })}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVisitDate.visitSlots.map(slot => (
                      <button key={slot.id}
                        onClick={() => { setSelectedSlot(slot); setShowBookingModal(true); }}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                          selectedSlot?.id === slot.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}>
                        <Clock className="w-4 h-4" />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Résumé période sélectionnée (location) */}
              {bookingType !== 'sale' && startDate && endDate && (
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

                  <button onClick={handlePeriodBooking}
                    disabled={!availability?.available || submitting}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Demander une réservation'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Colonne latérale - Info vendeur + Actions */}
          <div className="space-y-4">
            {/* Carte vendeur */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {listing.user?.firstName?.[0]}{listing.user?.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{listing.user?.firstName} {listing.user?.lastName}</h3>
                  {listing.user?.isPro && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                      <Star className="w-3 h-3" /> Pro
                    </span>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Résumé annonce */}
              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-white text-sm mb-1 line-clamp-2">{listing.title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span>{listing.commune}, {listing.city}</span>
                </div>
                <p className="text-orange-400 font-bold mt-2">
                  {formatPrice(listing.price)} {listing.currency}
                  {listing.type === 'location' && <span className="text-sm font-normal text-gray-400">/{listing.priceUnit}</span>}
                </p>
              </div>

              {/* Boutons actions pour VENTE */}
              {bookingType === 'sale' && !isOwner && (
                <div className="space-y-2">
                  <button onClick={() => setShowOfferModal(true)}
                    disabled={listing.status === 'sold'}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                    <DollarSign className="w-5 h-5" /> Faire une offre
                  </button>
                  <button disabled={listing.status === 'sold' || listing.status === 'reserved'}
                    className="w-full py-3 bg-purple-500/20 hover:bg-purple-500/30 disabled:bg-gray-600/20 border border-purple-500/30 text-purple-400 disabled:text-gray-500 font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5" /> Réserver avec acompte
                  </button>
                </div>
              )}
            </motion.div>

            {/* Info sécurité */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" /> Achetez en toute sécurité
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-400">
                  <Check className="w-4 h-4 text-green-400" /> Vendeurs vérifiés
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Check className="w-4 h-4 text-green-400" /> Échangez via la messagerie
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Check className="w-4 h-4 text-green-400" /> Signalez les annonces suspectes
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal Visite */}
      <AnimatePresence>
        {showBookingModal && selectedSlot && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBookingModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-secondary-800 rounded-2xl p-6 w-full max-w-md border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">📅 Réserver cette visite</h3>
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <p className="text-gray-400 text-sm">Créneau</p>
                <p className="text-white font-medium">
                  {new Date(selectedSlot.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="text-orange-400">{selectedSlot.startTime} - {selectedSlot.endTime}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Téléphone</label>
                  <input type="tel" value={bookingData.phone}
                    onChange={e => setBookingData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="07 00 00 00 00"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Message</label>
                  <textarea value={bookingData.message}
                    onChange={e => setBookingData(p => ({ ...p, message: e.target.value }))}
                    placeholder="Message pour le vendeur..." rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl">Annuler</button>
                <button onClick={handleVisitBooking} disabled={submitting}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Confirmer</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Offre */}
      <AnimatePresence>
        {showOfferModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOfferModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-secondary-800 rounded-2xl p-6 w-full max-w-md border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">💰 Faire une offre</h3>
                <button onClick={() => setShowOfferModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <p className="text-gray-400 text-sm">Prix demandé</p>
                <p className="text-2xl font-bold text-orange-400">{formatPrice(listing.price)} {listing.currency}</p>
                <p className="text-gray-500 text-sm mt-1">{listing.title}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Votre offre (XOF) *</label>
                  <input type="number" value={offerData.amount}
                    onChange={e => setOfferData(p => ({ ...p, amount: e.target.value }))}
                    placeholder="Ex: 120000000" required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500" />
                  {offerData.amount && (
                    <p className="text-sm text-gray-400 mt-1">
                      = {parseInt(offerData.amount).toLocaleString()} XOF
                      <span className={`ml-2 ${parseFloat(offerData.amount) < parseFloat(listing.price) ? 'text-red-400' : 'text-green-400'}`}>
                        ({((parseFloat(offerData.amount) / parseFloat(listing.price)) * 100 - 100).toFixed(1)}%)
                      </span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Téléphone</label>
                  <input type="tel" value={offerData.phone}
                    onChange={e => setOfferData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="07 00 00 00 00"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Message</label>
                  <textarea value={offerData.message}
                    onChange={e => setOfferData(p => ({ ...p, message: e.target.value }))}
                    placeholder="Message pour le vendeur..." rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowOfferModal(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl">Annuler</button>
                <button onClick={handleOfferSubmit} disabled={submitting || !offerData.amount}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Envoyer</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
