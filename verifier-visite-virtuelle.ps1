# Script de vérification et application de la migration visite virtuelle
# Plan B - Visite Virtuelle 360°

Write-Host "🔍 Vérification de la visite virtuelle..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si PostgreSQL est accessible
Write-Host "1. Vérification de la connexion PostgreSQL..." -ForegroundColor Yellow

$env:PGPASSWORD = "root"  # Modifier si nécessaire
$dbName = "planb"
$dbUser = "postgres"
$dbHost = "localhost"

try {
    $result = psql -U $dbUser -h $dbHost -d $dbName -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERREUR] Erreur de connexion a PostgreSQL" -ForegroundColor Red
        Write-Host "Vérifiez que PostgreSQL est démarré et que les identifiants sont corrects" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "[OK] Connexion PostgreSQL OK" -ForegroundColor Green
} catch {
        Write-Host "[ERREUR] PostgreSQL n'est pas accessible" -ForegroundColor Red
    Write-Host "Assurez-vous que PostgreSQL est installé et démarré" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Vérifier si les colonnes existent
Write-Host "2. Vérification des colonnes virtual_tour..." -ForegroundColor Yellow

$checkColumns = @"
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name LIKE 'virtual_tour%'
ORDER BY column_name;
"@

$columnsFile = "temp_check_columns.sql"
$checkColumns | Out-File -FilePath $columnsFile -Encoding UTF8

$columnsResult = psql -U $dbUser -h $dbHost -d $dbName -f $columnsFile 2>&1
Remove-Item $columnsFile -ErrorAction SilentlyContinue

$hasColumns = $columnsResult -match "virtual_tour"

if ($hasColumns) {
    Write-Host "[OK] Les colonnes virtual_tour existent deja" -ForegroundColor Green
    Write-Host ""
    Write-Host "Colonnes trouvées:" -ForegroundColor Cyan
    $columnsResult | Select-String "virtual_tour" | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
} else {
    Write-Host "[ATTENTION] Les colonnes virtual_tour n'existent pas" -ForegroundColor Yellow
    Write-Host ""
    
    # Proposer d'appliquer la migration
    $apply = Read-Host "Voulez-vous appliquer la migration maintenant ? (O/N)"
    
    if ($apply -eq "O" -or $apply -eq "o" -or $apply -eq "Y" -or $apply -eq "y") {
        Write-Host ""
        Write-Host "3. Application de la migration..." -ForegroundColor Yellow
        
        $migrationFile = "planb-backend\migrations\add_virtual_tour.sql"
        
        if (Test-Path $migrationFile) {
            try {
                psql -U $dbUser -h $dbHost -d $dbName -f $migrationFile
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Migration appliquée avec succès !" -ForegroundColor Green
                } else {
                    Write-Host "❌ Erreur lors de l'application de la migration" -ForegroundColor Red
                    exit 1
                }
            } catch {
                Write-Host "❌ Erreur: $_" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "[ERREUR] Fichier de migration introuvable: $migrationFile" -ForegroundColor Red
            Write-Host "Création de la migration SQL..." -ForegroundColor Yellow
            
            # Créer le fichier SQL directement
            $sqlContent = @"
-- Migration SQL pour ajouter les champs de visite virtuelle
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS virtual_tour_type VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_thumbnail TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_data JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_listing_virtual_tour ON listings(virtual_tour_type) 
WHERE virtual_tour_type IS NOT NULL;
"@
            
            $tempSqlFile = "temp_virtual_tour_migration.sql"
            $sqlContent | Out-File -FilePath $tempSqlFile -Encoding UTF8
            
            try {
                psql -U $dbUser -h $dbHost -d $dbName -f $tempSqlFile
                Remove-Item $tempSqlFile -ErrorAction SilentlyContinue
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Migration appliquée avec succès !" -ForegroundColor Green
                } else {
                    Write-Host "❌ Erreur lors de l'application de la migration" -ForegroundColor Red
                    exit 1
                }
            } catch {
                Write-Host "❌ Erreur: $_" -ForegroundColor Red
                exit 1
            }
        }
    } else {
        Write-Host "[SKIP] Migration non appliquee" -ForegroundColor Yellow
        Write-Host "Vous pouvez l'appliquer manuellement plus tard" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "4. Vérification du code..." -ForegroundColor Yellow

# Vérifier le controller
if (Test-Path "planb-backend\src\Controller\Api\VirtualTourController.php") {
    Write-Host "[OK] VirtualTourController.php existe" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] VirtualTourController.php introuvable" -ForegroundColor Red
}

# Vérifier le composant React
if (Test-Path "planb-frontend\src\components\listing\VirtualTour.jsx") {
    Write-Host "[OK] VirtualTour.jsx existe" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] VirtualTour.jsx introuvable" -ForegroundColor Red
}

# Vérifier l'API client
if (Test-Path "planb-frontend\src\api\virtualTour.js") {
    Write-Host "[OK] virtualTour.js existe" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] virtualTour.js introuvable" -ForegroundColor Red
}

Write-Host ""
Write-Host "5. Vérification des dépendances..." -ForegroundColor Yellow

# Vérifier package.json frontend
if (Test-Path "planb-frontend\package.json") {
    $packageJson = Get-Content "planb-frontend\package.json" | ConvertFrom-Json
    $hasPhotoSphere = $packageJson.dependencies.'photo-sphere-viewer' -or $packageJson.dependencies.'@photo-sphere-viewer/core'
    
    if ($hasPhotoSphere) {
        Write-Host "✅ photo-sphere-viewer installé" -ForegroundColor Green
    } else {
        Write-Host "[ATTENTION] photo-sphere-viewer non trouve dans package.json" -ForegroundColor Yellow
        Write-Host "   Exécutez: cd planb-frontend && npm install photo-sphere-viewer" -ForegroundColor Gray
    }
} else {
    Write-Host "[ATTENTION] package.json introuvable" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "[OK] Verification terminee !" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Redémarrer le backend (si migration appliquée)" -ForegroundColor Gray
Write-Host "   2. Redémarrer le frontend" -ForegroundColor Gray
Write-Host "   3. Tester avec un compte PRO:" -ForegroundColor Gray
Write-Host "      - Publier une annonce" -ForegroundColor Gray
Write-Host "      - Uploader une photo 360°" -ForegroundColor Gray
Write-Host "      - Verifier l'affichage" -ForegroundColor Gray
Write-Host ""
