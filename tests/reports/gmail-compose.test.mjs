import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROGRAM_IDS } from '../../src/reports/report-profiles.mjs';
import { loadMonthlyReport, gmailSubject, gmailBody, gmailDraftForReport } from '../../src/reports/report-gmail.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const mockFetch = async resource => {
  const filename = fileURLToPath(resource);
  if (!fs.existsSync(filename)) return { ok: false, status: 404 };
  return {
    ok: true,
    text: async () => fs.readFileSync(filename, 'utf8'),
    json: async () => JSON.parse(fs.readFileSync(filename, 'utf8'))
  };
};

test('Gmail prepara los seis informes mensuales reales sin Apps Script, destinatario ni adjuntos', async () => {
  for (const program of PROGRAM_IDS) {
    const report = await loadMonthlyReport(program, '2026-10', mockFetch);
    const url = new URL(gmailDraftForReport(report));
    const body = url.searchParams.get('body');
    assert.equal(url.origin, 'https://mail.google.com');
    assert.equal(url.searchParams.get('view'), 'cm');
    assert.equal(url.searchParams.get('fs'), '1');
    assert.equal(url.searchParams.get('to'), null);
    assert.equal(url.searchParams.get('su'), gmailSubject(report));
    assert.match(body, /INFORME MENSUAL DE RESULTADOS/);
    assert.match(body, /INDICADORES INSTITUCIONALES/);
    assert.match(body, /SEGUIMIENTO COMPLEMENTARIO/);
    assert.match(body, /SEGUIMIENTO ENTRE PERÍODOS/);
    assert.match(body, /informe\.html\?programa=/);
    for (const item of report.official) {
      assert.ok(body.includes(item.label), `${program}: falta ${item.label}`);
    }
    for (const item of report.extras) {
      assert.ok(body.includes(item.title), `${program}: falta ${item.title}`);
    }
    assert.ok(gmailBody(report).length > 2000);
    assert.ok(url.href.length < 12000);
  }
});

test('No se inicializa chatbot y no quedan llamadas de Apps Script en el código activo', () => {
  const index = read('public/index.html');
  const ui = read('src/reports/report-ui.mjs');
  const cfg = read('src/reports/report-config.mjs');
  const builder = read('scripts/index/build_portal.py');
  assert.doesNotMatch(index, /<script[^>]+chatbot-(?:config|data)\.js|<script[^>]+chatbot\.js/);
  assert.doesNotMatch(builder, /chatbot-config|chatbot-data|chatbot\.js/);
  assert.doesNotMatch(ui, /APPS_SCRIPT_WEBAPP_URL|script\.google\.com|\/exec/);
  assert.doesNotMatch(cfg, /https:\/\/script\.google\.com/);
  assert.match(ui, /loadMonthlyReport\(PROGRAM, period\)/);
  assert.match(ui, /gmailDraftForReport\(report\)/);
});

test('Mes diferente produce datos y asunto de ese mes', async () => {
  const sep = await loadMonthlyReport('atitlan_recicla', '2026-09', mockFetch);
  const oct = await loadMonthlyReport('atitlan_recicla', '2026-10', mockFetch);
  assert.notEqual(sep.official[0].accumulated, oct.official[0].accumulated);
  assert.match(new URL(gmailDraftForReport(sep)).searchParams.get('su'), /Septiembre de 2026/);
  assert.match(new URL(gmailDraftForReport(oct)).searchParams.get('su'), /Octubre de 2026/);
});
