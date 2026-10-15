@echo off
echo ========================================================
echo Building production assets...
echo ========================================================
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed with error code %ERRORLEVEL%
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo Starting AI Portfolio Server in Production Mode...
echo Open http://localhost:5000
echo ========================================================
echo.
call npm run start
