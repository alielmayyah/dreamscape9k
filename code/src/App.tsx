import React, { useState, useEffect } from 'react';
import { ARTWORKS_DATA } from './data/artworks';
import { GridCols, ThemeMode } from './types/artwork';
import { ArtworkGrid } from './components/ArtworkGrid';
import { ArtworkLightbox } from './components/ArtworkLightbox';
import { FloatingControls } from './components/FloatingControls';

export const App: React.FC = () => {
  const [gridCols, setGridCols] = useState<GridCols>(3);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Sync theme with document root
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#000000] text-[#ededed]' : 'bg-[#ffffff] text-[#111111]'
      }`}
    >
      {/* Main Gallery Grid - Starts immediately at top with zero header distraction */}
      <ArtworkGrid
        artworks={ARTWORKS_DATA}
        gridCols={gridCols}
        onSelectArtwork={(_, idx) => setSelectedIndex(idx)}
      />

      {/* Fixed Minimal Floating Controls: Density (1=List, 2, 3, 4) & Light/Dark */}
      <FloatingControls
        gridCols={gridCols}
        onGridColsChange={setGridCols}
        theme={theme}
        onThemeToggle={toggleTheme}
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
      />
    </div>
  );
};

export default App;
