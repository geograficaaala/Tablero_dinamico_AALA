/**
 * AALA · Fondos fotográficos institucionales.
 * No modifica tarjetas, indicadores, navegación, datos ni dimensiones del índice.
 * Utiliza exclusivamente fondos decorativos sobre secciones existentes.
 */
export const AALA_PHOTO_SETS = Object.freeze({
  'index.html': { folder: 'index', prefix: 'in', label: 'Asociación Amigos del Lago de Atitlán' },
  'programas-y-proyectos': { folder: 'programas-y-proyectos', prefix: 'pp', label: 'Programas y proyectos de AALA' },
  'atitlan-recicla.html': { folder: 'atitlan-recicla', prefix: 'ar', label: 'Atitlán Recicla' },
  'conservando-atitlan.html': { folder: 'conservando-atitlan', prefix: 'ca', label: 'Conservando Atitlán' },
  'educando-para-conservar.html': { folder: 'educando-para-conservar', prefix: 'ec', label: 'Educando para Conservar' },
  'fortalecimiento-municipal.html': { folder: 'fortalecimiento-municipal', prefix: 'fm', label: 'Fortalecimiento Municipal' },
  'reforestando-atitlan.html': { folder: 'reforestando-atitlan', prefix: 'ra', label: 'Reforestando Atitlán' },
  'tul.html': { folder: 'tul', prefix: 'tu', label: 'Siembra de Tul' }
});

// Estos ID provienen del catálogo institucional y NO equivalen al orden del carrusel.
export const AALA_PROGRAM_PHOTOS = Object.freeze({
  atitlan_recicla: 'pp1.jpg',
  conservando_atitlan: 'pp2.jpg',
  educando_para_conservar: 'pp3.jpg',
  fortalecimiento_municipal: 'pp4.jpg',
  reforestacion: 'pp5.jpg',
  manejo_tul: 'pp6.jpg',
  tul: 'pp6.jpg'
});

export function photoURL(folder, filename) {
  // Compatible con dominio propio y repositorios GitHub Pages con subruta.
  return new URL(`../../public/fotografias/${folder}/${filename}`, import.meta.url).href;
}

function preloadPhoto(folder, filename, onLoad, onError = () => {}) {
  const probe = new Image();
  probe.decoding = 'async';
  probe.onload = () => onLoad(photoURL(folder, filename));
  probe.onerror = onError;
  probe.src = photoURL(folder, filename);
}

// La fotografía inicial conserva exactamente su imagen, capa oscura y tamaño aprobados.
function installWelcomeImage() {
  const hero = document.querySelector('#page-resumen .hero-shell');
  if (!hero || hero.dataset.aalaPhotoWelcome === 'true') return;
  hero.dataset.aalaPhotoWelcome = 'true';
  preloadPhoto('index', 'in1.jpg', (src) => {
    if (!hero.isConnected) return;
    if (!hero.querySelector('.aala-photo-welcome-background')) {
      const background = document.createElement('div');
      background.className = 'aala-photo-welcome-background';
      background.setAttribute('aria-hidden', 'true');
      const shade = document.createElement('div');
      shade.className = 'aala-photo-welcome-shade';
      shade.setAttribute('aria-hidden', 'true');
      hero.prepend(shade);
      hero.prepend(background);
    }
    hero.querySelector('.aala-photo-welcome-background').style.backgroundImage = `url("${src}")`;
    hero.classList.add('aala-photo-welcome--loaded');
  });
}

const INDEX_SCENES = [
  ['#page-resumen .storyboard', 'in2.jpg'],
  ['#page-resumen .panorama-stage', 'in3.jpg'],
  ['#page-resumen .coverage-section', 'in4.jpg']
];

function installIndexScenes() {
  for (const [selector, filename] of INDEX_SCENES) {
    const section = document.querySelector(selector);
    if (!section || section.dataset.aalaScenePhoto === filename) continue;
    section.dataset.aalaScenePhoto = filename;
    preloadPhoto('index', filename, (src) => {
      if (!section.isConnected) return;
      section.style.setProperty('--aala-scene-image', `url("${src}")`);
      section.classList.add('aala-photo-scene--loaded');
    });
  }
}

// La decoración vive dentro del carrusel pero NO participa en el layout.
function buildCarouselBackdrop(carousel) {
  let scene = carousel.querySelector(':scope > .aala-carousel-backdrop');
  if (scene) return scene;
  scene = document.createElement('div');
  scene.className = 'aala-carousel-backdrop';
  scene.setAttribute('aria-hidden', 'true');
  const layerA = document.createElement('div');
  layerA.className = 'aala-carousel-backdrop-layer';
  const layerB = document.createElement('div');
  layerB.className = 'aala-carousel-backdrop-layer';
  scene.append(layerA, layerB);
  carousel.prepend(scene);
  return scene;
}

function currentProgramId(grid, dots) {
  const cards = [...grid.querySelectorAll('.program-card[data-program-id]')];
  if (!cards.length) return '';
  const allDots = [...dots.querySelectorAll('.program-carousel-dot')];
  const activeIndex = allDots.findIndex(dot => dot.getAttribute('aria-current') === 'true' || dot.classList.contains('active'));
  const index = activeIndex >= 0 ? activeIndex : 0;
  return cards[Math.min(index, cards.length - 1)].dataset.programId || '';
}

function installCarouselBackground() {
  const carousel = document.querySelector('#page-programas .program-carousel');
  const grid = document.querySelector('#page-programas #programGrid');
  const dots = document.querySelector('#page-programas #programCarouselDots');
  if (!carousel || !grid || !dots || carousel.dataset.aalaBackdropInstalled === 'true') return;
  carousel.dataset.aalaBackdropInstalled = 'true';

  const backdrop = buildCarouselBackdrop(carousel);
  const layers = [...backdrop.querySelectorAll('.aala-carousel-backdrop-layer')];
  let currentFile = '';
  let activeLayer = -1;
  let requestId = 0;

  function syncPhoto() {
    const programId = currentProgramId(grid, dots);
    const filename = AALA_PROGRAM_PHOTOS[programId] || '';
    if (filename === currentFile) return;
    currentFile = filename;
    const thisRequest = ++requestId;
    if (!filename) {
      for (const layer of layers) layer.classList.remove('is-active');
      return;
    }
    preloadPhoto('programas-y-proyectos', filename, (src) => {
      if (!carousel.isConnected || thisRequest !== requestId) return;
      const nextIndex = activeLayer === 0 ? 1 : 0;
      const nextLayer = layers[nextIndex];
      nextLayer.style.backgroundImage = `url("${src}")`;
      nextLayer.classList.add('is-active');
      if (activeLayer >= 0) layers[activeLayer].classList.remove('is-active');
      activeLayer = nextIndex;
    }, () => {
      if (thisRequest !== requestId) return;
      for (const layer of layers) layer.classList.remove('is-active');
      activeLayer = -1;
    });
  }

  // El carrusel actualiza aria-current al usar flechas, puntos o desplazamiento táctil.
  // Solo observamos sus señales; no interceptamos ni reemplazamos sus eventos.
  new MutationObserver(syncPhoto).observe(dots, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current', 'class']
  });
  new MutationObserver(syncPhoto).observe(grid, { childList: true });
  syncPhoto();
}

export function installAalaPhotos() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page !== 'index.html') return;
  installWelcomeImage();
  installIndexScenes();
  installCarouselBackground();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installAalaPhotos, { once: true });
  } else {
    installAalaPhotos();
  }
}
