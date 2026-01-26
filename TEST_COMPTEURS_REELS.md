# 🧪 Test des Compteurs Réels - Guide Rapide

## ✅ Testez en 1 Minute

### 1. Rafraîchir l'Application

```powershell
# Rafraîchissez simplement votre navigateur
F5
```

Ou redémarrez si nécessaire :
```powershell
# Dans plan-b/
.\demarrer.ps1
```

### 2. Test Immédiat

1. **Ouvrez** → `http://localhost:5173`
2. **Cliquez** sur la barre de recherche
3. ✅ **Regardez** la section "Recherches populaires"

**Vous devriez voir** :
```
🔥 Recherches populaires

Villa à louer                    X annonces
Voiture occasion                 X annonces
Appartement Abidjan              X annonces
...
```

Les nombres `X` sont les **vrais compteurs** de votre base de données !

---

## 🔍 Test Détaillé

### Test 1 : API Backend

Vérifiez que l'API retourne les compteurs :

```powershell
# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:8000/api/v1/search/popular" | Select-Object -ExpandProperty Content
```

Ou avec curl :
```bash
curl http://localhost:8000/api/v1/search/popular
```

**Résultat attendu** :
```json
{
  "popular": [
    {
      "query": "Villa à louer",
      "count": 12,
      "category": "immobilier",
      "type": "location"
    },
    {
      "query": "Appartement Abidjan",
      "count": 8,
      "category": "immobilier",
      "type": null
    },
    ...
  ]
}
```

### Test 2 : Frontend Console

1. **Ouvrez** la console (F12)
2. **Cliquez** sur la barre de recherche
3. **Regardez** les logs :

```
Chargement recherches populaires...
API Response: { popular: [...] }
```

---

## 🎯 Vérification des Compteurs

### Comment vérifier que les compteurs sont justes ?

#### Méthode 1 : Compter manuellement

1. Allez sur la page d'accueil
2. Comptez les annonces qui correspondent à "Villa à louer"
3. Comparez avec le compteur affiché

#### Méthode 2 : Via l'API

```powershell
# Compter les annonces "Villa"
Invoke-WebRequest -Uri "http://localhost:8000/api/v1/listings?search=villa&type=location&category=immobilier" | ConvertFrom-Json | Select-Object -ExpandProperty data | Measure-Object
```

**Le nombre doit correspondre** au compteur affiché dans "Villa à louer" !

---

## 📊 Exemples de Résultats Attendus

### Si vous avez peu d'annonces

```
🔥 Recherches populaires

Villa à louer                    2 annonces
Appartement Abidjan              1 annonce
Terrain à vendre                 0 annonce
```

### Si vous avez beaucoup d'annonces

```
🔥 Recherches populaires

Villa à louer                    45 annonces
Voiture occasion                 23 annonces
Appartement Abidjan              18 annonces
Terrain à vendre                 12 annonces
Hôtel Assinie                    8 annonces
```

---

## 🐛 Dépannage

### Les compteurs sont tous à 0

**Cause** : Pas d'annonces dans la base

**Solution** :
1. Créez quelques annonces de test
2. Assurez-vous qu'elles sont `status = 'active'`
3. Vérifiez que `expiresAt` est dans le futur

### L'API retourne une erreur

**Vérifiez** :
```powershell
# Backend démarré ?
http://localhost:8000

# Erreur dans les logs ?
cd planb-backend
symfony server:log
```

### Le frontend ne charge pas les compteurs

**Console Browser (F12)** :
```javascript
// Vérifiez les erreurs réseau
Network → Filter: "popular"
```

**Recherchez** :
- Erreur CORS ?
- Erreur 404 ?
- Erreur 500 ?

---

## ✅ Liste de Vérification

- [ ] Backend démarré (`http://localhost:8000`)
- [ ] Frontend démarré (`http://localhost:5173`)
- [ ] API `/api/v1/search/popular` accessible
- [ ] Modal de recherche s'ouvre
- [ ] Section "Recherches populaires" visible
- [ ] Compteurs affichés (même si 0)
- [ ] Format correct ("X annonce" ou "X annonces")

---

## 🎨 Exemples Visuels

### Avant (Données Statiques)
```
Villa à louer                    234 annonces  ← Faux
Voiture occasion                 189 annonces  ← Faux
```

### Après (Données Réelles)
```
Villa à louer                    12 annonces   ← Vrai !
Voiture occasion                 5 annonces    ← Vrai !
```

---

## 🚀 Test Avancé

### Ajouter une Annonce et Vérifier

1. **Publiez** une annonce avec "Villa" dans le titre
2. **Type** : Location
3. **Catégorie** : Immobilier
4. **Actualisez** la modal de recherche
5. ✅ Le compteur "Villa à louer" augmente de 1 !

### Test avec SQL Direct

```sql
-- Compter les villas à louer
SELECT COUNT(*) 
FROM listing 
WHERE status = 'active' 
  AND expires_at > NOW() 
  AND category = 'immobilier'
  AND type = 'location'
  AND (LOWER(title) LIKE '%villa%' OR LOWER(description) LIKE '%villa%');
```

Le résultat doit correspondre au compteur affiché !

---

## 📈 Monitoring

### Voir les Requêtes SQL

**Backend logs** :
```yaml
# config/packages/dev/doctrine.yaml
doctrine:
    dbal:
        logging: true
        profiling: true
```

Puis regardez les logs :
```bash
tail -f var/log/dev.log | grep SELECT
```

### Performance

Les compteurs doivent se charger en **< 500ms**.

**Si plus lent** :
- Vérifiez les index SQL
- Considérez le cache Redis
- Réduisez le nombre de recherches populaires

---

## 🎯 Succès !

Si vous voyez :
- ✅ Des compteurs qui correspondent à vos annonces
- ✅ Format correct (singulier/pluriel)
- ✅ Chargement rapide (< 500ms)
- ✅ Tri par nombre décroissant

**Félicitations !** Les compteurs réels fonctionnent parfaitement ! 🎉

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- `COMPTEURS_ANNONCES_REELS.md` - Documentation complète
- `RECHERCHE_LEBONCOIN_COMPLETE.md` - Fonctionnalités de recherche
- `MOTEUR_RECHERCHE_INTELLIGENT.md` - Moteur intelligent (Phase 2)

---

## 💡 Astuce

Pour tester avec des données variées, créez des annonces dans différentes catégories :
- 5 villas à louer
- 3 voitures
- 2 appartements à Abidjan
- 1 terrain
- 1 hôtel à Assinie

Puis vérifiez que les compteurs correspondent exactement ! ✨
