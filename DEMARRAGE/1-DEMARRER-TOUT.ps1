# ================================================================
# PLAN B - DEMARRAGE COMPLET
# ================================================================
# Ce script démarre tous les serveurs nécessaires
# ================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           PLAN B - DEMARRAGE COMPLET                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\Elohim Mickael\Documents\plan-b"

# ================================================================
# ETAPE 1: Arrêt des serveurs existants
# ================================================================
Write-Host "┌────────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│ [1/4] Arrêt des serveurs existants...                     │" -ForegroundColor Yellow
Write-Host "└────────────────────────────────────────────────────────────┘" -ForegroundColor Yellow

Get-Process php -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node.exe*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "  OK - Serveurs arretes" -ForegroundColor Green
Write-Host ""

# ================================================================
# ETAPE 2: Démarrage PostgreSQL (Docker)
# ================================================================
Write-Host "┌────────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│ [2/4] Démarrage PostgreSQL...                             │" -ForegroundColor Yellow
Write-Host "└────────────────────────────────────────────────────────────┘" -ForegroundColor Yellow

# Vérifier si le conteneur existe déjà
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
Write-Host "    Database: planb | User: postgres | Password: root" -ForegroundColor Gray
Write-Host ""

# ================================================================
# ETAPE 3: Démarrage Backend Symfony
# ================================================================
Write-Host "┌────────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│ [3/4] Démarrage Backend Symfony...                        │" -ForegroundColor Yellow
Write-Host "└────────────────────────────────────────────────────────────┘" -ForegroundColor Yellow

Set-Location "$projectRoot\planb-backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
Set-Location '$projectRoot\planb-backend'
Write-Host ''
Write-Host '╔════════════════════════════════════════════════════════════╗' -ForegroundColor Magenta
Write-Host '║           BACKEND SYMFONY - API REST                       ║' -ForegroundColor Magenta
Write-Host '╚════════════════════════════════════════════════════════════╝' -ForegroundColor Magenta
Write-Host ''
Write-Host '  URL: http://localhost:8000' -ForegroundColor Cyan
Write-Host '  API: http://localhost:8000/api/v1' -ForegroundColor Cyan
Write-Host ''
php -S localhost:8000 -t public
"@

Start-Sleep -Seconds 2
Write-Host "  OK - Backend demarre (http://localhost:8000)" -ForegroundColor Green
Write-Host ""

# ================================================================
# ETAPE 4: Démarrage Frontend React
# ================================================================
Write-Host "┌────────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│ [4/4] Démarrage Frontend React...                         │" -ForegroundColor Yellow
Write-Host "└────────────────────────────────────────────────────────────┘" -ForegroundColor Yellow

Set-Location "$projectRoot\planb-frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
Set-Location '$projectRoot\planb-frontend'
Write-Host ''
Write-Host '╔════════════════════════════════════════════════════════════╗' -ForegroundColor Blue
Write-Host '║           FRONTEND REACT - INTERFACE UTILISATEUR           ║' -ForegroundColor Blue
Write-Host '╚════════════════════════════════════════════════════════════╝' -ForegroundColor Blue
Write-Host ''
Write-Host '  URL: http://localhost:5173' -ForegroundColor Cyan
Write-Host ''
npm run dev
"@

Start-Sleep -Seconds 3
Write-Host "  OK - Frontend demarre (http://localhost:5173)" -ForegroundColor Green
Write-Host ""

# ================================================================
# RÉSUMÉ
# ================================================================
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              TOUS LES SERVEURS SONT DEMARRES               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "┌────────────────────────────────────────────────────────────┐" -ForegroundColor White
Write-Host "│ SERVEURS ACTIFS                                            │" -ForegroundColor White
Write-Host "├────────────────────────────────────────────────────────────┤" -ForegroundColor White
Write-Host "│ 1. PostgreSQL      localhost:5432                         │" -ForegroundColor Cyan
Write-Host "│ 2. Backend API     http://localhost:8000                  │" -ForegroundColor Cyan
Write-Host "│ 3. Frontend        http://localhost:5173                  │" -ForegroundColor Cyan
Write-Host "└────────────────────────────────────────────────────────────┘" -ForegroundColor White
Write-Host ""
Write-Host "┌────────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│ ACCÈS RAPIDE                                               │" -ForegroundColor Yellow
Write-Host "├────────────────────────────────────────────────────────────┤" -ForegroundColor Yellow
Write-Host "│ Application:  http://localhost:5173                       │" -ForegroundColor White
Write-Host "│ API Docs:     http://localhost:8000/api/doc               │" -ForegroundColor White
Write-Host "└────────────────────────────────────────────────────────────┘" -ForegroundColor Yellow
Write-Host ""
Write-Host "┌────────────────────────────────────────────────────────────┐" -ForegroundColor Magenta
Write-Host "│ COMMANDES UTILES                                           │" -ForegroundColor Magenta
Write-Host "├────────────────────────────────────────────────────────────┤" -ForegroundColor Magenta
Write-Host "│ Arreter tout:    .\DEMARRAGE\2-ARRETER-TOUT.ps1           │" -ForegroundColor White
Write-Host "│ Redemarrer:      .\DEMARRAGE\1-DEMARRER-TOUT.ps1          │" -ForegroundColor White
Write-Host "│ Voir logs:       Consulter les fenetres PowerShell        │" -ForegroundColor White
Write-Host "└────────────────────────────────────────────────────────────┘" -ForegroundColor Magenta
Write-Host ""
Write-Host "Application prete a etre utilisee !" -ForegroundColor Green
Write-Host ""

Set-Location $projectRoot
