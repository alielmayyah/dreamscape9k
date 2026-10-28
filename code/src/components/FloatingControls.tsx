import React from 'react';
import { GridCols, ThemeMode } from '../types/artwork';
import { Sun, Moon } from 'lucide-react';

interface FloatingControlsProps {
  gridCols: GridCols;
  onGridColsChange: (cols: GridCols) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
  gridCols,
  onGridColsChange,
  theme,
  onThemeToggle,
}) => {
  const isDark = theme === 'dark';

  return (
    <aside
      aria-label="Gallery display controls"
      className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-1.5 p-1.5 rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 ${
        isDark
          ? 'bg-[#0a0a0a]/85 border-[#222222] text-[#888888]'
          : 'bg-[#ffffff]/90 border-[#e0e0e0] text-[#666666]'
      }`}
    >
      {/* Column Density Controls (Photos per row: 1=List, 2, 3, 4) */}
      <div className="flex items-center gap-1">
        {([1, 2, 3, 4] as GridCols[]).map((cols) => {
          const isActive = gridCols === cols;
          return (
            <button
              key={cols}
              onClick={() => onGridColsChange(cols)}
              className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-mono transition-colors ${
                isActive
                  ? isDark
                    ? 'bg-[#222222] text-[#ffffff] font-semibold'
                    : 'bg-[#111111] text-[#ffffff] font-semibold'
                  : isDark
                  ? 'hover:text-[#ffffff] hover:bg-[#161616]'
                  : 'hover:text-[#111111] hover:bg-[#f0f0f0]'
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

      {/* Subtle vertical separator */}
      <span
        className={`w-px h-3.5 mx-0.5 ${
          isDark ? 'bg-[#252525]' : 'bg-[#e0e0e0]'
        }`}
      />

      {/* Light / Dark Mode Toggle */}
      <button
        onClick={onThemeToggle}
        className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
          isDark
            ? 'hover:text-[#ffffff] hover:bg-[#161616]'
            : 'hover:text-[#111111] hover:bg-[#f0f0f0]'
        }`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Pitch Black Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Pitch Black Mode'}
      >
        {isDark ? <Sun size={13} /> : <Moon size={13} />}
      </button>
    </aside>
  );
};
