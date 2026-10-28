import React from 'react';
import { ARCHIVE_CONFIG } from '../config/archive.config';
import { ArrowUp } from 'lucide-react';

interface SiteFooterProps {
  totalCount: number;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ totalCount }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 border-t border-[#242422] bg-[#0E0E0D] text-[#92918B] font-mono-tech text-xs">
      <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-14 border-b border-[#242422]/60">
          {/* Colophon Block */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CBB998]" />
              <span className="text-[#EAE8E2] text-sm font-semibold tracking-wider">
                {ARCHIVE_CONFIG.title}
              </span>
            </div>
            <p className="text-[#5E5D57] leading-relaxed max-w-sm text-[11px]">
              {ARCHIVE_CONFIG.exhibitionNote}
            </p>
          </div>

          {/* Technical Standards */}
          <div className="md:col-span-4">
            <span className="text-[#EAE8E2] uppercase tracking-wider block mb-2 text-[11px]">
              ARCHIVAL METRICS
            </span>
            <ul className="space-y-1.5 text-[11px] text-[#5E5D57]">
              <li>TOTAL FRAMES: {totalCount} STILLS</li>
              <li>ASPECT RATIOS: 16:9 / 2.35:1 / 9:16</li>
              <li>ENCODING: 2K / 4K SYNTHETIC ANAMORPHIC</li>
              <li>ESTABLISHED: {ARCHIVE_CONFIG.establishedYear}</li>
            </ul>
          </div>

          {/* Colophon Data */}
          <div className="md:col-span-3 flex flex-col justify-between items-start md:items-end">
            <div className="text-left md:text-right">
              <span className="text-[#EAE8E2] uppercase tracking-wider block mb-2 text-[11px]">
                COLOPHON
              </span>
              <p className="text-[#5E5D57] text-[11px]">
                {ARCHIVE_CONFIG.colophon.curation}
              </p>
              <p className="text-[#5E5D57] text-[11px]">
                {ARCHIVE_CONFIG.colophon.licensing}
              </p>
            </div>

            <button
              onClick={scrollToTop}
              className="mt-6 flex items-center gap-2 text-[#92918B] hover:text-[#EAE8E2] transition-colors border border-[#242422] bg-[#161615] px-3 py-1.5 rounded text-[11px]"
              aria-label="Back to top of exhibition"
            >
              <span>RETURN TO TOP</span>
              <ArrowUp size={12} />
            </button>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#5E5D57]">
          <span>© {new Date().getFullYear()} {ARCHIVE_CONFIG.title}. ALL FRAMES DISPLAYED FOR DIGITAL EXHIBITION.</span>
          <span className="tracking-widest">AUTONOMOUS ART DIRECTION</span>
        </div>
      </div>
    </footer>
  );
};
