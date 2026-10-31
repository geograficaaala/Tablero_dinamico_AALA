import {cargarDatosConservando,crearControladorConservando} from './data-controller.mjs';
import {mountProgramHeader} from '../../components/header/header.js';
import {mountFooter} from '../../components/footer/footer.js';
const MONTHS_ES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MONTHS_SHORT=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MONTH_FULL=Object.fromEntries(MONTHS_ES.map((m,i)=>[i+1,m]));
const TREND_OPTIONS=[
{id:'litros_aceite_recolectados_mes',label:'Aceite recolectado',unit:'litros'},
{id:'litros_agua_protegidos_mes',label:'Agua protegida',unit:'litros'},
{id:'jabones_producidos_mes',label:'Jabones producidos',unit:'jabones'},
{id:'jabones_vendidos_mes',label:'Jabones vendidos',unit:'jabones'},
{id:'inmuebles_atendidos_mes',label:'Inmuebles que entregaron aceite',unit:'inmuebles'},
{id:'ingresos_ventas_q_mes',label:'Ventas registradas',unit:'GTQ'},
{id:'pruebas_jabon_liquido_mes',label:'Pruebas de jabón líquido',unit:'pruebas'}
];
let GOALS={};
const JORNADA_RECOLECCION_FIELD='jornadas_recoleccion_ciclo_mes';
const state={total:[],periods:[],period:'',metadata:{},charts:{},view:'full'};
let controller=null,headerApi=null;
const pathDatos='../data/conservando_atitlan/2026';
function computeStrategicMetrics(){return controller.seleccionarMes(state.period).metasAnuales;}
function computeMonthlyMetrics(){return controller.seleccionarMes(state.period).metasMensuales;}
function sendEmail(){
 const row=selectedRow();if(!row)return;
 const strategic=computeStrategicMetrics();
 const monthly=computeMonthlyMetrics();
 const subject=`Conservando Atitlán · Resumen ${periodLabel(state.period)}`;
 const body=[`Conservando Atitlán · ${periodLabel(state.period)}`,'','METAS ANUALES',...strategic.map(m=>`${m.title}: ${m.value}${m.unit?' '+m.unit:''} · ${m.expectedText} · ${m.line1}`),'','RESULTADOS MENSUALES',...monthly.map(m=>`${m.title}: ${m.value}${m.unit?' '+m.unit:''} · ${m.expectedText}`),'','Asociación Amigos del Lago de Atitlán'].map(s=>String(s).replace(/<[^>]*>/g,'')).join('\n');
 window.location.href=`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
async function init(){
 mountFooter(document.getElementById('aalaFooterRoot'));
 headerApi=mountProgramHeader(document.getElementById('aalaHeaderRoot'),{
 onView:switchView,onPresentation:openPresentation,onMail:sendEmail,
 onMonth:(key)=>{if(!controller.mesesDisponibles().includes(key))return;state.period=key;render();}
 },{title:'Conservando Atitlán',homeHref:'./index.html',navigation:[{id:'resumen',text:'Resumen'},{id:'kpis-estrategicos',text:'Indicadores'},{id:'metas-mensuales',text:'Metas mensuales'},{id:'tendencias',text:'Tendencias'},{id:'diagnostico',text:'Diagnóstico'}]});
 const overlay=document.getElementById('presentationOverlay');
 overlay.addEventListener('click',e=>{if(e.target===overlay)closePresentation();});
 overlay.querySelector('[data-pres-action="prev"]').addEventListener('click',prevSlide);
 overlay.querySelector('[data-pres-action="next"]').addEventListener('click',nextSlide);
 overlay.querySelector('[data-pres-action="close"]').addEventListener('click',closePresentation);
 document.addEventListener('keydown',e=>{if(!overlay.classList.contains('open'))return;if(e.key==='Escape'){e.preventDefault();closePresentation();}if(e.key==='ArrowRight'){e.preventDefault();nextSlide();}if(e.key==='ArrowLeft'){e.preventDefault();prevSlide();}});
 setLoading(true,'Cargando información del programa…');
 try{
  const {datos,metas,fuentes}=await cargarDatosConservando(pathDatos);
  controller=crearControladorConservando(datos,metas,fuentes);
  GOALS=controller.metasOficiales();
  const byMonth=new Map(fuentes.map(r=>[r.mes_clave,r]));
  state.total=datos.map(r=>({...r,...(byMonth.get(r.mes_clave)||{})})).sort((a,b)=>a.mes_clave.localeCompare(b.mes_clave));
  state.periods=controller.mesesDisponibles();
  state.period=state.periods.at(-1)||'';
  if(!state.period)throw new Error('No hay datos publicados');
  buildTrendOptions();
  switchView('full');
  render();
  setLoading(false);
 }catch(error){setError(error?.message||String(error));console.error(error);}
}
document.addEventListener('DOMContentLoaded',init);

function setLoading(on,msg=''){
  document.getElementById('loadingWrap').classList.toggle('hidden',!on);
  document.getElementById('loadingState').textContent=msg||'Cargando…';
  if(on) document.getElementById('errorWrap').classList.add('hidden');
}
function setError(msg){
  document.getElementById('errorWrap').classList.remove('hidden');
  document.getElementById('errorState').textContent='No se pudo cargar la información: '+msg;
  document.getElementById('loadingWrap').classList.add('hidden');
}

function periodLabel(period){
  if(!period) return '—';
  const[y,m]=String(period).split('-').map(Number);
  if(!y||!m) return String(period);
  return (MONTH_FULL[m]||MONTHS_ES[m-1])+' de '+y;
}
function monthShortLabel(period){
  const[y,m]=String(period).split('-').map(Number);
  return!y||!m?String(period):(MONTHS_SHORT[m-1]+' '+y);
}
function monthNumber(period){ return Number(String(period).split('-')[1])||0; }
function selectedRow(){ return state.total.find(r=>String(r.mes_clave)===String(state.period))||null; }
function rowsToPeriod(){ const idx=state.periods.indexOf(String(state.period)); return idx===-1?[]:state.total.slice(0,idx+1); }
function monthsElapsed(){ const row=selectedRow(); return Number(row?.mes_num||(state.periods.indexOf(String(state.period))+1)||0); }
function countMonthsWith(fn){ return rowsToPeriod().filter(fn).length; }
function sumMonths(field){ return rowsToPeriod().reduce((a,r)=>a+toNum(r[field]),0); }
function toNum(v){ const n=Number(v); return Number.isFinite(n)?n:0; }
function fmtN(v,d=2){ return Number(v||0).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}); }
function fmtI(v){ return Number(Math.round(v||0)).toLocaleString('en-US'); }
function fmtQ(v){ return 'Q '+fmtN(v,2); }
function fmtPct(v){ return fmtN((v||0)*100,1)+'%'; }
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function statusFromRatio(ratio,hasGoal=true){
  if(!hasGoal) return 'blue';
  if(!Number.isFinite(ratio)) return 'gray';
  if(ratio>=1) return 'green';
  if(ratio>=.8) return 'yellow';
  return 'red';
}
function labelFromStatus(s){ return ''; }
function chipTextFromStatus(s){ return 'Resumen'; }
function expectedPruebasAtCut(m){ return GOALS.pruebasMeses.filter(x=>x<=m).length; }
function escapeHtml(str){ return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function chipHtml(status,text){ return ''; }

function splitDisplayValue(display){
  const raw=String(display==null?'—':display).trim();
  const match=raw.match(/^([^\d\-–]*)(-?\d[\d,]*(?:\.\d+)?)(.*)$/);
  if(!match) return{prefix:'',number:null,suffix:'',text:raw,decimals:0};
  return{prefix:match[1]||'',number:parseFloat(String(match[2]).replace(/,/g,'')),suffix:(match[3]||'').trim(),text:raw,decimals:((match[2].split('.')[1]||'').length)};
}
function animateMetricValue(node){
  if(!node) return;
  const target=Number(node.dataset.value);
  if(!Number.isFinite(target)) return;
  const prefix=node.dataset.prefix||'', suffix=node.dataset.suffix||'', decimals=Number(node.dataset.decimals||0);
  const duration=Math.min(1400,780+String(Math.trunc(Math.abs(target))).length*100);
  const start=performance.now();
  function step(now){
    const t=Math.min(1,(now-start)/duration), eased=1-Math.pow(1-t,4);
    const val=target*eased;
    const formatted=new Intl.NumberFormat('en-US',{minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(val);
    node.textContent=(prefix+formatted+(suffix?' '+suffix:'')).trim();
    if(t<1) requestAnimationFrame(step);
  }
  node.textContent=(prefix+'0'+(suffix?' '+suffix:'')).trim();
  requestAnimationFrame(step);
}

function render(){
  buildMonthPills();
  const strategic=computeStrategicMetrics(), monthly=computeMonthlyMetrics();
  renderHero(strategic,monthly);
  renderKpiGrid('strategicGrid',strategic);
  renderKpiGrid('monthlyGrid',monthly);
  renderPeriodSummary();
  renderCharts();
  renderDiagnostic(strategic,monthly);
  renderExec(strategic,monthly);
  buildPresentation(strategic,monthly);
  updateSectionSubtitles();
}

function updateSectionSubtitles(){
  const lbl=periodLabel(state.period);
  const el=id=>document.getElementById(id);
  if(el('monthlyKpiTitle')) el('monthlyKpiTitle').textContent='Metas mensuales';
  if(el('diagTitle')) el('diagTitle').textContent='Análisis del mes';
  if(el('summarySubtitle')) el('summarySubtitle').textContent='';
  if(el('trendChartSub')) el('trendChartSub').textContent=`Barras mensuales con referencia de meta cuando existe. Mes activo: ${lbl}.`;
  if(el('soapChartSub')) el('soapChartSub').textContent='';
}

function renderDiagnostic(strategic,monthly){
  const row=selectedRow(), lbl=periodLabel(state.period);
  const sOk=strategic.filter(m=>m.goalType!=='none'&&(m.status==='green'||m.status==='yellow')).length;
  const sRisk=strategic.filter(m=>m.status==='red').length;
  const mRisk=monthly.filter(m=>m.goalType==='monthly'&&m.status==='red').length;
  const aceiteAccum=sumMonths('litros_aceite_recolectados_mes');
  const aguaAccum=sumMonths('litros_agua_protegidos_mes');
  const jabProd=sumMonths('jabones_producidos_mes'), jabVend=sumMonths('jabones_vendidos_mes');
  const ventasAccum=sumMonths('ingresos_ventas_q_mes');
  const oilMonthlyGoal=GOALS.aceiteAnual/12;
  const aceiteRatio=toNum(row?.litros_aceite_recolectados_mes)/oilMonthlyGoal;

  const prose=document.getElementById('diagnosticProse');
  if(prose) prose.innerHTML=`
    <p>En <strong>${lbl}</strong>, Conservando Atitlán mantiene <strong>${sOk}</strong> indicador${sOk!==1?'es estratégicos':' estratégico'} con avance registrado${sRisk>0?`, `:''}.</p><p>La cadena de aceite y agua muestra un acumulado de <strong>${fmtN(aceiteAccum,2)}</strong> litros de aceite recolectados, lo que representa la protección de <strong>${fmtI(aguaAccum)}</strong> litros de agua de la cuenca del lago. En <strong>${lbl}</strong>, la recolección alcanzó el <strong>${fmtPct(aceiteRatio)}</strong> de la meta mensual de ${fmtN(oilMonthlyGoal,2)} litros.</p><p>La producción acumulada suma <strong>${fmtI(jabProd)}</strong> jabones y la comercialización ha registrado <strong>${fmtI(jabVend)}</strong> unidades vendidas y <strong>${fmtQ(ventasAccum)}</strong> en ventas acumuladas. ${mRisk>0?'El mes muestra indicadores operativos que necesitan revisión operativa, especialmente en comercialización.':'El mes sostiene un comportamiento operativo equilibrado en toda la cadena de producción y venta.'}</p><div class="diag-grid"><div class="diag-block"><strong> Cadena aceite-agua</strong><p>Aceite: <strong>${fmtN(aceiteAccum,2)} litros</strong><br>Agua protegida: <strong>${fmtI(aguaAccum)} litros</strong></p></div><div class="diag-block"><strong> Cadena jabones</strong><p>Producidos: <strong>${fmtI(jabProd)}</strong><br>Vendidos: <strong>${fmtI(jabVend)}</strong></p></div><div class="diag-block"><strong> Mes activo</strong><p>${lbl}<br>Municipios: <strong>${fmtI(toNum(row?.municipios_visitados_mes))}</strong></p></div><div class="diag-block"><strong> Ventas</strong><p>Del mes: <strong>${fmtQ(toNum(row?.ingresos_ventas_q_mes))}</strong><br>Acumulado: <strong>${fmtQ(ventasAccum)}</strong></p></div></div>`;

  const list=document.getElementById('diagnosticList');
  if(list) list.innerHTML=[
    {title:'Cadena de aceite y agua',body:`El acumulado de aceite llega a ${fmtN(aceiteAccum,2)} litros, protegiendo ${fmtI(aguaAccum)} litros de agua al mes seleccionado. Cada litro de aceite recolectado equivale a aproximadamente 1,000 litros de agua protegida de contaminación.`},
    {title:'Producción y comercialización',body:`La producción acumulada alcanza ${fmtI(jabProd)} jabones, mientras la venta suma ${fmtI(jabVend)} unidades y ${fmtQ(ventasAccum)} en ventas registradas. La tasa de conversión entre producción y venta es el indicador clave de la sostenibilidad comercial del programa.`},
    {title:`Operación de ${lbl}`,body:`Se recolectaron ${fmtN(toNum(row?.litros_aceite_recolectados_mes),2)} litros de aceite, se produjeron ${fmtI(toNum(row?.jabones_producidos_mes))} jabones y se vendieron ${fmtI(toNum(row?.jabones_vendidos_mes))} unidades generando ${fmtQ(toNum(row?.ingresos_ventas_q_mes))} en ventas. Se reporta cobertura en ${fmtI(toNum(row?.municipios_visitados_mes))} municipios y ${fmtI(toNum(row?.inmuebles_atendidos_mes))} inmuebles que entregaron aceite.${row?.observaciones_mes?' '+String(row.observaciones_mes):''}`}
  ].map(item=>`<article class="diag-item"><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.body)}</p></article>`).join('');
}

function renderHero(strategic,monthly){
  const row=selectedRow(), lbl=periodLabel(state.period);
  const setText=(id,value)=>{const node=document.getElementById(id); if(node) node.textContent=value;};
  setText('heroPeriod',lbl);
  setText('heroJornadas',fmtI(toNum(row?.jornadas_codigos_unicos_mes||row?.filas_recoleccion_validas_mes)));
  setText('heroInmuebles',fmtI(toNum(row?.inmuebles_atendidos_mes)));
  setText('heroMunicipios',fmtI(toNum(row?.municipios_visitados_mes)));
  const sRatios=strategic.filter(m=>m.goalType!=='none'&&Number.isFinite(m.ratioVsExpected)).map(m=>m.ratioVsExpected);
  const sAvg=sRatios.length?sRatios.reduce((a,b)=>a+b,0)/sRatios.length:NaN;
  setText('heroStrategic',chipTextFromStatus(statusFromRatio(sAvg,!!sRatios.length)));
  const mRatios=monthly.filter(m=>m.goalType==='monthly'&&Number.isFinite(m.periodRatio)).map(m=>m.periodRatio);
  const mAvg=mRatios.length?mRatios.reduce((a,b)=>a+b,0)/mRatios.length:NaN;
  setText('heroMonthly',chipTextFromStatus(statusFromRatio(mAvg,!!mRatios.length)));
}

function renderKpiGrid(id,metrics){
  const host=document.getElementById(id);
  host.innerHTML='';
  metrics.forEach((metric,idx)=>{
    const tone=metric.status||'gray';
    const displayValue=[metric.value,metric.unit].filter(Boolean).join(' ');
    const parts=splitDisplayValue(displayValue);
    const progressWidth=Math.max(0,Math.min(Number(metric.progress||0),100));
    const pillarHeight=Math.max(8,Math.min(progressWidth,100));
    const detailRows=[metric.line1,metric.line2].filter(v=>String(v||'').trim());
    const simpleCard=!!metric.simpleCard;
    const card=document.createElement('article');
    card.className=`card kpi tone-${tone}${simpleCard?' kpi-simple':''}`;
    card.style.setProperty('--delay',`${idx*80}ms`);
    card.innerHTML=simpleCard?`
      <div class="kpi-top"><div class="kpi-label">${escapeHtml(metric.title)}</div></div><div class="kpi-simple-value">${escapeHtml([metric.value,metric.unit].filter(Boolean).join(' ')).replace(' / ',' <span>de</span> ')}</div>${metric.expectedText?`<div class="kpi-reference" style="margin-top:6px">${escapeHtml(metric.expectedText)}</div>`:''}
    `:`
      <div class="kpi-top"><div class="kpi-label">${escapeHtml(metric.title)}</div></div><div class="kpi-figure"><div class="kpi-pillar" aria-hidden="true"><span class="kpi-pillar-track"></span><span class="kpi-pillar-fill" data-height="${pillarHeight}%"></span></div><div class="kpi-reading"><div class="kpi-value" data-value="${parts.number!=null?parts.number:''}" data-prefix="${escapeHtml(parts.prefix)}" data-suffix="${escapeHtml(parts.suffix)}" data-decimals="${parts.decimals}">${escapeHtml(parts.text)}</div>
          ${metric.expectedText?`<div class="kpi-reference">${escapeHtml(metric.expectedText)}</div>`:''}
        </div></div>
      ${detailRows.length?`<div class="kpi-readings">${detailRows.map(row=>`<div class="kpi-meta">${row}</div>`).join('')}</div>`:''}
      <div class="kpi-progress-line"><span data-width="${progressWidth}"></span></div>`;
    host.appendChild(card);
  });
  if(!host.children.length) host.innerHTML='<div class="empty">No se encontraron indicadores para el mes seleccionado.</div>';
  requestAnimationFrame(()=>{
    host.querySelectorAll('.kpi-pillar-fill').forEach((bar,i)=>{
      const target=bar.dataset.height||'0%';
      setTimeout(()=>{bar.style.height=target;},120+i*120);
    });
    host.querySelectorAll('.kpi-progress-line > span').forEach((bar,i)=>{
      const target=bar.dataset.width||'0';
      setTimeout(()=>{bar.style.width=`${target}%`;},180+i*120);
    });
    host.querySelectorAll('.kpi-value[data-value]').forEach((node,i)=>{
      if(node.dataset.value==='') return;
      setTimeout(()=>animateMetricValue(node),240+i*120);
    });
  });
}

function renderPeriodSummary(){
  const row=selectedRow();
  const host=document.getElementById('periodSummary');
  if(!host) return;
  const cells=[
    {label:'Aceite del mes',value:fmtN(toNum(row?.litros_aceite_recolectados_mes),2)+' litros',meta:'Acumulado: '+fmtN(sumMonths('litros_aceite_recolectados_mes'),2)+' litros'},
    {label:'Agua protegida',value:fmtI(toNum(row?.litros_agua_protegidos_mes))+' litros',meta:'Acumulado: '+fmtI(sumMonths('litros_agua_protegidos_mes'))+' litros'},
    {label:'Jabones producidos',value:fmtI(toNum(row?.jabones_producidos_mes))+' jabones',meta:'Acumulado: '+fmtI(sumMonths('jabones_producidos_mes'))+' jabones'},
    {label:'Jabones vendidos',value:fmtI(toNum(row?.jabones_vendidos_mes))+' jabones',meta:'Acumulado: '+fmtI(sumMonths('jabones_vendidos_mes'))+' jabones'},
    {label:'Ventas del mes',value:fmtQ(toNum(row?.ingresos_ventas_q_mes)),meta:'Acumulado: '+fmtQ(sumMonths('ingresos_ventas_q_mes'))},
    {label:'Municipios visitados',value:fmtI(toNum(row?.municipios_visitados_mes))+' municipios',meta:'Inmuebles: '+fmtI(toNum(row?.inmuebles_atendidos_mes))}
  ];
  host.innerHTML=cells.map(c=>`<div class="summary-cell"><small>${escapeHtml(c.label)}</small><strong>${escapeHtml(c.value)}</strong><span>${escapeHtml(c.meta)}</span></div>`).join('');
}

function makeGradient(chart,from,to,horiz=false){
  const{ctx,chartArea}=chart||{};
  if(!chartArea) return from;
  const g=horiz?ctx.createLinearGradient(chartArea.left,0,chartArea.right,0):ctx.createLinearGradient(0,chartArea.top,0,chartArea.bottom);
  g.addColorStop(0,from);g.addColorStop(1,to);return g;
}
function getChart(ctxId,config){
  const existing=state.charts[ctxId];
  if(existing) existing.destroy();
  state.charts[ctxId]=new Chart(document.getElementById(ctxId),config);
  return state.charts[ctxId];
}
function buildTrendOptions(){
  const sel=document.getElementById('trendIndicator');
  sel.innerHTML=TREND_OPTIONS.map(o=>`<option value="${o.id}">${o.label}</option>`).join('');
  sel.value='litros_aceite_recolectados_mes';
  sel.addEventListener('change',renderTrendChart);
  sel.addEventListener('click',e=>e.stopPropagation());
  sel.addEventListener('mousedown',e=>e.stopPropagation());
}
function buildMonthPills(){
  if(headerApi){headerApi.update({period:state.period,available:state.periods});return;}
  const host=document.getElementById('monthPills');
  if(!host) return;

  const basePeriod=state.period||state.periods.at(-1)||'';
  const year=String(basePeriod).split('-')[0];
  if(!year){ host.innerHTML=''; return; }

  const availablePeriods=new Set(
    state.periods.filter(period=>String(period).startsWith(year+'-'))
  );

  host.innerHTML='';
  Array.from({length:12},(_,index)=>index+1).forEach(month=>{
    const period=`${year}-${String(month).padStart(2,'0')}`;
    const btn=document.createElement('button');
    const hasData=availablePeriods.has(period);

    btn.type='button';
    btn.className='month-pill'+(period===state.period?' active':'');
    btn.textContent=MONTHS_SHORT[month-1]||period;
    btn.title=periodLabel(period);
    btn.disabled=!hasData;

    if(hasData){
      btn.addEventListener('click',()=>{
        state.period=period;
        render();
      });
    }

    host.appendChild(btn);
  });
}

function goalSeriesForIndicator(id){
  const map={
    litros_aceite_recolectados_mes:GOALS.aceiteAnual/12,
    litros_agua_protegidos_mes:GOALS.aguaAnual/12,
    jabones_producidos_mes:GOALS.jabonesProducidosMensual,
    jabones_vendidos_mes:GOALS.jabonesVendidosMensual,
    inmuebles_atendidos_mes:GOALS.inmueblesMensual,
    municipios_visitados_mes:GOALS.municipiosMetaMes
  };
  if(id==='pruebas_jabon_liquido_mes') return state.total.map(r=>GOALS.pruebasMeses.includes(monthNumber(r.mes_clave))?1:0);
  if(map[id]) return state.total.map(()=>map[id]);
  return null;
}
function formatTrendValue(v,unit){
  if(unit==='GTQ') return fmtQ(v);
  if(unit==='litros') return fmtN(v,2)+' litros';
  if(unit==='jabones') return fmtI(v)+' jabones';
  if(unit==='municipios') return fmtI(v)+' municipios';
  if(unit==='inmuebles') return fmtI(v)+' inmuebles';
  return fmtN(v,2);
}

function renderCharts(){
  renderProgressChart();
  renderTrendChart();
  renderSoapChart();
}





function svgNS(tag, attrs={}, text=''){
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v));
  if(text) el.textContent = text;
  return el;
}
function svgPath(d, attrs={}){ return svgNS('path', {d, ...attrs}); }
function svgRect(x,y,w,h,attrs={}){ return svgNS('rect', {x,y,width:w,height:h,...attrs}); }
function svgText(x,y,text,attrs={}){ return svgNS('text', {x,y,...attrs}, text); }
function svgLine(x1,y1,x2,y2,attrs={}){ return svgNS('line', {x1,y1,x2,y2,...attrs}); }
function svgCircle(cx,cy,r,attrs={}){ return svgNS('circle', {cx,cy,r,...attrs}); }


let _tip = null;
function getTip(){
  if(!_tip){ _tip=document.createElement('div'); _tip.id='svgTip';
    _tip.style.cssText='position:fixed;z-index:9999;pointer-events:none;background:rgba(12,28,52,.95);color:#fff;padding:10px 14px;border-radius:12px;font-size:12.5px;line-height:1.55;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.08);font-family:Sora,sans-serif;opacity:0;transition:opacity .1s;max-width:280px;white-space:normal';
    document.body.appendChild(_tip); }
  return _tip;
}
function showTip(e, html){
  const t=getTip(); t.innerHTML=html; t.style.opacity='1';
  const x=e.clientX+16, y=e.clientY-10;
  t.style.left=(x+t.offsetWidth>window.innerWidth?x-t.offsetWidth-28:x)+'px';
  t.style.top=(y<0?4:y)+'px';
}
function hideTip(){ getTip().style.opacity='0'; }


function niceScale(min, max, tickCount=5){
  const range = max - min || 1;
  let step = Math.pow(10, Math.floor(Math.log10(range/tickCount)));
  const err = tickCount / (range/step);
  if(err <= 0.15) step *= 10;
  else if(err <= 0.35) step *= 5;
  else if(err <= 0.75) step *= 2;
  const niceMin = Math.floor(min/step)*step;
  const niceMax = Math.ceil(max/step)*step;
  const ticks = [];
  for(let v=niceMin; v<=niceMax+step*0.001; v+=step) ticks.push(parseFloat(v.toPrecision(10)));
  return { min:niceMin, max:niceMax, step, ticks };
}
function fmtAxis(v, unit){
  if(unit==='GTQ'||unit==='Q') return v>=1000 ? 'Q '+fmtCompact(v) : 'Q '+fmtN(v,0);
  if(unit==='litros') return v>=1000000 ? fmtCompact(v)+' M' : v>=1000 ? fmtCompact(v)+' k' : fmtN(v,0);
  if(unit==='jabones'||unit==='inmuebles') return v>=1000 ? fmtCompact(v)+' k' : fmtI(v);
  return fmtCompact(v);
}
function fmtCompact(v){
  if(v>=1000000) return fmtN(v/1000000,1)+'M';
  if(v>=1000) return fmtN(v/1000,1)+'k';
  return fmtN(v,1);
}


function progressMetricAbsolute(metricId, months){
  if(metricId==='colectas') return {actual:countMonthsWith(r=>toNum(r[JORNADA_RECOLECCION_FIELD])>0), expected:months, target:GOALS.colectasAnual, unit:'jornadas_recoleccion'};
  if(metricId==='aceite') return {actual:sumMonths('litros_aceite_recolectados_mes'), expected:(GOALS.aceiteAnual/12)*months, target:GOALS.aceiteAnual, unit:'litros'};
  if(metricId==='agua') return {actual:sumMonths('litros_agua_protegidos_mes'), expected:(GOALS.aguaAnual/12)*months, target:GOALS.aguaAnual, unit:'litros_int'};
  if(metricId==='jabones-prod') return {actual:sumMonths('jabones_producidos_mes'), expected:GOALS.jabonesProducidosMensual*months, target:GOALS.jabonesProducidosAnual, unit:'jabones'};
  if(metricId==='jabones-vend') return {actual:sumMonths('jabones_vendidos_mes'), expected:GOALS.jabonesVendidosMensual*months, target:GOALS.jabonesVendidosAnual, unit:'jabones'};
  if(metricId==='pruebas') return {actual:countMonthsWith(r=>toNum(r.pruebas_jabon_liquido_mes)>0), expected:expectedPruebasAtCut(months), target:GOALS.pruebasAnual, unit:'pruebas'};
  if(metricId==='velas-prod') return {actual:GOALS.velasProducidas||50, expected:(GOALS.velasAnual/12)*months, target:GOALS.velasAnual, unit:'velas'};
  return {actual:0, expected:0, target:100, unit:''};
}
function progressMetricValueText(value, unit){
  if(unit==='litros') return fmtN(value,2)+' litros';
  if(unit==='litros_int') return fmtI(value)+' litros';
  if(unit==='jabones') return fmtI(value)+' jabones';
  if(unit==='jornadas_recoleccion') return fmtI(value)+' jornadas de recolección';
  if(unit==='pruebas') return fmtI(value)+' pruebas';
  if(unit==='velas') return fmtI(value)+' velas';
  return fmtN(value,2);
}
function progressTempoStatus(actualPct, expectedPct, expectedValue){ return {tone:'green', label:''}; }
function buildProgressComparisonData(strategic, months){
  return strategic.filter(m=>m.goalType!=='none').map(m=>{
    const base = progressMetricAbsolute(m.id, months);
    const target = Math.max(base.target||0, 1);
    const actualPct = clamp((base.actual/target)*100,0,100);
    const expectedPct = clamp((base.expected/target)*100,0,100);
    const tempo = progressTempoStatus(actualPct, expectedPct, base.expected);
    const remaining = Math.max(0, base.target - base.actual);
    const note = (!Number.isFinite(base.expected) || base.expected<=0)
      ? 'Este indicador todavía no tiene exigencia activa en el mes.'
      : `Llevamos <strong>${escapeHtml(progressMetricValueText(base.actual, base.unit))}</strong>; para esta fecha se esperaba <strong>${escapeHtml(progressMetricValueText(base.expected, base.unit))}</strong>.`;
    return {
      id:m.id, title:m.title, tone:tempo.tone, statusLabel:tempo.label,
      actualPct, expectedPct,
      actualText:progressMetricValueText(base.actual, base.unit),
      expectedText:progressMetricValueText(base.expected, base.unit),
      targetText:progressMetricValueText(base.target, base.unit), remainingText:progressMetricValueText(remaining, base.unit), note
    };
  });
}
function progressComparisonHtml(strategic, months, variant='full'){
  const rows = buildProgressComparisonData(strategic, months);
  const extraClass = variant==='compact' ? ' compact' : variant==='presentation' ? ' presentation' : '';
  return `<div class="progress-compare${extraClass}">${rows.map(r=>`
    <div class="progress-compare-row"><div class="progress-compare-top"><div class="progress-compare-name">${escapeHtml(r.title)}</div></div><div class="progress-compare-numbers"><div class="progress-number-card"><small>Llevamos</small><strong>${escapeHtml(r.actualText)}</strong></div><div class="progress-number-card"><small>Esperado hoy</small><strong>${escapeHtml(r.expectedText)}</strong></div><div class="progress-number-card"><small>Meta anual</small><strong>${escapeHtml(r.targetText)}</strong></div></div><div class="progress-goal-meter" aria-label="Avance de ${escapeHtml(r.title)}"><div class="progress-goal-fill ${r.tone}" style="width:${r.actualPct.toFixed(1)}%"></div></div><div class="progress-goal-caption"><strong>${fmtN(r.actualPct,1)}%</strong> de la meta anual · faltan <strong>${escapeHtml(r.remainingText)}</strong>.</div><div class="progress-compare-foot">${r.note}</div></div>`).join('')}</div>`;
}
function renderProgressChart(){
  const strategic = computeStrategicMetrics();
  const months = monthsElapsed();
  const container = document.getElementById('progressChartHost');
  if(!container) return;
  container.innerHTML = progressComparisonHtml(strategic, months, 'full');
  container.style.minHeight = 'auto';
  container.style.height = 'auto';
  container.style.padding = '14px 10px 8px';
}


function monthlyBarsHtml(indicatorId, variant='full'){
  const option = TREND_OPTIONS.find(o=>o.id===indicatorId)||TREND_OPTIONS[0];
  const activeFullIdx = state.periods.indexOf(String(state.period));
  const visibleRows = activeFullIdx>=0 ? state.total.slice(0,activeFullIdx+1) : state.total.slice();
  const rawData = visibleRows.map(r=>toNum(r[indicatorId]));
  const labels = visibleRows.map(r=>monthShortLabel(r.mes_clave));
  const refSeries = goalSeriesForIndicator(indicatorId);
  const ref = refSeries ? refSeries.slice(0,visibleRows.length) : null;
  const activeIdx = visibleRows.length ? visibleRows.length-1 : -1;
  const hasData = rawData.some(v=>v>0);
  if(!rawData.length || !hasData) return `<div class="empty">Sin datos registrados para ${escapeHtml(option.label)} en el mes disponible.</div>`;
  const maxV = Math.max(...rawData, ...(ref||[]), 1);
  const rows = rawData.map((v,i)=>{
    const target = ref ? ref[i] : null;
    const pct = clamp(v/maxV*100,0,100);
    const targetText = target!=null ? `<span class="month-target-tag">${option.id==='inmuebles_atendidos_mes'?'de '+escapeHtml(formatTrendValue(target,option.unit))+' atendidos':'Meta: '+escapeHtml(formatTrendValue(target,option.unit))}</span>` : '';
    const status = target!=null ? statusFromRatio(v/(target||1), true) : (i===activeIdx?'blue':'gray');
    return `<div class="month-bar-row ${i===activeIdx?'active':''}"><div class="month-bar-label">${escapeHtml(labels[i])}</div><div class="month-bar-track"><div class="month-bar-fill ${status}" style="width:${pct.toFixed(1)}%"></div></div><div class="month-bar-value">${escapeHtml(formatTrendValue(v,option.unit))}</div>
      ${targetText}
    </div>`;
  }).join('');
  const activeVal = activeIdx>=0 ? rawData[activeIdx] : 0;
  const activeRef = ref&&activeIdx>=0 ? ref[activeIdx] : null;
  const note = activeRef ? `${option.label} en ${periodLabel(state.period)}: ${formatTrendValue(activeVal,option.unit)}. Meta de referencia: ${formatTrendValue(activeRef,option.unit)}.` : `${option.label} en ${periodLabel(state.period)}: ${formatTrendValue(activeVal,option.unit)}.`;
  return `<div class="month-bars ${variant==='presentation'?'presentation':''}">${rows}</div><p class="simple-chart-note">${escapeHtml(note)}</p>`;
}
function renderTrendChart(){
  const sel = document.getElementById('trendIndicator');
  if(!sel) return;
  const container = document.getElementById('trendChartHost');
  if(!container) return;
  container.innerHTML = monthlyBarsHtml(sel.value,'full');
  container.style.minHeight='auto';
  container.style.padding='14px 14px 10px';
}


function soapTypeData(){
  const row=selectedRow();
  const hotelProd=toNum(row?.jabones_hotel_producidos_mes), tocProd=toNum(row?.jabones_tocador_producidos_mes);
  const hotelSold=toNum(row?.jabones_hotel_vendidos_mes), tocSold=toNum(row?.jabones_tocador_vendidos_mes);
  return [
    {key:'hotel', label:'Hotel', produced:hotelProd, sold:hotelSold, targetSold:GOALS.jabonesHotelVendidosMensual},
    {key:'tocador', label:'Tocador', produced:tocProd, sold:tocSold, targetSold:GOALS.jabonesTocadorVendidosMensual}
  ];
}
function soapDetailHtml(variant='full'){
  const rows=soapTypeData();
  const totalProd=rows.reduce((a,r)=>a+r.produced,0), totalSold=rows.reduce((a,r)=>a+r.sold,0);
  const maxV=Math.max(1,...rows.flatMap(r=>[r.produced,r.sold]),totalProd,totalSold);
  const totalTarget=GOALS.jabonesVendidosMensual||4300;
  return `<div class="soap-detail ${variant==='presentation'?'presentation':''}">
    ${rows.map(r=>{
      const conv=r.produced? r.sold/r.produced : 0;
      return `<div class="soap-row"><div class="soap-row-top"><div class="soap-row-title">${escapeHtml(r.label)}</div><div class="soap-row-value">${fmtPct(conv)} conversión</div></div><div class="soap-bars"><div class="soap-bar-line"><span class="soap-label">Producido</span><div class="soap-track"><div class="soap-fill" style="width:${clamp(r.produced/maxV*100,0,100).toFixed(1)}%"></div></div><span class="soap-value">${fmtI(r.produced)}</span></div><div class="soap-bar-line"><span class="soap-label">Vendido</span><div class="soap-track"><div class="soap-fill sold" style="width:${clamp(r.sold/maxV*100,0,100).toFixed(1)}%"></div></div><span class="soap-value">${fmtI(r.sold)}</span></div></div></div>`;
    }).join('')}
    <div class="soap-total-strip"><div class="soap-total-card"><small>Total producido</small><strong>${fmtI(totalProd)}</strong></div><div class="soap-total-card"><small>Total vendido</small><strong>${fmtI(totalSold)}</strong></div><div class="soap-total-card"><small>Meta venta mensual</small><strong>${fmtI(totalTarget)}</strong></div></div></div>`;
}
function renderSoapChart(){
  const container=document.getElementById('soapChartHost');
  if(!container) return;
  container.innerHTML=soapDetailHtml('full');
  container.style.minHeight='auto';
  container.style.padding='14px 14px 10px';
}


function renderExecProgressChart(strategic, months){
  const container=document.getElementById('execProgressChart');
  if(!container) return;
  container.innerHTML=progressComparisonHtml(strategic, months, 'compact');
}



function buildPresProgressHtml(strategic, months){
  return progressComparisonHtml(strategic, months, 'presentation');
}

function buildPresTrendHtml(indicatorId){
  return monthlyBarsHtml(indicatorId, 'presentation');
}

function buildPresSoapHtml(){
  return soapDetailHtml('presentation');
}



function renderExecSparkline(indicatorId){
  const rawData=state.total.map(r=>toNum(r[indicatorId]));
  const activeIdx=state.periods.indexOf(String(state.period));
  if(!rawData.length) return '';
  const W=320,H=78,PL=6,PR=6,PT=8,PB=20,plotW=W-PL-PR,plotH=H-PT-PB;
  const allV=rawData.filter(Number.isFinite);
  if(!allV.length) return '';
  const mn=Math.min(...allV), mx=Math.max(...allV,mn+1);
  const n=rawData.length;
  const X=i=>PL+i*(plotW/Math.max(n-1,1));
  const Y=v=>PT+plotH-((v-mn)/(mx-mn))*plotH;
  const refSeries=goalSeriesForIndicator(indicatorId);
  const areaPts=[`${X(0)},${PT+plotH}`,...rawData.map((v,i)=>`${X(i)},${Y(v)}`),`${X(n-1)},${PT+plotH}`].join(' ');
  const linePts=rawData.map((v,i)=>`${X(i)},${Y(v)}`).join(' ');
  const refPts=refSeries?refSeries.map((v,i)=>`${X(i)},${Y(v)}`).join(' '):'';
  const labels=state.total.map(r=>monthShortLabel(r.mes_clave));
  const step=Math.max(1,Math.ceil(n/4));
  let xLabels='';
  rawData.forEach((_,i)=>{if(i%step!==0&&i!==n-1) return;xLabels+=`<text x="${X(i)}" y="${H-4}" text-anchor="middle" fill="#8aa0ad" font-size="8">${labels[i]}</text>`;});
  let activeDot='';
  if(activeIdx>=0){const cx=X(activeIdx),cy=Y(rawData[activeIdx]);activeDot=`<circle cx="${cx}" cy="${cy}" r="4.5" fill="#173e63" stroke="#fff" stroke-width="2"/>`;}
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" font-family="Sora,sans-serif"><defs><linearGradient id="spk_${indicatorId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1c6084" stop-opacity=".20"/><stop offset="100%" stop-color="#1c6084" stop-opacity="0"/></linearGradient></defs>
    ${refPts?`<polyline fill="none" stroke="#c6983f" stroke-width="1.4" stroke-dasharray="4 3" points="${refPts}"/>`:''}
    <polygon points="${areaPts}" fill="url(#spk_${indicatorId})"/><polyline fill="none" stroke="#1c6084" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${linePts}"/>
    ${activeDot}
    ${xLabels}
  </svg>`;
}

