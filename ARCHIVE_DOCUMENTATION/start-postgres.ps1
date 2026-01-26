# Script pour démarrer PostgreSQL avec Docker
Write-Host "🐘 Démarrage de PostgreSQL..." -ForegroundColor Cyan

# Vérifier si Docker est installé
try {
    docker --version | Out-Null
    Write-Host "✅ Docker est installé" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas installé ou n'est pas démarré" -ForegroundColor Red
    Write-Host "📥 Installez Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Vérifier si le conteneur existe déjà
$containerExists = docker ps -a --filter "name=planb-postgres" --format "{{.Names}}"

if ($containerExists) {
    Write-Host "📦 Conteneur PostgreSQL trouvé" -ForegroundColor Yellow
    
    # Vérifier s'il est déjà en cours d'exécution
    $containerRunning = docker ps --filter "name=planb-postgres" --format "{{.Names}}"
    
    if ($containerRunning) {
        Write-Host "✅ PostgreSQL est déjà en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "🔄 Redémarrage du conteneur..." -ForegroundColor Cyan
        docker start planb-postgres
        Start-Sleep -Seconds 3
        Write-Host "✅ PostgreSQL démarré" -ForegroundColor Green
    }
} else {
    Write-Host "🆕 Création d'un nouveau conteneur PostgreSQL..." -ForegroundColor Cyan
    
    docker run -d `
        --name planb-postgres `
        -e POSTGRES_USER=postgres `
        -e POSTGRES_PASSWORD=root `
        -e POSTGRES_DB=planb `
        -p 5432:5432 `
        postgres:15-alpine
    
    Write-Host "⏳ Attente du démarrage de PostgreSQL (10 secondes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    Write-Host "✅ PostgreSQL démarré et prêt" -ForegroundColor Green
}

# Vérifier la connexion
Write-Host ""
Write-Host "🔍 Vérification de la connexion..." -ForegroundColor Cyan
cd planb-backend

try {
    $result = php bin/console doctrine:query:sql "SELECT 1" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Connexion à PostgreSQL réussie" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Connexion échouée, mais le conteneur est démarré" -ForegroundColor Yellow
        Write-Host "Attendez quelques secondes et réessayez" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Impossible de vérifier la connexion" -ForegroundColor Yellow
}

cd ..

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Informations de connexion:" -ForegroundColor White
Write-Host "   Hôte     : localhost" -ForegroundColor Gray
Write-Host "   Port     : 5432" -ForegroundColor Gray
Write-Host "   User     : postgres" -ForegroundColor Gray
Write-Host "   Password : root" -ForegroundColor Gray
Write-Host "   Database : planb" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Commandes utiles:" -ForegroundColor White
Write-Host "   docker logs planb-postgres    # Voir les logs" -ForegroundColor Gray
Write-Host "   docker stop planb-postgres    # Arrêter" -ForegroundColor Gray
Write-Host "   docker start planb-postgres   # Redémarrer" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Vous pouvez maintenant démarrer le backend et le frontend" -ForegroundColor Green
