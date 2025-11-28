# ================================================================
# PLAN B - DEMARRAGE COMPLET
# ================================================================

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "           PLAN B - DEMARRAGE COMPLET               " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\Elohim Mickael\Documents\plan-b"

# Arret des serveurs existants
Write-Host "[1/4] Arret des serveurs existants..." -ForegroundColor Yellow
Get-Process php -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node.exe*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "  OK - Serveurs arretes" -ForegroundColor Green
Write-Host ""

# Demarrage PostgreSQL
Write-Host "[2/4] Demarrage PostgreSQL..." -ForegroundColor Yellow
$containerExists = docker ps -a --format "{{.Names}}" | Select-String -Pattern "planb-postgres" -Quiet

if ($containerExists) {
    Write-Host "  Demarrage du conteneur existant..." -ForegroundColor Cyan
    docker start planb-postgres | Out-Null
} else {
    Write-Host "  Creation du nouveau conteneur..." -ForegroundColor Cyan
    docker run -d `
        --name planb-postgres `
        -e POSTGRES_DB=planb `
        -e POSTGRES_USER=postgres `
        -e POSTGRES_PASSWORD=root `
        -p 5432:5432 `
        postgres:15 | Out-Null
}

Start-Sleep -Seconds 3
Write-Host "  OK - PostgreSQL demarre (localhost:5432)" -ForegroundColor Green
Write-Host ""

# Demarrage Backend Symfony
Write-Host "[3/4] Demarrage Backend Symfony..." -ForegroundColor Yellow
Set-Location "$projectRoot\planb-backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
Set-Location '$projectRoot\planb-backend'
Write-Host ''
Write-Host '=====================================================' -ForegroundColor Magenta
Write-Host '           BACKEND SYMFONY - API REST              ' -ForegroundColor Magenta
Write-Host '=====================================================' -ForegroundColor Magenta
Write-Host ''
Write-Host '  URL: http://localhost:8000' -ForegroundColor Cyan
Write-Host '  API: http://localhost:8000/api/v1' -ForegroundColor Cyan
Write-Host ''
php -S localhost:8000 -t public
"@

Start-Sleep -Seconds 2
Write-Host "  OK - Backend demarre (http://localhost:8000)" -ForegroundColor Green
Write-Host ""

# Demarrage Frontend React
Write-Host "[4/4] Demarrage Frontend React..." -ForegroundColor Yellow
Set-Location "$projectRoot\planb-frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
Set-Location '$projectRoot\planb-frontend'
Write-Host ''
Write-Host '=====================================================' -ForegroundColor Blue
Write-Host '           FRONTEND REACT - INTERFACE              ' -ForegroundColor Blue
Write-Host '=====================================================' -ForegroundColor Blue
Write-Host ''
Write-Host '  URL: http://localhost:5173' -ForegroundColor Cyan
Write-Host ''
npm run dev
"@

Start-Sleep -Seconds 3
Write-Host "  OK - Frontend demarre (http://localhost:5173)" -ForegroundColor Green
Write-Host ""

# Resume
Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "          TOUS LES SERVEURS SONT DEMARRES          " -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "SERVEURS ACTIFS :" -ForegroundColor White
Write-Host "  1. PostgreSQL     localhost:5432" -ForegroundColor Cyan
Write-Host "  2. Backend API    http://localhost:8000" -ForegroundColor Cyan
Write-Host "  3. Frontend       http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "ACCES RAPIDE :" -ForegroundColor Yellow
Write-Host "  Application:  http://localhost:5173" -ForegroundColor White
Write-Host "  API Docs:     http://localhost:8000/api/doc" -ForegroundColor White
Write-Host ""
Write-Host "COMMANDES UTILES :" -ForegroundColor Magenta
Write-Host "  Arreter tout:    .\DEMARRAGE\ARRETER.ps1" -ForegroundColor White
Write-Host "  Redemarrer:      .\DEMARRAGE\DEMARRER.ps1" -ForegroundColor White
Write-Host "  Verifier:        .\DEMARRAGE\VERIFIER.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Application prete !" -ForegroundColor Green
Write-Host ""

Set-Location $projectRoot