function renderExec(strategic,monthly){
  const row=selectedRow(), lbl=periodLabel(state.period);
  const months=monthsElapsed();
  const sRatios=strategic.filter(m=>m.goalType!=='none'&&Number.isFinite(m.ratioVsExpected)).map(m=>m.ratioVsExpected);
  const sAvg=sRatios.length?sRatios.reduce((a,b)=>a+b,0)/sRatios.length:NaN;
  const sStatus=statusFromRatio(sAvg,!!sRatios.length);
  const badge=document.getElementById('execStatusBadge');
  if(badge){badge.textContent=chipTextFromStatus(sStatus); badge.className='exec-status-badge';}
  const pi=document.getElementById('execPeriodInfo');
  if(pi) pi.textContent=lbl;

  const aceiteAccum=sumMonths('litros_aceite_recolectados_mes');
  const aguaAccum=sumMonths('litros_agua_protegidos_mes');
  const jabProd=sumMonths('jabones_producidos_mes'), jabVend=sumMonths('jabones_vendidos_mes');
  const ventasAccum=sumMonths('ingresos_ventas_q_mes');
  const oilMonthlyGoal=GOALS.aceiteAnual/12, waterMonthlyGoal=GOALS.aguaAnual/12;

  const EXEC_INDICATORS = [
    {id:'aceite', label:'Aceite recolectado',    val:toNum(row?.litros_aceite_recolectados_mes), unit:'litros', meta:oilMonthlyGoal,        pct:toNum(row?.litros_aceite_recolectados_mes)/oilMonthlyGoal,        sparkId:'litros_aceite_recolectados_mes'},
    {id:'agua',   label:'Agua protegida',         val:toNum(row?.litros_agua_protegidos_mes),     unit:'litros', meta:waterMonthlyGoal,       pct:toNum(row?.litros_agua_protegidos_mes)/waterMonthlyGoal,           sparkId:'litros_agua_protegidos_mes'},
    {id:'jprod',  label:'Jabones producidos',     val:toNum(row?.jabones_producidos_mes),         unit:'jabones',meta:GOALS.jabonesProducidosMensual, pct:toNum(row?.jabones_producidos_mes)/GOALS.jabonesProducidosMensual, sparkId:'jabones_producidos_mes'},
    {id:'jvend',  label:'Jabones vendidos',        val:toNum(row?.jabones_vendidos_mes),           unit:'jabones',meta:null,                  pct:null,  forceStatus:'purple',                                          sparkId:'jabones_vendidos_mes'},
    {id:'ventas', label:'Ventas del mes',      val:toNum(row?.ingresos_ventas_q_mes),          unit:'GTQ',    meta:null,                  pct:null,  forceStatus:'purple',                                          sparkId:'ingresos_ventas_q_mes'},
    {id:'muni',   label:'Municipios visitados',    val:toNum(row?.municipios_visitados_mes),       unit:'muni',   meta:GOALS.municipiosMetaMes,pct:toNum(row?.municipios_visitados_mes)/GOALS.municipiosMetaMes,      sparkId:'municipios_visitados_mes'},
  ];
  const kg=document.getElementById('execKpiGrid');
  if(kg){
    kg.innerHTML=EXEC_INDICATORS.map((k,idx)=>{
      const tone=k.forceStatus||(k.pct!=null?statusFromRatio(k.pct,true):'blue');
      const bw=k.pct!=null?Math.max(0,Math.min(k.pct*100,100)).toFixed(1):'0';
      const pillar=k.pct!=null?Math.max(8,Math.min(k.pct*100,100)).toFixed(1):'0';
      const displayVal=k.unit==='GTQ'?fmtQ(k.val):k.unit==='litros'?fmtN(k.val,2)+' litros':fmtI(k.val)+(k.unit&&k.unit!=='GTQ'?' '+k.unit:'');
      const metaText=k.meta!=null?(k.unit==='GTQ'?`Meta mensual: ${fmtQ(k.meta)}`:`Meta mensual: ${k.unit==='litros'?fmtN(k.meta,2):fmtI(k.meta)} ${k.unit}`):'Lectura informativa';
      const spark=renderExecSparkline(k.sparkId);
      return `<article class="card kpi tone-${tone}" style="animation-delay:${idx*80}ms;opacity:0;animation:kpiReveal .58s cubic-bezier(.2,.7,.2,1) ${idx*80}ms forwards"><div class="kpi-top"><div class="kpi-label">${escapeHtml(k.label)}</div></div><div class="kpi-figure"><div class="kpi-pillar" aria-hidden="true"><span class="kpi-pillar-track"></span><span class="kpi-pillar-fill" style="height:${pillar}%" data-height="${pillar}%"></span></div><div class="kpi-reading"><div class="kpi-value">${escapeHtml(displayVal)}</div><div class="kpi-achieved">${escapeHtml(labelFromStatus(tone))}</div><div class="kpi-reference">${escapeHtml(metaText)}</div></div></div><div style="margin:4px 0 2px">${spark}</div><div class="kpi-progress-line"><span style="width:${bw}%" data-width="${bw}"></span></div></article>`;
    }).join('');

    requestAnimationFrame(()=>{
      kg.querySelectorAll('.kpi-pillar-fill').forEach((el,i)=>{setTimeout(()=>el.style.height=el.dataset.height||'0%',120+i*90);});
      kg.querySelectorAll('.kpi-progress-line > span').forEach((el,i)=>{setTimeout(()=>el.style.width=(el.dataset.width||'0')+'%',180+i*90);});
    });
  }

  const strip=document.getElementById('execStrip');
  if(strip){
    const stripItems=[
      {label:'Aceite acumulado '+lbl.split(' de ')[1],value:fmtN(aceiteAccum,2)+' litros',pct:aceiteAccum/GOALS.aceiteAnual,status:statusFromRatio(aceiteAccum/(oilMonthlyGoal*months),true)},
      {label:'Agua protegida '+lbl.split(' de ')[1],value:fmtI(aguaAccum)+' litros',pct:aguaAccum/GOALS.aguaAnual,status:statusFromRatio(aguaAccum/(waterMonthlyGoal*months),true)},
      {label:'Jabones producidos',value:fmtI(jabProd),pct:jabProd/GOALS.jabonesProducidosAnual,status:statusFromRatio(jabProd/(GOALS.jabonesProducidosMensual*months),true)},
      {label:'Ventas acumuladas de Jabones',value:fmtQ(ventasAccum),pct:ventasAccum/GOALS.ventasJabonesAnual,status:'green'},
    ];
    strip.innerHTML=stripItems.map(s=>`
      <div class="exec-strip-card"><small>${escapeHtml(s.label)}</small><strong>${escapeHtml(s.value)}</strong>
        ${s.pct!=null?`<div style="margin-top:8px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><span style="font-size:.7rem;color:var(--muted)">del objetivo anual</span><span class="exec-strip-card chip ${s.status}" style="padding:3px 8px;font-size:.7rem">${fmtPct(s.pct)}</span></div><div style="height:4px;border-radius:999px;background:var(--line-soft);overflow:hidden"><div style="height:100%;width:${Math.max(0,Math.min(s.pct*100,100)).toFixed(1)}%;border-radius:999px;background:linear-gradient(90deg,var(--lake-light),var(--lake))"></div></div></div>`:`<div style="margin-top:8px"><span class="chip blue" style="font-size:.7rem;padding:3px 8px">Informativo</span></div>`}
      </div>`).join('');
  }

  const progressEl=document.getElementById('execProgressChart');
  if(progressEl){
    progressEl.innerHTML=progressComparisonHtml(strategic, months, 'compact');
  }

  const eNotices=document.getElementById('execNoticePanel');
  if(eNotices) eNotices.innerHTML='';

  const ediag=document.getElementById('execDiagPanel');
  if(ediag){
    const sOk=strategic.filter(m=>m.goalType!=='none'&&(m.status==='green'||m.status==='yellow')).length;
    const sRisk=strategic.filter(m=>m.status==='red');
    const aceiteRatio=toNum(row?.litros_aceite_recolectados_mes)/oilMonthlyGoal;
    ediag.innerHTML=`<h3>Resumen ejecutivo · ${escapeHtml(lbl)}</h3><p>En <strong>${lbl}</strong>, Conservando Atitlán mantiene <strong>${sOk}</strong> indicador${sOk!==1?'es estratégicos':' estratégico'} con avance registrado.</p><p>La cadena de aceite y agua acumula <strong>${fmtN(aceiteAccum,2)}</strong> litros de aceite (<strong>${fmtPct(aceiteAccum/GOALS.aceiteAnual)}</strong> del objetivo anual) y protege <strong>${fmtI(aguaAccum)}</strong> litros de agua. En <strong>${lbl}</strong> se recolectaron <strong>${fmtN(toNum(row?.litros_aceite_recolectados_mes),2)}</strong> litros, alcanzando el <strong>${fmtPct(aceiteRatio)}</strong> de la meta mensual de ${fmtN(oilMonthlyGoal,2)} litros.</p><p>Se produjeron <strong>${fmtI(toNum(row?.jabones_producidos_mes))}</strong> jabones y se vendieron <strong>${fmtI(toNum(row?.jabones_vendidos_mes))}</strong> unidades, generando <strong>${fmtQ(toNum(row?.ingresos_ventas_q_mes))}</strong> en ventas del mes. El acumulado de jabones producidos llega a <strong>${fmtI(jabProd)}</strong> con ventas totales de <strong>${fmtQ(ventasAccum)}</strong>.</p><div class="diag-grid"><div class="diag-block"><strong> Aceite acumulado</strong><p>${fmtN(aceiteAccum,2)} litros · <strong>${fmtPct(aceiteAccum/GOALS.aceiteAnual)}</strong> del año</p></div><div class="diag-block"><strong> Agua protegida</strong><p>${fmtI(aguaAccum)} litros · <strong>${fmtPct(aguaAccum/GOALS.aguaAnual)}</strong> del año</p></div><div class="diag-block"><strong> Cadena jabones</strong><p>Prod.: <strong>${fmtI(jabProd)}</strong> · Vend.: <strong>${fmtI(jabVend)}</strong></p></div><div class="diag-block"><strong> Ventas acumuladas</strong><p><strong>${fmtQ(ventasAccum)}</strong> · Mes: ${fmtQ(toNum(row?.ingresos_ventas_q_mes))}</p></div></div>`;
  }
}

function switchView(mode){
  state.view=mode;
  const execView=document.getElementById('execView'), fullView=document.getElementById('fullView');
  const btnFull=document.getElementById('btnFull'), btnExec=document.getElementById('btnExec');
  execView.style.display=mode==='exec'?'block':'none';
  fullView.style.display=mode==='full'?'block':'none';
  if(btnFull) btnFull.classList.toggle('active',mode==='full');
  if(btnExec) btnExec.classList.toggle('active',mode==='exec');
  if(mode==='exec'){
    window.scrollTo({top:0,behavior:'smooth'});
    if(state.total.length){const s=computeStrategicMetrics(),m=computeMonthlyMetrics();renderExec(s,m);}
  }
}


let presSlideIndex=0;
function openPresentation(){
  const overlay=document.getElementById('presentationOverlay');
  overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  buildPresentation(computeStrategicMetrics(),computeMonthlyMetrics());
}
function closePresentation(){
  const overlay=document.getElementById('presentationOverlay');
  overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
function gotoSlide(idx){
  const track=document.getElementById('presentationTrack');
  if(!track) return;
  const n=track.children.length;
  if(!n) return;
  presSlideIndex=(idx+n)%n;
  track.style.transform=`translateX(-${presSlideIndex*100}%)`;
  document.querySelectorAll('.pres-dot').forEach((d,i)=>d.classList.toggle('active',i===presSlideIndex));
  const counter=document.getElementById('presCounter');
  if(counter) counter.textContent=`${presSlideIndex+1} / ${n}`;
}
function nextSlide(){gotoSlide(presSlideIndex+1);}
function prevSlide(){gotoSlide(presSlideIndex-1);}
function buildPresDots(n){
  const host=document.getElementById('presDots');host.innerHTML='';
  for(let i=0;i<n;i++){
    const btn=document.createElement('button');btn.type='button';
    btn.className='pres-dot'+(i===0?' active':'');
    btn.setAttribute('aria-label',`Diapositiva ${i+1}`);
    btn.onclick=()=>gotoSlide(i);host.appendChild(btn);
  }
}
function presKpiCard(m){
  const cls=m.status||'gray';
  const bw=Math.max(0,Math.min((m.ratioVsExpected||0)*100,100)).toFixed(1);
  return `<div class="pres-kpi-pair"><div class="pres-kpi-label">${escapeHtml(m.title)}</div><div class="pres-kpi-value">${escapeHtml([m.value,m.unit].filter(Boolean).join(' '))}</div><div class="pres-kpi-meta">${escapeHtml(m.expectedText)}</div><div class="pres-bar-wrap"><div class="pres-bar ${cls}" style="width:${bw}%"></div></div><div style="margin-top:6px">${chipHtml(cls,labelFromStatus(cls))}</div></div>`;
}

function buildPresentation(strategic,monthly){
  const track=document.getElementById('presentationTrack');
  const metaEl=document.getElementById('presentationMeta');
  if(!track||!metaEl) return;
  const lbl=periodLabel(state.period), row=selectedRow();
  const months=monthsElapsed();
  const aceiteAccum=sumMonths('litros_aceite_recolectados_mes'), aguaAccum=sumMonths('litros_agua_protegidos_mes');
  const jabProd=sumMonths('jabones_producidos_mes'), jabVend=sumMonths('jabones_vendidos_mes');
  const ventasAccum=sumMonths('ingresos_ventas_q_mes');
  const sRatios=strategic.filter(m=>m.goalType!=='none'&&Number.isFinite(m.ratioVsExpected)).map(m=>m.ratioVsExpected);
  const sAvg=sRatios.length?sRatios.reduce((a,b)=>a+b,0)/sRatios.length:NaN;
  const sStatus=statusFromRatio(sAvg,!!sRatios.length);
  const sRisk=strategic.filter(m=>m.status==='red');
  const sGood=strategic.filter(m=>m.status==='green');

  metaEl.innerHTML=`<span> Presentación</span><span> ${escapeHtml(lbl)}</span><span>${chipTextFromStatus(sStatus)}</span>`;

  const progSvg  = buildPresProgressHtml(strategic, months);
  const trendSvg = buildPresTrendHtml('litros_aceite_recolectados_mes');
  const soapSvg  = buildPresSoapHtml();

  const slides=[];

  slides.push(`<div class="pres-slide"><div class="pres-inner"><div class="pres-kicker">Reporte · ${escapeHtml(lbl)}</div><div class="pres-title-row"><div><h2>Conservando Atitlán</h2><p>Programa de recolección de aceite usado, producción de jabón artesanal y protección del agua de la cuenca del Lago de Atitlán. Asociación Amigos del Lago de Atitlán.</p></div><div class="pres-brand-badge"><img src="./assets/logos/conservando-atitlan.png" alt="Conservando Atitlán"></div></div><div class="pres-card-grid pres-card-grid-4"><div class="pres-card"><small>Aceite acumulado</small><strong>${escapeHtml(fmtN(aceiteAccum,2))}</strong><p>litros · ${escapeHtml(fmtPct(aceiteAccum/GOALS.aceiteAnual))} del año</p>${chipHtml(statusFromRatio(aceiteAccum/(GOALS.aceiteAnual/12*months),true),fmtPct(aceiteAccum/(GOALS.aceiteAnual/12*months))+' del esperado')}</div><div class="pres-card"><small>Agua protegida</small><strong>${escapeHtml(fmtI(aguaAccum))}</strong><p>litros acumulados</p>${chipHtml(statusFromRatio(aguaAccum/(GOALS.aguaAnual/12*months),true),fmtPct(aguaAccum/(GOALS.aguaAnual/12*months))+' del esperado')}</div><div class="pres-card"><small>Jabones producidos</small><strong>${escapeHtml(fmtI(jabProd))}</strong><p>${escapeHtml(fmtPct(jabProd/GOALS.jabonesProducidosAnual))} del objetivo anual</p>${chipHtml(statusFromRatio(jabProd/(GOALS.jabonesProducidosMensual*months),true),labelFromStatus(statusFromRatio(jabProd/(GOALS.jabonesProducidosMensual*months),true)))}</div><div class="pres-card"><small>Ventas acumuladas de Jabones</small><strong>${escapeHtml(fmtQ(ventasAccum))}</strong><p>Mes: ${escapeHtml(fmtQ(toNum(row?.ingresos_ventas_q_mes)))}</p>${chipHtml('blue','Informativo')}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px"><span style="display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.72);border:1px solid var(--line-soft);font-size:.81rem;font-weight:700;color:var(--text-2)"> ${escapeHtml(fmtN(toNum(row?.litros_aceite_recolectados_mes),2))} L aceite en el mes</span><span style="display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.72);border:1px solid var(--line-soft);font-size:.81rem;font-weight:700;color:var(--text-2)"> ${escapeHtml(fmtI(toNum(row?.jabones_producidos_mes)))} jabones producidos</span><span style="display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.72);border:1px solid var(--line-soft);font-size:.81rem;font-weight:700;color:var(--text-2)"> ${escapeHtml(fmtI(toNum(row?.municipios_visitados_mes)))} municipios</span><span style="display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;background:rgba(36,109,181,.12);border:1px solid rgba(0,0,0,.08);font-size:.81rem;font-weight:800;color:#246db5"> ${escapeHtml(chipTextFromStatus(sStatus))}</span></div></div></div>`);

  slides.push(`<div class="pres-slide"><div class="pres-inner"><div class="pres-kicker">Indicadores estratégicos · ${escapeHtml(lbl)}</div><div class="pres-title-row"><div><h2>Metas anuales y avance acumulado</h2><p>Lectura sencilla de las metas anuales del programa, con avance por indicador.</p></div></div><div class="pres-card-grid pres-card-grid-4" style="flex:1;align-content:start">
      ${strategic.slice(0,4).map(m=>presKpiCard(m)).join('')}
    </div><div class="pres-card-grid pres-card-grid-3" style="margin-top:10px">
      ${strategic.slice(4).map(m=>presKpiCard(m)).join('')}
    </div></div></div>`);

  slides.push(`<div class="pres-slide"><div class="pres-inner"><div class="pres-kicker">Indicadores del mes · ${escapeHtml(lbl)}</div><div class="pres-title-row"><div><h2>Comportamiento operativo del mes</h2><p>Indicadores con meta explícita o lectura operativa: jornadas de recolección, aceite, agua, producción, ventas e inmuebles del mes seleccionado.</p></div></div><div class="pres-card-grid pres-card-grid-3" style="flex:1;align-content:start">
      ${monthly.map(m=>{const cls=m.status||'gray';const bw=Math.max(0,Math.min((m.periodRatio||0)*100,100)).toFixed(1);return`<div class="pres-kpi-pair"><div class="pres-kpi-label">${escapeHtml(m.title)}</div><div class="pres-kpi-value">${escapeHtml([m.value,m.unit].filter(Boolean).join(' '))}</div><div class="pres-kpi-meta">${escapeHtml(m.expectedText)}</div><div class="pres-bar-wrap"><div class="pres-bar ${cls}" style="width:${bw}%"></div></div><div style="margin-top:6px">${chipHtml(cls,labelFromStatus(cls))}</div></div>`;}).join('')}
    </div></div></div>`);

  slides.push(`<div class="pres-slide"><div class="pres-inner"><div class="pres-kicker">Tendencia histórica · ${escapeHtml(lbl)}</div><div class="pres-title-row"><div><h2>Aceite recolectado por mes</h2><p>Serie histórica mensual con referencia de meta. El mes destacado (azul oscuro) corresponde a ${escapeHtml(lbl)}. </p></div></div><div style="flex:1;background:rgba(255,255,255,.72);border-radius:18px;border:1px solid var(--line-soft);padding:14px 10px;overflow:hidden">
      ${trendSvg}
    </div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;flex-shrink:0"><div class="pres-card"><small>Aceite del mes</small><strong>${escapeHtml(fmtN(toNum(row?.litros_aceite_recolectados_mes),2))}</strong><p>litros recolectados</p></div><div class="pres-card"><small>Meta mensual</small><strong>${escapeHtml(fmtN(GOALS.aceiteAnual/12,2))}</strong><p>litros de referencia</p></div><div class="pres-card"><small>Acumulado anual</small><strong>${escapeHtml(fmtN(aceiteAccum,2))}</strong><p>litros · ${escapeHtml(fmtPct(aceiteAccum/GOALS.aceiteAnual))} del año</p></div></div></div></div>`);

  slides.push(`<div class="pres-slide"><div class="pres-inner"><div class="pres-kicker">Cadena de valor · ${escapeHtml(lbl)}</div><div class="pres-title-row"><div><h2>Jabones producidos y vendidos</h2><p>Lectura directa por tipo de jabón: cuánto se produjo, cuánto se vendió y cuál fue la conversión.</p></div></div><div style="flex:1;background:rgba(255,255,255,.72);border-radius:18px;border:1px solid var(--line-soft);padding:14px 10px;overflow:hidden">
      ${soapSvg}
    </div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;flex-shrink:0">
      ${[
        {label:'Jabones producidos',val:fmtI(toNum(row?.jabones_hotel_producidos_mes)+toNum(row?.jabones_tocador_producidos_mes))},
        {label:'Jabones vendidos',val:fmtI(toNum(row?.jabones_hotel_vendidos_mes)+toNum(row?.jabones_tocador_vendidos_mes))},
        {label:'Ventas del mes',val:fmtQ(toNum(row?.ingresos_ventas_q_mes))},
        {label:'Conv. global',val:fmtN(((toNum(row?.jabones_hotel_vendidos_mes)+toNum(row?.jabones_tocador_vendidos_mes))/(toNum(row?.jabones_hotel_producidos_mes)+toNum(row?.jabones_tocador_producidos_mes)||1))*100,1)+'%'}
      ].map(c=>`<div class="pres-card"><small>${c.label}</small><strong>${escapeHtml(c.val)}</strong></div>`).join('')}
    </div></div></div>`);

  slides.push(`<div class="pres-slide"><div class="pres-inner"><div class="pres-kicker">Diagnóstico · ${escapeHtml(lbl)}</div><div class="pres-title-row"><div><h2>Análisis del mes</h2></div></div><div class="pres-columns" style="flex:1"><div class="pres-note"><h3>Diagnóstico de ${escapeHtml(lbl)}</h3><p>El programa recolectó <strong>${fmtN(toNum(row?.litros_aceite_recolectados_mes),2)} litros</strong> de aceite y protegió <strong>${fmtI(toNum(row?.litros_agua_protegidos_mes))} litros</strong> de agua en el mes. El acumulado del año alcanza <strong>${fmtN(aceiteAccum,2)} litros</strong> de aceite (${fmtPct(aceiteAccum/GOALS.aceiteAnual)} del objetivo anual) y <strong>${fmtI(aguaAccum)} litros</strong> de agua protegida.</p><p>La producción acumulada llega a <strong>${fmtI(jabProd)}</strong> jabones y la comercialización registra <strong>${fmtI(jabVend)}</strong> unidades vendidas con <strong>${fmtQ(ventasAccum)}</strong> en ventas. El programa opera con avance registrado en el mes.</p><p style="margin-top:auto;padding-top:12px;border-top:1px dashed var(--line-soft);font-size:.76rem;color:var(--muted)">Conservando Atitlán · AALA · ${escapeHtml(lbl)}</p></div><div style="display:flex;flex-direction:column;gap:8px;overflow:auto">
        ${sGood.slice(0,4).map(m=>`<div class="pres-notice-box green"><strong>${escapeHtml(m.title)}</strong><br><span style="font-size:.8rem;opacity:.85">${escapeHtml(fmtPct(m.ratioVsExpected))} del esperado · ${escapeHtml(labelFromStatus(m.status))}</span></div>`).join('')}
        ${sRisk.map(m=>`<div class="pres-notice-box red"><strong>${escapeHtml(m.title)}</strong><br><span style="font-size:.8rem;opacity:.85">${escapeHtml(fmtPct(m.ratioVsExpected))} del esperado · requiere atención</span></div>`).join('')}
        ${!sRisk.length&&!sGood.length?`<div class="pres-notice-box blue"> Sin datos suficientes para clasificar indicadores.</div>`:''}
      </div></div></div></div>`);

  track.innerHTML=slides.join('');
  buildPresDots(slides.length);
  presSlideIndex=0;
  gotoSlide(0);
}

