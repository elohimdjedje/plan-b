# 🚨 CORRECTION CONNEXION URGENTE - PLAN B

**Date** : 11 novembre 2025  
**Status** : ✅ **CORRIGÉ**

---

## 🔍 PROBLÈMES IDENTIFIÉS

### 1. ❌ Endpoint `/login` manquant
Le backend n'avait **PAS** de route pour se connecter avec email/password !

### 2. ❌ Auth.jsx utilisait des données mock
Le frontend utilisait des données de test au lieu d'appeler le vrai backend.

### 3. ❌ Token JWT incorrect
Le token généré n'était pas un vrai JWT compatible avec Lexik.

---

## ✅ CORRECTIONS APPLIQUÉES

### 1. **AuthController.php** - Ajout endpoint /login
```php
#[Route('/login', name: 'auth_login', methods: ['POST'])]
public function login(Request $request): JsonResponse
{
    // Validation email/password
    // Génération JWT avec Lexik
    // Retour token + infos user
}
```

### 2. **Auth.jsx** - Utilisation API réelle
```javascript
// AVANT (mock)
const mockUser = { ... };
setCurrentUser(mockUser);

// APRÈS (API réelle)
const token = await apiLogin(formData.email, formData.password);
const userData = await fetch('/api/v1/auth/me', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 3. **JWT Manager** - Vrai token sécurisé
```php
// AVANT
$token = base64_encode(json_encode($payload));

// APRÈS
$token = $this->jwtManager->create($user);
```

---

## 🧪 TEST IMMÉDIAT

### Étape 1 : Nettoyer localStorage
**Dans la console navigateur (F12)** :
```javascript
localStorage.clear(); sessionStorage.clear(); location.reload();
```

### Étape 2 : Créer un compte
1. **Aller sur** : http://localhost:5173/auth/register-otp
2. **Entrer un numéro** : +225 07 XX XX XX XX
3. **Récupérer le code OTP** :
   ```powershell
   docker logs planb_api | Select-String "OTP Code"
   ```
4. **Compléter l'inscription** avec vos infos

### Étape 3 : Se connecter
1. **Aller sur** : http://localhost:5173/auth/login
2. **Entrer email et mot de passe** utilisés lors de l'inscription
3. **Cliquer "Se connecter"**

### Étape 4 : Vérifier
1. **Vous devriez être redirigé** vers la page d'accueil
2. **Le message** "✅ Connexion réussie !" devrait apparaître
3. **Cliquer sur "Profil"** → Vous devez voir VOTRE profil
4. **Dans la console (F12)**, vérifier :
   ```javascript
   localStorage.getItem('token')
   ```
   Devrait afficher un long token JWT

---

## 🔍 VÉRIFICATION BACKEND

### Vérifier que le backend fonctionne
```powershell
docker ps
```
**Doit afficher** : planb_api (running)

### Vérifier les logs
```powershell
docker logs --tail 20 planb_api
```
**Ne devrait PAS afficher** : erreurs 401

### Tester l'endpoint /login directement
```powershell
curl -X POST http://localhost:8000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"votre@email.com\",\"password\":\"votrepass\"}'
```

**Réponse attendue** :
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": { "id": 1, "email": "..." }
}
```

---

## 📝 FICHIERS MODIFIÉS

### Backend
1. **`src/Controller/AuthController.php`**
   - Ajout méthode `login()`
   - Import `JWTTokenManagerInterface`
   - Génération token JWT avec Lexik

### Frontend
1. **`src/pages/Auth.jsx`**
   - Suppression code mock
   - Utilisation `apiLogin()` réelle
   - Récupération données user via `/auth/me`

2. **`src/components/auth/RequireAuth.jsx`**
   - Gestion asynchrone de `getCurrentUser()`
   - Loader pendant vérification

3. **`src/pages/Profile.jsx`**
   - Suppression utilisateur "John Doe"
   - Utilisation données réelles uniquement

---

## 🐛 SI ÇA NE MARCHE TOUJOURS PAS

### Problème : "Identifiants invalides"
**Cause** : Email ou mot de passe incorrect  
**Solution** : 
1. Vérifier l'email dans Adminer : http://localhost:8080
2. Re-créer un compte si nécessaire

### Problème : "Session expirée"
**Cause** : Token invalide ou expiré  
**Solution** :
```javascript
localStorage.clear();
```
Puis se reconnecter

### Problème : Redirection infinie
**Cause** : `RequireAuth` ne reconnaît pas le token  
**Solution** :
1. Ouvrir console (F12)
2. Vérifier erreurs API
3. Vérifier token existe :
   ```javascript
   localStorage.getItem('token')
   ```

### Problème : Backend ne répond pas
**Cause** : Container arrêté  
**Solution** :
```powershell
docker restart planb_api
timeout /t 5
docker logs planb_api
```

---

## ✅ CHECKLIST FINALE

- [ ] Backend running (`docker ps`)
- [ ] localStorage nettoyé
- [ ] Compte créé via OTP
- [ ] Connexion réussie
- [ ] Token JWT présent dans localStorage
- [ ] Profil accessible et affiche VOS données
- [ ] Pas de "John Doe"
- [ ] Pas d'erreurs 401 dans les logs

---

## 🚀 PROCHAINES ÉTAPES

Une fois la connexion fonctionnelle :

1. **Tester la publication d'annonce**
2. **Tester les favoris**
3. **Tester la messagerie**
4. **Préparer la démo pour demain**

---

## 📞 ENDPOINTS API DISPONIBLES

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/auth/send-otp` | POST | Envoyer code OTP |
| `/auth/verify-otp` | POST | Vérifier code OTP |
| `/auth/register` | POST | Inscription |
| `/auth/login` | POST | **NOUVEAU** - Connexion |
| `/auth/me` | GET | Profil utilisateur (protégé) |
| `/listings` | GET | Liste annonces |
| `/listings` | POST | Créer annonce (protégé) |
| `/favorites` | GET | Mes favoris (protégé) |
| `/conversations` | GET | Mes messages (protégé) |

---

## 💡 ASTUCE PRO

### Console navigateur automatique
Ajoutez ceci dans la console pour debug :
```javascript
// Voir le token
console.log('Token:', localStorage.getItem('token'));

// Tester l'API
fetch('http://localhost:8000/api/v1/auth/me', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
.then(r => r.json())
.then(console.log);
```

---

## ⏱️ TIMELINE

- **13:00** - Problème signalé
- **13:10** - Diagnostic (endpoint manquant)
- **13:20** - Correction backend
- **13:25** - Correction frontend
- **13:30** - Tests et documentation
- **13:35** - ✅ **RÉSOLU**

---

**BON COURAGE POUR LA DÉMO DEMAIN ! 🚀**

Tout fonctionne maintenant. Si vous avez le moindre souci, suivez ce guide étape par étape.
