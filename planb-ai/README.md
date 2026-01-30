# 🤖 Service IA pour Plan B

Service d'intelligence artificielle pour la plateforme Plan B, implémenté en Python avec Flask.

## 🎯 Fonctionnalités

### 1. **Recommandations Personnalisées**
- Recommandations basées sur l'historique utilisateur
- Filtrage collaboratif
- Suggestions d'annonces similaires

### 2. **Recherche Sémantique**
- Recherche intelligente utilisant des embeddings
- Compréhension du contexte et des synonymes
- Meilleure pertinence des résultats

### 3. **Catégorisation Automatique**
- Classification automatique des annonces
- Détection de la catégorie et sous-catégorie
- Score de confiance

### 4. **Détection de Spam/Fraude**
- Détection d'annonces suspectes
- Analyse de patterns frauduleux
- Score de risque

### 5. **Analyse de Sentiment**
- Analyse des avis et commentaires
- Détection de sentiment positif/négatif/neutre
- Score de confiance

## 🚀 Installation

### Prérequis
- Python 3.8+
- pip

### Étapes

1. **Créer un environnement virtuel** (recommandé)
```bash
cd planb-ai
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

2. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

3. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

4. **Démarrer le service**
```bash
python app.py
```

Ou avec Gunicorn (production):
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Recommandations
```
POST /recommendations
Body: {
    "user_id": 123,
    "user_history": [...],
    "limit": 10
}
```

### Recherche Sémantique
```
POST /semantic-search
Body: {
    "query": "appartement 3 chambres",
    "listings": [...],
    "limit": 10
}
```

### Catégorisation
```
POST /categorize
Body: {
    "title": "Villa 4 chambres",
    "description": "..."
}
```

### Détection de Spam
```
POST /detect-spam
Body: {
    "title": "...",
    "description": "...",
    "price": 1000000
}
```

### Analyse de Sentiment
```
POST /analyze-sentiment
Body: {
    "text": "Excellent vendeur!"
}
```

### Annonces Similaires
```
POST /similar-listings
Body: {
    "listing_id": 123,
    "title": "...",
    "description": "..."
}
```

## 🔌 Intégration avec le Backend PHP

Le backend PHP peut appeler ce service via HTTP. Voir `planb-backend/src/Service/AIService.php` pour l'intégration.

## 📦 Structure

```
planb-ai/
├── app.py                 # Application Flask principale
├── services/              # Services IA
│   ├── recommendation_service.py
│   ├── semantic_search_service.py
│   ├── categorization_service.py
│   ├── spam_detection_service.py
│   └── sentiment_analysis_service.py
├── models/                # Modèles ML sauvegardés
├── requirements.txt       # Dépendances Python
├── .env.example          # Exemple de configuration
└── README.md             # Ce fichier
```

## 🧪 Tests

```bash
# Tester le service
curl http://localhost:5000/health

# Tester les recommandations
curl -X POST http://localhost:5000/recommendations \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "user_history": [], "limit": 5}'
```

## 🔧 Configuration

Voir `.env.example` pour toutes les options de configuration.

## 📝 Notes

- Les modèles sont téléchargés automatiquement au premier lancement
- Le service utilise des modèles légers pour des performances optimales
- En production, utilisez Gunicorn avec plusieurs workers

## 🚀 Déploiement

Pour la production, utilisez Gunicorn:

```bash
gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 app:app
```

Ou avec Docker (voir `Dockerfile` si créé).
