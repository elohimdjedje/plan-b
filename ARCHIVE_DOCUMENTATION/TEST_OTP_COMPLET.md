# 🧪 TEST OTP COMPLET - GUIDE PAS À PAS

**Date** : 11 novembre 2025, 20h45
**Objectif** : Tester l'inscription OTP de A à Z

---

## 🎯 TEST RAPIDE (3 MINUTES)

### 1️⃣ PRÉPARER (Terminal)

**Ouvrir PowerShell dans le dossier plan-b** :

```powershell
cd "C:\Users\Elohim Mickael\Documents\plan-b"
```

**Garder cette fenêtre ouverte** pour récupérer les codes OTP !

---

### 2️⃣ OUVRIR LA PAGE

**Dans le navigateur** :
```
http://localhost:5173/auth/register-otp
```

**Appuyez sur F5** pour être sûr d'avoir la dernière version.

---

### 3️⃣ ENTRER VOTRE NUMÉRO

**Avec le sélecteur** :

1. **Cliquer sur le menu** : `🇨🇮 +225 ▼`
2. **Choisir votre pays** :
   - 🇫🇷 **France** (+33) - Si vous testez depuis la France
   - 🇨🇮 **Côte d'Ivoire** (+225) - Si vous êtes en Côte d'Ivoire

