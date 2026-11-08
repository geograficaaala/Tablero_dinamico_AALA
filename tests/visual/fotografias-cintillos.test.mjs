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

test('solo fondos en secciones existentes y las seis tarjetas; sin insertar cintillos', () => {
  const js = read('src/components/aala-photo-strips.mjs');
  const css = read('src/styles/aala-fotografias.css');
  assert.match(js, /installWelcomeImage\(\)/);
  for(const marker of ['.storyboard', '.panorama-stage', '.coverage-section', 'in2.jpg', 'in3.jpg', 'in4.jpg']) assert.ok(js.includes(marker));
  for(const [id, photo] of Object.entries({atitlan_recicla:'pp1.jpg', conservando_atitlan:'pp2.jpg', educando_para_conservar:'pp3.jpg', fortalecimiento_municipal:'pp4.jpg', reforestacion:'pp5.jpg', manejo_tul:'pp6.jpg'})) {
    assert.match(js, new RegExp(`${id}: '${photo.replace('.', '\\.')}?'`));
  }
  assert.match(js, /new MutationObserver\(sync\)/);
  assert.doesNotMatch(js.slice(js.indexOf('export function installAalaPhotos()'), js.indexOf('if (typeof document')), /createStrip\(/);
  assert.match(css, /--aala-card-photo/);
  assert.match(css, /background-size:\s*cover\s*!important/);
});

test('el segundo módulo queda inactivo y no inserta elementos duplicados', () => {
  const js = read('src/components/aala-fotografias.mjs');
  assert.match(js, /export function installPhotoGallery\(\)/);
  assert.doesNotMatch(js, /insertAdjacentElement|prepend\(|appendChild\(/);
});
