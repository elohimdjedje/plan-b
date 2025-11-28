# ⚡ TEST RAPIDE OTP - 2 MINUTES

## 🎯 TEST AVEC NUMÉRO FRANÇAIS

### 1️⃣ Ouvrir la page (10 sec)
```
http://localhost:5173/auth/register-otp
```

### 2️⃣ Entrer un numéro français (10 sec)
```
+33 6 12 34 56 78
```
Cliquer **"Recevoir le code"**

### 3️⃣ Récupérer le code (20 sec)
**PowerShell** :
```powershell
cd "C:\Users\Elohim Mickael\Documents\plan-b"
.\get-otp.ps1
```

**Résultat attendu** :
```
========================================
  RECHERCHE CODE OTP
========================================

✅ CODE OTP TROUVE !

📱 Numero: +33612345678
🔐 CODE: 123456

========================================
```

### 4️⃣ Entrer le code (10 sec)
Saisir les 6 chiffres affichés

### 5️⃣ Tester l'erreur (30 sec)
1. **Renvoyer un code** (bouton "Renvoyer le code")
2. **Récupérer le nouveau code** avec `get-otp.ps1`
3. **Entrer un MAUVAIS code** : `111111`
4. **Observer** :
   - ❌ Message "Code incorrect"
   - ✅ Champs vidés automatiquement
   - ✅ Curseur au premier champ
5. **Entrer le BON code**
6. **✅ Succès !**

### 6️⃣ Compléter l'inscription (1 min)
```
Email     : test@france.com
Password  : Test1234
Prénom    : Jean
Nom       : TEST
Pays      : France
Ville     : Paris
```

---

## ✅ CHECKLIST

- [ ] Numéro français accepté (+33)
- [ ] Code OTP reçu et visible dans logs
- [ ] Code correct → Vérification OK
- [ ] Mauvais code → Erreur + champs vidés
- [ ] Ressaisie possible
- [ ] Inscription complète

---

## 🚀 COMMANDE UNIQUE

**Tout en une ligne** :
```powershell
cd "C:\Users\Elohim Mickael\Documents\plan-b"; .\get-otp.ps1
```

---

**TEMPS TOTAL : 2 MINUTES** ⏱️

**C'EST PARTI !** 🎉
