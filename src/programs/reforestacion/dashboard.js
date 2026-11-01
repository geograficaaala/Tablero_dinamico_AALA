
const DATA_URLS = {
  total: '../data/reforestacion/2026/total_mes_2026.csv',
  indicators: '../data/reforestacion/2026/indicadores_institucionales_2026.csv',
  metadata: '../data/reforestacion/2026/metadata_publicacion.csv'
};


let COMPLEMENTARY_KPI_ROWS = [];
function getComplementaryRowsForPeriod(period){
 const hidden = new Set(['vivero_bolsas_llenadas','vivero_semillas_germinadas']);
 return COMPLEMENTARY_KPI_ROWS.filter(r=>String(r.periodo_clave)===String(period)&&!hidden.has(String(r.kpi_id||'')));
}

const KPI_CONFIG = [
  {
    id: 'ha',
    title: 'Hectáreas monitoreadas',
    valueField: 'ha_monitoreadas_kpi_acum',
    metaField: 'meta_ha',
    pctField: 'pct_meta_ha',
    semaforoField: 'semaforo_ha',
    monthlyField: 'ha_monitoreadas_kpi_mes',
    unit: 'ha',
    temporality: 'Temporalidad: enero a noviembre de 2026',
    note: row => `Desde el programa verificamos áreas reforestadas y las respaldamos con cartografía. Respaldo cartográfico acumulado: ${formatPercent(row.pct_cartografia_acum)}.`
  },
  {
    id: 'arboles',
    title: 'Árboles reforestados',
    valueField: 'arboles_sembrados_acum',
    metaField: 'meta_arboles',
    pctField: 'pct_meta_arboles',
    semaforoField: 'semaforo_arboles',
    monthlyField: 'arboles_sembrados_kpi_mes',
    unit: 'árboles',
    temporality: 'Temporalidad: seguimiento operativo 2026',
    note: row => 'Seguimiento de árboles reforestados registrados en campo.'
  },
  {
    id: 'sig',
    title: 'Sistema forestal digital',
    valueField: 'aporte_sig_acum',
    metaField: 'meta_unidad_sig',
    pctField: 'pct_meta_sig',
    semaforoField: 'semaforo_sig',
    monthlyField: 'aporte_sig_mes',
    unit: 'unidad',
    temporality: 'Temporalidad: enero a diciembre de 2026',
    note: row => `Medimos la consolidación por hitos: mapas, plataformas digitales, información geográfica, análisis territoriales y proyectos tecnológicos. Hitos del mes: ${formatNumber(row.hitos_sig_logrados_mes,0)}.`
  },
  {
    id: 'plantas',
    title: 'Plantas nativas en vivero',
    valueField: 'plantas_netas_acum',
    metaField: 'meta_plantas',
    pctField: 'pct_meta_plantas',
    semaforoField: 'semaforo_plantas',
    monthlyField: 'plantas_netas_mes',
    unit: 'plantas',
    temporality: 'Temporalidad: enero a noviembre de 2026',
    note: row => `Damos seguimiento a plantas disponibles para restauración. Especies nativas activas: ${formatNumber(row.especies_acumuladas_proxy,0)} de ${formatNumber(row.meta_especies,0)}.`
  }
];

const state = { totalRows: [], indicatorRows: [], metadata: null, periods: [], selectedPeriod: null };

function switchView(mode){
  document.body.classList.remove('view-full','view-exec');
  document.body.classList.add(mode === 'exec' ? 'view-exec' : 'view-full');
  document.getElementById('btnFull').classList.toggle('active', mode !== 'exec');
  document.getElementById('btnExec').classList.toggle('active', mode === 'exec');
}

