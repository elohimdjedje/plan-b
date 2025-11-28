# ================================================================
# INSTALLATION DU COMPTEUR DE VUES OPTIMISE
# ================================================================
# Ce script installe le systeme de comptage professionnel
# ================================================================

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   INSTALLATION COMPTEUR DE VUES OPTIMISE            " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\Elohim Mickael\Documents\plan-b"

# ================================================================
# BACKEND - Migration de la base de donnees
# ================================================================
Write-Host "[1/3] Configuration Backend..." -ForegroundColor Yellow
Write-Host ""

Set-Location "$projectRoot\planb-backend"

Write-Host "  Creation de la table listing_views..." -ForegroundColor Cyan
php bin/console doctrine:migrations:migrate --no-interaction

Write-Host ""
Write-Host "  Verification de la table..." -ForegroundColor Cyan
php bin/console dbal:run-sql "SELECT COUNT(*) as count FROM listing_views"

Write-Host ""
Write-Host "  OK - Backend configure" -ForegroundColor Green
Write-Host ""

# ================================================================
# FRONTEND - Verification des fichiers
# ================================================================
Write-Host "[2/3] Verification Frontend..." -ForegroundColor Yellow
Write-Host ""

$frontendFiles = @(
    "$projectRoot\planb-frontend\src\components\listing\ViewCounter.jsx",
    "$projectRoot\planb-frontend\src\utils\viewTracking.js"
)

$allOk = $true
foreach ($file in $frontendFiles) {
    $fileName = Split-Path $file -Leaf
    if (Test-Path $file) {
        Write-Host "  OK - $fileName" -ForegroundColor Green
    } else {
        Write-Host "  ERREUR - $fileName manquant" -ForegroundColor Red
        $allOk = $false
    }
}

Write-Host ""
if ($allOk) {
    Write-Host "  OK - Tous les fichiers presents" -ForegroundColor Green
} else {
    Write-Host "  ATTENTION - Certains fichiers manquants" -ForegroundColor Yellow
}
Write-Host ""

# ================================================================
# TEST
# ================================================================
Write-Host "[3/3] Test du systeme..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Test de la table..." -ForegroundColor Cyan
Set-Location "$projectRoot\planb-backend"
$testResult = php bin/console dbal:run-sql "SELECT table_name FROM information_schema.tables WHERE table_name = 'listing_views'" 2>&1

if ($testResult -like "*listing_views*") {
    Write-Host "  OK - Table listing_views creee" -ForegroundColor Green
} else {
    Write-Host "  ERREUR - Table non trouvee" -ForegroundColor Red
}

Write-Host ""

# ================================================================
# RESUME
# ================================================================
Write-Host "======================================================" -ForegroundColor Green
Write-Host "   INSTALLATION TERMINEE                             " -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""

Write-Host "COMPOSANTS INSTALLES :" -ForegroundColor White
Write-Host "  1. Service ViewCounterService" -ForegroundColor Cyan
Write-Host "  2. Entity ListingView" -ForegroundColor Cyan
Write-Host "  3. Table listing_views" -ForegroundColor Cyan
Write-Host "  4. Composant ViewCounter" -ForegroundColor Cyan
Write-Host "  5. Systeme de tracking" -ForegroundColor Cyan
Write-Host ""

Write-Host "FONCTIONNALITES :" -ForegroundColor White
Write-Host "  - Vue unique par utilisateur/IP par 24h" -ForegroundColor Green
Write-Host "  - Protection anti-bots" -ForegroundColor Green
Write-Host "  - Animation style reseaux sociaux" -ForegroundColor Green
Write-Host "  - Formatage automatique (1k, 10k, 1M)" -ForegroundColor Green
Write-Host "  - Badge Hot pour annonces populaires" -ForegroundColor Green
Write-Host "  - Tracking minimum 3 secondes" -ForegroundColor Green
Write-Host ""

Write-Host "PROCHAINES ETAPES :" -ForegroundColor Yellow
Write-Host "  1. Redemarrer le backend et frontend" -ForegroundColor White
Write-Host "  2. Tester une annonce" -ForegroundColor White
Write-Host "  3. Verifier le compteur de vues" -ForegroundColor White
Write-Host ""

Write-Host "DOCUMENTATION :" -ForegroundColor Cyan
Write-Host "  Lire: COMPTEUR_VUES_OPTIMISE.md" -ForegroundColor White
Write-Host ""

Set-Location $projectRoot
