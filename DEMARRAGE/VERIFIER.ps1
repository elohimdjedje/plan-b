# ================================================================
# PLAN B - VERIFICATION DES SERVEURS
# ================================================================

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "        PLAN B - VERIFICATION DES SERVEURS          " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Verification PostgreSQL
Write-Host "[1/3] Verification PostgreSQL..." -ForegroundColor Yellow
$pgStatus = docker ps --filter "name=planb-postgres" --format "{{.Status}}"
if ($pgStatus -like "*Up*") {
    Write-Host "  OK - PostgreSQL est actif" -ForegroundColor Green
    Write-Host "       localhost:5432" -ForegroundColor Gray
} else {
    Write-Host "  ERREUR - PostgreSQL est arrete" -ForegroundColor Red
    Write-Host "       Lancez: docker start planb-postgres" -ForegroundColor Yellow
}
Write-Host ""

# Verification Backend
Write-Host "[2/3] Verification Backend..." -ForegroundColor Yellow
$phpProcess = Get-Process php -ErrorAction SilentlyContinue
if ($phpProcess) {
    Write-Host "  OK - Backend est actif" -ForegroundColor Green
    Write-Host "       http://localhost:8000" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        Write-Host "       Serveur repond (HTTP $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "       Serveur ne repond pas encore" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ERREUR - Backend est arrete" -ForegroundColor Red
    Write-Host "       Lancez: .\DEMARRAGE\DEMARRER.ps1" -ForegroundColor Yellow
}
Write-Host ""

# Verification Frontend
Write-Host "[3/3] Verification Frontend..." -ForegroundColor Yellow
$nodeProcess = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node.exe*" }
if ($nodeProcess) {
    Write-Host "  OK - Frontend est actif" -ForegroundColor Green
    Write-Host "       http://localhost:5173" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        Write-Host "       Serveur repond (HTTP $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "       Serveur ne repond pas encore" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ERREUR - Frontend est arrete" -ForegroundColor Red
    Write-Host "       Lancez: .\DEMARRAGE\DEMARRER.ps1" -ForegroundColor Yellow
}
Write-Host ""

# Resume
Write-Host "======================================================" -ForegroundColor White
Write-Host " RESUME                                              " -ForegroundColor White
Write-Host "======================================================" -ForegroundColor White
Write-Host ""

$allRunning = $pgStatus -like "*Up*" -and $phpProcess -and $nodeProcess

if ($allRunning) {
    Write-Host "  OK - Tous les serveurs sont actifs !" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Accedez a l application: http://localhost:5173" -ForegroundColor Cyan
} else {
    Write-Host "  ATTENTION - Certains serveurs sont arretes" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Pour demarrer: .\DEMARRAGE\DEMARRER.ps1" -ForegroundColor Cyan
}
Write-Host ""
