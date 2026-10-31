@echo off
title Gallery Auto-Deploy Watcher
color 0A
echo ================================================================
echo           GALLERY AUTO-SYNC & AUTO-DEPLOY WATCHER
echo ================================================================
echo   Watching folder: gallery\
echo   Any photo added, deleted, or updated will automatically:
echo   - Generate responsive WebP sizes & blur placeholders
echo   - Remove deleted photos from website
echo   - Commit and push to GitHub (main)
echo   - Trigger GitHub Actions CI/CD to redeploy
echo ================================================================
echo.

cd /d "%~dp0"
python "%~dp0sync_gallery.py" --watch

pause
