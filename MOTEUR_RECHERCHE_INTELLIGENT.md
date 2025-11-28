# 🔍 Moteur de Recherche Intelligent - Style Le Bon Coin

## ✅ Phase 1 : Fonctionnalités de Base (IMPLÉMENTÉES)

### 1. Interface Utilisateur

✅ **Modal de recherche** (`SearchModal.jsx`)
- Apparaît en plein écran (mobile) ou modal (desktop)
- Focus automatique sur l'input
- Animation fluide avec Framer Motion

✅ **Historique des recherches**
- Sauvegardé dans `localStorage` sous `planb_search_history`
- **Nettoyage automatique après 24h**
- Affiche l'heure relative ("Il y a 2h")
- Bouton pour supprimer une recherche
- Bouton "Effacer tout"

✅ **Recherches populaires**
- Liste pré-définie des recherches tendances
- Affiche le nombre d'annonces
- Icônes par catégorie

✅ **Suggestions en temps réel**
- S'affichent dès 2 caractères tapés
- Debounce de 300ms pour éviter trop de requêtes
- Affiche la catégorie et le type (vente/location)
- Compte le nombre d'annonces correspondantes

✅ **Page de résultats** (`SearchResults.jsx`)
- Affiche les résultats de la recherche
- Grille responsive 2x2 (mobile) à 4x4 (desktop)
- Message si aucun résultat
- Suggestions d'amélioration

---

## 🚀 Phase 2 : Moteur de Recherche Intelligent (À IMPLÉMENTER)

### Architecture Recommandée

```
Backend (Symfony/PHP)
├── Controller/SearchController.php
├── Service/SearchEngine.php
│   ├── QueryAnalyzer.php        → Analyse la requête
│   ├── QueryNormalizer.php      → Normalise et corrige
│   ├── ScoreCalculator.php      → Calcule la pertinence
│   └── SuggestionEngine.php     → Génère les suggestions
├── Repository/SearchRepository.php
└── Entity/SearchIndex.php       → Index de recherche
```

---

## 📊 1. Analyse de la Requête

### QueryAnalyzer.php

