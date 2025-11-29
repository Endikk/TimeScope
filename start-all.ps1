# Script de demarrage complet TimeScope (Docker)
# Ce script demarre toute la stack via Docker Compose

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TimeScope - Demarrage Docker         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Demarrer tous les services via Docker Compose
Write-Host "Demarrage des services..." -ForegroundColor Yellow
docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "OK - Tous les services sont demarres" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Services actifs:" -ForegroundColor White
    Write-Host "  - Frontend:    http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  - Backend API: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "  - Swagger:     http://localhost:8080/swagger" -ForegroundColor Cyan
    Write-Host "  - pgAdmin:     http://localhost:5050" -ForegroundColor Cyan
    Write-Host "  - n8n:         http://localhost:5678" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  - DB Admin:    localhost:5443" -ForegroundColor Gray
    Write-Host "  - DB Projects: localhost:5444" -ForegroundColor Gray
    Write-Host "  - DB Time:     localhost:5445" -ForegroundColor Gray
    Write-Host "  - DB Reports:  localhost:5446" -ForegroundColor Gray
}
else {
    Write-Host ""
    Write-Host "ERREUR - Impossible de demarrer les services" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer cette fenetre..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