function safeNumber(v){
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(String(v).replace(/,/g,''));
  return Number.isFinite(n) ? n : 0;
}
function escapeHtml(str){
  return String(str ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function formatNumber(v, d=0){
  const n = safeNumber(v);
  return n.toLocaleString('es-GT',{minimumFractionDigits:d, maximumFractionDigits:d});
}
function unitLabel(unit, value){
  const n = Math.abs(safeNumber(value));
  const singular = {árboles:'árbol', plantas:'planta', mapas:'mapa', servicios:'servicio', capas:'capa', actividades:'actividad', bolsas:'bolsa', semillas:'semilla', proyectos:'proyecto'};
  return n === 1 && singular[unit] ? singular[unit] : unit;
}
function formatByUnit(v, unit, decimals){
  let d = decimals;
  if (d === undefined) {
    if (unit === 'ha' || unit === 'unidad') d = 2;
    else d = 0;
  }
  return `${formatNumber(v,d)}${unit ? ' ' + unitLabel(unit, v) : ''}`;
}
function formatPercent(value){
  const n = safeNumber(value) * 100;
  return `${n.toLocaleString('es-GT',{minimumFractionDigits:n < 10 ? 1 : 0, maximumFractionDigits:n < 10 ? 1 : 0})}%`;
}
function sourceLabel(value){
  const raw = String(value || '').trim();
  if (!raw) return 'Registros mensuales del programa';
  return raw.replace(/_/g, ' ').replace(/\bKPI\b/gi, 'indicadores');
}
function arbolesProgrammed(row){
  return safeNumber(row.arboles_sembrados_acum) <= 0 && safeNumber(row.mes_num) < 5;
}
function indicatorValue(cfg, row){
  if (cfg.id === 'arboles' && arbolesProgrammed(row)) return 'Programado según calendario operativo';
  if (cfg.id === 'sig') return `${formatPercent(row[cfg.pctField])} consolidado`;
  return formatByUnit(row[cfg.valueField], cfg.unit);
}
function indicatorMeta(cfg, row){
  if (cfg.id === 'arboles') return formatByUnit(row[cfg.metaField] || 90000, cfg.unit);
  if (cfg.id === 'sig') return '1 sistema consolidado';
  return formatByUnit(row[cfg.metaField], cfg.unit);
}
function indicatorMonthly(cfg, row){
  if (cfg.id === 'arboles' && arbolesProgrammed(row)) return 'Indicador programado según calendario operativo';
  if (cfg.id === 'sig') return `${formatPercent(row[cfg.monthlyField])} registrado en el mes`;
  return formatByUnit(row[cfg.monthlyField], cfg.unit);
}
function detailList(items){
  if (!Array.isArray(items) || !items.length) return '';
  return `<ol class="kpi-detail-list">${items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ol>`;
}
function complementaryMetaLabel(item){
  if (item.meta_anual) return `Meta anual: <strong>${escapeHtml(formatByUnit(item.meta_anual, item.unidad))}</strong>`;
  return `Meta mensual: <strong>${escapeHtml(formatByUnit(item.meta_mensual, item.unidad))}</strong>`;
}
function monthShort(label){
  const map = {Enero:'Ene',Febrero:'Feb',Marzo:'Mar',Abril:'Abr',Mayo:'May',Junio:'Jun',Julio:'Jul',Agosto:'Ago',Septiembre:'Sep',Octubre:'Oct',Noviembre:'Nov',Diciembre:'Dic'};
  return map[label] || label;
}
function semaforoClass(value){
  const v = String(value || '').toLowerCase();
  if (['verde','green'].includes(v)) return 'green';
  if (['amarillo','yellow'].includes(v)) return 'yellow';
  if (['rojo','red'].includes(v)) return 'red';
  if (['azul','blue'].includes(v)) return 'blue';
  return 'muted';
}
function statusBadge(text, status){
  return `<div class="status-badge status-${semaforoClass(status)}">${escapeHtml(text || 'Sin lectura')}</div>`;
}
function clampPct(v){ return Math.max(0, Math.min(100, safeNumber(v) * 100)); }

function parseCSV(text){
  const rows = [];
  let row = [], value = '', inQuotes = false;
  for (let i=0; i<text.length; i++) {
    const ch = text[i], next = text[i+1];
    if (ch === '"') {
      if (inQuotes && next === '"') { value += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      row.push(value); value='';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++;
      row.push(value); value='';
      if (row.some(cell => cell !== '')) rows.push(row);
      row = [];
    } else {
      value += ch;
    }
  }
  if (value.length || row.length) { row.push(value); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows.shift().map(h => h.trim());
  return rows.map(r => Object.fromEntries(headers.map((h,idx) => [h, (r[idx] ?? '').trim()])));
}

async function loadCsv(url){
 const response=await fetch(url,{cache:'no-store'});
 if(!response.ok) throw new Error(`No se pudo cargar ${url}: ${response.status}`);
 return parseCSV(await response.text());
}

function getSelectedRow(){
  return state.totalRows.find(r => r.periodo_clave === state.selectedPeriod) || state.totalRows[state.totalRows.length - 1];
}
function getRowsUpToSelected(){
  const idx = state.totalRows.findIndex(r => r.periodo_clave === state.selectedPeriod);
  return idx >= 0 ? state.totalRows.slice(0, idx + 1) : state.totalRows;
}

const ACTIVE_YEAR = 2026;
const ACTIVE_MONTH_MAX = 12;
let presentationIndex = 0;


function setHtml(id, html){ const el=document.getElementById(id); if(el) el.innerHTML=html; }
function setText(id, txt){ const el=document.getElementById(id); if(el) el.textContent=txt; }

function buildMonthControls(){
  const select = document.getElementById('periodSelect');
  const pills = document.getElementById('monthPills');
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const rowMap = new Map(state.totalRows.map(r => [safeNumber(r.mes_num), r]));

  if (select) select.innerHTML = '';
  if (pills) pills.innerHTML = '';

  monthNames.forEach((label, idx) => {
    const monthNum = idx + 1;
    const row = rowMap.get(monthNum);
    const period = row?.periodo_clave || `${ACTIVE_YEAR}-${String(monthNum).padStart(2,'0')}`;
    const disabled = monthNum > ACTIVE_MONTH_MAX || !row;

    if (row && select) {
      const opt = document.createElement('option');
      opt.value = period;
      opt.textContent = `${label} ${ACTIVE_YEAR}`;
      opt.disabled = disabled;
      if (period === state.selectedPeriod) opt.selected = true;
      select.appendChild(opt);
    }

    if (pills) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'month-pill' + (period === state.selectedPeriod ? ' active' : '');
      btn.title = `${label} ${ACTIVE_YEAR}`;
      btn.setAttribute('aria-label', `${label} ${ACTIVE_YEAR}`);
      btn.setAttribute('aria-pressed', String(period === state.selectedPeriod));
      btn.textContent = monthShort(label);
      btn.disabled = disabled;
      if (!disabled) btn.addEventListener('click', () => setPeriod(period));
      pills.appendChild(btn);
    }
  });

  if (select) {
    select.value = state.selectedPeriod;
    select.onchange = e => setPeriod(e.target.value);
  }
  if (pills) {
    requestAnimationFrame(() => {
      const active = pills.querySelector('.month-pill.active');
      if (!active) return;
      const left = active.offsetLeft - pills.offsetLeft;
      const right = left + active.offsetWidth;
      if (left < pills.scrollLeft) pills.scrollLeft = Math.max(0, left - 4);
      else if (right > pills.scrollLeft + pills.clientWidth) pills.scrollLeft = Math.max(0, right - pills.clientWidth + 4);
    });
  }
}

function setPeriod(period){
  if (!state.totalRows.some(r => r.periodo_clave === period)) return;
  state.selectedPeriod = period;
  buildMonthControls();
  render();
}

function renderHero(row){


}

function overallStatus(row){
  const statuses = [row.semaforo_ha, row.semaforo_arboles, row.semaforo_sig, row.semaforo_plantas].map(v => String(v || '').toLowerCase());
  if (statuses.includes('rojo')) return {status:'red', label:'Atención prioritaria'};
  if (statuses.includes('amarillo')) return {status:'yellow', label:'Seguimiento cercano'};
  if (statuses.filter(v => v === 'azul').length >= 2 || statuses.includes('azul')) return {status:'blue', label:'Avance favorable'};
  if (statuses.includes('verde')) return {status:'green', label:'Meta consolidada'};
  return {status:'muted', label:'Sin exigibilidad'};
}

function animateProgressBars(scope=document){
  if (!scope) return;
  scope.querySelectorAll('.progress > span, .exec-kpi-bar span, .pkpi-bar').forEach(bar => {
    const target = bar.getAttribute('data-width') || bar.style.width || '0%';
    bar.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = target; }));
  });
}

