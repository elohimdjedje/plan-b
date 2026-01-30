"""
Service de recommandations personnalisées
Utilise un système de filtrage collaboratif et de contenu
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging
import pickle
import os

logger = logging.getLogger(__name__)

class RecommendationService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='french',
            ngram_range=(1, 2)
        )
        self.model_path = 'models/recommendation_model.pkl'
        self.load_or_create_model()
    
    def load_or_create_model(self):
        """Charger ou créer le modèle de recommandation"""
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, 'rb') as f:
                    self.vectorizer = pickle.load(f)
                logger.info("Recommendation model loaded")
            except Exception as e:
                logger.warning(f"Could not load model: {e}. Creating new one.")
                self.vectorizer = TfidfVectorizer(
                    max_features=1000,
                    stop_words='french',
                    ngram_range=(1, 2)
                )
        else:
            os.makedirs('models', exist_ok=True)
    
    def get_recommendations(self, user_id, user_history, limit=10):
        """
        Obtenir des recommandations basées sur l'historique utilisateur
        
        Args:
            user_id: ID de l'utilisateur
            user_history: Liste des interactions passées
            limit: Nombre de recommandations à retourner
        
        Returns:
            Liste de IDs d'annonces recommandées avec scores
        """
        try:
            if not user_history:
                return []
            
            # Extraire les catégories et mots-clés de l'historique
            categories = {}
            keywords = []
            
            for item in user_history:
                category = item.get('category', '')
                if category:
                    categories[category] = categories.get(category, 0) + 1
                
                # Extraire les mots-clés des interactions
                listing_id = item.get('listing_id')
                if listing_id:
                    keywords.append(f"listing_{listing_id}")
            
            # Calculer les scores de recommandation
            recommendations = []
            
            # Basé sur les catégories préférées
            for category, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
                recommendations.append({
                    'category': category,
                    'score': count / len(user_history),
                    'reason': 'Basé sur votre historique'
                })
            
            # Limiter le nombre de résultats
            recommendations = recommendations[:limit]
            
            logger.info(f"Generated {len(recommendations)} recommendations for user {user_id}")
            
            return recommendations
        
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return []
    
    def find_similar_listings(self, listing_id, title, description, category=None, limit=5):
        """
        Trouver des annonces similaires basées sur le contenu
        
        Args:
            listing_id: ID de l'annonce de référence
            title: Titre de l'annonce
            description: Description de l'annonce
            category: Catégorie (optionnel)
            limit: Nombre de résultats
        
        Returns:
            Liste d'annonces similaires avec scores
        """
        try:
            # Pour l'instant, retourner une structure basique
            # Dans une implémentation complète, on comparerait avec toutes les annonces
            similar = []
            
            # Exemple de structure de réponse
            text = f"{title} {description}"
            
            # Calculer un score de similarité basique
            # (Dans une vraie implémentation, on utiliserait des embeddings)
            score = 0.85  # Score simulé
            
            similar.append({
                'listing_id': listing_id,
                'similarity_score': score,
                'reason': 'Annonce similaire trouvée'
            })
            
            return similar[:limit]
        
        except Exception as e:
            logger.error(f"Error finding similar listings: {e}")
            return []
