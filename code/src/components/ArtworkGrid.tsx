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

      // Animate initial visible batch
      const initialBatch = Array.from(items).slice(0, 12);
      gsap.fromTo(
        initialBatch,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.03,
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
            duration: 0.55,
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

  // Dynamic grid column classes
  const getGridConfig = () => {
    switch (gridCols) {
      case 1:
        return {
          gridClass: 'grid-cols-1 gap-3 sm:gap-4 md:gap-5',
        };
      case 2:
        return {
          gridClass: 'grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3',
        };
      case 4:
        return {
          gridClass: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-2',
        };
      case 3:
      default:
        return {
          gridClass: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 md:gap-2.5',
        };
    }
  };

  const { gridClass } = getGridConfig();

  return (
    <main className="w-[90%] mx-auto pt-4 sm:pt-6 md:pt-8 pb-20">
      <div
        ref={containerRef}
        className={`grid ${gridClass}`}
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
