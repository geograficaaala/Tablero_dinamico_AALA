/**
 * Fotografías institucionales AALA — módulo de presentación, sin datos de KPI.
 * Las fotografías se sirven de public/fotografias/<carpeta>/<codigo><numero>.jpg.
 * Al faltar un JPG, mantiene un marcador neutro y nunca muestra una imagen rota.
 */
const BASE = new URL('../../public/fotografias/', import.meta.url);
const PROGRAMS = Object.freeze({
  'atitlan-recicla.html': { folder: 'atitlan-recicla', code: 'ar', name: 'Atitlán Recicla' },
  'conservando-atitlan.html': { folder: 'conservando-atitlan', code: 'ca', name: 'Conservando Atitlán' },
  'educando-para-conservar.html': { folder: 'educando-para-conservar', code: 'ec', name: 'Educando para Conservar' },
  'fortalecimiento-municipal.html': { folder: 'fortalecimiento-municipal', code: 'fm', name: 'Fortalecimiento Municipal' },
  'reforestando-atitlan.html': { folder: 'reforestando-atitlan', code: 'ra', name: 'Reforestando Atitlán' },
  'tul.html': { folder: 'tul', code: 'tu', name: 'Siembra de Tul' }
});

function photoUrl(folder, filename) {
  return new URL(`${folder}/${filename}`, BASE).href;
}

function loadImage(src, onSuccess) {
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => onSuccess(img);
  img.onerror = () => {}; // Es válido que aún no hayan subido el archivo.
  img.src = src;
}

function ensureStyles() {
  const id = 'aala-fotografias-css';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = new URL('../styles/aala-fotografias.css', import.meta.url).href;
  document.head.append(link);
}

function createSlot(folder, filename, description) {
  const frame = document.createElement('div');
  frame.className = 'aala-photo-frame';
  const placeholder = document.createElement('div');
  placeholder.className = 'aala-photo-placeholder';
  placeholder.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.textContent = 'Espacio para fotografía';
  placeholder.append(label);
  frame.append(placeholder);

  loadImage(photoUrl(folder, filename), (img) => {
    // No cargar imágenes obsoletas si una vista dinámica reemplazó la sección.
    if (!frame.isConnected) return;
    img.className = 'aala-photo-img';
    img.alt = description;
    frame.replaceChildren(img);
    frame.classList.add('aala-photo-loaded');
  });
  return frame;
}

function createRibbon({folder, code, indices, title, variant = 'program'}) {
  const section = document.createElement('section');
  section.className = `aala-photo-strip aala-photo-strip--${variant}`;
  section.setAttribute('aria-label', title);
  const grid = document.createElement('div');
  grid.className = 'aala-photo-track';
  for (const n of indices) {
    grid.append(createSlot(folder, `${code}${n}.jpg`, `${title}. Fotografía ${n}`));
  }
  section.append(grid);
  return section;
}

/* Fondos editoriales: se aplican a elementos existentes, sin modificar su tamaño. */
const INDEX_PHOTO_TARGETS = Object.freeze([
  ['#page-resumen .story-panel', 'in2.jpg'],
  ['#page-resumen .narrative-stage', 'in3.jpg'],
  ['#page-resumen .coverage-section', 'in4.jpg']
]);

const PROGRAM_PHOTOS = Object.freeze({
  atitlan_recicla: 'pp1.jpg',
  conservando_atitlan: 'pp2.jpg',
  educando_para_conservar: 'pp3.jpg',
  fortalecimiento_municipal: 'pp4.jpg',
  reforestacion: 'pp5.jpg',
  manejo_tul: 'pp6.jpg'
});

const PROGRAM_SUMMARIES = Object.freeze({
  atitlan_recicla: 'Recolección de materiales, comercialización y participación comunitaria.',
  conservando_atitlan: 'Recuperación de aceite usado y producción de productos para el cuidado del agua.',
  educando_para_conservar: 'Educación y formación para la conservación de la cuenca.',
  fortalecimiento_municipal: 'Acompañamiento técnico y fortalecimiento de la gestión municipal.',
  reforestacion: 'Restauración forestal, viveros y seguimiento territorial.',
  manejo_tul: 'Siembra y conservación de tul en el litoral del lago.'
});

function installIndexEditorialPhotos() {
  for (const [selector, file] of INDEX_PHOTO_TARGETS) {
    const region = document.querySelector(selector);
    if (!region) continue;
    loadImage(photoUrl('index', file), img => {
      if (!region.isConnected) return;
      region.style.setProperty('--aala-editorial-photo', `url("${img.src}")`);
      region.classList.add('aala-editorial-photo-loaded');
    });
  }
}

let activeProjectFile = '';
let activeLayerIndex = 0;
let latestRequest = 0;

