# 🧪 Test de la Localisation Complète

## 🎯 Objectif
Tester le nouveau système de localisation : Pays → Ville → Commune → Quartier

---

## ⚡ Avant de commencer

### 1. Redémarrer les serveurs

```powershell
# Si pas encore fait
.\update.ps1
```

### 2. Vérifier que tout tourne
- Backend : http://localhost:8000
- Frontend : http://localhost:5173
- PostgreSQL : `docker ps`

---

## 📝 Scénario de test complet

### Test 1 : Publier une annonce avec localisation complète

#### Étape 1 : Démarrer la publication
1. Ouvrir http://localhost:5173
2. Se connecter
3. Cliquer "Publier une annonce"

#### Étape 2 : Remplir jusqu'à la localisation
1. **Catégorie** : Immobilier
2. **Sous-catégorie** : Villa
3. **Images** : Ajouter 1 image
4. **Informations** :
   - Titre : "Villa moderne à Cocody"
   - Description : "Belle villa de 5 pièces dans un quartier calme et résidentiel"
   - Prix : 75000000
5. Cliquer "Suivant" jusqu'à la localisation

#### Étape 3 : Tester la localisation ⭐

**A. Sélection du pays**
- ✅ Vérifier que "Côte d'Ivoire" est pré-sélectionné
- ✅ Le champ "Ville" devient actif

**B. Sélection de la ville**
1. Ouvrir le sélecteur de ville
2. ✅ **Vérifier qu'il y a 26 villes**
3. Sélectionner "Abidjan"
4. ✅ Le champ "Commune" apparaît

**C. Sélection de la commune**
1. Ouvrir le sélecteur de commune
2. ✅ **Vérifier qu'il y a 13 communes** (pour Abidjan)
3. Sélectionner "Cocody"
4. ✅ Le champ "Quartier" apparaît

**D. Saisie du quartier**
1. Saisir "2 Plateaux"
2. ✅ Le bouton "Suivant" devient actif

#### Étape 4 : Publier
1. Cliquer "Suivant"
2. Vérifier le récapitulatif
3. Cliquer "Publier mon annonce"
4. ✅ Message de succès

---

### Test 2 : Vérifier l'affichage sur la carte

1. Revenir à l'accueil
2. Trouver l'annonce "Villa moderne à Cocody"
3. ✅ **Vérifier la localisation affichée** :
   ```
   2 Plateaux, Cocody, Abidjan
   ```

---

### Test 3 : Vérifier l'affichage dans les détails

1. Cliquer sur l'annonce
2. ✅ **Vérifier la localisation complète** :
   ```
   📍 2 Plateaux, Cocody, Abidjan, CI
   ```

---

### Test 4 : Tester le changement de ville

1. Publier une nouvelle annonce
2. Arriver à la localisation
3. Sélectionner "Abidjan"
4. Sélectionner une commune (ex: "Yopougon")
5. **Changer de ville** → Sélectionner "Bouaké"
6. ✅ **Vérifier que** :
   - Le champ "Commune" se réinitialise
   - La liste des communes change (8 communes pour Bouaké)

---

### Test 5 : Tester toutes les grandes villes

#### Abidjan (13 communes)
```
Communes à tester :
- Cocody, Yopougon, Plateau
- Abobo, Adjamé, Marcory
```

#### Bouaké (8 communes)
```
Communes à tester :
- Bouaké Centre, Dar Es Salam
- Koko, Liberté
```

#### Yamoussoukro (5 communes)
```
Communes à tester :
- Yamoussoukro I, II, III
```

---

### Test 6 : Vérifier en base de données

```bash
cd planb-backend
php bin/console doctrine:query:sql "SELECT id, city, commune, quartier FROM listings"
```

**Résultat attendu** :
```
id | city     | commune | quartier
---+----------+---------+-----------
 1 | Abidjan  | Cocody  | 2 Plateaux
 2 | Bouaké   | Koko    | Centre-ville
```

---

## 🧪 Tests de validation

### Validation 1 : Champs obligatoires

