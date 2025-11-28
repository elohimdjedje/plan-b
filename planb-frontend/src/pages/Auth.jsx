import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import PhoneInput from '../components/common/PhoneInput';
import { login as apiLogin, register as apiRegister } from '../utils/auth';
import { toast } from 'react-hot-toast';

/**
 * Page d'authentification (Connexion / Inscription)
 */
export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Déterminer le mode initial depuis l'URL ou le state
  const getInitialMode = () => {
    // Vérifier l'URL d'abord
    if (location.pathname.includes('/register')) return 'register';
    if (location.pathname.includes('/login')) return 'login';
    // Vérifier le state ensuite
    if (location.state?.tab === 'signup') return 'register';
    // Par défaut : login
    return 'login';
  };
  
  const [mode, setMode] = useState(getInitialMode());
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    country: 'CI',
    whatsappPhone: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        // Inscription avec le nouveau système simplifié
        const registerData = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        };
        
        // Ajouter les champs optionnels s'ils sont remplis
        if (formData.country) registerData.country = formData.country;
        if (formData.whatsappPhone) registerData.whatsappPhone = formData.whatsappPhone;
        
        await apiRegister(registerData);
        
        toast.success('✅ Inscription réussie ! Connectez-vous maintenant.');
        
        // Passer en mode connexion (ne pas se connecter automatiquement)
        setMode('login');
        
        // Garder l'email et effacer le mot de passe
        setFormData(prev => ({
          ...prev,
          password: '', // Effacer le mot de passe pour sécurité
          firstName: '',
          lastName: '',
          whatsappPhone: ''
        }));
      } else {
        // Connexion
        await apiLogin(formData.email, formData.password);
        toast.success('✅ Connexion réussie !');
        
        // Redirection après connexion réussie (pas d'animation de chargement)
        setTimeout(() => {
          window.location.href = '/';
        }, 200);
      }
      
    } catch (error) {
      console.error('Erreur authentification:', error);
      
      // Gestion des erreurs avec messages détaillés
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (mode === 'login') {
          // Erreurs de connexion
          if (status === 401) {
            toast.error('🔐 Identifiants incorrects. Vérifiez votre email et mot de passe.');
          } else if (status === 400) {
            toast.error('⚠️ Email et mot de passe requis.');
          } else if (status === 429) {
            toast.error('⏱️ Trop de tentatives. Réessayez dans quelques minutes.');
          } else {
            toast.error('❌ Erreur de connexion. Veuillez réessayer.');
          }
        } else {
          // Erreurs d'inscription
          if (status === 409 || data?.error?.includes('existe')) {
            toast.error('⚠️ Un compte existe déjà avec cet email.');
          } else if (status === 400) {
            if (data?.details) {
              // Afficher les erreurs de validation détaillées
              Object.values(data.details).flat().forEach(msg => {
                toast.error(`⚠️ ${msg}`);
              });
            } else {
              toast.error('⚠️ Informations invalides. Vérifiez vos données.');
            }
          } else {
            toast.error('❌ Erreur lors de l\'inscription. Réessayez plus tard.');
          }
        }
      } else if (error.request) {
        // Erreur réseau
        toast.error('🌐 Erreur de connexion. Vérifiez votre connexion internet.');
      } else {
        // Autre erreur
        toast.error('❌ Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Fond animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-primary-300/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-blue-300/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700 mb-2">
              Plan B
            </h1>
            <p className="text-secondary-600">
              {isLogin ? 'Bon retour parmi nous' : 'Créez votre compte'}
            </p>
          </div>

          {/* Card principale */}
          <GlassCard className="bg-white/70 backdrop-blur-xl border-white/20 shadow-2xl">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  isLogin
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white/50 text-secondary-700 hover:bg-white/70'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <LogIn size={18} />
                  <span>Connexion</span>
                </div>
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  !isLogin
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white/50 text-secondary-700 hover:bg-white/70'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <UserPlus size={18} />
                  <span>Inscription</span>
                </div>
              </button>
            </div>

            {/* Formulaire */}
            {!isLogin ? (
              // Mode inscription : Formulaire simple
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  icon={<Mail size={18} />}
                  placeholder="votre@email.com"
                  required
                />

                <Input
                  label="Mot de passe"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  icon={<Lock size={18} />}
                  placeholder="Minimum 6 caractères"
                  required
                  minLength={6}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Prénom"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    icon={<User size={18} />}
                    placeholder="John"
                    required
                  />

                  <Input
                    label="Nom"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    icon={<User size={18} />}
                    placeholder="Doe"
                    required
                  />
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-secondary-600 mb-3">Optionnel (peut être ajouté plus tard)</p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Pays</label>
                      <select
                        value={formData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="CI">Côte d'Ivoire</option>
                        <option value="BJ">Bénin</option>
                        <option value="SN">Sénégal</option>
                        <option value="ML">Mali</option>
                      </select>
                    </div>

                    <PhoneInput
                      label="WhatsApp (optionnel)"
                      value={formData.whatsappPhone}
                      onChange={(value) => handleChange('whatsappPhone', value)}
                      placeholder="07 XX XX XX XX"
                      defaultCountry={formData.country || 'CI'}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  disabled={loading}
                  icon={loading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
                >
                  {loading ? 'Inscription...' : 'Créer mon compte'}
                </Button>
              </form>
            ) : (
              // Mode connexion : Formulaire classique
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  icon={<Mail size={18} />}
                  placeholder="votre@email.com"
                  required
                />

                <Input
                  label="Mot de passe"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  icon={<Lock size={18} />}
                  placeholder="••••••••"
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  disabled={loading}
                  icon={loading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>
            )}

            {/* Lien mot de passe oublié */}
            {isLogin && (
              <div className="mt-4 text-center">
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Mot de passe oublié ?
                </button>
              </div>
            )}
          </GlassCard>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600">
              {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
              {' '}
              <button
                onClick={() => setMode(isLogin ? 'register' : 'login')}
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                {isLogin ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
