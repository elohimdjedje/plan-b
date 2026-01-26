import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, DollarSign, User, FileText, CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Button from '../components/common/Button';
import PaymentForm from '../components/booking/PaymentForm';
import ReceiptViewer from '../components/booking/ReceiptViewer';
import { bookingsAPI } from '../api/bookings';
import { paymentsAPI } from '../api/payments';
import { formatPrice } from '../utils/format';
import { useAuthStore } from '../store/authStore';

/**
 * Page de détail d'une réservation
 */
export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showReceipts, setShowReceipts] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    loadBooking();
    loadPayments();
  }, [id]);

  const loadBooking = async () => {
    try {
      const data = await bookingsAPI.get(id);
      setBooking(data.data);
    } catch (error) {
      console.error('Erreur chargement réservation:', error);
      toast.error('Erreur lors du chargement de la réservation');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const data = await paymentsAPI.list(id);
      setPayments(data.data || []);
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
    }
  };

  const handleAccept = async () => {
    if (!confirm('Êtes-vous sûr de vouloir accepter cette réservation ?')) return;
    
    try {
      await bookingsAPI.accept(id);
      toast.success('Réservation acceptée');
      loadBooking();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'acceptation');
    }
  };

  const handleReject = async () => {
    const reason = prompt('Raison du refus (optionnel):');
    if (reason === null) return;
    
    try {
      await bookingsAPI.reject(id, reason || null);
      toast.success('Réservation refusée');
      loadBooking();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors du refus');
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    loadBooking();
    loadPayments();
  };

  const isOwner = booking && user && booking.owner_id === user.id;
  const isTenant = booking && user && booking.tenant_id === user.id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <h1 className="text-3xl font-bold mb-2">Réservation #{booking.id}</h1>
          <p className="text-gray-400">{booking.listing_title}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {['details', 'payments', 'receipts'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-orange-400 border-b-2 border-orange-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'details' && 'Détails'}
              {tab === 'payments' && 'Paiements'}
              {tab === 'receipts' && 'Quittances'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'details' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 space-y-6"
          >
            {/* Statut */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Statut</h2>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  booking.status === 'confirmed' || booking.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : booking.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {booking.status === 'confirmed' && <CheckCircle2 className="w-4 h-4" />}
                  {booking.status === 'rejected' && <XCircle className="w-4 h-4" />}
                  {booking.status}
                </div>
              </div>

              {/* Actions propriétaire */}
              {isOwner && booking.status === 'pending' && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReject}>
                    Refuser
                  </Button>
                  <Button onClick={handleAccept}>
                    Accepter
                  </Button>
                </div>
              )}
            </div>

            {/* Informations */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Période</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  <span>
                    {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {booking.duration_days} jours
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Montants</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total</span>
                    <span className="font-semibold text-orange-400">{formatPrice(booking.total_amount)} XOF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Caution</span>
                    <span>{formatPrice(booking.deposit_amount)} XOF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Loyer mensuel</span>
                    <span>{formatPrice(booking.monthly_rent)} XOF</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Paiements */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Paiements</h3>
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Caution</span>
                  <span className={booking.deposit_paid ? 'text-green-400' : 'text-yellow-400'}>
                    {booking.deposit_paid ? '✓ Payée' : 'En attente'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">1er Loyer</span>
                  <span className={booking.first_rent_paid ? 'text-green-400' : 'text-yellow-400'}>
                    {booking.first_rent_paid ? '✓ Payé' : 'En attente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions locataire */}
            {isTenant && !booking.deposit_paid && (
              <Button onClick={() => setShowPaymentForm(true)} className="w-full">
                <CreditCard className="w-4 h-4 mr-2" />
                Payer la caution et le premier loyer
              </Button>
            )}
          </motion.div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Paiements</h2>
              {isTenant && (
                <Button onClick={() => setShowPaymentForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau paiement
                </Button>
              )}
            </div>
            {/* Liste des paiements */}
            <div className="space-y-3">
              {payments.map(payment => (
                <div key={payment.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{payment.type}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatPrice(payment.amount)} XOF</div>
                      <div className={`text-sm ${
                        payment.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {payment.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'receipts' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold mb-4">Quittances</h2>
            <ReceiptViewer bookingId={id} />
          </div>
        )}

        {/* Modals */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-semibold mb-4">Paiement</h3>
              <PaymentForm
                booking={booking}
                onPaymentSuccess={handlePaymentSuccess}
                onClose={() => setShowPaymentForm(false)}
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
