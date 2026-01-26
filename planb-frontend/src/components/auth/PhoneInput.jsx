import React, { useState } from 'react';
import { Phone, ChevronDown } from 'lucide-react';

/**
 * Liste des indicatifs téléphoniques
 */
const COUNTRY_CODES = [
  // Afrique de l'Ouest
  { code: '+225', country: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: '+229', country: 'Bénin', flag: '🇧🇯' },
  { code: '+221', country: 'Sénégal', flag: '🇸🇳' },
  { code: '+223', country: 'Mali', flag: '🇲🇱' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  
  // Afrique Centrale
  { code: '+237', country: 'Cameroun', flag: '🇨🇲' },
  { code: '+242', country: 'Congo', flag: '🇨🇬' },
  { code: '+243', country: 'RD Congo', flag: '🇨🇩' },
  { code: '+241', country: 'Gabon', flag: '🇬🇦' },
  
  // Afrique du Nord
  { code: '+212', country: 'Maroc', flag: '🇲🇦' },
  { code: '+213', country: 'Algérie', flag: '🇩🇿' },
  { code: '+216', country: 'Tunisie', flag: '🇹🇳' },
  { code: '+20', country: 'Égypte', flag: '🇪🇬' },
  
  // Europe
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+32', country: 'Belgique', flag: '🇧🇪' },
  { code: '+41', country: 'Suisse', flag: '🇨🇭' },
  { code: '+44', country: 'Royaume-Uni', flag: '🇬🇧' },
  { code: '+49', country: 'Allemagne', flag: '🇩🇪' },
  { code: '+34', country: 'Espagne', flag: '🇪🇸' },
  { code: '+39', country: 'Italie', flag: '🇮🇹' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  
  // Amérique
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+55', country: 'Brésil', flag: '🇧🇷' },
  
  // Asie
  { code: '+86', country: 'Chine', flag: '🇨🇳' },
  { code: '+91', country: 'Inde', flag: '🇮🇳' },
];

/**
 * Composant de saisie de numéro de téléphone avec sélecteur d'indicatif
 */
const PhoneInput = ({ value = '', onChange, disabled = false, autoFocus = false }) => {
  const [selectedCode, setSelectedCode] = useState('+225'); // Côte d'Ivoire par défaut
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setSelectedCode(newCode);
    // Mettre à jour le numéro complet
    const cleanedNumber = phoneNumber.replace(/\s/g, '');
    const fullNumber = cleanedNumber ? `${newCode}${cleanedNumber}` : newCode;
    if (onChange && typeof onChange === 'function') {
      onChange(fullNumber);
    }
  };

  const handleNumberChange = (e) => {
    // Ne garder que les chiffres et espaces
    let cleaned = e.target.value.replace(/[^\d\s]/g, '');
    
    // Supprimer le 0 initial si présent (format local)
    // Ex: "06 12 34 56 78" devient "6 12 34 56 78"
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    setPhoneNumber(cleaned);
    
    // Mettre à jour le numéro complet (sans espaces)
    const cleanedNumber = cleaned.replace(/\s/g, '');
    const fullNumber = cleanedNumber ? `${selectedCode}${cleanedNumber}` : '';
    if (onChange && typeof onChange === 'function') {
      onChange(fullNumber);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Numéro de téléphone
      </label>
      
      <div className="flex gap-2">
        {/* Sélecteur d'indicatif */}
        <div className="relative w-40">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Phone size={18} className="text-gray-400" />
          </div>
          <select
            value={selectedCode}
            onChange={handleCodeChange}
            disabled={disabled}
            className="w-full pl-10 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer"
          >
            {COUNTRY_CODES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.code}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <ChevronDown size={18} className="text-gray-400" />
          </div>
        </div>

        {/* Input du numéro */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handleNumberChange}
          placeholder="07 12 34 56 78"
          disabled={disabled}
          autoFocus={autoFocus}
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <div className="mt-2 space-y-1">
        <p className="text-xs text-gray-500">
          Sélectionnez votre pays et entrez votre numéro
        </p>
        <p className="text-xs text-gray-600">
          Numéro complet : <span className="font-mono font-semibold text-orange-600">{selectedCode}{phoneNumber.replace(/\s/g, '')}</span>
        </p>
      </div>
    </div>
  );
};

export default PhoneInput;
