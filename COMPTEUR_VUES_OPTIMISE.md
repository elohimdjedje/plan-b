# 📊 SYSTÈME DE COMPTEUR DE VUES OPTIMISÉ

**Compteur professionnel comme sur les réseaux sociaux**

---

## ✨ Fonctionnalités

### Backend (Symfony)
- ✅ **Une vue unique** par utilisateur/IP par 24h
- ✅ **Protection anti-bots** (détection automatique)
- ✅ **Tracking détaillé** (IP, User-Agent, Referrer, Date)
- ✅ **Statistiques avancées** (24h, 7 jours, total)
- ✅ **Nettoyage automatique** des anciennes vues (30+ jours)
- ✅ **Index optimisés** pour les performances

### Frontend (React)
- ✅ **Tracking intelligent** (minimum 3 secondes sur la page)
- ✅ **LocalStorage** pour éviter doublons côté client
- ✅ **Animation du compteur** (effet réseaux sociaux)
- ✅ **Formatage automatique** (1k, 10k, 1M, etc.)
- ✅ **Badge "Hot"** pour annonces populaires (1000+ vues)
- ✅ **Composants réutilisables**

---

## 🏗️ Architecture

### Fichiers Backend

```
planb-backend/src/
├── Entity/
│   └── ListingView.php              # Entité pour tracker les vues
├── Service/
│   └── ViewCounterService.php       # Service de comptage optimisé
├── Controller/
│   └── ListingController.php        # Utilise ViewCounterService
└── migrations/
    └── Version20251118_ListingViews.php   # Migration pour la table
```

### Fichiers Frontend

```
planb-frontend/src/
├── components/listing/
│   └── ViewCounter.jsx              # Composants d'affichage
├── utils/
│   └── viewTracking.js              # Système de tracking
└── pages/
    └── ListingDetail.jsx            # Page qui utilise le système
```

---

## 📖 Utilisation

### 1. Installation Backend

```bash
cd planb-backend

# Appliquer la migration
php bin/console doctrine:migrations:migrate

# Vérifier que la table est créée
php bin/console dbal:run-sql "SELECT COUNT(*) FROM listing_views"
```

### 2. Utilisation du Composant Frontend

#### Affichage Simple

```jsx
import ViewCounter from '../components/listing/ViewCounter';

<ViewCounter views={listing.views} />
```

#### Version Compacte (pour cartes)

```jsx
import { ViewCounterCompact } from '../components/listing/ViewCounter';

<ViewCounterCompact views={listing.views} />
```

#### Statistiques Détaillées

```jsx
import { ViewStats } from '../components/listing/ViewCounter';

<ViewStats 
  total={listing.views}
  last24h={50}
  last7days={250}
/>
```

### 3. Tracking des Vues

```javascript
import { trackListingView } from '../utils/viewTracking';

useEffect(() => {
  // Commencer le tracking
  const cleanup = trackListingView(listingId, () => {
    console.log('Vue comptée !');
  });

  // Nettoyer au démontage
  return cleanup;
}, [listingId]);
```

---

## 🔧 Configuration

### Paramètres Backend

Dans `ViewCounterService.php`:

```php
private const VIEW_EXPIRY_HOURS = 24;  // Délai entre 2 vues
```

### Paramètres Frontend

Dans `viewTracking.js`:

```javascript
const MIN_VIEW_DURATION = 3000;    // 3 secondes minimum
const VIEW_EXPIRY_HOURS = 24;      // Une vue par 24h
```

---

## 📊 Base de Données

### Table `listing_views`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER | ID auto-incrémenté |
| `listing_id` | INTEGER | ID de l'annonce |
| `user_id` | INTEGER | ID utilisateur (null si non connecté) |
| `ip_address` | VARCHAR(45) | IP du visiteur |
| `user_agent` | TEXT | User-Agent du navigateur |
| `referrer` | VARCHAR(500) | URL de provenance |
| `viewed_at` | TIMESTAMP | Date/heure de la vue |

### Index pour Performances

