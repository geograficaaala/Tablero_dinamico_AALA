import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const pages = ['index','atitlan-recicla','conservando-atitlan','fortalecimiento-municipal','educando-para-conservar','reforestando-atitlan','tul'];
const source = file => readFileSync(file, 'utf8');

test('las siete páginas consumen la identidad visual compartida', () => {
  for (const name of pages) {
    const html = source(`public/${name}.html`);
    assert.match(html, /aala-v2/);
    assert.match(html, /aala-pastel\.css/);
    assert.match(html, /aala-visual-universal\.mjs/);
    assert.match(html, /family=Tinos/);
  }
});

test('módulos visuales y rutas de importación existentes', () => {
  for(const file of ['src/components/aala-icons.mjs','src/components/aala-institutional-footer.mjs','src/components/aala-institutional-header.mjs','src/components/aala-page-motion.mjs','src/components/aala-visual-universal.mjs','src/styles/themes/aala-pastel.css']) assert.ok(existsSync(file), `No existe el módulo: ${file}`);
  const shell=source('src/components/aala-visual-universal.mjs');
  for(const id of ['btnFull','btnExec','btnPresentation','btnMail','monthPills'])assert.ok(shell.includes(id));
  assert.match(shell,/originalLogo/);
  assert.match(shell,/MutationObserver/);
  const footer=source('src/components/aala-institutional-footer.mjs');
  for(const text of ['+502 2362 3195','amigoatitlan@gmail.com','Lago de Atitlán, Sololá, Guatemala','El objetivo de la Asociación Amigos del Lago de Atitlán'])assert.ok(footer.includes(text));
});

test('portada generada usa rutas de GitHub Pages correctas', () => {
  const script=source('scripts/index/build_portal.py');
  assert.match(script,/aala-visual-universal\.mjs/);
  assert.match(script,/aala-pastel\.css/);
  const workflow=source('.github/workflows/publicar-atitlan-recicla.yml');
  assert.ok(workflow.includes('tests/visual/integracion.test.mjs'));
});


test('footer original restaurado con logo institucional y contacto', () => {
  const footer = source('src/components/aala-institutional-footer.mjs');
  for (const required of ['footer-wrap','footer-brand','footer-col','footer-mark','chill_lago.png','+502 2362 3195','amigoatitlan@gmail.com','Lago de Atitlán, Sololá, Guatemala']) assert.ok(footer.includes(required), `Falta ${required}`);
  assert.ok(existsSync('public/assets/logos/chill_lago.png'));
});

test('tema celeste blanco y componentes sin degradados de fondo', () => {
  const styles = source('src/styles/themes/aala-pastel.css');
  assert.match(styles, /font-family:\s*var\(--aala-v2-font\)/);
  assert.match(styles, /'Nunito'/);
  assert.match(styles, /background-image:none\s*!important/);
  assert.match(styles, /\.ribbon-item\s*,/);
  assert.match(styles, /footer\.site-footer\.aala-v2-footer/);
});
