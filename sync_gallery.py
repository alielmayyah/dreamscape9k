#!/usr/bin/env python3
"""
Sync & Watch Gallery Script
---------------------------
- Synchronizes all photos from 'gallery/' (including project subfolders) into responsive WebP sizes in:
    code/public/images/{small,grid,large,full}/
  plus tiny base64 blur placeholders.
- Supports Projects / Series:
  * Subfolders inside gallery/ are automatically recognized as projects (e.g. gallery/The Hotel/).
  * Common series in root gallery/ are automatically mapped to their respective project.
  * Standalone photos remain single frames.
- Accurately sorts photos by date newest first (combining filename timestamps,
  local file modification times, and git commit history).
- Cleans up and deletes any generated responsive images when a photo is removed from 'gallery/'.
- Generates code/src/data/artworks.ts with ordered artwork and project metadata.
- Commits and pushes to GitHub main branch to trigger GitHub Actions CI/CD redeployment.
- When run with --watch, continuously monitors 'gallery/' for any added, deleted,
  or modified photos/folders, and automatically syncs, commits, and deploys.
"""

import os
import re
import sys
import json
import io
import time
import base64
import shutil
import argparse
import subprocess
from datetime import datetime
from PIL import Image, ImageOps

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GALLERY_DIR = os.path.join(BASE_DIR, "gallery")
CODE_DIR = os.path.join(BASE_DIR, "code")
IMAGES_DIR = os.path.join(CODE_DIR, "public", "images")
DATA_FILE = os.path.join(CODE_DIR, "src", "data", "artworks.ts")

# Responsive sizes: (folder_name, max_width). None = original image width.
SIZES = [
    ("small", 640),    # mobile phones & compact tiles
    ("grid", 1280),    # grid view on high-DPI screens
    ("large", 1920),   # fullscreen on standard screens
    ("full", None),    # uncompressed master / 4K / retina
]
PLACEHOLDER_WIDTH = 24
WEBP_QUALITY = 92
VALID_EXTS = ('.jpg', '.jpeg', '.png', '.webp')


def is_fresh(dst, src):
    """Check if destination file exists and is at least as fresh as source."""
    if not os.path.exists(dst) or os.path.getsize(dst) == 0:
        return False
    # 5-second tolerance handles git checkout filesystem timestamp jitter
    return os.path.getmtime(dst) >= (os.path.getmtime(src) - 5.0)


def get_git_commit_dates():
    """Extract latest git commit timestamps for all files in the repository."""
    try:
        out = subprocess.run(
            ['git', 'log', '--name-only', '--format=COMMIT:%at'],
            cwd=BASE_DIR,
            capture_output=True,
            text=True,
            check=True
        ).stdout
        git_dates = {}
        current_ts = None
        for line in out.splitlines():
            line = line.strip()
            if line.startswith('COMMIT:'):
                current_ts = int(line.split(':')[1])
            elif line and line not in git_dates and current_ts:
                git_dates[line] = current_ts
        return git_dates
    except Exception:
        return {}


def detect_project(rel_path, filename):
    """
    Detect project info for an image:
    1. If inside a subfolder (e.g. gallery/The Hotel/01.jpg) -> project is folder name.
    2. If in root, detect known cinematic series.
    Returns (project_id, project_title) or (None, None).
    """
    parts = os.path.normpath(rel_path).split(os.sep)
    if len(parts) > 1:
        folder = parts[0]
        # Clean folder name (e.g. '01_The_Hotel' -> 'The Hotel')
        clean_title = re.sub(r'^\d+[\W_]+', '', folder).replace('_', ' ').strip()
        slug = re.sub(r'[^\w]+', '-', clean_title.lower()).strip('-')
        return slug, clean_title

    # Fallback pattern detection for loose root files
    lower = filename.lower()
    if any(k in lower for k in ['hotel_owner', 'the_guest', 'the_keyhole']):
        return 'the-hotel', 'The Hotel'
    if any(k in lower for k in ['the_taxi', 'the_preparation', 'the_burial']):
        return 'the-taxi', 'The Taxi'
    if 'saxophone' in lower or 'saxophonist' in lower:
        return 'the-saxophonist', 'The Saxophonist'
    if 'cleaner_' in lower:
        return 'the-cleaner', 'The Cleaner'
    if 'wide_environmental' in lower:
        return 'environmental-studies', 'Environmental Studies'
    if any(k in lower for k in ['diner_wide', 'gas_station', 'laundromat', 'motel.png', 'pier.png']):
        return 'roadside-nocturnes', 'Roadside Nocturnes'
    if 'phone_booth' in lower:
        return 'phone-booth', 'The Phone Booth'

    return None, None


