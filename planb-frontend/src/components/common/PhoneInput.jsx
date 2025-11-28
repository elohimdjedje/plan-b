import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Composant de saisie téléphonique avec sélecteur d'indicatif international
 * Style Wave avec drapeaux
 */

const COUNTRIES = [
  { code: 'CI', dialCode: '+225', flag: '🇨🇮', name: 'Côte d\'Ivoire' },
  { code: 'SN', dialCode: '+221', flag: '🇸🇳', name: 'Sénégal' },
  { code: 'BJ', dialCode: '+229', flag: '🇧🇯', name: 'Bénin' },
  { code: 'ML', dialCode: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: 'BF', dialCode: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: 'TG', dialCode: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: 'NE', dialCode: '+227', flag: '🇳🇪', name: 'Niger' },
  { code: 'GN', dialCode: '+224', flag: '🇬🇳', name: 'Guinée' },
  { code: 'CM', dialCode: '+237', flag: '🇨🇲', name: 'Cameroun' },
  { code: 'GA', dialCode: '+241', flag: '🇬🇦', name: 'Gabon' },
  { code: 'CD', dialCode: '+243', flag: '🇨🇩', name: 'RD Congo' },
  { code: 'MA', dialCode: '+212', flag: '🇲🇦', name: 'Maroc' },
];

export default function PhoneInput({ 
  label, 
  value = '', 
  onChange, 
  placeholder = 'XX XX XX XX',
  required = false,
  error = null,
  defaultCountry = 'CI'
}) {
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find(c => c.code === defaultCountry) || COUNTRIES[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(value.replace(/^\+\d+\s*/, '')); // Enlever l'indicatif du numéro

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    // Mettre à jour la valeur complète
    if (onChange) {
      onChange(phoneNumber ? `${country.dialCode} ${phoneNumber}` : '');
    }
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    // Permettre seulement les chiffres et espaces
    val = val.replace(/[^\d\s]/g, '');
    
    setPhoneNumber(val);
    
    // Envoyer la valeur complète au parent
    if (onChange) {
      onChange(val ? `${selectedCountry.dialCode} ${val}` : '');
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="flex gap-2">
        {/* Sélecteur d'indicatif */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[110px]"
          >
            <span className="text-2xl">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-secondary-700">{selectedCountry.dialCode}</span>
            <ChevronDown 
              size={16} 
              className={`text-secondary-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown des pays */}
          {isDropdownOpen && (
            <>
              {/* Overlay pour fermer le dropdown */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)}
              />
              
              {/* Menu déroulant */}
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 max-h-80 overflow-y-auto">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors ${
                      selectedCountry.code === country.code ? 'bg-primary-50' : ''
                    }`}
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-secondary-900">{country.name}</div>
                      <div className="text-xs text-secondary-500">{country.code}</div>
                    </div>
                    <span className="text-sm font-medium text-primary-600">{country.dialCode}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Champ de saisie du numéro */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          required={required}
          className={`flex-1 px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        />
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      
      {/* Helper text */}
      {!error && (
        <p className="text-xs text-secondary-500 mt-1">
          Exemple: {selectedCountry.dialCode} 07 12 34 56 78
        </p>
      )}
    </div>
  );
}
