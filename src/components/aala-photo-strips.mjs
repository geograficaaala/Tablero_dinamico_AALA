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

// La portada conserva exactamente el diseño y el módulo fotográfico aprobado.
// Las otras fotografías se usan solamente como fondos de contenido existente.
const INDEX_EDITORIAL_PHOTOS = Object.freeze([
  ['#page-resumen .storyboard', 'in2.jpg'],
  ['#page-resumen .panorama-stage', 'in3.jpg'],
  ['#page-resumen .coverage-section', 'in4.jpg']
]);

const PROJECT_PHOTOS = Object.freeze({
  atitlan_recicla: 'pp1.jpg',
  conservando_atitlan: 'pp2.jpg',
  educando_para_conservar: 'pp3.jpg',
  fortalecimiento_municipal: 'pp4.jpg',
  reforestacion: 'pp5.jpg',
  manejo_tul: 'pp6.jpg'
});

function installIndexEditorialPhotos() {
  for (const [selector, filename] of INDEX_EDITORIAL_PHOTOS) {
    const section = document.querySelector(selector);
    if (!section) continue;
    loadPhoto('index', filename, (src) => {
      if (!section.isConnected) return;
      section.style.setProperty('--aala-editorial-photo', `url("${src}")`);
      section.classList.add('aala-editorial-photo-loaded');
    });
  }
}

function applyProgramCardPhotos() {
  const grid = document.getElementById('programGrid');
  if (!grid) return;
  for (const card of grid.querySelectorAll('.program-card[data-program-id]')) {
    if (card.dataset.aalaPhotoPrepared === 'true') continue;
    card.dataset.aalaPhotoPrepared = 'true';
    const filename = PROJECT_PHOTOS[card.dataset.programId];
    if (!filename) continue;
    loadPhoto('programas-y-proyectos', filename, (src) => {
      if (!card.isConnected) return;
      card.style.setProperty('--aala-project-photo', `url("${src}")`);
      card.classList.add('aala-project-photo-loaded');
    });
  }
}

function installIndexPhotography() {
  installWelcomeImage();
  installIndexEditorialPhotos();
  const grid = document.getElementById('programGrid');
  if (!grid) return;
  applyProgramCardPhotos();
  // Los seis proyectos se reconstruyen al cambiar el mes; sus fotos acompañan
  // las tarjetas existentes sin modificar la navegación ni los datos.
  const observer = new MutationObserver(applyProgramCardPhotos);
  observer.observe(grid, { childList: true });
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
    installIndexPhotography();
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
