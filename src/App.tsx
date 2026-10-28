import React, { useState, useMemo } from 'react';
import { Artwork, Category, ViewMode } from './types/artwork';
import { ARTWORKS_DATA } from './data/artworks';
import { SiteHeader } from './components/SiteHeader';
import { HeroSection } from './components/HeroSection';
import { CollectionFilters } from './components/CollectionFilters';
import { CinematicSequence } from './components/CinematicSequence';
import { ArtworkGallery } from './components/ArtworkGallery';
import { ArtworkLightbox } from './components/ArtworkLightbox';
import { SiteFooter } from './components/SiteFooter';

export const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('editorial');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Hero artwork (first panoramic masterpiece)
  const heroArtwork = useMemo(() => ARTWORKS_DATA[0], []);

  // Sequence artwork for the horizontal film strip (The Taxi trilogy)
  const sequenceArtwork = useMemo(
    () => ARTWORKS_DATA.find((a) => a.id === 'series-the-taxi') || ARTWORKS_DATA[1],
    []
  );

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      all: ARTWORKS_DATA.length,
      series: 0,
      nocturne: 0,
      surreal: 0,
      vertical: 0,
    };

    ARTWORKS_DATA.forEach((art) => {
      if (counts[art.category] !== undefined) {
        counts[art.category]++;
      }
    });

    return counts;
  }, []);

  // Filtered artworks for the main gallery
  const filteredArtworks = useMemo(() => {
    if (activeCategory === 'all') {
      return ARTWORKS_DATA;
    }
    return ARTWORKS_DATA.filter((art) => art.category === activeCategory);
  }, [activeCategory]);

  // Lightbox handlers
  const handleOpenArtwork = (artwork: Artwork, episodeIndex: number = 0) => {
    setSelectedArtwork(artwork);
    setSelectedEpisodeIndex(episodeIndex);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handleNextArtwork = () => {
    if (!selectedArtwork) return;
    const currentIndex = filteredArtworks.findIndex((a) => a.id === selectedArtwork.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % filteredArtworks.length;
    setSelectedArtwork(filteredArtworks[nextIndex]);
    setSelectedEpisodeIndex(0);
  };

  const handlePrevArtwork = () => {
    if (!selectedArtwork) return;
    const currentIndex = filteredArtworks.findIndex((a) => a.id === selectedArtwork.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + filteredArtworks.length) % filteredArtworks.length;
    setSelectedArtwork(filteredArtworks[prevIndex]);
    setSelectedEpisodeIndex(0);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0A] text-[#EAE8E2] flex flex-col selection:bg-[#CBB998]/30 selection:text-[#EAE8E2]">
      {/* Subtle Analog Film Grain */}
      <div className="film-grain" aria-hidden="true" />

      {/* Header */}
      <SiteHeader
        totalCount={ARTWORKS_DATA.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1">
        {/* Editorial Hero */}
        <HeroSection
          heroArtwork={heroArtwork}
          onSelectArtwork={(art) => handleOpenArtwork(art, 0)}
        />

        {/* Collection Filter Bar */}
        <CollectionFilters
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          categoryCounts={categoryCounts}
        />

        {/* Horizontal Cinematic Sequence (featured in 'all' or 'series') */}
        {(activeCategory === 'all' || activeCategory === 'series') && sequenceArtwork && (
          <CinematicSequence
            seriesArtwork={sequenceArtwork}
            onSelectEpisode={(art, idx) => handleOpenArtwork(art, idx)}
          />
        )}

        {/* Main Landscape-First Asymmetric Gallery */}
        <ArtworkGallery
          artworks={filteredArtworks}
          viewMode={viewMode}
          onSelectArtwork={(art) => handleOpenArtwork(art, 0)}
        />
      </main>

      {/* Exhibition Colophon / Footer */}
      <SiteFooter totalCount={ARTWORKS_DATA.length} />

      {/* Full-Screen Cinema Lightbox */}
      <ArtworkLightbox
        artwork={selectedArtwork}
        activeEpisodeIndex={selectedEpisodeIndex}
        isOpen={isLightboxOpen}
        onClose={handleCloseLightbox}
        onNext={handleNextArtwork}
        onPrev={handlePrevArtwork}
      />
    </div>
  );
};

export default App;

