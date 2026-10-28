export interface CategoryItem {
  id: 'all' | 'series' | 'nocturne' | 'surreal' | 'vertical';
  label: string;
  countLabel?: string;
}

export const ARCHIVE_CONFIG = {
  title: "ARCHIVE // 2.39:1",
  shortTitle: "ARC·239",
  subtitle: "ANONYMOUS CINEMATIC VISUAL REPOSITORY",
  descriptor: "CURATED SYNTHETIC FRAMES & NARRATIVE SEQUENCES",
  metaDescription: "An anonymous digital art exhibition showcasing cinematic film stills, editorial photography, and narrative frame sequences.",
  establishedYear: 2026,
  resolutionSummary: "2K · 4K MASTER ARCHIVE",
  aspectRatios: ["16:9 Cinema", "2.35:1 Widescreen", "9:16 Vertical"],
  categories: [
    { id: 'all', label: 'All Frames' },
    { id: 'series', label: 'Narrative Trilogies' },
    { id: 'nocturne', label: 'Nocturne & Atmosphere' },
    { id: 'surreal', label: 'Surreal Stills' },
    { id: 'vertical', label: 'Vertical Cinema' },
  ] as CategoryItem[],
  hero: {
    eyebrow: "SYNTHETIC CINEMATOGRAPHY ARCHIVE",
    title: "THE SILENT FRAMES",
    statement: "A curated repository of anonymous nocturnal stills, 3-act narrative sequences, and architectural solitude. Rendered at native 2K and 4K resolutions.",
    referenceCode: "ARC-2026-X1",
    aspectBadge: "2.39:1 / 1.78:1 PANORAMIC",
  },
  sequenceSection: {
    badge: "CINEMATIC NARRATIVE STRIP",
    title: "THE TAXI // THREE-ACT NOCTURNE",
    description: "A continuous horizontal frame progression depicting a solitary midnight fare descending past the city limits into the pine wilderness.",
  },
  exhibitionNote: "All works contained within this archive are presented without personal authorial credit. The collection prioritizes composition, atmospheric lighting, and visual storytelling.",
  colophon: {
    curation: "Anonymous Archival Project",
    encoding: "Lossless Master Stills",
    location: "Global Digital Node",
    licensing: "Unrestricted Editorial Exhibition",
  }
};

