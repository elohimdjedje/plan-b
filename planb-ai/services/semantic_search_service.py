"""
Service de recherche sémantique
Utilise des embeddings pour une recherche plus intelligente
"""

import logging
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class SemanticSearchService:
    def __init__(self):
        # Utiliser un modèle multilingue pour le français
        try:
            self.model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
            logger.info("Semantic search model loaded")
        except Exception as e:
            logger.warning(f"Could not load sentence transformer: {e}")
            self.model = None
    
    def search(self, query, listings, limit=10):
        """
        Recherche sémantique dans les annonces
        
        Args:
            query: Requête de recherche
            listings: Liste des annonces à rechercher
            limit: Nombre de résultats
        
        Returns:
            Liste d'annonces triées par pertinence sémantique
        """
        try:
            if not self.model or not listings:
                # Fallback: recherche basique par mots-clés
                return self._basic_search(query, listings, limit)
            
            # Créer les embeddings pour la requête
            query_embedding = self.model.encode([query], convert_to_numpy=True)
            
            # Créer les embeddings pour toutes les annonces
            texts = []
            for listing in listings:
                text = f"{listing.get('title', '')} {listing.get('description', '')}"
                texts.append(text)
            
            listing_embeddings = self.model.encode(texts, convert_to_numpy=True)
            
            # Calculer les similarités cosinus
            similarities = cosine_similarity(query_embedding, listing_embeddings)[0]
            
            # Trier par similarité
            results = []
            for i, listing in enumerate(listings):
                results.append({
                    'listing_id': listing.get('id'),
                    'title': listing.get('title'),
                    'similarity_score': float(similarities[i]),
                    'relevance': self._get_relevance_label(similarities[i])
                })
            
            # Trier par score décroissant
            results.sort(key=lambda x: x['similarity_score'], reverse=True)
            
            return results[:limit]
        
        except Exception as e:
            logger.error(f"Error in semantic search: {e}")
            return self._basic_search(query, listings, limit)
    
    def _basic_search(self, query, listings, limit):
        """Recherche basique par mots-clés (fallback)"""
        query_lower = query.lower()
        query_words = set(query_lower.split())
        
        results = []
        for listing in listings:
            title = listing.get('title', '').lower()
            description = listing.get('description', '').lower()
            text = f"{title} {description}"
            
            # Compter les mots correspondants
            matches = sum(1 for word in query_words if word in text)
            score = matches / len(query_words) if query_words else 0
            
            if score > 0:
                results.append({
                    'listing_id': listing.get('id'),
                    'title': listing.get('title'),
                    'similarity_score': score,
                    'relevance': self._get_relevance_label(score)
                })
        
        results.sort(key=lambda x: x['similarity_score'], reverse=True)
        return results[:limit]
    
    def _get_relevance_label(self, score):
        """Convertir un score en label de pertinence"""
        if score >= 0.8:
            return 'très pertinent'
        elif score >= 0.6:
            return 'pertinent'
        elif score >= 0.4:
            return 'modérément pertinent'
        else:
            return 'peu pertinent'
