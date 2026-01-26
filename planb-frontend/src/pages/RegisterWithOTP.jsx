import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneVerification from '../components/auth/PhoneVerification';
import { register } from '../utils/auth';
import { toast } from 'react-hot-toast';

/**
 * Page d'inscription avec vérification OTP
 * Flux complet en 2 étapes
 */
const RegisterWithOTP = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // 'phone' ou 'form'
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    country: 'CI',
    city: '',
  });
  const [loading, setLoading] = useState(false);

  const handlePhoneVerified = (phone) => {
    setVerifiedPhone(phone);
    setStep('form');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!verifiedPhone) {
      toast.error('Veuillez d\'abord vérifier votre téléphone');
      setStep('phone');
      return;
    }

    try {
      setLoading(true);

      const userData = {
        ...formData,
        phone: verifiedPhone,
      };

      await register(userData);

      toast.success('Inscription réussie !');
      navigate('/auth/login');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.response?.data?.error || 'Erreur lors de l\'inscription';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Étape 1 : Vérification du téléphone
  if (step === 'phone') {
    return (
      <PhoneVerification
        onVerified={handlePhoneVerified}
        onBack={() => navigate('/auth')}
      />
    );
  }

  // Étape 2 : Formulaire d'inscription
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complétez votre profil
            </h2>
            <p className="text-gray-600 text-sm">
              Téléphone vérifié : <span className="font-semibold">{verifiedPhone}</span>
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Minimum 6 caractères"
              />
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Pays */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="CI">Côte d'Ivoire</option>
                <option value="BJ">Bénin</option>
                <option value="SN">Sénégal</option>
                <option value="ML">Mali</option>
              </select>
            </div>

            {/* Ville */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Abidjan, Cotonou, Dakar..."
              />
            </div>

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Inscription...' : 'Créer mon compte'}
            </button>

            {/* Retour */}
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Modifier le numéro
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterWithOTP;
