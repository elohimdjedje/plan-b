# Script pour démarrer toute l'application Plan B
Write-Host "🚀 Démarrage de Plan B..." -ForegroundColor Cyan
Write-Host ""

# Étape 1 : Démarrer PostgreSQL
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "ÉTAPE 1/3 : PostgreSQL" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Vérifier si Docker est installé
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker n'est pas installé" -ForegroundColor Red
    Write-Host "📥 Téléchargez Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Alternative: Lisez DEMARRER_POSTGRESQL.md pour d'autres options" -ForegroundColor Yellow
    exit 1
}

# Démarrer PostgreSQL
$containerExists = docker ps -a --filter "name=planb-postgres" --format "{{.Names}}"

if ($containerExists) {
    $containerRunning = docker ps --filter "name=planb-postgres" --format "{{.Names}}"
    if ($containerRunning) {
        Write-Host "✅ PostgreSQL déjà en cours" -ForegroundColor Green
    } else {
        docker start planb-postgres | Out-Null
        Write-Host "✅ PostgreSQL démarré" -ForegroundColor Green
        Start-Sleep -Seconds 3
    }
} else {
    Write-Host "🆕 Création du conteneur PostgreSQL..." -ForegroundColor Yellow
    docker run -d `
        --name planb-postgres `
        -e POSTGRES_USER=postgres `
        -e POSTGRES_PASSWORD=root `
        -e POSTGRES_DB=planb `
        -p 5432:5432 `
        postgres:15-alpine | Out-Null
    Write-Host "✅ PostgreSQL créé et démarré" -ForegroundColor Green
    Start-Sleep -Seconds 5
}

Write-Host ""

# Étape 2 : Démarrer le Backend
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "ÉTAPE 2/3 : Backend (Symfony)" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Vérifier si le serveur backend est déjà en cours
$backendRunning = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

if ($backendRunning) {
    Write-Host "⚠️  Le port 8000 est déjà utilisé" -ForegroundColor Yellow
    Write-Host "✅ Backend probablement déjà en cours" -ForegroundColor Green
} else {
    Write-Host "🔄 Démarrage du backend..." -ForegroundColor Cyan
    
    # Démarrer le backend dans une nouvelle fenêtre
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Elohim Mickael\Documents\plan-b\planb-backend'; Write-Host '🔥 Backend Symfony - Port 8000' -ForegroundColor Cyan; php -S localhost:8000 -t public"
    
    Start-Sleep -Seconds 3
    Write-Host "✅ Backend démarré sur http://localhost:8000" -ForegroundColor Green
}

Write-Host ""

# Étape 3 : Démarrer le Frontend
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "ÉTAPE 3/3 : Frontend (React + Vite)" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Vérifier si le serveur frontend est déjà en cours
$frontendRunning = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if ($frontendRunning) {
    Write-Host "⚠️  Le port 5173 est déjà utilisé" -ForegroundColor Yellow
    Write-Host "✅ Frontend probablement déjà en cours" -ForegroundColor Green
} else {
    Write-Host "🔄 Démarrage du frontend..." -ForegroundColor Cyan
    
    # Démarrer le frontend dans une nouvelle fenêtre
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Elohim Mickael\Documents\plan-b\planb-frontend'; Write-Host '⚡ Frontend React - Port 5173' -ForegroundColor Cyan; npm run dev"
    
    Start-Sleep -Seconds 3
    Write-Host "✅ Frontend démarré sur http://localhost:5173" -ForegroundColor Green
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✨ Application Plan B démarrée avec succès !" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs de l'application:" -ForegroundColor White
Write-Host "   Frontend : http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend  : http://localhost:8000" -ForegroundColor Cyan
Write-Host "   API      : http://localhost:8000/api/v1" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Base de données:" -ForegroundColor White
Write-Host "   PostgreSQL : localhost:5432" -ForegroundColor Gray
Write-Host "   Database   : planb" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Conseils:" -ForegroundColor Yellow
Write-Host "   - Ouvrez http://localhost:5173 dans votre navigateur" -ForegroundColor Gray
Write-Host "   - Les serveurs tournent dans des fenêtres séparées" -ForegroundColor Gray
Write-Host "   - Fermez les fenêtres PowerShell pour arrêter les serveurs" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Pour tout arrêter:" -ForegroundColor Yellow
Write-Host "   .\stop-all.ps1" -ForegroundColor Gray
Write-Host ""
