# 🛡️ Appliquer la Migration de Modération

## ✅ Instructions Pas à Pas

### 1. Ouvrir pgAdmin

1. Lancer pgAdmin
2. Se connecter à votre serveur PostgreSQL
3. Naviguer vers la base de données `planb`

### 2. Ouvrir Query Tool

- Clic droit sur la base `planb` → **Query Tool**
- Ou utiliser le raccourci : **F5**

### 3. Charger le Script SQL

**Option A : Ouvrir le fichier**
1. Dans Query Tool : **File → Open**
2. Naviguer vers : `planb-backend/migrations/add_moderation.sql`
3. Ouvrir

**Option B : Copier-Coller**
1. Ouvrir le fichier `add_moderation.sql` dans un éditeur
2. Sélectionner tout (Ctrl+A)
3. Copier (Ctrl+C)
4. Coller dans Query Tool (Ctrl+V)

### 4. Exécuter

- Cliquer sur **Execute** (⚡)
- Ou appuyer sur **F5**

### 5. Vérifier le Résultat

**Résultat attendu :**
```
ALTER TABLE
CREATE TABLE
CREATE INDEX (6 fois)
COMMENT (3 fois)
```

**Si erreur :**
- Vérifier que vous êtes connecté à la bonne base
- Vérifier que la table `users` existe
- Vérifier que la table `reports` existe

---

## ✅ Vérification

### Vérifier les colonnes dans `users`

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('is_banned', 'is_suspended', 'warnings_count', 'banned_until', 'suspended_until')
ORDER BY column_name;
```

**Résultat attendu :** 5 lignes

### Vérifier la table `moderation_actions`

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'moderation_actions'
ORDER BY ordinal_position;
```

**Résultat attendu :** 11 colonnes

### Vérifier les index

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename IN ('moderation_actions', 'users')
AND indexname LIKE 'idx_%';
```

**Résultat attendu :** 6 index

---

## 🧪 Test Rapide

### Test 1 : Vérifier la structure

```sql
-- Vérifier que les colonnes existent
SELECT 
    column_name,
    CASE 
        WHEN column_name = 'is_banned' THEN '✅'
        WHEN column_name = 'is_suspended' THEN '✅'
        WHEN column_name = 'warnings_count' THEN '✅'
        WHEN column_name = 'banned_until' THEN '✅'
        WHEN column_name = 'suspended_until' THEN '✅'
        ELSE '❌'
    END as status
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('is_banned', 'is_suspended', 'warnings_count', 'banned_until', 'suspended_until');
```

### Test 2 : Insérer une action de test (optionnel)

```sql
-- Créer une action de test (nécessite un admin existant)
INSERT INTO moderation_actions (
    moderator_id, 
    action_type, 
    target_type, 
    target_id, 
    reason, 
    created_at
) VALUES (
    1, -- ID d'un admin (remplacer par un ID réel)
    'warn',
    'user',
    1, -- ID d'un utilisateur (remplacer par un ID réel)
    'Test de migration',
    NOW()
);

-- Vérifier
SELECT * FROM moderation_actions WHERE reason = 'Test de migration';

-- Supprimer le test
DELETE FROM moderation_actions WHERE reason = 'Test de migration';
```

---

## ⚠️ En Cas d'Erreur

### Erreur : "column already exists"

**Solution :** Les colonnes existent déjà. La migration utilise `IF NOT EXISTS`, donc c'est normal.

### Erreur : "table already exists"

**Solution :** La table existe déjà. Supprimer manuellement si nécessaire :
```sql
DROP TABLE IF EXISTS moderation_actions CASCADE;
```
Puis réexécuter la migration.

### Erreur : "permission denied"

**Solution :** Vérifier que vous avez les droits d'administration sur la base.

---

## ✅ Checklist

- [ ] Migration SQL exécutée
- [ ] Colonnes ajoutées dans `users` (5 colonnes)
- [ ] Table `moderation_actions` créée
- [ ] Index créés (6 index)
- [ ] Vérification réussie

---

## 🎉 C'est Terminé !

Une fois la migration appliquée, le système de modération est **100% opérationnel** !

**Prochaines étapes :**
1. Tester le signalement depuis le frontend
2. Se connecter en admin
3. Traiter un signalement via l'API

---

**📄 Fichier SQL :** `planb-backend/migrations/add_moderation.sql`


