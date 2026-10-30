import { loadAtitlanModel, KPI_IDS, ANNUAL_IDS } from './data-controller.mjs';
import { mountHeader, monthLabel } from '../../components/header/header.js';
import { mountFooter } from '../../components/footer/footer.js';

const DATA_URL = new URL('../../../data/atitlan_recicla/2026', import.meta.url).href;
const GOALS_URL = new URL('../../../config/atitlan_recicla/metas_2026.json', import.meta.url).href;
const MON = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const state = { model:null, month:9, zone:'__all__', indicator:'materiales_generales', view:'full', slides:[], slide:0 };
const $ = selector => document.querySelector(selector);
const el = id => document.getElementById(id);
const number = value => Number(value) || 0;
const fmt = numberValue => new Intl.NumberFormat('es-GT', {maximumFractionDigits:2}).format(numberValue || 0);
const money = value => `Q${fmt(value)}`;
const percent = value => `${new Intl.NumberFormat('es-GT',{maximumFractionDigits:1}).format(100 * number(value))}%`;
const sanitize = text => String(text ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const metricText = (value, unit) => unit === 'GTQ' || unit === 'GTQ/día' ? money(value) : unit === 'proporción' ? percent(value) : `${fmt(value)} ${unit || ''}`.trim();
const availableMonths = () => state.model.periods.filter(p => p.anio === 2026).map(p => p.mes_num);
const hasPeriod = () => availableMonths().includes(state.month);
const metric = id => state.model.getMetric(2026, state.month, state.zone, id);
const current = () => state.model.getKpis(2026, state.month, state.zone);

function setMessage(message) {
  const node = el('aalaMessage');
  node.textContent = message;
  node.hidden = !message;
}

function createGoalCard(name, data) {
  const p = data.porcentaje;
  const unit = data.unit;
  return `<article class="goal-card goal-tone-green">
    <small>${sanitize(name)}</small>
    <div class="goal-value">${sanitize(metricText(data.acumulado,unit))}</div>
    <div class="goal-caption">Acumulado</div>
    <div class="goal-meta">${data.meta == null ? 'Registro de unidades vendidas' : `Meta anual: <strong>${sanitize(metricText(data.meta,unit))}</strong>`}</div>
    ${p == null ? '' : `<div class="goal-progress"><span class="chip green">${percent(p)} del objetivo anual</span></div><div class="progress"><span style="width:${Math.min(Math.max(p*100,0),100)}%"></span></div>`}
  </article>`;
}

function renderAnnual() {
  const container = el('annualGoalsGrid');
  const goals = state.model.getAnnualGoals(2026,state.month);
  const names = Object.fromEntries(Object.entries(state.model.metrics).map(([key,row]) => [key,row.label]));
  names.surusic_ventas = 'Ventas SURUSIC';
  names.surusic_vidrio = 'Unidades vendidas de SURUSIC';
  container.innerHTML = [...ANNUAL_IDS,'surusic_ventas','surusic_vidrio'].map(id => createGoalCard(names[id],goals[id])).join('');
  el('annualGoalsSubtitle').textContent = `Acumulado del programa frente a la meta anual oficial, con corte en ${monthLabel(state.month)}.`;
}

function createKpiCard(m) {
  const amount = metricText(m.valor,m.unit);
  const pct = state.zone === '__all__' ? m.monthlyPct : m.sharePct;
  const reference = state.zone === '__all__' ? `Meta mensual: ${metricText(m.meta,m.unit)}` : `Aporte del mes al programa`;
  const cumulative = state.zone === '__all__' ? m.annualPct : m.annualSharePct;
  return `<article class="card kpi tone-green">
    <div class="kpi-top"><div class="kpi-label">${sanitize(m.label)}</div></div>
    <div class="kpi-figure"><div class="kpi-pillar"><span class="kpi-pillar-track"></span><span class="kpi-pillar-fill" style="height:${Math.min(100,Math.max(8,pct*100))}%"></span></div>
      <div class="kpi-reading"><div class="kpi-value">${sanitize(amount)}</div><div class="kpi-ref">${sanitize(reference)}</div></div></div>
    <div class="chip green">${percent(pct)} ${state.zone === '__all__' ? 'de meta' : 'de aporte'}</div>
    <div class="progress"><span style="width:${Math.min(100,Math.max(0,pct*100))}%"></span></div>
    <div class="kpi-ref">${percent(cumulative)} de avance acumulado ${state.zone === '__all__' ? 'al corte' : 'del aporte zonal'}</div>
  </article>`;
}

function renderKpis() {
  const metrics = current();
  el('kpiGrid').innerHTML = KPI_IDS.map(id => metrics[id]).filter(Boolean).map(createKpiCard).join('');
  el('kpiSubtitle').textContent = `Resultados y metas de ${monthLabel(state.month)}.`;
  el('execKpiGrid').innerHTML = KPI_IDS.slice(0,6).map(id => metrics[id]).filter(Boolean).map(m => `<article class="card kpi tone-green"><div class="kpi-label">${sanitize(m.label)}</div><div class="kpi-value">${sanitize(metricText(m.valor,m.unit))}</div><div class="chip green">${percent(m.monthlyPct)} de meta</div></article>`).join('');
  const status = state.model.getProgramStatus(2026,state.month,state.zone);
  el('execStatusBadge').textContent = status.label;
  el('execPeriodInfo').textContent = monthLabel(state.month);
  el('execStrip').innerHTML = `<span class="aala-status">${sanitize(status.label)}</span>`;
}

function lineSvg(rows, selectedMonth) {
  const width=880, height=330, left=76, right=26, top=24, bottom=52;
  const max = Math.max(1,...rows.map(r => number(r.valor)),...rows.map(r=>number(r.referencia))) * 1.1;
  const x = idx => left + idx * (width-left-right)/11;
  const y = value => top + (height-top-bottom)*(1-number(value)/max);
  const points = rows.map(r => `${x(r.mes_num-1)},${y(r.valor)}`).join(' ');
  const goalPoints= rows.map(r=>`${x(r.mes_num-1)},${y(r.referencia)}`).join(' ');
  const grids=[0,.25,.5,.75,1].map(i=>`<line x1="${left}" y1="${y(max*i)}" x2="${width-right}" y2="${y(max*i)}" stroke="#dfebf6"/><text x="${left-10}" y="${y(max*i)+4}" text-anchor="end" font-size="11" fill="#617999">${fmt(max*i)}</text>`).join('');
  const labels=MON.map((m,i)=>`<text x="${x(i)}" y="${height-20}" text-anchor="middle" fill="${i+1===selectedMonth?'#164e89':'#6c86a5'}" font-size="12" font-weight="${i+1===selectedMonth?'700':'400'}">${m}</text>`).join('');
  const circles=rows.map(r=>`<circle cx="${x(r.mes_num-1)}" cy="${y(r.valor)}" r="${r.mes_num===selectedMonth?6:4}" fill="#246db5"><title>${MONTHS[r.mes_num-1]}: ${fmt(r.valor)}</title></circle>`).join('');
  return `<svg class="aala-chart-svg" role="img" aria-label="Tendencia mensual del indicador" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">${grids}<polyline points="${goalPoints}" stroke="#9babbe" stroke-dasharray="8 6" stroke-width="2.5" fill="none"/><polyline points="${points}" stroke="#246db5" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" fill="none"/>${circles}${labels}</svg>`;
}

function renderTrend() {
  const rows = state.model.getTrend(2026,state.zone,state.indicator);
  const m = state.model.metrics[state.indicator];
  el('chartSubtitle').textContent = `${m.label} · ${state.zone==='__all__'?'Todas las zonas':state.zone}`;
  el('trendChart').innerHTML = rows.length ? lineSvg(rows,state.month) : '<div class="aala-section-empty">No hay tendencia publicada para este filtro.</div>';
}

function renderBars(target, rows) {
  const max = Math.max(1,...rows.map(row=>number(row.value)));
  el(target).innerHTML = rows.length ? `<div class="aala-bar-list">${rows.map(row=>`<div class="aala-bar-row"><strong>${sanitize(row.name)}</strong><div class="aala-bar-track"><div class="aala-bar-fill" style="width:${Math.max(0,100*number(row.value)/max)}%"></div></div><strong>${fmt(row.value)} qq</strong></div>`).join('')}</div>` : '<div class="aala-section-empty">No hay registros para esta selección.</div>';
}

function renderZones() {
  const rows = state.model.zones.filter(z=>z !== '__all__').map(zone => ({name:zone,value:number(state.model.getMetric(2026,state.month,zone,'materiales_generales')?.valor)}));
  renderBars('zoneBarChart',rows);
  renderBars('execBarChart',rows);
  el('barZoneSub').textContent=`Materiales por zona · ${monthLabel(state.month)} · quintales`;
  el('execBarSub').textContent=`Materiales por zona · ${monthLabel(state.month)}`;
  el('execBarInterp').textContent=rows.some(r=>r.value>0)?`Mayor recolección: ${rows.reduce((a,b)=>b.value>a.value?b:a).name}.`:'Sin recolección registrada para este mes.';
  el('zoneBarInterp').textContent=el('execBarInterp').textContent;
}

function renderTerritories() {
  const rows = state.model.syncedTerritoryRows.filter(row=>row.anio===2026 && row.mes_num===state.month && (state.zone==='__all__'||row.zona===state.zone)).filter(row=>number(row.total_materiales_qq)>0||number(row.ingreso_bruto_total)>0).sort((a,b)=>number(b.total_materiales_qq)-number(a.total_materiales_qq));
  el('territoryTitle').textContent=`Detalle territorial · ${state.zone==='__all__'?'Todas las zonas':state.zone}`;
  el('territorySubtitle').textContent = `Territorios con resultado reportado en ${monthLabel(state.month)}.`;
  el('territoryPanel').innerHTML = rows.length ? `<div class="aala-table-wrap"><table class="aala-table"><thead><tr><th>Municipio</th><th>Zona</th><th>Materiales</th><th>Ingreso bruto</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${sanitize(r.municipio||r.territorio)}</td><td>${sanitize(r.zona)}</td><td>${fmt(r.total_materiales_qq)} qq</td><td>${money(r.ingreso_bruto_total)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="aala-section-empty">Sin registros territoriales en este período.</div>';
}

function renderProgress() {
  const metrics = current();
  el('semaforoTable').innerHTML = `<div class="aala-table-wrap"><table class="aala-table"><thead><tr><th>Indicador</th><th>Cumplimiento mensual</th><th>Avance acumulado</th></tr></thead><tbody>${KPI_IDS.map(id=>metrics[id]).filter(Boolean).map(m=>`<tr><td>${sanitize(m.label)}</td><td><span class="aala-status">${percent(state.zone==='__all__'?m.monthlyPct:m.sharePct)}</span></td><td>${percent(m.annualPct)}</td></tr>`).join('')}</tbody></table></div>`;
  el('semaforoSubtitle').textContent='Evaluación interna conservada; representación visual azul institucional.';
}

function renderDiagnostic() {
  const metrics = current();
  const status = state.model.getProgramStatus(2026,state.month,state.zone);
  const materials = metrics.materiales_generales;
  const pet=metrics.pet, vidrio=metrics.vidrio, income=metrics.ingreso_bruto_total;
  const text = `<h3>Diagnóstico del programa</h3><p class="sub">${monthLabel(state.month)} · ${state.zone==='__all__'?'Consolidado del programa':sanitize(state.zone)}</p><p><span class="aala-status">${sanitize(status.label)}</span></p><p>Durante el período se registraron <strong>${metricText(materials?.valor,'qq')}</strong> de materiales reciclables, de los cuales <strong>${metricText(pet?.valor,'qq')}</strong> corresponden a PET y <strong>${metricText(vidrio?.valor,'qq')}</strong> a vidrio. El ingreso bruto reportado fue <strong>${metricText(income?.valor,'GTQ')}</strong>.</p><p class="aala-summary-note">La evaluación se calcula contra las metas originales del programa. Los colores visibles permanecen en azul institucional.</p>`;
  el('diagnosticPanel').innerHTML=text;
  el('execDiagnosticPanel').innerHTML=text;
}

function renderEmpty() {
  setMessage(`No hay datos publicados para ${monthLabel(state.month)}. No se muestran valores estimados.`);
  ['kpiGrid','execKpiGrid','annualGoalsGrid','trendChart','zoneBarChart','execBarChart','territoryPanel','semaforoTable','diagnosticPanel','execDiagnosticPanel'].forEach(id=>el(id).innerHTML='<div class="aala-section-empty">Pendiente de publicación</div>');
  el('chartSubtitle').textContent=monthLabel(state.month);
  el('execStatusBadge').textContent='Pendiente de actualización';
  el('execPeriodInfo').textContent=monthLabel(state.month);
}

function render() {
  if(!state.model)return;
  header.update({month:state.month,available:availableMonths()});
  el('periodSelect').value=`2026|${state.month}`;
  el('execPeriodSelect').value=String(state.month);
  el('execLatestPill').textContent = state.model.lastPeriod ? monthLabel(state.model.lastPeriod.mes_num) : 'Sin datos';
  el('latestPeriodPill').textContent = state.model.lastPeriod ? monthLabel(state.model.lastPeriod.mes_num) : 'Sin datos';
  el('zoneSelect').value=state.zone;
  el('indicatorSelect').value=state.indicator;
  document.body.classList.toggle('view-full',state.view==='full');
  document.body.classList.toggle('view-exec',state.view==='exec');
  if(!hasPeriod()) {renderEmpty();return;}
  setMessage('');
  renderAnnual();renderKpis();renderTrend();renderZones();renderTerritories();renderProgress();renderDiagnostic();
}

function setMonth(month) { state.month=Number(month); render(); }
function setZone(zone) { state.zone=zone; render(); }
function setView(view) { state.view=view; render(); window.scrollTo({top:0,behavior:'smooth'}); }

function makeSlides() {
  if(!hasPeriod())return [{title:'Pendiente de publicación',subtitle:monthLabel(state.month),content:'No hay datos publicados para este mes.'}];
  const metrics=current();
  const goals=state.model.getAnnualGoals(2026,state.month);
  const pack=ids=>`<div class="aala-presentation-grid">${ids.map(id=>{const m=metrics[id];return `<div class="aala-presentation-metric"><span>${sanitize(m.label)}</span><strong>${sanitize(metricText(m.valor,m.unit))}</strong><span>${percent(m.monthlyPct)} de meta mensual</span></div>`;}).join('')}</div>`;
  return [
    {title:'Atitlán Recicla',subtitle:`Resultados · ${monthLabel(state.month)}`,content:'Asociación Amigos del Lago de Atitlán'},
    {title:'Indicadores principales',subtitle:monthLabel(state.month),content:pack(['materiales_generales','pet','vidrio'])},
    {title:'Impacto económico',subtitle:monthLabel(state.month),content:pack(['ingreso_bruto_total','ingreso_bruto_mujeres','ingreso_diario_lideresa'])},
    {title:'Participación',subtitle:monthLabel(state.month),content:pack(['participacion_actividades','participacion_comercializacion'])},
    {title:'Metas anuales',subtitle:`Acumulado al ${monthLabel(state.month)}`,content:`<div class="aala-presentation-grid">${ANNUAL_IDS.slice(0,6).map(id=>`<div class="aala-presentation-metric"><span>${sanitize(state.model.metrics[id].label)}</span><strong>${sanitize(metricText(goals[id].acumulado,goals[id].unit))}</strong><span>${percent(goals[id].porcentaje)} de ${metricText(goals[id].meta,goals[id].unit)}</span></div>`).join('')}</div>`},
    {title:'Diagnóstico',subtitle:monthLabel(state.month),content:`<p>${sanitize(state.model.getProgramStatus(2026,state.month,state.zone).label)}.</p><p>El cumplimiento conserva las fórmulas originales y se representa con identidad azul institucional.</p>`}
  ];
}

function renderSlide() {
  const slide=state.slides[state.slide];
  el('aalaPresentationContent').innerHTML=`<h1>${sanitize(slide.title)}</h1><p>${sanitize(slide.subtitle)}</p><div>${slide.content}</div>`;
  el('aalaSlideCount').textContent=`${state.slide+1} / ${state.slides.length}`;
  el('aalaPrevSlide').disabled=state.slide===0;
  el('aalaNextSlide').disabled=state.slide===state.slides.length-1;
}
function openPresentation() {state.slides=makeSlides();state.slide=0;el('aalaPresentation').hidden=false;document.body.style.overflow='hidden';renderSlide();el('aalaClosePresentation').focus();}
function closePresentation() {el('aalaPresentation').hidden=true;document.body.style.overflow='';el('btnPresentation').focus();}
function stepSlide(delta) {state.slide=Math.max(0,Math.min(state.slides.length-1,state.slide+delta));renderSlide();}

function sendMail() {
  const lines = [`Atitlán Recicla — ${monthLabel(state.month)}`,`Zona: ${state.zone==='__all__'?'Todas las zonas':state.zone}`];
  if(hasPeriod()) {
    const kpis=current();
    for(const id of KPI_IDS){const m=kpis[id];if(m)lines.push(`${m.label}: ${metricText(m.valor,m.unit)} | cumplimiento mensual: ${percent(m.monthlyPct)}`);}
    lines.push(`Evaluación: ${state.model.getProgramStatus(2026,state.month,state.zone).label}`);
  } else lines.push('Pendiente de actualización');
  lines.push('Asociación Amigos del Lago de Atitlán');
  const subject=encodeURIComponent(`Resumen ejecutivo Atitlán Recicla — ${monthLabel(state.month)}`);
  const body=encodeURIComponent(lines.join('\n'));
  window.location.href=`mailto:?subject=${subject}&body=${body}`;
}

function initSelectors() {
  el('periodSelect').innerHTML=MONTHS.map((name,i)=>`<option value="2026|${i+1}">${name} 2026</option>`).join('');
  el('execPeriodSelect').innerHTML=MONTHS.map((name,i)=>`<option value="${i+1}">${name} 2026</option>`).join('');
  el('zoneSelect').innerHTML=state.model.zones.map(zone=>`<option value="${sanitize(zone)}">${sanitize(zone==='__all__'?'Todas las zonas':zone)}</option>`).join('');
  el('zoneSelect').hidden=false;el('zoneSelect').disabled=false;
  el('zoneSelect').removeAttribute('aria-hidden');el('zoneSelect').removeAttribute('tabindex');
  el('indicatorSelect').innerHTML=KPI_IDS.map(id=>`<option value="${id}">${sanitize(state.model.metrics[id].label)}</option>`).join('');
  el('periodSelect').addEventListener('change',e=>setMonth(e.target.value.split('|')[1]));
  el('execPeriodSelect').addEventListener('change',e=>setMonth(e.target.value));
  el('zoneSelect').addEventListener('change',e=>setZone(e.target.value));
  el('indicatorSelect').addEventListener('change',e=>{state.indicator=e.target.value;renderTrend();});
  const toolbar=$('.toolbar-compact');
  toolbar.hidden=false;toolbar.setAttribute('aria-hidden','false');
  const label=document.createElement('label');label.textContent='Zona de análisis';label.htmlFor='zoneSelect';toolbar.insertBefore(label,el('zoneSelect'));
}

let header;
async function start() {
  mountFooter(el('site-footer'));
  header=mountHeader(el('site-header'),{
    onMonth:setMonth,onView:setView,onPresentation:openPresentation,onMail:sendMail,getView:()=>state.view
  });
  try {
    state.model=await loadAtitlanModel(DATA_URL,fetch,GOALS_URL);
    state.month=state.model.lastPeriod?.mes_num||1;
    initSelectors();
    render();
  } catch(error) {
    console.error(error);
    setMessage(`No se pudieron cargar los datos: ${error.message}. Abre el dashboard desde GitHub Pages o un servidor web; no desde file://.`);
  }
  el('aalaClosePresentation').addEventListener('click',closePresentation);
  el('aalaPrevSlide').addEventListener('click',()=>stepSlide(-1));
  el('aalaNextSlide').addEventListener('click',()=>stepSlide(1));
  document.addEventListener('keydown',e=>{
    if(el('aalaPresentation').hidden)return;
    if(e.key==='Escape')closePresentation();
    if(e.key==='ArrowRight'||e.key===' ') {e.preventDefault();stepSlide(1);}
    if(e.key==='ArrowLeft') {e.preventDefault();stepSlide(-1);}
  });
}
start();
