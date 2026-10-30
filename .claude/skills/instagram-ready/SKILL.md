---
name: instagram-ready
description: "Prepare cinematic stills, contact sheets, and image grids for Instagram feed posts and Stories. Use for 'Instagram ready', 'adjust the grid', or post/Story resizing requests, especially layouts matching the HOTEL examples. Recompose panels while preserving their order, aspect ratios, subjects, and existing grade."
---

# Instagram Ready

Turn existing images into finished Instagram layouts. The reference treatment is the HOTEL three-frame film strip (`gallery/01_Hotel_Owner.jpg`, `02_The_Guest.jpg`, `03_The_Keyhole.jpg`). Read [the HOTEL observations](references/hotel-reference.md) when matching that treatment; its palette and story are examples, not requirements for other projects.

## Choose and inspect the inputs

- Prefer the original numbered stills over an already compressed composite. Preserve the user's sequence; for HOTEL it is Owner, Guest, Keyhole. Exclude existing `_Instagram_` exports from source lists.
- Inspect each still and the existing grid before composing. Note faces, hands, props, text, and deliberate framing that cropping must retain. In HOTEL the keyhole silhouette is part of the composition.
- If only a grid is available, identify its panel rectangles and gutters, extract each panel, then rebuild the new layout. Do not crop or stretch the entire grid into a taller canvas. A crop already baked into the only available grid cannot recover the original scene.
- Here, 'grid' defaults to one image containing multiple panels. Only split artwork across profile tiles or make a carousel if the user requests that delivery.

## Layout defaults learned from HOTEL

When the user asks for both post and Story, or says 'Instagram ready' without choosing a format, export both:

| Output | Canvas | Three-panel geometry |
| --- | --- | --- |
| Feed post | 1080 × 1350, 4:5 | Black background, 12 px outer margins, 12 px gutters, three 1056 × 434 panels |
| Story | 1080 × 1920, 9:16 | Black background, 12 px side margins, 150 px top/bottom breathing room, 18 px gutters, three 1056 × 528 panels |

These reproduce the supplied examples; they are project defaults, not a claim that Instagram accepts only these sizes. Honor a different requested size or arrangement. The helper also supports other panel counts and column counts.

Rebuild each format from the original panels. The Story shows more vertical scene information than the post: do not upscale the finished post onto a Story canvas when originals are available.

- Preserve image proportions with a uniform scale. Use the saved HOTEL manifest for this example; it records different crop alignments for the post and Story. For new images, start with a centered fill crop, then adjust each panel after viewing it. Use `contain` with black space if a fill crop would remove an important subject or the user wants the whole frame.
- Keep the existing lighting, color grade, texture, and identity. Add titles, labels, logos, or a new grade only when requested. Layout work does not need generative repainting; use an image-generation/editing tool if the user also asks for a creative change to the images themselves.
- For Stories, keep essential copy and logos away from interface edges. A useful project allowance is 250 px at top and bottom and 64 px at either side; this is a design allowance, not an official universal safe zone. Inspect faces and key details near those edges. Ads, stickers, and other overlays may need more room.
- Treat profile-preview cropping as a separate check from feed export sizing. Verify the current preview if the user asks for profile-grid alignment.

## Produce files

Use the bundled deterministic compositor for unchanged source images. It requires Python and Pillow (`python -m pip install Pillow` if unavailable). Paths in this skill are relative to this folder; source paths passed on the command line are relative to the shell's working directory.

From the repository root, the HOTEL example is:

```powershell
python ".\.claude\skills\instagram-ready\scripts\instagram_ready.py" `
  --manifest ".\.claude\skills\instagram-ready\references\hotel-panels.json" `
  --name HOTEL --out-dir ".\instagram\HOTEL"
```

The [HOTEL manifest](references/hotel-panels.json) reproduces the measured crop choices as well as the layout. For other images, replace `--manifest ...` with the source paths in order. The helper creates both sizes and a layout report. Choose one with `--formats post` or `--formats story`; retain full frames with `--fit contain`; request PNG with `--file-type png`. A panel's explicit manifest settings override the command-line default fit. Existing filenames get a shared `_v2`, `_v3`, etc. suffix. Originals are never overwritten. Default output is high-quality JPEG with an embedded sRGB profile and corrected EXIF orientation.

For panel extraction, individual crop alignments, or different behavior between post and Story, use a manifest instead of positional inputs:

```json
{
  "panels": [
    {
      "path": "../../gallery/01_Hotel_Owner.jpg",
      "align": [0.5, 0.5],
      "formats": {"post": {"align": [0.5, 0.35]}, "story": {"fit": "contain"}}
    }
  ]
}
```

Manifest paths are relative to the manifest file, not this skill. `align` ranges from 0 to 1: 0 retains the left/top edge, 1 retains the right/bottom edge, and 0.5 centers the crop; it is not automatic face detection. An optional `box: [left, top, right, bottom]` extracts a panel in pixels after EXIF orientation; right/bottom are exclusive. To rebuild an existing grid, repeat its source path with one `box` per panel, in reading order. Use `--manifest path.json --out-dir output-folder --name PROJECT`. Set `--columns` only when the intended grid has multiple columns.

Save deliverables in the user's requested folder, otherwise `instagram/<PROJECT>/` at the repository root. Source stills stay in the flat `gallery/` folder, which also feeds the website; never write exports into `gallery/`, or they would be published as frames. Keep layout manifests beside the exports; from `instagram/<PROJECT>/`, paths such as `../../gallery/01_Hotel_Owner.jpg` resolve to the originals. Return clickable links to the finished post and Story.

## Verify before delivery

Open both final outputs. Check panel count and order, consistent gutters, undistorted faces, preserved hands/props/text, the keyhole when relevant, and Story interface clearance. Inspect post and Story independently. Confirm exact pixel dimensions and RGB/sRGB export; the layout report records crop rectangles and any upscaling. Adjust crop alignment or use `contain` when a detail is cut off. A correct canvas size alone is not enough to call a layout ready.
