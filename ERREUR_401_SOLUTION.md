# 🔧 Solution - Erreur 401 lors de la connexion

## Diagnostic

### Erreur Observée
```
POST http://localhost:8000/api/v1/auth/login 401 (Unauthorized)
```

### Cause
L'email `pcusa@gmail.com` utilisé pour la connexion n'existe probablement pas dans la base de données, ou le mot de passe est incorrect.

---

## Solutions

### Option 1 : Créer un Nouveau Compte (Recommandé)

1. **Cliquer sur "Inscription"** dans l'interface
2. Remplir le formulaire :
   - Email : votre_email@example.com
   - Mot de passe : minimum 8 caractères
   - Prénom et nom

3. Se connecter avec les nouveaux identifiants

---

### Option 2 : Créer un Compte de Test via le Backend

**Script PowerShell** :
```powershell
# Créer un utilisateur de test
cd planb-backend

docker exec -it planb_api php bin/console app:create-user test@planb.com password123 John Doe
```

**Ou via API directement** :
```powershell
$body = @{
    email = "test@planb.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
    phone = "+221771234567"
    country = "Sénégal"
    city = "Dakar"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/v1/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

---

### Option 3 : Vérifier les Utilisateurs Existants

**Liste tous les utilisateurs** :
```powershell
docker exec planb_postgres psql -U postgres -d planb -c "SELECT id, email, first_name FROM users"
```

Si vous trouvez votre email, assurez-vous d'utiliser le bon mot de passe.

---

## Test de Connexion

Une fois le compte créé, testez :

**Email** : test@planb.com  
**Mot de passe** : password123

---

## Vérification

### Backend est actif ✅
```
http://localhost:8000/api/v1/listings → {"data":[],"hasMore":false}
```

### Base de données créée ✅
16 tables créées dont :
- users
- listings  
- messages
- payments
- etc.

### Frontend actif ✅
```
http://localhost:5173 → Application React
```

---

## Note

L'erreur 401 est **normale** si l'utilisateur n'existe pas ou si le mot de passe est incorrect. Ce n'est **pas** un bug, mais plutôt un problème d'identifiants.
