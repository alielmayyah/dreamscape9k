export type AspectRatio = '16:9' | '2:1' | '2.35:1' | '9:16' | '4:5' | '1:1';

export type LayoutSpan = 'wide' | 'panoramic' | 'tall' | 'standard' | 'half';

export type Category = 'all' | 'series' | 'nocturne' | 'surreal' | 'vertical';

export type ViewMode = 'editorial' | 'compact' | 'filmstrip';

export interface Episode {
  act: string;
  title: string;
  src: string;
  thumb: string;
  aspectRatio: AspectRatio;
  caption?: string;
  width: number;
  height: number;
  timecode?: string;
}

export interface Artwork {
  id: string;
  title: string;
  src: string;
  thumb: string;
  alt: string;
  aspectRatio: AspectRatio;
  category: Category;
  description?: string;
  collection?: string;
  year: number;
  featured?: boolean;
  layout: LayoutSpan;
  sequenceNumber: string;
  width: number;
  height: number;
  resolutionLabel: '4K Cinema' | '2K Cinema' | '2K Vertical' | '1080p';
  isSeries?: boolean;
  episodes?: Episode[];
}
