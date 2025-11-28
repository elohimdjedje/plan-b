# Script pour arrêter tous les services de Plan B
# Encodage: UTF-8

Write-Host "[*] Arrêt de Plan B..." -ForegroundColor Cyan
Write-Host ""

Write-Host "================================================" -ForegroundColor Yellow
Write-Host "ÉTAPE 1/2 : Arrêt du Frontend" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Yellow

# Arrêter le processus sur le port 5173 (Frontend)
$frontendProcess = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontendProcess) {
    $processId = $frontendProcess.OwningProcess
    Write-Host "[*] Arrêt du frontend (PID: $processId)..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "[OK] Frontend arrêté" -ForegroundColor Green
} else {
    Write-Host "[INFO] Frontend n'est pas en cours d'exécution" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "ÉTAPE 2/2 : Arrêt des conteneurs Docker" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Yellow

# Vérifier si Docker est accessible
try {
    docker ps | Out-Null
    
    # Naviguer vers le dossier backend
    $backendPath = "c:\Users\Elohim Mickael\Documents\plan-b\planb-backend"
    Push-Location $backendPath
    
    # Arrêter les conteneurs Docker
    Write-Host "[*] Arrêt des conteneurs Docker..." -ForegroundColor Yellow
    docker-compose down 2>&1 | Out-Null
    
    Start-Sleep -Seconds 2
    
    # Vérifier que les conteneurs sont bien arrêtés
    $runningContainers = docker ps --filter "name=planb" --format "{{.Names}}"
    if ($runningContainers) {
        Write-Host "[AVERTISSEMENT] Certains conteneurs sont encore actifs" -ForegroundColor Yellow
        Write-Host $runningContainers
    } else {
        Write-Host "[OK] Tous les conteneurs Docker sont arrêtés" -ForegroundColor Green
    }
    
    Pop-Location
    
} catch {
    Write-Host "[INFO] Docker n'est pas accessible ou n'est pas démarré" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   Plan B arrêté avec succès !                " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pour redémarrer l'application : .\demarrer.ps1" -ForegroundColor Cyan
Write-Host ""
