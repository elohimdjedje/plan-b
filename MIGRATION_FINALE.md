# ✅ Migration Visite Virtuelle - Guide Final

## 🎯 Statut

**Code : 100% complet ✅**  
**Migration SQL : À appliquer ⏳**

---

## 📁 Fichiers Créés Pour Vous

J'ai créé plusieurs fichiers pour faciliter la migration :

1. **`MIGRATION_SIMPLE.sql`** - Fichier SQL prêt à copier-coller
2. **`planb-backend/migrations/APPLIQUER_MAINTENANT.sql`** - Version avec vérification
3. **`appliquer-migration.js`** - Script Node.js (nécessite PostgreSQL démarré)
4. **`INSTRUCTIONS_MIGRATION.txt`** - Instructions détaillées

---

## 🚀 Méthode Recommandée : pgAdmin (Le Plus Simple)

### Étapes :

1. **Ouvrir pgAdmin**
   - Menu Démarrer → Rechercher "pgAdmin" → Ouvrir

2. **Se connecter**
   - Cliquez sur "Servers" → "PostgreSQL"
   - Entrez votre mot de passe PostgreSQL

3. **Trouver la base "planb"**
   - Développez "Databases"
   - Cliquez droit sur "planb"

4. **Ouvrir Query Tool**
   - Clic droit sur "planb" → "Query Tool"

5. **Copier le SQL**
   - Ouvrez le fichier **`MIGRATION_SIMPLE.sql`**
   - Sélectionnez tout (Ctrl+A) et copiez (Ctrl+C)

6. **Coller et exécuter**
   - Collez dans Query Tool (Ctrl+V)
   - Cliquez sur "Execute" (▶) ou appuyez sur F5

7. **Vérifier**
   - Vous devriez voir "Success" en bas
   - Et 4 colonnes dans les résultats

✅ **C'est terminé !**

---

## 📋 SQL à Copier (Si vous préférez)

```sql
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS virtual_tour_type VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_thumbnail TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_data JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_listing_virtual_tour ON listings(virtual_tour_type) 
WHERE virtual_tour_type IS NOT NULL;
```

---

## 🔍 Vérification

Après avoir exécuté la migration, vérifiez avec ce SQL :

```sql
SELECT column_name, data_type 
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

## ⚠️ Si PostgreSQL n'est pas démarré

Si vous utilisez Docker :

```bash
cd planb-backend
docker-compose up -d database
```

Si PostgreSQL est installé localement :

1. Ouvrir "Services" (services.msc)
2. Trouver "postgresql-x64-XX" ou similaire
3. Clic droit → Démarrer

---

## 🎉 Après la Migration

1. ✅ Redémarrer le backend (si en cours d'exécution)
2. ✅ Redémarrer le frontend (si en cours d'exécution)
3. ✅ Tester avec un compte PRO :
   - Publier une annonce
   - Uploader une photo 360°
   - Vérifier l'affichage

---

## 📝 Résumé

- ✅ **Code Backend** : 100% complet
- ✅ **Code Frontend** : 100% complet
- ✅ **Bibliothèques** : Installées
- ⏳ **Migration SQL** : À appliquer (2 minutes avec pgAdmin)

**Une fois la migration appliquée, la visite virtuelle sera 100% fonctionnelle !** 🚀

---

**💡 Conseil :** La méthode pgAdmin est la plus fiable sur Windows. C'est juste un copier-coller et un clic !
