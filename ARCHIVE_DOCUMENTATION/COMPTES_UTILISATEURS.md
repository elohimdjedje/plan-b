# Comptes Utilisateurs Existants

**Date**: 17 novembre 2024

## 📊 Résumé

**Total**: 3 comptes utilisateurs

---

## 👥 Liste des Comptes

### 1. **oly tape** ✅ (Compte Principal)
- **ID**: 5
- **Email**: `olitape@gmail.com`
- **Type**: FREE
- **PRO Lifetime**: Non
- **Téléphone**: Non renseigné
- **Annonces**: **2 annonces**
  - maybach neuf (100 000 000 FCFA)
  - villa moderne T5 (250 000 000 FCFA)
- **Créé**: 2025-11-16 à 14:28

---

### 2. **elohim djedje**
- **ID**: 4
- **Email**: `mickaeldjedje7@gmail.com`
- **Type**: FREE
- **PRO Lifetime**: Non
- **Téléphone**: Non renseigné
- **Annonces**: **0 annonce**
- **Créé**: 2025-11-16 à 13:39

---

### 3. **Test User**
- **ID**: 3
- **Email**: `test@test.com`
- **Type**: FREE
- **PRO Lifetime**: Non
- **Téléphone**: Non renseigné
- **Annonces**: **0 annonce**
- **Créé**: 2025-11-16 à 13:27

---

## 📈 Statistiques

| Métrique | Valeur |
|----------|--------|
| **Total Utilisateurs** | 3 |
| **Comptes FREE** | 3 (100%) |
| **Comptes PRO** | 0 (0%) |
| **Utilisateurs avec annonces** | 1 (33%) |
| **Total Annonces** | 2 |

---

## 🔍 Détails des Comptes

### Informations Techniques

```sql
-- Requête utilisée
SELECT 
    u.id, 
    u.email, 
    u.first_name || ' ' || u.last_name as name, 
    u.phone, 
    u.account_type, 
    u.is_lifetime_pro as pro, 
    COUNT(l.id) as listings_count,
    to_char(u.created_at, 'YYYY-MM-DD HH24:MI') as created 
FROM users u 
LEFT JOIN listings l ON u.id = l.user_id 
GROUP BY u.id, u.email, u.first_name, u.last_name, 
         u.phone, u.account_type, u.is_lifetime_pro, u.created_at 
ORDER BY u.created_at DESC;
```

---

## 🔐 Connexion aux Comptes

### Compte #1: oly tape
```
Email: olitape@gmail.com
Mot de passe: [Vous connaissez votre mot de passe]
```

### Compte #2: elohim djedje
```
Email: mickaeldjedje7@gmail.com
Mot de passe: [Définir si oublié]
```

### Compte #3: Test User
```
Email: test@test.com
Mot de passe: [Probablement un mot de passe de test]
```

---

## 📝 Actions Recommandées

### 1. Compléter les Profils
- [ ] Ajouter un numéro de téléphone pour tous les comptes
- [ ] Ajouter une photo de profil
- [ ] Remplir la bio

### 2. Tester les Fonctionnalités
- [ ] Créer des annonces avec le compte #2 et #3
- [ ] Tester la messagerie entre comptes
- [ ] Tester les favoris
- [ ] Tester les paiements Wave/Orange Money

### 3. Compte PRO
- [ ] Tester l'upgrade vers PRO
- [ ] Vérifier les limites FREE (3 annonces max)
- [ ] Vérifier l'expiration des annonces (30j FREE vs 60j PRO)

---

## 🔧 Commandes Utiles

### Voir tous les utilisateurs
```bash
docker exec planb_postgres psql -U postgres -d planb -c "SELECT id, email, first_name, last_name, account_type FROM users ORDER BY created_at DESC;"
```

### Voir les annonces d'un utilisateur
```bash
docker exec planb_postgres psql -U postgres -d planb -c "SELECT id, title, price, status FROM listings WHERE user_id = 5;"
```

### Passer un compte en PRO
```bash
docker exec planb_postgres psql -U postgres -d planb -c "UPDATE users SET account_type = 'PRO', is_lifetime_pro = true WHERE id = 5;"
```

