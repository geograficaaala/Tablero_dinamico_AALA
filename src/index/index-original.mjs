
import { construirProgramaInstitucional } from './indicadores-institucionales.mjs';
import { programIdFromSearch, rememberedProgramId, rememberProgramId } from '../components/aala-program-return.mjs';

/* ────────────────────────────────
   NAVEGACIÓN POR TABS
──────────────────────────────── */
const returnProgramId = programIdFromSearch(window.location.search);
if (returnProgramId) rememberProgramId(returnProgramId);

function showIndexPage(name, { resetScroll = true, updateUrl = true } = {}) {
  if (name !== 'resumen' && name !== 'programas') return;
  document.querySelectorAll('.nav-tab').forEach(tab => {
    const active = tab.dataset.page === name;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('.page').forEach(page => {
    page.classList.toggle('active', page.id === `page-${name}`);
  });
  // La pestaña queda registrada ANTES de abrir cualquier HTML independiente:
  // el botón Atrás del navegador vuelve a Programas, no a Resumen.
  if (updateUrl && window.location.hash !== `#${name}`) {
    window.history.replaceState(window.history.state, '', `#${name}`);
  }
  if (resetScroll) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  if (name === 'programas') {
    window.requestAnimationFrame(() => goToProgramCarousel(programCarouselIndex, 'auto'));
  }
}

document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => showIndexPage(tab.dataset.page));
});

// El header puede ocupar varias filas cuando el navegador está al 175%.
// El selector mensual pegajoso debe quedar SIEMPRE debajo de él.
const indexHeader = document.querySelector('body.aala-index > header.header');
if (indexHeader) {
  const measureHeader = () => document.documentElement.style.setProperty(
    '--aala-index-header-height', `${Math.ceil(indexHeader.getBoundingClientRect().height)}px`
  );
  measureHeader();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measureHeader).observe(indexHeader);
  window.addEventListener('resize', measureHeader);
}


/* ────────────────────────────────
   UTILIDADES
──────────────────────────────── */
const fmt    = (n, d=0) => new Intl.NumberFormat('es-GT', {maximumFractionDigits:d, minimumFractionDigits:d}).format(Number(n||0));
const fmtPct = (n) => `${fmt(n,1)}%`;
const safe   = (v) => (v===undefined || v===null || v==='') ? '—' : String(v);

function parseCsv(url){
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download:true, header:true, skipEmptyLines:'greedy',
      complete: res => resolve(res.data || []),
      error: reject
    });
  });
}
function cast(rows){
  return rows.map(r => {
    const o = {...r};
    for (const k of Object.keys(o)){
      if (o[k] === '') continue;
      const num = Number(String(o[k]).replace(/,/g,''));
      if (!Number.isNaN(num) && String(o[k]).trim() !== '') o[k] = num;
    }
    return o;
  });
}
function statusClass(score){
  if (score >= 100) return ['good','Avance alto'];
  if (score >= 80)  return ['warn','Avance sostenido'];
  return ['neutral','Avance en proceso'];
}
function avg(arr){
  const nums = arr.map(Number).filter(v => !Number.isNaN(v) && Number.isFinite(v));
  return nums.length ? nums.reduce((a,b)=>a+b,0)/nums.length : 0;
}
function sortByMonth(rows){ return rows.sort((a,b) => (Number(a.mes_num||0) - Number(b.mes_num||0))) }
function barClass(pct){
  if (pct >= 100) return 'over';
  if (pct >= 80)  return 'good';
  if (pct >= 50)  return 'mid';
  return '';  /* verde pálido por defecto */
}

/* ────────────────────────────────
   MAPA DE COBERTURA TERRITORIAL
──────────────────────────────── */
const COVERAGE_GEOJSON_URL = new URL('../../public/assets/maps/cobertura.geojson', import.meta.url).href;
const COVERAGE_DEFAULT_VIEW = { center: [14.77, -91.18], zoom: 10 };
const COVERAGE_COLORS = ['#1c6084', '#2e6a57', '#d5a34b', '#7b5cc7', '#c45f2d', '#1c7c86', '#a24760'];

let coverageMap = null;
let coverageGeojson = null;
let coverageLayer = null;
let coverageBounds = null;
let coverageFields = [];
let activeCoverageField = '';

