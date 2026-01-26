import { useState, useEffect, useCallback } from 'react';
import otpApi from '../api/otp';
import { toast } from 'react-hot-toast';

/**
 * Hook pour gérer la vérification OTP par SMS
 */
export const useOTP = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Timer pour le countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /**
   * Envoyer le code OTP
   */
  const sendOTP = useCallback(async (phoneNumber) => {
    // Nettoyer le numéro : enlever espaces, tirets, parenthèses
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Numéro de téléphone invalide');
      return false;
    }

    try {
      setSending(true);
      setPhone(cleanPhone);
      
      const result = await otpApi.sendOTP(cleanPhone);
      
      setOtpSent(true);
      setTimeLeft(300); // 5 minutes
      setCanResend(false);
      
      toast.success(result.message || 'Code envoyé par SMS');
      
      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      
      const errorMsg = error.response?.data?.error || 'Échec de l\'envoi du code';
      toast.error(errorMsg);
      
      return false;
    } finally {
      setSending(false);
    }
  }, []);

  /**
   * Vérifier le code OTP
   */
  const verifyOTP = useCallback(async (otpCode) => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Code incomplet');
      return false;
    }

    if (!phone) {
      toast.error('Numéro de téléphone manquant');
      return false;
    }

    try {
      setVerifying(true);
      setCode(otpCode);
      
      const result = await otpApi.verifyOTP(phone, otpCode);
      
      setVerified(true);
      
      toast.success(result.message || 'Téléphone vérifié avec succès');
      
      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      const errorMsg = error.response?.data?.error || 'Code incorrect ou expiré';
      toast.error(errorMsg);
      
      return false;
    } finally {
      setVerifying(false);
    }
  }, [phone]);

  /**
   * Renvoyer le code OTP
   */
  const resendOTP = useCallback(async () => {
    if (!canResend) {
      toast.error('Veuillez attendre avant de renvoyer le code');
      return false;
    }

    return await sendOTP(phone);
  }, [canResend, phone, sendOTP]);

  /**
   * Réinitialiser l'état
   */
  const reset = useCallback(() => {
    setPhone('');
    setCode('');
    setOtpSent(false);
    setVerified(false);
    setTimeLeft(0);
    setCanResend(false);
    setSending(false);
    setVerifying(false);
  }, []);

  /**
   * Formater le temps restant (MM:SS)
   */
  const formatTimeLeft = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  return {
    phone,
    code,
    sending,
    verifying,
    otpSent,
    verified,
    timeLeft,
    canResend,
    sendOTP,
    verifyOTP,
    resendOTP,
    reset,
    formatTimeLeft,
  };
};

export default useOTP;
