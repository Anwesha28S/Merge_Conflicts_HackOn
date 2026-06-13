# Check for Secrets Before Pushing to GitHub
# Run this script before git push to ensure no secrets are committed

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Checking for Secrets in Git" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$errors = @()

# Check if .env files are staged
Write-Host "Checking for .env files..." -ForegroundColor Yellow
$envFiles = git ls-files | Select-String "\.env$|\.env\.production$|\.env\.local$"
if ($envFiles) {
    $errors += ".env files found in git:"
    $envFiles | ForEach-Object { $errors += "  - $_" }
}

# Check for .pem key files
Write-Host "Checking for .pem key files..." -ForegroundColor Yellow
$pemFiles = git ls-files | Select-String "\.pem$"
if ($pemFiles) {
    $errors += ".pem key files found in git:"
    $pemFiles | ForEach-Object { $errors += "  - $_" }
}

# Check for database files
Write-Host "Checking for database files..." -ForegroundColor Yellow
$dbFiles = git ls-files | Select-String "\.db$|\.sqlite$"
if ($dbFiles) {
    $errors += "Database files found in git:"
    $dbFiles | ForEach-Object { $errors += "  - $_" }
}

# Check for AWS credentials patterns in staged files
Write-Host "Checking for AWS credentials..." -ForegroundColor Yellow
$stagedFiles = git diff --cached --name-only
foreach ($file in $stagedFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
        if ($content -match "AKIA[0-9A-Z]{16}") {
            $errors += "AWS Access Key found in: $file"
        }
        if ($content -match "aws_secret_access_key\s*=\s*.+") {
            $errors += "AWS Secret Key found in: $file"
        }
    }
}

# Display results
Write-Host "`n========================================" -ForegroundColor Cyan
if ($errors.Count -eq 0) {
    Write-Host "  ✅ No secrets detected!" -ForegroundColor Green
    Write-Host "  Safe to push to GitHub" -ForegroundColor Green
} else {
    Write-Host "  ❌ SECRETS DETECTED!" -ForegroundColor Red
    Write-Host "  DO NOT PUSH!" -ForegroundColor Red
    Write-Host "`nIssues found:" -ForegroundColor Yellow
    $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    Write-Host "`nFix these issues before pushing!" -ForegroundColor Yellow
}
Write-Host "========================================`n" -ForegroundColor Cyan

if ($errors.Count -gt 0) {
    exit 1
}