function prepareProjectBanner() {
  const page = document.getElementById('page-programas');
  const carousel = page?.querySelector('.program-carousel');
  if (!carousel) return null;
  let banner = page.querySelector('[data-aala-project-banner]');
  if (banner) return banner;
  banner = document.createElement('section');
  banner.className = 'aala-project-banner';
  banner.dataset.aalaProjectBanner = 'true';
  banner.setAttribute('aria-label', 'Fotografía del programa seleccionado');
  banner.innerHTML = `
    <div class="aala-project-banner-image" aria-hidden="true"></div>
    <div class="aala-project-banner-image" aria-hidden="true"></div>
    <div class="aala-project-banner-veil" aria-hidden="true"></div>
    <div class="aala-project-banner-content">
      <span class="aala-project-banner-kicker">Programas y proyectos</span>
      <h2 class="aala-project-banner-title">Resultados institucionales</h2>
      <p class="aala-project-banner-description">Indicadores y metas del programa seleccionado</p>
    </div>`;
  carousel.before(banner);
  return banner;
}

function refreshProjectBanner() {
  const banner = document.querySelector('[data-aala-project-banner]');
  const dots = document.getElementById('programCarouselDots');
  const grid = document.getElementById('programGrid');
  if (!banner || !dots || !grid) return;
  const buttons = [...dots.querySelectorAll('button')];
  const cards = [...grid.querySelectorAll(':scope > .program-card[data-program-id]')];
  if (!buttons.length || !cards.length) return;
  const activeDot = buttons.findIndex(button => button.classList.contains('active') || button.getAttribute('aria-current') === 'true');
  const card = cards[Math.max(0, activeDot)];
  if (!card) return;
  const id = card.dataset.programId;
  const name = card.querySelector('.program-title')?.textContent?.trim();
  const title = banner.querySelector('.aala-project-banner-title');
  const summary = banner.querySelector('.aala-project-banner-description');
  if (name && title.textContent !== name) title.textContent = name;
  const description = PROGRAM_SUMMARIES[id] || 'Indicadores y metas del programa seleccionado.';
  if (summary.textContent !== description) summary.textContent = description;
  const file = PROGRAM_PHOTOS[id];
  if (!file || file === activeProjectFile) return;
  activeProjectFile = file;
  const requestId = ++latestRequest;
  loadImage(photoUrl('programas-y-proyectos', file), img => {
    if (!banner.isConnected || requestId !== latestRequest) return;
    const layers = [...banner.querySelectorAll('.aala-project-banner-image')];
    const nextIndex = 1 - activeLayerIndex;
    layers[nextIndex].style.backgroundImage = `url("${img.src}")`;
    void layers[nextIndex].offsetHeight;
    layers[nextIndex].classList.add('is-visible');
    layers[activeLayerIndex].classList.remove('is-visible');
    activeLayerIndex = nextIndex;
  });
}

function installIndex() {
  // Se conserva exactamente el fondo original de la portada in1.jpg.
  const hero = document.querySelector('#page-resumen .hero-shell');
  if (hero && !hero.classList.contains('aala-photo-hero')) {
    hero.classList.add('aala-photo-hero');
    const background = document.createElement('div');
    background.className = 'aala-photo-hero-background';
    background.setAttribute('aria-hidden', 'true');
    hero.prepend(background);
    loadImage(photoUrl('index', 'in1.jpg'), img => {
      if (!hero.isConnected) return;
      background.style.backgroundImage = `url("${img.src}")`;
      hero.classList.add('aala-photo-hero-ready');
    });
  }

  // El tema institucional vuelve a llamar installPhotoGallery al detectar cambios.
  // Este guard evita duplicar observadores, fotografías o elementos del DOM.
  if (document.body.dataset.aalaIndexPhotographyInstalled === 'true') return;
  document.body.dataset.aalaIndexPhotographyInstalled = 'true';
  installIndexEditorialPhotos();
  prepareProjectBanner();
  const dots = document.getElementById('programCarouselDots');
  if (dots) {
    new MutationObserver(refreshProjectBanner).observe(dots, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ['class', 'aria-current']
    });
  }
  refreshProjectBanner();
}

function installProgram() {
  const slug = location.pathname.split('/').pop().toLowerCase();
  const program = PROGRAMS[slug];
  if (!program) return;
  const selector = slug === 'fortalecimiento-municipal.html' ? '#fmHero' :
    slug === 'conservando-atitlan.html' ? '#heroSection' :
    slug === 'atitlan-recicla.html' ? '.full-only section.hero' :
    '#resumen.hero';
  const hero = document.querySelector(selector);
  if (!hero || hero.dataset.aalaPhotoInstalled === 'true') return;
  // Evita incluir fotografías en la presentación y las vistas ejecutivas.
  hero.dataset.aalaPhotoInstalled = 'true';
  hero.insertAdjacentElement('afterend', createRibbon({
    folder: program.folder, code: program.code, indices: [1, 2],
    title: `Fotografías de ${program.name}`,
    variant: slug === 'tul.html' ? 'tul' : 'program'
  }));
}

export function installPhotoGallery() {
  if (typeof document === 'undefined') return;
  ensureStyles();
  if (document.body?.classList.contains('aala-index')) installIndex();
  else installProgram();
}

export { PROGRAMS };
