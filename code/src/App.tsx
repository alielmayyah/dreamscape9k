import React, { useState, useEffect } from 'react';
import { ARTWORKS_DATA } from './data/artworks';
import { GridCols } from './types/artwork';
import { ArtworkGrid } from './components/ArtworkGrid';
import { ArtworkLightbox } from './components/ArtworkLightbox';
import { FloatingControls } from './components/FloatingControls';

export const App: React.FC = () => {
  const [gridCols, setGridCols] = useState<GridCols>(4);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Ensure dark mode is permanently set on document
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const selectedArtwork = selectedIndex !== null ? ARTWORKS_DATA[selectedIndex] : null;

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % ARTWORKS_DATA.length);
  };

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + ARTWORKS_DATA.length) % ARTWORKS_DATA.length);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#ededed]">
      {/* Main Gallery Grid - Starts immediately at top with zero header distraction */}
      <ArtworkGrid
        artworks={ARTWORKS_DATA}
        gridCols={gridCols}
        onSelectArtwork={(_, idx) => setSelectedIndex(idx)}
      />

      {/* Fixed Minimal Floating Controls: Density (1=List, 2, 3, 4) */}
      <FloatingControls
        gridCols={gridCols}
        onGridColsChange={setGridCols}
      />

      {/* Clean Fullscreen Viewer */}
      <ArtworkLightbox
        artwork={selectedArtwork}
        currentIndex={selectedIndex ?? 0}
        totalCount={ARTWORKS_DATA.length}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        onNext={handleNext}
        onPrev={handlePrev}
        neighbours={{
          prev: selectedIndex !== null ? ARTWORKS_DATA[(selectedIndex - 1 + ARTWORKS_DATA.length) % ARTWORKS_DATA.length] : null,
          next: selectedIndex !== null ? ARTWORKS_DATA[(selectedIndex + 1) % ARTWORKS_DATA.length] : null,
        }}
      />
    </div>
  );
};

export default App;
