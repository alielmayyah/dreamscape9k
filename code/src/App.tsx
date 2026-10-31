import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ARTWORKS_DATA } from './data/artworks';
import { GridCols, ViewMode } from './types/artwork';
import { ArtworkGrid } from './components/ArtworkGrid';
import { ArtworkLightbox } from './components/ArtworkLightbox';
import { FloatingControls } from './components/FloatingControls';
import { TopNav } from './components/TopNav';
import { ProjectsOverview } from './components/ProjectsOverview';
import { ProjectStoryView } from './components/ProjectStoryView';
import { getProjectSummaries, getProjectArtworks } from './utils/projects';
import gsap from 'gsap';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

export const App: React.FC = () => {
  const [gridCols, setGridCols] = useState<GridCols>(4);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Initialize view mode and project from URL query params
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'gallery';
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'projects' || params.has('project') ? 'projects' : 'gallery';
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('project') || null;
  });

  // Permanently ensure OLED dark mode is active on document
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const projects = useMemo(() => getProjectSummaries(), []);

  // Filter artworks for the active project or display all frames
  const currentArtworks = useMemo(() => {
    if (activeProjectId) {
      const filtered = getProjectArtworks(activeProjectId);
      return filtered.length > 0 ? filtered : ARTWORKS_DATA;
    }
    return ARTWORKS_DATA;
  }, [activeProjectId]);

  const activeProjectInfo = useMemo(() => {
    if (!activeProjectId) return null;
    const found = projects.find((p) => p.id === activeProjectId);
    if (found) {
      return {
        id: found.id,
        title: found.title,
        frameCount: found.frameCount,
      };
    }
    const firstMatch = ARTWORKS_DATA.find((a) => a.project?.id === activeProjectId);
    return firstMatch?.project || null;
  }, [activeProjectId, projects]);

  const activeProjectSubtitle = useMemo(() => {
    if (!activeProjectId) return undefined;
    const found = projects.find((p) => p.id === activeProjectId);
    return found?.subtitle;
  }, [activeProjectId, projects]);

  const nextProject = useMemo(() => {
    if (!activeProjectId || projects.length === 0) return null;
    const currentIndex = projects.findIndex((p) => p.id === activeProjectId);
    if (currentIndex === -1) return null;
    const nextIdx = (currentIndex + 1) % projects.length;
    return projects[nextIdx];
  }, [activeProjectId, projects]);

  // GSAP View Transition when switching between Gallery, Projects, or Project Detail
  const currentViewKey = activeProjectId || (viewMode === 'projects' ? 'projects-overview' : 'gallery');
  useEffect(() => {
    if (prefersReducedMotion || !mainContentRef.current) return;
    gsap.fromTo(
      mainContentRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
    );
  }, [currentViewKey, prefersReducedMotion]);

  // Sync state with browser back/forward history
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const proj = params.get('project');
      const view = params.get('view');
      setActiveProjectId(proj || null);
      setViewMode(view === 'projects' || Boolean(proj) ? 'projects' : 'gallery');
      setSelectedIndex(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Navigation handlers
  const handleSelectProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    setViewMode('projects');
    setSelectedIndex(null);
    const url = new URL(window.location.href);
    url.searchParams.set('project', projectId);
    url.searchParams.delete('view');
    window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleBackToProjects = useCallback(() => {
    setActiveProjectId(null);
    setViewMode('projects');
    setSelectedIndex(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('project');
    url.searchParams.set('view', 'projects');
    window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setActiveProjectId(null);
    setSelectedIndex(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('project');
    if (mode === 'projects') {
      url.searchParams.set('view', 'projects');
    } else {
      url.searchParams.delete('view');
    }
    window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleHomeClick = useCallback(() => {
    handleViewModeChange('gallery');
  }, [handleViewModeChange]);

  // Pressing Esc when not in lightbox returns to Projects or All Frames
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedIndex === null && activeProjectId) {
        handleBackToProjects();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, activeProjectId, handleBackToProjects]);

  const selectedArtwork = selectedIndex !== null ? currentArtworks[selectedIndex] : null;

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % currentArtworks.length);
  };

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + currentArtworks.length) % currentArtworks.length);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#ededed]">
      {/* Global Minimal Top Bar with GSAP animated sliding indicator */}
      <TopNav
        viewMode={activeProjectId ? 'projects' : viewMode}
        totalFrames={ARTWORKS_DATA.length}
        totalProjects={projects.length}
        onViewModeChange={handleViewModeChange}
        onHomeClick={handleHomeClick}
      />

      {/* Main Content Area */}
      <main ref={mainContentRef}>
        {/* 1. Projects Overview View */}
        {viewMode === 'projects' && !activeProjectId && (
          <ProjectsOverview
            projects={projects}
            onSelectProject={handleSelectProject}
          />
        )}

        {/* 2. Specific Project Story View (Alternating PHOTO EMPTY / EMPTY PHOTO narrative) */}
        {activeProjectId && activeProjectInfo && (
          <ProjectStoryView
            key={activeProjectId}
            project={activeProjectInfo}
            artworks={currentArtworks}
            subtitle={activeProjectSubtitle}
            onSelectArtwork={(_, idx) => setSelectedIndex(idx)}
            onBack={handleBackToProjects}
            onNextProject={nextProject ? () => handleSelectProject(nextProject.id) : undefined}
            nextProjectTitle={nextProject?.title}
          />
        )}

        {/* 3. All Frames Flat Gallery View */}
        {viewMode === 'gallery' && !activeProjectId && (
          <div className="pt-6 sm:pt-8">
            <ArtworkGrid
              key="all"
              artworks={currentArtworks}
              gridCols={gridCols}
              onSelectArtwork={(_, idx) => setSelectedIndex(idx)}
            />
          </div>
        )}
      </main>

      {/* Floating Layout Controls (visible only in flat Gallery view) */}
      {viewMode === 'gallery' && !activeProjectId && (
        <FloatingControls
          gridCols={gridCols}
          onGridColsChange={setGridCols}
        />
      )}

      {/* Fullscreen Lightbox with GSAP animations */}
      <ArtworkLightbox
        artwork={selectedArtwork}
        currentIndex={selectedIndex ?? 0}
        totalCount={currentArtworks.length}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        onNext={handleNext}
        onPrev={handlePrev}
        onViewProject={handleSelectProject}
        isProjectScoped={Boolean(activeProjectId)}
        neighbours={{
          prev:
            selectedIndex !== null
              ? currentArtworks[(selectedIndex - 1 + currentArtworks.length) % currentArtworks.length]
              : null,
          next:
            selectedIndex !== null
              ? currentArtworks[(selectedIndex + 1) % currentArtworks.length]
              : null,
        }}
      />
    </div>
  );
};

export default App;
