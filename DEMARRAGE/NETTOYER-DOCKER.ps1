# ================================================================
# NETTOYAGE DOCKER - PLAN B
# ================================================================
# Supprime les conteneurs arretes et inutilises
# ================================================================

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "        NETTOYAGE DOCKER - PLAN B                    " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Afficher les conteneurs
Write-Host "[INFO] Conteneurs actuels :" -ForegroundColor Yellow
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
Write-Host ""

# Demander confirmation
Write-Host "[ATTENTION] Cette operation va supprimer :" -ForegroundColor Yellow
Write-Host "  - Tous les conteneurs arretes" -ForegroundColor White
Write-Host "  - Les images Docker inutilisees" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "Voulez-vous continuer ? (o/N)"

if ($confirm -ne "o" -and $confirm -ne "O") {
    Write-Host ""
    Write-Host "[INFO] Operation annulee" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "[1/3] Suppression des conteneurs arretes..." -ForegroundColor Yellow
docker container prune -f
Write-Host "  OK - Conteneurs arretes supprimes" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Suppression des images inutilisees..." -ForegroundColor Yellow
docker image prune -f
Write-Host "  OK - Images inutilisees supprimees" -ForegroundColor Green
Write-Host ""

Write-Host "[3/3] Suppression des volumes inutilises..." -ForegroundColor Yellow
docker volume prune -f
Write-Host "  OK - Volumes inutilises supprimes" -ForegroundColor Green
Write-Host ""

Write-Host "======================================================" -ForegroundColor Green
Write-Host "        NETTOYAGE TERMINE                            " -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""

# Afficher les conteneurs restants
Write-Host "[INFO] Conteneurs restants :" -ForegroundColor Cyan
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
Write-Host ""