```php
class QueryAnalyzer
{
    /**
     * Analyse une requête utilisateur
     */
    public function analyze(string $query): AnalyzedQuery
    {
        return new AnalyzedQuery([
            'original' => $query,
            'normalized' => $this->normalize($query),
            'keywords' => $this->extractKeywords($query),
            'category' => $this->detectCategory($query),
            'attributes' => $this->extractAttributes($query),
            'location' => $this->extractLocation($query),
            'price' => $this->extractPrice($query),
        ]);
    }

    /**
     * Normalisation
     */
    private function normalize(string $query): string
    {
        // Minuscules
        $normalized = mb_strtolower($query);
        
        // Suppression accents
        $normalized = $this->removeAccents($normalized);
        
        // Gestion des fautes communes
        $normalized = $this->correctCommonMistakes($normalized);
        
        // Gestion des synonymes
        $normalized = $this->applySynonyms($normalized);
        
        return trim($normalized);
    }

    /**
     * Détection de la catégorie
     */
    private function detectCategory(string $query): ?string
    {
        $categoryKeywords = [
            'immobilier' => ['maison', 'appartement', 'villa', 'terrain', 'studio', 'duplex', 'triplex', 't2', 't3', 't4', 'f2', 'f3', 'pièces', 'chambre'],
            'vehicule' => ['voiture', 'moto', 'véhicule', 'auto', 'camion', 'bus', 'toyota', 'mercedes', 'bmw', 'honda', 'yamaha'],
            'vacance' => ['hôtel', 'hotel', 'séjour', 'vacances', 'location saisonnière', 'gîte', 'chambre d\'hôte'],
        ];

        foreach ($categoryKeywords as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (stripos($query, $keyword) !== false) {
                    return $category;
                }
            }
        }

        return null;
    }

    /**
     * Extraction d'attributs
     */
    private function extractAttributes(string $query): array
    {
        $attributes = [];

        // Nombre de pièces: "3 pièces", "T3", "F3", "3p"
        if (preg_match('/(\d+)\s*(pièces?|p|chambres?)/i', $query, $matches)) {
            $attributes['rooms'] = (int)$matches[1];
        }
        if (preg_match('/[TF](\d+)/i', $query, $matches)) {
            $attributes['rooms'] = (int)$matches[1];
        }

        // Surface: "100m2", "100 m²"
        if (preg_match('/(\d+)\s*m[²2]/i', $query, $matches)) {
            $attributes['surface'] = (int)$matches[1];
        }

        // Année: "2020", "année 2020"
        if (preg_match('/\b(19|20)\d{2}\b/', $query, $matches)) {
            $attributes['year'] = (int)$matches[0];
        }

        // Marque & Modèle voiture
        $brands = ['toyota', 'mercedes', 'bmw', 'honda', 'yamaha', 'peugeot', 'renault'];
        foreach ($brands as $brand) {
            if (stripos($query, $brand) !== false) {
                $attributes['brand'] = $brand;
            }
        }

        return $attributes;
    }

    /**
     * Correction des fautes communes
     */
    private function correctCommonMistakes(string $text): string
    {
        $corrections = [
            'appart' => 'appartement',
            'meison' => 'maison',
            'terrin' => 'terrain',
            'voitture' => 'voiture',
            'pousete' => 'poussette',
            'iphon' => 'iphone',
            'samsoung' => 'samsung',
        ];

        foreach ($corrections as $mistake => $correction) {
            $text = str_ireplace($mistake, $correction, $text);
        }

        return $text;
    }

    /**
     * Gestion des synonymes
     */
    private function applySynonyms(string $text): string
    {
        $synonyms = [
            'vélo' => 'bicyclette|vtt|velo',
            'canapé' => 'canape|sofa|divan',
            'voiture' => 'auto|automobile|vehicule',
            'maison' => 'residence|demeure',
        ];

        // Créer une regex pour chercher tous les synonymes
        // (à améliorer pour la recherche en base de données)
        return $text;
    }
}
```

---

## 🎯 2. Calcul de Score de Pertinence

### ScoreCalculator.php

