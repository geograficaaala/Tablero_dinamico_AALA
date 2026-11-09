import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { AALA_PHOTO_SETS, photoURL } from '../../src/components/aala-photo-strips.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = path => readFileSync(resolve(root, path), 'utf8');
const pages = ['index.html','atitlan-recicla.html','conservando-atitlan.html','educando-para-conservar.html','fortalecimiento-municipal.html','reforestando-atitlan.html','tul.html'];

test('las páginas conservan el módulo visual sin reescribir sus HTML', () => {
  for (const page of pages) {
    const html = read(`public/${page}`);
    // Los HTML no se reescriben: si la página carga recursos fotográficos, la ruta es correcta.
    if (html.includes('aala-photo-strips.mjs')) assert.match(html, /src="\.\.\/src\/components\/aala-photo-strips\.mjs"/);
    if (html.includes('aala-fotografias.css')) assert.match(html, /href="\.\.\/src\/styles\/aala-fotografias\.css"/);
  }
});

test('conserva los nombres y directorios de fotografía acordados', () => {
  for(const [id, folder, prefix] of [
    ['index.html','index','in'],['programas-y-proyectos','programas-y-proyectos','pp'],
    ['atitlan-recicla.html','atitlan-recicla','ar'],['conservando-atitlan.html','conservando-atitlan','ca'],
    ['educando-para-conservar.html','educando-para-conservar','ec'],
    ['fortalecimiento-municipal.html','fortalecimiento-municipal','fm'],
    ['reforestando-atitlan.html','reforestando-atitlan','ra'],['tul.html','tul','tu']
  ]) {
    assert.equal(AALA_PHOTO_SETS[id].folder, folder);
    assert.equal(AALA_PHOTO_SETS[id].prefix, prefix);
    assert.ok(photoURL(folder, `${prefix}1.jpg`).endsWith(`/${folder}/${prefix}1.jpg`));
  }
});

test('la portada conserva in1 y el resumen utiliza solo una imagen compartida in2', () => {
  const js = read('src/components/aala-photo-strips.mjs');
  const css = read('src/styles/aala-fotografias.css');
  assert.match(js, /preloadPhoto\('index', 'in1\.jpg'/);
  assert.match(js, /installSharedSummaryBackground/);
  assert.match(js, /preloadPhoto\('index', 'in2\.jpg'/);
  assert.doesNotMatch(js, /preloadPhoto\('index', 'in3\.jpg'/);
  assert.match(js, /preloadPhoto\('index', 'in4\.jpg'/);
  assert.match(css, /#page-resumen\.aala-shared-summary-photo--loaded/);
  assert.match(css, /aala-shared-summary-photo/);
  assert.match(css, /aala-photo-scene--loaded::before/);
  assert.match(css, /display: none !important/);
});

test('los dos cintillos muestran estáticas las seis imágenes sin alterar el carrusel', async () => {
  const { AALA_PROGRAM_PHOTOS } = await import('../../src/components/aala-photo-strips.mjs');
  const expected = {
    atitlan_recicla: 'pp1.jpg', conservando_atitlan: 'pp2.jpg',
    educando_para_conservar: 'pp3.jpg', fortalecimiento_municipal: 'pp4.jpg',
    reforestacion: 'pp5.jpg', manejo_tul: 'pp6.jpg'
  };
  for (const [id, filename] of Object.entries(expected)) assert.equal(AALA_PROGRAM_PHOTOS[id], filename);
  const js = read('src/components/aala-photo-strips.mjs');
  const css = read('src/styles/aala-fotografias.css');
  assert.match(js, /STRIP_PHOTOS = Object\.freeze\(\['pp1\.jpg'/);
  assert.match(js, /'pp6\.jpg'\]\)/);
  assert.match(js, /actions\.insertBefore\(createMarquee\('left'\)/);
  assert.match(js, /viewport\.after\(createMarquee\('right'\)\)/);
  assert.doesNotMatch(js, /for \(let copy = 0/);
  assert.match(css, /animation: none !important/);
  assert.match(css, /grid-template-columns: repeat\(6, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(js, /programGrid\.innerHTML|insertAdjacentHTML/);
  assert.doesNotMatch(js, /report-config|monthPills|KpiGrid|metas_2026/);
});

test('las tarjetas quedan sobre un único fondo in4 y mantienen la aparición al scroll', () => {
  const js = read('src/components/aala-photo-strips.mjs');
  const css = read('src/styles/aala-fotografias.css');
  assert.match(js, /installProgramsBackground/);
  assert.match(js, /preloadPhoto\('index', 'in4\.jpg'/);
  assert.match(css, /#page-programas\.aala-programs-background--loaded/);
  assert.match(css, /program-carousel > \.aala-photo-marquee--right/);
  assert.match(css, /margin-top: 0 !important/);
  assert.match(js, /new IntersectionObserver/);
  assert.match(js, /installScrollTextReveal/);
  assert.match(js, /observer\.unobserve\(entry\.target\)/);
  assert.match(css, /aala-reveal-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test('el módulo cargado en las siete páginas activa la fotografía una sola vez', () => {
  const js = read('src/components/aala-fotografias.mjs');
  const universal = read('src/components/aala-visual-universal.mjs');
  assert.match(universal, /installPhotoGallery/);
  assert.match(js, /export function installPhotoGallery\(\)/);
  assert.match(js, /import \{ installAalaPhotos \}/);
  assert.match(js, /aala-fotografias\.css/);
  assert.doesNotMatch(js, /insertAdjacentElement|appendChild\(/);
});
