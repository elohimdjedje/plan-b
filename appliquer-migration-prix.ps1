# Script pour appliquer la migration du champ price_unit

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Migration: Ajout de l'unite de prix" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Chemin vers le backend
$backendPath = "$PSScriptRoot\planb-backend"

# Verifier que le dossier backend existe
if (-not (Test-Path $backendPath)) {
    Write-Host "Erreur: Le dossier planb-backend n'existe pas!" -ForegroundColor Red
    exit 1
}

# Se deplacer dans le dossier backend
Set-Location $backendPath

Write-Host "Dossier: $backendPath" -ForegroundColor Yellow
Write-Host ""

# Verifier les migrations en attente
Write-Host "Verification des migrations en attente..." -ForegroundColor Yellow
php bin/console doctrine:migrations:status

Write-Host ""
Write-Host "Voulez-vous appliquer la migration? (O/N)" -ForegroundColor Yellow
$confirmation = Read-Host

if ($confirmation -eq 'O' -or $confirmation -eq 'o') {
    Write-Host ""
    Write-Host "Application de la migration..." -ForegroundColor Green
    
    # Appliquer la migration
    php bin/console doctrine:migrations:migrate --no-interaction
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Migration appliquee avec succes!" -ForegroundColor Green
        Write-Host ""
        
        # Verifier que la colonne existe
        Write-Host "Verification de la colonne price_unit..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Vous pouvez verifier dans PostgreSQL avec:" -ForegroundColor Cyan
        Write-Host "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'price_unit';" -ForegroundColor White
        Write-Host ""
        
        Write-Host "Prochaines etapes:" -ForegroundColor Green
        Write-Host "1. Redemarrez le backend si necessaire" -ForegroundColor White
        Write-Host "2. Testez la publication d'une annonce de location" -ForegroundColor White
        Write-Host "3. Verifiez que le menu deroulant /mois et /heure s'affiche" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "Erreur lors de l'application de la migration!" -ForegroundColor Red
        Write-Host "Consultez les logs ci-dessus pour plus de details." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Migration annulee" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
