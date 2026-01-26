# 🛡️ Signalement et Modération - Implémentation Complète

## ✅ Statut : **IMPLÉMENTÉ**

---

## 📋 Vue d'ensemble

Système complet de signalement et modération permettant :
- ✅ Signalement d'annonces par les utilisateurs
- ✅ Modération par les administrateurs
- ✅ Actions de modération (masquer, supprimer, avertir, suspendre, bannir)
- ✅ Historique de modération
- ✅ Système d'avertissements automatiques (bannissement à 3 avertissements)

---

## 🏗️ Architecture

### Backend

#### 1. Entités

**`Report`** (existant, amélioré)
- Signalements d'annonces
- Raisons : scam, inappropriate, duplicate, spam, false_info, other
- Statuts : pending, reviewed, actioned, dismissed

**`ModerationAction`** (nouveau)
- Trace toutes les actions de modération
- Types d'actions : hide, delete, warn, suspend, ban, unban, approve
- Types de cibles : listing, user, message, review
- Lien avec les signalements

**`User`** (modifié)
- Nouveaux champs :
  - `isBanned` : Bannissement définitif
  - `isSuspended` : Suspension temporaire
  - `warningsCount` : Nombre d'avertissements
  - `bannedUntil` : Date de fin de bannissement
  - `suspendedUntil` : Date de fin de suspension

#### 2. Services

**`ModerationService`**
- `hideListing()` : Masquer une annonce
- `deleteListing()` : Supprimer une annonce
- `warnUser()` : Avertir un utilisateur (bannissement auto à 3)
- `suspendUser()` : Suspendre temporairement
- `banUser()` : Bannir (temporaire ou permanent)
- `unbanUser()` : Débannir
- `approveReport()` : Rejeter un signalement
- `processReport()` : Traiter un signalement

#### 3. Contrôleurs

**`ReportController`** (existant, amélioré)
- `POST /api/v1/reports` : Signaler une annonce
- `GET /api/v1/reports/my` : Mes signalements

**`ModerationController`** (nouveau, ROLE_ADMIN)
- `GET /api/v1/moderation/reports/pending` : Signalements en attente
- `GET /api/v1/moderation/reports/{id}` : Détail d'un signalement
- `POST /api/v1/moderation/reports/{id}/process` : Traiter un signalement
- `POST /api/v1/moderation/listings/{id}/hide` : Masquer une annonce
- `POST /api/v1/moderation/listings/{id}/delete` : Supprimer une annonce
- `POST /api/v1/moderation/users/{id}/warn` : Avertir un utilisateur
- `POST /api/v1/moderation/users/{id}/suspend` : Suspendre un utilisateur
- `POST /api/v1/moderation/users/{id}/ban` : Bannir un utilisateur
- `POST /api/v1/moderation/users/{id}/unban` : Débannir un utilisateur
- `GET /api/v1/moderation/users/{id}/history` : Historique de modération
- `GET /api/v1/moderation/stats` : Statistiques de modération

### Frontend

#### Composants

**`ReportButton.jsx`**
- Bouton de signalement avec modal
- Sélection de raison
- Description optionnelle
- Validation et envoi

**`report.js`** (API client)
- `create()` : Signaler une annonce
- `getMyReports()` : Mes signalements

**`moderation.js`** (API client, admin uniquement)
- Toutes les fonctions de modération
- Gestion des signalements
- Actions sur utilisateurs et annonces

---

## 🔄 Flux de Modération

### 1. Signalement par un utilisateur

```
Utilisateur → ReportButton → API /reports → Report (status: pending)
```

### 2. Traitement par un modérateur

```
Admin → ModerationController → ModerationService → Action
```

**Actions possibles :**
- `hide` : Masquer l'annonce (status: hidden)
- `delete` : Supprimer l'annonce
- `warn` : Avertir l'utilisateur (+1 warning, ban auto à 3)
- `ban` : Bannir l'utilisateur (temporaire ou permanent)
- `approve` : Rejeter le signalement (status: dismissed)

### 3. Notifications automatiques

- Notification à l'utilisateur lors de chaque action
- Push notification si activée