function annualKpiMessage(cfg, row){
  return '';
}

function renderKpis(row){
  const grid = document.getElementById('kpiGrid');
  if (!grid) return;
  grid.innerHTML = KPI_CONFIG.map((cfg, idx) => {
    const isProgrammed = cfg.id === 'arboles' && arbolesProgrammed(row);
    const pctRaw = isProgrammed ? 0 : safeNumber(row[cfg.pctField]);
    const pct = Math.max(0, Math.min(100, pctRaw * 100));
    const value = isProgrammed ? 'Programado de junio a noviembre' : indicatorValue(cfg, row);
    const meta = indicatorMeta(cfg, row);
    const cumplimiento = isProgrammed ? 'Programado de junio a noviembre' : formatPercent(row[cfg.pctField]);
    return `
      <article class="card kpi clean-kpi" style="--delay:${idx * 60}ms">
        <div class="kpi-top">
          <div>
            <div class="kpi-label">${escapeHtml(cfg.title)}</div>
            <div class="kpi-value">${escapeHtml(value)}</div>
          </div>
        </div>
        <div class="kpi-readings">
          <div class="kpi-meta"><span>Resultado acumulado</span><strong>${escapeHtml(value)}</strong></div>
          <div class="kpi-meta"><span>Meta anual</span><strong>${escapeHtml(meta)}</strong></div>
          <div class="kpi-meta"><span>Cumplimiento acumulado de meta anual</span><strong>${escapeHtml(cumplimiento)}</strong></div>
        </div>
        <div class="progress"><span data-width="${pct}%" style="width:${pct}%"></span></div>
      </article>`;
  }).join('');
  animateProgressBars(grid);
}

function monthlyDetailItems(item){
 return Array.isArray(item.detalle_render) ? item.detalle_render : [];
}

function monthlyKpiMessage(item){
  const items = monthlyDetailItems(item);
  if (!items.length) return '';
  return `<div class="kpi-monthly-includes"><strong>Incluye:</strong>${detailList(items)}</div>`;
}

function renderComplementaryKpis(){
  const period = state.selectedPeriod;
  const rows = getComplementaryRowsForPeriod(period);
  const grid = document.getElementById('kpiComplementGrid');
  if (!grid) return;
  if (!rows.length){
    grid.innerHTML = `<article class="card panel"><p class="kpi-grid-note">No hay metas mensuales cargadas para el período seleccionado.</p></article>`;
    return;
  }
  grid.innerHTML = rows.map((item, idx) => {
    const monthlyPct = Math.max(0, Math.min(100, safeNumber(item.pct_cumpl_mes) * 100));
    const metaText = safeNumber(item.meta_mensual) > 0
      ? formatByUnit(item.meta_mensual, item.unidad)
      : (item.meta_anual ? formatByUnit(item.meta_anual, item.unidad) : 'Sin meta mensual');
    const valueText = formatByUnit(item.valor_mes, item.unidad);
    return `
      <article class="card kpi clean-kpi kpi-monthly-card" style="--delay:${idx * 45}ms">
        <div class="kpi-monthly-title">${escapeHtml(item.kpi_nombre)}</div>
        <div class="kpi-top">
          <div>
            <div class="kpi-value">${escapeHtml(valueText)}</div>
          </div>
        </div>
        <div class="kpi-readings">
          <div class="kpi-meta"><span>Resultado del mes</span><strong>${escapeHtml(valueText)}</strong></div>
          <div class="kpi-meta"><span>Meta mensual</span><strong>${escapeHtml(metaText)}</strong></div>
          <div class="kpi-meta"><span>Cumplimiento de meta mensual</span><strong>${escapeHtml(formatPercent(item.pct_cumpl_mes))}</strong></div>
        </div>
        ${monthlyKpiMessage(item)}
        <div class="progress"><span data-width="${monthlyPct}%" style="width:${monthlyPct}%"></span></div>
      </article>`;
  }).join('');
  animateProgressBars(grid);
}

