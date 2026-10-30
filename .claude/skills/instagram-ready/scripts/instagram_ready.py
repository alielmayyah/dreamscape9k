#!/usr/bin/env python3
"""Compose existing panels into HOTEL-style Instagram post and Story layouts."""

from __future__ import annotations

import argparse
from io import BytesIO
import json
import math
from pathlib import Path
import re
import sys

try:
    from PIL import Image, ImageCms, ImageColor, ImageOps
except ImportError:
    raise SystemExit("Pillow is required. Install it with: python -m pip install Pillow")


LAYOUTS = {
    "post": {"size": (1080, 1350), "area": (12, 12, 1068, 1338), "gap": 12, "label": "Grid"},
    "story": {"size": (1080, 1920), "area": (12, 150, 1068, 1770), "gap": 18, "label": "Story"},
}
SRGB = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB"))


def panel_boxes(count: int, columns: int, layout: dict) -> list[tuple[int, int, int, int]]:
    if count < 1 or columns < 1 or columns > count:
        raise ValueError("Provide at least one panel and a column count from 1 to the panel count.")
    rows = math.ceil(count / columns)
    left, top, right, bottom = layout["area"]
    gap = layout["gap"]
    width = right - left - gap * (columns - 1)
    height = bottom - top - gap * (rows - 1)
    if width < columns or height < rows:
        raise ValueError("Too many panels for this canvas and gutter size.")
    boxes = []
    for index in range(count):
        row, col = divmod(index, columns)
        x0 = left + width * col // columns + gap * col
        y0 = top + height * row // rows + gap * row
        x1 = left + width * (col + 1) // columns + gap * col
        y1 = top + height * (row + 1) // rows + gap * row
        boxes.append((x0, y0, x1, y1))
    return boxes


def load_panel(entry: dict, base: Path, background: tuple) -> tuple[Image.Image, dict]:
    if not isinstance(entry, dict) or not isinstance(entry.get("path"), str):
        raise ValueError("Each panel needs a string 'path'.")
    path = (base / entry["path"]).resolve()
    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source)
        original_size = image.size
        profile = image.info.get("icc_profile")
        has_alpha = "A" in image.getbands() or "transparency" in image.info
        alpha = image.convert("RGBA").getchannel("A") if has_alpha else None
        if profile:
            input_profile = ImageCms.ImageCmsProfile(BytesIO(profile))
            color_image = image if image.mode in ("RGB", "CMYK", "L") else image.convert("RGB")
            image = ImageCms.profileToProfile(color_image, input_profile, SRGB, outputMode="RGB")
        else:
            image = image.convert("RGB")
        if alpha is not None:
            flattened = Image.new("RGB", image.size, background)
            flattened.paste(image, (0, 0), alpha)
            image = flattened
        image.load()
    box = entry.get("box")
    if box is not None:
        if not isinstance(box, list) or len(box) != 4 or any(type(n) is not int for n in box):
            raise ValueError("Panel 'box' must contain four integer pixel coordinates.")
        l, t, r, b = box
        if not (0 <= l < r <= image.width and 0 <= t < b <= image.height):
            raise ValueError(f"Panel crop box is outside the oriented image: {path}")
        image = image.crop(tuple(box))
    return image, {"path": str(path), "oriented_size": list(original_size), "source_box": box,
                   "color_input": "embedded ICC converted to sRGB" if profile else "untagged assumed sRGB"}


def settings(entry: dict, target: str, default_fit: str) -> tuple[str, tuple[float, float]]:
    overrides = entry.get("formats", {})
    if not isinstance(overrides, dict) or not isinstance(overrides.get(target, {}), dict):
        raise ValueError("Panel 'formats' must map output names to settings objects.")
    options = {**entry, **overrides.get(target, {})}
    fit = options.get("fit", default_fit)
    align = options.get("align", [0.5, 0.5])
    if fit not in ("cover", "contain"):
        raise ValueError("Panel fit must be 'cover' or 'contain'.")
    if (not isinstance(align, (list, tuple)) or len(align) != 2
            or any(type(n) not in (int, float) or not math.isfinite(n) or not 0 <= n <= 1 for n in align)):
        raise ValueError("Panel alignment needs two finite numbers between 0 and 1.")
    return fit, tuple(align)


