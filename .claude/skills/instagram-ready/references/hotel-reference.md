# HOTEL reference observations

Inspected all five HOTEL JPEGs on 2026-10-28, including the original stills and both finished layouts. The original stills now live in the flat `gallery/` folder; finished layouts go in `instagram/HOTEL/`. These notes preserve what was observed; they are not a definition of every Soul Cinema image.

## Images and sequence

1. `01_Hotel_Owner.jpg`, 2752 × 1536: a lone owner behind a wooden reception desk, ledger open, green banker lamp, animal trophies above him. A centered, nearly symmetrical establishing composition.
2. `02_The_Guest.jpg`, 2752 × 1536: a guest in a tan coat speaks with the same owner, viewed through a rain-covered window. Their eye line, the open ledger, and the suitcase carry the narrative.
3. `03_The_Keyhole.jpg`, 2752 × 1536: the owner opens a door, seen through a large dark keyhole. Retain the silhouette, face, hand, key, and door relationship.

The sequence establishes the place, introduces the encounter, then ends on a private, unsettling detail. Preserve that order when adapting the example.

## Visual treatment worth preserving

- Muted olive walls, dark brown wood, tan clothing, warm amber lamps, and cool blue rain/window light. The green banker lamp is a restrained accent.
- Low-key lighting with visible or plausible practical sources; highlights remain localized and the room stays dark.
- Natural facial texture and understated performances, with consistent wardrobe and location details across shots.
- Environmental storytelling through a ledger, reception bell, suitcase, mounted trophies, window framing, and keyhole. Avoid a crop that removes the reason for a shot.
- Clean black gutters and borders. The supplied exports add no titles, logos, or decorative graphics.

These are HOTEL-specific cues. For another scene, preserve that scene's established palette and story rather than importing the hotel's lamps, animals, or colors.

## Measured layout recipes

Coordinates are `[left, top, right, bottom]` with right/bottom exclusive.

| Export | Panel boxes in reading order |
| --- | --- |
| `HOTEL_Instagram_Grid_1080x1350.jpg` | `[12,12,1068,446]`, `[12,458,1068,892]`, `[12,904,1068,1338]` |
| `HOTEL_Instagram_Story_1080x1920.jpg` | `[12,150,1068,678]`, `[12,696,1068,1224]`, `[12,1242,1068,1770]` |

The post fills almost the whole canvas with three short landscape strips. The Story centers a taller triptych with black space above and below. Its panels show more vertical information, including more floor, the guest's lower body, and the bottom of the keyhole. Both retain the same left-to-right scene relationships and narrative order.

The Story's third image contains large naturally dark regions, so a brightness detector may mistake image pixels for extra borders. Use the complete grid geometry and visual inspection rather than deleting every dark row.

Crop alignment was matched against the supplied JPEG exports, using uniform scaling and comparing each source with its destination panel. The approximate vertical alignments are:

| Panel | Post | Story |
| --- | --- | --- |
| Owner | 0.05 | 0.12 |
| Guest | 0.40 | 0.50 |
| Keyhole | 0.32 | 0.50 |

Horizontal alignment is 0.50 for all panels. The 0–1 values control where surplus image height is cropped, not the subject's position. Use [hotel-panels.json](hotel-panels.json) with the compositor to retain these choices. Center-cropping the Owner instead would trim the antlers and introduce more foreground floor than the reference post.

## Applying the example

Use original stills to make both targets. If only the post export exists, extracting its three panels preserves the available information but does not restore the vertical content cropped from the originals. Prefer black containment over inventing missing picture content when only layout adaptation is requested.
