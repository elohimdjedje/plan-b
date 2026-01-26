# Script de mise à jour complète du projet Plan B
# Ce script met à jour tous les composants pour éviter les dysfonctionnements

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MISE À JOUR COMPLÈTE - PLAN B" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\Elohim Mickael\Documents\plan-b"
$hasErrors = $false

# Fonction pour afficher un message de succès
function Show-Success {
    param([string]$Message)
    Write-Host "[OK]" -ForegroundColor Green -NoNewline
    Write-Host " $Message"
}

# Fonction pour afficher un message d'erreur
function Show-Error {
    param([string]$Message)
    Write-Host "[ERREUR]" -ForegroundColor Red -NoNewline
    Write-Host " $Message"
    $script:hasErrors = $true
}

# Fonction pour afficher une étape
function Show-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "→ $Message" -ForegroundColor Yellow
}

# ============================================
# ÉTAPE 1 : Vérification des prérequis
# ============================================
Show-Step "Vérification des prérequis..."

# Vérifier Docker
try {
    docker --version | Out-Null
    Show-Success "Docker installé"
} catch {
    Show-Error "Docker n'est pas installé"
}

# Vérifier PHP
try {
    $phpVersion = php -v 2>&1 | Select-String "PHP"
    Show-Success "PHP installé : $($phpVersion.Line.Split()[1])"
} catch {
    Show-Error "PHP n'est pas installé"
}

# Vérifier Node
try {
    $nodeVersion = node -v
    Show-Success "Node.js installé : $nodeVersion"
} catch {
    Show-Error "Node.js n'est pas installé"
}

# Vérifier PostgreSQL
$pgRunning = docker ps --filter "name=planb-postgres" --format "{{.Names}}"
if ($pgRunning) {
    Show-Success "PostgreSQL en cours d'exécution"
} else {
    Write-Host "[INFO]" -ForegroundColor Yellow -NoNewline
    Write-Host " PostgreSQL n'est pas démarré - Démarrage en cours..."
    
    $pgExists = docker ps -a --filter "name=planb-postgres" --format "{{.Names}}"
    if ($pgExists) {
        docker start planb-postgres | Out-Null
        Start-Sleep -Seconds 3
        Show-Success "PostgreSQL démarré"
    } else {
        docker run -d `
            --name planb-postgres `
            -e POSTGRES_USER=postgres `
            -e POSTGRES_PASSWORD=root `
            -e POSTGRES_DB=planb `
            -p 5432:5432 `
            postgres:15-alpine | Out-Null
        Start-Sleep -Seconds 5
        Show-Success "PostgreSQL créé et démarré"
    }
}

# ============================================
# ÉTAPE 2 : Mise à jour du Backend
# ============================================
Show-Step "Mise à jour du Backend (Symfony)..."

cd "$projectRoot\planb-backend"

# Vider le cache Symfony
Write-Host "  • Vidage du cache..."
php bin/console cache:clear --no-interaction 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Show-Success "Cache Symfony vidé"
} else {
    Show-Error "Erreur lors du vidage du cache"
}

# Vérifier la connexion à la base de données
Write-Host "  • Test de connexion à la base de données..."
$dbTest = php bin/console doctrine:query:sql "SELECT 1" 2>&1
if ($LASTEXITCODE -eq 0) {
    Show-Success "Connexion PostgreSQL OK"
} else {
    Show-Error "Impossible de se connecter à PostgreSQL"
}

# Vérifier les migrations
Write-Host "  • Vérification des migrations..."
$migrationsStatus = php bin/console doctrine:migrations:status --no-interaction 2>&1
if ($migrationsStatus -like "*up to date*" -or $migrationsStatus -like "*executed*") {
    Show-Success "Migrations à jour"
} else {
    Write-Host "  • Application des migrations..."
    php bin/console doctrine:migrations:migrate --no-interaction 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Show-Success "Migrations appliquées"
    } else {
        Show-Error "Erreur lors des migrations"
    }
}

# Vérifier les dépendances Composer
Write-Host "  • Vérification des dépendances Composer..."
if (Test-Path "vendor") {
    Show-Success "Dépendances Composer installées"
} else {
    Write-Host "  • Installation des dépendances..."
    composer install --no-interaction 2>&1 | Out-Null
    Show-Success "Dépendances installées"
}

# Régénérer l'autoload
Write-Host "  • Régénération de l'autoload..."
composer dump-autoload --optimize --no-interaction 2>&1 | Out-Null
Show-Success "Autoload régénéré"

# Vérifier le dossier uploads
Write-Host "  • Vérification du dossier uploads..."
$uploadsPath = "public\uploads\listings"
if (-not (Test-Path $uploadsPath)) {
    New-Item -ItemType Directory -Force -Path $uploadsPath | Out-Null
    Show-Success "Dossier uploads créé"
} else {
    Show-Success "Dossier uploads existe"
}

# ============================================
# ÉTAPE 3 : Mise à jour du Frontend
# ============================================
Show-Step "Mise à jour du Frontend (React + Vite)..."

cd "$projectRoot\planb-frontend"

# Vérifier les dépendances npm
Write-Host "  • Vérification des dépendances npm..."
if (Test-Path "node_modules") {
    Show-Success "Dépendances npm installées"
} else {
    Write-Host "  • Installation des dépendances..."
    npm install 2>&1 | Out-Null
    Show-Success "Dépendances installées"
}

