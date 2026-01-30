@echo off
REM Script de démarrage du service IA Plan B (Windows)

echo ==========================================
echo    PLAN B - SERVICE IA
echo ==========================================
echo.

REM Vérifier si l'environnement virtuel existe
if not exist "venv" (
    echo Création de l'environnement virtuel...
    python -m venv venv
)

REM Activer l'environnement virtuel
echo Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

REM Installer les dépendances si nécessaire
if not exist "venv\.installed" (
    echo Installation des dépendances...
    pip install -r requirements.txt
    type nul > venv\.installed
)

REM Créer le dossier models si nécessaire
if not exist "models" mkdir models

REM Démarrer le service
echo.
echo Démarrage du service IA sur http://localhost:5000
echo Appuyez sur Ctrl+C pour arrêter
echo.

python app.py
