#!/usr/bin/env python3
"""
Cinematic Portfolio Publisher CLI
Allows you to post single frames or multi-act story series via script or CLI.
Automatically generates WebP thumbnails, detects aspect ratios, updates gallery.json,
and triggers GitHub CI/CD deployment.
"""

import os
import sys
import json
import shutil
import re
import argparse
import subprocess
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "gallery.json")
IMAGES_DIR = os.path.join(BASE_DIR, "images")
THUMBS_DIR = os.path.join(IMAGES_DIR, "thumbs")

def sanitize_filename(filename):
    name, ext = os.path.splitext(filename)
    clean_name = re.sub(r'[^\w\.-]', '_', name)
    return clean_name + ext.lower()

def get_aspect_ratio_label(width, height):
    ratio = width / height
    if 1.7 <= ratio <= 1.85:
        return "16:9"
    elif ratio >= 2.0:
        return "2.39:1"
    elif 0.52 <= ratio <= 0.6:
        return "9:16"
    elif 0.75 <= ratio <= 0.85:
        return "4:5"
    elif 0.95 <= ratio <= 1.05:
        return "1:1"
    elif ratio > 1:
        return f"{ratio:.1f}:1"
    else:
        return f"1:{1/ratio:.1f}"

def make_thumbnail(src_path, dst_path, max_size=(800, 800)):
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    with Image.open(src_path) as img:
        img = img.convert("RGB")
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        img.save(dst_path, "WEBP", quality=82)

def load_gallery():
    if not os.path.exists(DATA_FILE):
        return {"portfolio": {"name": "Cinematic Stills", "categories": []}, "items": []}
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_gallery(data):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def git_commit_and_push(message):
    try:
        subprocess.run(["git", "add", "images", "data"], cwd=BASE_DIR, check=True)
        subprocess.run(["git", "commit", "-m", message], cwd=BASE_DIR, check=True)
        print("Committing changes...")
        res = subprocess.run(["git", "push", "origin", "main"], cwd=BASE_DIR, capture_output=True, text=True)
        if res.returncode == 0:
            print("Successfully pushed to GitHub! CI/CD deployment started.")
        else:
            print(f"Git push output: {res.stderr.strip() or res.stdout.strip()}")
            print("(Make sure your GitHub remote 'origin' is configured and branch is 'main')")
    except Exception as e:
        print(f"Notice: Git auto-push skipped ({e}). You can push manually using 'git push'.")

def post_single(image_path, title, category="atmosphere", subtitle="", description="", push=False):
    if not os.path.exists(image_path):
        print(f"Error: File '{image_path}' not found.")
        return False

    os.makedirs(IMAGES_DIR, exist_ok=True)
    clean_name = sanitize_filename(os.path.basename(image_path))
    dest_image = os.path.join(IMAGES_DIR, clean_name)
    
    if os.path.abspath(image_path) != os.path.abspath(dest_image):
        shutil.copy2(image_path, dest_image)

    with Image.open(dest_image) as img:
        width, height = img.size
        aspect = get_aspect_ratio_label(width, height)

    thumb_name = os.path.splitext(clean_name)[0] + ".webp"
    dest_thumb = os.path.join(THUMBS_DIR, thumb_name)
    make_thumbnail(dest_image, dest_thumb)

    data = load_gallery()
    item_id = re.sub(r'\W+', '-', title.lower()).strip('-')

    new_item = {
        "id": item_id,
        "type": "single",
        "title": title,
        "subtitle": subtitle or f"{aspect} Still",
        "category": category,
        "image": f"images/{clean_name}",
        "thumb": f"images/thumbs/{thumb_name}",
        "aspect": aspect,
        "description": description
    }

    # Prepend new item to the top of the gallery
    data["items"].insert(0, new_item)
    save_gallery(data)

    print(f"✓ Posted: '{title}' ({aspect}) to category '{category}'")

    if push:
        git_commit_and_push(f"Add new still: {title}")
    return True

