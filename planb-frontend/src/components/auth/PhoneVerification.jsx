import React, { useState } from 'react';
import { Phone, ArrowLeft, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OTPInput from './OTPInput';
import PhoneInput from './PhoneInput';
import useOTP from '../../hooks/useOTP';

/**
 * Composant complet de vérification téléphone avec OTP
 * Utilisé dans le flux d'inscription
 */
const PhoneVerification = ({ onVerified, onBack, initialPhone = '' }) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [step, setStep] = useState(initialPhone ? 'otp' : 'phone'); // 'phone' ou 'otp'
  const [otpError, setOtpError] = useState(false);

  const {
    sending,
    verifying,
    otpSent,
    verified,
    timeLeft,
    canResend,
    sendOTP,
    verifyOTP,
    resendOTP,
    formatTimeLeft,
  } = useOTP();

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!phoneNumber || phoneNumber.length < 10) {
      return;
    }

    const success = await sendOTP(phoneNumber);
    if (success) {
      setStep('otp');
    }
  };

  const handleOTPComplete = async (code) => {
    setOtpError(false);
    
    const success = await verifyOTP(code);
    
    if (success) {
      // Attendre un peu pour l'animation de succès
      setTimeout(() => {
        onVerified?.(phoneNumber);
      }, 1000);
    } else {
      setOtpError(true);
    }
  };

  const handleResend = async () => {
    setOtpError(false);
    await resendOTP();
  };

  const handleChangePhone = () => {
    setStep('phone');
    setOtpError(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {!verified ? (
              <>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-orange-500" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Vérification du numéro
                </h2>
                <p className="text-gray-600 text-sm">
                  {step === 'phone'
                    ? 'Entrez votre numéro pour recevoir un code'
                    : 'Entrez le code reçu par SMS'}
                </p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="text-green-500" size={32} />
                </motion.div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Numéro vérifié !
                </h2>
                <p className="text-gray-600 text-sm">
                  Votre numéro a été vérifié avec succès
                </p>
              </>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* Étape 1 : Saisie du numéro */}
            {step === 'phone' && !verified && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  {/* Input téléphone avec sélecteur d'indicatif */}
                  <PhoneInput
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    disabled={sending}
                    autoFocus={true}
                  />

                  {/* Bouton envoyer */}
                  <button
                    type="submit"
                    disabled={sending || !phoneNumber || phoneNumber.length < 10}
                    className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      'Recevoir le code'
                    )}
                  </button>

                  {/* Bouton retour */}
                  {onBack && (
                    <button
                      type="button"
                      onClick={onBack}
                      className="w-full text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={20} />
                      Retour
                    </button>
                  )}
                </form>
              </motion.div>
            )}

            {/* Étape 2 : Saisie du code OTP */}
            {step === 'otp' && !verified && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Numéro de téléphone */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Code envoyé au
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {phoneNumber}
                  </p>
                  <button
                    onClick={handleChangePhone}
                    className="text-sm text-orange-500 hover:text-orange-600 mt-2"
                  >
                    Modifier le numéro
                  </button>
                </div>

                {/* Input OTP */}
                <div>
                  <OTPInput
                    onComplete={handleOTPComplete}
                    disabled={verifying}
                    error={otpError}
                  />
                  {otpError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 text-center mt-2"
                    >
                      Code incorrect ou expiré
                    </motion.p>
                  )}
                </div>

                {/* Timer et renvoyer */}
                <div className="text-center space-y-3">
                  {timeLeft > 0 ? (
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Clock size={16} />
                      <span className="text-sm">
                        Code valide pendant <span className="font-semibold text-orange-500">{formatTimeLeft()}</span>
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-red-500">
                      Code expiré
                    </p>
                  )}

                  <button
                    onClick={handleResend}
                    disabled={!canResend || sending}
                    className="text-sm text-orange-500 hover:text-orange-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                  >
                    <RefreshCw size={16} className={sending ? 'animate-spin' : ''} />
                    {sending ? 'Envoi...' : 'Renvoyer le code'}
                  </button>
                </div>

                {/* Chargement lors de la vérification */}
                {verifying && (
                  <div className="text-center">
                    <RefreshCw size={24} className="animate-spin text-orange-500 mx-auto" />
                    <p className="text-sm text-gray-600 mt-2">Vérification en cours...</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Étape 3 : Succès */}
            {verified && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <p className="text-gray-600 mb-4">
                  Vous pouvez maintenant continuer votre inscription
                </p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1 }}
                  className="h-2 bg-green-500 rounded-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info sécurité */}
        <p className="text-center text-xs text-gray-500 mt-6">
          🔒 Vos données sont protégées et ne seront jamais partagées
        </p>
      </motion.div>
    </div>
  );
};

export default PhoneVerification;
