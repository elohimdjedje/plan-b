import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, AlertCircle, Crown, Lock, Phone, MessageCircle, Mail } from 'lucide-react';
import MobileContainer from '../components/layout/MobileContainer';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import SpecificationsForm from '../components/listing/SpecificationsForm';
import PlanBLoader from '../components/animations/PlanBLoader';
import { listingsAPI } from '../api/listings';
import useAuthStore from '../store/authStore';
import { toast } from 'react-hot-toast';

/**
 * Page pour modifier une annonce
 * FREE: Paiement de 1500 FCFA requis avant sauvegarde
 * PRO: Modification gratuite
 */
export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    priceUnit: 'le mois',
    city: '',
    commune: '',
    quartier: '',
    type: 'vente',
    category: '',
    subcategory: '',
    contactPhone: '',
    contactWhatsapp: '',
    contactEmail: '',
    specifications: {}
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Vérifier le token AVANT de charger les données
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('[EditListing] No token found, redirecting to login');
          toast.error('Session expirée. Veuillez vous reconnecter.');
          navigate('/auth');
          return;
        }

        // Utiliser le store au lieu d'un appel API
        const user = useAuthStore.getState().user;

        // Valider que l'utilisateur est bien chargé
        if (!user) {
          console.error('[EditListing] No user in store, redirecting to login');
          toast.error('Session expirée. Veuillez vous reconnecter.');
          navigate('/auth');
          return;
        }

        setIsPro(user?.accountType === 'PRO' || user?.isPro === true);

        console.log('[EditListing] Loading listing', id, 'for user', user.id);

        // Charger l'annonce depuis l'API
        const listingData = await listingsAPI.getListing(id);

        if (listingData) {
          setListing(listingData);
          setFormData({
            title: listingData.title || '',
            description: listingData.description || '',
            price: listingData.price || '',
            priceUnit: listingData.priceUnit || 'le mois',
            city: listingData.city || '',
            commune: listingData.commune || '',
            quartier: listingData.quartier || '',
            type: listingData.type || 'vente',
            category: listingData.category || '',
            subcategory: listingData.subcategory || '',
            contactPhone: listingData.contactPhone || '',
            contactWhatsapp: listingData.contactWhatsapp || '',
            contactEmail: listingData.contactEmail || '',
            specifications: listingData.specifications || {}
          });
        } else {
          toast.error('Annonce introuvable');
          navigate('/profile');
        }
      } catch (error) {
        console.error('Erreur chargement annonce:', error);

        // Meilleure gestion des erreurs 401
        if (error.response?.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          navigate('/auth');
          return;
        }

        toast.error('Impossible de charger l\'annonce');
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }

    if (!formData.price || formData.price <= 0) {
      toast.error('Le prix est obligatoire');
      return;
    }

    // Si FREE, afficher le modal de paiement
    if (!isPro) {
      setShowPaymentModal(true);
      return;
    }

    // Si PRO, sauvegarder directement
    saveChanges();
  };

  const saveChanges = async () => {
    setSaving(true);

    try {
      // Mettre à jour l'annonce via l'API
      await listingsAPI.updateListing(id, formData);

      toast.success('✅ Annonce modifiée avec succès !');

      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (error) {
      console.error('Erreur modification:', error);

      // Messages d'erreur personnalisés
      let errorMessage = '';

      if (error.response?.status === 401) {
        errorMessage = '🔐 Session expirée. Veuillez vous reconnecter.';
        setTimeout(() => navigate('/auth'), 2000);
      } else if (error.response?.status === 403) {
        errorMessage = '⛔ Vous n\'avez pas l\'autorisation de modifier cette annonce.';
      } else if (error.response?.status === 404) {
        errorMessage = '❌ Annonce introuvable. Elle a peut-être été supprimée.';
        setTimeout(() => navigate('/profile'), 2000);
      } else if (error.response?.status === 400) {
        const errorData = error.response?.data;
        if (errorData?.message?.includes('title')) {
          errorMessage = '❌ Titre invalide. Minimum 10 caractères requis.';
        } else if (errorData?.message?.includes('price')) {
          errorMessage = '❌ Prix invalide. Veuillez entrer un montant correct.';
        } else {
          errorMessage = errorData?.message || '❌ Informations invalides. Vérifiez tous les champs.';
        }
      } else if (error.message?.includes('Network Error')) {
        errorMessage = '🔌 Erreur de connexion. Vérifiez votre connexion internet.';
      } else {
        errorMessage = error.response?.data?.message || '❌ Erreur lors de la modification. Veuillez réessayer.';
      }

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  const handleProceedToPayment = () => {
    // Redirection vers la page de paiement avec montant 1500 FCFA
    navigate(`/payment/edit-listing?listingId=${id}&amount=1500`);
  };

  // Loading state
  if (loading) {
    return <PlanBLoader />;
  }

  if (!listing) {
    return null;
  }

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
          <h1 className="text-lg font-semibold flex-1">Modifier l'annonce</h1>
        </div>
      </div>

      <MobileContainer>
        <div className="max-w-md mx-auto px-4 pt-20 pb-24 space-y-4">
          {/* Alerte pour utilisateurs FREE */}
          {!isPro && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="bg-orange-50 border-orange-200">
                <div className="flex gap-3">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-1">Compte FREE</h4>
                    <p className="text-sm text-orange-700 mb-2">
                      La modification d'une annonce coûte <strong>1 500 FCFA</strong>.
                    </p>
                    <p className="text-xs text-orange-600">
                      💡 Astuce : Avec un compte PRO, modifiez gratuitement et sans limite !
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Formulaire */}
          <GlassCard>
            <h3 className="font-semibold text-lg mb-4">Informations de l'annonce</h3>

            <div className="space-y-4">
              <Input
                label="Titre"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: Villa F4 moderne à Cocody"
                required
              />

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Décrivez votre bien..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white/50 backdrop-blur-sm focus:border-primary-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Type d'annonce *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white/50 backdrop-blur-sm focus:border-primary-500 focus:outline-none transition-colors"
                  required
                >
                  <option value="vente">Vente</option>
                  <option value="location">Location</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Prix (FCFA) *
                </label>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder={formData.type === 'location' ? 'Ex: 150000' : 'Ex: 25000000'}
                    required
                    className="flex-1"
                  />
                  {formData.type === 'location' && (
                    <Select
                      value={formData.priceUnit}
                      onChange={(e) => handleChange('priceUnit', e.target.value)}
                      options={[
                        { value: 'le mois', label: '/le mois' },
                        { value: 'la jour', label: '/la jour' },
                        { value: "l'heure", label: "/l'heure" },
                        { value: 'la nuit', label: '/la nuit' }
                      ]}
                      className="w-32"
                    />
                  )}
                </div>
              </div>

              {/* Spécifications dynamiques */}
              <div className="pt-4 border-t border-secondary-100">
                <SpecificationsForm
                  category={formData.category}
                  subcategory={formData.subcategory}
                  specifications={formData.specifications}
                  onChange={(specs) => handleChange('specifications', specs)}
                />
              </div>

              <Input
                label="Ville"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Ex: Cocody"
              />
            </div>
          </GlassCard>

          {/* Moyens de contact */}
          <GlassCard>
            <h3 className="font-semibold text-lg mb-4">Moyens de contact</h3>
            <p className="text-sm text-secondary-500 mb-4">
              Renseignez au moins un moyen de contact pour que les acheteurs puissent vous joindre.
            </p>

            <div className="space-y-4">
              <Input
                label="Numéro WhatsApp"
                value={formData.contactWhatsapp}
                onChange={(e) => handleChange('contactWhatsapp', e.target.value)}
                placeholder="Ex: +225 07 XX XX XX XX"
                icon={<MessageCircle size={18} className="text-green-500" />}
              />

              <Input
                label="Téléphone"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder="Ex: +225 07 XX XX XX XX"
                icon={<Phone size={18} className="text-blue-500" />}
              />

              <Input
                label="Email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="Ex: contact@email.com"
                icon={<Mail size={18} className="text-orange-500" />}
              />
            </div>
          </GlassCard>

          {/* Boutons d'action */}
          <div className="pt-4 space-y-3">
            {isPro ? (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleSave}
                  disabled={saving}
                  icon={<Save size={20} />}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  onClick={() => navigate('/profile')}
                  icon={<ArrowLeft size={20} />}
                >
                  Retour
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleSave}
                  disabled={saving}
                  icon={<Save size={20} />}
                >
                  Continuer vers le paiement
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  onClick={() => navigate('/profile')}
                  icon={<ArrowLeft size={20} />}
                >
                  Retour
                </Button>
              </>
            )}
          </div>
        </div>
      </MobileContainer>

      {/* Modal de paiement pour FREE */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-2">
                Paiement requis
              </h3>
              <p className="text-secondary-600">
                Pour modifier cette annonce, vous devez payer <strong className="text-primary-500">1 500 FCFA</strong>.
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">
                ✨ Astuce : Passez en PRO !
              </h4>
              <p className="text-sm text-blue-700 mb-2">
                Avec un compte PRO à <strong>10 000 FCFA/mois</strong> :
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>✓ Modifications illimitées gratuites</li>
                <li>✓ Annonces sans date d'expiration</li>
                <li>✓ Badge vérifié PRO</li>
                <li>✓ Statistiques détaillées</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={handleProceedToPayment}
              >
                Payer 1 500 FCFA
              </Button>

              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/upgrade')}
                icon={<Crown size={18} />}
              >
                Passer en PRO
              </Button>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full text-secondary-600 text-sm py-2"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
