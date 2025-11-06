# Script d'arret complet TimeScope
# Ce script arrete le frontend, le backend et les bases de donnees

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TimeScope - Arret des services       " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Etape 1: Arreter les processus dotnet (Backend)
Write-Host "[1/3] Arret du Backend (.NET)..." -ForegroundColor Yellow
Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*TimeScope*" } | Stop-Process -Force
Write-Host "OK - Backend arrete" -ForegroundColor Green
Write-Host ""

# Etape 2: Arreter les processus Node (Frontend)
Write-Host "[2/3] Arret du Frontend (Node)..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "OK - Frontend arrete" -ForegroundColor Green
Write-Host ""

# Etape 3: Arreter Docker
Write-Host "[3/3] Arret des bases de donnees Docker..." -ForegroundColor Yellow
docker-compose down
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Bases de donnees arretees" -ForegroundColor Green
} else {
    Write-Host "ERREUR - Probleme lors de l'arret des bases" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Tous les services sont arretes       " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