def get_photo_timestamp(filename, filepath, git_dates=None):
    """
    Get the most accurate creation/addition timestamp for a photo (newest first):
    1. Timestamp in filename (e.g. YYYYMMDDHHMMSS)
    2. Local file modification time (if freshly added/modified)
    3. Git commit timestamp (vital for CI environments where mtime is checkout time)
    4. Fallback to file mtime
    """
    m = re.search(r'(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})', filename)
    if m:
        try:
            dt = datetime(
                int(m.group(1)), int(m.group(2)), int(m.group(3)),
                int(m.group(4)), int(m.group(5)), int(m.group(6))
            )
            return dt.timestamp()
        except Exception:
            pass

    mtime = 0
    try:
        mtime = os.path.getmtime(filepath)
    except OSError:
        pass

    git_ts = 0
    if git_dates:
        rel_git = os.path.relpath(filepath, BASE_DIR).replace('\\', '/')
        git_ts = git_dates.get(rel_git, 0)

    if git_ts > 0 and abs(mtime - git_ts) > 60:
        if mtime > git_ts + 60:
            return mtime
        return git_ts

    return mtime or git_ts or 0


def get_gallery_snapshot():
    """Returns a dict of {rel_path: (mtime, size)} for all valid images in GALLERY_DIR recursively."""
    snapshot = {}
    if not os.path.exists(GALLERY_DIR):
        return snapshot
    for root, _, files in os.walk(GALLERY_DIR):
        for fname in files:
            if fname.lower().endswith(VALID_EXTS) and not fname.startswith('.'):
                if '(1)' in fname or ' (2)' in fname:
                    continue
                fpath = os.path.join(root, fname)
                rel_path = os.path.relpath(fpath, GALLERY_DIR)
                try:
                    stat = os.stat(fpath)
                    snapshot[rel_path] = (stat.st_mtime, stat.st_size)
                except OSError:
                    pass
    return snapshot


def discover_photos():
    """Discover all valid photos in gallery/ (including subfolders)."""
    photos = []
    if not os.path.exists(GALLERY_DIR):
        return photos

    for root, _, files in os.walk(GALLERY_DIR):
        for fname in files:
            if fname.lower().endswith(VALID_EXTS) and not fname.startswith('.'):
                if '(1)' in fname or ' (2)' in fname:
                    continue
                full_path = os.path.join(root, fname)
                rel_path = os.path.relpath(full_path, GALLERY_DIR)
                pid, ptitle = detect_project(rel_path, fname)
                photos.append({
                    'filename': fname,
                    'rel_path': rel_path,
                    'full_path': full_path,
                    'project_id': pid,
                    'project_title': ptitle,
                })
    return photos


