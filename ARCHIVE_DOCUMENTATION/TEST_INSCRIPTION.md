# 🧪 Tests d'inscription - Résultats

## ✅ Configuration

- Base de données nettoyée : ✅ (3 utilisateurs supprimés)
- Migration exécutée : ✅ (Version20241117000000 appliquée)
- Serveur démarré : ✅ (http://localhost:8000)

---

## 📋 Tests à effectuer

### Test 1 : Inscription minimale

**Commande PowerShell :**
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

**Résultat attendu :**
- ✅ Status 201
- ✅ Message: "Inscription réussie"
- ✅ Utilisateur créé avec ID

---

### Test 2 : Inscription complète (avec champs optionnels)

**Commande PowerShell :**
```powershell
$body = @{
    email = "jane@example.com"
    password = "password456"
    firstName = "Jane"
    lastName = "Smith"
    country = "CI"
    whatsappPhone = "+22501234567"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

**Résultat attendu :**
- ✅ Status 201
- ✅ Inscription réussie avec tous les champs

---

### Test 3 : Connexion

**Commande PowerShell :**
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# Sauvegarder le token
$token = $response.token
Write-Host "Token: $token"
```

**Résultat attendu :**
- ✅ Status 200
- ✅ Token JWT retourné
- ✅ Informations utilisateur

---

### Test 4 : Récupérer son profil

**Commande PowerShell :**
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/me" `
    -Method Get `
    -Headers $headers
```

**Résultat attendu :**
- ✅ Status 200
- ✅ Profil complet avec bio (null), whatsappPhone (null ou valeur)

---

### Test 5 : Mettre à jour le profil

**Commande PowerShell :**
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$body = @{
    bio = "Développeur web passionné"
    whatsappPhone = "+22507654321"
    country = "CI"
    city = "Abidjan"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/update-profile" `
    -Method Put `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $body
```

**Résultat attendu :**
- ✅ Status 200
- ✅ Message: "Profil mis à jour avec succès"
- ✅ Informations mises à jour

---

## 🔍 Vérification en base de données

**Commande SQL :**
```sql
SELECT 
    id, 
    email, 
    first_name, 
    last_name, 
    bio, 
    whatsapp_phone, 
    country, 
    city,
    is_email_verified,
    is_phone_verified,
    account_type
FROM users;
```

**Résultat attendu :**
- ✅ 2 utilisateurs créés
- ✅ Champs whatsapp_phone et bio présents
- ✅ country et city peuvent être NULL

---

## 📝 Script PowerShell complet pour tests

Sauvegarder dans `test-auth.ps1` :

```powershell
# Test complet de l'authentification simplifiée

Write-Host "🧪 TEST 1 : Inscription minimale" -ForegroundColor Cyan
try {
    $body = @{
        email = "test@example.com"
        password = "password123"
        firstName = "John"
        lastName = "Doe"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "✅ Inscription minimale réussie!" -ForegroundColor Green
    $result | ConvertTo-Json
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🧪 TEST 2 : Inscription complète" -ForegroundColor Cyan
try {
    $body = @{
        email = "jane@example.com"
        password = "password456"
        firstName = "Jane"
        lastName = "Smith"
        country = "CI"
        whatsappPhone = "+22501234567"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "✅ Inscription complète réussie!" -ForegroundColor Green
    $result | ConvertTo-Json
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🧪 TEST 3 : Connexion" -ForegroundColor Cyan
try {
    $body = @{
        email = "test@example.com"
        password = "password123"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    
    $token = $result.token
    Write-Host "✅ Connexion réussie!" -ForegroundColor Green
    Write-Host "Token: $token`n"
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host "🧪 TEST 4 : Récupérer profil" -ForegroundColor Cyan
try {
    $headers = @{
        Authorization = "Bearer $token"
    }

    $result = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/me" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Profil récupéré!" -ForegroundColor Green
    $result | ConvertTo-Json
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🧪 TEST 5 : Mise à jour profil" -ForegroundColor Cyan
try {
    $headers = @{
        Authorization = "Bearer $token"
    }

    $body = @{
        bio = "Développeur web passionné"
        whatsappPhone = "+22507654321"
        country = "CI"
        city = "Abidjan"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/update-profile" `
        -Method Put `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "✅ Profil mis à jour!" -ForegroundColor Green
    $result | ConvertTo-Json
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✨ Tests terminés!" -ForegroundColor Green
```

**Exécuter :**
```powershell
cd "C:\Users\Elohim Mickael\Documents\plan-b"
.\test-auth.ps1
```

---

## 🎉 Résultat final

Une fois tous les tests passés :
- ✅ Inscription simplifiée fonctionnelle
- ✅ Plus de vérification OTP obligatoire
- ✅ WhatsApp et Bio disponibles
- ✅ Mise à jour profil fonctionnelle
- ✅ Orange Money temporairement désactivé
- ✅ Système prêt pour le frontend !
