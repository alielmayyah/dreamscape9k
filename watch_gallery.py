#!/usr/bin/env python3
"""
Gallery Live Watcher
--------------------
Run this script to watch the 'gallery/' folder in real time.
Any photos added, deleted, or updated will automatically:
1. Generate responsive WebP images & blur placeholders.
2. Clean up deleted images from the web app.
3. Commit and push changes to GitHub main branch.
4. Trigger GitHub Actions CI/CD to redeploy the live website!
"""

from sync_gallery import watch

if __name__ == "__main__":
    watch()
