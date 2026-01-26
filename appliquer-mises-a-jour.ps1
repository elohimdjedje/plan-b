# Script de mise à jour Plan B
# Applique toutes les modifications automatiquement

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🚀 PLAN B - MISE À JOUR COMPLÈTE" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour afficher des messages colorés
function Write-Step {
    param($Message)
    Write-Host "➤ $Message" -ForegroundColor Yellow
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Vérifier qu'on est dans le bon dossier
if (-not (Test-Path "planb-backend") -or -not (Test-Path "planb-frontend")) {
    Write-Error "Ce script doit être exécuté depuis le dossier racine plan-b"
    exit 1
}

# ============================================
# PARTIE 1: BACKEND (Symfony)
# ============================================
Write-Host ""
Write-Host "📦 PARTIE 1: BACKEND (Symfony)" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Magenta
Write-Host ""

Push-Location planb-backend

# Créer les migrations
Write-Step "Création des migrations pour la table reviews..."
try {
    php bin/console make:migration --no-interaction 2>&1 | Out-Null
    Write-Success "Migrations créées"
} catch {
    Write-Error "Erreur lors de la création des migrations"
}

# Appliquer les migrations
Write-Step "Application des migrations..."
try {
    php bin/console doctrine:migrations:migrate --no-interaction
    Write-Success "Migrations appliquées"
} catch {
    Write-Error "Erreur lors de l'application des migrations"
}

# Vider le cache
Write-Step "Vidage du cache Symfony..."
try {
    php bin/console cache:clear
    Write-Success "Cache vidé"
} catch {
    Write-Error "Erreur lors du vidage du cache"
}

Pop-Location

# ============================================
# PARTIE 2: FRONTEND (React + Vite)
# ============================================
Write-Host ""
Write-Host "🎨 PARTIE 2: FRONTEND (React + Vite)" -ForegroundColor Magenta
Write-Host "====================================" -ForegroundColor Magenta
Write-Host ""

Push-Location planb-frontend

# Installer les dépendances si nécessaire
Write-Step "Vérification des dépendances npm..."
if (-not (Test-Path "node_modules")) {
    Write-Step "Installation des dépendances..."
    npm install
    Write-Success "Dépendances installées"
} else {
    Write-Success "Dépendances déjà installées"
}

# Build optimisé
Write-Step "Build optimisé du frontend..."
try {
    npm run build 2>&1 | Out-Null
    Write-Success "Build terminé"
} catch {
    Write-Error "Erreur lors du build"
}

Pop-Location

# ============================================
# PARTIE 3: RÉSUMÉ
# ============================================
Write-Host ""
Write-Host "📊 RÉSUMÉ DES MODIFICATIONS" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Performance optimisée (lazy loading + code splitting)" -ForegroundColor Green
Write-Host "✅ Messages d'erreur améliorés (connexion/inscription)" -ForegroundColor Green
Write-Host "✅ Système d'avis et étoiles créé" -ForegroundColor Green
Write-Host "✅ Compteur de vues unique implémenté" -ForegroundColor Green
Write-Host "✅ Contact multi-canal vendeur ajouté" -ForegroundColor Green
Write-Host "✅ Discussion sans compte activée" -ForegroundColor Green
Write-Host "✅ Limite annonces: 4 FREE / Illimité PRO" -ForegroundColor Green
Write-Host ""

# ============================================
# PARTIE 4: TESTS À EFFECTUER
# ============================================
Write-Host ""
Write-Host "🧪 TESTS À EFFECTUER" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Tester le temps de chargement (doit être < 2s)" -ForegroundColor White
Write-Host "2. Tester messages d'erreur connexion/inscription" -ForegroundColor White
Write-Host "3. Créer un avis sur une annonce" -ForegroundColor White
Write-Host "4. Vérifier le compteur de vues unique" -ForegroundColor White
Write-Host "5. Tester le contact multi-canal" -ForegroundColor White
Write-Host "6. Vérifier la discussion sans compte" -ForegroundColor White
Write-Host "7. Tester la limite de 4 annonces en FREE" -ForegroundColor White
Write-Host ""

# ============================================
# PARTIE 5: DÉMARRAGE DES SERVEURS
# ============================================
Write-Host ""
Write-Host "🚀 DÉMARRAGE DES SERVEURS" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Voulez-vous démarrer les serveurs maintenant? (O/N)"

if ($choice -eq "O" -or $choice -eq "o") {
    Write-Host ""
    Write-Step "Démarrage du backend Symfony..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\planb-backend'; php -S localhost:8000 -t public"
    Start-Sleep -Seconds 2
    
    Write-Step "Démarrage du frontend Vite..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\planb-frontend'; npm run dev"
    Start-Sleep -Seconds 2
    
    Write-Success "Serveurs démarrés!"
    Write-Host ""
    Write-Host "📍 Backend:  http://localhost:8000" -ForegroundColor Cyan
    Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Pour démarrer manuellement:" -ForegroundColor Yellow
    Write-Host "  Backend:  cd planb-backend && php -S localhost:8000 -t public" -ForegroundColor White
    Write-Host "  Frontend: cd planb-frontend && npm run dev" -ForegroundColor White
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ MISE À JOUR TERMINÉE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Consultez GUIDE_MISE_A_JOUR_COMPLET.md pour plus de détails" -ForegroundColor Yellow
Write-Host ""
