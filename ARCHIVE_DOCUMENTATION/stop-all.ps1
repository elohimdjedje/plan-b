# Script pour arrêter toute l'application Plan B
Write-Host "🛑 Arrêt de Plan B..." -ForegroundColor Red
Write-Host ""

# Arrêter PostgreSQL
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host "Arrêt de PostgreSQL..." -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red

try {
    docker stop planb-postgres 2>&1 | Out-Null
    Write-Host "✅ PostgreSQL arrêté" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL n'était pas démarré" -ForegroundColor Yellow
}

Write-Host ""

# Arrêter le Backend (port 8000)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host "Arrêt du Backend..." -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red

$backendProcess = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($backendProcess) {
    foreach ($processId in $backendProcess) {
        try {
            Stop-Process -Id $processId -Force
            Write-Host "✅ Backend arrêté (PID: $processId)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Impossible d'arrêter le processus $processId" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠️  Backend n'était pas démarré" -ForegroundColor Yellow
}

Write-Host ""

# Arrêter le Frontend (port 5173)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host "Arrêt du Frontend..." -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red

$frontendProcess = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($frontendProcess) {
    foreach ($processId in $frontendProcess) {
        try {
            Stop-Process -Id $processId -Force
            Write-Host "✅ Frontend arrêté (PID: $processId)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Impossible d'arrêter le processus $processId" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠️  Frontend n'était pas démarré" -ForegroundColor Yellow
}

Write-Host ""

# Arrêter tous les processus PHP (au cas où)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host "Nettoyage des processus PHP..." -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red

$phpProcesses = Get-Process php -ErrorAction SilentlyContinue

if ($phpProcesses) {
    $phpProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force
            Write-Host "✅ Processus PHP arrêté (PID: $($_.Id))" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Impossible d'arrêter le processus PHP $($_.Id)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠️  Aucun processus PHP en cours" -ForegroundColor Yellow
}

Write-Host ""

# Arrêter tous les processus Node (au cas où)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host "Nettoyage des processus Node..." -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red

$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        # Vérifier si c'est le processus Vite
        if ($_.CommandLine -like "*vite*" -or $_.CommandLine -like "*plan-b*") {
            try {
                Stop-Process -Id $_.Id -Force
                Write-Host "✅ Processus Node arrêté (PID: $($_.Id))" -ForegroundColor Green
            } catch {
                Write-Host "⚠️  Impossible d'arrêter le processus Node $($_.Id)" -ForegroundColor Yellow
            }
        }
    }
} else {
    Write-Host "⚠️  Aucun processus Node en cours" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Tous les services Plan B ont été arrêtés" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Pour redémarrer l'application:" -ForegroundColor Yellow
Write-Host "   .\start-all.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Note: PostgreSQL reste en arrière-plan dans Docker" -ForegroundColor Gray
Write-Host "   Pour le redémarrer: docker start planb-postgres" -ForegroundColor Gray
Write-Host ""