```php
class ScoreCalculator
{
    // Pondérations
    const WEIGHT_TITLE = 40;
    const WEIGHT_CATEGORY = 25;
    const WEIGHT_DESCRIPTION = 15;
    const WEIGHT_LOCATION = 10;
    const WEIGHT_ATTRIBUTES = 5;
    const WEIGHT_POPULARITY = 5;

    /**
     * Calcule le score de pertinence d'une annonce
     */
    public function calculateScore(Listing $listing, AnalyzedQuery $query): int
    {
        $score = 0;

        // 1. Correspondance dans le titre (40%)
        $score += $this->scoreTitleMatch($listing->getTitle(), $query) * self::WEIGHT_TITLE / 100;

        // 2. Correspondance de catégorie (25%)
        $score += $this->scoreCategoryMatch($listing->getCategory(), $query) * self::WEIGHT_CATEGORY / 100;

        // 3. Correspondance dans la description (15%)
        $score += $this->scoreDescriptionMatch($listing->getDescription(), $query) * self::WEIGHT_DESCRIPTION / 100;

        // 4. Proximité géographique (10%)
        $score += $this->scoreLocationMatch($listing->getCity(), $query) * self::WEIGHT_LOCATION / 100;

        // 5. Attributs correspondants (5%)
        $score += $this->scoreAttributesMatch($listing, $query) * self::WEIGHT_ATTRIBUTES / 100;

        // 6. Popularité (5%)
        $score += $this->scorePopularity($listing) * self::WEIGHT_POPULARITY / 100;

        return min(100, max(0, $score));
    }

    private function scoreTitleMatch(string $title, AnalyzedQuery $query): int
    {
        $score = 0;
        $titleLower = mb_strtolower($title);

        // Correspondance exacte de tous les mots-clés
        $allMatch = true;
        foreach ($query->getKeywords() as $keyword) {
            if (stripos($titleLower, $keyword) !== false) {
                $score += 30;
            } else {
                $allMatch = false;
            }
        }

        // Bonus si tous les mots-clés sont présents
        if ($allMatch && count($query->getKeywords()) > 1) {
            $score += 20;
        }

        return min(100, $score);
    }

    private function scoreCategoryMatch(string $category, AnalyzedQuery $query): int
    {
        if ($query->getCategory() && $category === $query->getCategory()) {
            return 100;
        }
        return 0;
    }

    private function scoreLocationMatch(string $city, AnalyzedQuery $query): int
    {
        if ($query->getLocation() && stripos($city, $query->getLocation()) !== false) {
            return 100;
        }
        return 50; // Score neutre si pas de localisation spécifiée
    }

    private function scorePopularity(Listing $listing): int
    {
        // Basé sur les vues, favoris, ancienneté
        $score = 0;

        // Plus de vues = plus populaire
        $views = $listing->getViewsCount();
        if ($views > 100) $score += 30;
        elseif ($views > 50) $score += 20;
        elseif ($views > 10) $score += 10;

        // Annonces récentes favorisées
        $daysOld = (new \DateTime())->diff($listing->getCreatedAt())->days;
        if ($daysOld <= 7) $score += 40;
        elseif ($daysOld <= 30) $score += 20;

        // Photos complètes
        if ($listing->getImages()->count() >= 3) {
            $score += 30;
        }

        return min(100, $score);
    }
}
```

---

## 🧠 3. Suggestions Intelligentes

### SuggestionEngine.php

```php
class SuggestionEngine
{
    /**
     * Génère des suggestions pendant la saisie
     */
    public function getSuggestions(string $query): array
    {
        $suggestions = [];

        // 1. Recherches populaires correspondantes
        $suggestions = array_merge($suggestions, $this->getPopularSearches($query));

        // 2. Annonces similaires
        $suggestions = array_merge($suggestions, $this->getSimilarListings($query));

        // 3. Catégories correspondantes
        $suggestions = array_merge($suggestions, $this->getCategorySuggestions($query));

        // 4. Localisations correspondantes
        $suggestions = array_merge($suggestions, $this->getLocationSuggestions($query));

        // Limiter à 10 suggestions
        return array_slice($suggestions, 0, 10);
    }

    /**
     * Auto-complétion
     */
    public function autocomplete(string $partial): array
    {
        // Requête SQL optimisée
        return $this->searchRepository->findByTitlePrefix($partial, 8);
    }
}
```

---

## 📈 4. Requête SQL Optimisée

### SearchRepository.php

```php
public function searchWithScore(AnalyzedQuery $query, array $filters = []): array
{
    $qb = $this->createQueryBuilder('l')
        ->where('l.status = :status')
        ->setParameter('status', 'active');

    // Recherche full-text (si MySQL 5.7+)
    if ($query->getKeywords()) {
        $keywords = implode(' ', $query->getKeywords());
        $qb->andWhere('MATCH(l.title, l.description) AGAINST (:keywords IN BOOLEAN MODE)')
            ->setParameter('keywords', $keywords);
    }

    // Filtres stricts
    if ($query->getCategory()) {
        $qb->andWhere('l.category = :category')
            ->setParameter('category', $query->getCategory());
    }

    if (isset($filters['priceMin'])) {
        $qb->andWhere('l.price >= :priceMin')
            ->setParameter('priceMin', $filters['priceMin']);
    }

    if (isset($filters['priceMax'])) {
        $qb->andWhere('l.price <= :priceMax')
            ->setParameter('priceMax', $filters['priceMax']);
    }

    // Tri par pertinence (score calculé)
    $qb->orderBy('l.createdAt', 'DESC');

    return $qb->getQuery()->getResult();
}
```