function normalizeCoverageValue(value){
  const raw = String(value ?? '').trim().toLowerCase();
  return raw === '1' || raw === 'si' || raw === 'sí' || raw === 'true' || raw === 'x';
}
function coverageColor(field){
  const index = Math.max(0, coverageFields.indexOf(field));
  return COVERAGE_COLORS[index % COVERAGE_COLORS.length];
}
function coverageFieldLabel(field){
  const labels = {
    'Fortalecimiento': 'Fortalecimiento Municipal'
  };
  return labels[field] || field;
}
function normalizeCoverageMunicipio(value){
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
function isExcludedCoverageMunicipio(value){
  return normalizeCoverageMunicipio(value) === 'santa catarina ixtahuacan';
}
function updateCoverageButtons(){
  document.querySelectorAll('.coverage-filter').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.field === activeCoverageField);
  });
}
function focusCoverageDefaultView(){
  if (!coverageMap) return;
  if (coverageBounds?.isValid()){
    coverageMap.fitBounds(coverageBounds, { padding: [20, 20], maxZoom: 10 });
    return;
  }
  coverageMap.setView(COVERAGE_DEFAULT_VIEW.center, COVERAGE_DEFAULT_VIEW.zoom);
}
function clearCoverageLayer(resetView = false){
  if (coverageLayer && coverageMap){
    coverageMap.removeLayer(coverageLayer);
    coverageLayer = null;
  }
  if (resetView) focusCoverageDefaultView();
}
function renderCoverageFilters(fields){
  const wrap = document.getElementById('coverageFilters');
  if (!wrap) return;
  if (!fields.length){
    wrap.innerHTML = '<button class="coverage-filter" type="button" disabled>No hay filtros disponibles</button>';
    return;
  }
  wrap.innerHTML = fields.map(field => `<button class="coverage-filter" type="button" data-field="${field}">${coverageFieldLabel(field)}</button>`).join('');
  wrap.querySelectorAll('.coverage-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.field || '';
      if (field === activeCoverageField){
        activeCoverageField = '';
        clearCoverageLayer(true);
        updateCoverageButtons();
        return;
      }
      applyCoverageField(field);
    });
  });
  updateCoverageButtons();
}
function applyCoverageField(field){
  if (!coverageMap || !coverageGeojson?.features?.length || !field) return;
  activeCoverageField = field;
  clearCoverageLayer(false);

  const fieldLabel = coverageFieldLabel(field);
  const matches = coverageGeojson.features.filter(feature => {
    const municipio = feature?.properties?.municipio || '';
    if (isExcludedCoverageMunicipio(municipio)) return false;
    if (field === 'Siembra de tul' &&
        normalizeCoverageMunicipio(municipio).includes('nahua')) return false;
    return normalizeCoverageValue(feature?.properties?.[field]);
  });
  const color = coverageColor(field);

  if (!matches.length){
    updateCoverageButtons();
    return;
  }

  coverageLayer = L.geoJSON({ type: 'FeatureCollection', features: matches }, {
    style: {
      color,
      weight: 3.2,
      opacity: 1,
      fillColor: color,
      fillOpacity: 0.08
    },
    onEachFeature(feature, layer){
      const municipio = safe(feature?.properties?.municipio);
      layer.bindTooltip(municipio, { sticky: true, direction: 'top', className: 'coverage-tooltip' });
      layer.bindPopup(`<strong>${municipio}</strong><br>${fieldLabel}: 1`);
    }
  }).addTo(coverageMap);

  if (coverageLayer.getBounds().isValid()){
    coverageMap.fitBounds(coverageLayer.getBounds(), { padding: [20, 20], maxZoom: 11 });
  }

  updateCoverageButtons();
}
async function initCoverageMap(){
  const mapNode = document.getElementById('coverageMap');
  if (!mapNode || coverageMap) return;

  if (typeof L === 'undefined') { mapNode.textContent = 'El mapa requiere conexión para cargar Leaflet.'; return; }
  coverageMap = L.map(mapNode, {
    zoomControl: true,
    scrollWheelZoom: true,
    attributionControl: true
  }).setView(COVERAGE_DEFAULT_VIEW.center, COVERAGE_DEFAULT_VIEW.zoom);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
  }).addTo(coverageMap);

  try {
    const res = await fetch(COVERAGE_GEOJSON_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    coverageGeojson = await res.json();

    const features = Array.isArray(coverageGeojson?.features) ? coverageGeojson.features : [];
    if (!features.length) throw new Error('El GeoJSON no contiene entidades.');

    const props = features[0]?.properties || {};
    coverageFields = Object.keys(props).filter(key => key !== 'municipio');
    renderCoverageFilters(coverageFields);

    const boundsProbe = L.geoJSON(coverageGeojson);
    coverageBounds = boundsProbe.getBounds();
    focusCoverageDefaultView();

    setTimeout(() => coverageMap?.invalidateSize(), 120);
    window.addEventListener('resize', () => coverageMap?.invalidateSize());
  } catch (err) {
    console.error('No fue posible cargar el mapa de cobertura', err);
    mapNode.insertAdjacentText('beforeend','No se pudo cargar la cobertura geográfica.');
    renderCoverageFilters([]);
  }
}


