import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Mail, Phone, FileText } from 'lucide-react';
import MobileContainer from '../components/layout/MobileContainer';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { getUserProfile, saveUserProfile } from '../utils/auth';
import { toast } from 'react-hot-toast';

/**
 * Page pour modifier les informations du profil utilisateur
 */
export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    // Charger le profil actuel
    const userProfile = getUserProfile();
    setFormData({
      name: userProfile.name || '',
      email: userProfile.email || '',
      phone: userProfile.phone || '',
      bio: userProfile.bio || ''
    });
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Le nom est obligatoire');
      return;
    }

    if (formData.email && !formData.email.includes('@')) {
      toast.error('Email invalide');
      return;
    }

    setLoading(true);

    try {
      // Sauvegarder le profil
      saveUserProfile(formData);
      
      toast.success('✅ Profil mis à jour avec succès !');
      
      // Retour au profil après un court délai
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
      
      // Messages d'erreur personnalisés
      let errorMessage = '';
      
      if (error.response?.status === 401) {
        errorMessage = '🔐 Session expirée. Veuillez vous reconnecter.';
        setTimeout(() => navigate('/auth'), 2000);
      } else if (error.response?.status === 409) {
        errorMessage = '⚠️ Cet email est déjà utilisé par un autre compte.';
      } else if (error.response?.status === 400) {
        const errorData = error.response?.data;
        if (errorData?.message?.includes('email')) {
          errorMessage = '❌ Adresse email invalide.';
        } else if (errorData?.message?.includes('phone')) {
          errorMessage = '❌ Numéro de téléphone invalide.';
        } else {
          errorMessage = errorData?.message || '❌ Informations invalides. Vérifiez tous les champs.';
        }
      } else if (error.message?.includes('Network Error')) {
        errorMessage = '🔌 Erreur de connexion. Vérifiez votre connexion internet.';
      } else {
        errorMessage = error.response?.data?.message || '❌ Erreur lors de la sauvegarde. Veuillez réessayer.';
      }
      
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-blue-50 to-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-secondary-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-secondary-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold flex-1">Modifier mon profil</h1>
        </div>
      </div>

      <MobileContainer>
        <div className="max-w-md mx-auto px-4 pt-20 pb-24 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard>
              <h3 className="font-semibold text-lg mb-4">Informations personnelles</h3>
              
              <div className="space-y-4">
                {/* Nom */}
                <div>
                  <Input
                    label="Nom complet *"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Ex: Mickael Djedje"
                    icon={<User size={18} />}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="Ex: mickael@planb.ci"
                    icon={<Mail size={18} />}
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <Input
                    label="Numéro de téléphone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="Ex: +2250707123456"
                    icon={<Phone size={18} />}
                  />
                </div>

                {/* Bio/Description */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    <FileText size={18} className="inline mr-2" />
                    Description / Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Parlez un peu de vous, de votre activité..."
                    rows={5}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white/50 backdrop-blur-sm focus:border-primary-500 focus:outline-none transition-colors resize-none"
                  />
                  <div className="text-xs text-secondary-500 mt-1 text-right">
                    {formData.bio.length} / 500 caractères
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Info */}
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Astuce :</strong> Une bio complète et des coordonnées à jour augmentent la confiance des acheteurs.
              </p>
            </div>

            {/* Bouton Sauvegarder */}
            <div className="pt-4">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleSave}
                disabled={loading}
                icon={<Save size={20} />}
              >
                {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
              </Button>
            </div>
          </motion.div>
        </div>
      </MobileContainer>
    </div>
  );
}
