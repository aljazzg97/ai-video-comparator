# Frontend Launcher Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting AI Video Comparator Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to the script's directory
Set-Location $PSScriptRoot

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting Next.js development server..." -ForegroundColor Green
Write-Host "URL: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

npm run dev