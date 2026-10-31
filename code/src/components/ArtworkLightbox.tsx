import React, { useEffect, useRef, useCallback } from 'react';
import { Artwork } from '../types/artwork';
import { useScrollLock } from '../hooks/useScrollLock';
import { X, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';

interface ArtworkLightboxProps {
  artwork: Artwork | null;
  currentIndex: number;
  totalCount: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  neighbours: { prev: Artwork | null; next: Artwork | null };
  onViewProject?: (projectId: string) => void;
  isProjectScoped?: boolean;
}

export const ArtworkLightbox: React.FC<ArtworkLightboxProps> = ({
  artwork,
  currentIndex,
  totalCount,
  isOpen,
  onClose,
  onNext,
  onPrev,
  neighbours,
  onViewProject,
  isProjectScoped = false,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useScrollLock(isOpen);

  // Warm the cache for neighbours so next/prev feels instant
  useEffect(() => {
    if (!isOpen) return;
    [neighbours.prev, neighbours.next].forEach((n) => {
      if (!n) return;
      const img = new Image();
      img.sizes = '96vw';
      img.srcset = n.srcSet;
      img.src = n.src;
    });
  }, [isOpen, neighbours.prev, neighbours.next]);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      }
    },
    [isOpen, onClose, onNext, onPrev]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;

    if (distance > 45) {
      onNext();
    } else if (distance < -45) {
      onPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!isOpen || !artwork) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Frame ${currentIndex + 1} of ${totalCount}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000] select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Discreet Close Button */}
      <button
        ref={closeButtonRef}
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 p-2.5 rounded-full text-[#777] hover:text-[#fff] hover:bg-[#1a1a1a] transition-colors focus:outline-none"
        title="Close (Esc)"
        aria-label="Close lightbox"
      >
        <X size={20} />
      </button>

      {/* Discreet Previous Button */}
      <button
        onClick={onPrev}
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full text-[#666] hover:text-[#fff] hover:bg-[#181818] transition-colors focus:outline-none"
        title="Previous (Left Arrow)"
        aria-label="Previous artwork"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Discreet Next Button */}
      <button
        onClick={onNext}
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full text-[#666] hover:text-[#fff] hover:bg-[#181818] transition-colors focus:outline-none"
        title="Next (Right Arrow)"
        aria-label="Next artwork"
      >
        <ChevronRight size={24} />
      </button>

      {/* Image Viewport - Maximum Screen Utilization */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-6 md:p-10 pointer-events-none">
        <img
          key={artwork.src}
          src={artwork.src}
          srcSet={artwork.srcSet}
          sizes="96vw"
          width={artwork.width}
          height={artwork.height}
          alt={artwork.alt || `Frame ${currentIndex + 1}`}
          style={{ backgroundImage: `url(${artwork.placeholder})`, backgroundSize: 'cover' }}
          className="w-auto h-auto max-w-[96vw] max-h-[90vh] object-contain pointer-events-auto rounded-[2px] transition-opacity duration-300"
        />

        {/* Minimal Subtle Counter & Project Action Button */}
        <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex items-center justify-center gap-2 px-4 pointer-events-none">
          <div className="px-3 py-1 bg-[#0f0f0f]/80 backdrop-blur-sm rounded border border-[#222] text-[10px] font-mono text-[#777] tracking-wider pointer-events-auto">
            {isProjectScoped && artwork.project ? (
              <span>{artwork.project.title.toUpperCase()} &middot; {currentIndex + 1} / {totalCount}</span>
            ) : (
              <span>{currentIndex + 1} / {totalCount}</span>
            )}
          </div>

          {!isProjectScoped && artwork.project && onViewProject && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewProject(artwork.project!.id);
              }}
              className="group flex items-center gap-1.5 px-3 py-1 bg-[#121212]/90 hover:bg-[#202020] active:scale-95 backdrop-blur-md rounded border border-[#262626] hover:border-[#444] text-[11px] font-mono text-[#cccccc] hover:text-[#ffffff] tracking-wide pointer-events-auto transition-all duration-200 cursor-pointer shadow-xl"
              title={`View complete project: ${artwork.project.title}`}
            >
              <span>View Project: <strong className="font-semibold text-white">{artwork.project.title}</strong></span>
              <span className="text-[#777]">({artwork.project.frameCount})</span>
              <ArrowUpRight size={13} className="text-[#888] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
