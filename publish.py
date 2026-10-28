#!/usr/bin/env python3
"""
Cinematic Artwork Archive - Asset & Metadata Publisher CLI
Allows adding single frames or narrative sequences to the React/Vite archive.
Automatically copies full-res artwork, creates optimized WebP thumbnails,
computes aspect ratios, and appends typed entries to src/data/artworks.ts.
"""

import os
import sys
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

def get_aspect_ratio_label(width, height):
    ratio = width / height
    if 1.7 <= ratio <= 1.85:
        return "16:9"
    elif ratio >= 2.0:
        return "2.35:1"
    elif 0.52 <= ratio <= 0.6:
        return "9:16"
    elif 0.75 <= ratio <= 0.85:
        return "4:5"
    elif 0.95 <= ratio <= 1.05:
        return "1:1"
    elif ratio > 1:
        return f"{ratio:.2f}:1"
    else:
        return f"1:{1/ratio:.2f}"

def make_thumbnail(src_path, dst_path, max_size=(800, 800)):
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    with Image.open(src_path) as img:
        img = img.convert("RGB")
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        img.save(dst_path, "WEBP", quality=82)

def add_artwork_entry(image_path, title, category="nocturne", layout="standard", description="", collection="New Acquisitions"):
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
        aspect = get_aspect_ratio_label(w, h)
        res_label = "4K Cinema" if w >= 3840 else ("2K Vertical" if h > w else "2K Cinema")

    thumb_name = os.path.splitext(clean_name)[0] + ".webp"
    dest_thumb = os.path.join(PUBLIC_THUMB_DIR, thumb_name)
    make_thumbnail(dest_artwork, dest_thumb)

    # Read current artworks.ts
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the sequence count
    sequences = re.findall(r"sequenceNumber:\s*'(\d+)'", content)
    next_seq = str(len(sequences) + 1).padStart(3, '0') if hasattr(str, 'padStart') else f"{len(sequences) + 1:03d}"
    frame_id = f"frame-{next_seq}"

    new_entry = f"""  {{
    id: '{frame_id}',
    sequenceNumber: '{next_seq}',
    title: {repr(title)},
    src: 'images/artwork/{clean_name}',
    thumb: 'images/thumbs/{thumb_name}',
    alt: {repr(description or title)},
    aspectRatio: {repr(aspect)},
    category: {repr(category)},
    description: {repr(description)},
    collection: {repr(collection)},
    year: 2026,
    layout: {repr(layout)},
    width: {w},
    height: {h},
    resolutionLabel: {repr(res_label)}
  }},
];"""

    updated_content = re.sub(r'\];\s*$', new_entry, content.strip())
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        f.write(updated_content + "\n")

    print(f"✓ Added [{next_seq}] '{title}' ({aspect}, {w}x{h}) to {category}.")
    return True

def main():
    parser = argparse.ArgumentParser(description="Publish artworks to the Cinematic Archive.")
    parser.add_argument("--image", help="Image file path")
    parser.add_argument("--title", help="Artwork title")
    parser.add_argument("--category", default="nocturne", choices=["all", "series", "nocturne", "surreal", "vertical"])
    parser.add_argument("--layout", default="standard", choices=["panoramic", "wide", "standard", "tall", "half"])
    parser.add_argument("--desc", default="", help="Description")
    parser.add_argument("--collection", default="Exhibition Series", help="Collection name")
    parser.add_argument("--build", action="store_true", help="Run npm run build after adding")

    args = parser.parse_args()

    if args.image and args.title:
        success = add_artwork_entry(args.image, args.title, args.category, args.layout, args.desc, args.collection)
        if success and args.build:
            subprocess.run(["npm", "run", "build"], cwd=BASE_DIR)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
