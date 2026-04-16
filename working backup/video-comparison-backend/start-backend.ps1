# Backend Launcher Script
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  Starting AI Video Comparator Backend" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Navigate to the script's directory
Set-Location $PSScriptRoot

# Activate virtual environment
if (Test-Path ".\venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    . .\venv\Scripts\Activate.ps1
} else {
    Write-Host "Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv venv
    . .\venv\Scripts\Activate.ps1
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

Write-Host "Starting FastAPI server..." -ForegroundColor Green
Write-Host "URL: http://localhost:8000" -ForegroundColor Blue
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Blue
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000