**Test** : Essayer de publier sans commune
1. Sélectionner pays et ville
2. **NE PAS** sélectionner de commune
3. ✅ Le bouton "Suivant" reste désactivé

**Test** : Essayer de publier sans quartier
1. Sélectionner pays, ville et commune
2. **NE PAS** saisir de quartier
3. ✅ Le bouton "Suivant" reste désactivé

---

### Validation 2 : Réinitialisation

**Test** : Changement de ville
1. Sélectionner "Abidjan" → "Cocody" → "2 Plateaux"
2. Changer pour "Bouaké"
3. ✅ "Cocody" et "2 Plateaux" disparaissent
4. ✅ Liste des communes de Bouaké s'affiche

**Test** : Changement de commune
1. Sélectionner "Abidjan" → "Cocody" → "2 Plateaux"
2. Changer pour "Yopougon"
3. ✅ "2 Plateaux" disparaît

---

### Validation 3 : Affichage

**Test** : Annonce sans commune/quartier
- Si une ancienne annonce n'a pas de commune
- ✅ Affiche uniquement la ville

**Test** : Annonce avec localisation complète
- Nouvelle annonce avec tout
- ✅ Affiche : Quartier, Commune, Ville

---

## 📊 Matrice de test

| Ville | Communes | Test | Résultat |
|-------|----------|------|----------|
| Abidjan | 13 | ✅ | |
| Bouaké | 8 | ✅ | |
| Yamoussoukro | 5 | ✅ | |
| Daloa | 5 | ✅ | |
| San-Pédro | 5 | ✅ | |
| Korhogo | 5 | ✅ | |
| Man | 5 | ✅ | |
| Gagnoa | 5 | ✅ | |

---

## 🐛 Problèmes potentiels et solutions

### Problème 1 : Pas de communes affichées

**Cause** : La ville n'est pas dans locations.js

**Solution** :
- Vérifier que la ville existe dans `IVORY_COAST_LOCATIONS`
- Vérifier l'orthographe exacte

---

### Problème 2 : Erreur lors de la publication

**Cause** : Champs manquants

**Vérification** :
```bash
# Console du navigateur (F12)
# Onglet Network → Chercher la requête POST
# Voir le payload envoyé
```

**Doit contenir** :
```json
{
  "country": "CI",
  "city": "Abidjan",
  "commune": "Cocody",
  "quartier": "2 Plateaux"
}
```

---

### Problème 3 : Localisation ne s'affiche pas

**Cause** : Annonce publiée avant la mise à jour

**Solution** :
- Ces annonces n'ont pas de commune/quartier
- Affichage de repli : ville uniquement

---

## ✅ Checklist finale

- [ ] Publication d'annonce fonctionne
- [ ] Sélection ville → communes correcte
- [ ] Réinitialisation automatique fonctionne
- [ ] Affichage carte correct
- [ ] Affichage détails correct
- [ ] Base de données correcte
- [ ] Instructions utilisateur visibles
- [ ] Toutes les villes testées

---

## 🎯 Résultat attendu

**Si tous les tests passent** :

✅ Le système de localisation fonctionne parfaitement  
✅ Les utilisateurs peuvent localiser précisément leurs biens  
✅ Les acheteurs ont toutes les informations nécessaires

---

## 📸 Captures d'écran à faire

1. **Formulaire vide** : Pays sélectionné
2. **Ville sélectionnée** : Liste des communes
3. **Commune sélectionnée** : Champ quartier
4. **Carte d'annonce** : Localisation affichée
5. **Détails** : Localisation complète

---

## 💡 Conseils

1. **Tester d'abord Abidjan** (13 communes)
2. **Puis Bouaké** (8 communes)
3. **Enfin d'autres villes** (moins de communes)
4. **Publier 2-3 annonces** dans différentes communes
5. **Vérifier l'affichage** à chaque fois

---

## 🚀 Après les tests

Si tout fonctionne :
1. Publier des annonces réelles
2. Informer les utilisateurs de la nouvelle fonctionnalité
3. Collecter les retours

Si problème :
1. Noter le problème exact
2. Vérifier les logs (console navigateur)
3. Vérifier la base de données

---

**Bon test ! 🧪**
