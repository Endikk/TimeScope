# Script d'arret complet TimeScope (Docker)
# Ce script arrete toute la stack Docker

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TimeScope - Arret des services       " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Arreter tous les services
Write-Host "Arret des conteneurs..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "OK - Tous les services sont arretes" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "ERREUR - Probleme lors de l'arret des services" -ForegroundColor Red
}

Write-Host ""