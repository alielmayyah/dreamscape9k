export interface ProjectInfo {
  id: string;
  title: string;
  frameCount: number;
}

export interface Artwork {
  id: string;
  title: string;
  src: string;
  srcSet: string;
  placeholder: string;
  alt: string;
  aspectRatio: string;
  width: number;
  height: number;
  project?: ProjectInfo;
}

export interface ProjectConfig {
  id: string;
  title: string;
  subtitle: string;
  coverStem: string;
}

export interface ProjectSummary {
  id: string;
  title: string;
  subtitle: string;
  frameCount: number;
  coverArtwork: Artwork;
  previewArtworks: Artwork[];
}

export type GridCols = 1 | 2 | 3 | 4;
export type ViewMode = 'gallery' | 'projects';
