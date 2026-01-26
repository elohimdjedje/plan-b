# ================================================================
# PLAN B - ARRÊT COMPLET
# ================================================================
# Ce script arrête tous les serveurs
# ================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║           PLAN B - ARRET COMPLET                          ║" -ForegroundColor Red
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Red
Write-Host ""

# ================================================================
# Arrêt des processus
# ================================================================
Write-Host "[1/3] Arrêt du Frontend (Node.js)..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node.exe*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "  OK - Frontend arrete" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Arrêt du Backend (PHP)..." -ForegroundColor Yellow
Get-Process php -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "  OK - Backend arrete" -ForegroundColor Green
Write-Host ""

Write-Host "[3/3] Arrêt de PostgreSQL (Docker)..." -ForegroundColor Yellow
docker stop planb-postgres 2>$null | Out-Null
Write-Host "  OK - PostgreSQL arrete" -ForegroundColor Green
Write-Host ""

# ================================================================
# Confirmation
# ================================================================
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           TOUS LES SERVEURS SONT ARRETES                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Pour redemarrer, lancez: .\DEMARRAGE\1-DEMARRER-TOUT.ps1" -ForegroundColor Cyan
Write-Host ""
