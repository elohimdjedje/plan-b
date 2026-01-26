# 🧪 Guide de test du filtrage des annonces

## 🎯 Objectif
Valider que le système de filtrage fonctionne correctement comme sur LeBonCoin.

---

## ⚠️ AVANT DE COMMENCER

### 1. Redémarrer le backend (OBLIGATOIRE)

```powershell
cd planb-backend

# Vider le cache
php bin/console cache:clear

# Arrêter le serveur actuel (Ctrl+C dans la fenêtre)
# Puis redémarrer
php -S localhost:8000 -t public
```

### 2. Vérifier que tout tourne

```powershell
# PostgreSQL
docker ps
# Doit afficher : planb-postgres

# Backend
# Doit tourner sur localhost:8000

# Frontend  
cd planb-frontend
npm run dev
# Doit tourner sur localhost:5173
```

---

## 📋 Scénario de test complet

### Étape 1 : Créer 3 annonces de test

#### Annonce 1 : Immobilier
1. Ouvrir http://localhost:5173
2. Se connecter
3. Cliquer "Publier une annonce"
4. **Catégorie** : Immobilier
5. **Sous-catégorie** : Villa
6. **Titre** : "Villa moderne 5 pièces"
7. **Description** : "Belle villa avec jardin et piscine"
8. **Prix** : 50000000
9. **Ville** : Abidjan
10. **Ajouter 1 image**
11. Publier

#### Annonce 2 : Véhicule
1. Cliquer "Publier une annonce"
2. **Catégorie** : Véhicule
3. **Sous-catégorie** : Voiture
4. **Titre** : "Toyota Corolla 2020"
5. **Description** : "Voiture en excellent état, première main"
6. **Prix** : 8000000
7. **Ville** : Abidjan
8. **Ajouter 1 image**
9. Publier

#### Annonce 3 : Vacance
1. Cliquer "Publier une annonce"
2. **Catégorie** : Vacance
3. **Sous-catégorie** : Hôtel
4. **Titre** : "Hôtel 4 étoiles bord de mer"
5. **Description** : "Hôtel avec vue sur l'océan, restaurant gastronomique"
6. **Prix** : 25000
7. **Ville** : Grand-Bassam
8. **Ajouter 1 image**
9. Publier

---

### Étape 2 : Tester le filtrage

#### Test A : Page d'accueil

1. Aller sur la page d'accueil (cliquer sur le logo ou "Accueil")
2. **Résultat attendu** : ✅ **3 annonces affichées**
   - Villa moderne
   - Toyota Corolla
   - Hôtel 4 étoiles

---

#### Test B : Catégorie Immobilier

1. Cliquer sur l'onglet **"Immobilier"**
2. **Résultat attendu** :
   - ✅ **1 annonce** : Villa moderne
   - ❌ **PAS** la Toyota
   - ❌ **PAS** l'hôtel

**Si vous voyez les 3 annonces** → ❌ Le filtrage ne fonctionne pas
**Si vous ne voyez que la villa** → ✅ Parfait !

---

#### Test C : Catégorie Véhicule

1. Cliquer sur l'onglet **"Véhicule"**
2. **Résultat attendu** :
   - ✅ **1 annonce** : Toyota Corolla
   - ❌ **PAS** la villa
   - ❌ **PAS** l'hôtel

---

#### Test D : Catégorie Vacance

1. Cliquer sur l'onglet **"Vacance"**
2. **Résultat attendu** :
   - ✅ **1 annonce** : Hôtel 4 étoiles
   - ❌ **PAS** la villa
   - ❌ **PAS** la Toyota

---

#### Test E : Retour à l'accueil

1. Cliquer sur **"Accueil"** ou le logo Plan B
2. **Résultat attendu** : ✅ **3 annonces** (toutes)

---

### Étape 3 : Tester les sous-catégories

#### Test F : Sous-catégorie Villa

