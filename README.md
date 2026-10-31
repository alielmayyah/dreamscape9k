# Minimal Cinematic Image Gallery

A minimal, dark, cinematic image gallery for showcasing AI-generated artworks.

---

## 📁 Clean Folder Structure

```
best/
├── gallery/              # Original photos (drop new pictures here or delete unwanted ones!)
├── instagram/            # Instagram post/Story exports, one folder per project
├── code/                 # React + Vite + Tailwind website
│   ├── src/              # Components, styles, and gallery dataset
│   ├── public/
│   │   └── images/       # Generated responsive WebP sizes: small/ grid/ large/ full/
│   ├── package.json      # Dependencies and scripts
│   └── vite.config.ts    # Bundler config (base: './')
├── sync_gallery.py       # Core sync & deploy engine (supports --watch and --no-push)
├── watch_gallery.py      # Real-time watcher script
├── watch_gallery.bat     # Double-click to start automatic live sync & redeploy
├── run.bat               # Starts both the live watcher and local dev server
├── visit.bat             # Open the live website in browser
└── .github/workflows/    # Automated CI/CD deployment workflow
```

---

## ⚡ Instant Auto-Sync & Auto-Deploy (Any change in `gallery/`)

Whenever you make any change in the **`gallery/`** folder:
- **Add a photo**: Automatically generates all responsive WebP sizes (`small`, `grid`, `large`, `full`), creates blur placeholders, updates dataset, commits, pushes, and redeploys.
- **Delete a photo**: Automatically cleans up all generated WebP sizes from the website, updates dataset, commits the deletion, pushes, and redeploys.
- **Modify/replace a photo**: Automatically regenerates updated sizes, commits, and redeploys.

### How to use:

#### Option 1: Double-click `watch_gallery.bat`
Leave this window open in the background. It will watch `gallery/` continuously and redeploy automatically whenever you drop or delete photos!

#### Option 2: Double-click `run.bat`
Starts both the **Gallery Auto-Deploy Watcher** and your **Local Dev Server** at `http://127.0.0.1:5173`.

#### Option 3: Terminal
```bash
# Watch continuously
python sync_gallery.py --watch
# or:
python watch_gallery.py

# Sync once manually
python sync_gallery.py
```

---

## 🌐 Automated GitHub Actions CI/CD

Every push to `main` triggers GitHub Actions to:
1. Run `python sync_gallery.py --no-push` in CI to ensure all responsive WebPs and datasets are up to date.
2. Build the optimized production bundle (`npm run build`).
3. Deploy directly to GitHub Pages at:
   **[https://alielmayyah.github.io/dreamscape9k/](https://alielmayyah.github.io/dreamscape9k/)**
