// Global state
let galleryData = null;
let currentFilter = 'all';
let filteredItems = [];
let activeItemIndex = -1;
let currentSeriesActIndex = 0;
let activeSeries = null;

// DOM Elements
const galleryGrid = document.getElementById('galleryGrid');
const filterNav = document.getElementById('filterNav');
const heroTitle = document.getElementById('heroTitle');
const heroDesc = document.getElementById('heroDesc');
const brandTitle = document.getElementById('brandTitle');

// Lightbox Elements
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

// Initialize Gallery
async function initGallery() {
  try {
    const res = await fetch('data/gallery.json');
    if (!res.ok) throw new Error('Failed to load gallery.json');
    galleryData = await res.json();

    // Render Branding & Hero
    if (galleryData.portfolio) {
      if (brandTitle) brandTitle.textContent = galleryData.portfolio.name || 'Cinematic Stills';
      if (heroTitle) heroTitle.textContent = galleryData.portfolio.name || 'Cinematic Stills';
      if (heroDesc) heroDesc.textContent = galleryData.portfolio.tagline || 'Narrative direction & visual storytelling';
      renderFilterButtons(galleryData.portfolio.categories || []);
    }

    applyFilter('all');
    setupEventListeners();
  } catch (err) {
    console.error('Error loading gallery:', err);
    galleryGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-secondary);">
        <p>Unable to load gallery data. Please ensure <code>data/gallery.json</code> is accessible.</p>
      </div>
    `;
  }
}

// Render Filter Buttons
function renderFilterButtons(categories) {
  if (!filterNav) return;
  filterNav.innerHTML = '';
  
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `filter-btn ${cat.id === currentFilter ? 'active' : ''}`;
    btn.textContent = cat.label;
    btn.setAttribute('data-filter', cat.id);
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(cat.id);
    });
    filterNav.appendChild(btn);
  });
}

// Apply Filter & Render Cards
function applyFilter(filterId) {
  currentFilter = filterId;
  if (!galleryData || !galleryData.items) return;

  if (filterId === 'all') {
    filteredItems = galleryData.items;
  } else {
    filteredItems = galleryData.items.filter(item => item.category === filterId);
  }

  renderGallery();
}

// Render Gallery Cards
function renderGallery() {
  galleryGrid.innerHTML = '';

  if (filteredItems.length === 0) {
    galleryGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
        <p>No works found in this collection.</p>
      </div>
    `;
    return;
  }

  filteredItems.forEach((item, index) => {
    const card = document.createElement('div');
    const isPortrait = item.aspect === '9:16' || item.aspect === '4:5';
    card.className = `card ${isPortrait ? 'portrait' : ''}`;
    card.setAttribute('data-index', index);

    if (item.type === 'series') {
      // SERIES CARD (Trilogy)
      const previewThumbsHtml = item.episodes.map(ep => `
        <div class="series-thumb">
          <img src="${ep.thumb || ep.image}" alt="${ep.title}" loading="lazy">
        </div>
      `).join('');

      card.innerHTML = `
        <div class="card-img-wrap">
          <span class="badge-tag series">Trilogy · 3 Acts</span>
          <img class="card-img" src="${item.cover_thumb || item.cover}" alt="${item.title}" loading="lazy">
        </div>
        <div class="card-meta">
          <h3 class="card-title">${item.title}</h3>
          <span class="card-subtitle">${item.subtitle}</span>
          <p class="card-desc">${item.description}</p>
          <div class="series-preview-bar">
            ${previewThumbsHtml}
          </div>
        </div>
      `;
    } else {
      // SINGLE IMAGE CARD
      card.innerHTML = `
        <div class="card-img-wrap">
          <span class="badge-tag aspect">${item.aspect || '16:9'}</span>
          <img class="card-img" src="${item.thumb || item.image}" alt="${item.title}" loading="lazy">
        </div>
        <div class="card-meta">
          <h3 class="card-title">${item.title}</h3>
          <span class="card-subtitle">${item.subtitle || ''}</span>
          <p class="card-desc">${item.description || ''}</p>
        </div>
      `;
    }

    card.addEventListener('click', () => openItem(index));
    galleryGrid.appendChild(card);
  });
}

// Open Item (Single Image or Series)
function openItem(index) {
  activeItemIndex = index;
  const item = filteredItems[index];

  if (!item) return;

  if (item.type === 'series') {
    activeSeries = item;
    currentSeriesActIndex = 0;
    showSeriesAct();
  } else {
    activeSeries = null;
    showSingleImage(item);
  }

  lightboxModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Show Single Image in Lightbox
function showSingleImage(item) {
  lightboxImg.src = item.image;
  lightboxTitle.textContent = item.title;
  lightboxCaption.textContent = item.description || item.subtitle || '';
}

// Show Specific Act in a Series
function showSeriesAct() {
  if (!activeSeries || !activeSeries.episodes) return;
  const ep = activeSeries.episodes[currentSeriesActIndex];
  
  lightboxImg.src = ep.image;
  lightboxTitle.textContent = `${activeSeries.title} — ${ep.act}: ${ep.title}`;
  lightboxCaption.textContent = `${ep.caption || ''} (${currentSeriesActIndex + 1} of ${activeSeries.episodes.length})`;
}

// Navigate Next / Prev
function nextItem() {
  if (activeSeries) {
    if (currentSeriesActIndex < activeSeries.episodes.length - 1) {
      currentSeriesActIndex++;
      showSeriesAct();
      return;
    }
  }

  if (activeItemIndex < filteredItems.length - 1) {
    openItem(activeItemIndex + 1);
  } else {
    openItem(0); // Loop back
  }
}

function prevItem() {
  if (activeSeries) {
    if (currentSeriesActIndex > 0) {
      currentSeriesActIndex--;
      showSeriesAct();
      return;
    }
  }

  if (activeItemIndex > 0) {
    openItem(activeItemIndex - 1);
  } else {
    openItem(filteredItems.length - 1); // Loop to end
  }
}

function closeLightbox() {
  lightboxModal.classList.remove('active');
  document.body.style.overflow = '';
  activeSeries = null;
}

// Event Listeners (Keyboard, Clicks, Overlay)
function setupEventListeners() {
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); nextItem(); });
  if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); prevItem(); });

  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextItem();
    if (e.key === 'ArrowLeft') prevItem();
  });
}

// Boot up
document.addEventListener('DOMContentLoaded', initGallery);
