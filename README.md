# Cinematic Stills & Visual Stories Portfolio

A sleek, dark-mode, responsive portfolio website with interactive narrative trilogies and automated CI/CD deployment to **GitHub Pages**.

---

## 🚀 Quick Setup & GitHub Deployment

### Step 1: Initialize Git & Connect your GitHub Repo

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `cinematic-portfolio` or `<your-username>.github.io`).
2. Run the following commands in this directory:

```bash
git init
git add .
git commit -m "Initial portfolio commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Step 2: Enable GitHub Pages CI/CD

1. Go to your repo on GitHub: **Settings** &rarr; **Pages**.
2. Under **Build and deployment** &rarr; **Source**, select:
   * **GitHub Actions**
3. That's it! The included `.github/workflows/deploy.yml` will automatically build and publish your site at:
   `https://<your-username>.github.io/<your-repo-name>/` (or `https://<your-username>.github.io` if named after your username).

---

## 📸 Posting New Pictures & Stories via Script

You can post new images programmatically via the included `publish.py` script. The script automatically:
* Copies the image to `images/`
* Generates WebP thumbnails in `images/thumbs/`
* Detects aspect ratios (16:9, 9:16, 4:5, etc.)
* Updates `data/gallery.json`
* Commits and pushes to GitHub to trigger your live site update (with `--push`)

### 1. Post a Single Still
```bash
python publish.py --image "my_still.jpg" --title "Midnight Rain" --category "atmosphere" --desc "Rain reflecting streetlights" --push
```

### 2. Post a Multi-Act Story Series (Trilogy)
```bash
python publish.py --series --title "The Heist" --images "scene1.jpg" "scene2.jpg" "scene3.jpg" --acts "The Plan" "The Breach" "The Escape" --desc "A three-part narrative" --push
```

### 3. Interactive Terminal Wizard
Simply run:
```bash
python publish.py
```
and follow the on-screen prompts!

---

## 💻 Local Preview

To preview the website locally on your computer:

```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.
