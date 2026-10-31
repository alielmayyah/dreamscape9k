import React, { useRef, useEffect } from 'react';
import { ViewMode } from '../types/artwork';
import { LayoutGrid, Film } from 'lucide-react';
import gsap from 'gsap';

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
  const framesBtnRef = useRef<HTMLButtonElement>(null);
  const projectsBtnRef = useRef<HTMLButtonElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const targetBtn = viewMode === 'gallery' ? framesBtnRef.current : projectsBtnRef.current;
    if (!targetBtn || !indicatorRef.current) return;

    const navContainer = targetBtn.parentElement;
    if (!navContainer) return;

    const navRect = navContainer.getBoundingClientRect();
    const btnRect = targetBtn.getBoundingClientRect();
    const x = btnRect.left - navRect.left;
    const width = btnRect.width;

    if (!hasInitialized.current) {
      gsap.set(indicatorRef.current, { x, width, opacity: 1 });
      hasInitialized.current = true;
    } else {
      gsap.to(indicatorRef.current, {
        x,
        width,
        opacity: 1,
        duration: 0.35,
        ease: 'power3.out',
      });
    }
  }, [viewMode]);

  // Recalculate on resize
  useEffect(() => {
    const handleResize = () => {
      const targetBtn = viewMode === 'gallery' ? framesBtnRef.current : projectsBtnRef.current;
      if (!targetBtn || !indicatorRef.current) return;
      const navContainer = targetBtn.parentElement;
      if (!navContainer) return;
      const navRect = navContainer.getBoundingClientRect();
      const btnRect = targetBtn.getBoundingClientRect();
      gsap.set(indicatorRef.current, {
        x: btnRect.left - navRect.left,
        width: btnRect.width,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

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

        {/* View Switcher: Frames vs Projects with GSAP Sliding Pill Indicator */}
        <nav
          aria-label="Archive view switcher"
          className="relative flex items-center p-1 rounded-full bg-[#0d0d0d] border border-[#202020] shadow-inner"
        >
          {/* Animated GSAP active pill */}
          <div
            ref={indicatorRef}
            className="absolute top-1 bottom-1 rounded-full bg-[#242424] border border-[#333333] shadow-sm pointer-events-none opacity-0 transition-opacity"
            style={{ left: 0 }}
          />

          <button
            ref={framesBtnRef}
            onClick={() => onViewModeChange('gallery')}
            aria-pressed={viewMode === 'gallery'}
            className={`relative z-10 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-[12px] font-mono tracking-wider uppercase transition-colors duration-200 cursor-pointer focus:outline-none ${
              viewMode === 'gallery'
                ? 'text-[#ffffff] font-medium'
                : 'text-[#777777] hover:text-[#cccccc]'
            }`}
          >
            <LayoutGrid size={13} className="shrink-0" />
            <span>Frames</span>
            <span className="text-[10px] text-[#888888] font-mono">({totalFrames})</span>
          </button>

          <button
            ref={projectsBtnRef}
            onClick={() => onViewModeChange('projects')}
            aria-pressed={viewMode === 'projects'}
            className={`relative z-10 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-[12px] font-mono tracking-wider uppercase transition-colors duration-200 cursor-pointer focus:outline-none ${
              viewMode === 'projects'
                ? 'text-[#ffffff] font-medium'
                : 'text-[#777777] hover:text-[#cccccc]'
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