### Réinitialiser le mot de passe (hash bcrypt)
```bash
# Générer un hash pour le mot de passe "password123"
docker exec planb_api php bin/console security:hash-password password123

# Appliquer le hash
docker exec planb_postgres psql -U postgres -d planb -c "UPDATE users SET password = '\$2y\$13\$HASH_ICI' WHERE id = 5;"
```

### Supprimer un compte
```bash
docker exec planb_postgres psql -U postgres -d planb -c "DELETE FROM users WHERE id = 3;"
```

---

## 🗄️ Structure de la Table `users`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | integer | ID unique (auto-incrémenté) |
| `email` | varchar(180) | Email unique |
| `phone` | varchar(20) | Téléphone (optionnel) |
| `roles` | json | Rôles (ex: `["ROLE_USER"]`) |
| `password` | varchar(255) | Hash du mot de passe (bcrypt) |
| `first_name` | varchar(100) | Prénom |
| `last_name` | varchar(100) | Nom |
| `account_type` | varchar(20) | `FREE` ou `PRO` |
| `country` | varchar(100) | Pays |
| `city` | varchar(100) | Ville |
| `profile_picture` | text | URL photo de profil |
| `is_email_verified` | boolean | Email vérifié |
| `is_phone_verified` | boolean | Téléphone vérifié |
| `subscription_expires_at` | timestamp | Date d'expiration abonnement PRO |
| `created_at` | timestamp | Date de création |
| `updated_at` | timestamp | Date de modification |
| `is_lifetime_pro` | boolean | PRO à vie |
| `whatsapp_phone` | varchar(20) | WhatsApp |
| `bio` | text | Biographie |

---

## 🎯 Cas d'Usage

### Scénario 1: Tester l'Inscription
1. Créer un nouveau compte via `/auth/register`
2. Vérifier qu'il apparaît dans la base
3. Vérifier les limites FREE (3 annonces)

### Scénario 2: Tester la Messagerie
1. Se connecter avec `olitape@gmail.com`
2. Créer une annonce
3. Se connecter avec `mickaeldjedje7@gmail.com`
4. Contacter le vendeur via WhatsApp
5. Vérifier que la conversation est sauvegardée

### Scénario 3: Tester PRO
1. Upgrader le compte #2 en PRO (commande SQL ci-dessus)
2. Créer plus de 3 annonces
3. Vérifier l'expiration à 60 jours au lieu de 30

---

## 🔄 Sauvegarde et Restauration

### Exporter les données
```bash
docker exec planb_postgres pg_dump -U postgres -d planb -t users > users_backup.sql
```

### Importer les données
```bash
cat users_backup.sql | docker exec -i planb_postgres psql -U postgres -d planb
```

---

## 🚀 Pour Aller Plus Loin

### Créer un Compte Admin
```sql
INSERT INTO users (
    email, 
    phone,
    roles, 
    password, 
    first_name, 
    last_name, 
    account_type,
    is_email_verified,
    is_phone_verified,
    is_lifetime_pro,
    created_at,
    updated_at
) VALUES (
    'admin@planb.ci',
    '+225 07 00 00 00 00',
    '["ROLE_ADMIN"]',
    '$2y$13$HASH_DU_MOT_DE_PASSE',
    'Admin',
    'Plan B',
    'PRO',
    true,
    true,
    true,
    NOW(),
    NOW()
);
```

### Statistiques Avancées
```sql
-- Utilisateurs par type de compte
SELECT account_type, COUNT(*) as total 
FROM users 
GROUP BY account_type;

-- Utilisateurs les plus actifs
SELECT 
    u.email, 
    COUNT(l.id) as listings_count,
    COUNT(DISTINCT m.id) as messages_sent
FROM users u
LEFT JOIN listings l ON u.id = l.user_id
LEFT JOIN messages m ON u.id = m.sender_id
GROUP BY u.id, u.email
ORDER BY listings_count DESC, messages_sent DESC;
```

---

**Note**: Tous les comptes sont actuellement **FREE**. Aucun compte PRO actif.
