import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Artwork } from '../types/artwork';
import { useScrollLock } from '../hooks/useScrollLock';
import { X, ChevronLeft, ChevronRight, Layers, Info } from 'lucide-react';

interface ArtworkLightboxProps {
  artwork: Artwork | null;
  activeEpisodeIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ArtworkLightbox: React.FC<ArtworkLightboxProps> = ({
  artwork,
  activeEpisodeIndex = 0,
  isOpen,
  onClose,
  onNext,
  onPrev,
}) => {
  const [currentAct, setCurrentAct] = useState<number>(activeEpisodeIndex);
  const [showMetadata, setShowMetadata] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useScrollLock(isOpen);

  // Sync activeEpisodeIndex when opened from sequence
  useEffect(() => {
    setCurrentAct(activeEpisodeIndex);
    setIsImageLoaded(false);
  }, [artwork, activeEpisodeIndex]);

  // Focus trap and initial focus
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Current display image and details
  const isSeries = artwork?.isSeries && artwork.episodes && artwork.episodes.length > 0;
  const currentItem = isSeries ? artwork.episodes![currentAct] : null;

  const displaySrc = currentItem ? currentItem.src : artwork?.src || '';
  const displayTitle = currentItem
    ? `${artwork?.title}: ${currentItem.act} — ${currentItem.title}`
    : artwork?.title || '';
  const displayCaption = currentItem?.caption || artwork?.description || '';
  const displayAspect = currentItem?.aspectRatio || artwork?.aspectRatio || '16:9';

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (isSeries && artwork.episodes && currentAct < artwork.episodes.length - 1) {
          setCurrentAct((prev) => prev + 1);
          setIsImageLoaded(false);
        } else {
          onNext();
          setCurrentAct(0);
          setIsImageLoaded(false);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (isSeries && currentAct > 0) {
          setCurrentAct((prev) => prev - 1);
          setIsImageLoaded(false);
        } else {
          onPrev();
          setCurrentAct(0);
          setIsImageLoaded(false);
        }
      }
    },
    [isOpen, isSeries, artwork, currentAct, onClose, onNext, onPrev]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipeLeft = distance > 50;
    const isSwipeRight = distance < -50;

    if (isSwipeLeft) {
      if (isSeries && artwork?.episodes && currentAct < artwork.episodes.length - 1) {
        setCurrentAct((prev) => prev + 1);
      } else {
        onNext();
      }
    } else if (isSwipeRight) {
      if (isSeries && currentAct > 0) {
        setCurrentAct((prev) => prev - 1);
      } else {
        onPrev();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!isOpen || !artwork) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Cinematic viewer for ${displayTitle}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#070707]/95 backdrop-blur-xl animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-[#070707]/90 to-transparent">
        <div className="flex items-center gap-3">
          <span className="font-mono-tech text-xs text-[#CBB998] tracking-widest uppercase">
            [{artwork.sequenceNumber}]
          </span>
          <span className="hidden sm:inline-block text-[#5E5D57] font-mono-tech text-xs">•</span>
          <span className="hidden sm:inline-block font-mono-tech text-xs text-[#92918B] uppercase">
            {artwork.collection}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setShowMetadata((prev) => !prev)}
            className={`p-2 rounded-full border transition-colors ${
              showMetadata
                ? 'bg-[#EAE8E2] text-[#070707] border-[#EAE8E2]'
                : 'bg-[#161615] text-[#92918B] border-[#242422] hover:text-[#EAE8E2]'
            }`}
            title="Toggle Frame Information"
            aria-label="Toggle frame metadata"
          >
            <Info size={16} />
          </button>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 rounded-full border border-[#242422] bg-[#161615] text-[#92918B] hover:text-[#EAE8E2] hover:border-[#3B3B37] transition-colors focus:outline-none focus:ring-1 focus:ring-[#CBB998]"
            title="Close Viewer (Escape)"
            aria-label="Close viewer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => {
          if (isSeries && currentAct > 0) {
            setCurrentAct((prev) => prev - 1);
          } else {
            onPrev();
          }
        }}
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-[#242422] bg-[#161615]/80 text-[#92918B] hover:text-[#EAE8E2] hover:border-[#CBB998] backdrop-blur-md transition-all focus:outline-none"
        aria-label="Previous artwork"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={() => {
          if (isSeries && artwork.episodes && currentAct < artwork.episodes.length - 1) {
            setCurrentAct((prev) => prev + 1);
          } else {
            onNext();
          }
        }}
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-[#242422] bg-[#161615]/80 text-[#92918B] hover:text-[#EAE8E2] hover:border-[#CBB998] backdrop-blur-md transition-all focus:outline-none"
        aria-label="Next artwork"
      >
        <ChevronRight size={22} />
      </button>

      {/* Main Image Viewport */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-12 md:p-16">
        <div className="relative max-w-full max-h-[76vh] flex items-center justify-center">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono-tech text-xs text-[#5E5D57] animate-pulse">
                DECODING MASTER FRAME...
              </span>
            </div>
          )}

          <img
            src={displaySrc}
            alt={artwork.alt}
            onLoad={() => setIsImageLoaded(true)}
            className={`max-w-full max-h-[76vh] object-contain rounded shadow-2xl transition-opacity duration-300 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {/* Act Switcher for Trilogies */}
        {isSeries && artwork.episodes && (
          <div className="mt-4 flex items-center gap-2 z-20 bg-[#161615]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#242422]">
            <span className="flex items-center gap-1.5 font-mono-tech text-[10px] text-[#CBB998] uppercase tracking-wider pr-2 border-r border-[#242422]">
              <Layers size={10} />
              <span>TRILOGY</span>
            </span>

            {artwork.episodes.map((ep, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentAct(idx);
                  setIsImageLoaded(false);
                }}
                className={`px-3 py-1 rounded-full text-xs font-mono-tech transition-all ${
                  currentAct === idx
                    ? 'bg-[#EAE8E2] text-[#070707] font-semibold'
                    : 'text-[#92918B] hover:text-[#EAE8E2]'
                }`}
              >
                {ep.act}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Metadata Drawer */}
        {showMetadata && (
          <div className="absolute bottom-4 left-6 right-6 md:left-14 md:right-14 flex flex-col md:flex-row md:items-end justify-between gap-3 text-left z-20 pointer-events-none">
            <div className="pointer-events-auto max-w-2xl bg-[#0B0B0A]/85 backdrop-blur-md p-4 rounded border border-[#242422]">
              <h2 className="font-editorial text-xl md:text-2xl text-[#EAE8E2] leading-tight">
                {displayTitle}
              </h2>
              {displayCaption && (
                <p className="text-xs md:text-sm text-[#92918B] mt-1 font-normal">
                  {displayCaption}
                </p>
              )}
            </div>

            <div className="pointer-events-auto font-mono-tech text-[10px] md:text-xs text-[#5E5D57] bg-[#0B0B0A]/85 backdrop-blur-md px-3.5 py-2.5 rounded border border-[#242422] flex items-center gap-3">
              <span>RATIO: {displayAspect}</span>
              <span>•</span>
              <span>{artwork.resolutionLabel}</span>
              <span>•</span>
              <span>{artwork.year}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

