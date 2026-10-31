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
  const heroRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Hero entrance animation
  useEffect(() => {
    if (prefersReducedMotion || !heroRef.current) return;
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );
  }, [project.id, prefersReducedMotion]);

  // ScrollTrigger animations for alternating narrative rows
  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>('.story-beat-row');

      rows.forEach((row, i) => {
        const photoCard = row.querySelector('.story-photo-card');
        const captionEl = row.querySelector('.story-caption');
        const isPhotoLeft = i % 2 === 0;

        if (photoCard) {
          gsap.fromTo(
            photoCard,
            {
              opacity: 0,
              x: isPhotoLeft ? -35 : 35,
              scale: 0.97,
            },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 0.85,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: row,
                start: 'top 85%',
                once: true,
              },
            }
          );
        }

        if (captionEl) {
          gsap.fromTo(
            captionEl,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              delay: 0.15,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: row,
                start: 'top 85%',
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
    <div ref={containerRef} className="min-h-screen pb-32">
      {/* Editorial Navigation Top Bar */}
      <nav
        aria-label="Story navigation"
        className="gallery-container pt-6 pb-4 sm:pt-8 sm:pb-6 flex items-center justify-between border-b border-[#181818] mb-8 select-none"
      >
        <button
          onClick={onBack}
          className="group flex items-center gap-2 py-1.5 px-3 -ml-3 rounded-full text-[#888888] hover:text-[#ffffff] hover:bg-[#141414] transition-all cursor-pointer text-[12px] font-mono tracking-tight"
          title="Return to Projects (Esc)"
          aria-label="Return to Projects"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Return to Projects</span>
          <span className="text-[#444444] text-[10px] hidden sm:inline">(Esc)</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[#666666] tracking-wider uppercase">
          <Film size={12} className="text-[#888888]" />
          <span>Narrative Sequence</span>
          <span className="w-1 h-1 rounded-full bg-[#444]" />
          <span>{artworks.length} Scenes</span>
        </div>
      </nav>

      {/* Cinematic Hero Title Sequence */}
      <header ref={heroRef} className="gallery-container max-w-4xl text-center py-12 sm:py-20 mx-auto select-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#222222] bg-[#0c0c0c] text-[11px] font-mono tracking-[0.2em] text-[#888888] uppercase mb-5">
          <span>Series Collection</span>
          <span className="w-1 h-1 rounded-full bg-[#555]" />
          <span>{artworks.length} Acts</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-light font-mono tracking-tight text-[#f3f3f3] uppercase mb-4 leading-tight">
          {project.title}
        </h1>

        {subtitle && (
          <p className="text-sm sm:text-base text-[#888888] font-sans max-w-xl mx-auto leading-relaxed mb-8">
            {subtitle}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#555555] tracking-widest uppercase">
          <span>Scroll to begin narrative</span>
          <span className="inline-block animate-bounce">↓</span>
        </div>
      </header>

      {/* Alternating Story Beats: PHOTO EMPTY / EMPTY PHOTO */}
      <div className="gallery-container space-y-24 sm:space-y-36 lg:space-y-48 my-12 sm:my-20">
        {artworks.map((artwork, idx) => {
          const isPhotoLeft = idx % 2 === 0;
          const sceneNum = String(idx + 1).padStart(2, '0');
          const totalScenes = String(artworks.length).padStart(2, '0');

          return (
            <div
              key={artwork.id}
              className="story-beat-row grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            >
              {/* Photo on LEFT (for Even Indices: 0, 2, 4...) */}
              {isPhotoLeft ? (
                <>
                  {/* Photo Column (7 cols) */}
                  <div className="lg:col-span-7">
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
                      className="story-photo-card group relative aspect-[16/9] w-full overflow-hidden rounded-[3px] bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#444444] transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.95)]"
                      aria-label={`View Scene ${sceneNum} fullscreen`}
                    >
                      <img
                        src={artwork.src}
                        srcSet={artwork.srcSet}
                        sizes="(min-width: 1024px) 60vw, 100vw"
                        alt={artwork.alt || `${project.title} Scene ${sceneNum}`}
                        loading={idx < 2 ? 'eager' : 'lazy'}
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

                  {/* Empty / Editorial Accent Column (5 cols) */}
                  <div className="story-caption lg:col-span-5 flex flex-col justify-center px-2 sm:px-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[12px] font-mono tracking-[0.25em] text-[#777777] uppercase">
                        Scene // {sceneNum}
                      </span>
                      <span className="w-8 h-[1px] bg-[#2a2a2a]" />
                      <span className="text-[11px] font-mono text-[#555555]">
                        {sceneNum} of {totalScenes}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-light font-mono tracking-tight text-[#ededed] uppercase mb-2">
                      Beat {sceneNum}
                    </h2>

                    <div className="flex items-center gap-2 pt-2 text-[10px] font-mono text-[#555555] tracking-widest uppercase">
                      <span>{artwork.aspectRatio}</span>
                      <span>&middot;</span>
                      <span>{artwork.width} &times; {artwork.height}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Empty / Editorial Accent Column (5 cols) on LEFT */}
                  <div className="story-caption lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center lg:items-end lg:text-right px-2 sm:px-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[11px] font-mono text-[#555555]">
                        {sceneNum} of {totalScenes}
                      </span>
                      <span className="w-8 h-[1px] bg-[#2a2a2a]" />
                      <span className="text-[12px] font-mono tracking-[0.25em] text-[#777777] uppercase">
                        Scene // {sceneNum}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-light font-mono tracking-tight text-[#ededed] uppercase mb-2">
                      Beat {sceneNum}
                    </h2>

                    <div className="flex items-center gap-2 pt-2 text-[10px] font-mono text-[#555555] tracking-widest uppercase">
                      <span>{artwork.aspectRatio}</span>
                      <span>&middot;</span>
                      <span>{artwork.width} &times; {artwork.height}</span>
                    </div>
                  </div>

                  {/* Photo Column (7 cols) on RIGHT */}
                  <div className="lg:col-span-7 order-1 lg:order-2">
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
                      className="story-photo-card group relative aspect-[16/9] w-full overflow-hidden rounded-[3px] bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#444444] transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.95)]"
                      aria-label={`View Scene ${sceneNum} fullscreen`}
                    >
                      <img
                        src={artwork.src}
                        srcSet={artwork.srcSet}
                        sizes="(min-width: 1024px) 60vw, 100vw"
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
      <footer className="gallery-container max-w-xl mx-auto pt-16 sm:pt-24 text-center border-t border-[#151515]">
        <p className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#555555] mb-6">
          — End of Narrative Sequence —
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#2a2a2a] hover:border-[#555] bg-[#0d0d0d] hover:bg-[#181818] text-[#cccccc] hover:text-[#ffffff] text-[12px] font-mono tracking-wider uppercase transition-all cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Return to Projects</span>
          </button>

          {onNextProject && nextProjectTitle && (
            <button
              onClick={onNextProject}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#2a2a2a] hover:border-[#555] bg-[#0d0d0d] hover:bg-[#181818] text-[#cccccc] hover:text-[#ffffff] text-[12px] font-mono tracking-wider uppercase transition-all cursor-pointer"
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
