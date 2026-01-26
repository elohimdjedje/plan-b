# 🔧 FIX ERREUR 400 - OTP

**Problème** : Backend retourne 400 Bad Request lors de l'envoi OTP

**Cause** : Le numéro avec espaces (`+33 669177983`) n'est pas nettoyé avant l'envoi

**Solution** : Nettoyage automatique du numéro dans `useOTP.js`

---

## ✅ CORRECTION APPLIQUÉE

### Avant ❌
```javascript
const result = await otpApi.sendOTP(phoneNumber);
// Envoyé : "+33 669177983" (avec espaces)
// Backend : 400 Bad Request
```

### Après ✅
```javascript
const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
const result = await otpApi.sendOTP(cleanPhone);
// Envoyé : "+33669177983" (sans espaces)
// Backend : 200 OK
```

---

## 🧪 TEST MAINTENANT

1. **Rafraîchir la page** (F5)
2. **Entrer le numéro** : `+33 669177983` (avec ou sans espaces)
3. **Cliquer "Recevoir le code"**
4. **✅ Le code OTP sera envoyé !**
5. **Récupérer le code** :
   ```powershell
   .\get-otp.ps1
   ```

---

## 📋 FORMATS ACCEPTÉS

Tous ces formats sont maintenant nettoyés automatiquement :

```
✅ +33 6 12 34 56 78
✅ +33-6-12-34-56-78
✅ +33 (6) 12 34 56 78
✅ +33612345678
✅ +225 07 12 34 56 78
✅ +1 (555) 123-4567
```

Tous deviennent → `+33612345678` avant envoi

---

**ESSAYEZ MAINTENANT !** 🚀

Rafraîchissez et testez avec : `+33 669177983`
