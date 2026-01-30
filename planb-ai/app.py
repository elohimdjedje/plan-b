"""
Service IA pour Plan B - Plateforme de petites annonces
Fonctionnalités:
- Recommandations personnalisées
- Recherche sémantique
- Catégorisation automatique
- Détection de spam/fraude
- Analyse de sentiment
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging

from services.recommendation_service import RecommendationService
from services.semantic_search_service import SemanticSearchService
from services.categorization_service import CategorizationService
from services.spam_detection_service import SpamDetectionService
from services.sentiment_analysis_service import SentimentAnalysisService

# Charger les variables d'environnement
load_dotenv()

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Autoriser les requêtes cross-origin depuis le backend PHP

# Initialiser les services
recommendation_service = RecommendationService()
semantic_search_service = SemanticSearchService()
categorization_service = CategorizationService()
spam_detection_service = SpamDetectionService()
sentiment_analysis_service = SentimentAnalysisService()

@app.route('/health', methods=['GET'])
def health():
    """Endpoint de santé pour vérifier que le service est actif"""
    return jsonify({
        'status': 'healthy',
        'service': 'Plan B AI Service',
        'version': '1.0.0'
    })

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    """
    Obtenir des recommandations personnalisées pour un utilisateur
    
    Body JSON:
    {
        "user_id": 123,
        "user_history": [
            {"listing_id": 1, "category": "immobilier", "interaction": "view"},
            {"listing_id": 2, "category": "vehicule", "interaction": "contact"}
        ],
        "limit": 10
    }
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        user_history = data.get('user_history', [])
        limit = data.get('limit', 10)
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        recommendations = recommendation_service.get_recommendations(
            user_id=user_id,
            user_history=user_history,
            limit=limit
        )
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
    
    except Exception as e:
        logger.error(f"Error in recommendations: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/semantic-search', methods=['POST'])
def semantic_search():
    """
    Recherche sémantique d'annonces
    
    Body JSON:
    {
        "query": "appartement 3 chambres à Cocody",
        "listings": [
            {"id": 1, "title": "...", "description": "..."},
            {"id": 2, "title": "...", "description": "..."}
        ],
        "limit": 10
    }
    """
    try:
        data = request.get_json()
        query = data.get('query', '')
        listings = data.get('listings', [])
        limit = data.get('limit', 10)
        
        if not query:
            return jsonify({'error': 'query is required'}), 400
        
        results = semantic_search_service.search(query, listings, limit)
        
        return jsonify({
            'success': True,
            'results': results
        })
    
    except Exception as e:
        logger.error(f"Error in semantic search: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/categorize', methods=['POST'])
def categorize():
    """
    Catégoriser automatiquement une annonce
    
    Body JSON:
    {
        "title": "Villa 4 chambres avec piscine",
        "description": "Belle villa située à Cocody..."
    }
    """
    try:
        data = request.get_json()
        title = data.get('title', '')
        description = data.get('description', '')
        
        if not title:
            return jsonify({'error': 'title is required'}), 400
        
        category = categorization_service.categorize(title, description)
        
        return jsonify({
            'success': True,
            'category': category['category'],
            'subcategory': category.get('subcategory'),
            'confidence': category.get('confidence', 0.0)
        })
    
    except Exception as e:
        logger.error(f"Error in categorization: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/detect-spam', methods=['POST'])
def detect_spam():
    """
    Détecter si une annonce est du spam ou suspecte
    
    Body JSON:
    {
        "title": "...",
        "description": "...",
        "price": 1000000,
        "user_id": 123
    }
    """
    try:
        data = request.get_json()
        title = data.get('title', '')
        description = data.get('description', '')
        price = data.get('price')
        user_id = data.get('user_id')
        
        if not title:
            return jsonify({'error': 'title is required'}), 400
        
        result = spam_detection_service.detect(
            title=title,
            description=description,
            price=price,
            user_id=user_id
        )
        
        return jsonify({
            'success': True,
            'is_spam': result['is_spam'],
            'confidence': result['confidence'],
            'reasons': result.get('reasons', [])
        })
    
    except Exception as e:
        logger.error(f"Error in spam detection: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    """
    Analyser le sentiment d'un texte (avis, commentaire, etc.)
    
    Body JSON:
    {
        "text": "Excellent vendeur, très professionnel!"
    }
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'text is required'}), 400
        
        result = sentiment_analysis_service.analyze(text)
        
        return jsonify({
            'success': True,
            'sentiment': result['sentiment'],  # positive, negative, neutral
            'score': result['score'],  # -1 to 1
            'confidence': result['confidence']
        })
    
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/similar-listings', methods=['POST'])
def similar_listings():
    """
    Trouver des annonces similaires
    
    Body JSON:
    {
        "listing_id": 123,
        "title": "...",
        "description": "...",
        "category": "immobilier",
        "limit": 5
    }
    """
    try:
        data = request.get_json()
        listing_id = data.get('listing_id')
        title = data.get('title', '')
        description = data.get('description', '')
        category = data.get('category')
        limit = data.get('limit', 5)
        
        if not listing_id or not title:
            return jsonify({'error': 'listing_id and title are required'}), 400
        
        similar = recommendation_service.find_similar_listings(
            listing_id=listing_id,
            title=title,
            description=description,
            category=category,
            limit=limit
        )
        
        return jsonify({
            'success': True,
            'similar_listings': similar
        })
    
    except Exception as e:
        logger.error(f"Error in similar listings: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('AI_SERVICE_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting Plan B AI Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
