@echo off
title BankShield - Launcher
echo ===================================================
echo   BankShield - Risk Identification ^& Mitigation
echo   Academic Demonstration Launcher
echo ===================================================
echo.
echo [1/2] Starting Flask Backend on http://localhost:5000...
start "BankShield Backend" cmd /k "cd /d "%~dp0backend" && if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) && python app.py"

timeout /t 2 /nobreak > nul

echo [2/2] Starting Vite Frontend on http://localhost:5173...
start "BankShield Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================
echo   BankShield services are now running:
echo   - Backend API:  http://localhost:5000/api
echo   - Frontend UI:  http://localhost:5173
echo.
echo   Press any key to close this launcher window.
echo   (Backend and Frontend processes will remain running)
echo ===================================================
pause > nul
