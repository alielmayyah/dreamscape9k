#!/usr/bin/env python3
"""
Sync Gallery Script
Reads all photos from the 'gallery/' folder, generates WebP thumbnails in
'code/public/images/thumbs/', copies full-res artwork to 'code/public/images/artwork/',
and regenerates 'code/src/data/artworks.ts'.
"""

import os
import re
import json
import shutil
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GALLERY_DIR = os.path.join(BASE_DIR, "gallery")
CODE_DIR = os.path.join(BASE_DIR, "code")
PUBLIC_ART = os.path.join(CODE_DIR, "public", "images", "artwork")
PUBLIC_THUMB = os.path.join(CODE_DIR, "public", "images", "thumbs")
DATA_FILE = os.path.join(CODE_DIR, "src", "data", "artworks.ts")

os.makedirs(PUBLIC_ART, exist_ok=True)
os.makedirs(PUBLIC_THUMB, exist_ok=True)

photos = sorted([f for f in os.listdir(GALLERY_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])
print(f"Found {len(photos)} photos in gallery/")

items = []
seen_hashes = set()

for f in photos:
    # Skip duplicates
    if '9f5c6de1_2K_1_' in f:
        continue

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
            img_rgb.thumbnail((800, 800), Image.Resampling.LANCZOS)
            img_rgb.save(dst_thumb, "WEBP", quality=82)

    title = clean_name.replace('_', ' ').replace('.jpg', '').replace('.png', '').replace('.webp', '')
    title = re.sub(r'\s+[0-9a-f]{8}\s+2K.*$', '', title, flags=re.IGNORECASE).strip()

    items.append({
        "id": f"frame-{len(items)+1:03d}",
        "title": title,
        "src": f"images/artwork/{clean_name}",
        "thumb": f"images/thumbs/{thumb_name}",
        "alt": title,
        "aspectRatio": aspect,
        "width": w,
        "height": h
    })

ts_content = f"""import {{ Artwork }} from '../types/artwork';

export const ARTWORKS_DATA: Artwork[] = {json.dumps(items, indent=2)};
"""

with open(DATA_FILE, "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"✓ Synchronized {len(items)} artworks into {DATA_FILE}")
