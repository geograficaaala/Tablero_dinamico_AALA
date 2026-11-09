/**
 * AALA · Borrador de Gmail desde el navegador, sin Apps Script, APIs ni envío automático.
 * El informe se construye con los mismos datos institucionales que public/informe.html.
 * Gmail abre un mensaje nuevo con destinatario vacío; enviar requiere acción humana.
 */
import { parseCSV } from '../core/csv.mjs';
import { buildReport } from './report-core.mjs';
import { REPORT_PROFILES } from './report-profiles.mjs';

const GMAIL_COMPOSE_URL = 'https://mail.google.com/mail/?view=cm&fs=1';
const isCsv = path => path.endsWith('.csv');
const rootFile = path => new URL('../../' + path, import.meta.url);

async function readSource(path, get = fetch) {
  const result = await get(rootFile(path), { cache: 'no-store' });
  if (!result.ok) throw new Error(`No se pudo cargar ${path} (HTTP ${result.status}).`);
  return isCsv(path) ? parseCSV(await result.text()) : result.json();
}

export async function loadMonthlyReport(program, period, get = fetch) {
  const profile = REPORT_PROFILES[program];
  if (!profile) throw new Error('Programa desconocido.');
  const files = [...new Set([
    profile.file,
    ...(profile.details || []).map(detail => detail.file),
    ...(profile.monthlyActivitySummary ? ['data/fortalecimiento_municipal/2026/actividades_2026.csv'] : [])
  ])];
  const [definitions, cuts, ...tables] = await Promise.all([
    readSource('config/index/indicadores_institucionales_2026.json', get),
    readSource('data/index/2026/cortes_publicados.json', get),
    ...files.map(file => readSource(file, get))
  ]);
  const sources = Object.fromEntries(files.map((file, i) => [file, tables[i]]));
  return buildReport({ definitions, cuts, program, period, sources });
}

export function gmailSubject(report) {
  return `Informe mensual de resultados · ${report.name} · ${report.periodName} · AALA`;
}

/**
 * El enlace de Gmail solo acepta texto sin formato y tiene límites prácticos de longitud.
 * Incluimos la totalidad de indicadores y seguimientos del corte, con contexto, y dejamos
 * el desglose extenso consultable en el informe completo del tablero.
 */
export function gmailBody(report, { includeDescriptions = true } = {}) {
  const lines = [
    'ASOCIACIÓN AMIGOS DEL LAGO DE ATITLÁN',
    'INFORME MENSUAL DE RESULTADOS',
    report.name.toUpperCase(),
    report.periodName,
    '',
    '1. PRESENTACIÓN Y ALCANCE',
    `Informe correspondiente a ${report.periodName}. ${report.introduction}`,
    '',
    '2. RESUMEN EJECUTIVO',
    `El programa presenta ${report.official.length} indicadores institucionales y ${report.extras.length} resultados de seguimiento complementario.`,
  ];
  if (report.score != null) lines.push(`Cumplimiento promedio publicado: ${new Intl.NumberFormat('es-GT', { maximumFractionDigits: 1 }).format(report.score)} %.`);
  if (report.narrative) lines.push(report.narrative);
  lines.push('', '3. INDICADORES INSTITUCIONALES');
  for (const item of report.official) {
    lines.push(`${item.number}. ${item.label}`);
    lines.push(`  Avance acumulado: ${item.accumulated || 'sin dato publicado'}.`);
    if (item.monthly && item.monthly !== '—') lines.push(`  Resultado mensual: ${item.monthly}.`);
    if (item.progress) lines.push(`  Cumplimiento: ${item.progress}.`);
    if (includeDescriptions && item.temporality) lines.push(`  Temporalidad: ${item.temporality}`);
  }
  lines.push('', '4. SEGUIMIENTO COMPLEMENTARIO');
  report.extras.forEach((item, i) => {
    const label = `${i + 1}. ${item.title}: ${item.value || 'sin dato publicado'}`;
    lines.push(item.monthly ? `${label} (mes: ${item.monthly})` : label);
    if (includeDescriptions && item.description) lines.push(`  ${item.description}`);
  });
  lines.push('', '5. DESGLOSE DE ACTIVIDADES Y COBERTURA');
  if (report.details.length) {
    report.details.forEach(item => lines.push(`• ${item.title}: ${item.rows.length} registros disponibles en el informe completo.`));
  } else lines.push('El seguimiento operativo se consigna en los resultados complementarios anteriores.');
  lines.push('', '6. SEGUIMIENTO ENTRE PERÍODOS');
  report.history.forEach(row => lines.push(`${row.month}: ${row.metrics.map((value, i) => `indicador ${i + 1}: ${value || 'sin dato'}`).join(' · ')}`));
  lines.push('', '7. BALANCE Y FUENTES');
  lines.push(`Este corte consolida ${report.official.length} indicadores y ${report.extras.length} resultados complementarios. Los resultados deben interpretarse de acuerdo con sus metas, temporalidades y registros publicados.`);
  lines.push('Fuentes del programa: ' + report.sourceFiles.join(', '));
  const fullReport = new URL('../../public/informe.html', import.meta.url);
  fullReport.searchParams.set('programa', report.program);
  fullReport.searchParams.set('mes', report.period);
  lines.push('Informe completo y registros detallados: ' + fullReport.href);
  lines.push('', 'Este correo es un borrador preparado desde el tablero AALA. Revise el destinatario y el contenido antes de enviarlo.');
  return lines.join('\n');
}

export function gmailComposeLink(subject, body) {
  const url = new URL(GMAIL_COMPOSE_URL);
  url.searchParams.set('su', subject);
  url.searchParams.set('body', body);
  // No se asigna destinatario: la persona lo introducirá en Gmail.
  return url.toString();
}

export function gmailDraftForReport(report) {
  const subject = gmailSubject(report);
  let body = gmailBody(report);
  let url = gmailComposeLink(subject, body);
  // Evitar URLs excesivamente largas, que algunos navegadores o Gmail pueden cortar.
  if (url.length > 12000) {
    body = gmailBody(report, { includeDescriptions: false });
    url = gmailComposeLink(subject, body);
  }
  if (url.length > 12000) {
    throw new Error('Este informe excede el tamaño que puede precargarse con seguridad mediante un enlace de Gmail. Utiliza «Modo informe» para consultar los detalles.');
  }
  return url;
}
