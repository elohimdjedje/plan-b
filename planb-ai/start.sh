#!/bin/bash

# Script de démarrage du service IA Plan B

echo "=========================================="
echo "   PLAN B - SERVICE IA"
echo "=========================================="
echo ""

# Vérifier si l'environnement virtuel existe
if [ ! -d "venv" ]; then
    echo "Création de l'environnement virtuel..."
    python3 -m venv venv
fi

# Activer l'environnement virtuel
echo "Activation de l'environnement virtuel..."
source venv/bin/activate

# Installer les dépendances si nécessaire
if [ ! -f "venv/.installed" ]; then
    echo "Installation des dépendances..."
    pip install -r requirements.txt
    touch venv/.installed
fi

# Créer le dossier models si nécessaire
mkdir -p models

# Démarrer le service
echo ""
echo "Démarrage du service IA sur http://localhost:5000"
echo "Appuyez sur Ctrl+C pour arrêter"
echo ""

python app.py
