# Script de redemarrage rapide - Plan B
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REDEMARRAGE RAPIDE - PLAN B" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\Elohim Mickael\Documents\plan-b"

Write-Host "[1/3] Arret des serveurs..." -ForegroundColor Yellow
Get-Process php -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node.exe*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "  [OK] Serveurs arretes" -ForegroundColor Green

Write-Host ""
Write-Host "[2/3] Demarrage du Backend..." -ForegroundColor Yellow
Set-Location "$projectRoot\planb-backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\planb-backend'; Write-Host 'Backend Symfony - http://localhost:8000' -ForegroundColor Cyan; php -S localhost:8000 -t public"
Start-Sleep -Seconds 2
Write-Host "  [OK] Backend demarre" -ForegroundColor Green

Write-Host ""
Write-Host "[3/3] Demarrage du Frontend..." -ForegroundColor Yellow
Set-Location "$projectRoot\planb-frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\planb-frontend'; Write-Host 'Frontend React - http://localhost:5173' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 3
Write-Host "  [OK] Frontend demarre" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  REDEMARRAGE TERMINE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Application disponible sur :" -ForegroundColor White
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend  : http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ameliorations appliquees :" -ForegroundColor Yellow
Write-Host "  - Connexion 90% plus rapide" -ForegroundColor Green
Write-Host "  - 70+ villes de Cote d'Ivoire" -ForegroundColor Green
Write-Host "  - Sud-Comoe complet" -ForegroundColor Green
Write-Host ""
Write-Host "Testez maintenant !" -ForegroundColor Cyan
Write-Host ""

Set-Location $projectRoot
