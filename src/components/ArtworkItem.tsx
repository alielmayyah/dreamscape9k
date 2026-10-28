import React, { useState } from 'react';
import { Artwork, ViewMode } from '../types/artwork';
import { Maximize2, Layers } from 'lucide-react';

interface ArtworkItemProps {
  artwork: Artwork;
  index: number;
  viewMode: ViewMode;
  onSelect: (artwork: Artwork) => void;
}

export const ArtworkItem: React.FC<ArtworkItemProps> = ({
  artwork,
  viewMode,
  onSelect,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Compute grid span for editorial mode
  const getSpanClass = () => {
    if (viewMode === 'compact') {
      return 'col-span-12 sm:col-span-6 lg:col-span-4';
    }

    switch (artwork.layout) {
      case 'panoramic':
        return 'col-span-12';
      case 'wide':
        return 'col-span-12 lg:col-span-8';
      case 'tall':
        return 'col-span-12 sm:col-span-6 lg:col-span-4';
      case 'half':
        return 'col-span-12 lg:col-span-6';
      case 'standard':
      default:
        return 'col-span-12 sm:col-span-6 lg:col-span-6';
    }
  };

  // Determine aspect ratio class
  const getAspectRatioClass = () => {
    switch (artwork.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16]';
      case '4:5':
        return 'aspect-[4/5]';
      case '2:1':
        return 'aspect-[2/1]';
      case '2.35:1':
        return 'aspect-[2.35/1]';
      case '16:9':
      default:
        return 'aspect-[16/9]';
    }
  };

  return (
    <article
      className={`group relative flex flex-col ${getSpanClass()} transition-transform duration-300`}
    >
      {/* Image Container */}
      <div
        className={`relative w-full ${getAspectRatioClass()} overflow-hidden rounded bg-[#161615] border border-[#242422] cursor-pointer`}
        onClick={() => onSelect(artwork)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(artwork);
          }
        }}
        aria-label={`View artwork: ${artwork.title}`}
      >
        {/* Placeholder / Skeleton */}
        {!imageLoaded && !hasError && (
          <div className="absolute inset-0 bg-[#161615] animate-pulse" />
        )}

        {/* Thumbnail Image */}
        <img
          src={artwork.thumb || artwork.src}
          alt={artwork.alt}
          onLoad={() => setImageLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.02] ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />

        {/* Framing Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0A]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {artwork.isSeries ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono-tech uppercase tracking-wider bg-[#CBB998]/20 text-[#CBB998] border border-[#CBB998]/40 backdrop-blur-md">
              <Layers size={10} />
              <span>TRILOGY (3 ACTS)</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech tracking-wider text-[#92918B] bg-[#0B0B0A]/60 border border-[#242422] backdrop-blur-md">
              {artwork.aspectRatio}
            </span>
          )}

          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#0B0B0A]/80 backdrop-blur-md p-1.5 rounded border border-[#242422] text-[#EAE8E2]">
            <Maximize2 size={12} />
          </div>
        </div>

        {/* Episode Indicators for Trilogies */}
        {artwork.isSeries && artwork.episodes && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            {artwork.episodes.map((ep, idx) => (
              <div
                key={idx}
                className="flex-1 h-1 rounded-full bg-[#EAE8E2]/40 group-hover:bg-[#CBB998]/80 transition-colors"
                title={`${ep.act}: ${ep.title}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Editorial Caption Below Image */}
      <div className="pt-3 pb-1 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-tech text-[10px] text-[#CBB998] tracking-widest uppercase">
              [{artwork.sequenceNumber}]
            </span>
            <span className="text-[#3B3B37] text-[10px]">•</span>
            <span className="font-mono-tech text-[10px] text-[#5E5D57] tracking-wider uppercase">
              {artwork.collection}
            </span>
          </div>

          <h3 className="font-editorial text-lg sm:text-xl text-[#EAE8E2] group-hover:text-[#CBB998] transition-colors leading-snug">
            {artwork.title}
          </h3>

          {artwork.description && (
            <p className="text-xs text-[#92918B] mt-0.5 line-clamp-1 max-w-xl font-normal">
              {artwork.description}
            </p>
          )}
        </div>

        <div className="shrink-0 pt-1 font-mono-tech text-[10px] text-[#5E5D57]">
          {artwork.resolutionLabel}
        </div>
      </div>
    </article>
  );
};
