import React from 'react';
import { GridCols } from '../types/artwork';

interface GalleryHeaderProps {
  totalCount: number;
  gridCols: GridCols;
  onGridColsChange: (cols: GridCols) => void;
}

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
  totalCount,
  gridCols,
  onGridColsChange,
}) => {
  return (
    <header className="sticky top-0 z-40 h-14 bg-[#080808]/90 backdrop-blur-sm border-b border-[#141414] transition-colors">
      <div className="max-w-[1800px] mx-auto h-full px-4 sm:px-6 md:px-8 flex items-center justify-between">
        {/* Left: Tiny neutral title */}
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EAE8E2]/60" />
          <span className="text-xs tracking-[0.22em] text-[#EAE8E2] uppercase font-medium select-none">
            ARCHIVE
          </span>
        </div>

        {/* Right: Discreet column density toggle & count */}
        <div className="flex items-center gap-4 text-xs font-mono text-[#777]">
          {/* Desktop Column Toggle */}
          <div className="hidden md:flex items-center gap-1 bg-[#121212] p-0.5 rounded border border-[#1f1f1f]">
            <button
              onClick={() => onGridColsChange(3)}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                gridCols === 3
                  ? 'bg-[#222] text-[#ededed] font-medium'
                  : 'text-[#666] hover:text-[#aaa]'
              }`}
              title="3 Columns"
              aria-label="3 columns"
            >
              3
            </button>
            <button
              onClick={() => onGridColsChange(4)}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                gridCols === 4
                  ? 'bg-[#222] text-[#ededed] font-medium'
                  : 'text-[#666] hover:text-[#aaa]'
              }`}
              title="4 Columns"
              aria-label="4 columns"
            >
              4
            </button>
          </div>

          <span className="text-[11px] tracking-widest text-[#555] select-none">
            {totalCount} FRAMES
          </span>
        </div>
      </div>
    </header>
  );
};
