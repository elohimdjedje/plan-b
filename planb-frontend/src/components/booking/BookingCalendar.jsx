import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { availabilityAPI } from '../../api/availability';
import { formatPrice } from '../../utils/format';

/**
 * Calendrier de réservation avec disponibilité
 */
export default function BookingCalendar({ listingId, onDateSelect, selectedStartDate, selectedEndDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailability();
  }, [listingId, currentMonth]);

  const loadAvailability = async () => {
    if (!listingId) return;
    
    setLoading(true);
    try {
      const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const data = await availabilityAPI.get(
        listingId,
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      );
      
      setAvailableDates(data.data?.available_dates || []);
      setBlockedDates(data.data?.blocked_dates || []);
    } catch (error) {
      console.error('Erreur chargement disponibilité:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDateAvailable = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availableDates.includes(dateStr) && !blockedDates.includes(dateStr);
  };

  const isDateSelected = (date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const dateStr = date.toISOString().split('T')[0];
    const startStr = selectedStartDate.toISOString().split('T')[0];
    const endStr = selectedEndDate.toISOString().split('T')[0];
    return dateStr >= startStr && dateStr <= endStr;
  };

  const isDateInRange = (date) => {
    if (!selectedStartDate || selectedEndDate) return false;
    const dateStr = date.toISOString().split('T')[0];
    const startStr = selectedStartDate.toISOString().split('T')[0];
    return dateStr >= startStr && !selectedEndDate;
  };

  const handleDateClick = (date) => {
    if (!isDateAvailable(date)) return;
    
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Nouvelle sélection
      onDateSelect(date, null);
    } else if (selectedStartDate && !selectedEndDate) {
      // Sélection de la date de fin
      if (date > selectedStartDate) {
        onDateSelect(selectedStartDate, date);
      } else {
        onDateSelect(date, null);
      }
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <h3 className="text-xl font-bold text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-white py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {getDaysInMonth().map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const available = isDateAvailable(date);
          const selected = isDateSelected(date);
          const inRange = isDateInRange(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <motion.button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={!available}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center
                ${available 
                  ? 'hover:bg-orange-500/20 cursor-pointer text-white' 
                  : 'opacity-50 cursor-not-allowed bg-gray-500/20 text-gray-400'
                }
                ${selected ? 'bg-orange-500 text-white' : ''}
                ${inRange ? 'bg-orange-500/30 text-white' : ''}
                ${isToday ? 'ring-2 ring-orange-400' : ''}
              `}
              whileHover={available ? { scale: 1.05 } : {}}
              whileTap={available ? { scale: 0.95 } : {}}
            >
              {date.getDate()}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-4 text-sm text-white">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-gray-200">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500/50 rounded border border-gray-400"></div>
          <span className="text-gray-200">Indisponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 ring-2 ring-orange-400 rounded"></div>
          <span className="text-gray-200">Aujourd'hui</span>
        </div>
      </div>
    </div>
  );
}
