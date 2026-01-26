# ================================================================
# DIAGNOSTIC COMPLET - PLAN B
# ================================================================
# Verifie tous les composants du systeme
# ================================================================

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "        DIAGNOSTIC COMPLET - PLAN B                  " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$issues = @()
$warnings = @()

# ================================================================
# 1. DOCKER
# ================================================================
Write-Host "[1/7] Verification Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "  OK - Docker installe : $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "  ERREUR - Docker non installe" -ForegroundColor Red
        $issues += "Docker non installe"
    }
} catch {
    Write-Host "  ERREUR - Docker non accessible" -ForegroundColor Red
    $issues += "Docker non accessible"
}
Write-Host ""

# ================================================================
# 2. POSTGRESQL
# ================================================================
Write-Host "[2/7] Verification PostgreSQL..." -ForegroundColor Yellow
$pgStatus = docker ps --filter "name=planb-postgres" --format "{{.Status}}" 2>$null
if ($pgStatus -like "*Up*") {
    Write-Host "  OK - PostgreSQL actif" -ForegroundColor Green
    Write-Host "       Port: 5432" -ForegroundColor Gray
} else {
    Write-Host "  ATTENTION - PostgreSQL arrete" -ForegroundColor Yellow
    $warnings += "PostgreSQL arrete"
}
Write-Host ""

# ================================================================
# 3. PHP
# ================================================================
Write-Host "[3/7] Verification PHP..." -ForegroundColor Yellow
try {
    $phpVersion = php --version 2>$null | Select-Object -First 1
    if ($phpVersion) {
        Write-Host "  OK - PHP installe : $phpVersion" -ForegroundColor Green
    } else {
        Write-Host "  ERREUR - PHP non installe" -ForegroundColor Red
        $issues += "PHP non installe"
    }
} catch {
    Write-Host "  ERREUR - PHP non accessible" -ForegroundColor Red
    $issues += "PHP non accessible"
}
Write-Host ""

# ================================================================
# 4. COMPOSER
# ================================================================
Write-Host "[4/7] Verification Composer..." -ForegroundColor Yellow
try {
    $composerVersion = composer --version 2>$null | Select-Object -First 1
    if ($composerVersion) {
        Write-Host "  OK - Composer installe : $composerVersion" -ForegroundColor Green
    } else {
        Write-Host "  ERREUR - Composer non installe" -ForegroundColor Red
        $issues += "Composer non installe"
    }
} catch {
    Write-Host "  ERREUR - Composer non accessible" -ForegroundColor Red
    $issues += "Composer non accessible"
}
Write-Host ""

# ================================================================
# 5. NODE.JS
# ================================================================
Write-Host "[5/7] Verification Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "  OK - Node.js installe : $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "  ERREUR - Node.js non installe" -ForegroundColor Red
        $issues += "Node.js non installe"
    }
} catch {
    Write-Host "  ERREUR - Node.js non accessible" -ForegroundColor Red
    $issues += "Node.js non accessible"
}
Write-Host ""

# ================================================================
# 6. NPM
# ================================================================
Write-Host "[6/7] Verification npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "  OK - npm installe : v$npmVersion" -ForegroundColor Green
    } else {
        Write-Host "  ERREUR - npm non installe" -ForegroundColor Red
        $issues += "npm non installe"
    }
} catch {
    Write-Host "  ERREUR - npm non accessible" -ForegroundColor Red
    $issues += "npm non accessible"
}
Write-Host ""

# ================================================================
# 7. SERVEURS EN COURS
# ================================================================
Write-Host "[7/7] Verification serveurs en cours..." -ForegroundColor Yellow

# Backend
$phpProcess = Get-Process php -ErrorAction SilentlyContinue
if ($phpProcess) {
    Write-Host "  OK - Backend PHP actif" -ForegroundColor Green
} else {
    Write-Host "  INFO - Backend PHP arrete" -ForegroundColor Cyan
}

# Frontend
$nodeProcess = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node.exe*" }
if ($nodeProcess) {
    Write-Host "  OK - Frontend React actif" -ForegroundColor Green
} else {
    Write-Host "  INFO - Frontend React arrete" -ForegroundColor Cyan
}
Write-Host ""

# ================================================================
# VERIFICATION FICHIERS
# ================================================================
Write-Host "Verification fichiers importants..." -ForegroundColor Yellow

$projectRoot = "c:\Users\Elohim Mickael\Documents\plan-b"
$files = @(
    "$projectRoot\planb-backend\.env",
    "$projectRoot\planb-backend\composer.json",
    "$projectRoot\planb-frontend\.env",
    "$projectRoot\planb-frontend\package.json"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  OK - $(Split-Path $file -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  ERREUR - $(Split-Path $file -Leaf) manquant" -ForegroundColor Red
        $issues += "Fichier manquant: $(Split-Path $file -Leaf)"
    }
}
Write-Host ""

# ================================================================
# RESUME
# ================================================================
Write-Host "======================================================" -ForegroundColor White
Write-Host " RESUME DU DIAGNOSTIC                                " -ForegroundColor White
Write-Host "======================================================" -ForegroundColor White
Write-Host ""

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "  EXCELLENT - Systeme complet et fonctionnel !" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Vous pouvez demarrer l'application avec :" -ForegroundColor Cyan
    Write-Host "  .\DEMARRAGE\DEMARRER.ps1" -ForegroundColor Yellow
} else {
    if ($issues.Count -gt 0) {
        Write-Host "  PROBLEMES DETECTES ($($issues.Count)) :" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "    - $issue" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "  AVERTISSEMENTS ($($warnings.Count)) :" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "    - $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "  ACTIONS RECOMMANDEES :" -ForegroundColor Cyan
    if ($issues -match "Docker") {
        Write-Host "    1. Installez Docker Desktop" -ForegroundColor White
        Write-Host "       https://www.docker.com/products/docker-desktop" -ForegroundColor Gray
    }
    if ($issues -match "PHP") {
        Write-Host "    2. Installez PHP 8.2+" -ForegroundColor White
    }
    if ($issues -match "Node") {
        Write-Host "    3. Installez Node.js 18+" -ForegroundColor White
        Write-Host "       https://nodejs.org/" -ForegroundColor Gray
    }
    if ($warnings -match "PostgreSQL") {
        Write-Host "    4. Demarrez PostgreSQL avec: docker start planb-postgres" -ForegroundColor White
    }
}

Write-Host ""