def sync(push=True):
    """
    Sync all photos from gallery/ into code/public/images and update artworks.ts.
    If push is True, commits changes and pushes to origin/main.
    """
    os.makedirs(GALLERY_DIR, exist_ok=True)
    for folder, _ in SIZES:
        os.makedirs(os.path.join(IMAGES_DIR, folder), exist_ok=True)

    all_photos = discover_photos()
    git_dates = get_git_commit_dates()

    # Calculate frame counts per project
    project_counts = {}
    for p in all_photos:
        if p['project_id']:
            project_counts[p['project_id']] = project_counts.get(p['project_id'], 0) + 1

    # Order newest first based on accurate timestamp (with filename as secondary key for series)
    all_photos.sort(key=lambda p: (-get_photo_timestamp(p['filename'], p['full_path'], git_dates), p['filename']))
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Found {len(all_photos)} photos in gallery/ across {len(project_counts)} projects")

    items = []
    written = set()
    newly_processed = 0

    for i, p in enumerate(all_photos):
        src_path = p['full_path']
        fname = p['filename']
        stem = re.sub(r'[^\w\.-]', '_', os.path.splitext(fname)[0])

        try:
            with Image.open(src_path) as raw_img:
                img = ImageOps.exif_transpose(raw_img).convert("RGB")
                w, h = img.size
                if w == 0 or h == 0:
                    continue
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
                        resized = img if width == w else img.resize(
                            (width, max(1, round(h * width / w))),
                            Image.Resampling.LANCZOS
                        )
                        resized.save(dst, "WEBP", quality=WEBP_QUALITY, method=6)
                        newly_processed += 1

                    srcset.append((width, f"images/{rel}"))

                # Generate tiny base64 placeholder for instant blurred reveal
                tiny = img.resize(
                    (PLACEHOLDER_WIDTH, max(1, round(h * PLACEHOLDER_WIDTH / w))),
                    Image.Resampling.LANCZOS
                )
                buf = io.BytesIO()
                tiny.save(buf, "WEBP", quality=40)
                placeholder = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()

            item_data = {
                "id": f"frame-{i+1:03d}",
                "title": f"Frame {i+1:03d}",
                "src": srcset[-1][1],
                "srcSet": ", ".join(f"{url} {width}w" for width, url in srcset),
                "placeholder": placeholder,
                "alt": f"Cinematic frame {i+1:03d}",
                "aspectRatio": aspect,
                "width": w,
                "height": h
            }

            # Attach project info if this frame belongs to a project/series
            if p['project_id']:
                item_data["project"] = {
                    "id": p['project_id'],
                    "title": p['project_title'],
                    "frameCount": project_counts[p['project_id']]
                }

            items.append(item_data)

        except Exception as e:
            print(f"[WARN] Failed to process photo {fname}: {e}")

    # Remove any generated images whose source photo was deleted from gallery/
    deleted_files = 0
    for folder, _ in SIZES:
        folder_path = os.path.join(IMAGES_DIR, folder)
        if not os.path.exists(folder_path):
            continue
        for name in os.listdir(folder_path):
            rel = f"{folder}/{name}"
            if rel not in written:
                try:
                    os.remove(os.path.join(folder_path, name))
                    deleted_files += 1
                except OSError as e:
                    print(f"[WARN] Could not delete {rel}: {e}")

    # Clean legacy frames directory if present
    shutil.rmtree(os.path.join(IMAGES_DIR, "frames"), ignore_errors=True)

    # Write updated TypeScript data file
    ts_content = f"""import {{ Artwork }} from '../types/artwork';

export const ARTWORKS_DATA: Artwork[] = {json.dumps(items, indent=2)};
"""
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        f.write(ts_content)

    print(f"[OK] Synchronized {len(items)} frames into {DATA_FILE}")
    if newly_processed > 0:
        print(f"[OK] Generated/updated {newly_processed} WebP assets")
    if deleted_files > 0:
        print(f"[OK] Removed {deleted_files} deleted image assets")

    if not push:
        return {"items": len(items), "processed": newly_processed, "deleted": deleted_files}

    # Stage changes in git (includes additions, modifications, and deletions)
    def git(*cmd):
        return subprocess.run(["git", *cmd], cwd=BASE_DIR, check=True, text=True, capture_output=True)

    try:
        git("add", "-A", "gallery", os.path.join("code", "public", "images"), os.path.join("code", "src", "data", "artworks.ts"))

        status_proc = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=BASE_DIR)
        if status_proc.returncode == 0:
            print("[OK] No gallery changes to commit.")
            return {"items": len(items), "committed": False}

        staged_status = subprocess.run(["git", "status", "--porcelain"], cwd=BASE_DIR, capture_output=True, text=True).stdout
        added_count = len([line for line in staged_status.splitlines() if line.startswith("A") or "gallery/" in line and line.startswith("??")])
        deleted_count = len([line for line in staged_status.splitlines() if line.startswith("D")])

        parts = []
        if added_count > 0:
            parts.append(f"+{added_count} added")
        if deleted_count > 0:
            parts.append(f"-{deleted_count} removed")
        details = f" ({', '.join(parts)})" if parts else ""
        commit_msg = f"feat(gallery): auto-sync {len(items)} frames with project metadata{details}"

        git("commit", "-m", commit_msg)
        print(f"[OK] Committed: {commit_msg}")

        try:
            subprocess.run(["git", "pull", "--rebase", "origin", "main"], cwd=BASE_DIR, capture_output=True, text=True)
        except Exception:
            pass

        git("push", "origin", "main")
        print("[OK] Pushed to GitHub 'main'. GitHub Actions CI/CD will redeploy the site.")
        return {"items": len(items), "committed": True}

    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Git operation failed: {e.stderr if hasattr(e, 'stderr') else e}")
        return {"items": len(items), "error": str(e)}


