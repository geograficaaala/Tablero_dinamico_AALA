/**
 * Fondos fotográficos AALA.
 * Integra fotografías de fondo sin alterar la estructura del tablero.
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

const INDEX_SECTION_PHOTOS = [
  ['#page-resumen .storyboard', 'in2.jpg'],
  ['#page-resumen .panorama-stage', 'in3.jpg'],
  ['#page-resumen .coverage-section', 'in4.jpg']
];

const PROGRAM_CARD_PHOTOS = Object.freeze({
  atitlan_recicla: 'pp1.jpg',
  conservando_atitlan: 'pp2.jpg',
  educando_para_conservar: 'pp3.jpg',
  fortalecimiento_municipal: 'pp4.jpg',
  reforestacion: 'pp5.jpg',
  reforestando_atitlan: 'pp5.jpg',
  tul: 'pp6.jpg'
});

export function photoURL(folder, filename) {
  return new URL(`../../public/fotografias/${folder}/${filename}`, import.meta.url).href;
}

function loadPhoto(folder, fileName, onLoad, onError = () => {}) {
  const probe = new Image();
  probe.decoding = 'async';
  probe.onload = () => onLoad(photoURL(folder, fileName));
  probe.onerror = onError;
  probe.src = photoURL(folder, fileName);
}

function applyBackgroundPhoto(node, folder, fileName, cssVar, readyClass) {
  if (!node || !fileName) return;
  const applied = node.dataset[readyClass];
  if (applied === fileName) return;
  loadPhoto(folder, fileName, (src) => {
    if (!node.isConnected) return;
    node.style.setProperty(cssVar, `url("${src}")`);
    node.classList.add(readyClass);
    node.dataset[readyClass] = fileName;
  });
}

function installWelcomeImage() {
  const hero = document.querySelector('#page-resumen .hero-shell');
  if (!hero) return;
  applyBackgroundPhoto(hero, AALA_PHOTO_SETS['index.html'].folder, 'in1.jpg', '--aala-photo-welcome-image', 'aala-photo-welcome--loaded');
}

function installIndexSectionBackgrounds() {
  const folder = AALA_PHOTO_SETS['index.html'].folder;
  INDEX_SECTION_PHOTOS.forEach(([selector, fileName]) => {
    const section = document.querySelector(selector);
    if (!section) return;
    section.classList.add('aala-photo-section');
    applyBackgroundPhoto(section, folder, fileName, '--aala-photo-section-image', 'aala-photo-section--loaded');
  });
}

function normalizeProgramKey(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function inferCardPhoto(card, index) {
  const programId = normalizeProgramKey(card.dataset.programId || '');
  if (PROGRAM_CARD_PHOTOS[programId]) return PROGRAM_CARD_PHOTOS[programId];

  const title = normalizeProgramKey(card.querySelector('.program-title')?.textContent || '');
  if (title.includes('atitlan_recicla')) return 'pp1.jpg';
  if (title.includes('conservando_atitlan')) return 'pp2.jpg';
  if (title.includes('educando_para_conservar')) return 'pp3.jpg';
  if (title.includes('fortalecimiento')) return 'pp4.jpg';
  if (title.includes('reforest')) return 'pp5.jpg';
  if (title.includes('tul')) return 'pp6.jpg';

  const fallback = ['pp1.jpg', 'pp2.jpg', 'pp3.jpg', 'pp4.jpg', 'pp5.jpg', 'pp6.jpg'];
  return fallback[index] || null;
}

function decorateProgramCard(card, index) {
  if (!card) return;
  card.classList.add('aala-program-card-photo');
  const fileName = inferCardPhoto(card, index);
  applyBackgroundPhoto(card, AALA_PHOTO_SETS['programas-y-proyectos'].folder, fileName, '--aala-program-card-image', 'aala-program-card-photo--loaded');
}

function installProgramCardBackgrounds() {
  const grid = document.querySelector('#page-programas #programGrid');
  if (!grid) return;

  const applyAll = () => {
    const cards = Array.from(grid.querySelectorAll('.program-card'));
    cards.forEach((card, index) => decorateProgramCard(card, index));
  };

  applyAll();

  const observer = new MutationObserver(() => applyAll());
  observer.observe(grid, { childList: true, subtree: true });
}

export function installAalaPhotos() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page !== 'index.html') return;
  installWelcomeImage();
  installIndexSectionBackgrounds();
  installProgramCardBackgrounds();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installAalaPhotos, { once: true });
  } else {
    installAalaPhotos();
  }
}
