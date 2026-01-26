import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Edit2, Users, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';
import { visitSlotsAPI } from '../../api/visitSlots';
import { listingsAPI } from '../../api/listings';

/**
 * Gestionnaire de disponibilités pour les visites
 */
export default function AvailabilityManager() {
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState({
    listingId: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
    isRecurring: false,
    recurringPattern: 'weekly',
    recurringWeeks: 4,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [slotsData, listingsData] = await Promise.all([
        visitSlotsAPI.getMySlots(),
        listingsAPI.getMyListings(),
      ]);
      setSlots(slotsData.data || []);
      setStats(slotsData.stats);
      // Gérer les différentes structures de réponse possibles
      const listingsArray = Array.isArray(listingsData) 
        ? listingsData 
        : (listingsData?.data || listingsData?.listings || []);
      setListings(Array.isArray(listingsArray) ? listingsArray : []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.listingId || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (editingSlot) {
        await visitSlotsAPI.update(editingSlot.id, formData);
        toast.success('Créneau mis à jour');
      } else {
        const result = await visitSlotsAPI.create(formData);
        if (result.recurringCreated > 0) {
          toast.success(`Créneau créé + ${result.recurringCreated} créneaux récurrents`);
        } else {
          toast.success('Créneau créé');
        }
      }
      setShowForm(false);
      setEditingSlot(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce créneau ?')) return;
    
    try {
      await visitSlotsAPI.delete(id);
      toast.success('Créneau supprimé');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleComplete = async (id) => {
    try {
      await visitSlotsAPI.complete(id);
      toast.success('Visite marquée comme complétée');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Annuler cette réservation ?')) return;
    
    try {
      await visitSlotsAPI.cancel(id);
      toast.success('Réservation annulée');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur');
    }
  };

  const resetForm = () => {
    setFormData({
      listingId: listings[0]?.id || '',
      date: '',
      startTime: '09:00',
      endTime: '10:00',
      notes: '',
      isRecurring: false,
      recurringPattern: 'weekly',
      recurringWeeks: 4,
    });
  };

  const startEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      listingId: slot.listingId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      notes: slot.notes || '',
      isRecurring: slot.isRecurring,
      recurringPattern: slot.recurringPattern || 'weekly',
      recurringWeeks: 4,
    });
    setShowForm(true);
  };

  const filteredSlots = slots.filter(slot => {
    if (filter === 'all') return true;
    return slot.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      available: { color: 'bg-green-500/20 text-green-400', label: 'Disponible' },
      booked: { color: 'bg-blue-500/20 text-blue-400', label: 'Réservé' },
      completed: { color: 'bg-gray-500/20 text-gray-400', label: 'Terminé' },
      cancelled: { color: 'bg-red-500/20 text-red-400', label: 'Annulé' },
    };
    const badge = badges[status] || badges.available;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-500/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.available}</div>
            <div className="text-sm text-gray-400">Disponibles</div>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.booked}</div>
            <div className="text-sm text-gray-400">Réservés</div>
          </div>
          <div className="bg-gray-500/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">{stats.completed}</div>
            <div className="text-sm text-gray-400">Terminés</div>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{stats.total}</div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {['all', 'available', 'booked', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === f
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'available' ? 'Disponibles' : f === 'booked' ? 'Réservés' : 'Terminés'}
            </button>
          ))}
        </div>
        
        <Button
          onClick={() => {
            setEditingSlot(null);
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter un créneau
        </Button>
      </div>

      {/* Formulaire */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 rounded-xl p-6 border border-white/10"
          >
            <h3 className="text-lg font-semibold mb-4 text-white">
              {editingSlot ? 'Modifier le créneau' : 'Nouveau créneau de visite'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Annonce *
                  </label>
                  <select
                    value={formData.listingId}
                    onChange={(e) => setFormData({ ...formData, listingId: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                    required
                  >
                    <option value="">Sélectionner une annonce</option>
                    {listings.map((listing) => (
                      <option key={listing.id} value={listing.id} className="bg-gray-800">
                        {listing.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Heure de début *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Heure de fin *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notes (optionnel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informations supplémentaires pour le visiteur..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                  rows={2}
                />
              </div>

              {!editingSlot && (
                <div className="bg-white/5 rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <div className="flex items-center gap-2 text-white">
                      <RefreshCw className="w-4 h-4" />
                      Créneau récurrent
                    </div>
                  </label>

                  {formData.isRecurring && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Fréquence</label>
                        <select
                          value={formData.recurringPattern}
                          onChange={(e) => setFormData({ ...formData, recurringPattern: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white"
                        >
                          <option value="weekly" className="bg-gray-800">Chaque semaine</option>
                          <option value="biweekly" className="bg-gray-800">Toutes les 2 semaines</option>
                          <option value="monthly" className="bg-gray-800">Chaque mois</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Nombre de répétitions</label>
                        <input
                          type="number"
                          value={formData.recurringWeeks}
                          onChange={(e) => setFormData({ ...formData, recurringWeeks: parseInt(e.target.value) })}
                          min={1}
                          max={12}
                          className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit">
                  {editingSlot ? 'Mettre à jour' : 'Créer le créneau'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSlot(null);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des créneaux */}
      {filteredSlots.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun créneau {filter !== 'all' ? `${filter}` : ''}</p>
          <p className="text-sm mt-2">Créez des créneaux pour permettre aux visiteurs de réserver une visite</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSlots.map((slot) => (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-white">{slot.listingTitle}</h4>
                    {getStatusBadge(slot.status)}
                    {slot.isRecurring && (
                      <span className="flex items-center gap-1 text-xs text-purple-400">
                        <RefreshCw className="w-3 h-3" />
                        Récurrent
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(slot.date).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>

                  {slot.bookedBy && (
                    <div className="mt-3 bg-blue-500/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">Réservé par {slot.bookedBy.name}</span>
                      </div>
                      {slot.bookedBy.phone && (
                        <p className="text-sm text-gray-400 mt-1">📞 {slot.bookedBy.phone}</p>
                      )}
                      {slot.visitorMessage && (
                        <p className="text-sm text-gray-300 mt-2 italic">"{slot.visitorMessage}"</p>
                      )}
                    </div>
                  )}

                  {slot.notes && (
                    <p className="text-sm text-gray-400 mt-2">{slot.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {slot.status === 'available' && (
                    <>
                      <button
                        onClick={() => startEdit(slot)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  
                  {slot.status === 'booked' && (
                    <>
                      <button
                        onClick={() => handleComplete(slot.id)}
                        className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Marquer comme terminé"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCancel(slot.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Annuler"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
