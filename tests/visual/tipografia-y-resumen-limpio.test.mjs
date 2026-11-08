import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/aala-refinamientos-2026.css', 'utf8');
const index = readFileSync('public/index.html', 'utf8');
const pages = [
  'atitlan-recicla.html', 'conservando-atitlan.html', 'educando-para-conservar.html',
  'fortalecimiento-municipal.html', 'reforestando-atitlan.html', 'tul.html'
];

test('Nunito es la familia de los siete tableros, incluida la tipografía numérica', () => {
  assert.match(css, /--aala-ui-type: 'Nunito'/);
  assert.match(css, /--aala-v2-font: var\(--aala-ui-type\)/);
  assert.match(css, /\.goal-card \.goal-value/);
  assert.match(css, /\.kpi-simple-value/);
  assert.match(css, /font-size:clamp\(1\.5rem,2vw,2\.05rem\)!important/);
  for (const page of ['index.html', ...pages]) {
    const html = readFileSync(`public/${page}`, 'utf8');
    assert.match(html, /\.\.\/src\/styles\/aala-refinamientos-2026\.css/);
  }
});

test('selector de meses solo texto con línea azul inferior para el activo', () => {
  assert.match(css, /\.aala-v2-months \{[\s\S]*?background:transparent!important;border:0!important/);
  assert.match(css, /\.aala-v2-months \.month-pill:is\(\.active,\[aria-pressed="true"\]\)/);
  assert.match(css, /border-bottom-color:#2b648b!important/);
});

test('índice sin fondos de botones ni cajas de resumen institucional', () => {
  assert.match(css, /\.header \.nav-tab:is\(:hover,\.active,\[aria-selected="true"\]\) \{\s*background:transparent!important/);
  assert.match(css, /\.hero-main\.card \{\s*background:transparent!important;\s*border:0!important/);
  assert.match(css, /\.dashboard-ribbon \{\s*background:transparent!important;\s*border:0!important/);
  assert.match(index, /class="dashboard-ribbon/);
});

test('el nombre institucional se centra sobre el párrafo en el pie', () => {
  assert.match(css, /\.footer-title \{[\s\S]*?text-align:center!important/);
  assert.match(css, /\.footer-brand \.aala-footer-name/);
});