def post_series(series_title, image_paths, act_titles=None, category="series", subtitle="A Multi-Act Narrative", description="", push=False):
    if not image_paths:
        print("Error: No images provided for series.")
        return False

    os.makedirs(IMAGES_DIR, exist_ok=True)
    episodes = []

    for i, path in enumerate(image_paths):
        if not os.path.exists(path):
            print(f"Error: File '{path}' not found.")
            return False

        clean_name = sanitize_filename(os.path.basename(path))
        dest_image = os.path.join(IMAGES_DIR, clean_name)
        if os.path.abspath(path) != os.path.abspath(dest_image):
            shutil.copy2(path, dest_image)

        with Image.open(dest_image) as img:
            width, height = img.size
            aspect = get_aspect_ratio_label(width, height)

        thumb_name = os.path.splitext(clean_name)[0] + ".webp"
        dest_thumb = os.path.join(THUMBS_DIR, thumb_name)
        make_thumbnail(dest_image, dest_thumb)

        act_label = f"Act {['I', 'II', 'III', 'IV', 'V', 'VI'][i] if i < 6 else i+1}"
        title = act_titles[i] if (act_titles and i < len(act_titles)) else f"Scene {i+1}"

        episodes.append({
            "act": act_label,
            "title": title,
            "image": f"images/{clean_name}",
            "thumb": f"images/thumbs/{thumb_name}",
            "aspect": aspect,
            "caption": f"{act_label}: {title}"
        })

    data = load_gallery()
    series_id = "series-" + re.sub(r'\W+', '-', series_title.lower()).strip('-')

    new_series = {
        "id": series_id,
        "type": "series",
        "title": series_title,
        "subtitle": subtitle,
        "category": category,
        "description": description,
        "cover": episodes[0]["image"],
        "cover_thumb": episodes[0]["thumb"],
        "episodes": episodes
    }

    # Prepend new series to the top
    data["items"].insert(0, new_series)
    save_gallery(data)

    print(f"✓ Posted Series: '{series_title}' with {len(episodes)} acts.")

    if push:
        git_commit_and_push(f"Add new series: {series_title}")
    return True

def interactive_mode():
    print("\n" + "="*45)
    print("   CINEMATIC PORTFOLIO PUBLISHER")
    print("="*45)
    print("1. Post a Single Frame")
    print("2. Post a Multi-Act Story Series")
    print("3. Push all changes to GitHub CI/CD")
    print("4. Exit")
    choice = input("\nSelect an option [1-4]: ").strip()

    if choice == "1":
        path = input("Image file path: ").strip().strip('"')
        title = input("Title: ").strip()
        cat = input("Category [atmosphere / surreal / portraits / series] (default: atmosphere): ").strip() or "atmosphere"
        desc = input("Description: ").strip()
        push = input("Push to GitHub now? (y/n): ").strip().lower() == "y"
        post_single(path, title, category=cat, description=desc, push=push)
    elif choice == "2":
        title = input("Series title: ").strip()
        paths = input("Image file paths (comma-separated): ").strip()
        img_list = [p.strip().strip('"') for p in paths.split(",") if p.strip()]
        acts = input("Act titles (comma-separated, optional): ").strip()
        act_list = [a.strip() for a in acts.split(",") if a.strip()] if acts else None
        desc = input("Series synopsis: ").strip()
        push = input("Push to GitHub now? (y/n): ").strip().lower() == "y"
        post_series(title, img_list, act_titles=act_list, description=desc, push=push)
    elif choice == "3":
        git_commit_and_push("Update portfolio gallery")
    else:
        print("Goodbye!")

def main():
    parser = argparse.ArgumentParser(description="Publish stills and series to your portfolio.")
    parser.add_argument("--image", help="Path to single image file")
    parser.add_argument("--title", help="Title of the image or series")
    parser.add_argument("--category", default="atmosphere", help="Category (atmosphere, surreal, portraits, series)")
    parser.add_argument("--desc", default="", help="Description/synopsis")
    parser.add_argument("--series", action="store_true", help="Post as a multi-act series")
    parser.add_argument("--images", nargs="+", help="Multiple image paths for a series")
    parser.add_argument("--acts", nargs="+", help="Act titles for series episodes")
    parser.add_argument("--push", action="store_true", help="Automatically git commit and push to GitHub")

    args = parser.parse_args()

    if args.series:
        if not args.title or not args.images:
            print("Error: --series requires --title and --images")
            sys.exit(1)
        post_series(args.title, args.images, act_titles=args.acts, category=args.category, description=args.desc, push=args.push)
    elif args.image:
        if not args.title:
            print("Error: --image requires --title")
            sys.exit(1)
        post_single(args.image, args.title, category=args.category, description=args.desc, push=args.push)
    else:
        interactive_mode()

if __name__ == "__main__":
    main()