function renderExecutive(row){
  const status = overallStatus(row);
  setText('execStatusBadge', status.label);
  setText('execPeriodInfo', `${row.mes_label} ${row.anio} · último período al presente mes ${row.mes_label} ${row.anio}`);
  setText('execPeriodPill', `${row.mes_label} ${row.anio}`);
  const execGrid = document.getElementById('execKpiGrid');
  if (!execGrid) return;
  execGrid.innerHTML = KPI_CONFIG.map(cfg => {
    const isProgrammed = cfg.id === 'arboles' && arbolesProgrammed(row);
    const pct = isProgrammed ? 0 : clampPct(row[cfg.pctField]);
    const pctText = isProgrammed ? '0%' : formatPercent(row[cfg.pctField]);
    return `<div class="exec-kpi"><div class="exec-kpi-label">${escapeHtml(cfg.title)}</div><div class="exec-kpi-value">${escapeHtml(pctText)}</div><div>${escapeHtml(indicatorValue(cfg, row))}</div><div class="exec-kpi-bar"><span data-width="${pct}%" style="width:${pct}%"></span></div></div>`;
  }).join('');
  animateProgressBars(execGrid);

  setHtml('execStrip', `
    <div class="exec-strip-card"><small>Cartografía</small><strong>${escapeHtml(formatPercent(row.pct_cartografia_acum))}</strong></div>
    <div class="exec-strip-card"><small>Especies activas</small><strong>${escapeHtml(formatNumber(row.especies_acumuladas_proxy,0))}</strong></div>
    <div class="exec-strip-card"><small>Área intervenida del mes</small><strong>${escapeHtml(formatByUnit(row.area_intervenida_ha_mes,'ha',2))}</strong></div>
    <div class="exec-strip-card"><small>Estatus del reporte</small><strong>${escapeHtml(row.estatus_reporte || '—')}</strong></div>
  `);
}

function renderAlerts(row){
  const alerts = [];
  if (String(row.semaforo_arboles).toLowerCase() === 'gris') alerts.push({tone:'yellow', text:'La temporada principal de siembra aún no está activa o no reporta avance exigible.'});
  if (String(row.semaforo_plantas).toLowerCase() === 'rojo') alerts.push({tone:'red', text:'El vivero acumula menos avance del esperado para la meta anual de 10,000 plantas.'});
  if (String(row.semaforo_sig).toLowerCase() === 'azul' || safeNumber(row.aporte_sig_acum) >= 1) alerts.push({tone:'blue', text:'El sistema forestal digital de monitoreo forestal presenta una consolidación favorable y ya aporta mapas, análisis y herramientas para el programa.'});
  if (String(row.alertas_texto || '').trim()) alerts.push({tone:'yellow', text: row.alertas_texto});
  if (!alerts.length) alerts.push({tone:'green', text:'No se detectan alertas críticas en el período seleccionado.'});
  const html = alerts.map(a => `<div class="alert ${a.tone}">${escapeHtml(a.text)}</div>`).join('');
  setHtml('alertPanel', html);
  setHtml('execAlertPanel', html);
  document.getElementById('narrativePanel').innerHTML = `
    <div class="alert blue"><strong>Logros:</strong> ${escapeHtml(row.logros_texto || 'Sin narrativa registrada.')}</div>
    <div class="alert green"><strong>Fuentes:</strong> ${escapeHtml(sourceLabel(row.fuente_texto))}</div>
    <div class="alert yellow"><strong>Estatus:</strong> ${escapeHtml(row.estatus_reporte || '—')}</div>
  `;
}

function renderTable(){

}

function renderDiagnostics(row){
  const strongest = KPI_CONFIG.map(cfg => ({id: cfg.id, title: cfg.title, pct: safeNumber(row[cfg.pctField]), unit: cfg.unit, value: row[cfg.valueField]})).sort((a,b) => b.pct - a.pct);
  const lead = strongest[0];
  const lag = strongest[strongest.length-1];
  const html = `
    <h3>Análisis del mes</h3>
    <p>En <strong>${escapeHtml(row.mes_label)} ${escapeHtml(row.anio)}</strong>, el programa registra <strong>${escapeHtml(formatByUnit(row.ha_monitoreadas_kpi_acum,'ha',2))}</strong> monitoreadas, <strong>${escapeHtml(formatByUnit(row.arboles_sembrados_acum,'árboles'))}</strong> árboles sembrados, un avance del sistema forestal digital de <strong>${escapeHtml(formatPercent(row.pct_meta_sig))}</strong> y <strong>${escapeHtml(formatByUnit(row.plantas_netas_acum,'plantas'))}</strong> plantas acumuladas en vivero.</p>
    <p>El componente con mayor avance relativo es <strong>${escapeHtml(lead.title)}</strong>, con <strong>${escapeHtml(formatPercent(lead.pct))}</strong> de cumplimiento de su meta anual y un acumulado de <strong>${escapeHtml(lead.id === 'sig' ? formatPercent(lead.pct) + ' de avance' : formatByUnit(lead.value, lead.unit))}</strong>.</p>
    <p>El componente con mayor rezago relativo es <strong>${escapeHtml(lag.title)}</strong>, con <strong>${escapeHtml(formatPercent(lag.pct))}</strong> de avance. ${escapeHtml(row.alertas_texto || 'Se recomienda revisar el calendario operativo y reforzar la captura de evidencia del período.')}</p>
    <p>La lectura del mes reporta: <strong>${escapeHtml(row.logros_texto || 'Sin logros narrativos cargados')}</strong>. Fuente consolidada del tablero: <strong>${escapeHtml(sourceLabel(row.fuente_texto))}</strong>.</p>`;
  setHtml('diagnosticPanel', html);
  setHtml('execDiagnosticPanel', html);
}

