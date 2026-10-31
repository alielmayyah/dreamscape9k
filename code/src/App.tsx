import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ARTWORKS_DATA } from './data/artworks';
import { GridCols } from './types/artwork';
import { ArtworkGrid } from './components/ArtworkGrid';
import { ArtworkLightbox } from './components/ArtworkLightbox';
import { FloatingControls } from './components/FloatingControls';
import { ProjectHeader } from './components/ProjectHeader';

export const App: React.FC = () => {
  const [gridCols, setGridCols] = useState<GridCols>(4);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Read project from URL query param ?project=...
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('project') || null;
  });

  // Ensure dark mode is permanently set on document
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Filter artworks for the active project (or show all)
  const currentArtworks = useMemo(() => {
    if (!activeProjectId) return ARTWORKS_DATA;
    const filtered = ARTWORKS_DATA.filter((a) => a.project?.id === activeProjectId);
    return filtered.length > 0 ? filtered : ARTWORKS_DATA;
  }, [activeProjectId]);

  const activeProjectInfo = useMemo(() => {
    if (!activeProjectId) return null;
    const firstMatch = ARTWORKS_DATA.find((a) => a.project?.id === activeProjectId);
    return firstMatch?.project || null;
  }, [activeProjectId]);

  // Sync active project state with browser back/forward history
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveProjectId(params.get('project') || null);
      setSelectedIndex(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleOpenProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    setSelectedIndex(null);
    const url = new URL(window.location.href);
    url.searchParams.set('project', projectId);
    window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleBackToAll = useCallback(() => {
    setActiveProjectId(null);
    setSelectedIndex(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('project');
    window.history.pushState({}, '', url);
  }, []);

  // Pressing Esc when not in lightbox navigates back to All Frames
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedIndex === null && activeProjectId) {
        handleBackToAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, activeProjectId, handleBackToAll]);

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
      {/* Project View Header (if viewing a specific project) */}
      {activeProjectInfo && (
        <ProjectHeader
          project={activeProjectInfo}
          onBack={handleBackToAll}
        />
      )}

      {/* Gallery Grid */}
      <ArtworkGrid
        key={activeProjectId || 'all'}
        artworks={currentArtworks}
        gridCols={gridCols}
        onSelectArtwork={(_, idx) => setSelectedIndex(idx)}
      />

      {/* Fixed Floating Layout Controls */}
      <FloatingControls
        gridCols={gridCols}
        onGridColsChange={setGridCols}
      />

      {/* Fullscreen Viewer with 'View Project' Action Button */}
      <ArtworkLightbox
        artwork={selectedArtwork}
        currentIndex={selectedIndex ?? 0}
        totalCount={currentArtworks.length}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        onNext={handleNext}
        onPrev={handlePrev}
        onViewProject={handleOpenProject}
        isProjectScoped={Boolean(activeProjectId)}
        neighbours={{
          prev: selectedIndex !== null ? currentArtworks[(selectedIndex - 1 + currentArtworks.length) % currentArtworks.length] : null,
          next: selectedIndex !== null ? currentArtworks[(selectedIndex + 1) % currentArtworks.length] : null,
        }}
      />
    </div>
  );
};

export default App;
