import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Filter, Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import BookingCard from '../components/booking/BookingCard';
import Button from '../components/common/Button';
import { bookingsAPI } from '../api/bookings';
import { useAuthStore } from '../store/authStore';

/**
 * Page de mes réservations
 */
export default function MyBookings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, owner, tenant
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const role = filter === 'all' ? null : filter;
      const data = await bookingsAPI.list(role);
      setBookings(data.data || []);
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
      toast.error('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true;
    return booking.status === statusFilter;
  });

  const statusOptions = [
    { value: 'all', label: 'Toutes' },
    { value: 'pending', label: 'En attente' },
    { value: 'accepted', label: 'Acceptées' },
    { value: 'confirmed', label: 'Confirmées' },
    { value: 'active', label: 'Actives' },
    { value: 'completed', label: 'Terminées' },
    { value: 'cancelled', label: 'Annulées' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mes réservations</h1>
          <p className="text-gray-400">Gérez vos réservations en tant que propriétaire ou locataire</p>
        </div>

        {/* Filtres */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Rôle */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Rôle
              </label>
              <div className="flex gap-2">
                {['all', 'owner', 'tenant'].map(role => (
                  <button
                    key={role}
                    onClick={() => setFilter(role)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === role
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {role === 'all' && 'Toutes'}
                    {role === 'owner' && 'Propriétaire'}
                    {role === 'tenant' && 'Locataire'}
                  </button>
                ))}
              </div>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des réservations */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold mb-2">Aucune réservation</h3>
            <p className="text-gray-400 mb-6">
              {filter === 'all' 
                ? 'Vous n\'avez aucune réservation pour le moment'
                : `Vous n'avez aucune réservation en tant que ${filter === 'owner' ? 'propriétaire' : 'locataire'}`
              }
            </p>
            <Button onClick={() => navigate('/')}>
              <Plus className="w-4 h-4 mr-2" />
              Explorer les annonces
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onAction={(booking) => navigate(`/bookings/${booking.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
