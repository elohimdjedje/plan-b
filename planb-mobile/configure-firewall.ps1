# Script pour configurer le pare-feu Windows pour Plan B Mobile
# Encodage: UTF-8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration du Pare-feu" -ForegroundColor Cyan
Write-Host "  Plan B Mobile" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[ERREUR] Ce script nécessite les droits administrateur" -ForegroundColor Red
    Write-Host ""
    Write-Host "Relancez PowerShell en tant qu'administrateur :" -ForegroundColor Yellow
    Write-Host "  1. Clic droit sur PowerShell" -ForegroundColor Gray
    Write-Host "  2. 'Exécuter en tant qu'administrateur'" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "[*] Configuration des règles de pare-feu..." -ForegroundColor Yellow
Write-Host ""

# Port 8000 - Backend API
try {
    $rule = Get-NetFirewallRule -DisplayName "Plan B Backend" -ErrorAction SilentlyContinue
    if ($rule) {
        Write-Host "[INFO] Règle 'Plan B Backend' existe déjà" -ForegroundColor Gray
    } else {
        New-NetFirewallRule -DisplayName "Plan B Backend" `
            -Direction Inbound `
            -LocalPort 8000 `
            -Protocol TCP `
            -Action Allow `
            -Profile Domain,Private `
            -ErrorAction Stop | Out-Null
        Write-Host "[OK] Port 8000 (Backend) autorisé" -ForegroundColor Green
    }
} catch {
    Write-Host "[ERREUR] Impossible d'autoriser le port 8000" -ForegroundColor Red
}

# Port 19000 - Expo Dev Server
try {
    $rule = Get-NetFirewallRule -DisplayName "Expo Dev Server" -ErrorAction SilentlyContinue
    if ($rule) {
        Write-Host "[INFO] Règle 'Expo Dev Server' existe déjà" -ForegroundColor Gray
    } else {
        New-NetFirewallRule -DisplayName "Expo Dev Server" `
            -Direction Inbound `
            -LocalPort 19000 `
            -Protocol TCP `
            -Action Allow `
            -Profile Domain,Private `
            -ErrorAction Stop | Out-Null
        Write-Host "[OK] Port 19000 (Expo) autorisé" -ForegroundColor Green
    }
} catch {
    Write-Host "[ERREUR] Impossible d'autoriser le port 19000" -ForegroundColor Red
}

# Port 19001 - Expo Dev Server (Metro Bundler)
try {
    $rule = Get-NetFirewallRule -DisplayName "Expo Metro Bundler" -ErrorAction SilentlyContinue
    if ($rule) {
        Write-Host "[INFO] Règle 'Expo Metro Bundler' existe déjà" -ForegroundColor Gray
    } else {
        New-NetFirewallRule -DisplayName "Expo Metro Bundler" `
            -Direction Inbound `
            -LocalPort 19001 `
            -Protocol TCP `
            -Action Allow `
            -Profile Domain,Private `
            -ErrorAction Stop | Out-Null
        Write-Host "[OK] Port 19001 (Metro Bundler) autorisé" -ForegroundColor Green
    }
} catch {
    Write-Host "[ERREUR] Impossible d'autoriser le port 19001" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Configuration terminée !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Ports autorisés :" -ForegroundColor White
Write-Host "  - 8000  : Backend API" -ForegroundColor Gray
Write-Host "  - 19000 : Expo Dev Server" -ForegroundColor Gray
Write-Host "  - 19001 : Metro Bundler" -ForegroundColor Gray
Write-Host ""
Write-Host "Vous pouvez maintenant lancer l'application :" -ForegroundColor Cyan
Write-Host "  npm start" -ForegroundColor Gray
Write-Host ""
