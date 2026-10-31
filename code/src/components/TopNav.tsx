import React from 'react';
import { ViewMode } from '../types/artwork';
import { LayoutGrid, Film } from 'lucide-react';

interface TopNavProps {
  viewMode: ViewMode;
  totalFrames: number;
  totalProjects: number;
  onViewModeChange: (mode: ViewMode) => void;
  onHomeClick: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  viewMode,
  totalFrames,
  totalProjects,
  onViewModeChange,
  onHomeClick,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#000000]/85 backdrop-blur-md border-b border-[#151515] transition-colors select-none">
      <div className="gallery-container h-14 sm:h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={onHomeClick}
          className="group flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
          aria-label="Dreamscape Archive Home"
        >
          <div className="w-2 h-2 rounded-full bg-[#ffffff] group-hover:scale-125 transition-transform" />
          <div className="flex flex-col">
            <span className="text-[13px] sm:text-[14px] font-mono font-medium tracking-[0.2em] uppercase text-[#ededed] group-hover:text-white transition-colors">
              Dreamscape
            </span>
          </div>
        </button>

        {/* View Switcher: Frames vs Projects */}
        <nav
          aria-label="Archive view switcher"
          className="flex items-center p-1 rounded-full bg-[#0d0d0d] border border-[#202020] shadow-inner"
        >
          <button
            onClick={() => onViewModeChange('gallery')}
            aria-pressed={viewMode === 'gallery'}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-[12px] font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer focus:outline-none ${
              viewMode === 'gallery'
                ? 'bg-[#222222] text-[#ffffff] font-medium shadow-sm'
                : 'text-[#777777] hover:text-[#cccccc] hover:bg-[#151515]'
            }`}
          >
            <LayoutGrid size={13} className="shrink-0" />
            <span>Frames</span>
            <span className="text-[10px] text-[#888888] font-mono">({totalFrames})</span>
          </button>

          <button
            onClick={() => onViewModeChange('projects')}
            aria-pressed={viewMode === 'projects'}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-[12px] font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer focus:outline-none ${
              viewMode === 'projects'
                ? 'bg-[#222222] text-[#ffffff] font-medium shadow-sm'
                : 'text-[#777777] hover:text-[#cccccc] hover:bg-[#151515]'
            }`}
          >
            <Film size={13} className="shrink-0" />
            <span>Projects</span>
            <span className="text-[10px] text-[#888888] font-mono">({totalProjects})</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
