# 🔧 Test de connexion mobile - Plan B

## ⚠️ Problème : "Erreur de connexion" sur mobile

### 🎯 Cause probable
Le navigateur mobile utilise l'**ancienne IP en cache** (`10.5.19.118` au lieu de `192.168.1.176`)

---

## ✅ **SOLUTION RAPIDE** (3 étapes)

### Sur votre téléphone :

#### 1️⃣ **Vider le cache du navigateur**

**Sur Chrome (Android)** :
1. **Menu** (3 points) → **Historique**
2. **Effacer les données de navigation**
3. Cochez **"Images et fichiers en cache"**
4. **Effacer les données**

**Sur Safari (iPhone)** :
1. **Réglages** → **Safari**
2. **Effacer historique et données de sites**
3. Confirmer

---

#### 2️⃣ **Fermer complètement le navigateur**
- Glissez pour fermer toutes les fenêtres
- Ou forcez la fermeture de l'app

---

#### 3️⃣ **Rouvrir et taper la nouvelle URL**

**Nouvelle adresse** : `http://192.168.1.176:5173`

⚠️ **NE PAS** cliquer sur un ancien favori/historique !  
✅ **TAPER** l'adresse complète manuellement

---

## 🔍 **Vérification rapide**

### Test 1 : Backend accessible ?

Sur votre PC, ouvrez :
```
http://192.168.1.176:8000/api/v1/listings
```

✅ **Doit afficher** : JSON avec les annonces  
❌ **Si erreur** : Le backend n'est pas accessible sur le réseau

---

### Test 2 : Frontend accessible ?

Sur votre téléphone, ouvrez :
```
http://192.168.1.176:5173
```

✅ **Doit afficher** : Page d'accueil Plan B  
❌ **Si timeout** : Vérifiez que téléphone et PC sont sur le **même Wi-Fi**

---

## 🆘 **Si ça ne fonctionne toujours pas**

### Vérifiez que :

1. ✅ **Même réseau Wi-Fi**
   - PC et téléphone connectés au **même routeur**
   - Pas de réseau invité séparé

2. ✅ **Pare-feu ouvert**
   - Ports 5173 et 8000 autorisés
   - Règles créées précédemment

3. ✅ **IP correcte**
   - Vérifiez avec `ipconfig` sur PC
   - Cherchez `Carte réseau sans fil Wi-Fi`
   - Adresse IPv4 doit être `192.168.1.176`

---

## 📱 **Alternative : Mode navigation privée**

Si le cache persiste :

1. **Ouvrez une fenêtre de navigation privée/incognito**
2. **Tapez** : `http://192.168.1.176:5173`
3. **Testez** la connexion

✅ Le mode privé n'utilise pas le cache !

---

## 🎯 **URLs à jour**

| Service | URL PC | URL Mobile |
|---------|--------|------------|
| Frontend | `http://localhost:5173` | `http://192.168.1.176:5173` |
| Backend | `http://localhost:8000` | `http://192.168.1.176:8000` |

---

**Date** : 27 novembre 2025  
**IP actuelle** : `192.168.1.176`  
**Ancienne IP** : `10.5.19.118` ❌ (ne fonctionne plus)
