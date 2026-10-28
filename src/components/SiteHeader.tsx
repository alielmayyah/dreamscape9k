import React, { useState, useEffect } from 'react';
import { ARCHIVE_CONFIG } from '../config/archive.config';
import { ViewMode } from '../types/artwork';
import { LayoutGrid, Columns3 } from 'lucide-react';

interface SiteHeaderProps {
  totalCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  totalCount,
  viewMode,
  onViewModeChange,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0B0B0A]/90 backdrop-blur-md border-b border-[#242422]/80 py-3.5 shadow-2xl'
          : 'bg-transparent border-b border-transparent py-5 md:py-6'
      }`}
    >
      <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 flex items-center justify-between">
        {/* Archive Title & Status */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="group flex items-center gap-2.5 text-[#EAE8E2] tracking-wider focus:outline-none focus:ring-1 focus:ring-[#B5ADA0]"
            aria-label={`${ARCHIVE_CONFIG.title} homepage`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#CBB998] shadow-[0_0_8px_rgba(203,185,152,0.8)] animate-pulse" />
            <span className="font-mono-tech text-xs md:text-sm font-semibold tracking-[0.16em]">
              {ARCHIVE_CONFIG.title}
            </span>
          </a>

          <span className="hidden sm:inline-block text-[#5E5D57] font-mono-tech text-xs">
            /
          </span>

          <span className="hidden sm:inline-block text-[#92918B] font-mono-tech text-[11px] tracking-wider uppercase">
            {ARCHIVE_CONFIG.descriptor}
          </span>
        </div>

        {/* Controls & Frame Count */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="font-mono-tech text-[11px] text-[#92918B] tracking-wider px-2.5 py-1 rounded border border-[#242422] bg-[#121211]/60">
            <span className="text-[#EAE8E2] font-medium">{String(totalCount).padStart(2, '0')}</span> FRAMES
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-[#242422] bg-[#121211]/80 rounded p-0.5">
            <button
              onClick={() => onViewModeChange('editorial')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'editorial'
                  ? 'bg-[#242422] text-[#EAE8E2]'
                  : 'text-[#5E5D57] hover:text-[#92918B]'
              }`}
              title="Curated Asymmetrical Layout"
              aria-label="Switch to curated asymmetrical layout"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => onViewModeChange('compact')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'compact'
                  ? 'bg-[#242422] text-[#EAE8E2]'
                  : 'text-[#5E5D57] hover:text-[#92918B]'
              }`}
              title="Compact Grid"
              aria-label="Switch to compact grid"
            >
              <Columns3 size={14} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
