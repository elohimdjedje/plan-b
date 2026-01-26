import { useState } from 'react';
import { CreditCard, Smartphone, Wallet, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import { paymentsAPI } from '../../api/payments';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../../utils/format';

/**
 * Formulaire de paiement pour réservation
 */
export default function PaymentForm({ booking, onPaymentSuccess, onClose }) {
  const [paymentMethod, setPaymentMethod] = useState('wave');
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState('deposit'); // deposit, first_rent, monthly_rent

  const paymentMethods = [
    { id: 'wave', name: 'Wave', icon: Smartphone, color: 'bg-blue-500' },
    { id: 'orange_money', name: 'Orange Money', icon: Smartphone, color: 'bg-orange-500' },
    { id: 'card', name: 'Carte bancaire', icon: CreditCard, color: 'bg-purple-500' },
    { id: 'bank_transfer', name: 'Virement bancaire', icon: Wallet, color: 'bg-green-500' }
  ];

  const getPaymentAmount = () => {
    if (!booking) return 0;
    
    switch (paymentType) {
      case 'deposit':
        return parseFloat(booking.deposit_amount || 0);
      case 'first_rent':
        return parseFloat(booking.monthly_rent || 0);
      case 'monthly_rent':
        return parseFloat(booking.monthly_rent || 0);
      default:
        return 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking) return;

    setLoading(true);
    try {
      const result = await paymentsAPI.create(
        booking.id,
        paymentType,
        paymentMethod
      );

      if (result.data?.payment_url) {
        // Rediriger vers la page de paiement
        window.location.href = result.data.payment_url;
      } else {
        toast.success('Paiement initié avec succès');
        if (onPaymentSuccess) {
          onPaymentSuccess(result.data);
        }
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Erreur paiement:', error);
      toast.error(error.response?.data?.error || 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <div className="p-6 text-center text-gray-400">
        Aucune réservation sélectionnée
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type de paiement */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Type de paiement
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['deposit', 'first_rent', 'monthly_rent'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setPaymentType(type)}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${paymentType === type
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-white/20 hover:border-white/40'
                }
              `}
            >
              <div className="text-sm font-medium">
                {type === 'deposit' && 'Caution'}
                {type === 'first_rent' && '1er Loyer'}
                {type === 'monthly_rent' && 'Loyer Mensuel'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {formatPrice(getPaymentAmount())} XOF
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Montant */}
      <div className="bg-white/5 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Montant à payer</span>
          <span className="text-2xl font-bold text-orange-500">
            {formatPrice(getPaymentAmount())} XOF
          </span>
        </div>
      </div>

      {/* Méthode de paiement */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Méthode de paiement
        </label>
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map(method => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`
                  p-4 rounded-lg border-2 transition-all flex items-center gap-3
                  ${paymentMethod === method.id
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-white/20 hover:border-white/40'
                  }
                `}
              >
                <div className={`${method.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">{method.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Informations réservation */}
      <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Réservation</span>
          <span className="font-medium">#{booking.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Période</span>
          <span className="font-medium">
            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Traitement...
            </>
          ) : (
            'Payer maintenant'
          )}
        </Button>
      </div>
    </form>
  );
}
