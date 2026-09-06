@echo off
setlocal enabledelayedexpansion
set "PATH=C:\Users\Jagadiswar\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd;%PATH%"

echo ================================================================
echo PlacePro - Sync and Push to GitHub Repository
echo Repository: https://github.com/Toxic-Manwar/Placepro-web-app.git
echo ================================================================
echo.

:: Ensure origin is set
git remote remove origin 2>nul
git remote add origin https://github.com/Toxic-Manwar/Placepro-web-app.git

:: Switch to main branch
git branch -M main

:: Add and commit any updated files
git add .
git commit -m "Add PlacePro Unified Academia and Industry Portal project files" 2>nul

echo Pushing code to GitHub...
:: Try pushing directly
git push -u origin main --force

if %ERRORLEVEL% equ 0 (
    echo.
    echo ================================================================
    echo SUCCESS: All project files have been added to your GitHub repository!
    echo Check it here: https://github.com/Toxic-Manwar/Placepro-web-app
    echo ================================================================
) else (
    echo.
    echo ----------------------------------------------------------------
    echo Note: If GitHub prompted you to sign in, please complete the login
    echo in your browser and run this script once again.
    echo ----------------------------------------------------------------
)

echo.
pause
