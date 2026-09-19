@echo off
REM ============================================================================
REM BeyondAgtest.bat — Windows batch launcher for BeyondAgtest
REM ============================================================================
REM Checks for Node.js and launches the BeyondAgtest dashboard.
REM Place this file in PATH or create a shortcut to it.
REM ============================================================================

setlocal EnableDelayedExpansion

title BeyondAgtest

REM --- Check for Node.js ---
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo  [ERROR] Node.js is required but not found.
    echo.
    echo  Please install Node.js 18+ from:
    echo    https://nodejs.org/en/download/
    echo.
    echo  Or install via Windows Package Manager:
    echo    winget install OpenJS.NodeJS.LTS
    echo.
    echo  After installing, restart your terminal and try again.
    echo.
    pause
    exit /b 1
)

REM --- Check for beyondagtest command ---
where beyondagtest >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo  [INFO] BeyondAgtest is not installed. Installing now...
    echo.
    call npm install -g @beyondkitter/beyondagtest
    if %ERRORLEVEL% neq 0 (
        echo.
        echo  [ERROR] Installation failed.
        echo  Try running as Administrator or install manually:
        echo    npm install -g @beyondkitter/beyondagtest
        echo.
        pause
        exit /b 1
    )
    echo.
    echo  [OK] BeyondAgtest installed successfully.
    echo.
)

REM --- Run doctor ---
echo.
echo  Running BeyondAgtest doctor...
echo.
call beyondagtest doctor
echo.

REM --- Launch dashboard ---
echo  Starting BeyondAgtest dashboard...
echo  (Press Ctrl+C to stop the server)
echo.
call beyondagtest dashboard

REM --- On exit ---
echo.
echo  BeyondAgtest has stopped.
pause