---

## 📊 Système d'Avertissements

### Règles

1. **1er avertissement** : Avertissement simple
2. **2ème avertissement** : Avertissement + rappel
3. **3ème avertissement** : Bannissement automatique (30 jours)

### Réinitialisation

- Les avertissements peuvent être réinitialisés manuellement par un admin
- Pas de réinitialisation automatique

---

## 🗄️ Base de Données

### Migration SQL

**Fichier :** `planb-backend/migrations/add_moderation.sql`

**Tables modifiées :**
- `users` : Ajout de 5 colonnes de modération

**Tables créées :**
- `moderation_actions` : Historique de toutes les actions

**Index créés :**
- `idx_moderation_moderator`
- `idx_moderation_target`
- `idx_moderation_action_type`
- `idx_moderation_created`
- `idx_users_banned`
- `idx_users_suspended`

---

## 🚀 Installation

### 1. Appliquer la Migration

```sql
-- Via pgAdmin
-- Ouvrir: planb-backend/migrations/add_moderation.sql
-- Exécuter (F5)
```

### 2. Vérifier

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('is_banned', 'is_suspended', 'warnings_count');

SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'moderation_actions';
```

### 3. Tester

1. Se connecter en tant qu'admin
2. Accéder à `/api/v1/moderation/reports/pending`
3. Signaler une annonce depuis le frontend
4. Traiter le signalement

---

## 📝 Utilisation

### Pour les Utilisateurs

**Signaler une annonce :**
1. Ouvrir la page de détail d'une annonce
2. Cliquer sur "Signaler" (dans le header)
3. Sélectionner une raison
4. Ajouter une description (optionnel)
5. Envoyer

**Voir mes signalements :**
- `GET /api/v1/reports/my`

### Pour les Administrateurs

**Voir les signalements en attente :**
- `GET /api/v1/moderation/reports/pending`

**Traiter un signalement :**
```json
POST /api/v1/moderation/reports/{id}/process
{
  "action": "hide", // ou delete, warn, ban, approve
  "reason": "Contenu inapproprié",
  "notes": "Notes internes (optionnel)"
}
```

**Actions directes :**
- Masquer une annonce : `POST /api/v1/moderation/listings/{id}/hide`
- Supprimer une annonce : `POST /api/v1/moderation/listings/{id}/delete`
- Avertir un utilisateur : `POST /api/v1/moderation/users/{id}/warn`
- Suspendre un utilisateur : `POST /api/v1/moderation/users/{id}/suspend`
- Bannir un utilisateur : `POST /api/v1/moderation/users/{id}/ban`
- Débannir un utilisateur : `POST /api/v1/moderation/users/{id}/unban`

---

## 🔒 Sécurité

### Permissions

- **Signalement** : Tous les utilisateurs (même non connectés)
- **Modération** : `ROLE_ADMIN` uniquement

### Validation

- Vérification que l'utilisateur n'a pas déjà signalé
- Validation des raisons de signalement
- Vérification des permissions admin

---

## 📈 Statistiques

**Endpoint :** `GET /api/v1/moderation/stats`

**Retourne :**
- Total d'actions
- Par type d'action
- Par type de cible
- Actions des 30 derniers jours

---

## ✅ Checklist

- [x] Entité ModerationAction créée
- [x] ModerationService implémenté
- [x] ModerationController créé
- [x] Champs modération ajoutés dans User
- [x] Migration SQL créée
- [x] ReportButton composant créé
- [x] API clients créés
- [x] Intégration dans ListingDetail
- [ ] Interface admin pour modération (à créer)
- [ ] Tests unitaires (optionnel)

---

## 🎯 Prochaines Étapes

1. **Interface Admin** : Créer une page React pour gérer les signalements
2. **Notifications** : Notifier les modérateurs de nouveaux signalements
3. **Auto-modération** : Détection automatique de spam/duplicatas
4. **Appels** : Intégration dans l'app mobile

---

**📄 Fichiers créés/modifiés :**
- Backend : 6 fichiers
- Frontend : 3 fichiers
- Migration : 1 fichier

**Total : 10 fichiers**


