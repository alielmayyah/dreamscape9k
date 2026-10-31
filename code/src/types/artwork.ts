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

export type GridCols = 1 | 2 | 3 | 4;
