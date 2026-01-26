# ⚡ TEST RAPIDE - CONNEXION PLAN B

## 🎯 EN 3 MINUTES

### ✅ Étape 1 : Nettoyer (30 secondes)
**Appuyez sur F12** → **Console** → **Copier-coller** :
```javascript
localStorage.clear(); sessionStorage.clear(); location.reload();
```

### ✅ Étape 2 : Créer un compte (2 minutes)

1. **Aller sur** : http://localhost:5173/auth/register-otp

2. **Entrer un numéro** :
   ```
   +225 07 12 34 56 78
   ```

3. **Récupérer le code OTP** dans PowerShell :
   ```powershell
   docker logs planb_api | Select-String "OTP Code"
   ```
   **Exemple de résultat** :
   ```
   OTP Code for +22507123456 78: 123456
   ```

4. **Entrer le code** (6 chiffres)

5. **Compléter le formulaire** :
   - Email : mickael@test.com
   - Mot de passe : Test1234
   - Prénom : Mickael
   - Nom : TEST
   - Pays : Côte d'Ivoire
   - Ville : Abidjan

6. **Cliquer "Créer mon compte"**

### ✅ Étape 3 : Se connecter (30 secondes)

1. **Vous serez redirigé** vers `/auth/login`

2. **Entrer identifiants** :
   - Email : mickael@test.com
   - Mot de passe : Test1234

3. **Cliquer "Se connecter"**

4. **✅ SUCCÈS !** Vous êtes redirigé vers l'accueil

---

## 🔍 VÉRIFICATIONS

### ✅ Connexion réussie si :
- Message "✅ Connexion réussie !" apparaît
- Redirection vers page d'accueil
- En cliquant sur "Profil", vous voyez VOS données (pas "John Doe")

### ❌ Si problème :
1. **Console (F12)** : Vérifier erreurs
2. **Backend** :
   ```powershell
   docker ps
   docker logs planb_api
   ```
3. **Relire** : `CORRECTION_CONNEXION_URGENTE.md`

---

## 🎉 APRÈS LA CONNEXION

### Tester les fonctionnalités :
1. **Profil** → Voir vos infos
2. **Publier** → Créer une annonce
3. **Favoris** → Ajouter un cœur
4. **Messages** → Tester la messagerie

---

**Tout est prêt pour votre démo demain ! 🚀**
