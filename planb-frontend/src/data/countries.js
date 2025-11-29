/**
 * Liste des pays et nationalités
 */
export const countries = [
  // Afrique
  { code: 'CI', name: "Côte d'Ivoire", nationality: 'Ivoirienne' },
  { code: 'SN', name: 'Sénégal', nationality: 'Sénégalaise' },
  { code: 'ML', name: 'Mali', nationality: 'Malienne' },
  { code: 'BF', name: 'Burkina Faso', nationality: 'Burkinabè' },
  { code: 'BJ', name: 'Bénin', nationality: 'Béninoise' },
  { code: 'TG', name: 'Togo', nationality: 'Togolaise' },
  { code: 'GN', name: 'Guinée', nationality: 'Guinéenne' },
  { code: 'NE', name: 'Niger', nationality: 'Nigérienne' },
  { code: 'CM', name: 'Cameroun', nationality: 'Camerounaise' },
  { code: 'GA', name: 'Gabon', nationality: 'Gabonaise' },
  { code: 'CG', name: 'Congo', nationality: 'Congolaise' },
  { code: 'CD', name: 'RD Congo', nationality: 'Congolaise (RDC)' },
  { code: 'MA', name: 'Maroc', nationality: 'Marocaine' },
  { code: 'DZ', name: 'Algérie', nationality: 'Algérienne' },
  { code: 'TN', name: 'Tunisie', nationality: 'Tunisienne' },
  { code: 'EG', name: 'Égypte', nationality: 'Égyptienne' },
  { code: 'NG', name: 'Nigeria', nationality: 'Nigériane' },
  { code: 'GH', name: 'Ghana', nationality: 'Ghanéenne' },
  { code: 'KE', name: 'Kenya', nationality: 'Kényane' },
  { code: 'ZA', name: 'Afrique du Sud', nationality: 'Sud-Africaine' },
  
  // Europe
  { code: 'FR', name: 'France', nationality: 'Française' },
  { code: 'BE', name: 'Belgique', nationality: 'Belge' },
  { code: 'CH', name: 'Suisse', nationality: 'Suisse' },
  { code: 'DE', name: 'Allemagne', nationality: 'Allemande' },
  { code: 'GB', name: 'Royaume-Uni', nationality: 'Britannique' },
  { code: 'ES', name: 'Espagne', nationality: 'Espagnole' },
  { code: 'IT', name: 'Italie', nationality: 'Italienne' },
  { code: 'PT', name: 'Portugal', nationality: 'Portugaise' },
  { code: 'NL', name: 'Pays-Bas', nationality: 'Néerlandaise' },
  { code: 'LU', name: 'Luxembourg', nationality: 'Luxembourgeoise' },
  { code: 'AT', name: 'Autriche', nationality: 'Autrichienne' },
  { code: 'PL', name: 'Pologne', nationality: 'Polonaise' },
  { code: 'SE', name: 'Suède', nationality: 'Suédoise' },
  { code: 'NO', name: 'Norvège', nationality: 'Norvégienne' },
  { code: 'DK', name: 'Danemark', nationality: 'Danoise' },
  { code: 'FI', name: 'Finlande', nationality: 'Finlandaise' },
  { code: 'IE', name: 'Irlande', nationality: 'Irlandaise' },
  { code: 'GR', name: 'Grèce', nationality: 'Grecque' },
  
  // Amérique
  { code: 'US', name: 'États-Unis', nationality: 'Américaine' },
  { code: 'CA', name: 'Canada', nationality: 'Canadienne' },
  { code: 'BR', name: 'Brésil', nationality: 'Brésilienne' },
  { code: 'MX', name: 'Mexique', nationality: 'Mexicaine' },
  { code: 'AR', name: 'Argentine', nationality: 'Argentine' },
  
  // Asie & Moyen-Orient
  { code: 'CN', name: 'Chine', nationality: 'Chinoise' },
  { code: 'JP', name: 'Japon', nationality: 'Japonaise' },
  { code: 'IN', name: 'Inde', nationality: 'Indienne' },
  { code: 'AE', name: 'Émirats Arabes Unis', nationality: 'Émiratie' },
  { code: 'SA', name: 'Arabie Saoudite', nationality: 'Saoudienne' },
  { code: 'LB', name: 'Liban', nationality: 'Libanaise' },
  { code: 'TR', name: 'Turquie', nationality: 'Turque' },
];

/**
 * Obtenir la nationalité par code pays
 */
export const getNationalityByCode = (countryCode) => {
  const country = countries.find(c => c.code === countryCode);
  return country?.nationality || '';
};

/**
 * Obtenir le nom du pays par code
 */
export const getCountryNameByCode = (countryCode) => {
  const country = countries.find(c => c.code === countryCode);
  return country?.name || countryCode;
};
