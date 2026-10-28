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
      aria-label={`View ${artwork.title}`}
      className="group relative aspect-[16/9] w-full overflow-hidden rounded-[2px] bg-[#0e0e0e] cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-[#888]"
    >
      {/* Skeleton / Placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-[#121212] animate-pulse" />
      )}

      {/* Image */}
      <img
        src={artwork.thumb || artwork.src}
        alt={artwork.alt || artwork.title}
        onLoad={() => setLoaded(true)}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025] ${
          loaded ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-300`}
      />

      {/* Discreet Hover Vignette & Tiny Title */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3.5 pointer-events-none">
        <span className="text-[12px] text-[#ededed] font-light tracking-wide truncate max-w-[80%]">
          {artwork.title}
        </span>
        <span className="text-[10px] text-[#888] font-mono tracking-wider">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};
