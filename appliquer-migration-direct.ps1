# Script pour appliquer la migration visite virtuelle
# Essaie plusieurs méthodes pour se connecter à PostgreSQL

Write-Host "🔍 Application de la migration visite virtuelle..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "planb"
$dbUser = "postgres"
$dbPassword = "root"

# SQL de migration
$migrationSQL = @"
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS virtual_tour_type VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_thumbnail TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_data JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_listing_virtual_tour ON listings(virtual_tour_type) 
WHERE virtual_tour_type IS NOT NULL;
"@

# Méthode 1: Chercher psql dans les emplacements communs
Write-Host "1. Recherche de psql..." -ForegroundColor Yellow

$psqlPath = $null
$searchPaths = @(
    "C:\Program Files\PostgreSQL\*\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\*\bin\psql.exe",
    "$env:ProgramFiles\PostgreSQL\*\bin\psql.exe",
    "$env:ProgramFiles(x86)\PostgreSQL\*\bin\psql.exe"
)

foreach ($pattern in $searchPaths) {
    $found = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | 
             Sort-Object LastWriteTime -Descending | 
             Select-Object -First 1
    
    if ($found) {
        $psqlPath = $found.FullName
        Write-Host "   ✅ psql trouvé: $psqlPath" -ForegroundColor Green
        break
    }
}

if (-not $psqlPath) {
    # Méthode 2: Vérifier si psql est dans le PATH
    $psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlCmd) {
        $psqlPath = "psql"
        Write-Host "   ✅ psql trouvé dans PATH" -ForegroundColor Green
    }
}

if (-not $psqlPath) {
    Write-Host "   ❌ psql non trouvé" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solutions alternatives:" -ForegroundColor Yellow
    Write-Host "   1. Utiliser pgAdmin:" -ForegroundColor Gray
    Write-Host "      - Ouvrir pgAdmin" -ForegroundColor Gray
    Write-Host "      - Se connecter à la base 'planb'" -ForegroundColor Gray
    Write-Host "      - Query Tool → Ouvrir: planb-backend\migrations\APPLIQUER_MAINTENANT.sql" -ForegroundColor Gray
    Write-Host "      - Exécuter (F5)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Installer PostgreSQL client tools" -ForegroundColor Gray
    Write-Host "   3. Utiliser Adminer (si disponible sur http://localhost:8080)" -ForegroundColor Gray
    exit 1
}

# Tester la connexion
Write-Host ""
Write-Host "2. Test de connexion à PostgreSQL..." -ForegroundColor Yellow

$env:PGPASSWORD = $dbPassword

try {
    if ($psqlPath -eq "psql") {
        $testResult = & psql -U $dbUser -h $dbHost -p $dbPort -d $dbName -c "SELECT 1;" 2>&1
    } else {
        $testResult = & $psqlPath -U $dbUser -h $dbHost -p $dbPort -d $dbName -c "SELECT 1;" 2>&1
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Connexion réussie" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur de connexion" -ForegroundColor Red
        Write-Host "   $testResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur: $_" -ForegroundColor Red
    exit 1
}

# Vérifier si les colonnes existent déjà
Write-Host ""
Write-Host "3. Vérification des colonnes existantes..." -ForegroundColor Yellow

$checkSQL = "SELECT column_name FROM information_schema.columns WHERE table_name = 'listings' AND column_name LIKE 'virtual_tour%';"

if ($psqlPath -eq "psql") {
    $checkResult = & psql -U $dbUser -h $dbHost -p $dbPort -d $dbName -t -c $checkSQL 2>&1
} else {
    $checkResult = & $psqlPath -U $dbUser -h $dbHost -p $dbPort -d $dbName -t -c $checkSQL 2>&1
}

$hasColumns = $checkResult -match "virtual_tour"

if ($hasColumns) {
    Write-Host "   ⚠️  Les colonnes virtual_tour existent déjà" -ForegroundColor Yellow
    Write-Host "   Colonnes trouvées:" -ForegroundColor Cyan
    $checkResult | Where-Object { $_ -match "virtual_tour" } | ForEach-Object { 
        Write-Host "      - $_" -ForegroundColor Gray 
    }
    Write-Host ""
    Write-Host "✅ Migration déjà appliquée !" -ForegroundColor Green
    exit 0
}

Write-Host "   Aucune colonne virtual_tour trouvée" -ForegroundColor Gray

# Appliquer la migration
Write-Host ""
Write-Host "4. Application de la migration..." -ForegroundColor Yellow

# Créer un fichier SQL temporaire
$tempSQLFile = [System.IO.Path]::GetTempFileName() + ".sql"
$migrationSQL | Out-File -FilePath $tempSQLFile -Encoding UTF8 -NoNewline

try {
    if ($psqlPath -eq "psql") {
        $result = & psql -U $dbUser -h $dbHost -p $dbPort -d $dbName -f $tempSQLFile 2>&1
    } else {
        $result = & $psqlPath -U $dbUser -h $dbHost -p $dbPort -d $dbName -f $tempSQLFile 2>&1
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Migration appliquée avec succès !" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors de l'application:" -ForegroundColor Red
        Write-Host "   $result" -ForegroundColor Red
        Remove-Item $tempSQLFile -ErrorAction SilentlyContinue
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur: $_" -ForegroundColor Red
    Remove-Item $tempSQLFile -ErrorAction SilentlyContinue
    exit 1
} finally {
    Remove-Item $tempSQLFile -ErrorAction SilentlyContinue
}

# Vérification finale
Write-Host ""
Write-Host "5. Vérification finale..." -ForegroundColor Yellow

if ($psqlPath -eq "psql") {
    $verifyResult = & psql -U $dbUser -h $dbHost -p $dbPort -d $dbName -c $checkSQL 2>&1
} else {
    $verifyResult = & $psqlPath -U $dbUser -h $dbHost -p $dbPort -d $dbName -c $checkSQL 2>&1
}

$columns = ($verifyResult | Select-String "virtual_tour").Count

if ($columns -ge 4) {
    Write-Host "   ✅ Toutes les colonnes sont présentes ($columns colonnes)" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Migration terminée avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "   1. Redémarrer le backend (si en cours d'exécution)" -ForegroundColor Gray
    Write-Host "   2. Redémarrer le frontend (si en cours d'exécution)" -ForegroundColor Gray
    Write-Host "   3. Tester avec un compte PRO" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Attention: Seulement $columns colonnes trouvées (attendu: 4)" -ForegroundColor Yellow
}

Write-Host ""
