import React, { useRef, useEffect } from 'react';
import { Artwork, ProjectInfo } from '../types/artwork';
import { ArrowLeft, ArrowRight, Expand } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface ProjectStoryViewProps {
  project: ProjectInfo;
  artworks: Artwork[];
  subtitle?: string;
  onSelectArtwork: (artwork: Artwork, index: number) => void;
  onBack: () => void;
  onNextProject?: () => void;
  nextProjectTitle?: string;
}

export const ProjectStoryView: React.FC<ProjectStoryViewProps> = ({
  project,
  artworks,
  subtitle,
  onSelectArtwork,
  onBack,
  onNextProject,
  nextProjectTitle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // ScrollTrigger entrance animations for alternating narrative rows
  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>('.story-beat-row');

      rows.forEach((row, i) => {
        const photoCard = row.querySelector('.story-photo-card');
        const isPhotoLeft = i % 2 === 0;

        // The very first item is visible instantly above the fold
        if (i === 0) {
          if (photoCard) gsap.set(photoCard, { opacity: 1, x: 0, scale: 1 });
          return;
        }

        if (photoCard) {
          gsap.fromTo(
            photoCard,
            {
              opacity: 0,
              x: isPhotoLeft ? -30 : 30,
              scale: 0.98,
            },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 0.75,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: row,
                start: 'top 88%',
                once: true,
              },
            }
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [artworks, prefersReducedMotion]);

  return (
    <div ref={containerRef} className="min-h-screen pb-24">
      {/* Sleek, Minimal Project Top Bar */}
      <header className="gallery-container pt-3 pb-3 sm:pt-4 sm:pb-4 border-b border-[#181818] mb-6 sm:mb-8 select-none flex items-center justify-between gap-3">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="group flex items-center gap-2 py-1 px-2.5 -ml-2.5 rounded-full text-[#888888] hover:text-[#ffffff] hover:bg-[#141414] transition-all cursor-pointer text-[12px] font-mono tracking-tight"
          title="Return to Projects (Esc)"
          aria-label="Return to Projects"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Projects</span>
          <span className="text-[#444444] text-[10px] hidden sm:inline">(Esc)</span>
        </button>

        {/* Project Title (Refined Minimalist) */}
        <div className="flex items-center gap-2 sm:gap-3 text-center">
          <h1 className="text-sm sm:text-base font-mono font-medium tracking-widest text-[#f0f0f0] uppercase">
            {project.title}
          </h1>
          <span className="w-1 h-1 rounded-full bg-[#444444]" />
          <span className="text-[11px] font-mono text-[#777777] tracking-wider uppercase">
            {artworks.length} Scenes
          </span>
          {subtitle && (
            <span className="hidden md:inline text-[11px] font-sans text-[#555555] max-w-xs truncate">
              &mdash; {subtitle}
            </span>
          )}
        </div>

        {/* Quiet Balance Spacer */}
        <div className="w-16 hidden sm:block" aria-hidden="true" />
      </header>

      {/* Alternating Story Beats: PHOTO - PURE VOID / PURE VOID - PHOTO */}
      <div className="gallery-container space-y-12 sm:space-y-16 lg:space-y-24">
        {artworks.map((artwork, idx) => {
          const isPhotoLeft = idx % 2 === 0;
          const sceneNum = String(idx + 1).padStart(2, '0');

          return (
            <div
              key={artwork.id}
              className="story-beat-row grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center"
            >
              {/* Photo on LEFT (for Even Indices: 0, 2, 4...) */}
              {isPhotoLeft ? (
                <>
                  {/* Photo Column (~67% width) */}
                  <div className="lg:col-span-8">
                    <div
                      onClick={() => onSelectArtwork(artwork, idx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectArtwork(artwork, idx);
                        }
                      }}
                      className="story-photo-card group relative aspect-[16/9] w-full overflow-hidden rounded-[3px] bg-[#000000] border border-[#181818] hover:border-[#383838] transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-[0_15px_40px_rgba(0,0,0,0.95)]"
                      aria-label={`View Scene ${sceneNum} fullscreen`}
                    >
                      <img
                        src={artwork.src}
                        srcSet={artwork.srcSet}
                        sizes="(min-width: 1024px) 68vw, 100vw"
                        alt={artwork.alt || `${project.title} Scene ${sceneNum}`}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        fetchPriority={idx === 0 ? 'high' : 'auto'}
                        decoding="async"
                        style={{
                          backgroundImage: `url(${artwork.placeholder})`,
                          backgroundSize: 'cover',
                        }}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />

                      {/* Discreet Expand Cue on Hover */}
                      <div className="absolute bottom-3 right-3 p-2 rounded-full bg-[#000000]/70 backdrop-blur-md border border-[#333333] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Expand size={14} />
                      </div>
                    </div>
                  </div>

                  {/* Pure Pitch-Black Void (4 cols) on RIGHT - 100% Silence */}
                  <div className="hidden lg:block lg:col-span-4" aria-hidden="true" />
                </>
              ) : (
                <>
                  {/* Pure Pitch-Black Void (4 cols) on LEFT - 100% Silence */}
                  <div className="hidden lg:block lg:col-span-4 order-2 lg:order-1" aria-hidden="true" />

                  {/* Photo Column (~67% width) on RIGHT */}
                  <div className="lg:col-span-8 order-1 lg:order-2">
                    <div
                      onClick={() => onSelectArtwork(artwork, idx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectArtwork(artwork, idx);
                        }
                      }}
                      className="story-photo-card group relative aspect-[16/9] w-full overflow-hidden rounded-[3px] bg-[#000000] border border-[#181818] hover:border-[#383838] transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-[0_15px_40px_rgba(0,0,0,0.95)]"
                      aria-label={`View Scene ${sceneNum} fullscreen`}
                    >
                      <img
                        src={artwork.src}
                        srcSet={artwork.srcSet}
                        sizes="(min-width: 1024px) 68vw, 100vw"
                        alt={artwork.alt || `${project.title} Scene ${sceneNum}`}
                        loading="lazy"
                        decoding="async"
                        style={{
                          backgroundImage: `url(${artwork.placeholder})`,
                          backgroundSize: 'cover',
                        }}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />

                      {/* Discreet Expand Cue on Hover */}
                      <div className="absolute bottom-3 right-3 p-2 rounded-full bg-[#000000]/70 backdrop-blur-md border border-[#333333] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Expand size={14} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Minimal Story Coda */}
      <footer className="gallery-container max-w-xl mx-auto pt-16 sm:pt-20 text-center border-t border-[#151515] mt-16 sm:mt-24">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#2a2a2a] hover:border-[#555] bg-[#0d0d0d] hover:bg-[#181818] text-[#cccccc] hover:text-[#ffffff] text-[11px] font-mono tracking-wider uppercase transition-all cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Return to Projects</span>
          </button>

          {onNextProject && nextProjectTitle && (
            <button
              onClick={onNextProject}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#2a2a2a] hover:border-[#555] bg-[#0d0d0d] hover:bg-[#181818] text-[#cccccc] hover:text-[#ffffff] text-[11px] font-mono tracking-wider uppercase transition-all cursor-pointer"
            >
              <span>Next: {nextProjectTitle}</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
