#!/usr/bin/env python3
"""
Sync Gallery Script
Synchronizes all photos from 'gallery/' to 'code/public/images/artwork/',
generates WebP thumbnails, orders frames newest to oldest,
then commits and pushes to main so GitHub Actions redeploys the site.
"""

import os
import re
import json
import shutil
import subprocess
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GALLERY_DIR = os.path.join(BASE_DIR, "gallery")
CODE_DIR = os.path.join(BASE_DIR, "code")
PUBLIC_ART = os.path.join(CODE_DIR, "public", "images", "artwork")
PUBLIC_THUMB = os.path.join(CODE_DIR, "public", "images", "thumbs")
DATA_FILE = os.path.join(CODE_DIR, "src", "data", "artworks.ts")

os.makedirs(PUBLIC_ART, exist_ok=True)
os.makedirs(PUBLIC_THUMB, exist_ok=True)

all_photos = [f for f in os.listdir(GALLERY_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
# Filter duplicates
all_photos = [f for f in all_photos if '9f5c6de1_2K_1_' not in f and '(1)' not in f]

# Newest first, by file modified time
all_photos.sort(key=lambda f: os.path.getmtime(os.path.join(GALLERY_DIR, f)), reverse=True)
print(f"Syncing {len(all_photos)} photos from gallery/ into code...")

items = []
for i, f in enumerate(all_photos):
    src_path = os.path.join(GALLERY_DIR, f)
    clean_name = re.sub(r'[^\w\.-]', '_', f)
    dst_art = os.path.join(PUBLIC_ART, clean_name)
    shutil.copy2(src_path, dst_art)

    thumb_name = os.path.splitext(clean_name)[0] + ".webp"
    dst_thumb = os.path.join(PUBLIC_THUMB, thumb_name)

    with Image.open(dst_art) as img:
        w, h = img.size
        ratio = round(w / h, 2)
        aspect = "16:9" if 1.7 <= ratio <= 1.85 else ("9:16" if 0.5 <= ratio <= 0.6 else f"{ratio}:1")

        if not os.path.exists(dst_thumb):
            img_rgb = img.convert("RGB")
            img_thumb = img_rgb.copy()
            img_thumb.thumbnail((800, 800), Image.Resampling.LANCZOS)
            img_thumb.save(dst_thumb, "WEBP", quality=82)

    items.append({
        "id": f"frame-{i+1:03d}",
        "title": f"Frame {i+1:03d}",
        "src": f"images/artwork/{clean_name}",
        "thumb": f"images/thumbs/{thumb_name}",
        "alt": f"Cinematic frame {i+1:03d}",
        "aspectRatio": aspect,
        "width": w,
        "height": h
    })

ts_content = f"""import {{ Artwork }} from '../types/artwork';

export const ARTWORKS_DATA: Artwork[] = {json.dumps(items, indent=2)};
"""

with open(DATA_FILE, "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"[OK] Synchronized {len(items)} frames into {DATA_FILE}")

def deploy():
    def git(*cmd):
        return subprocess.run(["git", *cmd], cwd=BASE_DIR, check=True)

    git("add", "gallery", os.path.join("code", "public", "images"), os.path.join("code", "src", "data", "artworks.ts"))
    # Nothing staged -> nothing to deploy
    if subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=BASE_DIR).returncode == 0:
        print("[OK] No gallery changes to deploy.")
        return
    git("commit", "-m", f"feat: sync gallery ({len(items)} frames)")
    git("push", "origin", "main")
    print("[OK] Pushed to main. GitHub Actions will redeploy the site.")

deploy()
