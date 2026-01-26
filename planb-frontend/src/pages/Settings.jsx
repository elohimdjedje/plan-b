import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Mail, Phone, MessageCircle,
  User, FileText, Shield
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import { useAuthStore } from '../store/authStore';
import { getUserProfile, saveUserProfile } from '../utils/auth';
import { toast } from 'react-hot-toast';
import MacSpinner from '../components/animations/MacSpinner';

/**
 * Page Paramètres du compte
 */
export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  // Données initiales
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: '',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  // Pas de loading initial si on a déjà les données du store
  const [initialLoading, setInitialLoading] = useState(!user);

  // Initialiser immédiatement avec les données du store
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        whatsapp: user.whatsappPhone || '',
        bio: user.bio || '',
      });
      setInitialLoading(false);
    }
  }, [user]);

  // Rafraîchir depuis l'API en arrière-plan (sans bloquer l'affichage)
  useEffect(() => {
    const refreshFromApi = async () => {
      try {
        const userProfile = await getUserProfile();
        if (userProfile) {
          setFormData(prev => ({
            firstName: userProfile.firstName || prev.firstName,
            lastName: userProfile.lastName || prev.lastName,
            email: userProfile.email || prev.email,
            whatsapp: userProfile.whatsappPhone || prev.whatsapp,
            bio: userProfile.bio || prev.bio,
          }));
        }
      } catch (error) {
        console.error('Erreur chargement profil API:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    refreshFromApi();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Le prénom et le nom sont obligatoires');
      return;
    }

    if (formData.email && !formData.email.includes('@')) {
      toast.error('Email invalide');
      return;
    }

    setLoading(true);
    
    try {
      // Sauvegarder via l'API
      const updatedUser = await saveUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        whatsappPhone: formData.whatsapp,
        bio: formData.bio,
      });
      
      // Mettre à jour authStore
      if (updateUser && updatedUser) {
        updateUser(updatedUser.user || updatedUser);
      }
      
      toast.success('✅ Paramètres enregistrés avec succès !');
      
      // Retour au profil après un court délai
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      const errorMsg = error.response?.data?.error || 'Erreur lors de la sauvegarde';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-lg border-b border-secondary-200 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-secondary-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} className="text-secondary-900" />
          </button>
          <h1 className="text-lg font-bold text-secondary-900">Paramètres</h1>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4 pb-24">
        {initialLoading ? (
          <div className="flex justify-center items-center py-12">
            <MacSpinner size="lg" />
          </div>
        ) : (
        <div className="space-y-4">
        {/* Informations personnelles */}
        <GlassCard>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <User size={20} className="text-primary-500" />
            Informations personnelles
          </h3>
          
          <div className="space-y-4">
            <Input
              label="Prénom"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              icon={<User size={18} />}
              placeholder="Votre prénom"
            />
            
            <Input
              label="Nom"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              icon={<User size={18} />}
              placeholder="Votre nom"
            />
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              icon={<Mail size={18} />}
              placeholder="votre@email.com"
            />
          </div>
        </GlassCard>

        {/* Contact WhatsApp */}
        <GlassCard>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <MessageCircle size={20} className="text-green-500" />
            WhatsApp pour les conversations
          </h3>
          
          <div className="space-y-4">
            <Input
              label="Numéro WhatsApp (avec indicatif)"
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              icon={<Phone size={18} />}
              placeholder="+225 07 XX XX XX XX"
            />
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs text-green-700 flex items-start gap-2">
                <MessageCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>Saisissez votre numéro complet avec l'indicatif pays (ex: +225 pour la Côte d'Ivoire)</span>
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Description vendeur */}
        <GlassCard>
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <FileText size={20} className="text-blue-500" />
            Bio / Description (Facultatif)
          </h3>
          <p className="text-sm text-secondary-600 mb-4">
            Présentez-vous aux acheteurs potentiels
          </p>
          
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Ex: Professionnel de l'immobilier depuis 10 ans, spécialisé dans les biens haut de gamme à Abidjan..."
            rows={5}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white/50 backdrop-blur-sm focus:border-primary-500 focus:outline-none transition-colors resize-none"
          />
          <div className="text-xs text-secondary-500 mt-1 text-right">
            {formData.bio.length} / 500 caractères
          </div>
        </GlassCard>

        {/* Info */}
        <GlassCard className="bg-blue-50/80 border-blue-200">
          <div className="flex gap-3">
            <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Vos informations sont sécurisées</h4>
              <p className="text-sm text-blue-700">
                Votre email et numéro de téléphone principal ne seront jamais affichés publiquement.
                Seul le WhatsApp sera visible pour les discussions.
              </p>
            </div>
          </div>
        </GlassCard>
        </div>
        )}
      </div>

      {/* Footer fixe */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-secondary-200 p-4 safe-bottom">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
            icon={<Save size={18} />}
            className="flex-1"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
