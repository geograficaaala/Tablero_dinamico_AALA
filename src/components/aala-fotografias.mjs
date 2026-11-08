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

function installIndex() {
  const hero = document.querySelector('#page-resumen .hero-shell');
  if (hero && !hero.classList.contains('aala-photo-hero')) {
    hero.classList.add('aala-photo-hero');
    const background = document.createElement('div');
    background.className = 'aala-photo-hero-background';
    background.setAttribute('aria-hidden', 'true');
    hero.prepend(background);
    loadImage(photoUrl('index', 'in1.jpg'), (img) => {
      if (!hero.isConnected) return;
      background.style.backgroundImage = `url("${img.src}")`;
      hero.classList.add('aala-photo-hero-ready');
    });
  }

  const summary = document.querySelector('#page-resumen .dashboard-ribbon');
  if (summary && !document.querySelector('#page-resumen .aala-photo-strip--index')) {
    summary.insertAdjacentElement('afterend', createRibbon({
      folder: 'index', code: 'in', indices: [2, 3, 4],
      title: 'Fotografías de la Asociación Amigos del Lago de Atitlán', variant: 'index'
    }));
  }

  const carousel = document.querySelector('#page-programas .program-carousel');
  if (carousel && !document.querySelector('#page-programas .aala-photo-strip--projects')) {
    carousel.insertAdjacentElement('beforebegin', createRibbon({
      folder: 'programas-y-proyectos', code: 'pp', indices: [1, 2, 3],
      title: 'Fotografías de programas y proyectos de AALA', variant: 'projects'
    }));
  }
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
