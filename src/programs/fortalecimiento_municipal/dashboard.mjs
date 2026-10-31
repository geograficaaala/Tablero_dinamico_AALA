import { cargarDatosFortalecimiento, crearControladorFortalecimiento, COMPONENTES } from './data-controller.mjs';
import { mountProgramHeader } from '../../components/header.js';
import { mountFooter } from '../../components/footer/footer.js';

const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const state = { period: '', view: 'full', component: 'estudios', status: 'all', search: '', slide: 0, slides: [] };
let controller;
let header;
const byId = id => document.getElementById(id);
const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const format = value => Number(value ?? 0).toLocaleString('es-GT', { maximumFractionDigits: 1 });
const periodLabel = period => `${nombresMeses[Number(period.split('-')[1]) - 1] ?? period} ${period.slice(0, 4)}`;
const humanState = status => ({ confirmado: 'Avance confirmado', proceso: 'En revisión', pendiente: 'Pendiente de validar', no: 'Actividad de apoyo' })[status] || status;

function tableMarkup(rows) {
  if (!rows.length) return '<div class="fm-empty">No hay actividades para estos filtros.</div>';
  return `<table class="fm-table"><thead><tr><th>Componente</th><th>Fecha</th><th>Municipio / alcance</th><th>Actividad</th><th>Comentarios y seguimiento</th></tr></thead><tbody>${rows.map(row => `<tr><td><strong>${safe(COMPONENTES[row.componente])}</strong></td><td class="fm-nowrap">${safe(row.fecha || row.periodo)}</td><td><strong>${safe(row.municipio || '—')}</strong></td><td><strong>${safe(row.actividad)}</strong>${row.tipo ? `<span class="fm-secondary">${safe(row.tipo)}</span>` : ''}</td><td>${row.comentario ? `<p>${safe(row.comentario)}</p>` : ''}${row.nota ? `<p>${safe(row.nota)}</p>` : ''}<span class="fm-state">${safe(row.etiqueta_estado || humanState(row.estado))}</span></td></tr>`).join('')}</tbody></table>`;
}

function renderIndicators() {
  const indicators = controller.indicadores(state.period);
  byId('fmCutLabel').textContent = `Corte: ${periodLabel(state.period)}`;
  byId('fmKpis').innerHTML = indicators.map(item => {
    const ratio = item.cumplimiento;
    const progress = ratio === null ? 0 : Math.max(0, Math.min(100, ratio * 100));
    const source = item.origen_valor === 'ajuste_publicado_en_html_original' ? 'Valor histórico publicado' : 'Conteo de registros confirmados';
    return `<article class="fm-kpi"><div class="fm-kpi-label">${safe(item.indicador)}</div><div class="fm-kpi-value">${format(item.valor_publicado)}</div><div class="fm-kpi-meta"><span>Meta anual de referencia</span><strong>${format(item.meta_referencia)} ${safe(item.unidad)}</strong></div><div class="fm-kpi-meta"><span>Cumplimiento</span><strong>${format(progress)} %</strong></div><div class="fm-progress" role="progressbar" aria-label="Cumplimiento ${safe(item.indicador)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress)}"><span style="width:${progress}%"></span></div><div class="fm-kpi-source">${safe(source)}</div></article>`;
  }).join('');
}

function renderActivities() {
  const rows = controller.actividades(state.period, { componente: state.component, estado: state.status, busqueda: state.search });
  byId('fmTableTitle').textContent = COMPONENTES[state.component] || 'Todos los componentes';
  byId('fmTableCount').textContent = `${rows.length} actividades`;
  byId('fmFilterPeriod').textContent = periodLabel(state.period);
  byId('fmTable').innerHTML = tableMarkup(rows);
}

