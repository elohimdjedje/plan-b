@echo off
REM Script pour appliquer la migration visite virtuelle
echo ========================================
echo Application de la migration SQL
echo ========================================
echo.

REM Chercher psql dans les emplacements communs
set PGPASSWORD=root
set PSQL_PATH=

REM Essayer les emplacements communs
if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
    set PSQL_PATH=C:\Program Files\PostgreSQL\15\bin\psql.exe
    goto :found
)
if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" (
    set PSQL_PATH=C:\Program Files\PostgreSQL\14\bin\psql.exe
    goto :found
)
if exist "C:\Program Files\PostgreSQL\13\bin\psql.exe" (
    set PSQL_PATH=C:\Program Files\PostgreSQL\13\bin\psql.exe
    goto :found
)
if exist "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe" (
    set PSQL_PATH=C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe
    goto :found
)

REM Chercher dans tous les dossiers PostgreSQL
for /d %%i in ("C:\Program Files\PostgreSQL\*") do (
    if exist "%%i\bin\psql.exe" (
        set PSQL_PATH=%%i\bin\psql.exe
        goto :found
    )
)

for /d %%i in ("C:\Program Files (x86)\PostgreSQL\*") do (
    if exist "%%i\bin\psql.exe" (
        set PSQL_PATH=%%i\bin\psql.exe
        goto :found
    )
)

REM Essayer si psql est dans le PATH
where psql >nul 2>&1
if %ERRORLEVEL% == 0 (
    set PSQL_PATH=psql
    goto :found
)

echo [ERREUR] psql non trouve
echo.
echo Solutions:
echo 1. Utiliser pgAdmin:
echo    - Ouvrir pgAdmin
echo    - Se connecter a la base 'planb'
echo    - Query Tool
echo    - Ouvrir: planb-backend\migrations\APPLIQUER_MAINTENANT.sql
echo    - Executer (F5)
echo.
echo 2. Installer PostgreSQL client tools
echo.
pause
exit /b 1

:found
echo [OK] psql trouve: %PSQL_PATH%
echo.

REM Tester la connexion
echo Test de connexion...
"%PSQL_PATH%" -U postgres -h localhost -d planb -c "SELECT 1;" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERREUR] Impossible de se connecter a PostgreSQL
    echo Verifiez que PostgreSQL est demarre
    pause
    exit /b 1
)
echo [OK] Connexion reussie
echo.

REM Vérifier si les colonnes existent
echo Verification des colonnes existantes...
"%PSQL_PATH%" -U postgres -h localhost -d planb -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'listings' AND column_name LIKE 'virtual_tour%';" > temp_check.txt
set /p COLUMN_COUNT=<temp_check.txt
del temp_check.txt

if %COLUMN_COUNT% geq 4 (
    echo [ATTENTION] Les colonnes virtual_tour existent deja
    echo Migration deja appliquee !
    pause
    exit /b 0
)

REM Appliquer la migration
echo Application de la migration...
"%PSQL_PATH%" -U postgres -h localhost -d planb -f "planb-backend\migrations\add_virtual_tour.sql"

if %ERRORLEVEL% == 0 (
    echo.
    echo [OK] Migration appliquee avec succes !
    echo.
    echo Prochaines etapes:
    echo 1. Redemarrer le backend
    echo 2. Redemarrer le frontend
    echo 3. Tester avec un compte PRO
) else (
    echo.
    echo [ERREUR] Erreur lors de l'application de la migration
)

echo.
pause
