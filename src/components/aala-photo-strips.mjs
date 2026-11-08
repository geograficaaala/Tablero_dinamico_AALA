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

// Cintillos fotográficos discretos. Son decorativos: no reemplazan tarjetas ni datos.
const STRIP_PHOTOS = Object.freeze(['pp1.jpg', 'pp2.jpg', 'pp3.jpg', 'pp4.jpg', 'pp5.jpg', 'pp6.jpg']);

function createMarquee(direction) {
  const strip = document.createElement('div');
  strip.className = `aala-photo-marquee aala-photo-marquee--${direction}`;
  strip.setAttribute('aria-hidden', 'true');
  strip.dataset.aalaMarquee = direction;

  const track = document.createElement('div');
  track.className = 'aala-photo-marquee-track';
  // Dos grupos idénticos permiten un bucle sin cortes visuales.
  for (let copy = 0; copy < 2; copy++) {
    const group = document.createElement('div');
    group.className = 'aala-photo-marquee-group';
    for (const filename of STRIP_PHOTOS) {
      const img = document.createElement('img');
      img.src = photoURL('programas-y-proyectos', filename);
      img.alt = '';
      img.decoding = 'async';
      img.loading = 'eager';
      group.append(img);
    }
    track.append(group);
  }
  strip.append(track);
  return strip;
}

function installCarouselMarquees() {
  const carousel = document.querySelector('#page-programas .program-carousel');
  const actions = document.querySelector('#page-programas .program-carousel-actions');
  const viewport = document.querySelector('#page-programas #programCarouselViewport');
  if (!carousel || !actions || !viewport || carousel.dataset.aalaMarqueesInstalled === 'true') return;
  carousel.dataset.aalaMarqueesInstalled = 'true';

  // El superior queda entre las flechas, detrás de ellas y de los puntos del carrusel.
  actions.insertBefore(createMarquee('left'), actions.querySelector('#programCarouselDots'));
  // El inferior aparece inmediatamente después de la tarjeta, a ancho completo.
  viewport.after(createMarquee('right'));
}

// Las fotografías son estáticas; únicamente el texto aparece al llegar al viewport.
function installScrollTextReveal() {
  if (document.body.dataset.aalaScrollReveal === 'true') return;
  document.body.dataset.aalaScrollReveal = 'true';
  if (typeof IntersectionObserver === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const selectors = [
    '#page-resumen .hero-main .eyebrow',
    '#page-resumen .hero-main .hero-title',
    '#page-resumen .hero-main .hero-copy',
    '#page-resumen .dashboard-ribbon .ribbon-item',
    '#page-resumen .storyboard .section-title',
    '#page-resumen .storyboard .story-lead',
    '#page-resumen .storyboard .story-columns > .prose',
    '#page-resumen .storyboard .story-point',
    '#page-resumen .panorama-stage .section-kicker',
    '#page-resumen .panorama-stage .section-title',
    '#page-resumen .panorama-stage .aala-integrated-reading',
    '#page-resumen .coverage-section > .section-kicker',
    '#page-resumen .coverage-section > .section-title'
  ];
  const elements = [...new Set(selectors.flatMap(selector =>
    [...document.querySelectorAll(selector)]))];
  if (!elements.length) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('aala-reveal-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: .06, rootMargin: '0px 0px -4% 0px' });
  document.body.classList.add('aala-scroll-reveal-enabled');
  elements.forEach(element => {
    element.classList.add('aala-reveal-text');
    observer.observe(element);
  });
}

function extendWelcomeIntoSummary() {
  const ribbon = document.querySelector('#page-resumen .dashboard-ribbon');
  if (!ribbon || ribbon.dataset.aalaPhotoBridge === 'true') return;
  ribbon.dataset.aalaPhotoBridge = 'true';
  preloadPhoto('index', 'in1.jpg', src => {
    if (!ribbon.isConnected) return;
    ribbon.style.setProperty('--aala-summary-bridge-photo', `url("${src}")`);
    ribbon.classList.add('aala-summary-bridge-loaded');
  });
}

export function installAalaPhotos() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page !== 'index.html') return;
  installWelcomeImage();
  installIndexScenes();
  extendWelcomeIntoSummary();
  installCarouselMarquees();
  installScrollTextReveal();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installAalaPhotos, { once: true });
  } else {
    installAalaPhotos();
  }
}
