import React, { useRef } from 'react';
import { Artwork } from '../types/artwork';
import { ARCHIVE_CONFIG } from '../config/archive.config';
import { Film, ChevronRight, ChevronLeft } from 'lucide-react';

interface CinematicSequenceProps {
  seriesArtwork: Artwork;
  onSelectEpisode: (artwork: Artwork, episodeIndex: number) => void;
}

export const CinematicSequence: React.FC<CinematicSequenceProps> = ({
  seriesArtwork,
  onSelectEpisode,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const episodes = seriesArtwork.episodes || [];

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section
      className="my-16 sm:my-24 py-12 md:py-16 bg-[#111110] border-y border-[#242422] relative overflow-hidden"
      aria-label="Cinematic Film Strip"
    >
      <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Film size={12} className="text-[#CBB998]" />
              <span className="font-mono-tech text-[10px] md:text-xs text-[#CBB998] tracking-[0.2em] uppercase">
                {ARCHIVE_CONFIG.sequenceSection.badge}
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl text-[#EAE8E2] leading-tight">
              {ARCHIVE_CONFIG.sequenceSection.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#92918B] mt-1 max-w-xl">
              {ARCHIVE_CONFIG.sequenceSection.description}
            </p>
          </div>

          {/* Navigation Arrows for Track */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll('left')}
              className="p-2 rounded border border-[#242422] bg-[#161615] text-[#92918B] hover:text-[#EAE8E2] hover:border-[#3B3B37] transition-colors"
              aria-label="Scroll film strip left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-2 rounded border border-[#242422] bg-[#161615] text-[#92918B] hover:text-[#EAE8E2] hover:border-[#3B3B37] transition-colors"
              aria-label="Scroll film strip right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Film Strip Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
        >
          {episodes.map((ep, idx) => (
            <div
              key={idx}
              onClick={() => onSelectEpisode(seriesArtwork, idx)}
              className="group shrink-0 w-[85vw] sm:w-[460px] md:w-[540px] snap-start flex flex-col cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectEpisode(seriesArtwork, idx);
                }
              }}
              aria-label={`View ${ep.act}: ${ep.title}`}
            >
              {/* Film Frame Box */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded bg-[#161615] border border-[#242422] group-hover:border-[#CBB998]/60 transition-colors">
                <img
                  src={ep.thumb || ep.src}
                  alt={ep.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  loading="lazy"
                />

                {/* Film Overlay Timecode */}
                <div className="absolute top-3 left-3 bg-[#0B0B0A]/70 backdrop-blur-md px-2.5 py-1 rounded border border-[#242422] font-mono-tech text-[10px] text-[#CBB998] tracking-widest">
                  {ep.timecode || `SEQ 0${idx + 1}`}
                </div>

                <div className="absolute top-3 right-3 font-mono-tech text-[10px] text-[#92918B] bg-[#0B0B0A]/60 px-2 py-0.5 rounded">
                  {ep.act}
                </div>
              </div>

              {/* Episode Details */}
              <div className="pt-3">
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="font-editorial text-lg text-[#EAE8E2] group-hover:text-[#CBB998] transition-colors">
                    {ep.title}
                  </h3>
                  <span className="font-mono-tech text-[10px] text-[#5E5D57]">
                    FRAME 0{idx + 1}/0{episodes.length}
                  </span>
                </div>
                {ep.caption && (
                  <p className="text-xs text-[#92918B] line-clamp-2">
                    {ep.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
