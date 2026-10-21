@echo off
rem Starts a local web server for this site and opens it in your browser.
rem Double-click this file. Close the window (or press Ctrl+C) to stop the server.
cd /d "%~dp0"
set PORT=8000

where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:%PORT%/"
  py -m http.server %PORT%
  goto end
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:%PORT%/"
  python -m http.server %PORT%
  goto end
)

echo Python was not found on this computer.
echo Install it from https://www.python.org/downloads/ (tick "Add python.exe to PATH"),
echo then double-click this file again.

:end
pause