function renderDiagnostic() {
  const rows = controller.actividadesMes(state.period);
  const summary = controller.resumen(state.period);
  const components = [...new Set(rows.map(row => row.componente))];
  const highlights = rows.filter(row => row.actividad || row.comentario).slice(0, 18);
  const note = controller.nota(state.period);
  byId('fmDiagnostic').innerHTML = `<div class="fm-diagnostic-grid"><article class="fm-panel"><h3>Resumen operativo · ${safe(periodLabel(state.period))}</h3><p>En el mes se registraron <strong>${rows.length} actividades</strong> correspondientes a <strong>${components.length} componentes</strong>. La tabla superior conserva el detalle acumulado; esta sección presenta únicamente la información del período seleccionado.</p><div class="fm-summary-list">${summary.map(s => `<div><strong>${safe(s.nombre)}</strong><span>${s.total} registros acumulados · ${s.confirmadas} confirmados</span></div>`).join('')}</div></article><article class="fm-panel"><h3>Actividades relevantes del mes</h3>${highlights.length ? `<ul class="fm-highlights">${highlights.map(row => `<li><strong>${safe(row.municipio || 'Alcance general')}:</strong> ${safe(row.actividad)}${row.comentario ? `<span>${safe(row.comentario)}</span>` : ''}</li>`).join('')}</ul>` : '<p>Sin actividades registradas durante este mes.</p>'}</article></div>${note ? `<article class="fm-panel fm-month-note"><h3>Nota de trazabilidad del período</h3><p>${safe(note)}</p></article>` : ''}`;
}

function renderExecutive() {
  const stats = controller.resumen(state.period);
  const confirmed = Object.keys(COMPONENTES).flatMap(component => controller.actividades(state.period, { componente: component, estado: 'confirmado' }).map(row => ({ ...row, componente: component }))).slice(0, 12);
  const status = controller.estadoProgramatico(state.period);
  const statusText = { avance_solido: 'Avance sólido', avance_medio: 'Avance medio', avance_inicial: 'Avance inicial', sin_avance: 'Sin avance confirmado' }[status.estado];
  byId('fmExecPeriod').textContent = `Actividades acumuladas hasta ${periodLabel(state.period)} · ${statusText}`;
  byId('fmExecStats').innerHTML = `<div class="fm-exec-grid">${stats.map(item => `<div class="fm-exec-card"><span>${safe(item.nombre)}</span><strong>${item.confirmadas} <small>/ ${item.total}</small></strong><div class="fm-progress"><span style="width:${item.total ? Math.round(item.confirmadas / item.total * 100) : 0}%"></span></div></div>`).join('')}</div>`;
  byId('fmExecTable').innerHTML = tableMarkup(confirmed);
}

function render() {
  if (!controller || !state.period) return;
  header.update({ period: state.period, available: controller.periodos });
  byId('fmHero').hidden = state.view === 'exec';
  byId('fmFullView').hidden = state.view !== 'full';
  byId('fmExecutive').hidden = state.view !== 'exec';
  document.querySelectorAll('.fm-data').forEach(element => { if (element.id === 'metas-anuales') element.hidden = false; });
  byId('aalaHeaderRoot').querySelector('#btnFull').classList.toggle('aala-action-active', state.view === 'full');
  byId('aalaHeaderRoot').querySelector('#btnExec').classList.toggle('aala-action-active', state.view === 'exec');
  renderIndicators();
  renderActivities();
  renderDiagnostic();
  renderExecutive();
}

