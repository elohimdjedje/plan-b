# 🚀 Appliquer la Migration Visite Virtuelle

## Méthode 1 : Via pgAdmin (Recommandé - Le plus simple)

### Étapes :

1. **Ouvrir pgAdmin**
   - Lancez pgAdmin depuis le menu Démarrer

2. **Se connecter à la base de données**
   - Cliquez sur "Servers" → "PostgreSQL" (ou votre serveur)
   - Entrez le mot de passe si demandé

3. **Ouvrir Query Tool**
   - Cliquez droit sur la base de données `planb`
   - Sélectionnez "Query Tool"

4. **Copier-coller ce SQL :**

```sql
-- Migration pour ajouter les champs de visite virtuelle
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS virtual_tour_type VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_thumbnail TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_data JSONB DEFAULT NULL;

-- Créer l'index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_listing_virtual_tour ON listings(virtual_tour_type) 
WHERE virtual_tour_type IS NOT NULL;

-- Vérification
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name LIKE 'virtual_tour%'
ORDER BY column_name;
```

5. **Exécuter**
   - Cliquez sur le bouton "Execute" (▶) ou appuyez sur F5
   - Vous devriez voir "Success" et la liste des 4 colonnes créées

✅ **C'est terminé !**

---

## Méthode 2 : Via ligne de commande (si psql est installé)

Si vous avez `psql` dans votre PATH :

```bash
cd planb-backend
psql -U postgres -d planb -f migrations/add_virtual_tour.sql
```

Ou directement :

```bash
psql -U postgres -d planb -c "ALTER TABLE listings ADD COLUMN IF NOT EXISTS virtual_tour_type VARCHAR(20) DEFAULT NULL, ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT DEFAULT NULL, ADD COLUMN IF NOT EXISTS virtual_tour_thumbnail TEXT DEFAULT NULL, ADD COLUMN IF NOT EXISTS virtual_tour_data JSONB DEFAULT NULL; CREATE INDEX IF NOT EXISTS idx_listing_virtual_tour ON listings(virtual_tour_type) WHERE virtual_tour_type IS NOT NULL;"
```

---

## Méthode 3 : Via Docker (si vous utilisez Docker)

Si PostgreSQL est dans un conteneur Docker :

```bash
docker exec -i <nom_conteneur_postgres> psql -U postgres -d planb < planb-backend/migrations/add_virtual_tour.sql
```

---

## Vérification

Après avoir appliqué la migration, vérifiez que les colonnes existent :

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name LIKE 'virtual_tour%'
ORDER BY column_name;
```

**Résultat attendu :**
- `virtual_tour_data` (jsonb)
- `virtual_tour_thumbnail` (text)
- `virtual_tour_type` (varchar)
- `virtual_tour_url` (text)

---

## Après la Migration

1. ✅ **Redémarrer le backend** (si en cours d'exécution)
2. ✅ **Redémarrer le frontend** (si en cours d'exécution)
3. ✅ **Tester** avec un compte PRO :
   - Publier une annonce
   - Uploader une photo 360°
   - Vérifier l'affichage

---

## Fichier SQL

Le fichier SQL complet est disponible ici :
📁 `planb-backend/migrations/add_virtual_tour.sql`

---

**🎉 Une fois la migration appliquée, la visite virtuelle sera 100% fonctionnelle !**
