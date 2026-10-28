import React, { useState } from 'react';
import { Artwork } from '../types/artwork';

interface ArtworkItemProps {
  artwork: Artwork;
  index: number;
  priority?: boolean;
  onSelect: (artwork: Artwork, index: number) => void;
}

export const ArtworkItem: React.FC<ArtworkItemProps> = ({
  artwork,
  index,
  priority = false,
  onSelect,
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      onClick={() => onSelect(artwork, index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(artwork, index);
        }
      }}
      aria-label={`View frame ${index + 1}`}
      className="group relative aspect-[16/9] w-full overflow-hidden rounded-[2px] bg-[#000000] cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-[#888]"
    >
      {/* Skeleton / Placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-[#080808] animate-pulse" />
      )}

      {/* Image */}
      <img
        src={artwork.thumb || artwork.src}
        alt={artwork.alt || `Frame ${index + 1}`}
        onLoad={() => setLoaded(true)}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025] ${
          loaded ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-300`}
      />
    </div>
  );
};
