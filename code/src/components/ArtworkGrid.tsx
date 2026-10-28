import React, { useRef, useEffect } from 'react';
import { Artwork, GridCols } from '../types/artwork';
import { ArtworkItem } from './ArtworkItem';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface ArtworkGridProps {
  artworks: Artwork[];
  gridCols: GridCols;
  onSelectArtwork: (artwork: Artwork, index: number) => void;
}

export const ArtworkGrid: React.FC<ArtworkGridProps> = ({
  artworks,
  gridCols,
  onSelectArtwork,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const items = containerRef.current?.children;
      if (!items || items.length === 0) return;

      // Animate initial visible batch quickly
      const initialBatch = Array.from(items).slice(0, 12);
      gsap.fromTo(
        initialBatch,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.035,
          ease: 'power2.out',
        }
      );

      // Remaining items reveal on scroll
      const remainingBatch = Array.from(items).slice(12);
      remainingBatch.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [artworks, gridCols, prefersReducedMotion]);

  const gridClass =
    gridCols === 4
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <main className="max-w-[1800px] mx-auto px-3 sm:px-5 md:px-8 py-5 md:py-6">
      <div
        ref={containerRef}
        className={`grid ${gridClass} gap-2.5 sm:gap-3.5 md:gap-4`}
      >
        {artworks.map((artwork, idx) => (
          <ArtworkItem
            key={artwork.id}
            artwork={artwork}
            index={idx}
            priority={idx < 6}
            onSelect={onSelectArtwork}
          />
        ))}
      </div>
    </main>
  );
};