function renderLineChart(){
  const rows = state.totalRows;
  const width = 820, height = 320, pad = {l:56,r:20,t:18,b:46};
  const plotW = width - pad.l - pad.r, plotH = height - pad.t - pad.b;
  const series = [
    {label:'Monitoreo', color:'#2e6a57', values: rows.map(r => clampPct(r.pct_meta_ha))},
    {label:'Siembras', color:'#4f8f66', values: rows.map(r => clampPct(r.pct_meta_arboles))},
    {label:'Sistema forestal digital', color:'#1f7b62', values: rows.map(r => clampPct(r.pct_meta_sig))},
    {label:'Vivero', color:'#8bbc6f', values: rows.map(r => clampPct(r.pct_meta_plantas))}
  ];
  const x = i => pad.l + (rows.length === 1 ? plotW/2 : i * (plotW/(rows.length-1)));
  const y = v => pad.t + plotH - (v/100) * plotH;
  let svg = `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Avance acumulado">`;
  for (let t=0; t<=100; t+=25){
    const yy = y(t);
    svg += `<line x1="${pad.l}" y1="${yy}" x2="${width-pad.r}" y2="${yy}" stroke="#d9e7dd" stroke-width="1" />`;
    svg += `<text x="${pad.l-10}" y="${yy+4}" text-anchor="end" font-size="11" fill="#5e7d69">${t}%</text>`;
  }
  rows.forEach((r,i) => {
    const xx = x(i);
    svg += `<text x="${xx}" y="${height-16}" text-anchor="middle" font-size="11" fill="#5e7d69">${escapeHtml(monthShort(r.mes_label))}</text>`;
  });
  series.forEach(s => {
    const d = s.values.map((v,i) => `${i===0?'M':'L'} ${x(i)} ${y(v)}`).join(' ');
    svg += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>`;
    s.values.forEach((v,i) => svg += `<circle cx="${x(i)}" cy="${y(v)}" r="4.5" fill="${s.color}" stroke="#fff" stroke-width="2"></circle>`);
  });
  const selectedIdx = rows.findIndex(r => r.periodo_clave === state.selectedPeriod);
  if (selectedIdx >= 0) {
    svg += `<line x1="${x(selectedIdx)}" y1="${pad.t}" x2="${x(selectedIdx)}" y2="${height-pad.b}" stroke="#145646" stroke-dasharray="5 5" stroke-width="1.5" opacity=".5"></line>`;
  }
  svg += '</svg>';
  setHtml('lineChart', svg);

  const row = getSelectedRow();
  setHtml('lineInterp', `<strong>${escapeHtml(row.mes_label)} ${escapeHtml(row.anio)}</strong> muestra un avance de ${escapeHtml(formatPercent(row.pct_meta_ha))} en monitoreo, ${escapeHtml(formatPercent(row.pct_meta_arboles))} en siembras, ${escapeHtml(formatPercent(row.pct_meta_sig))} en sistema forestal digital y ${escapeHtml(formatPercent(row.pct_meta_plantas))} en vivero.`);
}

function renderBarChart(){
  const rows = getRowsUpToSelected();
  const width = 820, height = 330, pad = {l:54,r:18,t:20,b:58};
  const plotW = width-pad.l-pad.r, plotH = height-pad.t-pad.b;
  const groups = rows.map(r => ({
    label: monthShort(r.mes_label),
    ha: safeNumber(r.ha_monitoreadas_kpi_mes),
    arboles: safeNumber(r.arboles_sembrados_kpi_mes),
    sig: safeNumber(r.aporte_sig_mes),
    plantas: safeNumber(r.plantas_netas_mes)
  }));
  const maxVal = Math.max(1, ...groups.flatMap(g => [g.ha, g.arboles/1000, g.sig*1000, g.plantas/1000]));
  const xStep = plotW / Math.max(1, groups.length);
  const barW = Math.min(14, xStep/5);
  const y = v => pad.t + plotH - (v/maxVal) * plotH;
  let svg = `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Flujo mensual">`;
  for (let i=0;i<=4;i++){
    const v = maxVal*i/4;
    const yy = y(v);
    svg += `<line x1="${pad.l}" y1="${yy}" x2="${width-pad.r}" y2="${yy}" stroke="#d9e7dd" stroke-width="1"/>`;
  }
  groups.forEach((g,idx) => {
    const baseX = pad.l + idx*xStep + xStep/2 - (barW*2);
    const vals = [g.ha, g.arboles/1000, g.sig*1000, g.plantas/1000];
    const colors = ['#2e6a57','#4f8f66','#1f7b62','#8bbc6f'];
    vals.forEach((val,j) => {
      const h = plotH - (y(val)-pad.t);
      svg += `<rect x="${baseX + j*barW*1.2}" y="${y(val)}" width="${barW}" height="${Math.max(2,h)}" rx="4" fill="${colors[j]}"></rect>`;
    });
    svg += `<text x="${pad.l + idx*xStep + xStep/2}" y="${height-18}" text-anchor="middle" font-size="11" fill="#5e7d69">${g.label}</text>`;
  });
  svg += '</svg>';
  setHtml('barChart', svg);
  setHtml('execBarChart', svg);
  const row = getSelectedRow();
  const interp = `En ${row.mes_label.toLowerCase()} registramos ${formatByUnit(row.ha_monitoreadas_kpi_mes,'ha')} de monitoreo válido para el indicador, ${formatByUnit(row.arboles_sembrados_kpi_mes,'árboles')} reforestados en campo, ${formatPercent(row.aporte_sig_mes)} de avance del sistema forestal digital y ${formatByUnit(row.plantas_netas_mes,'plantas')} en vivero.`;
  setText('barInterp', interp);
  setText('execBarInterp', interp);
}


function buildPresentationAlerts(row){
  const alerts = [];
  if (String(row.alertas_texto || '').trim()) alerts.push({type:'yellow', text: row.alertas_texto});
  if (String(row.semaforo_sig).toLowerCase() === 'azul' || safeNumber(row.aporte_sig_acum) >= 0.6) alerts.push({type:'green', text:'El sistema forestal digital de monitoreo forestal ya presenta consolidación útil para cartografía temática, análisis territorial y soporte al programa.'});
  if (safeNumber(row.arboles_sembrados_acum) === 0) alerts.push({type:'blue', text:'La siembra anual todavía no inicia; el tablero muestra una línea base operativa.'});
  if (safeNumber(row.plantas_netas_acum) < 2500) alerts.push({type:'yellow', text:'El vivero sigue en fase de acumulación temprana; conviene reforzar producción y trazabilidad del componente.'});
  return alerts.length ? alerts : [{type:'green', text:'No se detectan alertas críticas en el período seleccionado.'}];
}

function buildPresentation(){
  const row = getSelectedRow();
  const rows = getRowsUpToSelected();
  const status = overallStatus(row);
  const track = document.getElementById('presentationTrack');
  const meta = document.getElementById('presentationMeta');
  if (!track || !meta) return;

  const heroCards = [
    {label:'Monitoreo acumulado', value:formatByUnit(row.ha_monitoreadas_kpi_acum,'ha',2), sub:`Meta anual: ${formatByUnit(row.meta_ha,'ha',2)}`},
    {label:'Siembra acumulada', value:formatByUnit(row.arboles_sembrados_acum,'árboles'), sub:`Meta anual: ${formatByUnit(row.meta_arboles,'árboles')}`},
    {label:'Sistema forestal digital', value:`${formatPercent(row.pct_meta_sig)} de avance`, sub:'Meta anual: sistema funcional consolidado'},
    {label:'Vivero acumulado', value:formatByUnit(row.plantas_netas_acum,'plantas'), sub:`Meta anual: ${formatByUnit(row.meta_plantas,'plantas')}`}
  ];
  const alerts = buildPresentationAlerts(row);
  const metricCards = KPI_CONFIG.map(cfg => {
    const pct = clampPct(row[cfg.pctField]);
    const cls = semaforoClass(row[cfg.semaforoField]);
    const value = indicatorValue(cfg, row);
    const metaValue = indicatorMeta(cfg, row);
    return `<article class="presentation-kpi-pair-card">
      <div class="pkpi-header">
        <div class="pkpi-label">${escapeHtml(cfg.title)}</div>
        <span class="presentation-chip ${cls}">${escapeHtml(formatPercent(row[cfg.pctField]))} acumulado</span>
      </div>
      <div class="pkpi-value">${escapeHtml(value)}</div>
      <div class="pkpi-meta">Meta anual: ${escapeHtml(metaValue)}</div>
      <div class="pkpi-bar-wrap"><div class="pkpi-bar ${cls}" data-width="${pct}%" style="width:${pct}%"></div></div>
      <div class="pkpi-meta" style="margin-top:6px">Aporte del mes: <strong>${escapeHtml(indicatorMonthly(cfg, row))}</strong></div>
    </article>`;
  }).join('');

  const complementRows = getComplementaryRowsForPeriod(row.periodo_clave || state.selectedPeriod);
  const complementCards = complementRows.map(item => {
    const pct = Math.max(0, Math.min(100, safeNumber(item.pct_cumpl_mes) * 100));
    const cls = semaforoClass(item.semaforo_mes);
    const includeItems = monthlyDetailItems(item);
    const includeHtml = includeItems.length ? `<div class="pkpi-meta" style="margin-top:6px"><strong>Incluye:</strong> ${escapeHtml(includeItems.slice(0, Math.round(safeNumber(item.valor_mes))).join(' · '))}</div>` : '';
    return `<article class="presentation-kpi-pair-card">
      <div class="pkpi-header">
        <div class="pkpi-label">${escapeHtml(item.kpi_nombre)}</div>
        <span class="presentation-chip ${cls}">${escapeHtml(formatPercent(item.pct_cumpl_mes))} mensual</span>
      </div>
      <div class="pkpi-value">${escapeHtml(formatByUnit(item.valor_mes, item.unidad))}</div>
      <div class="pkpi-meta">${item.meta_anual ? 'Meta anual: ' + escapeHtml(formatByUnit(item.meta_anual, item.unidad)) : 'Meta mensual: ' + escapeHtml(formatByUnit(item.meta_mensual, item.unidad))}</div>
      <div class="pkpi-bar-wrap"><div class="pkpi-bar ${cls}" data-width="${pct}%" style="width:${pct}%"></div></div>
      <div class="pkpi-meta" style="margin-top:6px">Acumulado al presente mes: <strong>${escapeHtml(formatByUnit(item.valor_acumulado, item.unidad))}</strong> / ${escapeHtml(formatByUnit(item.meta_acumulada, item.unidad))}</div>
      ${includeHtml}
    </article>`;
  }).join('');

  const timelineCards = rows.map(r => `<article class="presentation-card">
    <small>${escapeHtml(r.mes_label)} ${escapeHtml(r.anio)}</small>
    <strong>${escapeHtml(formatByUnit(r.ha_monitoreadas_kpi_acum,'ha',2))}</strong>
    <p>Vivero acumulado: ${escapeHtml(formatByUnit(r.plantas_netas_acum,'plantas'))}</p>
    <span class="presentation-chip ${semaforoClass(r.semaforo_sig)}">Sistema forestal digital ${escapeHtml(formatPercent(r.pct_meta_sig))}</span>
  </article>`).join('');

  meta.innerHTML = `
    <span>Modo presentación</span>
    <span>${escapeHtml(row.mes_label)} ${escapeHtml(row.anio)}</span>
    <span>Reforestando Atitlán</span>
    <span>${escapeHtml(status.label)}</span>`;

  track.innerHTML = `
    <section class="presentation-slide">
      <div class="presentation-slide-inner">
        <div class="presentation-kicker">Narrativa visual del dashboard</div>
        <div class="presentation-title-row">
          <div>
            <h2>Resumen ejecutivo de Reforestando Atitlán</h2>
            <p>Vista rápida del período enero-junio para exponer avances del programa. Mantiene el mismo lenguaje visual del modo presentación de Atitlán Recicla, con una lectura clara del avance real del programa de restauración forestal.</p>
          </div>
          <div class="presentation-brand-badge">
            <img src="./reforestando_logo.png" alt="Logo de Reforestando Atitlán">
            <small>Restauración forestal · monitoreo · vivero · monitoreo digital · cuenca del Lago de Atitlán</small>
          </div>
        </div>
        <div class="presentation-summary-grid">
          ${heroCards.map(card=>`<article class="presentation-card"><small>${escapeHtml(card.label)}</small><strong>${escapeHtml(card.value)}</strong><p>${escapeHtml(card.sub)}</p></article>`).join('')}
        </div>
        <div class="presentation-highlight-strip">
          <span>📍 Área de acción: <strong>Sololá y cuenca del Lago de Atitlán</strong></span>
          <span>🗓️ Período disponible al presente mes: <strong>${escapeHtml(row.mes_label)} ${escapeHtml(row.anio)}</strong></span>
          <span>🧭 Estado del programa: <strong>${escapeHtml(status.label)}</strong></span>
          <span>🌱 Especies activas: <strong>${escapeHtml(formatNumber(row.especies_acumuladas_proxy,0))} / ${escapeHtml(formatNumber(row.meta_especies,0))}</strong></span>
        </div>
      </div>
    </section>

    <section class="presentation-slide">
      <div class="presentation-slide-inner">
        <div class="presentation-kicker">Indicadores priorizados</div>
        <div class="presentation-title-row">
          <div>
            <h2>Lectura acumulada del programa</h2>
            <p>Cada indicador se observa como avance acumulado del año frente a su meta anual y al presente mes vigente del programa.</p>
          </div>
        </div>
        <div class="presentation-kpi-pairs">
          ${metricCards}
        </div>
      </div>
    </section>

    <section class="presentation-slide">
      <div class="presentation-slide-inner">
        <div class="presentation-kicker">Metas mensuales</div>
        <div class="presentation-title-row">
          <div>
            <h2>Metas mensuales del programa</h2>
            <p>Esta capa mensual complementa la lectura anual del programa y ayuda a explicar mejor el avance operativo del período enero-junio sin cambiar la lectura de los indicadores principales.</p>
          </div>
        </div>
        <div class="presentation-kpi-pairs">
          ${complementCards}
        </div>
      </div>
    </section>

    <section class="presentation-slide">
      <div class="presentation-slide-inner">
        <div class="presentation-kicker">Trayectoria enero · junio</div>
        <div class="presentation-title-row">
          <div>
            <h2>Ruta temprana del programa</h2>
            <p>El período enero-junio muestra la ruta operativa del programa: monitoreo activo, sistema forestal digital consolidado, vivero en acumulación y primeras acciones de reforestación registradas.</p>
          </div>
        </div>
        <div class="presentation-metric-grid" style="grid-template-columns:repeat(3,1fr)">
          ${timelineCards}
        </div>
        <div class="presentation-note" style="margin-top:18px">
          <h3>Interpretación</h3>
          <p>Al presente mes de junio, el tablero consolida monitoreo, cartografía, sistema forestal digital, vivero y primeras acciones de reforestación registradas en campo.</p>
        </div>
      </div>
    </section>

    <section class="presentation-slide">
      <div class="presentation-slide-inner">
        <div class="presentation-kicker">Alertas y cierre</div>
        <div class="presentation-title-row">
          <div>
            <h2>Lecturas para cerrar la presentación</h2>
            <p>Mensajes de seguimiento para orientar decisiones y coordinación operativa del trimestre.</p>
          </div>
        </div>
        <div class="presentation-alerts" style="flex:1">
          <div class="presentation-alert-stack">
            ${alerts.map(alert=>`<div class="presentation-alert-box ${alert.type}">${escapeHtml(alert.text)}</div>`).join('')}
          </div>
          <div class="presentation-note">
            <h3>Mensaje de cierre</h3>
            <p>En <strong>${escapeHtml(row.mes_label)} ${escapeHtml(row.anio)}</strong>, Reforestando Atitlán registra <strong>${escapeHtml(formatByUnit(row.ha_monitoreadas_kpi_acum,'ha',2))}</strong> monitoreadas, un avance del sistema forestal digital de <strong>${escapeHtml(formatPercent(row.pct_meta_sig))}</strong> y <strong>${escapeHtml(formatByUnit(row.plantas_netas_acum,'plantas'))}</strong> plantas acumuladas.</p>
            <p>La cartografía acumulada reporta <strong>${escapeHtml(formatPercent(row.pct_cartografia_acum))}</strong> y el vivero muestra <strong>${escapeHtml(formatNumber(row.especies_acumuladas_proxy,0))}</strong> especies activas como base para la temporada alta.</p>
            <p style="margin-top:auto;padding-top:12px;border-top:1px dashed var(--line-soft);font-size:.83rem;color:var(--muted)">Reforestando Atitlán · tablero ejecutivo de restauración forestal · ${escapeHtml(row.mes_label)} ${escapeHtml(row.anio)}</p>
          </div>
        </div>
      </div>
    </section>`;
  buildPresentationDots();
  gotoPresentationSlide(Math.min(presentationIndex, track.children.length - 1));
}

function buildPresentationDots(){
  const track = document.getElementById('presentationTrack');
  const dots = document.getElementById('presentationDots');
  if (!track || !dots) return;
  dots.innerHTML = '';
  Array.from(track.children).forEach((_, idx) => {
    const btn = document.createElement('button');
    btn.className = 'presentation-dot' + (idx === presentationIndex ? ' active' : '');
    btn.type = 'button';
    btn.setAttribute('aria-label', `Ir a la diapositiva ${idx + 1}`);
    btn.addEventListener('click', () => gotoPresentationSlide(idx));
    dots.appendChild(btn);
  });
}

function gotoPresentationSlide(index){
  const track = document.getElementById('presentationTrack');
  const dots = document.querySelectorAll('.presentation-dot');
  if (!track) return;
  const total = track.children.length;
  if (!total) return;
  presentationIndex = Math.max(0, Math.min(index, total - 1));
  track.style.transform = `translateX(-${presentationIndex * 100}%)`;
  dots.forEach((dot, idx) => dot.classList.toggle('active', idx === presentationIndex));
  const activeSlide = track.children[presentationIndex];
  if (activeSlide) setTimeout(() => animateProgressBars(activeSlide), 40);
}

function openPresentation(){
  if (!state.totalRows.length) return;
  buildPresentation();
  const overlay = document.getElementById('presentationOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden','false');
  document.body.classList.add('presentation-open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const activeSlide = document.querySelector('#presentationTrack .presentation-slide');
    if (activeSlide) animateProgressBars(activeSlide);
  }, 60);
}

function closePresentation(){
  const overlay = document.getElementById('presentationOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden','true');
  document.body.classList.remove('presentation-open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  const overlay = document.getElementById('presentationOverlay');
  if (!overlay || !overlay.classList.contains('open')) return;
  if (e.key === 'Escape') closePresentation();
  if (e.key === 'ArrowRight') gotoPresentationSlide(presentationIndex + 1);
  if (e.key === 'ArrowLeft') gotoPresentationSlide(presentationIndex - 1);
});


let survivalRows = [];
function renderSeptemberSurvival(row){
 const selected=survivalRows.find(r=>r.periodo_clave===row.periodo_clave);
 const box=document.querySelector('#supervivenciaPromedio .survival-value');
 if(!selected||!box)return;
 const pct=Number(selected.porcentaje_mostrado);
 setText('heroSurvival', `${formatNumber(pct, Number.isInteger(pct)?0:1)}%`);
 box.setAttribute('aria-label',`Supervivencia monitoreada ${row.mes_label} 2026: ${pct}%`);
 box.innerHTML=`<strong>${pct}%</strong><span>${escapeHtml(selected.leyenda)}</span><div class="survival-bar"><i style="width:${pct}%"></i></div><small>${escapeHtml(selected.nota)}</small>`;
}

let provenanceRows = [];
function renderSourceNotice(row){
 const el=document.getElementById('sourceBanner');
 const source=provenanceRows.find(p=>p.periodo_clave===row.periodo_clave);
 if(!el)return;
 el.textContent=source?.aprobado_para_publicacion==='true'?'':`Datos de ${row.mes_label} pendientes de aprobación para publicación`;
}
function resumenCorreoReforestando(){
 const r=getSelectedRow();
 return `Reforestando Atitlán — ${r.mes_label} 2026\nHectáreas monitoreadas: ${r.ha_monitoreadas_kpi_acum} / ${r.meta_ha} ha\nÁrboles reforestados: ${r.arboles_sembrados_acum} / ${r.meta_arboles}\nSistema forestal digital: ${formatPercent(r.pct_meta_sig)}\nPlantas nativas: ${r.plantas_netas_acum} / ${r.meta_plantas}\nFuente: ${r.fuente_texto||''}`;
}
window.setReforestaPeriod = period => setPeriod(period);
window.reforestaResumenCorreo = () => resumenCorreoReforestando();

function render(){
  const row = getSelectedRow();
  setText('execGoalsPill', `${formatNumber(row.meta_ha)} ha · ${formatNumber(row.meta_arboles)} árboles · sistema forestal digital · ${formatNumber(row.meta_plantas)} plantas`);
  renderSourceNotice(row);
  renderSeptemberSurvival(row);
  renderHero(row);
  renderKpis(row);
  renderComplementaryKpis();
  renderExecutive(row);
  renderAlerts(row);
  renderTable();
  renderDiagnostics(row);
  renderLineChart();
  renderBarChart();
}

(async function init(){
 try {
  const [totalRows, indicatorRows, metadataRows, complementaryRows, fuentes, supervivencia] = await Promise.all([
   loadCsv(DATA_URLS.total),loadCsv(DATA_URLS.indicators),loadCsv(DATA_URLS.metadata),
   loadCsv('../data/reforestacion/2026/actividades_complementarias_2026.csv'),
   loadCsv('../data/reforestacion/2026/procedencia_2026.csv'),
   loadCsv('../data/reforestacion/2026/supervivencia_2026.csv')
  ]);
  state.totalRows=totalRows.filter(r=>safeNumber(r.anio)===ACTIVE_YEAR&&safeNumber(r.mes_num)<=ACTIVE_MONTH_MAX).sort((a,b)=>String(a.periodo_clave).localeCompare(String(b.periodo_clave)));
  state.indicatorRows=indicatorRows.filter(r=>safeNumber(r.mes_num)<=ACTIVE_MONTH_MAX);
  state.metadata=metadataRows[0]||null;
  provenanceRows=fuentes;
  survivalRows=supervivencia;
  COMPLEMENTARY_KPI_ROWS=complementaryRows.map(r=>({...r,detalle_render:JSON.parse(r.detalle_render||'[]')}));
  state.periods=state.totalRows.map(r=>r.periodo_clave);
  state.selectedPeriod=state.totalRows.at(-1)?.periodo_clave;
  if(!state.totalRows.length)throw new Error('No existen meses de 2026 con datos publicados');
  buildMonthControls();render();
 }catch(error){
  console.error(error);
  const target=document.querySelector('.wrap');
  if(target)target.innerHTML=`<article class="card reforestacion-error"><h2>No se pudo cargar el tablero</h2><p>${escapeHtml(error.message)}</p></article>`;
 }
})();
