import React, { useRef, useEffect } from 'react';
import { Artwork, ViewMode } from '../types/artwork';
import { ArtworkItem } from './ArtworkItem';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface ArtworkGalleryProps {
  artworks: Artwork[];
  viewMode: ViewMode;
  onSelectArtwork: (artwork: Artwork) => void;
}

export const ArtworkGallery: React.FC<ArtworkGalleryProps> = ({
  artworks,
  viewMode,
  onSelectArtwork,
}) => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !galleryRef.current) return;

    const ctx = gsap.context(() => {
      const items = galleryRef.current?.querySelectorAll('article');
      if (items && items.length > 0) {
        items.forEach((item) => {
          gsap.fromTo(
            item,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: item,
                start: 'top 88%',
                toggleActions: 'play none none none',
              },
            }
          );
        });
      }
    }, galleryRef);

    return () => ctx.revert();
  }, [artworks, viewMode, prefersReducedMotion]);

  if (artworks.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-mono-tech text-sm text-[#5E5D57]">
          [ NO FRAMES FOUND IN SELECTED COLLECTION ]
        </p>
      </div>
    );
  }

  return (
    <section
      id="gallery-section"
      ref={galleryRef}
      className="py-12 sm:py-16 md:py-20 px-6 sm:px-10 lg:px-14 max-w-[1720px] mx-auto"
      aria-label="Art Gallery"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-14 md:gap-y-20 items-start">
        {artworks.map((artwork, idx) => (
          <ArtworkItem
            key={artwork.id}
            artwork={artwork}
            index={idx}
            viewMode={viewMode}
            onSelect={onSelectArtwork}
          />
        ))}
      </div>
    </section>
  );
};
