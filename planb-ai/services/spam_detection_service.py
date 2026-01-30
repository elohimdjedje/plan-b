"""
Service de détection de spam et fraude
Détecte les annonces suspectes ou frauduleuses
"""

import logging
import re

logger = logging.getLogger(__name__)

class SpamDetectionService:
    def __init__(self):
        # Patterns suspects
        self.suspicious_patterns = [
            r'\b(?:urgent|urgente|rapide|immédiat)\b.*\b(?:appelez|contactez|whatsapp|tel)\b',
            r'\b\d{8,}\b',  # Numéros de téléphone dans le texte
            r'(.)\1{4,}',  # Caractères répétés (ex: "aaaaa")
            r'[A-Z]{5,}',  # Trop de majuscules
            r'http[s]?://',  # URLs suspectes
            r'\b(?:gratuit|free|gratis)\b.*\b(?:cliquez|click|lien)\b',
        ]
        
        # Mots-clés de spam
        self.spam_keywords = [
            'gagnez de l\'argent', 'travail à domicile', 'revenu passif',
            'opportunité unique', 'offre limitée', 'cliquez ici',
            'gratuit maintenant', 'sans engagement'
        ]
    
    def detect(self, title, description='', price=None, user_id=None):
        """
        Détecter si une annonce est du spam
        
        Args:
            title: Titre de l'annonce
            description: Description
            price: Prix (optionnel)
            user_id: ID utilisateur (optionnel)
        
        Returns:
            Dict avec is_spam, confidence et reasons
        """
        try:
            text = f"{title} {description}".lower()
            reasons = []
            spam_score = 0
            
            # Vérifier les patterns suspects
            for pattern in self.suspicious_patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    spam_score += 0.2
                    reasons.append(f"Pattern suspect détecté: {pattern}")
            
            # Vérifier les mots-clés de spam
            for keyword in self.spam_keywords:
                if keyword in text:
                    spam_score += 0.15
                    reasons.append(f"Mot-clé de spam: {keyword}")
            
            # Vérifier la longueur (trop court = suspect)
            if len(title) < 10:
                spam_score += 0.1
                reasons.append("Titre trop court")
            
            # Vérifier les répétitions excessives
            words = text.split()
            if len(words) > 0:
                unique_ratio = len(set(words)) / len(words)
                if unique_ratio < 0.3:  # Trop de répétitions
                    spam_score += 0.2
                    reasons.append("Trop de répétitions dans le texte")
            
            # Vérifier le prix (trop bas ou trop haut = suspect)
            if price is not None:
                if price < 1000:  # Prix anormalement bas
                    spam_score += 0.15
                    reasons.append("Prix anormalement bas")
                elif price > 100000000:  # Prix anormalement élevé
                    spam_score += 0.1
                    reasons.append("Prix anormalement élevé")
            
            # Normaliser le score
            confidence = min(spam_score, 1.0)
            is_spam = confidence >= 0.5
            
            return {
                'is_spam': is_spam,
                'confidence': confidence,
                'reasons': reasons[:5]  # Limiter à 5 raisons
            }
        
        except Exception as e:
            logger.error(f"Error in spam detection: {e}")
            return {
                'is_spam': False,
                'confidence': 0.0,
                'reasons': []
            }