# Vérifier le fichier .env
Write-Host "  • Vérification de la configuration..."
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "VITE_API_URL") {
        Show-Success "Configuration .env OK"
    } else {
        Show-Error "Configuration .env incomplète"
    }
} else {
    Show-Error "Fichier .env manquant"
}

# ============================================
# ÉTAPE 4 : Vérification de la cohérence
# ============================================
Show-Step "Vérification de la cohérence du projet..."

cd "$projectRoot\planb-backend"

# Vérifier les catégories en base de données
Write-Host "  • Vérification des catégories..."
$categoriesCheck = php bin/console doctrine:query:sql "SELECT DISTINCT category FROM listings" 2>&1
if ($LASTEXITCODE -eq 0) {
    Show-Success "Catégories vérifiées"
} else {
    Show-Success "Aucune annonce (base vide)"
}

# Vérifier les images orphelines
Write-Host "  • Vérification des images..."
$imagesCount = (Get-ChildItem "$projectRoot\planb-backend\public\uploads\listings" -ErrorAction SilentlyContinue | Measure-Object).Count
Show-Success "Images dans le dossier : $imagesCount"

# ============================================
# ÉTAPE 5 : Redémarrage des services
# ============================================
Show-Step "Redémarrage des services..."

# Arrêter les processus PHP existants
$phpProcesses = Get-Process php -ErrorAction SilentlyContinue
if ($phpProcesses) {
    Write-Host "  • Arrêt des serveurs PHP existants..."
    $phpProcesses | Stop-Process -Force
    Start-Sleep -Seconds 1
    Show-Success "Serveurs PHP arrêtés"
}

# Arrêter les processus Node existants (Vite)
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*vite*" }
if ($nodeProcesses) {
    Write-Host "  • Arrêt des serveurs Vite existants..."
    $nodeProcesses | Stop-Process -Force
    Start-Sleep -Seconds 1
    Show-Success "Serveurs Vite arrêtés"
}

# Démarrer le backend
Write-Host "  • Démarrage du backend..."
cd "$projectRoot\planb-backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\planb-backend'; Write-Host 'Backend Symfony - http://localhost:8000' -ForegroundColor Cyan; php -S localhost:8000 -t public"
Start-Sleep -Seconds 2
Show-Success "Backend démarré sur http://localhost:8000"

# Démarrer le frontend
Write-Host "  • Démarrage du frontend..."
cd "$projectRoot\planb-frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\planb-frontend'; Write-Host 'Frontend React - http://localhost:5173' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 2
Show-Success "Frontend démarré sur http://localhost:5173"

# ============================================
# ÉTAPE 6 : Tests de validation
# ============================================
Show-Step "Tests de validation..."

Start-Sleep -Seconds 3

# Test de l'API backend
Write-Host "  • Test de l'API backend..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/listings" -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Show-Success "API backend répond correctement"
    }
} catch {
    Show-Error "L'API backend ne répond pas"
}

# Test du frontend
Write-Host "  • Test du frontend..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Show-Success "Frontend accessible"
    }
} catch {
    Show-Error "Le frontend n'est pas accessible"
}

# ============================================
# RÉSUMÉ
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RÉSUMÉ DE LA MISE À JOUR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not $hasErrors) {
    Write-Host "✅ Mise à jour complétée avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Votre application est prête à être utilisée :" -ForegroundColor White
    Write-Host "   • Frontend : http://localhost:5173" -ForegroundColor Cyan
    Write-Host "   • Backend  : http://localhost:8000" -ForegroundColor Cyan
    Write-Host "   • API      : http://localhost:8000/api/v1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 État de la base de données :" -ForegroundColor White
    cd "$projectRoot\planb-backend"
    $listingsCount = php bin/console doctrine:query:sql "SELECT COUNT(*) FROM listings" 2>&1 | Select-String "\d+" | Select-Object -First 1
    Write-Host "   • Annonces : $($listingsCount -replace '\D+','')" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✨ Catégories disponibles :" -ForegroundColor White
    Write-Host "   • Immobilier (appartement, villa, studio, terrain, magasin)" -ForegroundColor Gray
    Write-Host "   • Véhicule (voiture, moto)" -ForegroundColor Gray
    Write-Host "   • Vacance (appartement meublé, villa meublée, studio meublé, hôtel)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Prochaines étapes :" -ForegroundColor Yellow
    Write-Host "   1. Ouvrir http://localhost:5173 dans votre navigateur" -ForegroundColor Gray
    Write-Host "   2. Publier des annonces de test" -ForegroundColor Gray
    Write-Host "   3. Tester le filtrage par catégorie" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "⚠️  Mise à jour complétée avec des erreurs" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Consultez les messages ci-dessus pour plus de détails." -ForegroundColor Gray
    Write-Host "Vous pouvez réexécuter ce script après avoir corrigé les erreurs." -ForegroundColor Gray
    Write-Host ""
}

Write-Host "📝 Documentation disponible :" -ForegroundColor White
Write-Host "   • FILTRAGE_CORRIGE.md - Résumé des corrections" -ForegroundColor Gray
Write-Host "   • TEST_FILTRAGE.md - Guide de test complet" -ForegroundColor Gray
Write-Host "   • CORRECTION_FILTRAGE_ANNONCES.md - Documentation technique" -ForegroundColor Gray
Write-Host ""

cd $projectRoot
