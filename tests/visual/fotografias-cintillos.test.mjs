import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { PROGRAMS } from '../../src/components/aala-fotografias.mjs';
const files = ['index','atitlan-recicla','conservando-atitlan','educando-para-conservar','fortalecimiento-municipal','reforestando-atitlan','tul'];

test('las siete páginas usan el módulo fotográfico activo por el componente universal', () => {
  const universal = readFileSync('src/components/aala-visual-universal.mjs','utf8');
  assert.match(universal, /import \{ installPhotoGallery \} from '\.\/aala-fotografias\.mjs'/);
  assert.match(universal, /installPhotoGallery\(\)/);
  for (const file of files) {
    const html = readFileSync(`public/${file}.html`, 'utf8');
    assert.match(html, /aala-visual-universal\.mjs/);
  }
});

test('se mantienen seis rutas de programas y existen las seis imágenes dinámicas', () => {
  assert.equal(Object.keys(PROGRAMS).length, 6);
  const script = readFileSync('src/components/aala-fotografias.mjs','utf8');
  const pairs = ['atitlan_recicla: \'pp1.jpg\'','conservando_atitlan: \'pp2.jpg\'','educando_para_conservar: \'pp3.jpg\'','fortalecimiento_municipal: \'pp4.jpg\'','reforestacion: \'pp5.jpg\'','manejo_tul: \'pp6.jpg\''];
  for (let i = 0; i < 6; i++) {
    assert.ok(script.includes(pairs[i]), pairs[i]);
    assert.ok(existsSync(`public/fotografias/programas-y-proyectos/pp${i+1}.jpg`));
  }
});

test('el carrusel, su HTML y su lógica no se modifican para cambiar las fotografías', () => {
  const module = readFileSync('src/components/aala-fotografias.mjs', 'utf8');
  const original = readFileSync('src/index/index-original.mjs', 'utf8');
  assert.match(module, /new MutationObserver\(refreshProjectBanner\)/);
  assert.match(module, /activeDot/);
  assert.match(module, /\.program-card\[data-program-id\]/);
  assert.doesNotMatch(original, /aala:program-card-change|emitActiveProgramCard/);
});

test('las fotografías del índice no cambian la estructura de indicadores ni el diseño general', () => {
  const css = readFileSync('src/styles/aala-fotografias.css', 'utf8');
  assert.match(css, /aala-project-banner-image/);
  assert.match(css, /aala-editorial-photo-loaded/);
  assert.doesNotMatch(css, /program-card\.aala-project-photo-loaded/);
  assert.ok(existsSync('public/index.html'));
});
