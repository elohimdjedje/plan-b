# ================================================================
# PLAN B - ARRET COMPLET
# ================================================================

Write-Host ""
Write-Host "======================================================" -ForegroundColor Red
Write-Host "           PLAN B - ARRET COMPLET                   " -ForegroundColor Red
Write-Host "======================================================" -ForegroundColor Red
Write-Host ""

Write-Host "[1/3] Arret du Frontend (Node.js)..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node.exe*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "  OK - Frontend arrete" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Arret du Backend (PHP)..." -ForegroundColor Yellow
Get-Process php -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "  OK - Backend arrete" -ForegroundColor Green
Write-Host ""

Write-Host "[3/3] Arret de PostgreSQL (Docker)..." -ForegroundColor Yellow
docker stop planb-postgres 2>$null | Out-Null
Write-Host "  OK - PostgreSQL arrete" -ForegroundColor Green
Write-Host ""

Write-Host "======================================================" -ForegroundColor Green
Write-Host "        TOUS LES SERVEURS SONT ARRETES              " -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pour redemarrer, lancez: .\DEMARRAGE\DEMARRER.ps1" -ForegroundColor Cyan
Write-Host ""