3. **Entrer le numéro LOCAL** (sans l'indicatif, sans le 0) :

**Exemple France** :
```
Sélecteur : 🇫🇷 +33
Input     : 6 69 17 79 83
Résultat  : +33669177983
```

**Exemple Côte d'Ivoire** :
```
Sélecteur : 🇨🇮 +225
Input     : 7 12 34 56 78
Résultat  : +22571234 5678
```

4. **Vérifier en bas** : Le "Numéro complet" doit afficher le bon numéro

---

### 4️⃣ RECEVOIR LE CODE

**Cliquer** : `Recevoir le code`

**Attendre 2-3 secondes**

---

### 5️⃣ RÉCUPÉRER LE CODE OTP

**Dans PowerShell** :
```powershell
.\get-otp.ps1
```

**Résultat attendu** :
```
========================================
  RECHERCHE CODE OTP
========================================

✅ CODE OTP TROUVE !

📱 Numero: +33669177983
🔐 CODE: 123456

========================================
```

**⚠️ IMPORTANT** : Le numéro affiché doit correspondre EXACTEMENT au numéro que vous avez saisi !

---

### 6️⃣ SAISIR LE CODE

**Dans l'interface** :

1. Les 6 cases sont visibles
2. Saisir les 6 chiffres : `1` `2` `3` `4` `5` `6`
3. Le code se remplit automatiquement
4. La vérification se lance

---

### 7️⃣ VÉRIFIER LE RÉSULTAT

**✅ SI SUCCÈS** :
```
✓ Message vert : "Téléphone vérifié avec succès"
✓ Affichage : "Complétez votre profil"
✓ Le numéro vérifié apparaît en haut
```

**❌ SI ERREUR** :
```
✗ Message rouge : "Code incorrect ou expiré"
✗ Les champs se vident automatiquement
✗ Vous pouvez ressaisir
```

---

### 8️⃣ COMPLÉTER L'INSCRIPTION

**Si le téléphone est vérifié** :

Remplir le formulaire :
```
Email     : test@example.com
Mot passe : Test1234
Prénom    : Test
Nom       : USER
Pays      : Côte d'Ivoire (ou votre pays)
Ville     : Abidjan (ou votre ville)
```

**Cliquer** : `Créer mon compte`

**✅ SUCCÈS** :
```
✓ Message : "Inscription réussie !"
✓ Redirection vers /auth/login
✓ Vous pouvez vous connecter
```

---

## 🔍 DÉBOGAGE EN CAS DE PROBLÈME

### Problème 1 : "Code expiré ou introuvable"

**Cause** : Le numéro utilisé pour récupérer ne correspond pas au numéro envoyé

**Solution** :
```powershell
# Voir TOUS les codes générés
docker logs planb_api | Select-String "OTP CODE"
```

**Vérifiez** :
- Le numéro dans les logs : `+33669177983`
- Le numéro affiché dans l'interface : `+33669177983`
- **Doivent être IDENTIQUES !**

---

### Problème 2 : "Code incorrect"

**Cause** : Code mal saisi ou expiré (>5 min)

**Solution** :
1. **Vérifier le code** avec `get-otp.ps1`
2. **Renvoyer un code** (bouton "Renvoyer le code")
3. **Saisir le NOUVEAU code**

---

### Problème 3 : Page blanche après le code

**Cause** : La vérification échoue (400) et la page ne continue pas

**Solution** :
```powershell
# Voir les logs détaillés
docker logs --tail 30 planb_api
```

**Chercher** :
```
🔍 Verify OTP - Phone: +33669177983, Code: 123456
🔍 Cache Key: otp_+33669177983
🔍 Stored Code: 123456
```

**Si le code est NULL** :
```
🔍 Stored Code: NULL
```
→ Le code a expiré ou le numéro ne correspond pas

---

### Problème 4 : Numéro incorrect dans les logs

**Exemple** :
```
Vous avez saisi : +33669177983
Dans les logs    : +330669177983  ❌ (0 en trop)
```

**Solution** :
- **Rafraîchir la page** (F5)
- Le 0 initial est maintenant supprimé automatiquement
- Réessayer

---

## 📊 LOGS À SURVEILLER

### Logs d'envoi OTP (send-otp)
```
[Tue Nov 11 20:45:00 2025] 
========================================
📱 OTP CODE FOR +33669177983
🔐 CODE: 123456
⏰ Valid for 5 minutes
========================================

[200]: POST /api/v1/auth/send-otp
```

**✅ Bon** : Code 200, numéro correct

---

### Logs de vérification OTP (verify-otp)
```
🔍 Verify OTP - Phone: +33669177983, Code: 123456
🔍 Cache Key: otp_+33669177983
🔍 Stored Code: 123456
[200]: POST /api/v1/auth/verify-otp
```

**✅ Bon** : Code 200, stored code correspond

---

```
🔍 Verify OTP - Phone: +33669177983, Code: 123456
🔍 Cache Key: otp_+33669177983
🔍 Stored Code: NULL
[400]: POST /api/v1/auth/verify-otp
```

**❌ Erreur** : Code 400, stored code NULL

**Solutions** :
1. Le code a expiré (>5 min)
2. Le numéro ne correspond pas
3. Le cache a été vidé (backend redémarré)

---

## 🧪 SCÉNARIOS DE TEST

### Scénario 1 : Tout fonctionne ✅
```
1. Entrer +33669177983
2. Recevoir le code : 123456
3. Saisir 123456
4. ✅ Vérifié !
5. Compléter formulaire
6. ✅ Compte créé !
```

---

### Scénario 2 : Mauvais code puis bon code ✅
```
1. Entrer +33669177983
2. Recevoir le code : 123456
3. Saisir 999999 (mauvais)
4. ❌ "Code incorrect"
5. Champs vidés automatiquement
6. Saisir 123456 (bon)
7. ✅ Vérifié !
```

---

### Scénario 3 : Code expiré ✅
```
1. Entrer +33669177983
2. Recevoir le code : 123456
3. Attendre 6 minutes
4. Saisir 123456
5. ❌ "Code expiré"
6. Cliquer "Renvoyer le code"
7. Nouveau code : 654321
8. Saisir 654321
9. ✅ Vérifié !
```

---

### Scénario 4 : Changer de numéro ✅
```
1. Entrer +33611111111
2. Recevoir le code : 123456
3. Cliquer "Modifier le numéro"
4. Entrer +33622222222
5. Recevoir nouveau code : 654321
6. Saisir 654321
7. ✅ Vérifié avec le nouveau numéro !
```

---

## 📋 CHECKLIST DE VÉRIFICATION

Avant de déclarer le test réussi, vérifier :

- [ ] Le sélecteur de pays fonctionne
- [ ] Le numéro complet s'affiche correctement
- [ ] Le bouton "Recevoir le code" fonctionne
- [ ] Le code OTP est visible dans les logs
- [ ] `get-otp.ps1` récupère le bon code
- [ ] Le numéro dans les logs correspond à celui saisi
- [ ] La saisie du code fonctionne
- [ ] Le bon code est accepté
- [ ] Un mauvais code est rejeté et les champs se vident
- [ ] Le message de succès apparaît
- [ ] Le formulaire d'inscription s'affiche
- [ ] L'inscription se finalise correctement

---

## 🚨 EN CAS DE BLOCAGE

### Solution rapide : Backend frais
```powershell
# Redémarrer tout
docker restart planb_api

# Attendre 10 secondes
Start-Sleep -Seconds 10

# Vérifier que c'est démarré
docker ps
```

### Solution ultime : Clear cache
```powershell
# Vider le cache Symfony
docker exec planb_api php bin/console cache:clear

# Redémarrer
docker restart planb_api
```

---

## 🎯 TEST MAINTENANT !

**Allez-y, testez avec ces étapes** :

1. **Terminal prêt** : `cd C:\Users\Elohim Mickael\Documents\plan-b`
2. **Page ouverte** : http://localhost:5173/auth/register-otp
3. **Entrer numéro** : 🇫🇷 +33 puis `6 69 17 79 83`
4. **Recevoir code** : Cliquer le bouton
5. **Récupérer** : `.\get-otp.ps1`
6. **Saisir** : Les 6 chiffres
7. **✅ VÉRIFIER** : Ça doit marcher !

---

**SI ÇA NE MARCHE PAS** :

1. **Copier les logs** :
   ```powershell
   docker logs --tail 50 planb_api > logs_otp.txt
   notepad logs_otp.txt
   ```

2. **Me montrer** :
   - Le numéro que vous avez saisi
   - Le code que vous avez saisi
   - Les logs du backend

Et je vous aiderai à trouver le problème ! 🔍

---

**BON TEST ! 🚀**
