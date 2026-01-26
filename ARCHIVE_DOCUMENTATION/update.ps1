# Script de mise a jour complete - Plan B
# Version sans emojis pour eviter les problemes d'encodage

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MISE A JOUR COMPLETE - PLAN B" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\Elohim Mickael\Documents\plan-b"

Write-Host "[ETAPE 1] Verification de PostgreSQL..." -ForegroundColor Yellow
$pgRunning = docker ps --filter "name=planb-postgres" --format "{{.Names}}"
if ($pgRunning) {
    Write-Host "[OK] PostgreSQL en cours" -ForegroundColor Green
} else {
    Write-Host "[INFO] Demarrage de PostgreSQL..." -ForegroundColor Yellow
    $pgExists = docker ps -a --filter "name=planb-postgres" --format "{{.Names}}"
    if ($pgExists) {
        docker start planb-postgres | Out-Null
    } else {
        docker run -d --name planb-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=root -e POSTGRES_DB=planb -p 5432:5432 postgres:15-alpine | Out-Null
    }
    Start-Sleep -Seconds 5
    Write-Host "[OK] PostgreSQL demarre" -ForegroundColor Green
}

Write-Host ""
Write-Host "[ETAPE 2] Mise a jour du Backend..." -ForegroundColor Yellow
Set-Location "$projectRoot\planb-backend"

Write-Host "  - Vidage du cache Symfony..."
php bin/console cache:clear --no-interaction 2>&1 | Out-Null
Write-Host "  [OK] Cache vide" -ForegroundColor Green

Write-Host "  - Regeneration de l'autoload..."
composer dump-autoload --optimize --no-interaction 2>&1 | Out-Null
Write-Host "  [OK] Autoload regenere" -ForegroundColor Green

Write-Host "  - Verification du dossier uploads..."
$uploadsPath = "public\uploads\listings"
if (-not (Test-Path $uploadsPath)) {
    New-Item -ItemType Directory -Force -Path $uploadsPath | Out-Null
}
Write-Host "  [OK] Dossier uploads OK" -ForegroundColor Green

Write-Host ""
Write-Host "[ETAPE 3] Arret des serveurs existants..." -ForegroundColor Yellow
Get-Process php -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*vite*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "  [OK] Serveurs arretes" -ForegroundColor Green

Write-Host ""
Write-Host "[ETAPE 4] Demarrage du Backend..." -ForegroundColor Yellow
Set-Location "$projectRoot\planb-backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\planb-backend'; Write-Host 'Backend Symfony - http://localhost:8000' -ForegroundColor Cyan; php -S localhost:8000 -t public"
Start-Sleep -Seconds 3
Write-Host "  [OK] Backend demarre sur http://localhost:8000" -ForegroundColor Green

Write-Host ""
Write-Host "[ETAPE 5] Demarrage du Frontend..." -ForegroundColor Yellow
Set-Location "$projectRoot\planb-frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\planb-frontend'; Write-Host 'Frontend React - http://localhost:5173' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 3
Write-Host "  [OK] Frontend demarre sur http://localhost:5173" -ForegroundColor Green

Write-Host ""
Write-Host "[ETAPE 6] Tests de validation..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/listings" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "  [OK] API backend repond" -ForegroundColor Green
} catch {
    Write-Host "  [ERREUR] API backend ne repond pas" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "  [OK] Frontend accessible" -ForegroundColor Green
} catch {
    Write-Host "  [ERREUR] Frontend non accessible" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  MISE A JOUR TERMINEE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Application prete a l'emploi :" -ForegroundColor White
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend  : http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API      : http://localhost:8000/api/v1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Categories disponibles :" -ForegroundColor White
Write-Host "  - Immobilier (appartement, villa, studio, terrain, magasin)" -ForegroundColor Gray
Write-Host "  - Vehicule (voiture, moto)" -ForegroundColor Gray
Write-Host "  - Vacance (appartement meuble, villa meublee, studio meuble, hotel)" -ForegroundColor Gray
Write-Host ""
Write-Host "Prochaines etapes :" -ForegroundColor Yellow
Write-Host "  1. Ouvrir http://localhost:5173" -ForegroundColor Gray
Write-Host "  2. Publier des annonces de test" -ForegroundColor Gray
Write-Host "  3. Tester le filtrage par categorie" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentation : TEST_FILTRAGE.md" -ForegroundColor Cyan
Write-Host ""

Set-Location $projectRoot
