# Script de demarrage complet TimeScope (Docker)
# Ce script demarre toute la stack via Docker Compose

param (
    [switch]$SkipMonitoring
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TimeScope - Demarrage Docker         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Recuperer la branche courante
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Branche detectee : $currentBranch" -ForegroundColor Cyan

# Configuration des fichiers Docker Compose
$baseFiles = "-f docker-compose.yml"
$monitoringFile = ""

if (-not $SkipMonitoring) {
    $monitoringFile = "-f docker-compose.monitoring.yml"
    Write-Host "Monitoring (ELK) : ACTIVE" -ForegroundColor Green
}
else {
    Write-Host "Monitoring (ELK) : DESACTIVE" -ForegroundColor Gray
}

# Demarrer tous les services via Docker Compose
Write-Host "Demarrage des services..." -ForegroundColor Yellow

if ($currentBranch -eq "develop") {
    Write-Host "Mode DEVELOPPEMENT active (Hot Reload)" -ForegroundColor Magenta
    Invoke-Expression "docker-compose $baseFiles -f docker-compose.dev.yml $monitoringFile up -d --build"
}
else {
    Write-Host "Mode PRODUCTION active" -ForegroundColor Blue
    Invoke-Expression "docker-compose $baseFiles -f docker-compose.prod.yml $monitoringFile up -d --build"
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "OK - Tous les services sont demarres" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Services actifs:" -ForegroundColor White
    Write-Host "  - Frontend:    http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  - Backend API: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "  - Swagger:     http://localhost:8080/swagger" -ForegroundColor Cyan
    Write-Host "  - pgAdmin:     http://localhost:5050" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  - Database:    localhost:5432 (PostgreSQL)" -ForegroundColor Gray
    Write-Host ""
    
    if (-not $SkipMonitoring) {
        Write-Host "  - Kibana:      http://localhost:5601" -ForegroundColor Magenta
    }
}
else {
    Write-Host ""
    Write-Host "ERREUR - Impossible de demarrer les services" -ForegroundColor Red
    exit 1
}

Write-Host ""