1. Aller dans **"Immobilier"**
2. Cliquer sur la sous-catégorie **"Villa"** (si disponible dans l'UI)
3. **Résultat attendu** :
   - ✅ **1 annonce** : Villa moderne

---

### Étape 4 : Tester le profil utilisateur

#### Test G : Compteur d'annonces

1. Cliquer sur l'icône de profil (en bas à droite)
2. **Résultat attendu** :
   - ✅ Compteur d'annonces : **3**
   - ✅ Les 3 annonces s'affichent dans la liste

---

#### Test H : Compteur de vues (initial)

1. Dans le profil
2. **Résultat attendu** :
   - ✅ Compteur de vues : **0**
   (personne n'a encore consulté les annonces)

---

### Étape 5 : Tester l'incrémentation des vues

#### Test I : Consulter une annonce

1. Revenir à l'accueil
2. **Ouvrir** la villa (clic sur la carte)
3. Revenir en arrière
4. Aller dans **"Profil"**
5. **Résultat attendu** :
   - ✅ Compteur de vues : **1**

---

#### Test J : Consulter plusieurs fois

1. Revenir à l'accueil
2. **Ouvrir** la villa **2 fois de plus**
3. **Ouvrir** la Toyota **3 fois**
4. Aller dans **"Profil"**
5. **Résultat attendu** :
   - ✅ Compteur de vues total : **6** (3 + 3)
   - ✅ Villa : 3 vues
   - ✅ Toyota : 3 vues
   - ✅ Hôtel : 0 vues

---

## 🐛 Diagnostic des problèmes

### Problème 1 : Toutes les annonces s'affichent dans chaque catégorie

**Cause** : Le backend n'a pas été redémarré après la modification

**Solution** :
```powershell
cd planb-backend
php bin/console cache:clear
# Redémarrer le serveur (Ctrl+C puis php -S localhost:8000 -t public)
```

---

### Problème 2 : Erreur 500 lors de la publication

**Cause** : Catégorie invalide (ancien format avec 's')

**Solution** : 
- Vérifier que vous utilisez bien les nouvelles catégories :
  - `immobilier` ✅
  - `vehicule` ✅ (sans s)
  - `vacance` ✅ (sans s)

---

### Problème 3 : Le compteur de vues ne s'incrémente pas

**Vérification** :
```powershell
cd planb-backend
php bin/console doctrine:query:sql "SELECT id, title, views_count FROM listings"
```

**Si views_count est NULL** :
```powershell
php bin/console doctrine:query:sql "UPDATE listings SET views_count = 0 WHERE views_count IS NULL"
```

---

### Problème 4 : Les annonces n'apparaissent pas dans le profil

**Vérification** :
1. Ouvrir la console du navigateur (F12)
2. Aller dans l'onglet "Network"
3. Aller dans le profil
4. Chercher la requête `/users/my-listings`
5. Vérifier la réponse

**Si erreur 500** : Regarder les logs du backend

---

## ✅ Checklist finale

Cochez chaque test réussi :

- [ ] ✅ Accueil affiche 3 annonces
- [ ] ✅ Immobilier affiche 1 annonce (villa)
- [ ] ✅ Véhicule affiche 1 annonce (voiture)
- [ ] ✅ Vacance affiche 1 annonce (hôtel)
- [ ] ✅ Retour accueil affiche 3 annonces
- [ ] ✅ Profil affiche 3 annonces
- [ ] ✅ Compteur d'annonces = 3
- [ ] ✅ Compteur de vues initial = 0
- [ ] ✅ Vues s'incrémentent à chaque consultation
- [ ] ✅ Total des vues correct dans le profil

---

## 🎯 Résultat attendu

**Si tous les tests passent** → ✅ Le filtrage fonctionne parfaitement !

**Comportement comme LeBonCoin** :
- ✅ Chaque catégorie affiche uniquement ses annonces
- ✅ Les annonces ne se mélangent pas
- ✅ L'accueil affiche tout
- ✅ Le profil montre les stats en temps réel
- ✅ Les vues sont comptabilisées

---

## 📸 Captures d'écran à faire

Pour valider visuellement :

1. **Accueil** : 3 annonces visibles
2. **Immobilier** : 1 annonce (villa)
3. **Véhicule** : 1 annonce (voiture)
4. **Vacance** : 1 annonce (hôtel)
5. **Profil** : Stats avec 3 annonces et X vues

---

## 🚀 Commande de test rapide (backend)

```powershell
cd planb-backend

# Voir toutes les annonces
php bin/console doctrine:query:sql "SELECT id, title, category, subcategory, views_count FROM listings"

# Filtrer par catégorie
php bin/console doctrine:query:sql "SELECT id, title FROM listings WHERE category = 'immobilier'"
php bin/console doctrine:query:sql "SELECT id, title FROM listings WHERE category = 'vehicule'"
php bin/console doctrine:query:sql "SELECT id, title FROM listings WHERE category = 'vacance'"

# Voir les vues
php bin/console doctrine:query:sql "SELECT id, title, views_count FROM listings ORDER BY views_count DESC"
```

---

## 📝 Notes

- Le test complet prend environ **10 minutes**
- Les annonces de test peuvent être supprimées après validation
- Les vues sont persistantes en base de données
- Chaque rechargement de page ne compte pas comme une nouvelle vue (à vérifier)

**Bon test ! 🧪**
