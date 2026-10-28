import React, { useState } from 'react';
import { ARTWORKS_DATA } from './data/artworks';
import { GridCols } from './types/artwork';
import { GalleryHeader } from './components/GalleryHeader';
import { ArtworkGrid } from './components/ArtworkGrid';
import { ArtworkLightbox } from './components/ArtworkLightbox';
import { GalleryFooter } from './components/GalleryFooter';

export const App: React.FC = () => {
  const [gridCols, setGridCols] = useState<GridCols>(3);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
    <div className="min-h-screen bg-[#080808] text-[#ededed] flex flex-col">
      {/* Discreet 56px Header */}
      <GalleryHeader
        totalCount={ARTWORKS_DATA.length}
        gridCols={gridCols}
        onGridColsChange={setGridCols}
      />

      {/* Main Gallery Grid - Starts Immediately */}
      <ArtworkGrid
        artworks={ARTWORKS_DATA}
        gridCols={gridCols}
        onSelectArtwork={(_, idx) => setSelectedIndex(idx)}
      />

      {/* Minimal 1-line Footer */}
      <GalleryFooter totalCount={ARTWORKS_DATA.length} />

      {/* Clean Fullscreen Viewer */}
      <ArtworkLightbox
        artwork={selectedArtwork}
        currentIndex={selectedIndex ?? 0}
        totalCount={ARTWORKS_DATA.length}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </div>
  );
};

export default App;
