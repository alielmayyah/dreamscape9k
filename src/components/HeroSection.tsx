import React, { useRef, useEffect } from 'react';
import { Artwork } from '../types/artwork';
import { ARCHIVE_CONFIG } from '../config/archive.config';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { ArrowDown, Maximize2 } from 'lucide-react';

interface HeroSectionProps {
  heroArtwork: Artwork;
  onSelectArtwork: (artwork: Artwork) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  heroArtwork,
  onSelectArtwork,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const artworkRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 1.1, delay: 0.1 }
      )
        .fromTo(
          textRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.7'
        )
        .fromTo(
          artworkRef.current,
          { opacity: 0, scale: 0.98 },
          { opacity: 1, scale: 1, duration: 1.2 },
          '-=0.6'
        )
        .fromTo(
          metaRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.8 },
          '-=0.6'
        );
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] pt-28 sm:pt-36 pb-16 px-6 sm:px-10 lg:px-14 max-w-[1720px] mx-auto flex flex-col justify-between"
      aria-label="Exhibition Introduction"
    >
      {/* Top Editorial Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-baseline mb-10 md:mb-14">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono-tech text-[10px] md:text-xs text-[#CBB998] tracking-[0.2em] uppercase">
              {ARCHIVE_CONFIG.hero.eyebrow}
            </span>
            <span className="text-[#3B3B37]">•</span>
            <span className="font-mono-tech text-[10px] md:text-xs text-[#5E5D57] tracking-wider">
              {ARCHIVE_CONFIG.hero.referenceCode}
            </span>
          </div>

          <h1
            ref={titleRef}
            className="font-editorial text-4xl sm:text-6xl md:text-7xl xl:text-8xl text-[#EAE8E2] leading-[0.95] tracking-tight font-normal"
          >
            {ARCHIVE_CONFIG.hero.title}
          </h1>
        </div>

        <div ref={textRef} className="lg:col-span-4 flex flex-col justify-end">
          <p className="text-[#92918B] text-sm md:text-base leading-relaxed font-normal max-w-md">
            {ARCHIVE_CONFIG.hero.statement}
          </p>
        </div>
      </div>

      {/* Dominant Hero Frame */}
      <div
        ref={artworkRef}
        onClick={() => onSelectArtwork(heroArtwork)}
        className="group relative w-full aspect-[16/9] md:aspect-[2.1/1] overflow-hidden rounded bg-[#161615] border border-[#242422] cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectArtwork(heroArtwork);
          }
        }}
        aria-label={`Open hero frame: ${heroArtwork.title}`}
      >
        <img
          src={heroArtwork.src}
          alt={heroArtwork.alt}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
          loading="eager"
        />

        {/* Framing Vignette & Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0A]/80 via-transparent to-transparent pointer-events-none" />

        {/* View Indicator Overlay */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#0B0B0A]/70 backdrop-blur-md px-3 py-1.5 rounded border border-[#242422] text-[#EAE8E2] text-xs font-mono-tech opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Maximize2 size={12} className="text-[#CBB998]" />
          <span>EXPAND 4K STILL</span>
        </div>

        {/* Bottom Hero Caption */}
        <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 flex items-end justify-between">
          <div>
            <span className="font-mono-tech text-[10px] md:text-xs text-[#CBB998] tracking-widest uppercase block mb-1">
              [ FRAME // {heroArtwork.sequenceNumber} ]
            </span>
            <h2 className="font-editorial text-xl sm:text-2xl md:text-3xl text-[#EAE8E2] leading-tight">
              {heroArtwork.title}
            </h2>
            <p className="hidden sm:block text-xs text-[#92918B] mt-1 max-w-lg">
              {heroArtwork.description}
            </p>
          </div>

          <div className="font-mono-tech text-[10px] md:text-xs text-[#92918B] bg-[#0B0B0A]/60 backdrop-blur-md px-2.5 py-1 rounded border border-[#242422]">
            {heroArtwork.resolutionLabel} · {heroArtwork.aspectRatio}
          </div>
        </div>
      </div>

      {/* Understated Bottom Metadata & Scroll Indicator */}
      <div
        ref={metaRef}
        className="mt-6 md:mt-8 pt-4 border-t border-[#242422]/60 flex items-center justify-between font-mono-tech text-[11px] text-[#5E5D57]"
      >
        <div className="flex items-center gap-4">
          <span>{ARCHIVE_CONFIG.hero.aspectBadge}</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">{ARCHIVE_CONFIG.resolutionSummary}</span>
        </div>

        <a
          href="#gallery-section"
          className="flex items-center gap-2 text-[#92918B] hover:text-[#EAE8E2] transition-colors"
          aria-label="Scroll to exhibition gallery"
        >
          <span>EXHIBITION ARCHIVE</span>
          <ArrowDown size={12} className="animate-bounce" />
        </a>
      </div>
    </section>
  );
};
