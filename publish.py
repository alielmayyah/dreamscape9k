#!/usr/bin/env python3
"""
Minimal Cinematic Image Gallery - Publisher CLI
Allows adding new artwork directly into the clean image grid.
Copies the image, generates WebP thumbnail, calculates aspect ratio,
and updates src/data/artworks.ts.
"""

import os
import re
import shutil
import argparse
import subprocess
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_ARTWORK_DIR = os.path.join(BASE_DIR, "public", "images", "artwork")
PUBLIC_THUMB_DIR = os.path.join(BASE_DIR, "public", "images", "thumbs")
DATA_FILE = os.path.join(BASE_DIR, "src", "data", "artworks.ts")

def sanitize_filename(filename):
    name, ext = os.path.splitext(filename)
    clean_name = re.sub(r'[^\w\.-]', '_', name)
    return clean_name + ext.lower()

def make_thumbnail(src_path, dst_path, max_size=(800, 800)):
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    with Image.open(src_path) as img:
        img = img.convert("RGB")
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        img.save(dst_path, "WEBP", quality=82)

def add_artwork(image_path, title):
    if not os.path.exists(image_path):
        print(f"Error: File '{image_path}' not found.")
        return False

    os.makedirs(PUBLIC_ARTWORK_DIR, exist_ok=True)
    os.makedirs(PUBLIC_THUMB_DIR, exist_ok=True)

    clean_name = sanitize_filename(os.path.basename(image_path))
    dest_artwork = os.path.join(PUBLIC_ARTWORK_DIR, clean_name)
    shutil.copy2(image_path, dest_artwork)

    with Image.open(dest_artwork) as img:
        w, h = img.size
        ratio = round(w / h, 2)
        aspect = "16:9" if 1.7 <= ratio <= 1.85 else f"{ratio}:1"

    thumb_name = os.path.splitext(clean_name)[0] + ".webp"
    dest_thumb = os.path.join(PUBLIC_THUMB_DIR, thumb_name)
    make_thumbnail(dest_artwork, dest_thumb)

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # Count existing frames
    count = len(re.findall(r"id:\s*'frame-", content)) + 1
    frame_id = f"frame-{count:03d}"

    new_entry = f"""  {{
    "id": "{frame_id}",
    "title": "{title}",
    "src": "images/artwork/{clean_name}",
    "thumb": "images/thumbs/{thumb_name}",
    "alt": "{title}",
    "aspectRatio": "{aspect}",
    "width": {w},
    "height": {h}
  }},
];"""

    updated_content = re.sub(r'\];\s*$', new_entry, content.strip())
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        f.write(updated_content + "\n")

    print(f"✓ Added [{frame_id}] '{title}' ({w}x{h}, {aspect})")
    return True

def main():
    parser = argparse.ArgumentParser(description="Add images to the Minimal Cinematic Gallery.")
    parser.add_argument("--image", help="Path to image file")
    parser.add_argument("--title", help="Artwork title")
    parser.add_argument("--build", action="store_true", help="Rebuild production bundle")

    args = parser.parse_args()

    if args.image and args.title:
        success = add_artwork(args.image, args.title)
        if success and args.build:
            subprocess.run(["npm", "run", "build"], cwd=BASE_DIR)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
