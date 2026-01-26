# Script pour recréer les fichiers avec le bon encodage UTF-8 sans BOM

$tempDir = "C:\Users\Elohim Mickael\Documents\plan-b\temp_controllers"
$backendDir = "C:\Users\Elohim Mickael\Documents\plan-b\planb-backend"

# Liste des fichiers à copier
$files = @(
    @{Source="ConversationController.php"; Dest="src\Controller\ConversationController.php"},
    @{Source="FavoriteController.php"; Dest="src\Controller\FavoriteController.php"},
    @{Source="MessageController.php"; Dest="src\Controller\MessageController.php"},
    @{Source="ReportController.php"; Dest="src\Controller\ReportController.php"},
    
    @{Source="ConversationRepository.php"; Dest="src\Repository\ConversationRepository.php"},
    @{Source="FavoriteRepository.php"; Dest="src\Repository\FavoriteRepository.php"},
    @{Source="MessageRepository.php"; Dest="src\Repository\MessageRepository.php"},
    @{Source="ReportRepository.php"; Dest="src\Repository\ReportRepository.php"},
    @{Source="RefreshTokenRepository.php"; Dest="src\Repository\RefreshTokenRepository.php"},
    @{Source="SecurityLogRepository.php"; Dest="src\Repository\SecurityLogRepository.php"},
    
    @{Source="Conversation.php"; Dest="src\Entity\Conversation.php"},
    @{Source="Favorite.php"; Dest="src\Entity\Favorite.php"},
    @{Source="Message.php"; Dest="src\Entity\Message.php"},
    @{Source="Report.php"; Dest="src\Entity\Report.php"},
    @{Source="RefreshToken.php"; Dest="src\Entity\RefreshToken.php"},
    @{Source="SecurityLog.php"; Dest="src\Entity\SecurityLog.php"},
    
    @{Source="SMSService.php"; Dest="src\Service\SMSService.php"},
    @{Source="SecurityLogger.php"; Dest="src\Service\SecurityLogger.php"},
    @{Source="NotificationService.php"; Dest="src\Service\NotificationService.php"}
)

foreach ($file in $files) {
    $sourcePath = Join-Path $tempDir $file.Source
    $destPath = Join-Path $backendDir $file.Dest
    
    if (Test-Path $sourcePath) {
        # Lire le contenu
        $content = Get-Content -Path $sourcePath -Raw -Encoding UTF8
        
        # Écrire avec UTF-8 sans BOM
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($destPath, $content, $utf8NoBom)
        
        Write-Host "✓ Copié : $($file.Source)" -ForegroundColor Green
    } else {
        Write-Host "✗ Non trouvé : $($file.Source)" -ForegroundColor Red
    }
}

Write-Host "`n✅ Tous les fichiers ont été recréés avec le bon encodage!" -ForegroundColor Green
Write-Host "Exécutez maintenant : php bin/console doctrine:migrations:migrate" -ForegroundColor Cyan
