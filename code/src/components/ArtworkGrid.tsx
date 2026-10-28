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

    // Small delay to allow layout to settle before ScrollTrigger computes bounding boxes
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 60);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.artwork-card');
      if (cards.length === 0) return;

      // 1. Initial entrance animation for first visible batch
      const initialCards = cards.slice(0, 8);
      gsap.fromTo(
        initialCards,
        { opacity: 0, y: 35, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          stagger: 0.04,
          ease: 'power3.out',
        }
      );

      // 2. Batch scroll reveal for subsequent rows as they scroll into view
      ScrollTrigger.batch('.artwork-card:not(:nth-child(-n+8))', {
        start: 'top 92%',
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 40, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.65,
              stagger: 0.04,
              ease: 'power3.out',
              overwrite: 'auto',
            }
          );
        },
      });

      // 3. Continuous Scroll Parallax effect for all images while scrolling
      cards.forEach((card) => {
        const parallaxEl = card.querySelector('.artwork-parallax');
        if (parallaxEl) {
          gsap.fromTo(
            parallaxEl,
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
            }
          );
        }
      });
    }, containerRef);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [artworks, gridCols, prefersReducedMotion]);

  // Dynamic grid column classes - optimized for large screens & mobile responsiveness
  const getGridConfig = () => {
    switch (gridCols) {
      case 1:
        return {
          gridClass: 'grid-cols-1 gap-4 sm:gap-6 md:gap-8',
        };
      case 2:
        return {
          gridClass: 'grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-3.5',
        };
      case 4:
        return {
          gridClass: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-2',
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
    <main className="gallery-container pt-4 sm:pt-6 md:pt-8 pb-24">
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
