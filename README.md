# Minimal Cinematic Image Gallery

A minimal, dark, cinematic image gallery for showcasing AI-generated artworks.

---

## 📁 Clean Folder Structure

```
best/
├── gallery/              # All original photos & artwork (drop new pictures here!)
├── code/                 # Minimal React + Vite + Tailwind website codebase
│   ├── src/              # Components, styles, and gallery dataset
│   ├── public/           # Web-optimized assets & thumbnails
│   ├── package.json      # Dependencies and scripts
│   └── vite.config.ts    # Bundler config (base: './')
├── run.bat               # Double-click on Windows to start the gallery instantly!
├── sync_gallery.py       # Auto-sync new photos from gallery/ into the website
└── .github/workflows/    # Automated GitHub Actions deployment
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
   *(Automatically generates thumbnails and updates the gallery dataset!)*

---

## 🌐 Deploy to GitHub Pages

Push the repository to GitHub:
```bash
git add .
git commit -m "Update gallery"
git push origin main
```
The included GitHub Actions workflow will automatically build and deploy `code/dist` to GitHub Pages!
