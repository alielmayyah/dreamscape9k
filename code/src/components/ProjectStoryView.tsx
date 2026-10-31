import React, { useRef, useEffect } from 'react';
import { Artwork, ProjectInfo } from '../types/artwork';
import { ArrowLeft, ArrowRight, Expand, Film } from 'lucide-react';
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
        const captionEl = row.querySelector('.story-caption');
        const isPhotoLeft = i % 2 === 0;

        // Skip animation for the very first item so it appears instantly above the fold
        if (i === 0) {
          if (photoCard) gsap.set(photoCard, { opacity: 1, x: 0, scale: 1 });
          if (captionEl) gsap.set(captionEl, { opacity: 1, y: 0 });
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

        if (captionEl) {
          gsap.fromTo(
            captionEl,
            { opacity: 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: 0.1,
              ease: 'power2.out',
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
    <div ref={containerRef} className="min-h-screen pb-20">
      {/* Compact, Integrated Project Top Bar - Minimal height to maximize viewport for images */}
      <header className="gallery-container pt-3 pb-3 sm:pt-4 sm:pb-4 border-b border-[#181818] mb-4 sm:mb-6 select-none flex flex-wrap items-center justify-between gap-3">
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

        {/* Project Title & Counter (Compact Inline) */}
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

        {/* Story Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#666666] tracking-wider uppercase">
          <Film size={12} className="text-[#888888]" />
          <span className="hidden sm:inline">Narrative Flow</span>
        </div>
      </header>

      {/* Alternating Story Beats: PHOTO EMPTY / EMPTY PHOTO */}
      <div className="gallery-container space-y-12 sm:space-y-16 lg:space-y-20">
        {artworks.map((artwork, idx) => {
          const isPhotoLeft = idx % 2 === 0;
          const sceneNum = String(idx + 1).padStart(2, '0');
          const totalScenes = String(artworks.length).padStart(2, '0');

          return (
            <div
              key={artwork.id}
              className="story-beat-row grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center"
            >
              {/* Photo on LEFT (for Even Indices: 0, 2, 4...) */}
              {isPhotoLeft ? (
                <>
                  {/* Photo Column (8 cols = ~67% width, commanding presence) */}
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
                      className="story-photo-card group relative aspect-[16/9] w-full overflow-hidden rounded-[3px] bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#444444] transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-[0_15px_40px_rgba(0,0,0,0.9)]"
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

                      {/* Hover Expand Cue */}
                      <div className="absolute bottom-3 right-3 p-2 rounded-full bg-[#000000]/70 backdrop-blur-md border border-[#333333] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Expand size={14} />
                      </div>
                    </div>
                  </div>

                  {/* Empty / Editorial Accent Column (4 cols) on RIGHT */}
                  <div className="story-caption lg:col-span-4 flex flex-col justify-center px-1 sm:px-4">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-[12px] font-mono tracking-[0.25em] text-[#888888] uppercase">
                        Scene // {sceneNum}
                      </span>
                      <span className="w-6 h-[1px] bg-[#2a2a2a]" />
                      <span className="text-[10px] font-mono text-[#555555]">
                        {sceneNum} / {totalScenes}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-light font-mono tracking-tight text-[#ededed] uppercase mb-1">
                      Beat {sceneNum}
                    </h2>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#555555] tracking-widest uppercase">
                      <span>{artwork.aspectRatio}</span>
                      <span>&middot;</span>
                      <span>{artwork.width} &times; {artwork.height}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Empty / Editorial Accent Column (4 cols) on LEFT */}
                  <div className="story-caption lg:col-span-4 order-2 lg:order-1 flex flex-col justify-center lg:items-end lg:text-right px-1 sm:px-4">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-[10px] font-mono text-[#555555]">
                        {sceneNum} / {totalScenes}
                      </span>
                      <span className="w-6 h-[1px] bg-[#2a2a2a]" />
                      <span className="text-[12px] font-mono tracking-[0.25em] text-[#888888] uppercase">
                        Scene // {sceneNum}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-light font-mono tracking-tight text-[#ededed] uppercase mb-1">
                      Beat {sceneNum}
                    </h2>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#555555] tracking-widest uppercase">
                      <span>{artwork.aspectRatio}</span>
                      <span>&middot;</span>
                      <span>{artwork.width} &times; {artwork.height}</span>
                    </div>
                  </div>

                  {/* Photo Column (8 cols = ~67% width) on RIGHT */}
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
                      className="story-photo-card group relative aspect-[16/9] w-full overflow-hidden rounded-[3px] bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#444444] transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-[0_15px_40px_rgba(0,0,0,0.9)]"
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

                      {/* Hover Expand Cue */}
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

      {/* End of Story Coda */}
      <footer className="gallery-container max-w-xl mx-auto pt-12 sm:pt-16 text-center border-t border-[#151515] mt-16 sm:mt-24">
        <p className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#555555] mb-5">
          &mdash; End of Narrative Sequence &mdash;
        </p>

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
