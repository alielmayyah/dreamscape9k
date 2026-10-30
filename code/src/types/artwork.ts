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
}

export type GridCols = 1 | 2 | 3 | 4;