function switchView(view) {
  state.view = view;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sendEmail() {
  const kpis = controller.indicadores(state.period);
  const subject = `Fortalecimiento Municipal · Resumen ${periodLabel(state.period)}`;
  const body = [`Fortalecimiento Municipal — ${periodLabel(state.period)}`, '', 'INDICADORES PUBLICADOS', ...kpis.map(k => `${k.indicador}: ${k.valor_publicado} / ${k.meta_referencia} (${format(k.cumplimiento * 100)} %)`) ,'', 'ACTIVIDADES ACUMULADAS', ...controller.resumen(state.period).map(k => `${k.nombre}: ${k.total} actividades registradas; ${k.confirmadas} confirmadas`), '', 'NOTAS', controller.nota(state.period), '', 'Fuente: Tablero dinámico AALA. Metas históricas pendientes de ratificación.'].join('\n');
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildSlides() {
  const metrics = controller.indicadores(state.period);
  const stats = controller.resumen(state.period);
  const monthly = controller.actividadesMes(state.period);
  const note = controller.nota(state.period);
  const slides = [
    `<p class="fm-overline">Asociación Amigos del Lago de Atitlán</p><h1>Fortalecimiento Municipal</h1><p>Seguimiento de actividades y resultados · ${safe(periodLabel(state.period))}</p>`,
    `<p class="fm-overline">Metas anuales y avance acumulado</p><h1>Indicadores publicados</h1><div class="aala-presentation-grid">${metrics.map(m => `<div class="aala-presentation-metric"><span>${safe(m.indicador)}</span><strong>${format(m.valor_publicado)} / ${format(m.meta_referencia)}</strong><small>${format(m.cumplimiento * 100)} % de la meta de referencia</small></div>`).join('')}</div>`,
    `<p class="fm-overline">Gestión institucional</p><h1>Procesos activos</h1><div class="aala-presentation-grid">${stats.map(s => `<div class="aala-presentation-metric"><span>${safe(s.nombre)}</span><strong>${s.total}</strong><small>${s.confirmadas} registros confirmados</small></div>`).join('')}</div>`,
    `<p class="fm-overline">Análisis mensual</p><h1>Actividades de ${safe(periodLabel(state.period))}</h1><p>Se registraron ${monthly.length} actividades en ${new Set(monthly.map(r => r.componente)).size} componentes.</p><ul class="fm-pres-highlights">${monthly.slice(0, 6).map(r => `<li>${safe(r.municipio || 'Alcance general')} · ${safe(r.actividad)}</li>`).join('')}</ul>`,
    `<p class="fm-overline">Trazabilidad</p><h1>Notas del período</h1><p>${safe(note || 'No se incorporaron notas adicionales para este período.')}</p><p class="fm-pres-disclaimer">Las metas originales todavía no cuentan con ratificación institucional actualizada.</p>`
  ];
  return slides;
}

function showSlide() {
  const count = state.slides.length;
  byId('fmSlide').innerHTML = state.slides[state.slide] || '';
  byId('fmPresCounter').textContent = `${state.slide + 1} / ${count}`;
}

function openPresentation() {
  state.slides = buildSlides();
  state.slide = 0;
  byId('fmPresentation').hidden = false;
  document.body.classList.add('fm-presenting');
  showSlide();
  byId('fmPresClose').focus();
}

function closePresentation() {
  byId('fmPresentation').hidden = true;
  document.body.classList.remove('fm-presenting');
  byId('btnPresentation').focus();
}

function goSlide(offset) {
  if (!state.slides.length) return;
  state.slide = (state.slide + offset + state.slides.length) % state.slides.length;
  showSlide();
}

async function initialize() {
  mountFooter(byId('aalaFooterRoot'));
  header = mountProgramHeader(byId('aalaHeaderRoot'), {
    onView: switchView,
    onPresentation: openPresentation,
    onMail: sendEmail,
    onMonth(period) { state.period = period; render(); }
  }, {
    title: 'Fortalecimiento Municipal',
    homeHref: './index.html',
    navigation: [{ id: 'resumen', text: 'Resumen' }, { id: 'metas-anuales', text: 'Metas' }, { id: 'procesos', text: 'Procesos' }, { id: 'analisis', text: 'Análisis' }]
  });
  byId('fmComponent').innerHTML = Object.entries(COMPONENTES).map(([key, label]) => `<option value="${key}">${safe(label)}</option>`).join('');
  byId('fmComponent').addEventListener('change', e => { state.component = e.target.value; renderActivities(); });
  byId('fmStatus').addEventListener('change', e => { state.status = e.target.value; renderActivities(); });
  byId('fmSearch').addEventListener('input', e => { state.search = e.target.value; renderActivities(); });
  byId('fmPresClose').addEventListener('click', closePresentation);
  byId('fmPresPrev').addEventListener('click', () => goSlide(-1));
  byId('fmPresNext').addEventListener('click', () => goSlide(1));
  document.addEventListener('keydown', event => {
    if (byId('fmPresentation').hidden) return;
    if (event.key === 'Escape') closePresentation();
    if (event.key === 'ArrowRight' || event.key === ' ') { event.preventDefault(); goSlide(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); goSlide(-1); }
  });
  try {
    controller = crearControladorFortalecimiento(await cargarDatosFortalecimiento());
    state.period = controller.ultimoPeriodo;
    byId('fmLoading').hidden = true;
    render();
  } catch (error) {
    byId('fmLoading').hidden = true;
    byId('fmError').hidden = false;
    byId('fmError').textContent = `No se pudieron cargar los datos: ${error.message}`;
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', initialize);
