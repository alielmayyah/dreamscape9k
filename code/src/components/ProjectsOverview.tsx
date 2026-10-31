import React, { useRef, useEffect } from 'react';
import { ProjectSummary } from '../types/artwork';
import { ArrowRight, Film } from 'lucide-react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface ProjectsOverviewProps {
  projects: ProjectSummary[];
  onSelectProject: (projectId: string) => void;
}

export const ProjectsOverview: React.FC<ProjectsOverviewProps> = ({
  projects,
  onSelectProject,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const cards = containerRef.current.querySelectorAll('.project-card');
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 30, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
      }
    );
  }, [projects, prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      className="gallery-container pt-8 pb-24 sm:pt-12 sm:pb-32"
      aria-label="Curated Projects Overview"
    >
      {/* Editorial Header */}
      <div className="mb-10 sm:mb-14 max-w-2xl">
        <div className="flex items-center gap-2 mb-2 text-[#777777] font-mono text-[11px] tracking-widest uppercase">
          <Film size={13} className="text-[#999999]" />
          <span>Curated Series</span>
          <span className="w-1 h-1 rounded-full bg-[#444]" />
          <span>{projects.length} Projects</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#f0f0f0] mb-2 font-mono uppercase">
          Projects & Narratives
        </h1>
        <p className="text-[13px] sm:text-[14px] text-[#777777] font-sans leading-relaxed">
          Standalone narrative collections exploring cinematic lighting, architectural spaces, and character studies.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {projects.map((project) => {
          const cover = project.coverArtwork;
          return (
            <article
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="project-card group cursor-pointer flex flex-col rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#383838] transition-all duration-300 overflow-hidden shadow-2xl hover:shadow-[0_0_30px_rgba(0,0,0,0.8)]"
            >
              {/* Cover Image */}
              <div className="relative aspect-video w-full overflow-hidden bg-[#050505]">
                {cover ? (
                  <img
                    src={cover.src}
                    srcSet={cover.srcSet}
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    style={{
                      backgroundImage: `url(${cover.placeholder})`,
                      backgroundSize: 'cover',
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#444]">
                    No Cover
                  </div>
                )}

                {/* Gradient Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80 pointer-events-none" />

                {/* Frame Count Badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#000000]/80 backdrop-blur-md border border-[#2a2a2a] text-[10px] font-mono text-[#cccccc] tracking-wider uppercase">
                  {project.frameCount} {project.frameCount === 1 ? 'Frame' : 'Frames'}
                </div>
              </div>

              {/* Project Info */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-medium tracking-wide text-[#ededed] group-hover:text-white transition-colors mb-1.5 font-mono uppercase">
                    {project.title}
                  </h2>
                  <p className="text-[12px] sm:text-[13px] text-[#777777] line-clamp-2 leading-relaxed mb-4">
                    {project.subtitle}
                  </p>
                </div>

                {/* Thumbnail Filmstrip Preview */}
                <div className="space-y-3 pt-3 border-t border-[#161616]">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {project.previewArtworks.slice(0, 5).map((preview) => (
                      <div
                        key={preview.id}
                        className="relative h-10 aspect-video rounded-[2px] overflow-hidden border border-[#222222] bg-[#050505] shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                        style={{
                          backgroundImage: `url(${preview.placeholder})`,
                          backgroundSize: 'cover',
                        }}
                      >
                        <img
                          src={preview.src}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {project.previewArtworks.length > 5 && (
                      <div className="h-10 px-2 rounded-[2px] border border-[#222222] bg-[#111111] text-[10px] font-mono text-[#666666] flex items-center justify-center shrink-0">
                        +{project.previewArtworks.length - 5}
                      </div>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#888888] group-hover:text-[#ffffff] transition-colors pt-1">
                    <span className="tracking-wider uppercase">View Series</span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
