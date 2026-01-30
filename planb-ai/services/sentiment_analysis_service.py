"""
Service d'analyse de sentiment
Analyse le sentiment des avis et commentaires
"""

import logging
import re

logger = logging.getLogger(__name__)

class SentimentAnalysisService:
    def __init__(self):
        # Mots positifs
        self.positive_words = [
            'excellent', 'super', 'génial', 'parfait', 'merveilleux',
            'fantastique', 'formidable', 'satisfait', 'content', 'heureux',
            'recommandé', 'professionnel', 'rapide', 'efficace', 'qualité',
            'bon', 'bien', 'top', 'cool', 'sympa', 'agréable'
        ]
        
        # Mots négatifs
        self.negative_words = [
            'mauvais', 'nul', 'décevant', 'horrible', 'terrible',
            'déçu', 'insatisfait', 'problème', 'erreur', 'défaut',
            'lent', 'inefficace', 'mauvaise qualité', 'pas bien',
            'éviter', 'ne pas recommander', 'arnaque', 'fraude'
        ]
        
        # Mots neutres
        self.neutral_words = [
            'ok', 'correct', 'moyen', 'normal', 'standard'
        ]
    
    def analyze(self, text):
        """
        Analyser le sentiment d'un texte
        
        Args:
            text: Texte à analyser
        
        Returns:
            Dict avec sentiment, score et confidence
        """
        try:
            text_lower = text.lower()
            words = re.findall(r'\b\w+\b', text_lower)
            
            positive_count = sum(1 for word in words if word in self.positive_words)
            negative_count = sum(1 for word in words if self.negative_words)
            neutral_count = sum(1 for word in words if word in self.neutral_words)
            
            total_sentiment_words = positive_count + negative_count + neutral_count
            
            if total_sentiment_words == 0:
                return {
                    'sentiment': 'neutral',
                    'score': 0.0,
                    'confidence': 0.3
                }
            
            # Calculer le score (-1 à 1)
            score = (positive_count - negative_count) / max(total_sentiment_words, 1)
            
            # Déterminer le sentiment
            if score > 0.2:
                sentiment = 'positive'
            elif score < -0.2:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
            
            # Calculer la confiance
            confidence = min(abs(score) * 2, 1.0)
            
            return {
                'sentiment': sentiment,
                'score': float(score),
                'confidence': confidence
            }
        
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {e}")
            return {
                'sentiment': 'neutral',
                'score': 0.0,
                'confidence': 0.0
            }
