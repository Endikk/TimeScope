# Script pour lancer tous les tests (Unitaires + E2E)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TimeScope - Execution des Tests      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# S'assurer qu'on est dans le dossier du script
Set-Location $PSScriptRoot

# 1. Tests Unitaires (Jest)
Write-Host "1. Lancement des tests unitaires (Jest)..." -ForegroundColor Yellow
Set-Location TimeScope.Frontend
npm run test
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR - Echec des tests unitaires" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "OK - Tests unitaires passes" -ForegroundColor Green
Write-Host ""

# 2. Tests E2E (Playwright)
Write-Host "2. Lancement des tests E2E (Playwright)..." -ForegroundColor Yellow
# On s'assure que Playwright est installe
npx playwright install --with-deps
npx playwright test
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR - Echec des tests E2E" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "OK - Tests E2E passes" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SUCCES - Tous les tests sont passes  " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
