import React, { useRef, useState, useEffect } from 'react';

/**
 * Composant pour saisir un code OTP à 6 chiffres
 * Avec auto-focus et navigation au clavier
 */
const OTPInput = ({ value = '', onChange, onComplete, disabled = false, error = false, resetOnError = true }) => {
  const [otp, setOtp] = useState(value.split(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    setOtp(value.split(''));
  }, [value]);

  // Réinitialiser et focus sur le premier champ en cas d'erreur
  useEffect(() => {
    if (error && resetOnError) {
      setOtp(['', '', '', '', '', '']);
      onChange('');
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [error, resetOnError, onChange]);

  useEffect(() => {
    // Auto-focus sur le premier champ vide
    if (!disabled) {
      const firstEmptyIndex = otp.findIndex(digit => !digit);
      if (firstEmptyIndex !== -1) {
        inputRefs.current[firstEmptyIndex]?.focus();
      } else if (otp.length === 6 && otp.every(d => d)) {
        // Si tous les champs sont remplis, déclencher onComplete
        const code = otp.join('');
        if (code.length === 6) {
          onComplete?.(code);
        }
      }
    }
  }, [otp, disabled, onComplete]);

  const handleChange = (index, value) => {
    // Ne garder que les chiffres
    const digit = value.replace(/[^0-9]/g, '');
    
    if (digit.length > 1) {
      // Si plusieurs chiffres collés, les répartir
      const digits = digit.split('').slice(0, 6);
      const newOtp = [...otp];
      
      digits.forEach((d, i) => {
        if (index + i < 6) {
          newOtp[index + i] = d;
        }
      });
      
      setOtp(newOtp);
      onChange(newOtp.join(''));
      
      // Focus sur le dernier champ rempli + 1
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Auto-focus sur le champ suivant si rempli
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace : aller au champ précédent si vide
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Flèche gauche
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Flèche droite
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    const digits = pastedData.split('').slice(0, 6);
    
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });
    
    setOtp(newOtp);
    onChange(newOtp.join(''));
    
    // Focus sur le dernier champ ou le premier vide
    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleFocus = (index) => {
    // Sélectionner le contenu au focus
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={`
            w-12 h-14 sm:w-14 sm:h-16 
            text-center text-2xl font-bold
            border-2 rounded-xl
            transition-all duration-200
            ${error 
              ? 'border-red-500 bg-red-50 text-red-600' 
              : otp[index]
                ? 'border-orange-500 bg-orange-50 text-orange-600'
                : 'border-gray-300 bg-white text-gray-900'
            }
            ${!disabled && 'hover:border-orange-400'}
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50
          `}
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default OTPInput;
