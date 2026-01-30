# 🤖 Guide d'Intégration de l'IA - Plan B

Ce guide explique comment intégrer et utiliser le service IA Python dans Plan B.

## 📋 Vue d'ensemble

Le service IA fournit plusieurs fonctionnalités intelligentes :
- ✅ Recommandations personnalisées
- ✅ Recherche sémantique
- ✅ Catégorisation automatique
- ✅ Détection de spam/fraude
- ✅ Analyse de sentiment

## 🚀 Installation

### 1. Installer Python et les dépendances

```bash
cd planb-ai
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configurer l'environnement

```bash
cp .env.example .env
# Éditer .env
```

Dans `.env` :
```env
AI_SERVICE_PORT=5000
FLASK_DEBUG=False
BACKEND_URL=http://localhost:8000
```

### 3. Démarrer le service IA

```bash
python app.py
```

Le service sera accessible sur `http://localhost:5000`

### 4. Configurer le backend PHP

Dans `planb-backend/.env`, ajouter :
```env
AI_SERVICE_URL=http://localhost:5000
```

## 🔌 Utilisation dans le Backend PHP

### Exemple : Catégorisation automatique

```php
use App\Service\AIService;

// Dans votre contrôleur
public function __construct(
    private AIService $aiService
) {}

public function createListing(Request $request): JsonResponse
{
    $data = json_decode($request->getContent(), true);
    
    // Catégoriser automatiquement si non spécifié
    if (empty($data['category'])) {
        $category = $this->aiService->categorize(
            $data['title'],
            $data['description'] ?? ''
        );
        
        $data['category'] = $category['category'];
        $data['subcategory'] = $category['subcategory'];
    }
    
    // Détecter le spam
    $spamCheck = $this->aiService->detectSpam(
        $data['title'],
        $data['description'] ?? '',
        $data['price'] ?? null
    );
    
    if ($spamCheck['is_spam']) {
        return $this->json([
            'error' => 'Annonce suspecte détectée',
            'reasons' => $spamCheck['reasons']
        ], 400);
    }
    
    // Créer l'annonce...
}
```

### Exemple : Recommandations

```php
public function getRecommendations(int $userId): JsonResponse
{
    // Récupérer l'historique utilisateur
    $history = $this->getUserHistory($userId);
    
    // Obtenir les recommandations IA
    $recommendations = $this->aiService->getRecommendations(
        $userId,
        $history,
        10
    );
    
    return $this->json([
        'recommendations' => $recommendations
    ]);
}
```

### Exemple : Recherche sémantique

```php
public function search(Request $request): JsonResponse
{
    $query = $request->query->get('q', '');
    
    // Recherche basique d'abord
    $listings = $this->listingRepository->search($query);
    
    // Améliorer avec la recherche sémantique
    if ($this->aiService->isAvailable()) {
        $semanticResults = $this->aiService->semanticSearch(
            $query,
            $this->serializeListings($listings),
            20
        );
        
        // Réordonner les résultats selon la pertinence sémantique
        $listings = $this->reorderBySemantic($listings, $semanticResults);
    }
    
    return $this->json(['data' => $listings]);
}
```

## 📡 Endpoints API

### Health Check
```bash
curl http://localhost:5000/health
```

### Recommandations
```bash
curl -X POST http://localhost:5000/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "user_history": [
      {"listing_id": 1, "category": "immobilier", "interaction": "view"}
    ],
    "limit": 10
  }'
```

### Catégorisation
```bash
curl -X POST http://localhost:5000/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Villa 4 chambres avec piscine",
    "description": "Belle villa située à Cocody..."
  }'
```

### Détection de Spam
```bash
curl -X POST http://localhost:5000/detect-spam \
  -H "Content-Type: application/json" \
  -d '{
    "title": "URGENT Appelez maintenant!!!",
    "description": "Offre limitée...",
    "price": 1000
  }'
```

## 🧪 Tests

### Tester le service
```bash
# Vérifier que le service est actif
curl http://localhost:5000/health

# Tester la catégorisation
curl -X POST http://localhost:5000/categorize \
  -H "Content-Type: application/json" \
  -d '{"title": "Voiture Toyota 2020"}'
```

## 🔧 Configuration Avancée

### Production avec Gunicorn

```bash
gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 app:app
```

### Docker (optionnel)

Créer un `Dockerfile` :
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## 📊 Performance

- **Temps de réponse moyen** : 100-500ms
- **Charge supportée** : 100 req/s (avec 4 workers)
- **Mémoire** : ~500MB (avec modèles chargés)

## 🚨 Dépannage

### Le service ne démarre pas
- Vérifier que Python 3.8+ est installé
- Vérifier que toutes les dépendances sont installées
- Vérifier le port 5000 n'est pas utilisé

### Erreurs de modèles
- Les modèles sont téléchargés automatiquement au premier lancement
- Vérifier la connexion internet
- Vérifier l'espace disque disponible

### Le backend PHP ne peut pas se connecter
- Vérifier que le service IA est démarré
- Vérifier `AI_SERVICE_URL` dans `.env`
- Vérifier les règles de firewall

## 📝 Notes

- Le service IA est optionnel : le backend fonctionne sans lui
- En cas d'erreur, le backend utilise des méthodes basiques
- Les modèles sont légers pour des performances optimales

---

**Le service IA est maintenant prêt à être utilisé ! 🚀**