/* ────────────────────────────────
   CARRUSEL RESPONSIVO DE PROGRAMAS
──────────────────────────────── */
let programCarouselIndex = 0;
let programCarouselScrollTimer = null;

function programCarouselItems(){
  const grid = document.getElementById('programGrid');
  return grid ? Array.from(grid.querySelectorAll('.program-card')) : [];
}

function programCarouselItemLeft(item, viewport){
  return item.getBoundingClientRect().left - viewport.getBoundingClientRect().left + viewport.scrollLeft;
}

function updateProgramCarouselControls(index = programCarouselIndex){
  const items = programCarouselItems();
  if (!items.length) return;

  programCarouselIndex = Math.max(0, Math.min(index, items.length - 1));
  if (document.getElementById('page-programas')?.classList.contains('active')) {
    rememberProgramId(items[programCarouselIndex].dataset.programId);
  }
  const prev = document.getElementById('programCarouselPrev');
  const next = document.getElementById('programCarouselNext');
  const dots = document.getElementById('programCarouselDots');

  if (prev) prev.disabled = programCarouselIndex === 0;
  if (next) next.disabled = programCarouselIndex === items.length - 1;

  if (dots){
    Array.from(dots.children).forEach((dot, dotIndex) => {
      const active = dotIndex === programCarouselIndex;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }
}

function goToProgramCarousel(index, behavior = 'smooth'){
  const viewport = document.getElementById('programCarouselViewport');
  const items = programCarouselItems();
  if (!viewport || !items.length) return;

  const nextIndex = Math.max(0, Math.min(index, items.length - 1));
  viewport.scrollTo({
    left: programCarouselItemLeft(items[nextIndex], viewport),
    behavior
  });
  updateProgramCarouselControls(nextIndex);
}

function initProgramCarousel(initialProgramId = null){
  const viewport = document.getElementById('programCarouselViewport');
  const dots = document.getElementById('programCarouselDots');
  const prev = document.getElementById('programCarouselPrev');
  const next = document.getElementById('programCarouselNext');
  const items = programCarouselItems();
  if (!viewport || !dots || !prev || !next || !items.length) return;

  window.clearTimeout(programCarouselScrollTimer);
  const preferredIndex = initialProgramId === null ? 0 : items.findIndex(item => item.dataset.programId === initialProgramId);
  programCarouselIndex = Math.max(0, preferredIndex);
  dots.innerHTML = items.map((item, index) => {
    const name = item.querySelector('.program-title')?.textContent?.trim() || `Programa ${index + 1}`;
    return `<button type="button" class="program-carousel-dot${index === programCarouselIndex ? ' active' : ''}" aria-label="Ver ${name}" aria-current="${index === programCarouselIndex ? 'true' : 'false'}"></button>`;
  }).join('');

  Array.from(dots.children).forEach((dot, index) => {
    dot.addEventListener('click', () => goToProgramCarousel(index));
  });

  prev.onclick = () => goToProgramCarousel(programCarouselIndex - 1);
  next.onclick = () => goToProgramCarousel(programCarouselIndex + 1);

  viewport.onkeydown = event => {
    if (event.key === 'ArrowLeft'){
      event.preventDefault();
      goToProgramCarousel(programCarouselIndex - 1);
    } else if (event.key === 'ArrowRight'){
      event.preventDefault();
      goToProgramCarousel(programCarouselIndex + 1);
    } else if (event.key === 'Home'){
      event.preventDefault();
      goToProgramCarousel(0);
    } else if (event.key === 'End'){
      event.preventDefault();
      goToProgramCarousel(items.length - 1);
    }
  };

  viewport.onscroll = () => {
    window.clearTimeout(programCarouselScrollTimer);
    programCarouselScrollTimer = window.setTimeout(() => {
      const currentItems = programCarouselItems();
      if (!currentItems.length) return;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      currentItems.forEach((item, index) => {
        const distance = Math.abs(programCarouselItemLeft(item, viewport) - viewport.scrollLeft);
        if (distance < closestDistance){
          closestDistance = distance;
          closestIndex = index;
        }
      });
      updateProgramCarouselControls(closestIndex);
    }, 80);
  };

  viewport.scrollTo({ left: programCarouselItemLeft(items[programCarouselIndex], viewport), behavior: 'instant' });
  updateProgramCarouselControls(programCarouselIndex);
}

window.addEventListener('resize', () => {
  window.clearTimeout(programCarouselScrollTimer);
  programCarouselScrollTimer = window.setTimeout(() => {
    goToProgramCarousel(programCarouselIndex, 'auto');
  }, 120);
});

/* ────────────────────────────────
   RENDER MÉTRICAS
──────────────────────────────── */
function metricRow(m, index = 0, hasMonthlyColumn = true){
  const objectiveNumber = `${index + 1}`;
  const temporalFullMarkup = m.temporality
    ? `<div class="metric-note-full">${m.temporality}</div>`
    : '';
  const metricNameMarkup = `<span class="metric-number">${objectiveNumber}</span><span class="metric-label-text">${m.label}</span>`;

  const pct = m.pct == null ? NaN : Number(m.pct);
  const barPct = m.barPct == null ? NaN : Number(m.barPct);
  const hasPct = Number.isFinite(barPct);
  const w = hasPct ? Math.min(Math.max(barPct, 0), 100) : 0;
  const cls = barClass(hasPct ? barPct : 0);
  const acumLabel = m.acumDisplay || (m.isMensual
    ? `${fmt(m.acum, m.unit==='GTQ/día'?1:0)} ${m.unit}`
    : `${fmt(m.acum, 0)} / ${fmt(m.meta||0)} ${m.unit}`);
  const pctLabel = (m.pctDisplay === null || m.pctDisplay === false)
    ? ''
    : (m.pctDisplay || (hasPct ? fmtPct(barPct) : '—'));
  const subIndicators = Array.isArray(m.subIndicators)
    ? `<div class="metric-subgroup">${m.subIndicators.map(item => {
        const subHasPct = Number.isFinite(Number(item?.barPct));
        const subWidth = subHasPct ? Math.max(0, Math.min(Number(item.barPct), 100)) : 0;
        const subFillClass = item?.pending ? 'metric-subfill pending' : 'metric-subfill';
        const valueMarkup = item?.valueDisplay ? `<strong>${item.valueDisplay}</strong>` : '';
        return `<div class="metric-subindicator"><div class="metric-subcopy">${item?.label}: ${valueMarkup}</div><div class="metric-subbar"><span class="${subFillClass}" style="width:${subWidth}%"></span></div></div>`;
      }).join('')}</div>`
    : '';
  const acumBar = m.hideAcumBar ? '' : `<div class="mbar"><span class="${cls}" style="width:${hasPct ? w : 0}%"></span></div>`;

  const monthlyPct = Number(m.monthlyPct);
  const hasMonthlyPct = m.monthlyPct !== null && m.monthlyPct !== undefined && Number.isFinite(monthlyPct);
  const monthlyW = hasMonthlyPct ? Math.min(Math.max(monthlyPct, 0), 100) : 0;
  const monthlyCls = barClass(hasMonthlyPct ? monthlyPct : 0);
  const monthlyLabel = m.monthlyDisplay || (hasMonthlyPct ? fmtPct(monthlyPct) : '—');
  const monthlyCol = hasMonthlyColumn
    ? `<div class="mcol-monthly"><div class="metric-monthly-value">${monthlyLabel}</div><div class="mbar"><span class="${monthlyCls}" style="width:${hasMonthlyPct ? monthlyW : 0}%"></span></div></div>`
    : '';

  return `
    <div class="metric-row">
      <div class="mname">${metricNameMarkup}</div>
      <div class="mcol-acum">
        <div class="metric-primary">${acumLabel}</div>
        ${acumBar}
        ${subIndicators}
      </div>
      <div class="mcol-pct">
        <div class="metric-primary">${pctLabel}</div>
        <div class="mbar"><span class="${cls}" style="width:${hasPct ? w : 0}%"></span></div>
      </div>
      ${monthlyCol}
      ${temporalFullMarkup}
    </div>
  `;
}

/* ────────────────────────────────
   RENDER TARJETA DE PROGRAMA
──────────────────────────────── */
function programCard(p){
  const scoreFill = Math.min(Math.max(Number(p.score || 0), 0), 100);
  const hasMonthlyColumn = p.hasMonthlyColumn !== false;
  const cardClass = hasMonthlyColumn ? 'card program-card' : 'card program-card no-monthly';
  const scoreHeader = p.scoreHeader || 'Cumplimiento promedio con respecto a metas mensuales';
  return `
    <article class="${cardClass}" data-program-id="${escapeHtml(p.id)}">
      <div class="program-head">
        <div>
          <div class="program-kicker">Indicadores priorizados</div>
          <div class="program-title">${p.name}</div>
        </div>
      </div>
      <div class="prog-score-wrap">
        <div class="prog-score-header">
          <span class="prog-score-label">${scoreHeader}</span>
          <span class="prog-score-value">${finite(p.score) ? fmtPct(p.score) : '—'}</span>
        </div>
        <div class="prog-score-track">
          <div class="prog-score-fill" style="width:${scoreFill}%"></div>
        </div>
        <div class="prog-score-sub">${safe(p.latestLabel)}</div>
      </div>
      <div class="metric-list">
        <div class="metric-header">
          <span>Indicador anual</span>
          <span>Avance acumulado al presente mes contra meta anual</span>
          <span>Avance porcentual acumulado al presente mes contra meta anual</span>
          ${hasMonthlyColumn ? '<span>Cumplimiento de metas mensuales</span>' : ''}
        </div>
        ${p.metrics.map((metric, index) => metricRow(metric, index, hasMonthlyColumn)).join('')}
      </div>
      <div class="program-footer">
        <a class="btn" href="${p.dashboard}">
          Abrir tablero dinámico
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
        </a>
      </div>
    </article>
  `;
}

/* ────────────────────────────────
   RENDER RESUMEN GLOBAL
──────────────────────────────── */
function currentVisitLabel(programs){
  // Leer el mes desde los datos cargados, nunca desde el calendario del sistema
  if (programs && programs.length) {
    const sorted = [...programs]
      .filter(p => p.latestLabel && p.latestLabel !== 'Sin datos' && p.latestLabel !== '—')
      .sort((a,b) => (b.periodKey||'').localeCompare(a.periodKey||''));
    if (sorted.length) return sorted[0].latestLabel;
  }
  return 'Último mes con datos';
}

function renderSummary(programs){
  const avgScore = avg(programs.map(p => p.score).filter(finite));
  const onTrack  = programs.filter(p => p.score >= 80).length;
  const alert    = programs.filter(p => p.score < 80).length;
  const visitLabel = currentVisitLabel(programs);
  const [, chipText] = statusClass(avgScore);

  document.getElementById('kpiPrograms').textContent = '6';
  document.getElementById('kpiLatest').textContent = visitLabel;
  document.getElementById('kpiLatestSub').textContent = '';
  const kpiHealth = document.getElementById('kpiHealth');
  if (kpiHealth) kpiHealth.textContent = fmtPct(avgScore);
  const kpiHealthSub = document.getElementById('kpiHealthSub');
  if (kpiHealthSub) kpiHealthSub.textContent = chipText;
  const kpiOnTrack = document.getElementById('kpiOnTrack');
  const kpiAlert = document.getElementById('kpiAlert');
  if (kpiOnTrack) kpiOnTrack.textContent = String(onTrack);
  if (kpiAlert) kpiAlert.textContent = String(alert);

  const kpiHealthHero = document.getElementById('kpiHealthHero');
  const kpiHealthStatus = document.getElementById('kpiHealthStatus');
  const kpiHealthContext = document.getElementById('kpiHealthContext');
  const kpiLatestHero = document.getElementById('kpiLatestHero');
  const kpiLatestHeroSub = document.getElementById('kpiLatestHeroSub');
  const healthMeterFill = document.getElementById('healthMeterFill');
  if (kpiHealthHero) kpiHealthHero.textContent = fmtPct(avgScore);
  if (kpiHealthStatus) kpiHealthStatus.textContent = 'Lectura institucional del avance';
  if (kpiHealthContext) kpiHealthContext.textContent = 'Promedio institucional al presente mes';
  if (kpiLatestHero) kpiLatestHero.textContent = visitLabel;
  if (kpiLatestHeroSub) kpiLatestHeroSub.textContent = '';
  if (healthMeterFill) healthMeterFill.style.width = `${Math.max(0, Math.min(avgScore, 100))}%`;

}


const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const APP_ROOT = new URL('../../', import.meta.url);
let descriptions = [];
let officialMonths = {};
let selectedMonth = 10;
const finite = value => typeof value === 'number' && Number.isFinite(value);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function makeProgram(descriptor, month) {
  const corte = (officialMonths[String(month)] || []).find(row => row.id === descriptor.id);
  const dashboard = new URL(`public/${descriptor.dashboard}`, APP_ROOT).href;
  if (!corte) return {
    id: descriptor.id, name: descriptor.name, dashboard,
    latestLabel: 'Sin datos', periodKey: '', score: null,
    hasMonthlyColumn: descriptor.hasMonthlyColumn,
    scoreHeader: descriptor.scoreHeader, metrics: []
  };
  const result = construirProgramaInstitucional(descriptor, corte, dashboard);
  result.metrics.forEach(m => { m.label = escapeHtml(m.label); });
  return result;
}
function renderNoData(program){
  const card = programCard({...program, score:0});
  return card.replace('<div class="prog-score-wrap">','<div class="prog-score-wrap" data-unavailable="true">').replace(/<span class="prog-score-value">.*?<\/span>/,'<span class="prog-score-value">—</span>').replace(/<div class="metric-list">[\s\S]*?<div class="program-footer">/,`<div class="metric-list"><div class="empty">Sin datos publicados para ${MONTH_NAMES[selectedMonth-1].toLowerCase()} de 2026.</div></div><div class="program-footer">`);
}
function paintMonthButtons(){
  const root=document.getElementById('programMonthButtons');
  if(!root) return;
  if(root.children.length !== MONTH_NAMES.length){
    root.innerHTML=MONTH_NAMES.map((name,index)=>`<button type="button" class="program-month-btn" data-month="${index + 1}" aria-pressed="false">${name.slice(0,3)}</button>`).join('');
    root.addEventListener('click',event=>{
      const button=event.target.closest('button[data-month]');
      if(button && root.contains(button)) renderProgramMonth(Number(button.dataset.month));
    });
  }
  root.querySelectorAll('button').forEach(button=>{
    const active=Number(button.dataset.month)===selectedMonth;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
}
/* Animación numérica solo cuando cambia el mes, sin modificar datos ni unidades. */
let previousRenderedMonth = null;
let numberAnimationRevision = 0;
function animateMonthCardValues(root) {
  if (!root || !window.requestAnimationFrame ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const values = [];
  const numberPattern = /-?\d[\d,]*(?:\.\d+)?/g;
  root.querySelectorAll('.prog-score-value, .metric-primary, .metric-monthly-value, .metric-subcopy strong').forEach(element => {
    for (const node of element.childNodes) {
      if (node.nodeType !== 3) continue;
      const original = node.textContent;
      const tokens = [...original.matchAll(numberPattern)].map(match => {
        const source = match[0];
        const value = Number(source.replaceAll(',', ''));
        const decimals = source.includes('.') ? source.length - source.lastIndexOf('.') - 1 : 0;
        return { value, decimals, grouped: source.includes(',') };
      });
      if (tokens.some(item => Number.isFinite(item.value))) values.push({ node, original, tokens });
    }
  });
  if (!values.length) return;

  const revision = ++numberAnimationRevision;
  const duration = 850;
  let startTime = null;
  function tick(now) {
    if (revision !== numberAnimationRevision) return;
    if (startTime === null) startTime = now;
    const elapsed = Math.min(1, (now - startTime) / duration);
    const progress = 1 - Math.pow(1 - elapsed, 3);
    for (const {node, original, tokens} of values) {
      if (!node.isConnected) continue;
      let pos = 0;
      node.textContent = elapsed === 1 ? original : original.replace(numberPattern, () => {
        const {value, decimals, grouped} = tokens[pos++];
        if (!Number.isFinite(value)) return '—';
        const current = value * progress;
        return grouped
          ? current.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})
          : current.toFixed(decimals);
      });
    }
    if (elapsed < 1) window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
}

function renderProgramMonth(month){
  const animateValues = previousRenderedMonth !== null && previousRenderedMonth !== month;
  previousRenderedMonth = month;
  ++numberAnimationRevision; // Cancela una animación anterior al elegir otro mes.
  const currentItems=programCarouselItems();
  const activeProgramId=currentItems[programCarouselIndex]?.dataset.programId ||
    (window.location.hash === '#programas' ? (returnProgramId || rememberedProgramId()) : null);
  selectedMonth=month;
  paintMonthButtons();
  const label=document.getElementById('programMonthLabel');
  if(label) label.textContent=`Tarjetas institucionales a ${MONTH_NAMES[month-1].toLowerCase()} de 2026.`;
  const data=descriptions.map(d=>makeProgram(d,month));
  const grid=document.getElementById('programGrid');
  if(grid){
    grid.innerHTML=data.map(p=>!p.periodKey?renderNoData(p):programCard(p)).join('');
    initProgramCarousel(activeProgramId);
    if (animateValues) animateMonthCardValues(grid);
  }
  const valid=data.filter(p=>finite(p.score));
  if(valid.length===descriptions.length) {
    renderSummary(valid);
  } else {
    const latestText=valid.length ? MONTH_NAMES[month-1] : 'Sin datos';
    for(const id of ['kpiLatest','kpiLatestHero']) {
      const node=document.getElementById(id);
      if(node) node.textContent=latestText;
    }
    for(const id of ['kpiHealth','kpiHealthHero','kpiOnTrack','kpiAlert']) {
      const node=document.getElementById(id);
      if(node) node.textContent='—';
    }
    for(const id of ['kpiHealthSub','kpiHealthStatus','kpiHealthContext']) {
      const node=document.getElementById(id);
      if(node) node.textContent=valid.length ? `Actualización parcial: ${valid.length} de ${descriptions.length} programas` : 'Sin datos publicados';
    }
    const meter=document.getElementById('healthMeterFill');
    if(meter) meter.style.width='0%';
  }
}
// Delegación: no se pierde al reconstruir las tarjetas por cambio de mes.
document.getElementById('programCarouselViewport')?.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  const card = link?.closest('.program-card');
  if (card) rememberProgramId(card.dataset.programId);
});

// En recarga directa o tras pulsar Atrás, recuperar la pestaña y tarjeta visitadas.
if (window.location.hash === '#programas') showIndexPage('programas', { updateUrl: false });
window.addEventListener('pageshow', () => {
  if (window.location.hash !== '#programas') return;
  showIndexPage('programas', { updateUrl: false });
  const id = rememberedProgramId() || returnProgramId;
  window.requestAnimationFrame(() => {
    const index = programCarouselItems().findIndex(item => item.dataset.programId === id);
    if (index >= 0) goToProgramCarousel(index, 'auto');
  });
});

async function init(){
  const monthLabel = document.getElementById('programMonthLabel');
  if (monthLabel) monthLabel.textContent = 'Tarjetas institucionales a octubre de 2026.';
  try{
    const [catalogResponse, cutsResponse] = await Promise.all([
      fetch(new URL('../../config/index/indicadores_institucionales_2026.json', import.meta.url)),
      fetch(new URL('../../data/index/2026/cortes_publicados.json', import.meta.url))
    ]);
    if (!catalogResponse.ok || !cutsResponse.ok) throw Error('No se pudo cargar la información institucional.');
    descriptions = await catalogResponse.json();
    officialMonths = await cutsResponse.json();
    renderProgramMonth(10);
    await initCoverageMap();
  } catch(error){
    console.error(error);
    const grid=document.getElementById('programGrid');
    if(grid) grid.innerHTML=`<div class="empty">No se pudieron cargar las tablas institucionales: ${escapeHtml(error.message)}</div>`;
  }
}
init();