---

## ⚡ 5. Optimisations

### Index MySQL

```sql
-- Index full-text pour la recherche
ALTER TABLE listing ADD FULLTEXT INDEX idx_search (title, description);

-- Index pour les filtres fréquents
CREATE INDEX idx_category_status ON listing(category, status);
CREATE INDEX idx_city_status ON listing(city, status);
CREATE INDEX idx_price ON listing(price);
```

### Cache Redis (optionnel)

```php
// Cache les recherches populaires
$redis->setex('popular_searches', 3600, json_encode($searches));

// Cache les suggestions
$redis->setex("suggestions:$query", 300, json_encode($suggestions));
```

---

## 🎨 6. Améliorations UX

### Corrections orthographiques

"Vous vouliez peut-être dire : **maison** ?"

### Suggestions de recherche

"Aucun résultat pour 'vila'. Essayez :"
- Villa moderne
- Villa à louer
- Villa Abidjan

### Recherches associées

"Recherches similaires :"
- Appartement 3 pièces
- Maison avec jardin
- Studio à louer

---

## 📊 7. Métriques & Analytics

### Tracking

```javascript
// Sauvegarder les métriques de recherche
{
  query: "villa abidjan",
  timestamp: "2025-11-18T12:00:00Z",
  resultsCount: 45,
  clickedResults: [123, 456],
  category: "immobilier",
  userId: 789
}
```

### Dashboard Analytics

- Top 100 recherches
- Taux de clic par recherche
- Recherches sans résultat (à améliorer)
- Temps de recherche moyen

---

## 🚀 Roadmap d'Implémentation

### ✅ Semaine 1 : Base (FAIT)
- [x] Interface de recherche
- [x] Historique avec expiration 24h
- [x] Suggestions basiques
- [x] Page de résultats

### 🔄 Semaine 2 : Backend Intelligent
- [ ] Créer QueryAnalyzer
- [ ] Implémenter ScoreCalculator
- [ ] Ajouter index full-text MySQL
- [ ] API `/api/v1/search/suggestions`

### 🔄 Semaine 3 : Optimisations
- [ ] Correction orthographique
- [ ] Gestion des synonymes
- [ ] Cache Redis
- [ ] Tests de performance

### 🔄 Semaine 4 : Analytics
- [ ] Tracking des recherches
- [ ] Dashboard analytics
- [ ] A/B testing
- [ ] Amélioration continue

---

## 🧪 Tests

```javascript
// Tests de requêtes
describe('Search Engine', () => {
  test('villa abidjan → trouve les villas à Abidjan', () => {
    const results = search('villa abidjan');
    expect(results[0].category).toBe('immobilier');
    expect(results[0].city).toContain('Abidjan');
  });

  test('T3 → trouve appartements 3 pièces', () => {
    const results = search('T3');
    expect(results[0].rooms).toBe(3);
  });

  test('toyota 2020 → filtre par marque et année', () => {
    const results = search('toyota 2020');
    expect(results[0].brand).toBe('Toyota');
    expect(results[0].year).toBe(2020);
  });
});
```

---

## 📚 Ressources

- [Elasticsearch Guide](https://www.elastic.co/guide/)
- [MySQL Full-Text Search](https://dev.mysql.com/doc/refman/8.0/en/fulltext-search.html)
- [Levenshtein Distance](https://en.wikipedia.org/wiki/Levenshtein_distance) (correction orthographique)
- [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) (pertinence)

---

## 💡 Conclusion

Le moteur de recherche intelligent transformera l'expérience utilisateur en comprenant les intentions et en proposant des résultats vraiment pertinents, comme sur Le Bon Coin.

**Phase 1 (actuelle)** : Recherche basique fonctionnelle ✅  
**Phase 2 (à venir)** : Intelligence artificielle et pertinence 🚀