def render_panel(image: Image.Image, size: tuple[int, int], fit: str,
                 align: tuple[float, float], background: tuple) -> tuple[Image.Image, dict]:
    w, h = image.size
    tw, th = size
    if fit == "contain":
        scale = min(tw / w, th / h)
        scaled_size = (max(1, min(tw, round(w * scale))), max(1, min(th, round(h * scale))))
        fitted = image.resize(scaled_size, Image.Resampling.LANCZOS)
        result = Image.new("RGB", size, background)
        result.paste(fitted, ((tw - fitted.width) // 2, (th - fitted.height) // 2))
        crop = (0, 0, w, h)
    else:
        scale = max(tw / w, th / h)
        cw, ch = tw / scale, th / scale
        l, t = (w - cw) * align[0], (h - ch) * align[1]
        crop = (l, t, min(w, l + cw), min(h, t + ch))
        result = image.resize(size, Image.Resampling.LANCZOS, box=crop)
    return result, {"fit": fit, "align": list(align), "crop_in_panel": [round(n, 3) for n in crop],
                    "upscaled": scale > 1.000001}


def export(args: argparse.Namespace) -> dict:
    background = ImageColor.getrgb(args.background)
    if len(background) != 3:
        raise ValueError("Choose an opaque RGB background color.")
    if args.manifest:
        if args.inputs:
            raise ValueError("Use positional input images or --manifest, not both.")
        manifest = args.manifest.resolve()
        data = json.loads(manifest.read_text(encoding="utf-8-sig"))
        entries = data.get("panels") if isinstance(data, dict) else None
        base = manifest.parent
    else:
        entries = [{"path": path} for path in args.inputs]
        base = Path.cwd()
    if not isinstance(entries, list) or not entries:
        raise ValueError("Provide input images or a manifest with a nonempty 'panels' array.")
    targets = list(dict.fromkeys(args.formats))
    loaded = [load_panel(entry, base, background) for entry in entries]
    # Validate every layout and override before creating any output files.
    boxes_by_target = {target: panel_boxes(len(entries), args.columns, LAYOUTS[target]) for target in targets}
    options = {target: [settings(entry, target, args.fit) for entry in entries] for target in targets}
    name = args.name.strip()
    if not name or re.search(r'[<>:"/\\|?*\x00-\x1f]', name) or name.endswith((".", " ")):
        raise ValueError("--name must be a nonempty filename stem without path separators.")
    output_dir = args.out_dir.resolve()
    suffix = ".jpg" if args.file_type == "jpg" else ".png"
    version = 1
    while True:
        stem = name if version == 1 else f"{name}_v{version}"
        paths = {target: output_dir / f"{stem}_Instagram_{LAYOUTS[target]['label']}_{LAYOUTS[target]['size'][0]}x{LAYOUTS[target]['size'][1]}{suffix}" for target in targets}
        report_path = output_dir / f"{stem}_Instagram_layout.json"
        if not any(path.exists() for path in [*paths.values(), report_path]):
            break
        version += 1
    output_dir.mkdir(parents=True, exist_ok=True)
    report = {"name": name, "background": args.background, "columns": args.columns,
              "sources": [metadata for _, metadata in loaded], "outputs": {}}
    for target in targets:
        layout = LAYOUTS[target]
        canvas = Image.new("RGB", layout["size"], background)
        records = []
        for (image, _), box, (fit, align) in zip(loaded, boxes_by_target[target], options[target]):
            l, t, r, b = box
            panel, detail = render_panel(image, (r - l, b - t), fit, align, background)
            canvas.paste(panel, (l, t))
            records.append({"destination_box": list(box), **detail})
        save_options = {"icc_profile": SRGB.tobytes()}
        if args.file_type == "jpg":
            save_options.update(quality=95, subsampling=0, optimize=True)
        with paths[target].open("xb") as output:
            canvas.save(output, format="JPEG" if args.file_type == "jpg" else "PNG", **save_options)
        report["outputs"][target] = {"path": str(paths[target]), "size": list(canvas.size), "panels": records}
    with report_path.open("x", encoding="utf-8") as output:
        json.dump(report, output, indent=2, ensure_ascii=False)
        output.write("\n")
    return {"outputs": {target: str(path) for target, path in paths.items()}, "layout_report": str(report_path)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("inputs", nargs="*", help="Original images in desired reading order")
    parser.add_argument("--manifest", type=Path, help="JSON panel sources, extraction boxes, and crop settings")
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--name", default="InstagramReady")
    parser.add_argument("--formats", nargs="+", choices=tuple(LAYOUTS), default=["post", "story"])
    parser.add_argument("--fit", choices=("cover", "contain"), default="cover")
    parser.add_argument("--columns", type=int, default=1)
    parser.add_argument("--background", default="#000000")
    parser.add_argument("--file-type", choices=("jpg", "png"), default="jpg")
    args = parser.parse_args()
    try:
        print(json.dumps(export(args), indent=2))
        return 0
    except (OSError, ValueError, TypeError, ImageCms.PyCMSError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
