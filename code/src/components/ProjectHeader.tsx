import React from 'react';
import { ProjectInfo } from '../types/artwork';
import { ArrowLeft } from 'lucide-react';

interface ProjectHeaderProps {
  project: ProjectInfo;
  onBack: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, onBack }) => {
  return (
    <header className="gallery-container pt-6 pb-4 sm:pt-8 sm:pb-6 flex items-center justify-between border-b border-[#181818] mb-4 sm:mb-6 select-none animate-fadeIn">
      {/* Back button */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 py-1.5 px-3 -ml-3 rounded-full text-[#888888] hover:text-[#ffffff] hover:bg-[#141414] transition-all cursor-pointer text-[12px] font-mono tracking-tight"
        title="Return to all artwork (Esc)"
        aria-label="Return to all artwork"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        <span>All Frames</span>
        <span className="text-[#444444] text-[10px] hidden sm:inline">(Esc)</span>
      </button>

      {/* Project Title & Count */}
      <div className="flex items-center gap-2.5">
        <h1 className="text-[13px] sm:text-[14px] font-mono font-medium tracking-wider uppercase text-[#ededed]">
          {project.title}
        </h1>
        <span className="w-1 h-1 rounded-full bg-[#444444]" />
        <span className="text-[11px] font-mono text-[#666666] tracking-wide">
          {project.frameCount} {project.frameCount === 1 ? 'Frame' : 'Frames'}
        </span>
      </div>
    </header>
  );
};
