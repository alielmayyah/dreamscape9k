import React, { useState } from 'react';
import { Artwork } from '../types/artwork';

interface ArtworkItemProps {
  artwork: Artwork;
  index: number;
  sizes: string;
  priority?: boolean;
  onSelect: (artwork: Artwork, index: number) => void;
}

export const ArtworkItem: React.FC<ArtworkItemProps> = ({
  artwork,
  index,
  sizes,
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
      className="artwork-card group relative aspect-[16/9] w-full overflow-hidden rounded-[2px] bg-[#000000] cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-[#888]"
    >
      {/* Blurred tiny preview until the real image loads */}
      {!loaded && (
        <img
          src={artwork.placeholder}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
        />
      )}

      {/* Parallax inner container - enables silky scroll drift without edge bleeding */}
      <div className="artwork-parallax absolute -inset-y-[7%] inset-x-0 w-full h-[114%] will-change-transform">
        <img
          src={artwork.src}
          srcSet={artwork.srcSet}
          sizes={sizes}
          width={artwork.width}
          height={artwork.height}
          alt={artwork.alt || `Frame ${index + 1}`}
          onLoad={() => setLoaded(true)}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
            loaded ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}
        />
      </div>
    </div>
  );
};
