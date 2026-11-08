const BASE_PUBLIC = new URL('../../public/fotografias/', import.meta.url);
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export const AALA_PHOTO_SETS = {
  'index.html': { folder: 'index', prefix: 'in', label: 'Portada institucional de AALA' },
  'programas-y-proyectos': { folder: 'programas-y-proyectos', prefix: 'pp', label: 'Programas y proyectos de AALA' },
  'atitlan-recicla.html': { folder: 'atitlan-recicla', prefix: 'ar', label: 'Atitlán Recicla' },
  'conservando-atitlan.html': { folder: 'conservando-atitlan', prefix: 'ca', label: 'Conservando Atitlán' },
  'educando-para-conservar.html': { folder: 'educando-para-conservar', prefix: 'ec', label: 'Educando para Conservar' },
  'fortalecimiento-municipal.html': { folder: 'fortalecimiento-municipal', prefix: 'fm', label: 'Fortalecimiento Municipal' },
  'reforestando-atitlan.html': { folder: 'reforestando-atitlan', prefix: 'ra', label: 'Reforestando Atitlán' },
  'tul.html': { folder: 'tul', prefix: 'tu', label: 'Siembra de Tul' }
};

const PROGRAM_HERO_PHOTO = {
  atitlan_recicla: 1,
  conservando_atitlan: 2,
  educando_para_conservar: 3,
  fortalecimiento_municipal: 4,
  reforestacion: 5,
  tul: 6
};

const PROGRAM_FALLBACK_TEXT = {
  atitlan_recicla: 'Recuperación de materiales, comercialización y lectura institucional del desempeño del programa.',
  conservando_atitlan: 'Seguimiento a la recolección de aceite, producción de jabones y resultados de conservación del programa.',
  educando_para_conservar: 'Indicadores educativos, acompañamiento ambiental y metas institucionales del proceso formativo.',
  fortalecimiento_municipal: 'Avance institucional de estudios, PIRDES, fortalecimiento técnico y coordinación con municipalidades.',
  reforestacion: 'Indicadores de reforestación, viveros, monitoreo y cobertura territorial del esfuerzo forestal institucional.',
  tul: 'Lectura breve de las jornadas, sitios atendidos y resultados del programa de restauración de tul.'
};

export function photoURL(folder, file) {
  return new URL(`${folder}/${file}`, BASE_PUBLIC).href;
}

function loadPhoto(folder, file, onLoad, onError = () => {}) {
  const img = new Image();
  img.decoding = 'async';
  img.loading = 'lazy';
  img.addEventListener('load', () => onLoad(photoURL(folder, file)), { once: true });
  img.addEventListener('error', onError, { once: true });
  img.src = photoURL(folder, file);
}

function photoTile(group, number, variant) {
  const tile = document.createElement('article');
  tile.className = `aala-photo-tile aala-photo-tile--${variant}`;
  tile.dataset.photoNumber = String(number);
  const waiting = document.createElement('div');
  waiting.className = 'aala-photo-pending';
  waiting.textContent = 'Espacio listo para fotografía';
  tile.append(waiting);
  loadPhoto(group.folder, `${group.prefix}${number}.jpg`, (src) => {
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

function scenicSection(selector, number, tone = 'light') {
  const section = document.querySelector(selector);
  if (!section || section.dataset.aalaPhotoEditorial) return;
  section.dataset.aalaPhotoEditorial = String(number);
  section.classList.add('aala-photo-editorial', `aala-photo-editorial--${tone}`);
  const group = AALA_PHOTO_SETS['index.html'];
  loadPhoto(group.folder, `in${number}.jpg`, (src) => {
    if (!section.isConnected) return;
    section.style.setProperty('--aala-editorial-photo', `url("${src}")`);
    section.classList.add('aala-photo-editorial--loaded');
  });
}

function installIndexEditorialSections() {
  scenicSection('#page-resumen .storyboard', 2, 'light');
  scenicSection('#page-resumen .panorama-stage', 3, 'warm');
  scenicSection('#page-resumen .coverage-section', 4, 'light');
}

function ensureProgramHero() {
  const wrap = document.querySelector('#page-programas > .wrap');
  const toolbar = document.querySelector('#page-programas .program-month-toolbar');
  if (!wrap || !toolbar) return null;
  let hero = wrap.querySelector('[data-aala-program-hero]');
  if (hero) return hero;
  hero = document.createElement('section');
  hero.className = 'aala-program-hero';
  hero.dataset.aalaProgramHero = 'true';
  hero.innerHTML = `
    <div class="aala-program-hero-media" aria-hidden="true"></div>
    <div class="aala-program-hero-overlay" aria-hidden="true"></div>
    <div class="aala-program-hero-shell">
      <div class="aala-program-hero-copy">
        <div class="aala-program-hero-kicker">Programas y proyectos</div>
        <h2 class="aala-program-hero-title">Programas institucionales</h2>
        <p class="aala-program-hero-text">Selecciona un programa para revisar sus indicadores, metas y avance institucional.</p>
        <div class="aala-program-hero-period" id="aalaProgramHeroPeriod">Período de lectura institucional</div>
      </div>
    </div>`;
  wrap.insertBefore(hero, toolbar);
  return hero;
}

function updateProgramHero(detail = {}) {
  const hero = ensureProgramHero();
  if (!hero) return;
  const title = hero.querySelector('.aala-program-hero-title');
  const copy = hero.querySelector('.aala-program-hero-text');
  const period = hero.querySelector('.aala-program-hero-period');
  const programId = detail.programId || 'atitlan_recicla';
  const number = PROGRAM_HERO_PHOTO[programId] || Number(detail.index) || 1;
  const group = AALA_PHOTO_SETS['programas-y-proyectos'];
  if (title) title.textContent = detail.name || 'Programas institucionales';
  if (copy) copy.textContent = detail.description || PROGRAM_FALLBACK_TEXT[programId] || 'Indicadores, metas y resultados del programa.';
  if (period) {
    const monthIndex = Number(detail.month) - 1;
    period.textContent = Number.isFinite(monthIndex) && monthIndex >= 0 && monthIndex < MONTHS.length
      ? `Período de lectura: ${MONTHS[monthIndex]} de 2026`
      : 'Período de lectura institucional';
  }
  loadPhoto(group.folder, `pp${number}.jpg`, (src) => {
    if (!hero.isConnected) return;
    hero.style.setProperty('--aala-program-hero-image', `url("${src}")`);
    hero.classList.add('aala-program-hero--loaded');
  }, () => {
    hero.classList.remove('aala-program-hero--loaded');
    hero.style.removeProperty('--aala-program-hero-image');
  });
}

function installProgramHeroBridge() {
  ensureProgramHero();
  window.addEventListener('aala:program-card-change', (event) => updateProgramHero(event.detail || {}));
  const initialCard = document.querySelector('#programGrid .program-card');
  if (initialCard) {
    updateProgramHero({
      index: 1,
      programId: initialCard.dataset.programId,
      name: initialCard.querySelector('.program-title')?.textContent?.trim(),
      month: 10
    });
  }
}

function installIndexPhotography() {
  installWelcomeImage();
  installIndexEditorialSections();
  installProgramHeroBridge();
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
