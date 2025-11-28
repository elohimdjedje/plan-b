# Script pour démarrer toute l'application Plan B
# Encodage: UTF-8

Write-Host "[*] Démarrage de Plan B..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si Docker Desktop est installé
try {
    docker --version | Out-Null
    Write-Host "[OK] Docker est installé" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Docker n'est pas installé" -ForegroundColor Red
    Write-Host "[INFO] Installez Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Vérifier si Docker Desktop est en cours d'exécution
Write-Host "[*] Vérification de Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = $false
try {
    docker ps | Out-Null
    $dockerRunning = $true
    Write-Host "[OK] Docker Desktop est actif" -ForegroundColor Green
} catch {
    Write-Host "[!] Docker Desktop n'est pas démarré" -ForegroundColor Yellow
    Write-Host "[*] Démarrage de Docker Desktop..." -ForegroundColor Cyan
    
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "[*] Attente du démarrage de Docker (30 secondes)..." -ForegroundColor Yellow
    
    $timeout = 30
    $elapsed = 0
    while ($elapsed -lt $timeout) {
        Start-Sleep -Seconds 2
        $elapsed += 2
        try {
            docker ps | Out-Null
            $dockerRunning = $true
            Write-Host "[OK] Docker Desktop est maintenant actif" -ForegroundColor Green
            break
        } catch {
            Write-Host "." -NoNewline
        }
    }
    Write-Host ""
    
    if (-not $dockerRunning) {
        Write-Host "[ERREUR] Docker Desktop n'a pas pu démarrer" -ForegroundColor Red
        Write-Host "[INFO] Veuillez démarrer Docker Desktop manuellement" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "ÉTAPE 1/3 : Services Docker" -ForegroundColor White
Write-Host "  (PostgreSQL + Backend + Adminer)" -ForegroundColor Gray
Write-Host "================================================" -ForegroundColor Cyan

# Naviguer vers le dossier backend où se trouve docker-compose.yml
$backendPath = "c:\Users\Elohim Mickael\Documents\plan-b\planb-backend"
Push-Location $backendPath

# Démarrer les conteneurs Docker avec docker-compose
Write-Host "[*] Démarrage des conteneurs Docker..." -ForegroundColor Cyan
docker-compose up -d 2>&1 | Out-Null

Start-Sleep -Seconds 5

# Vérifier l'état des conteneurs
$postgresStatus = docker ps --filter "name=planb_postgres" --format "{{.Status}}"
$backendStatus = docker ps --filter "name=planb_api" --format "{{.Status}}"
$adminerStatus = docker ps --filter "name=planb_adminer" --format "{{.Status}}"

if ($postgresStatus) {
    Write-Host "[OK] PostgreSQL : $postgresStatus" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] PostgreSQL n'a pas démarré" -ForegroundColor Red
}

if ($backendStatus) {
    Write-Host "[OK] Backend API : $backendStatus" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] Backend API n'a pas démarré" -ForegroundColor Red
}

if ($adminerStatus) {
    Write-Host "[OK] Adminer : $adminerStatus" -ForegroundColor Green
} else {
    Write-Host "[AVERTISSEMENT] Adminer n'a pas démarré" -ForegroundColor Yellow
}

# Attendre que PostgreSQL soit complètement prêt
Write-Host "[*] Vérification de PostgreSQL..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
try {
    docker exec planb_postgres pg_isready -U postgres | Out-Null
    Write-Host "[OK] PostgreSQL accepte les connexions" -ForegroundColor Green
} catch {
    Write-Host "[AVERTISSEMENT] PostgreSQL n'est peut-être pas encore prêt" -ForegroundColor Yellow
}

Pop-Location

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "ÉTAPE 3/3 : Frontend (React + Vite)" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan

# Vérifier si le serveur frontend est déjà en cours
$frontendRunning = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if ($frontendRunning) {
    Write-Host "[INFO] Le port 5173 est déjà utilisé" -ForegroundColor Yellow
    Write-Host "[OK] Frontend probablement déjà en cours" -ForegroundColor Green
} else {
    Write-Host "[*] Démarrage du frontend..." -ForegroundColor Cyan
    
    # Démarrer le frontend dans une nouvelle fenêtre
    $frontendPath = "c:\Users\Elohim Mickael\Documents\plan-b\planb-frontend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend React - Port 5173' -ForegroundColor Cyan; npm run dev"
    
    Start-Sleep -Seconds 3
    Write-Host "[OK] Frontend démarré sur http://localhost:5173" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   Application Plan B démarrée avec succès !   " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs de l'application:" -ForegroundColor White
Write-Host "  Frontend  : http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend   : http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API       : http://localhost:8000/api/v1" -ForegroundColor Cyan
Write-Host "  Adminer   : http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Base de données PostgreSQL:" -ForegroundColor White
Write-Host "  Host      : localhost:5432" -ForegroundColor Gray
Write-Host "  Database  : planb" -ForegroundColor Gray
Write-Host "  User      : postgres" -ForegroundColor Gray
Write-Host "  Password  : root" -ForegroundColor Gray
Write-Host ""
Write-Host "Conteneurs Docker actifs:" -ForegroundColor White
Write-Host "  - planb_postgres  (PostgreSQL)" -ForegroundColor Gray
Write-Host "  - planb_api       (Backend Symfony)" -ForegroundColor Gray
Write-Host "  - planb_adminer   (Interface DB)" -ForegroundColor Gray
Write-Host ""
Write-Host "Conseils:" -ForegroundColor Yellow
Write-Host "  - Ouvrez http://localhost:5173 pour accéder à l'application" -ForegroundColor Gray
Write-Host "  - Utilisez Adminer (port 8080) pour gérer la base de données" -ForegroundColor Gray
Write-Host "  - Le frontend tourne dans une fenêtre PowerShell séparée" -ForegroundColor Gray
Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Yellow
Write-Host "  Arrêter tout         : .\arreter.ps1" -ForegroundColor Gray
Write-Host "  Voir les logs Docker : docker-compose -f planb-backend\docker-compose.yml logs" -ForegroundColor Gray
Write-Host ""