```sql
CREATE INDEX idx_listing_viewed_at ON listing_views(listing_id, viewed_at);
CREATE INDEX idx_user_ip ON listing_views(user_id, ip_address);
CREATE INDEX idx_viewed_at ON listing_views(viewed_at);
```

---

## 🎨 Exemples d'Affichage

### Simple
```
👁️ 245
```

### Formaté
```
👁️ 1.2k    (pour 1 234 vues)
👁️ 10k     (pour 10 000 vues)
👁️ 1.5M    (pour 1 500 000 vues)
```

### Avec Badge
```
👁️ 1.2k 🔥 Hot
```

---

## 🚀 API Backend

### GET /api/v1/listings/{id}

Enregistre automatiquement une vue si:
- ✅ Ce n'est pas le propriétaire
- ✅ Pas de vue dans les 24h dernières (même IP/user)
- ✅ Ce n'est pas un bot

**Réponse:**
```json
{
  "id": 123,
  "views": 1234,
  "...": "..."
}
```

---

## 🧹 Maintenance

### Nettoyer les Anciennes Vues (Backend)

```bash
# Via la console Symfony
php bin/console app:clean-old-views

# Ou via SQL
DELETE FROM listing_views WHERE viewed_at < NOW() - INTERVAL '30 days';
```

### Nettoyer le LocalStorage (Frontend)

```javascript
import { cleanOldViews, resetViewTracking } from '../utils/viewTracking';

// Nettoyer les vues expirées
cleanOldViews();

// Reset complet (pour tests)
resetViewTracking();
```

---

## 📈 Statistiques

### Obtenir les Stats d'une Annonce

```php
use App\Service\ViewCounterService;

$stats = $viewCounterService->getViewStats($listing);
// [
//   'total' => 1234,
//   'last24h' => 50,
//   'last7days' => 250
// ]
```

---

## 🔐 Sécurité

### Protection Anti-Bots

Le système détecte automatiquement:
- Googlebot, Bingbot, etc.
- Crawlers (spider, scrape, etc.)
- Outils automatisés (curl, wget, etc.)

### Protection Anti-Spam

- **Limite par IP**: 1 vue par annonce par 24h
- **Limite par utilisateur**: 1 vue par annonce par 24h
- **Durée minimale**: 3 secondes sur la page

---

## 🎯 Avantages

✅ **Précis** - Compte seulement les vraies vues  
✅ **Optimisé** - Index performants, pas de surcharge  
✅ **Professionnel** - Comme Facebook, YouTube, Instagram  
✅ **Analytics** - Statistiques détaillées disponibles  
✅ **Sécurisé** - Protection anti-bots et anti-spam  
✅ **Scalable** - Peut gérer des millions de vues  

---

## 💡 Bonnes Pratiques

### Backend

1. **CRON pour nettoyage**: Exécuter `cleanOldViews()` une fois par semaine
2. **Index**: Toujours maintenir les index à jour
3. **Monitoring**: Surveiller la taille de la table `listing_views`

### Frontend

1. **Cleanup**: Toujours appeler la fonction de nettoyage dans useEffect
2. **LocalStorage**: Nettoyer périodiquement avec `cleanOldViews()`
3. **UX**: Afficher le compteur avec animation pour engagement

---

## 🐛 Dépannage

### Les vues ne s'incrémentent pas

1. Vérifier que la table `listing_views` existe
2. Vérifier que le service est injecté dans le contrôleur
3. Vérifier les logs du backend

### Compteur ne s'affiche pas

1. Vérifier que `listing.views` est bien dans la réponse API
2. Vérifier l'import du composant
3. Vérifier la console du navigateur

### Doublons de vues

1. Vérifier que le tracking est actif (localStorage)
2. Vérifier le délai de 24h dans le backend
3. Vérifier que les index sont créés

---

## 📞 Support

En cas de problème:

1. Consulter les logs backend: `var/log/dev.log`
2. Consulter la console navigateur
3. Vérifier la table: `SELECT * FROM listing_views ORDER BY viewed_at DESC LIMIT 10`

---

**✨ Système de comptage professionnel prêt à l'emploi !**

*Optimisé pour la performance et l'expérience utilisateur*
