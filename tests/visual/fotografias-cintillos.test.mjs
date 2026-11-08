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

test('se mantienen portada y fondo panorámico en las tres secciones existentes', () => {
  const js = read('src/components/aala-photo-strips.mjs');
  const css = read('src/styles/aala-fotografias.css');
  for (const [section, filename] of [['.storyboard','in2.jpg'],['.panorama-stage','in3.jpg'],['.coverage-section','in4.jpg']]) {
    assert.ok(js.includes(section));
    assert.ok(js.includes(filename));
  }
  assert.match(js, /preloadPhoto\('index', 'in1\.jpg'/);
  assert.match(css, /\.aala-photo-welcome-background/);
  assert.match(css, /\.aala-photo-scene--loaded::before/);
  assert.match(css, /left: calc\(50% - 50vw\)/);
  assert.match(css, /width: 100vw/);
  assert.match(css, /\.hero-side\s*\{\s*display: none !important/);
  assert.doesNotMatch(js, /createStrip\(|installProgramStrip\(/);
});

test('los dos cintillos contienen las seis fotografías y no alteran el carrusel', async () => {
  const { AALA_PROGRAM_PHOTOS } = await import('../../src/components/aala-photo-strips.mjs');
  const expected = {
    atitlan_recicla: 'pp1.jpg',
    conservando_atitlan: 'pp2.jpg',
    educando_para_conservar: 'pp3.jpg',
    fortalecimiento_municipal: 'pp4.jpg',
    reforestacion: 'pp5.jpg',
    manejo_tul: 'pp6.jpg'
  };
  for (const [id, filename] of Object.entries(expected)) assert.equal(AALA_PROGRAM_PHOTOS[id], filename);
  const js = read('src/components/aala-photo-strips.mjs');
  const css = read('src/styles/aala-fotografias.css');
  assert.match(js, /STRIP_PHOTOS = Object\.freeze\(\['pp1\.jpg'/);
  assert.match(js, /'pp6\.jpg'\]\)/);
  assert.match(js, /actions\.insertBefore\(createMarquee\('left'\)/);
  assert.match(js, /viewport\.after\(createMarquee\('right'\)\)/);
  assert.match(css, /@keyframes aala-marquee-move-left/);
  assert.match(css, /@keyframes aala-marquee-move-right/);
  assert.match(css, /animation-duration: 92s/);
  assert.doesNotMatch(js, /programGrid\.innerHTML|insertAdjacentHTML/);
  assert.doesNotMatch(js, /report-config|monthPills|KpiGrid|metas_2026/);
});

test('el texto se revela al hacer scroll y las fotos permanecen visibles', () => {
  const js = read('src/components/aala-photo-strips.mjs');
  const css = read('src/styles/aala-fotografias.css');
  assert.match(js, /new IntersectionObserver/);
  assert.match(js, /installScrollTextReveal/);
  assert.match(js, /observer\.unobserve\(entry\.target\)/);
  assert.match(css, /aala-reveal-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /aala-summary-bridge-photo/);
  assert.match(css, /#page-resumen \.storyboard,/);
  assert.match(css, /margin-bottom: 0 !important/);
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
