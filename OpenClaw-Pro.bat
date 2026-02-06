@echo off
REM OpenClaw Pro - Windows Desktop Launcher

cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js not found
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if already running
netstat -ano | findstr ":18789" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo OpenClaw Pro is already running!
    echo Opening browser...
    start http://localhost:18789
    exit /b 0
)

REM Check if built
if not exist "packages\core\dist" (
    echo Building OpenClaw Pro...
    call npm run build
)

REM Check .env
if not exist ".env" (
    echo Creating .env from template...
    copy .env.example .env
    echo WARNING: Please add your ANTHROPIC_API_KEY to .env
    echo WARNING: Then restart the application
    pause
    exit /b 1
)

REM Start servers
echo Starting OpenClaw Pro...

REM Create logs directory
if not exist "logs" mkdir logs

REM Start in background
start /B npm run dev > logs\app.log 2>&1

REM Wait for servers to be ready
echo Waiting for servers...
timeout /t 5 /nobreak >nul

:CHECK_SERVER
timeout /t 1 /nobreak >nul
curl -s http://localhost:18789 >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto CHECK_SERVER

echo OpenClaw Pro is ready!

REM Open browser
start http://localhost:18789

echo.
echo OpenClaw Pro is running!
echo Gateway: http://localhost:18789
echo Enterprise API: http://localhost:19000
echo.
echo To stop: Close this window or use Task Manager
pause
