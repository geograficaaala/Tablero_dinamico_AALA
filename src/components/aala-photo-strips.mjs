/**
 * Cintillos fotográficos AALA. No modifica datos, KPIs, navegación ni informes.
 * Las fotografías se buscan en public/fotografias/<carpeta>/<prefijo>N.jpg
 * El módulo funciona aunque algunas o todas las imágenes aún no estén publicadas.
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

export function photoURL(folder, filename) {
  // Usar import.meta.url evita fallos tanto en dominio propio como en GitHub Pages con subruta.
  return new URL(`../../public/fotografias/${folder}/${filename}`, import.meta.url).href;
}

function loadPhoto(folder, fileName, callback) {
  const probe = new Image();
  probe.decoding = 'async';
  probe.onload = () => callback(photoURL(folder, fileName));
  probe.onerror = () => {}; // La imagen todavía no existe: mantener el espacio neutro.
  probe.src = photoURL(folder, fileName);
}

function photoTile(group, number, type) {
  const name = `${group.prefix}${number}.jpg`;
  const tile = document.createElement('div');
  tile.className = 'aala-photo-tile';
  tile.dataset.photo = name;
  const waiting = document.createElement('span');
  waiting.className = 'aala-photo-pending';
  waiting.textContent = 'Espacio fotográfico';
  tile.append(waiting);
  loadPhoto(group.folder, name, (src) => {
    if (!tile.isConnected) return;
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.alt = `Fotografía de ${group.label}`;
    img.addEventListener('load', () => {
      tile.classList.add('aala-photo-loaded');
      waiting.remove();
    }, { once: true });
    img.addEventListener('error', () => img.remove(), { once: true });
    tile.append(img);
  });
  return tile;
}

function createStrip(group, numbers, variant, title) {
  const section = document.createElement('section');
  section.className = `aala-photo-strip aala-photo-strip--${variant}`;
  section.setAttribute('aria-label', `Fotografías de ${group.label}`);
  section.dataset.aalaPhotoStrip = group.folder;
  if (title) {
    const h = document.createElement('h2');
    h.className = 'aala-photo-heading';
    h.textContent = title;
    section.append(h);
  }
  const grid = document.createElement('div');
  grid.className = 'aala-photo-strip-grid';
  for (const number of numbers) grid.append(photoTile(group, number, variant));
  section.append(grid);
  return section;
}

function installWelcomeImage() {
  const hero = document.querySelector('#page-resumen .hero-shell');
  if (!hero || hero.dataset.aalaPhotoWelcome) return;
  hero.dataset.aalaPhotoWelcome = 'true';
  const group = AALA_PHOTO_SETS['index.html'];
  loadPhoto(group.folder, 'in1.jpg', (src) => {
    if (!hero.isConnected) return;
    const background = document.createElement('div');
    background.className = 'aala-photo-welcome-background';
    background.setAttribute('aria-hidden', 'true');
    background.style.backgroundImage = `url("${src}")`;
    const shade = document.createElement('div');
    shade.className = 'aala-photo-welcome-shade';
    shade.setAttribute('aria-hidden', 'true');
    hero.prepend(shade);
    hero.prepend(background);
    hero.classList.add('aala-photo-welcome--loaded');
  });
}


// Las imágenes de fondo deben precargarse inmediatamente, no con loading="lazy":
// un Image() desconectado del DOM puede no iniciar la descarga si es diferido.
const PROGRAM_IMAGE_MAP = Object.freeze({
  atitlan_recicla: ['pp1.jpg','Atitlán Recicla'],
  conservando_atitlan: ['pp2.jpg','Conservando Atitlán'],
  educando_para_conservar: ['pp3.jpg','Educando para Conservar'],
  fortalecimiento_municipal: ['pp4.jpg','Fortalecimiento Municipal'],
  reforestacion: ['pp5.jpg','Reforestando Atitlán'],
  manejo_tul: ['pp6.jpg','Siembra de Tul'],
  tul: ['pp6.jpg','Siembra de Tul']
});

function preloadImage(folder, file) {
  return new Promise(resolve => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(photoURL(folder, file));
    image.onerror = () => resolve(null);
    image.src = photoURL(folder, file);
  });
}

function addEditorialBackground(selector, file) {
  const section = document.querySelector(selector);
  if (!section || section.dataset.aalaEditorial) return;
  section.dataset.aalaEditorial = 'true';
  preloadImage('index', file).then(url => {
    if (!url || !section.isConnected) return;
    section.style.setProperty('--aala-editorial-bg', `url("${url}")`);
    section.classList.add('aala-editorial-has-photo');
  });
}

function createProgramBanner() {
  const page = document.getElementById('page-programas');
  if (!page) return null;
  let banner = page.querySelector('[data-aala-program-banner]');
  if (banner) return banner;
  banner = document.createElement('section');
  banner.className = 'aala-program-banner';
  banner.dataset.aalaProgramBanner = 'true';
  banner.setAttribute('aria-label', 'Imagen y nombre del programa seleccionado');
  banner.innerHTML = `
    <div class="aala-program-banner-photo" aria-hidden="true"></div>
    <div class="aala-program-banner-veil" aria-hidden="true"></div>
    <div class="aala-program-banner-inner">
      <p class="aala-program-banner-eyebrow">Programas y proyectos</p>
      <h2 class="aala-program-banner-title">Atitlán Recicla</h2>
      <p class="aala-program-banner-description">Resultados e indicadores institucionales del programa seleccionado.</p>
    </div>`;
  page.insertBefore(banner, page.firstChild);
  return banner;
}

let currentBannerProgram = null;
let bannerImageRequest = 0;
function setProgramBanner(programId, title) {
  const banner = createProgramBanner();
  if (!banner) return;
  const selection = PROGRAM_IMAGE_MAP[programId] || PROGRAM_IMAGE_MAP.atitlan_recicla;
  const normalizedProgram = PROGRAM_IMAGE_MAP[programId] ? programId : 'atitlan_recicla';
  if (currentBannerProgram === normalizedProgram) return;
  currentBannerProgram = normalizedProgram;
  const request = ++bannerImageRequest;
  banner.querySelector('.aala-program-banner-title').textContent = title || selection[1];
  banner.classList.remove('aala-program-banner--photo');
  banner.style.removeProperty('--aala-program-banner-image');
  preloadImage('programas-y-proyectos', selection[0]).then(url => {
    if (request !== bannerImageRequest || !banner.isConnected) return;
    if (!url) return;
    banner.style.setProperty('--aala-program-banner-image', `url("${url}")`);
    banner.classList.add('aala-program-banner--photo');
  });
}

function activeCarouselItem() {
  const grid = document.getElementById('programGrid');
  const viewport = document.getElementById('programCarouselViewport');
  if (!grid || !viewport) return null;
  const cards = Array.from(grid.querySelectorAll('.program-card[data-program-id]'));
  if (!cards.length) return null;
  const viewportLeft = viewport.getBoundingClientRect().left;
  return cards.reduce((closest, card) => {
    const dist = Math.abs(card.getBoundingClientRect().left - viewportLeft);
    if (!closest || dist < closest.dist) return {card, dist};
    return closest;
  }, null)?.card || cards[0];
}

function syncBannerFromCarousel() {
  const card = activeCarouselItem();
  if (!card) return;
  const name = card.querySelector('.program-title')?.textContent?.trim();
  setProgramBanner(card.dataset.programId, name);
}

function installIndexPhotos() {
  // Eliminar los cintillos antiguos solamente en el índice. En los seis
  // programas se mantiene su fotografía discreta de dos imágenes.
  document.querySelectorAll('#page-resumen .aala-photo-strip, #page-programas .aala-photo-strip')
    .forEach(strip => strip.remove());
  installWelcomeImage();
  addEditorialBackground('#page-resumen .storyboard', 'in2.jpg');
  addEditorialBackground('#page-resumen .panorama-stage', 'in3.jpg');
  addEditorialBackground('#page-resumen .coverage-section', 'in4.jpg');
  createProgramBanner();
  const viewport = document.getElementById('programCarouselViewport');
  const grid = document.getElementById('programGrid');
  if (!viewport || !grid) return;
  let scrollFrame = 0;
  viewport.addEventListener('scroll', () => {
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      syncBannerFromCarousel();
    });
  }, { passive: true });
  const observer = new MutationObserver(syncBannerFromCarousel);
  observer.observe(grid, { childList: true });
  // Cambios de mes, botones, flechas y puntos de carrusel sin depender del
  // módulo del índice ni alterar su funcionamiento.
  document.getElementById('programCarouselPrev')?.addEventListener('click', () => requestAnimationFrame(syncBannerFromCarousel));
  document.getElementById('programCarouselNext')?.addEventListener('click', () => requestAnimationFrame(syncBannerFromCarousel));
  document.getElementById('programCarouselDots')?.addEventListener('click', () => requestAnimationFrame(syncBannerFromCarousel));
  window.addEventListener('aala:program-card-change', e => {
    const detail = e.detail || {};
    if (detail.programId) setProgramBanner(detail.programId, detail.name);
  });
  syncBannerFromCarousel();
}

function programHero(page) {
  switch (page) {
    case 'atitlan-recicla.html': return document.querySelector('.program-main > .full-only > section.hero');
    case 'conservando-atitlan.html': return document.querySelector('#fullView #heroSection');
    case 'educando-para-conservar.html': return document.querySelector('#fullView > section.hero');
    case 'fortalecimiento-municipal.html': return document.querySelector('#fmHero');
    case 'reforestando-atitlan.html': return document.querySelector('section.hero#resumen');
    case 'tul.html': return document.querySelector('.full-only > section.hero#resumen');
    default: return null;
  }
}

function installProgramStrip(page) {
  const hero = programHero(page);
  if (!hero) return false;
  const sibling = hero.nextElementSibling;
  if (sibling?.dataset?.aalaPhotoStrip) return true;
  const group = AALA_PHOTO_SETS[page];
  const tul = page === 'tul.html';
  hero.after(createStrip(group, tul ? [1] : [1, 2], tul ? 'tul' : 'program', 'Actividad del programa'));
  return true;
}

export function installAalaPhotos() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'index.html') {
    installIndexPhotos();
    return;
  }
  if (!AALA_PHOTO_SETS[page]) return;
  // Educando vuelve a construir el HTML al cambiar de mes: reinstalar el cintillo
  // si el controlador reemplaza su contenido, sin modificar sus resultados.
  const initial = installProgramStrip(page);
  if (initial && page !== 'educando-para-conservar.html') return;
  const root = document.querySelector('main');
  if (!root) return;
  const observer = new MutationObserver(() => {
    const installed = installProgramStrip(page);
    if (installed && page !== 'educando-para-conservar.html') observer.disconnect();
  });
  observer.observe(root, { childList: true, subtree: true });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installAalaPhotos, { once: true });
  } else {
    installAalaPhotos();
  }
}
