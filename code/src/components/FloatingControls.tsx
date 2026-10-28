import React from 'react';
import { GridCols } from '../types/artwork';
import { RectangleHorizontal, Columns2, Columns3, LayoutGrid } from 'lucide-react';

interface FloatingControlsProps {
  gridCols: GridCols;
  onGridColsChange: (cols: GridCols) => void;
}

const LAYOUTS: {
  cols: GridCols;
  label: string;
  title: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { cols: 1, label: 'Row', title: 'Single row full-width view (1 in row)', Icon: RectangleHorizontal },
  { cols: 2, label: '2 Col', title: 'Two columns view (2 in row)', Icon: Columns2 },
  { cols: 3, label: '3 Col', title: 'Three columns view (3 in row)', Icon: Columns3 },
  { cols: 4, label: 'Grid', title: 'Grid view (4 in row)', Icon: LayoutGrid },
];

export const FloatingControls: React.FC<FloatingControlsProps> = ({
  gridCols,
  onGridColsChange,
}) => {
  return (
    <aside
      aria-label="Gallery layout switcher"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center p-1 rounded-full border border-[#222222] bg-[#0a0a0a]/90 shadow-2xl backdrop-blur-md text-[#888888] transition-all duration-300"
    >
      <div className="flex items-center gap-1">
        {LAYOUTS.map(({ cols, label, title, Icon }) => {
          const isActive = gridCols === cols;
          return (
            <button
              key={cols}
              onClick={() => onGridColsChange(cols)}
              title={title}
              aria-label={title}
              aria-pressed={isActive}
              className={`h-7 sm:h-8 flex items-center justify-center gap-1.5 rounded-full transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-[#666] ${
                isActive
                  ? 'px-3 bg-[#222222] text-[#ffffff] font-medium shadow-sm'
                  : 'w-7 sm:w-8 text-[#777777] hover:text-[#ffffff] hover:bg-[#161616]'
              }`}
            >
              <Icon size={14} className="shrink-0" />
              {isActive && (
                <span className="text-[11px] font-mono tracking-tight whitespace-nowrap">
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
