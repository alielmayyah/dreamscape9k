import React from 'react';
import { Category } from '../types/artwork';
import { ARCHIVE_CONFIG } from '../config/archive.config';

interface CollectionFiltersProps {
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
  categoryCounts: Record<Category, number>;
}

export const CollectionFilters: React.FC<CollectionFiltersProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div className="w-full border-y border-[#242422] bg-[#0B0B0A]/80 backdrop-blur-md sticky top-[61px] z-30">
      <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 py-3 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
        <nav
          className="flex items-center gap-2 sm:gap-3 flex-nowrap min-w-max"
          aria-label="Filter gallery by category"
        >
          {ARCHIVE_CONFIG.categories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono-tech transition-all duration-200 border ${
                  isActive
                    ? 'bg-[#EAE8E2] text-[#0B0B0A] border-[#EAE8E2] font-semibold'
                    : 'bg-[#121211] text-[#92918B] border-[#242422] hover:border-[#3B3B37] hover:text-[#EAE8E2]'
                }`}
                aria-pressed={isActive}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-[#0B0B0A]/20 text-[#0B0B0A]'
                      : 'bg-[#181816] text-[#5E5D57] group-hover:text-[#92918B]'
                  }`}
                >
                  {String(count).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center text-[11px] font-mono-tech text-[#5E5D57]">
          <span>SELECT TO FILTER ARCHIVE</span>
        </div>
      </div>
    </div>
  );
};
