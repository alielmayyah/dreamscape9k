import { ARTWORKS_DATA, PROJECTS_CONFIG } from '../data/artworks';
import { ProjectSummary, Artwork } from '../types/artwork';

export function getProjectSummaries(): ProjectSummary[] {
  return PROJECTS_CONFIG.map((config) => {
    const projectArtworks = ARTWORKS_DATA.filter(
      (a) => a.project?.id === config.id
    ).sort((a, b) => a.src.localeCompare(b.src));

    const cover =
      projectArtworks.find((a) => a.src.includes(config.coverStem)) ||
      projectArtworks[0];

    return {
      id: config.id,
      title: config.title,
      subtitle: config.subtitle,
      frameCount: projectArtworks.length,
      coverArtwork: cover,
      previewArtworks: projectArtworks,
    };
  });
}

export function getProjectArtworks(projectId: string): Artwork[] {
  return ARTWORKS_DATA.filter((a) => a.project?.id === projectId).sort((a, b) =>
    a.src.localeCompare(b.src)
  );
}

