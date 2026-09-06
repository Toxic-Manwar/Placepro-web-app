$env:Path = "C:\Users\Jagadiswar\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd;" + $env:Path

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Syncing PlacePro with existing repository: Toxic-Manwar/Placepro-web-app" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan

try {
    git remote remove origin 2>$null
} catch {}

git remote add origin https://github.com/Toxic-Manwar/Placepro-web-app.git
git branch -M main
git add .
git commit -m "Add PlacePro Unified Academia and Industry Portal project files" 2>$null

Write-Host "Pushing files to GitHub repository..." -ForegroundColor Yellow
git push -u origin main --force
