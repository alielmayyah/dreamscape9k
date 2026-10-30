#!/usr/bin/env python3
"""
Sync Gallery Script
Synchronizes all photos from 'gallery/' into responsive WebP sizes in
'code/public/images/{small,grid,large,full}/' (plus tiny blur placeholders), orders frames newest to oldest,
then commits and pushes to main so GitHub Actions redeploys the site.
"""

import os
import re
import json
import io
import base64
import shutil
import subprocess
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GALLERY_DIR = os.path.join(BASE_DIR, "gallery")
CODE_DIR = os.path.join(BASE_DIR, "code")
IMAGES_DIR = os.path.join(CODE_DIR, "public", "images")
DATA_FILE = os.path.join(CODE_DIR, "src", "data", "artworks.ts")

# One folder per size; None = original width. Sizes wider than the original are skipped.
SIZES = [
    ("small", 640),    # phones / small grid tiles
    ("grid", 1280),    # grid tiles on large or high-DPI screens
    ("large", 1920),   # fullscreen on normal screens
    ("full", None),    # fullscreen on large / retina screens
]
PLACEHOLDER_WIDTH = 24
# Quality 92 keeps fine detail and shadow gradients; 80 visibly smeared them
WEBP_QUALITY = 92

for folder, _ in SIZES:
    os.makedirs(os.path.join(IMAGES_DIR, folder), exist_ok=True)

all_photos = [f for f in os.listdir(GALLERY_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
# Filter duplicates
all_photos = [f for f in all_photos if '9f5c6de1_2K_1_' not in f and '(1)' not in f]

# Newest first, by file modified time
all_photos.sort(key=lambda f: os.path.getmtime(os.path.join(GALLERY_DIR, f)), reverse=True)
print(f"Syncing {len(all_photos)} photos from gallery/ into code...")

def is_fresh(dst, src):
    return os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src)

items = []
written = set()
for i, f in enumerate(all_photos):
    src_path = os.path.join(GALLERY_DIR, f)
    stem = re.sub(r'[^\w\.-]', '_', os.path.splitext(f)[0])

    with Image.open(src_path) as img:
        img = img.convert("RGB")
        w, h = img.size
        ratio = round(w / h, 2)
        aspect = "16:9" if 1.7 <= ratio <= 1.85 else ("9:16" if 0.5 <= ratio <= 0.6 else f"{ratio}:1")

        srcset = []
        for folder, width in SIZES:
            if width is not None and width >= w:
                continue
            width = width or w
            rel = f"{folder}/{stem}.webp"
            dst = os.path.join(IMAGES_DIR, folder, f"{stem}.webp")
            written.add(rel)
            if not is_fresh(dst, src_path):
                resized = img if width == w else img.resize((width, round(h * width / w)), Image.Resampling.LANCZOS)
                resized.save(dst, "WEBP", quality=WEBP_QUALITY, method=6)
            srcset.append((width, f"images/{rel}"))

        # Tiny inline preview shown (blurred) while the real image loads
        tiny = img.resize((PLACEHOLDER_WIDTH, max(1, round(h * PLACEHOLDER_WIDTH / w))), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        tiny.save(buf, "WEBP", quality=40)
        placeholder = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()

    items.append({
        "id": f"frame-{i+1:03d}",
        "title": f"Frame {i+1:03d}",
        "src": srcset[-1][1],
        "srcSet": ", ".join(f"{url} {width}w" for width, url in srcset),
        "placeholder": placeholder,
        "alt": f"Cinematic frame {i+1:03d}",
        "aspectRatio": aspect,
        "width": w,
        "height": h
    })

# Remove images whose source photo is gone
for folder, _ in SIZES:
    for name in os.listdir(os.path.join(IMAGES_DIR, folder)):
        if f"{folder}/{name}" not in written:
            os.remove(os.path.join(IMAGES_DIR, folder, name))

# Old flat layout from before the per-size folders
shutil.rmtree(os.path.join(IMAGES_DIR, "frames"), ignore_errors=True)

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
