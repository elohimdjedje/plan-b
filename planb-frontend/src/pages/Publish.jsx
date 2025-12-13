import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Camera, X, Home, Car, Palmtree, Building2, DoorClosed, Trees, Store, Bike, Hotel, Lightbulb, DollarSign, Phone, MessageCircle, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import SpecificationsForm from '../components/listing/SpecificationsForm';
import QuotaExceededModal from '../components/modals/QuotaExceededModal';
import { CATEGORIES, LISTING_TYPES, COUNTRIES } from '../constants/categories';
import { CITIES_LIST, getCommunes } from '../constants/locations';
import { useAuthStore } from '../store/authStore';
import { listingsAPI } from '../api/listings';
import { saveDraft, deleteDraft, getDraftById } from '../services/draftsService';

// Mapping des icônes Lucide
const IconComponents = {
  Home,
  Car,
  Palmtree,
  Building2,
  DoorClosed,
  Trees,
  Store,
  Bike,
  Hotel
};

/**
 * Page de publication d'annonce (Multi-step form)
 */
export default function Publish() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accountType = 'FREE' } = useAuthStore();
  const [step, setStep] = useState(1);
  const [draftId, setDraftId] = useState(null); // ID du brouillon en cours d'édition
  const [isSubmitting, setIsSubmitting] = useState(false); // État pour éviter double-clic
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    type: LISTING_TYPES.VENTE,
    title: '',
    description: '',
    price: '',
    priceUnit: 'le mois', // Par défaut 'le mois' pour les locations
    country: 'CI',
    city: '',
    commune: '',
    quartier: '',
    phone: '',
    contactPhone: '',
    contactWhatsapp: '',
    contactEmail: '',
    images: [],
    specifications: {},
  });

  // Charger un brouillon si on arrive depuis le profil
  useEffect(() => {
    const fromDraft = searchParams.get('from') === 'draft';
    const id = searchParams.get('id');
    
    if (fromDraft && id) {
      // Récupérer le brouillon depuis sessionStorage
      const draftData = sessionStorage.getItem('draft_to_publish');
      if (draftData) {
        try {
          const draft = JSON.parse(draftData);
          setDraftId(draft.id);
          setFormData({
            category: draft.category || '',
            subcategory: draft.subcategory || '',
            type: draft.type || LISTING_TYPES.VENTE,
            title: draft.title || '',
            description: draft.description || '',
            price: draft.price || '',
            priceUnit: draft.priceUnit || 'le mois',
            country: draft.country || 'CI',
            city: draft.city || '',
            commune: draft.commune || '',
            quartier: draft.quartier || '',
            phone: draft.phone || '',
            contactPhone: draft.contactPhone || '',
            contactWhatsapp: draft.contactWhatsapp || '',
            contactEmail: draft.contactEmail || '',
            images: [], // Les images ne sont pas persistées
            specifications: draft.specifications || {},
          });
          toast.success('📝 Brouillon chargé ! Complétez les informations manquantes.');
          // Nettoyer le sessionStorage
          sessionStorage.removeItem('draft_to_publish');
        } catch (error) {
          console.error('Erreur chargement brouillon:', error);
        }
      }
    }
  }, [searchParams]);

  // État pour le modal de quota dépassé
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState({ current: 4, max: 4 });

  const maxPhotos = accountType === 'PRO' ? 10 : 4;
  const totalSteps = 7;

  // Fonction pour sauvegarder en brouillon
  const handleSaveDraft = async () => {
    try {
      // Préparer les données du brouillon (sans upload d'images, juste les previews)
      const draftData = {
        ...formData,
        // Convertir les images en format sauvegardable (juste les noms de fichiers)
        imagesPending: formData.images.map(img => ({
          name: img.file?.name || 'image',
          size: img.file?.size || 0,
          preview: img.preview
        }))
      };
      
      saveDraft(draftData);
      toast.success('📝 Annonce sauvegardée en brouillon !');
      return draftData;
    } catch (error) {
      console.error('Erreur sauvegarde brouillon:', error);
      toast.error('Erreur lors de la sauvegarde');
      throw error;
    }
  };

  // Fonction pour récupérer le composant d'icône
  const getIconComponent = (iconName) => {
    return IconComponents[iconName] || Home;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos ${accountType === 'FREE' ? '(Compte FREE)' : ''}`);
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    handleChange('images', [...formData.images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    handleChange('images', newImages);
  };

  const handleSubmit = async () => {
    // Empêcher les clics multiples
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Validations frontend avant envoi
      if (formData.title.length < 10) {
        toast.error('Le titre doit contenir au moins 10 caractères');
        setIsSubmitting(false);
        return;
      }
      
      if (formData.description.length < 20) {
        toast.error('La description doit contenir au moins 20 caractères');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error('Le prix doit être positif');
        setIsSubmitting(false);
        return;
      }
      
      toast.loading('Publication en cours...');
      
      // 1. Upload des images si présentes
      let imageUrls = [];
      if (formData.images.length > 0) {
        try {
          const imageFiles = formData.images.map(img => img.file);
          console.log('📤 Upload de', imageFiles.length, 'images:', imageFiles.map(f => f.name));
          
          const uploadResult = await listingsAPI.uploadImages(imageFiles);
          imageUrls = uploadResult.urls || uploadResult.images || [];
          
          console.log('✅ Upload réussi, URLs reçues:', imageUrls);
        } catch (uploadError) {
          console.error('❌ Erreur upload images:', uploadError);
          // Continuer sans images plutôt que bloquer
        }
      }
      
      // 2. Créer l'annonce avec les URLs des images
      const listingData = {
        category: formData.category,
        subcategory: formData.subcategory,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        priceUnit: formData.priceUnit,
        country: formData.country,
        city: formData.city,
        commune: formData.commune,
        quartier: formData.quartier,
        phone: formData.phone || '',
        contactPhone: formData.contactPhone || null,
        contactWhatsapp: formData.contactWhatsapp || null,
        contactEmail: formData.contactEmail || null,
        specifications: formData.specifications || {},
        images: imageUrls,
      };
      
      const response = await listingsAPI.createListing(listingData);
      
      // Si c'était un brouillon, le supprimer
      if (draftId) {
        deleteDraft(draftId);
      }
      
      // Afficher le succès tout en gardant le loading visible
      toast.dismiss();
      toast.loading('✅ Annonce publiée ! Redirection en cours...', { duration: 2000 });
      
      // Attendre 1.5 secondes pour que l'utilisateur voie le message, puis rediriger
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirection vers la page d'accueil
      navigate('/');
    } catch (error) {
      toast.dismiss();
      
      // Messages d'erreur personnalisés
      let errorMessage = '';
      const errorCode = error.response?.data?.error;
      const errorData = error.response?.data;
      
      // Ne pas logger les erreurs de quota (c'est attendu)
      if (errorCode !== 'QUOTA_EXCEEDED' && error.response?.status !== 403) {
        console.error('Erreur publication:', error);
      }
      
      if (errorCode === 'QUOTA_EXCEEDED' || error.response?.status === 403) {
        // Limite d'annonces atteinte - Afficher le modal
        const currentListings = errorData?.currentListings || 4;
        const maxListings = errorData?.maxListings || 4;
        
        setQuotaInfo({ current: currentListings, max: maxListings });
        setShowQuotaModal(true);
        setIsSubmitting(false);
        
        // Pas de toast, le modal gère l'affichage
        return;
        
      } else if (error.response?.status === 401) {
        errorMessage = '🔐 Session expirée. Veuillez vous reconnecter.';
        toast.error(errorMessage);
        setIsSubmitting(false);
        setTimeout(() => navigate('/auth'), 2000);
        
      } else if (error.response?.status === 400) {
        // Erreur de validation
        if (errorData?.message?.includes('title')) {
          errorMessage = '❌ Titre invalide. Minimum 10 caractères requis.';
        } else if (errorData?.message?.includes('description')) {
          errorMessage = '❌ Description invalide. Minimum 20 caractères requis.';
        } else if (errorData?.message?.includes('price')) {
          errorMessage = '❌ Prix invalide. Veuillez entrer un montant correct.';
        } else if (errorData?.message?.includes('image')) {
          errorMessage = '📷 Erreur avec les images. Vérifiez le format et la taille.';
        } else {
          errorMessage = errorData?.message || '❌ Informations invalides. Vérifiez tous les champs.';
        }
        
      } else if (error.message?.includes('Network Error')) {
        errorMessage = '🔌 Erreur de connexion. Vérifiez votre connexion internet.';
        
      } else if (error.response?.status === 413) {
        errorMessage = '📷 Images trop volumineuses. Réduisez la taille de vos photos (max 5 Mo par photo).';
        
      } else if (error.response?.status === 500) {
        errorMessage = '⚠️ Erreur serveur. Réessayez plus tard ou contactez le support.';
        
      } else {
        errorMessage = errorData?.error || errorData?.message || error.message || '❌ Erreur lors de la publication. Veuillez réessayer.';
      }
      
      if (errorCode !== 'QUOTA_EXCEEDED') {
        toast.error(errorMessage, { duration: 6000 });
      }
      
      setIsSubmitting(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return formData.category;
    if (step === 2) return formData.subcategory && formData.type;
    if (step === 3) return true; // Images optionnelles pour l'instant
    if (step === 4) {
      return formData.title && formData.title.length >= 10 &&
             formData.description && formData.description.length >= 20 &&
             formData.price && parseFloat(formData.price) > 0;
    }
    if (step === 5) return formData.city && formData.commune && formData.quartier;
    return true;
  };

  const selectedCategory = Object.values(CATEGORIES).find(c => c.id === formData.category);
  const subcategories = selectedCategory?.subcategories || [];
  
  // Gestion de la localisation (Côte d'Ivoire seulement pour l'instant)
  const cities = formData.country === 'CI' ? CITIES_LIST : [];
  const communes = formData.city ? getCommunes(formData.city) : [];
  
  // Réinitialiser la commune si la ville change
  const handleCityChange = (city) => {
    handleChange('city', city);
    handleChange('commune', ''); // Reset commune
    handleChange('quartier', ''); // Reset quartier
  };
  
  // Réinitialiser le quartier si la commune change
  const handleCommuneChange = (commune) => {
    handleChange('commune', commune);
    handleChange('quartier', ''); // Reset quartier
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/40 backdrop-blur-2xl border-b border-white/30">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)}
              className="p-2 hover:bg-white/40 backdrop-blur-sm rounded-xl transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold">Publier une annonce</h1>
            <div className="w-10" />
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all ${
                  index + 1 <= step ? 'bg-primary-500/80' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 pt-24 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Catégorie */}
            {step === 1 && (
              <GlassCard>
                <h2 className="text-xl font-bold mb-4">Choisissez une catégorie</h2>
                <div className="space-y-3">
                  {Object.values(CATEGORIES).map((category) => {
                    const IconComponent = getIconComponent(category.icon);
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleChange('category', category.id)}
                        className={`
                          w-full p-6 rounded-xl text-left font-semibold transition-all
                          flex items-center gap-4
                          ${formData.category === category.id
                            ? `bg-gradient-to-r ${category.color}/80 backdrop-blur-md text-white shadow-lg scale-105 border border-white/30`
                            : 'bg-white/50 backdrop-blur-lg hover:bg-white/70 text-secondary-800 border border-white/30'
                          }
                        `}
                      >
                        <IconComponent size={32} />
                        <span className="text-lg">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </GlassCard>
            )}

            {/* Step 2: Sous-catégorie + Type */}
            {step === 2 && (
              <GlassCard>
                <h2 className="text-xl font-bold mb-4">Précisez les détails</h2>
                <div className="space-y-4">
                  <Select
                    label="Sous-catégorie"
                    value={formData.subcategory}
                    onChange={(e) => handleChange('subcategory', e.target.value)}
                    options={subcategories.map(s => ({ value: s.id, label: s.name }))}
                  />
                  <div>
                    <label className="block text-sm font-medium text-secondary-900 mb-2">
                      Type d'annonce
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleChange('type', LISTING_TYPES.VENTE)}
                        className={`
                          p-4 rounded-xl font-semibold transition-all
                          ${formData.type === LISTING_TYPES.VENTE
                            ? 'bg-primary-500/80 backdrop-blur-md text-white shadow-lg border border-white/20'
                            : 'bg-white/50 backdrop-blur-lg text-secondary-700 hover:bg-white/70 border border-white/30'
                          }
                        `}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <DollarSign size={20} />
                          Vente
                        </span>
                      </button>
                      <button
                        onClick={() => handleChange('type', LISTING_TYPES.LOCATION)}
                        className={`
                          p-4 rounded-xl font-semibold transition-all
                          ${formData.type === LISTING_TYPES.LOCATION
                            ? 'bg-primary-500/80 backdrop-blur-md text-white shadow-lg border border-white/20'
                            : 'bg-white/50 backdrop-blur-lg text-secondary-700 hover:bg-white/70 border border-white/30'
                          }
                        `}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Home size={20} />
                          Location
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Step 3: Photos */}
            {step === 3 && (
              <GlassCard>
                <h2 className="text-xl font-bold mb-2">Ajouter des photos</h2>
                <p className="text-sm text-secondary-600 mb-4">
                  {formData.images.length}/{maxPhotos} photos
                  {accountType === 'FREE' && ' (Max 4 pour compte FREE)'}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={image.preview}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/20 shadow-lg"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {formData.images.length < maxPhotos && (
                    <label className="aspect-square bg-white/50 backdrop-blur-lg rounded-xl border-2 border-dashed border-white/40 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400/60 transition-colors">
                      <Camera size={32} className="text-secondary-400 mb-2" />
                      <span className="text-xs text-secondary-600">Ajouter</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {accountType === 'FREE' && formData.images.length >= 3 && (
                  <div className="bg-yellow-100/40 backdrop-blur-lg border border-yellow-300/40 rounded-xl p-3 text-sm">
                    <p className="text-yellow-800 flex items-start gap-2">
                      <Lightbulb size={18} className="flex-shrink-0 mt-0.5" />
                      <span><strong>Astuce :</strong> Passez en PRO pour ajouter jusqu'à 10 photos !</span>
                    </p>
                  </div>
                )}
              </GlassCard>
            )}

            {/* Step 4: Informations générales */}
            {step === 4 && (
              <GlassCard>
                <h2 className="text-xl font-bold mb-4">Informations générales</h2>
                <div className="space-y-4">
                  <Input
                    label="Titre de l'annonce"
                    placeholder="Ex: Villa F4 moderne à Cocody"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    maxLength={100}
                    helperText={`${formData.title.length}/100 caractères (minimum 10)`}
                  />
                  <Textarea
                    label="Description"
                    placeholder="Décrivez votre bien en détail..."
                    rows={6}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    maxLength={1000}
                    showCount
                    helperText="Minimum 20 caractères"
                  />
                  <div>
                    <label className="block text-sm font-medium text-secondary-900 mb-2">
                      Prix (FCFA)
                    </label>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        placeholder={formData.type === LISTING_TYPES.LOCATION ? "Ex: 150000" : "Ex: 25000000"}
                        value={formData.price}
                        onChange={(e) => handleChange('price', e.target.value)}
                        className="flex-1"
                      />
                      {formData.type === LISTING_TYPES.LOCATION && (
                        <Select
                          value={formData.priceUnit}
                          onChange={(e) => handleChange('priceUnit', e.target.value)}
                          options={[
                            { value: 'le mois', label: '/le mois' },
                            { value: 'la jour', label: '/la jour' },
                            { value: "l'heure", label: "/l'heure" },
                            ...(formData.category === 'vacance' ? [{ value: 'la nuit', label: '/la nuit' }] : [])
                          ]}
                          className="w-32"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Formulaire de spécifications dynamiques */}
                  <div className="pt-4 border-t border-secondary-100">
                    <SpecificationsForm
                      category={formData.category}
                      subcategory={formData.subcategory}
                      specifications={formData.specifications}
                      onChange={(specs) => handleChange('specifications', specs)}
                    />
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Step 5: Localisation */}
            {step === 5 && (
              <GlassCard>
                <h2 className="text-xl font-bold mb-4">Localisation</h2>
                <div className="space-y-4">
                  <Select
                    label="Pays"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    options={COUNTRIES.map(c => ({ value: c.code, label: `${c.flag} ${c.name}` }))}
                  />
                  
                  <Select
                    label="Ville *"
                    value={formData.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    options={cities.map(city => ({ value: city, label: city }))}
                    disabled={!formData.country}
                  />
                  
                  {formData.city && (
                    <Select
                      label="Commune *"
                      value={formData.commune}
                      onChange={(e) => handleCommuneChange(e.target.value)}
                      options={communes.map(commune => ({ value: commune, label: commune }))}
                      disabled={!formData.city}
                    />
                  )}
                  
                  {formData.commune && (
                    <Input
                      label="Quartier *"
                      placeholder="Ex: Cocody 2 Plateaux, Yopougon Niangon..."
                      value={formData.quartier}
                      onChange={(e) => handleChange('quartier', e.target.value)}
                    />
                  )}
                  
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">ℹ️ Informations importantes :</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Sélectionnez d'abord votre ville</li>
                      <li>Puis choisissez la commune</li>
                      <li>Enfin, précisez le quartier exact</li>
                      <li>Ces informations aident les acheteurs à localiser facilement votre bien</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Step 6: Informations de contact */}
            {step === 6 && (
              <GlassCard>
                <h2 className="text-xl font-bold mb-4">Vos moyens de contact</h2>
                <p className="text-sm text-secondary-600 mb-6">
                  Choisissez comment les acheteurs peuvent vous contacter. Tous les champs sont optionnels, mais nous recommandons d'en renseigner au moins un.
                </p>
                <div className="space-y-4">
                  <Input
                    label="Numéro de téléphone (Appel & SMS)"
                    placeholder="Ex: +225 07 XX XX XX XX"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    icon={Phone}
                  />
                  <p className="text-xs text-secondary-500 -mt-2">
                    Ce numéro sera utilisé pour les appels téléphoniques et les SMS
                  </p>

                  <Input
                    label="Numéro WhatsApp"
                    placeholder="Ex: +225 07 XX XX XX XX"
                    value={formData.contactWhatsapp}
                    onChange={(e) => handleChange('contactWhatsapp', e.target.value)}
                    icon={MessageCircle}
                  />
                  <p className="text-xs text-secondary-500 -mt-2">
                    Les acheteurs pourront vous contacter directement sur WhatsApp
                  </p>

                  <Input
                    label="Email"
                    type="email"
                    placeholder="Ex: contact@exemple.com"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    icon={Mail}
                  />
                  <p className="text-xs text-secondary-500 -mt-2">
                    Recevez des messages par email
                  </p>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">💡 Conseil</p>
                    <p className="text-sm text-blue-700">
                      Plus vous offrez de moyens de contact, plus vous aurez de chances d'être contacté rapidement !
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Step 7: Récapitulatif */}
            {step === 7 && (
              <GlassCard>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-green-100/60 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4 border border-green-300/40">
                    <Check size={40} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                    Prêt à publier !
                  </h2>
                  <p className="text-secondary-600">
                    Vérifiez les informations avant de publier
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Catégorie</div>
                    <div className="font-semibold">{selectedCategory?.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Titre</div>
                    <div className="font-semibold">{formData.title}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Prix</div>
                    <div className="font-semibold text-primary-500">
                      {parseInt(formData.price).toLocaleString()} FCFA
                      {formData.type === LISTING_TYPES.LOCATION && (
                        <span className="text-sm"> /{formData.priceUnit}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Localisation</div>
                    <div className="font-semibold">
                      {formData.city}, {COUNTRIES.find(c => c.code === formData.country)?.name || formData.country}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Photos</div>
                    <div className="font-semibold">{formData.images.length} photo(s)</div>
                  </div>
                </div>
              </GlassCard>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer fixe avec boutons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/40 backdrop-blur-2xl border-t border-white/30 p-4 safe-bottom shadow-lg">
        <div className="max-w-md mx-auto flex gap-3">
          {step > 1 && step < totalSteps && (
            <Button
              variant="secondary"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              Retour
            </Button>
          )}
          {step < totalSteps ? (
            <Button
              variant="primary"
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext()}
              className="flex-1"
            >
              Continuer
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Publication...
                </span>
              ) : (
                "Publier l'annonce"
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Modal de quota dépassé */}
      <QuotaExceededModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        currentListings={quotaInfo.current}
        maxListings={quotaInfo.max}
        onSaveDraft={handleSaveDraft}
      />
    </div>
  );
}
