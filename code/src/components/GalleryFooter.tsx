import React from 'react';

interface GalleryFooterProps {
  totalCount: number;
}

export const GalleryFooter: React.FC<GalleryFooterProps> = ({ totalCount }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 sm:mt-24 border-t border-[#111111] py-8 text-xs font-mono text-[#555]">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
        <span>ARCHIVE // {totalCount} STILLS</span>
        <button
          onClick={scrollToTop}
          className="hover:text-[#aaa] transition-colors"
          aria-label="Back to top"
        >
          TOP ↑
        </button>
      </div>
    </footer>
  );
};
