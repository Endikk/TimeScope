# Script de demarrage complet TimeScope
# Ce script demarre les bases de donnees, le backend et le frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TimeScope - Demarrage complet        " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Etape 1: Demarrer les bases de donnees
Write-Host "[1/3] Demarrage des bases de donnees Docker..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Bases de donnees demarrees" -ForegroundColor Green
} else {
    Write-Host "ERREUR - Impossible de demarrer les bases" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Attendre que les bases soient pretes
Write-Host "Attente de disponibilite des bases (10s)..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Etape 2: Demarrer le Backend
Write-Host "[2/3] Demarrage du Backend (.NET API)..." -ForegroundColor Yellow
Write-Host "Le backend sera disponible sur https://localhost:7xxx/swagger" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd TimeScope.API; dotnet run"
Write-Host "OK - Backend demarre dans une nouvelle fenetre" -ForegroundColor Green
Write-Host ""

# Etape 3: Demarrer le Frontend
Write-Host "[3/3] Demarrage du Frontend (React + Vite)..." -ForegroundColor Yellow
Write-Host "Le frontend sera disponible sur http://localhost:5173" -ForegroundColor Gray
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd TimeScope.Frontend; npm run dev"
Write-Host "OK - Frontend demarre dans une nouvelle fenetre" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TimeScope est pret!                  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services actifs:" -ForegroundColor White
Write-Host "  - Frontend:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "  - Backend:     https://localhost:7xxx" -ForegroundColor Cyan
Write-Host "  - Swagger:     https://localhost:7xxx/swagger" -ForegroundColor Cyan
Write-Host "  - pgAdmin:     http://localhost:5050" -ForegroundColor Cyan
Write-Host ""
Write-Host "  - DB Admin:    localhost:5433" -ForegroundColor Gray
Write-Host "  - DB Projects: localhost:5434" -ForegroundColor Gray
Write-Host "  - DB Time:     localhost:5435" -ForegroundColor Gray
Write-Host "  - DB Reports:  localhost:5436" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer cette fenetre..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
