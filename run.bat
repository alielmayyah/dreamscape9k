@echo off
title Minimal Cinematic Gallery
echo ================================================================
echo   MINIMAL CINEMATIC GALLERY
echo   1. Starting Gallery Auto-Sync Watcher in background...
echo   2. Starting Local Development Server on port 5173...
echo ================================================================
echo.

:: Launch gallery auto-sync watcher in a separate window
start "Gallery Auto-Deploy Watcher" python "%~dp0sync_gallery.py" --watch

:: Launch Vite local dev server in foreground
cd /d "%~dp0code"
npm run dev -- --host 127.0.0.1 --port 5173
