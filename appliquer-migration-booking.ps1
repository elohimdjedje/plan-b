# Script PowerShell pour appliquer la migration SQL du système de réservation
# Usage: .\appliquer-migration-booking.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Migration SQL - Système Réservation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le fichier SQL existe
$sqlFile = "planb-backend\migrations\create_booking_system.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Erreur: Fichier SQL introuvable: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichier SQL trouvé: $sqlFile" -ForegroundColor Green
Write-Host ""

# Demander les informations de connexion
Write-Host "Veuillez entrer les informations de connexion PostgreSQL:" -ForegroundColor Yellow
Write-Host ""

$host = Read-Host "Host (localhost par défaut)"
if ([string]::IsNullOrWhiteSpace($host)) { $host = "localhost" }

$port = Read-Host "Port (5432 par défaut)"
if ([string]::IsNullOrWhiteSpace($port)) { $port = "5432" }

$database = Read-Host "Nom de la base de données (OBLIGATOIRE)"
if ([string]::IsNullOrWhiteSpace($database)) {
    Write-Host "❌ Le nom de la base de données est obligatoire!" -ForegroundColor Red
    exit 1
}

$username = Read-Host "Nom d'utilisateur (postgres par défaut)"
if ([string]::IsNullOrWhiteSpace($username)) { $username = "postgres" }

$password = Read-Host "Mot de passe" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

Write-Host ""
Write-Host "Tentative de connexion à PostgreSQL..." -ForegroundColor Yellow

# Essayer de trouver psql
$psqlPath = $null
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\13\bin\psql.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        break
    }
}

# Si psql n'est pas trouvé, essayer via PATH
if (-not $psqlPath) {
    $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlPath) {
        $psqlPath = $psqlPath.Source
    }
}

if (-not $psqlPath) {
    Write-Host ""
    Write-Host "❌ psql n'a pas été trouvé sur votre système." -ForegroundColor Red
    Write-Host ""
    Write-Host "Options alternatives:" -ForegroundColor Yellow
    Write-Host "1. Installer PostgreSQL et ajouter psql au PATH" -ForegroundColor White
    Write-Host "2. Utiliser pgAdmin (interface graphique)" -ForegroundColor White
    Write-Host "   - Ouvrir pgAdmin" -ForegroundColor White
    Write-Host "   - Se connecter à votre base de données" -ForegroundColor White
    Write-Host "   - Clic droit sur la base → Query Tool" -ForegroundColor White
    Write-Host "   - Ouvrir le fichier: $sqlFile" -ForegroundColor White
    Write-Host "   - Exécuter (F5)" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Copier-coller le contenu SQL dans un outil de gestion de base de données" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ psql trouvé: $psqlPath" -ForegroundColor Green
Write-Host ""

# Construire la commande psql
$env:PGPASSWORD = $passwordPlain
$sqlContent = Get-Content $sqlFile -Raw -Encoding UTF8

# Créer un fichier temporaire avec le contenu SQL
$tempFile = [System.IO.Path]::GetTempFileName()
$sqlContent | Out-File -FilePath $tempFile -Encoding UTF8

try {
    Write-Host "Application de la migration..." -ForegroundColor Yellow
    Write-Host ""
    
    $arguments = @(
        "-h", $host
        "-p", $port
        "-U", $username
        "-d", $database
        "-f", $tempFile
        "-v", "ON_ERROR_STOP=1"
    )
    
    $process = Start-Process -FilePath $psqlPath -ArgumentList $arguments -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration appliquée avec succès!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Les tables suivantes ont été créées:" -ForegroundColor Cyan
        Write-Host "  - bookings" -ForegroundColor White
        Write-Host "  - payments (renommé en booking_payments)" -ForegroundColor White
        Write-Host "  - escrow_accounts" -ForegroundColor White
        Write-Host "  - contracts" -ForegroundColor White
        Write-Host "  - receipts" -ForegroundColor White
        Write-Host "  - availability_calendar" -ForegroundColor White
        Write-Host "  - payment_reminders" -ForegroundColor White
        Write-Host "  - late_payment_penalties" -ForegroundColor White
        Write-Host ""
        Write-Host "🎉 Le système de réservation est maintenant opérationnel!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Erreur lors de l'application de la migration (code: $($process.ExitCode))" -ForegroundColor Red
        Write-Host "Vérifiez les erreurs ci-dessus." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
    exit 1
} finally {
    # Nettoyer
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
