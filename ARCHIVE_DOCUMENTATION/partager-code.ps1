# Script pour préparer et partager le code avec votre collègue
# Exécuter : .\partager-code.ps1

Write-Host "`n=== PREPARATION DU CODE POUR PARTAGE ===" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier que nous sommes dans le bon dossier
if (-not (Test-Path "planb-backend") -or -not (Test-Path "planb-frontend")) {
    Write-Host "[ERREUR] Ce script doit etre execute depuis le dossier 'plan-b'" -ForegroundColor Red
    exit 1
}

Write-Host "1. Verification du dossier..." -ForegroundColor Yellow
Write-Host "[OK] Dossier plan-b trouve" -ForegroundColor Green

# 2. Supprimer les fichiers inutiles pour alléger
Write-Host "`n2. Nettoyage des fichiers inutiles..." -ForegroundColor Yellow

# Backend
if (Test-Path "planb-backend\vendor") {
    Write-Host "  - Suppression de vendor/ (backend)..." -ForegroundColor Gray
    Remove-Item -Path "planb-backend\vendor" -Recurse -Force -ErrorAction SilentlyContinue
}

if (Test-Path "planb-backend\var\cache") {
    Write-Host "  - Suppression du cache (backend)..." -ForegroundColor Gray
    Remove-Item -Path "planb-backend\var\cache" -Recurse -Force -ErrorAction SilentlyContinue
}

# Frontend
if (Test-Path "planb-frontend\node_modules") {
    Write-Host "  - Suppression de node_modules/ (frontend)..." -ForegroundColor Gray
    Remove-Item -Path "planb-frontend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}

if (Test-Path "planb-frontend\dist") {
    Write-Host "  - Suppression de dist/ (frontend)..." -ForegroundColor Gray
    Remove-Item -Path "planb-frontend\dist" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "[OK] Nettoyage termine" -ForegroundColor Green

# 3. Créer le fichier ZIP
Write-Host "`n3. Creation de l'archive ZIP..." -ForegroundColor Yellow

$zipPath = "..\plan-b-partage.zip"
$sourcePath = Get-Location

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path $sourcePath -DestinationPath $zipPath -CompressionLevel Optimal

$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host "[OK] Archive creee: plan-b-partage.zip ($([math]::Round($zipSize, 2)) MB)" -ForegroundColor Green

# 4. Afficher les options de partage
Write-Host "`n=== OPTIONS DE PARTAGE ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option 1: GitHub (RECOMMANDE)" -ForegroundColor Yellow
Write-Host "  1. Creer un compte sur https://github.com" -ForegroundColor White
Write-Host "  2. Creer un nouveau repository 'plan-b' (Private)" -ForegroundColor White
Write-Host "  3. Executer dans ce dossier:" -ForegroundColor White
Write-Host "     git init" -ForegroundColor Gray
Write-Host "     git add ." -ForegroundColor Gray
Write-Host "     git commit -m 'Initial commit'" -ForegroundColor Gray
Write-Host "     git remote add origin https://github.com/VOTRE_USERNAME/plan-b.git" -ForegroundColor Gray
Write-Host "     git push -u origin main" -ForegroundColor Gray
Write-Host "  4. Inviter votre collegue dans Settings > Collaborators" -ForegroundColor White
Write-Host ""

Write-Host "Option 2: WeTransfer" -ForegroundColor Yellow
Write-Host "  1. Aller sur https://wetransfer.com" -ForegroundColor White
Write-Host "  2. Uploader: ..\plan-b-partage.zip" -ForegroundColor White
Write-Host "  3. Envoyer a l'email de votre collegue" -ForegroundColor White
Write-Host ""

Write-Host "Option 3: Google Drive" -ForegroundColor Yellow
Write-Host "  1. Uploader ..\plan-b-partage.zip sur Google Drive" -ForegroundColor White
Write-Host "  2. Clic droit > Obtenir le lien" -ForegroundColor White
Write-Host "  3. Partager le lien avec votre collegue" -ForegroundColor White
Write-Host ""

Write-Host "=== INSTRUCTIONS POUR VOTRE COLLEGUE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Apres avoir recu le code, il doit:" -ForegroundColor White
Write-Host ""
Write-Host "1. Backend:" -ForegroundColor Yellow
Write-Host "   cd planb-backend" -ForegroundColor Gray
Write-Host "   composer install" -ForegroundColor Gray
Write-Host "   cp .env.example .env" -ForegroundColor Gray
Write-Host "   php bin/console doctrine:database:create" -ForegroundColor Gray
Write-Host "   php bin/console doctrine:migrations:migrate" -ForegroundColor Gray
Write-Host "   php bin/console lexik:jwt:generate-keypair" -ForegroundColor Gray
Write-Host "   php -S localhost:8000 -t public" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Frontend:" -ForegroundColor Yellow
Write-Host "   cd planb-frontend" -ForegroundColor Gray
Write-Host "   npm install" -ForegroundColor Gray
Write-Host "   cp .env.example .env" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "=== FICHIERS CREES ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Archive ZIP: ..\plan-b-partage.zip" -ForegroundColor Green
Write-Host "Taille: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Green
Write-Host ""

Write-Host "Documents a lire:" -ForegroundColor Yellow
Write-Host "  - README.md                         (Vue d'ensemble)" -ForegroundColor White
Write-Host "  - LIRE_EN_PREMIER_MAINTENANT.md    (Demarrage rapide)" -ForegroundColor White
Write-Host "  - PARTAGER_LE_CODE.md              (Guide complet)" -ForegroundColor White
Write-Host "  - RECAPITULATIF_SESSION_16_NOV.md  (Ce qui a ete fait)" -ForegroundColor White
Write-Host ""

Write-Host "[TERMINE] Le code est pret a etre partage !" -ForegroundColor Green
Write-Host ""
