#!/usr/bin/env python3
"""
Sync Gallery Script
Synchronizes all photos from 'gallery/' to 'code/public/images/artwork/',
generates WebP thumbnails, and ensures series are placed together sequentially.
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

SERIES_ORDER = [
    # 1. THE HOTEL (TRILOGY) - 3 items
    '01_Hotel_Owner',
    '02_The_Guest',
    '03_The_Keyhole',

    # 2. THE TAXI (TRILOGY) - 3 items
    '01_The_Taxi',
    '02_The_Preparation',
    '03_The_Burial',

    # 3. 4K WIDESCREEN AMERICANA 1 - 3 items
    'diner_wide',
    'gas_station',
    'laundromat',

    # 4. 4K WIDESCREEN AMERICANA 2 - 3 items
    'motel',
    'pier',
    'Empty_motel_room_at_dawn',

    # 5. NIGHT CUSTODIANS - 3 items
    'Cleaner_watches_manta_ray',
    'Cleaner_standing_before_red_screen',
    'Cleaner_standing_in_bank_lobby',

    # 6. PHONE BOOTHS & HIGHWAY - 3 items
    'Giant_man_using_phone_booth',
    'Large_man_using_phone_booth',
    'Vintage_sports_car_on_road',

    # 7. SAXOPHONE ACOUSTICS - 3 items
    'Blind_man_playing_saxophone',
    'Saxophonist_playing_in_flooded_b',
    'Saxophonist_playing_in_empty_the__9a',

    # 8. THEATRE & SURREAL STUDIES - 3 items
    'Saxophonist_playing_in_empty_the__f2',
    'Dentist_examines_crocodile_teeth',
    'Girl_issuing_royal_command',

    # 9. COASTAL & WATERWAYS - 3 items
    'Motorcyclist_standing_on_ferry_deck',
    'Woman_sitting_on_diving_platform',
    'Woman_smoking_on_bridge',

    # 10. VELVET & CRIMSON RITUALS - 3 items
    'Woman_fastening_shoe_on_girl',
    'Woman_blowing_bubblegum_with_sho',
    'Mara_examining_repaired_cloth_ra',
]

all_photos = [f for f in os.listdir(GALLERY_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
# Filter duplicates
all_photos = [f for f in all_photos if '9f5c6de1_2K_1_' not in f and '(1)' not in f]

def get_order_key(filename):
    clean = re.sub(r'[^\w\.-]', '_', filename)
    for idx, prefix in enumerate(SERIES_ORDER):
        if clean.startswith(prefix):
            return (0, idx, filename)
    return (1, 0, filename)

all_photos.sort(key=get_order_key)
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
