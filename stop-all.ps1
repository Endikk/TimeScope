# Script d'arret complet TimeScope (Docker)
# Ce script arrete toute la stack Docker

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TimeScope - Arret des services       " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Arreter tous les services
Write-Host "Arret des conteneurs..." -ForegroundColor Yellow
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "OK - Tous les services sont arretes" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ERREUR - Probleme lors de l'arret des services" -ForegroundColor Red
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer cette fenetre..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
