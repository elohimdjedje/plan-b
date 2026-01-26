# Système de Notifications Plan B

## Vue d'ensemble

Le système de notifications permet d'informer les utilisateurs des événements importants concernant leurs annonces, abonnements et favoris.

## Types de Notifications

| Type | Description | Priorité | Utilisateurs cibles |
|------|-------------|----------|---------------------|
| `favorite_unavailable` | Annonce favorite devenue indisponible | Medium | Tous |
| `listing_expired` | Annonce expirée | High | FREE uniquement |
| `listing_expiring_soon` | Annonce expire bientôt (3 jours) | High | FREE uniquement |
| `subscription_expiring` | Abonnement PRO expire bientôt | Medium→Urgent | PRO |
| `subscription_expired` | Abonnement PRO expiré | Urgent | Ex-PRO |
| `review_received` | Nouvel avis reçu | Medium (High si négatif) | Tous |
| `listing_published` | Annonce publiée avec succès | Low | Tous |
| `welcome` | Bienvenue nouveau utilisateur | Low | Tous |

## Commandes Console (Backend)

### Commande maître (recommandée pour CRON)
```bash
php bin/console app:process-notifications
```
Exécute toutes les vérifications en séquence. Ajouter `--dry-run` pour simuler.

### Commandes individuelles

```bash
# Vérifier les abonnements PRO expirant bientôt (30, 15, 7, 3, 1, 0 jours)
php bin/console app:check-expiring-subscriptions

# Expirer les abonnements PRO arrivés à terme + notification
php bin/console app:expire-subscriptions

# Vérifier les annonces expirant bientôt (FREE uniquement)
php bin/console app:check-expiring-listings --days=3

# Expirer les annonces arrivées à terme + notifier favoris
php bin/console app:expire-listings

# Nettoyer les anciennes notifications
php bin/console app:cleanup-notifications --days=30
```

## Configuration CRON recommandée

```cron
# Vérifications quotidiennes à 8h00
0 8 * * * docker exec planb_php php bin/console app:process-notifications

# Nettoyage hebdomadaire des notifications
0 3 * * 0 docker exec planb_php php bin/console app:cleanup-notifications --days=30
```

## API Endpoints

### Notifications

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/notifications` | Liste des notifications |
| GET | `/api/notifications/unread-count` | Nombre de non lues |
| POST | `/api/notifications/{id}/read` | Marquer comme lue |
| POST | `/api/notifications/read-all` | Marquer toutes comme lues |
| POST | `/api/notifications/{id}/archive` | Archiver |
| DELETE | `/api/notifications/{id}` | Supprimer |
| GET | `/api/notifications/stats` | Statistiques |

### Préférences

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/notifications/preferences` | Récupérer préférences |
| PUT | `/api/notifications/preferences` | Mettre à jour préférences |

## Préférences utilisateur

Les utilisateurs peuvent personnaliser leurs notifications via la page Notifications (icône ⚙️) :

- **Types de notifications** :
  - Favoris indisponibles
  - Expiration d'annonces
  - Expiration d'abonnement
  - Avis reçus (option: négatifs uniquement)

- **Canaux** :
  - Notifications in-app (toujours actives)
  - Notifications email
  - Notifications push (à implémenter)

- **Fréquence email** :
  - Immédiat
  - Quotidien (digest)
  - Hebdomadaire (digest)

## Services Backend

### NotificationManagerService

Service principal pour créer des notifications :

```php
// Exemple d'utilisation
$notificationManager->notifyListingExpired($listing);
$notificationManager->notifySubscriptionExpiring($user, 7);
$notificationManager->notifyFavoriteUnavailable($listing, 'sold');
$notificationManager->notifyReviewReceived($seller, $reviewer, 4, "Très bon vendeur!");
```

### Méthodes disponibles

- `createNotification()` - Créer une notification générique
- `shouldNotify()` - Vérifier les préférences utilisateur
- `getOrCreatePreferences()` - Gérer les préférences
- `notifyFavoriteUnavailable()` - Notifier favoris
- `notifyListingExpired()` - Annonce expirée
- `notifyListingExpiringSoon()` - Annonce expire bientôt
- `notifySubscriptionExpiring()` - Abonnement expire
- `notifySubscriptionExpired()` - Abonnement expiré
- `notifyReviewReceived()` - Nouvel avis
- `notifyListingPublished()` - Annonce publiée
- `notifyWelcome()` - Bienvenue

## Frontend

### Page Notifications (`/notifications`)

- Affiche les notifications du backend ET du localStorage
- Filtres : Toutes / Non lues / Lues
- Actions : Marquer lu, Archiver, Supprimer
- Bouton préférences (si connecté)
- Badge de priorité (Urgent, Important)
- Icônes et couleurs par type

### API JavaScript (`src/api/notifications.js`)

```javascript
import * as notificationsApi from '../api/notifications';

// Récupérer les notifications
const { data } = await notificationsApi.getNotifications();

// Marquer comme lue
await notificationsApi.markAsRead(notificationId);

// Préférences
const { data: prefs } = await notificationsApi.getNotificationPreferences();
await notificationsApi.updateNotificationPreferences({ emailEnabled: false });
```

## Tables Base de Données

### notification
- `id` - ID unique
- `user_id` - Utilisateur cible
- `type` - Type de notification
- `title` - Titre court
- `message` - Message complet
- `data` - JSON avec données supplémentaires
- `priority` - low, medium, high, urgent
- `status` - unread, read, archived
- `expires_at` - Date d'expiration (auto-suppression)
- `created_at` - Date de création
- `read_at` - Date de lecture

### notification_preference
- `id` - ID unique
- `user_id` - Utilisateur (unique)
- `favorites_removed` - Notifier favoris indisponibles
- `listing_expired` - Notifier expiration annonces
- `subscription_expiring` - Notifier expiration abonnement
- `review_received` - Notifier avis reçus
- `review_negative_only` - Uniquement avis négatifs
- `email_enabled` - Activer emails
- `push_enabled` - Activer push
- `email_frequency` - immediate, daily, weekly
- `do_not_disturb_start` - Heure début silencieux
- `do_not_disturb_end` - Heure fin silencieux

## Test rapide

```bash
# Créer une notification de test
docker exec planb_php php bin/console app:check-expiring-subscriptions

# Vérifier en base
docker exec planb_postgres psql -U postgres -d planb -c "SELECT * FROM notification ORDER BY id DESC LIMIT 5;"
```
