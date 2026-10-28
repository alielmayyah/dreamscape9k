import React from 'react';
import { GridCols } from '../types/artwork';

interface FloatingControlsProps {
  gridCols: GridCols;
  onGridColsChange: (cols: GridCols) => void;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
  gridCols,
  onGridColsChange,
}) => {
  return (
    <aside
      aria-label="Gallery display controls"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center p-1.5 rounded-full border border-[#222222] bg-[#0a0a0a]/85 shadow-lg backdrop-blur-md text-[#888888] transition-all duration-300"
    >
      {/* Column Density Controls (Photos per row: 1, 2, 3, 4) */}
      <div className="flex items-center gap-1">
        {([1, 2, 3, 4] as GridCols[]).map((cols) => {
          const isActive = gridCols === cols;
          return (
            <button
              key={cols}
              onClick={() => onGridColsChange(cols)}
              className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-mono transition-colors ${
                isActive
                  ? 'bg-[#222222] text-[#ffffff] font-semibold'
                  : 'hover:text-[#ffffff] hover:bg-[#161616]'
              }`}
              title={cols === 1 ? 'List view (1 in row)' : `${cols} in row`}
              aria-label={cols === 1 ? 'List view' : `${cols} photos per row`}
              aria-pressed={isActive}
            >
              {cols}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
