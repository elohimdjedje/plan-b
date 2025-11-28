# 🚀 COMPTEUR DE VUES - GUIDE EXPRESS

**Installation et utilisation en 5 minutes**

---

## ⚡ INSTALLATION ULTRA-RAPIDE

```powershell
# Une seule commande !
.\INSTALLER-COMPTEUR-VUES.ps1
```

**Cette commande fait tout automatiquement :**
- ✅ Crée la table `listing_views`
- ✅ Applique les migrations
- ✅ Vérifie les fichiers frontend
- ✅ Teste le système

---

## 📊 CE QUE VOUS OBTENEZ

### Compteur Animé

```jsx
<ViewCounter views={1234} animated={true} />
```

**Rendu :** 👁️ 1.2k 🔥 Hot

### Fonctionnalités

| Feature | Description |
|---------|-------------|
| **Vue unique** | 1 vue par personne par 24h |
| **Anti-bots** | Détection automatique |
| **Animation** | Style réseaux sociaux |
| **Formatage** | 1k, 10k, 1M |
| **Badge Hot** | Pour 1000+ vues |
| **Tracking** | Minimum 3 secondes |

---

## 🎯 UTILISATION

### Dans une Page

```jsx
import ViewCounter from '../components/listing/ViewCounter';

function ListingDetail() {
  return (
    <div>
      <h1>{listing.title}</h1>
      <ViewCounter views={listing.views} />
    </div>
  );
}
```

### Dans une Carte

```jsx
import { ViewCounterCompact } from '../components/listing/ViewCounter';

function ListingCard() {
  return (
    <div>
      <ViewCounterCompact views={listing.views} />
    </div>
  );
}
```

---

## 🔍 VÉRIFIER QUE ÇA MARCHE

### Backend

```sql
-- Voir les vues
SELECT * FROM listing_views ORDER BY viewed_at DESC LIMIT 10;
```

### Frontend

Ouvrir une annonce :
1. Le compteur apparaît : 👁️ 245
2. Reste 3+ secondes
3. Console : "✅ Vue comptée"
4. Actualiser → compteur a augmenté !

---

## 📚 DOCUMENTATION

| Fichier | Contenu |
|---------|---------|
| **COMPTEUR_VUES_OPTIMISE.md** | Documentation complète |
| **DEMO_COMPTEUR_VUES.md** | Guide visuel + exemples |
| **RESUME_COMPTEUR_VUES.md** | Résumé technique |
| **LIRE_COMPTEUR_VUES.md** | Ce fichier (guide express) |

---

## 🎨 EXEMPLES

### Formatage Automatique

```
0-999    → 245
1,000    → 1k
1,234    → 1.2k
10,000   → 10k
1,000,000 → 1M
```

### Badge "Hot"

Apparaît automatiquement si vues ≥ 1000 :

```
👁️ 1.2k 🔥 Hot
```

---

## ✅ CHECKLIST RAPIDE

Installation :
- [x] Exécuter `INSTALLER-COMPTEUR-VUES.ps1`
- [ ] Redémarrer les serveurs
- [ ] Tester une annonce
- [ ] Vérifier le compteur

---

## 🆘 PROBLÈME ?

**Les vues ne comptent pas :**
```powershell
# Vérifier la table
cd planb-backend
php bin/console dbal:run-sql "SELECT COUNT(*) FROM listing_views"
```

**Compteur invisible :**
```jsx
// Ajouter animated={true}
<ViewCounter views={listing.views} animated={true} />
```

**Erreur migration :**
```bash
php bin/console doctrine:migrations:migrate --no-interaction
```

---

## 🚀 POUR DÉMARRER

```powershell
# 1. Installer
.\INSTALLER-COMPTEUR-VUES.ps1

# 2. Redémarrer
.\DEMARRAGE\DEMARRER.ps1

# 3. Tester
start http://localhost:5173
```

---

**🎉 C'est tout ! Système prêt à l'emploi !**

*Pour plus de détails, lire `COMPTEUR_VUES_OPTIMISE.md`*
