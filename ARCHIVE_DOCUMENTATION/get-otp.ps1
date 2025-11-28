# Script pour recuperer le code OTP
Write-Host ""
Write-Host "========================================"
Write-Host "  RECHERCHE CODE OTP"
Write-Host "========================================"
Write-Host ""

# Chercher dans les logs
$logs = docker logs planb_api 2>&1 | Select-String "CODE:"
$lastLog = $logs | Select-Object -Last 1

if ($lastLog) {
    Write-Host "CODE OTP TROUVE !" -ForegroundColor Green
    Write-Host ""
    
    # Extraire le numero
    if ($lastLog -match 'OTP CODE FOR (.+)') {
        $phone = $matches[1]
        Write-Host "Numero: $phone" -ForegroundColor White
    }
    
    # Extraire le code
    if ($lastLog -match 'CODE: (\d{6})') {
        $code = $matches[1]
        Write-Host "CODE: $code" -ForegroundColor Green
        Write-Host ""
        Write-Host "SAISISSEZ CE CODE: $code" -ForegroundColor Black -BackgroundColor Green
    }
} else {
    Write-Host "Aucun code OTP trouve" -ForegroundColor Red
    Write-Host ""
    Write-Host "Assurez-vous de:"
    Write-Host "  1. Avoir clique sur Recevoir le code"
    Write-Host "  2. Le backend est lance"
    Write-Host "  3. Attendre quelques secondes"
}

Write-Host ""
Write-Host "========================================"
Write-Host ""
