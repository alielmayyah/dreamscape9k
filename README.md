# Minimal Cinematic Image Gallery

A minimal, dark, cinematic image gallery for showcasing AI-generated artworks.

---

## 📁 Clean Folder Structure

```
best/
├── gallery/              # Original photos (drop new pictures here!)
├── instagram/            # Instagram post/Story exports, one folder per project
├── code/                 # React + Vite + Tailwind website
│   ├── src/              # Components, styles, and gallery dataset
│   ├── public/
│   │   └── images/       # Generated WebP sizes: small/ grid/ large/ full/
│   ├── package.json      # Dependencies and scripts
│   └── vite.config.ts    # Bundler config (base: './')
├── .claude/skills/       # Claude Code skills
│   ├── higgsfield/       # Higgsfield AI prompt writing
│   └── instagram-ready/  # Instagram post/Story layouts
├── sync_gallery.py       # Sync gallery/ into the website, then commit + push (redeploys)
├── run.bat               # Start the local dev server
├── visit.bat             # Open the live site
└── .github/workflows/    # GitHub Pages deployment
```

---

## 🚀 How to Run the Website

### Option 1: Double-Click
Double-click **`run.bat`** in this folder!

### Option 2: Terminal
```bash
cd code
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 📸 Adding New Pictures

1. Drop any new pictures into the **`gallery/`** folder.
2. Run:
   ```bash
   python sync_gallery.py
   ```
   *(Generates thumbnails, updates the gallery dataset, then commits and pushes to `main` to redeploy the live site.)*

---

## 🌐 Deploy to GitHub Pages

Push the repository to GitHub:
```bash
git add .
git commit -m "Update gallery"
git push origin main
```
The included GitHub Actions workflow will automatically build and deploy `code/dist` to GitHub Pages!
