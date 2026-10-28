# ARCHIVE // 2.39:1 — Cinematic AI Artwork Archive

An anonymous, immersive digital art exhibition engineered for showcasing cinematic AI-generated frames, 3-act narrative series, and editorial photography.

Built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **GSAP**, and **Lucide Icons**, configured for automated static deployment via **GitHub Actions** to **GitHub Pages**.

---

## 🏛️ Creative Vision & Principles

* **Artwork Dominance**: The interface is minimal, dark, and unobtrusive. The artwork, composition, and negative space dictate the visual hierarchy.
* **Strict Anonymity**: Completely impersonal. No author name, avatar, bio, or fake studio identity. The exhibition speaks for itself.
* **Landscape-First Editorial Layout**: Alternating asymmetrical rhythms, 12-column responsive layout, 4K panoramic features, and intentional negative space.
* **Three-Act Narrative Trilogies**: Dedicated multi-act series viewers with sequential timecodes and frame scrubbers (*The Hotel*, *The Taxi*).
* **Cinematic Lightbox**: Full-screen viewer supporting keyboard navigation (`←`, `→`, `Esc`), mobile swipe gestures, body scroll locking, and losslessly rendered 2K/4K masters.
* **Motion & Accessibility**: GSAP entrance timelines and ScrollTrigger reveals with automatic `prefers-reduced-motion` compliance.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | React 19 (Component Architecture) |
| **Language** | TypeScript (Strict Typing) |
| **Build Tool** | Vite 8 + `@tailwindcss/vite` |
| **Styling** | Tailwind CSS v4 + Editorial Typography (Cormorant Garamond, Inter, Space Mono) |
| **Motion** | GSAP 3.15 + GSAP ScrollTrigger |
| **Icons** | Lucide React |
| **Hosting** | GitHub Pages (Static build via GitHub Actions) |

---

## 🚀 Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

3. Typecheck & Build:
   ```bash
   npm run typecheck
   npm run build
   ```

---

## 🌐 GitHub Pages Deployment

The repository includes an automated CI/CD workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy cinematic archive"
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### 2. Enable GitHub Pages in Repository Settings
1. Go to your repository on GitHub.
2. Navigate to **Settings** &rarr; **Pages**.
3. Under **Build and deployment** &rarr; **Source**, select **GitHub Actions**.
4. The workflow will automatically run, build, and publish your site at:
   `https://<your-username>.github.io/<your-repo-name>/`

*The Vite base path is set to `./` so all assets and images resolve cleanly regardless of your repository name.*

---

## 📸 Managing & Adding Artwork

### Method A: Automated CLI Script (Recommended)
Run the included `publish.py` helper to automatically copy the artwork to `public/images/artwork/`, generate optimized WebP thumbnails in `public/images/thumbs/`, calculate aspect ratio, and append the typed definition to `src/data/artworks.ts`:

```bash
python publish.py --image "my_frame.jpg" --title "Midnight Crossing" --category "nocturne" --desc "A cold fog over the harbor" --build
```

### Method B: Manual Addition
1. Place your full-resolution image in `public/images/artwork/`.
2. (Optional) Place a WebP thumbnail in `public/images/thumbs/`.
3. Add a typed entry in [`src/data/artworks.ts`](src/data/artworks.ts):

```typescript
{
  id: 'frame-026',
  sequenceNumber: '026',
  title: 'Midnight Crossing',
  src: 'images/artwork/my_frame.jpg',
  thumb: 'images/thumbs/my_frame.webp',
  alt: 'A cold fog over the harbor',
  aspectRatio: '16:9',
  category: 'nocturne',
  description: 'A cold fog over the harbor',
  collection: 'Nocturne Studies',
  year: 2026,
  layout: 'standard', // 'panoramic' | 'wide' | 'standard' | 'tall'
  width: 2752,
  height: 1536,
  resolutionLabel: '2K Cinema'
}
```

---

## 📁 Repository Structure

```
best/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Automated GitHub Actions deployment
├── public/
│   └── images/
│       ├── artwork/              # Full-resolution master files (2K & 4K)
│       └── thumbs/               # Lightweight WebP thumbnails
├── src/
│   ├── components/
│   │   ├── SiteHeader.tsx        # Compact header with view toggle & frame count
│   │   ├── HeroSection.tsx       # Film-style opening frame with GSAP reveal
│   │   ├── CollectionFilters.tsx # Category navigation pills with frame counts
│   │   ├── ArtworkGallery.tsx    # Asymmetric, landscape-first editorial gallery
│   │   ├── ArtworkItem.tsx        # Individual frame card with hover zoom & metadata
│   │   ├── CinematicSequence.tsx # Horizontal film strip for multi-act narratives
│   │   ├── ArtworkLightbox.tsx   # Accessible full-screen viewer with touch & keyboard controls
│   │   └── SiteFooter.tsx        # Minimal colophon & technical specifications
│   ├── config/
│   │   └── archive.config.ts     # Central configuration for archive title & categories
│   ├── data/
│   │   └── artworks.ts           # Strongly typed artwork dataset (25+ frames)
│   ├── hooks/
│   │   ├── usePrefersReducedMotion.ts
│   │   └── useScrollLock.ts
│   ├── styles/
│   │   └── index.css             # Tailwind v4 styles, film grain, & typography
│   ├── types/
│   │   └── artwork.ts            # TypeScript definitions for artworks & episodes
│   ├── App.tsx                   # Main root application orchestrator
│   └── main.tsx                  # React entry point
├── index.html                    # HTML shell with Google Fonts
├── package.json                  # Dependencies & scripts
├── publish.py                    # Python helper CLI for publishing new stills
├── tsconfig.json                 # TypeScript strict compiler options
└── vite.config.ts                # Vite configuration with Tailwind & base path
```
