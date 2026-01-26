# Script d arret - Plan B

$Host.UI.RawUI.WindowTitle = "Plan B - Arret"

# Ports a arreter
$PORTS = @(8000, 5173, 3001)
$PORT_NAMES = @{
    8000 = "Backend (PHP)"
    5173 = "Frontend (Vite)"
    3001 = "Socket.IO"
}

function Stop-ProcessOnPort {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $processIds) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                Write-Host "  [OK] Port $Port - $($PORT_NAMES[$Port]) arrete (PID: $procId)" -ForegroundColor Green
            } catch {}
        }
        return $true
    }
    return $false
}

Clear-Host
Write-Host ""
Write-Host "  =========================================" -ForegroundColor Yellow
Write-Host "           ARRET DE PLAN B                 " -ForegroundColor Yellow
Write-Host "  =========================================" -ForegroundColor Yellow
Write-Host ""

$stopped = 0

foreach ($port in $PORTS) {
    if (Stop-ProcessOnPort $port) {
        $stopped++
    } else {
        Write-Host "  [--] Port $port - $($PORT_NAMES[$port]) n etait pas actif" -ForegroundColor Gray
    }
}

Start-Sleep -Seconds 1

Write-Host ""
Write-Host "  -----------------------------------------" -ForegroundColor Green
if ($stopped -gt 0) {
    Write-Host "  [OK] $stopped service(s) arrete(s)" -ForegroundColor Green
} else {
    Write-Host "  [INFO] Aucun service n etait en cours" -ForegroundColor Cyan
}
Write-Host "  -----------------------------------------" -ForegroundColor Green
Write-Host ""
Write-Host "  Pour redemarrer : .\demarrer.ps1" -ForegroundColor Cyan
Write-Host ""
