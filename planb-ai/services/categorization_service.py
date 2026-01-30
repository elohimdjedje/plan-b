"""
Service de catégorisation automatique
Classifie les annonces dans les bonnes catégories
"""

import logging
import re

logger = logging.getLogger(__name__)

class CategorizationService:
    def __init__(self):
        # Mots-clés pour chaque catégorie
        self.category_keywords = {
            'immobilier': {
                'keywords': ['villa', 'maison', 'appartement', 'appart', 'studio', 'terrain', 
                           'parcelle', 'immeuble', 'bureau', 'local', 'commerce', 'chambre',
                           'cuisine', 'salon', 'salle de bain', 'piscine', 'jardin', 'garage'],
                'subcategories': {
                    'vente': ['vendre', 'vente', 'à vendre', 'vendu'],
                    'location': ['louer', 'location', 'à louer', 'loué'],
                    'recherche': ['cherche', 'recherche', 'recherché']
                }
            },
            'vehicule': {
                'keywords': ['voiture', 'auto', 'véhicule', 'moto', 'scooter', 'camion', 
                           'bus', 'car', 'moto', 'moto', 'vélo', 'bicyclette'],
                'subcategories': {
                    'voiture': ['voiture', 'auto', 'automobile', 'car'],
                    'moto': ['moto', 'motocyclette', 'scooter'],
                    'autre': ['camion', 'bus', 'vélo']
                }
            },
            'emploi': {
                'keywords': ['emploi', 'travail', 'job', 'poste', 'recrutement', 'cv', 
                           'offre d\'emploi', 'cherche travail'],
                'subcategories': {
                    'offre': ['offre', 'recrutement', 'poste'],
                    'demande': ['cherche', 'recherche', 'cv']
                }
            },
            'service': {
                'keywords': ['service', 'prestation', 'aide', 'assistance', 'réparation',
                           'maintenance', 'nettoyage', 'plomberie', 'électricité'],
                'subcategories': {}
            },
            'vacance': {
                'keywords': ['hôtel', 'chambre', 'vacance', 'séjour', 'location vacance',
                           'airbnb', 'réservation'],
                'subcategories': {}
            }
        }
    
    def categorize(self, title, description=''):
        """
        Catégoriser une annonce automatiquement
        
        Args:
            title: Titre de l'annonce
            description: Description (optionnel)
        
        Returns:
            Dict avec category, subcategory et confidence
        """
        try:
            text = f"{title} {description}".lower()
            
            # Calculer les scores pour chaque catégorie
            category_scores = {}
            
            for category, data in self.category_keywords.items():
                score = 0
                keywords = data.get('keywords', [])
                
                for keyword in keywords:
                    if keyword in text:
                        score += 1
                
                # Normaliser le score
                if keywords:
                    score = score / len(keywords)
                
                category_scores[category] = score
            
            # Trouver la catégorie avec le score le plus élevé
            if not category_scores or max(category_scores.values()) == 0:
                return {
                    'category': 'autre',
                    'subcategory': None,
                    'confidence': 0.3
                }
            
            best_category = max(category_scores, key=category_scores.get)
            confidence = category_scores[best_category]
            
            # Déterminer la sous-catégorie
            subcategory = None
            if best_category in self.category_keywords:
                subcats = self.category_keywords[best_category].get('subcategories', {})
                for subcat, keywords in subcats.items():
                    if any(kw in text for kw in keywords):
                        subcategory = subcat
                        break
            
            return {
                'category': best_category,
                'subcategory': subcategory,
                'confidence': min(confidence, 1.0)
            }
        
        except Exception as e:
            logger.error(f"Error in categorization: {e}")
            return {
                'category': 'autre',
                'subcategory': None,
                'confidence': 0.0
            }