def watch(debounce_delay=2.0):
    """
    Continuously watch the gallery/ folder recursively.
    Whenever a photo is added, removed, or modified, automatically syncs and redeploys.
    """
    print("=" * 64)
    print("       GALLERY AUTO-SYNC & AUTO-DEPLOY WATCHER")
    print("=" * 64)
    print(f"Watching directory: {GALLERY_DIR}")
    print("Any file added, deleted, or replaced will automatically:")
    print("  1. Detect project membership (subfolder or series)")
    print("  2. Sort all pictures by date (newest first)")
    print("  3. Update responsive WebP formats & placeholders")
    print("  4. Remove deleted artworks from the website")
    print("  5. Commit and push changes to GitHub")
    print("  6. Trigger GitHub Actions CI/CD to redeploy!")
    print("=" * 64)

    print("\n[INFO] Running initial sync...")
    sync(push=True)
    last_snapshot = get_gallery_snapshot()
    print("\n[READY] Watching for gallery changes (Press Ctrl+C to stop)...\n")

    while True:
        try:
            time.sleep(1.0)
            current_snapshot = get_gallery_snapshot()

            if current_snapshot != last_snapshot:
                added = set(current_snapshot.keys()) - set(last_snapshot.keys())
                removed = set(last_snapshot.keys()) - set(current_snapshot.keys())
                modified = {
                    k for k in current_snapshot.keys() & last_snapshot.keys()
                    if current_snapshot[k] != last_snapshot[k]
                }

                change_desc = []
                if added:
                    preview = ', '.join(list(added)[:2]) + ('...' if len(added) > 2 else '')
                    change_desc.append(f"+{len(added)} added ({preview})")
                if removed:
                    preview = ', '.join(list(removed)[:2]) + ('...' if len(removed) > 2 else '')
                    change_desc.append(f"-{len(removed)} deleted ({preview})")
                if modified:
                    preview = ', '.join(list(modified)[:2]) + ('...' if len(modified) > 2 else '')
                    change_desc.append(f"~{len(modified)} modified ({preview})")

                print(f"[{datetime.now().strftime('%H:%M:%S')}] Detected gallery change: {', '.join(change_desc)}")
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Debouncing ({debounce_delay}s) for writes to complete...")

                while True:
                    time.sleep(debounce_delay)
                    latest_snapshot = get_gallery_snapshot()
                    if latest_snapshot == current_snapshot:
                        break
                    current_snapshot = latest_snapshot

                all_readable = True
                for rel_path in added | modified:
                    fpath = os.path.join(GALLERY_DIR, rel_path)
                    try:
                        with Image.open(fpath) as test_img:
                            test_img.verify()
                    except Exception:
                        all_readable = False
                        break

                if not all_readable:
                    time.sleep(1.0)

                print(f"[{datetime.now().strftime('%H:%M:%S')}] Syncing and redeploying...")
                sync(push=True)
                last_snapshot = get_gallery_snapshot()
                print(f"[{datetime.now().strftime('%H:%M:%S')}] [READY] Waiting for next change...\n")

        except KeyboardInterrupt:
            print("\n[STOP] Watcher stopped.")
            break
        except Exception as e:
            print(f"[ERROR] Unexpected watcher error: {e}")
            time.sleep(2.0)


def main():
    parser = argparse.ArgumentParser(description="Synchronize gallery photos with web app and deploy.")
    parser.add_argument("--watch", "-w", action="store_true", help="Watch gallery folder continuously for changes")
    parser.add_argument("--no-push", "-n", action="store_true", help="Sync assets without committing or pushing")
    parser.add_argument("--debounce", "-d", type=float, default=2.0, help="Debounce seconds for watcher (default: 2.0)")
    args = parser.parse_args()

    if args.watch:
        watch(debounce_delay=args.debounce)
    else:
        sync(push=not args.no_push)


if __name__ == "__main__":
    main()
