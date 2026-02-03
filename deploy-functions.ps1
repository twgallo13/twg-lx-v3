# Firebase Functions Deployment Script
# The Winning Game LX - Deploy Canonical Functions (Appendix A.4)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firebase Functions Deployment" -ForegroundColor Cyan
Write-Host "Project: studio-3220084595-54dab" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Navigate to project root
Set-Location c:\TWG-LX

Write-Host "Step 1: Authenticate with Firebase CLI" -ForegroundColor Yellow
Write-Host "Running: firebase login`n" -ForegroundColor Gray

# Authenticate (this will open browser)
firebase login

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Authentication failed. Please try again." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Authentication successful`n" -ForegroundColor Green

# Set project
Write-Host "Step 2: Set Firebase project" -ForegroundColor Yellow
Write-Host "Running: firebase use studio-3220084595-54dab`n" -ForegroundColor Gray

firebase use studio-3220084595-54dab

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Failed to set project." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Project set successfully`n" -ForegroundColor Green

# Deploy functions
Write-Host "Step 3: Deploy Cloud Functions" -ForegroundColor Yellow
Write-Host "Running: firebase deploy --only functions`n" -ForegroundColor Gray

firebase deploy --only functions

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Deployment failed. Check error messages above." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Deployment successful`n" -ForegroundColor Green

# List functions
Write-Host "Step 4: Verify deployed functions" -ForegroundColor Yellow
Write-Host "Running: firebase functions:list`n" -ForegroundColor Gray

firebase functions:list

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next: Test a callable function" -ForegroundColor Yellow
Write-Host "Run: node test-function.js`n" -ForegroundColor Gray
