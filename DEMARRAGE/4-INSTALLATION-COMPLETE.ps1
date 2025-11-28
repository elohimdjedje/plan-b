# ================================================================
# PLAN B - INSTALLATION COMPLÈTE
# ================================================================
# Ce script effectue l'installation complète de l'application
# ================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           PLAN B - INSTALLATION COMPLÈTE                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\Elohim Mickael\Documents\plan-b"

# ================================================================
# ETAPE 1: Installation Backend
# ================================================================
Write-Host "==============================================" -ForegroundColor Yellow
Write-Host "  [1/5] Installation Backend Symfony                       " -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Yellow
Write-Host ""

Set-Location "$projectRoot\planb-backend"

Write-Host "  Installation des dependances Composer..." -ForegroundColor Cyan
composer install --no-interaction --prefer-dist

Write-Host ""
Write-Host "  OK - Backend installe" -ForegroundColor Green
Write-Host ""

# ================================================================
# ETAPE 2: Génération des clés JWT
# ================================================================
Write-Host "==============================================" -ForegroundColor Yellow
Write-Host "  [2/5] Generation des cles JWT                            " -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "  Generation des cles de securite..." -ForegroundColor Cyan

# Créer le dossier config/jwt s'il n'existe pas
if (-not (Test-Path "config\jwt")) {
    New-Item -ItemType Directory -Path "config\jwt" -Force | Out-Null
}

# Générer les clés JWT
$passphrase = (Get-Content .env | Select-String "JWT_PASSPHRASE=").ToString().Split("=")[1]
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:$passphrase
openssl pkey -in config/jwt/private.pem -passin pass:$passphrase -out config/jwt/public.pem -pubout

Write-Host ""
Write-Host "  OK - Clés JWT générées" -ForegroundColor Green
Write-Host ""

# ================================================================
# ETAPE 3: Configuration de la base de données
# ================================================================
Write-Host "==============================================" -ForegroundColor Yellow
Write-Host "  [3/5] Configuration de la base de donnees                " -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "  Demarrage de PostgreSQL..." -ForegroundColor Cyan

# Vérifier si le conteneur existe
$containerExists = docker ps -a --format "{{.Names}}" | Select-String -Pattern "planb-postgres" -Quiet

if ($containerExists) {
    docker start planb-postgres | Out-Null
} else {
    docker run -d `
        --name planb-postgres `
        -e POSTGRES_DB=planb `
        -e POSTGRES_USER=postgres `
        -e POSTGRES_PASSWORD=root `
        -p 5432:5432 `
        postgres:15 | Out-Null
}

Start-Sleep -Seconds 5

Write-Host "  Creation de la base de donnees..." -ForegroundColor Cyan
php bin/console doctrine:database:create --if-not-exists --no-interaction

Write-Host "  Execution des migrations..." -ForegroundColor Cyan
php bin/console doctrine:migrations:migrate --no-interaction

Write-Host ""
Write-Host "  OK - Base de donnees configuree" -ForegroundColor Green
Write-Host ""

# ================================================================
# ETAPE 4: Installation Frontend
# ================================================================
Write-Host "==============================================" -ForegroundColor Yellow
Write-Host "  [4/5] Installation Frontend React                        " -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Yellow
Write-Host ""

Set-Location "$projectRoot\planb-frontend"

Write-Host "  Installation des dependances npm..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "  OK - Frontend installe" -ForegroundColor Green
Write-Host ""

# ================================================================
# ETAPE 5: Vérification finale
# ================================================================
Write-Host "==============================================" -ForegroundColor Yellow
Write-Host "  [5/5] Verification de l installation                     " -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Yellow
Write-Host ""

$checks = @(
    @{Name="Composer"; Path="$projectRoot\planb-backend\vendor"; Type="Directory"},
    @{Name="Clés JWT"; Path="$projectRoot\planb-backend\config\jwt\private.pem"; Type="File"},
    @{Name="PostgreSQL"; Command="docker ps --filter name=planb-postgres --format '{{.Status}}'"; Type="Docker"},
    @{Name="Node Modules"; Path="$projectRoot\planb-frontend\node_modules"; Type="Directory"}
)

$allOk = $true
foreach ($check in $checks) {
    Write-Host "  Verification: $($check.Name)..." -NoNewline -ForegroundColor Cyan
    
    $ok = $false
    if ($check.Type -eq "Directory" -or $check.Type -eq "File") {
        $ok = Test-Path $check.Path
    } elseif ($check.Type -eq "Docker") {
        $result = Invoke-Expression $check.Command
        $ok = $result -like "*Up*"
    }
    
    if ($ok) {
        Write-Host " OK" -ForegroundColor Green
    } else {
        Write-Host " ERREUR" -ForegroundColor Red
        $allOk = $false
    }
}

Write-Host ""

# ================================================================
# RÉSUMÉ
# ================================================================
Set-Location $projectRoot

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "            INSTALLATION TERMINEE                            " -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

if ($allOk) {
    Write-Host "  OK - Toutes les verifications ont reussi !" -ForegroundColor Green
    Write-Host ""
    Write-Host "┌────────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
    Write-Host "  PROCHAINE ETAPE                                          " -ForegroundColor Cyan
    Write-Host "├────────────────────────────────────────────────────────────┤" -ForegroundColor Cyan
    Write-Host "  Demarrez l application avec:                             " -ForegroundColor White
    Write-Host "│                                                            │" -ForegroundColor White
    Write-Host "    .\DEMARRAGE\DEMARRER.ps1                                " -ForegroundColor Yellow
    Write-Host "│                                                            │" -ForegroundColor White
    Write-Host "  Puis accedez a: http://localhost:5173                    " -ForegroundColor White
    Write-Host "└────────────────────────────────────────────────────────────┘" -ForegroundColor Cyan
} else {
    Write-Host "  ATTENTION - Certaines verifications ont echoue" -ForegroundColor Yellow
    Write-Host "  Verifiez les messages d erreur ci-dessus" -ForegroundColor Yellow
}

Write-Host ""
