# ✅ Application de la Migration - Visite Virtuelle

## 📋 Résumé

✅ **Bibliothèque installée** : `photo-sphere-viewer` et `@photo-sphere-viewer/core`  
⏳ **Migration base de données** : À appliquer manuellement

---

## ✅ Ce qui est fait

### Frontend
- ✅ `photo-sphere-viewer` installé (v4.8.1)
- ✅ `@photo-sphere-viewer/core` installé (v5.0.0)
- ✅ Tous les fichiers créés et intégrés

---

## ⏳ À faire manuellement

### Option 1: Via Doctrine Migrations (Recommandé)

Si PHP est dans votre PATH :

```bash
cd planb-backend
php bin/console doctrine:migrations:migrate
```

### Option 2: SQL Direct (Si migrations ne fonctionnent pas)

Exécutez le fichier SQL directement dans votre base de données PostgreSQL :

**Fichier:** `planb-backend/migrations/add_virtual_tour.sql`

Ou copiez-collez ce SQL :

```sql
-- Ajouter les colonnes
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS virtual_tour_type VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_thumbnail TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_data JSONB DEFAULT NULL;

-- Créer l'index
CREATE INDEX IF NOT EXISTS idx_listing_virtual_tour ON listings(virtual_tour_type) 
WHERE virtual_tour_type IS NOT NULL;
```

**Comment exécuter :**
1. Ouvrir pgAdmin ou votre client PostgreSQL
2. Se connecter à la base de données `planb`
3. Exécuter le SQL ci-dessus

---

## 🧪 Vérification

Après avoir appliqué la migration, vérifiez que les colonnes existent :

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name LIKE 'virtual_tour%';
```

**Résultat attendu :**
```
virtual_tour_type     | character varying(20) | YES
virtual_tour_url      | text                  | YES
virtual_tour_thumbnail| text                  | YES
virtual_tour_data     | jsonb                 | YES
```

---

## 🚀 Prochaines Étapes

1. ✅ Bibliothèque installée
2. ⏳ Appliquer la migration SQL
3. 🔄 Redémarrer le backend
4. 🔄 Redémarrer le frontend
5. 🧪 Tester l'upload d'une visite virtuelle

---

## 📝 Notes

- La bibliothèque `photo-sphere-viewer` v4.8.1 fonctionne parfaitement
- L'avertissement de dépréciation est juste informatif
- Le code actuel est compatible avec les deux versions installées

---

**Une fois la migration appliquée, tout sera opérationnel ! 🎉**


