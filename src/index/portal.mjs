import { loadAtitlanModel } from '../programs/atitlan_recicla/data-controller.mjs';
import { cargarDatosConservando, crearControladorConservando } from '../programs/conservando_atitlan/data-controller.mjs';
import { parseCSV as parseTul, loadTulData, getTulMonth } from '../programs/tul/data-controller.mjs';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const RUTA = new URL('../../', import.meta.url);
export const programs = [
  { id:'atitlan_recicla', name:'Atitlán Recicla', summary:'Recuperación de materiales, comercialización y oportunidades económicas para lideresas.', file:'atitlan-recicla.html', art:'atitlan-recicla.png', code:'AR', loader:loadAtitlan },
  { id:'conservando_atitlan', name:'Conservando Atitlán', summary:'Recolección de aceite usado y elaboración de productos que cuidan el agua.', file:'conservando-atitlan.html', art:'conservando-atitlan.png', code:'CA', loader:loadConservando },
  { id:'fortalecimiento_municipal', name:'Fortalecimiento Municipal', summary:'Acompañamiento técnico a municipalidades, estudios, PIRDES y procesos de fortalecimiento.', file:'fortalecimiento-municipal.html', art:'fortalecimiento-municipal.png', code:'FM', loader:loadFortalecimiento },
  { id:'educando_para_conservar', name:'Educando para Conservar', summary:'Formación ambiental, acompañamiento educativo y trabajo con comunidades escolares.', file:'educando-para-conservar.html', art:'educando-para-conservar.png', code:'EC', loader:loadEducando },
  { id:'reforestacion', name:'Reforestando Atitlán', summary:'Reforestación, seguimiento forestal, vivero y herramientas de información geográfica.', file:'reforestando-atitlan.html', art:'reforestando-atitlan.png', code:'RA', loader:loadReforestacion },
  { id:'tul', name:'Siembra de Tul', summary:'Restauración del litoral mediante siembra, mantenimiento y monitoreo de masas tulares.', file:'tul.html', art:'siembra-de-tul.png', code:'ST', loader:loadTul }
];

const state = { month:9, index:0, datasets:new Map(), errors:new Map(), expanded:new Set() };
const money = v => `Q ${fmt(v)}`;
const num = v => Number(v);
const fmt = v => new Intl.NumberFormat('es-GT',{maximumFractionDigits:Math.abs(Number(v)) < 10 && Number(v)%1 ? 2 : 1}).format(Number(v));
const ratio = (a,b) => b > 0 ? a/b : null;
const percent = r => r === null || !Number.isFinite(r) ? '—' : `${fmt(r*100)} %`;
const escape = v => String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const dateKey = m => `2026-${String(m).padStart(2,'0')}`;
const url = path => new URL(path,RUTA);
const fetchCsv = async path => {
  const response = await fetch(url(path),{cache:'no-cache'});
  if(!response.ok) throw Error(`${path}: HTTP ${response.status}`);
  return parseTul(await response.text());
};
const metric = (name, unit, monthly, monthlyGoal, annual, annualGoal, options={}) => ({
  name,unit,monthly,monthlyGoal,annual,annualGoal,
  monthlyPct: options.monthlyPct ?? ratio(monthly,monthlyGoal),
  annualPct: options.annualPct ?? ratio(annual,annualGoal),
  monthNote:options.monthNote||'',yearNote:options.yearNote||''
});

async function loadAtitlan(){
  const base=url('data/atitlan_recicla/2026');
  const monthlyGoals=url('config/atitlan_recicla/metas_2026.json');
  const model=await loadAtitlanModel(base.href,fetch,monthlyGoals.href);
  const ids=['materiales_generales','pet','vidrio','ingreso_bruto_total','ingreso_bruto_mujeres','ingreso_bruto_municipalidades'];
  return {months:new Set(model.periods.map(p=>Number(String(p).slice(-2)) || Number(p.mes_num)).filter(Number.isFinite)),get(month){
    const annual=model.getAnnualGoals(2026,month);
    return ids.map(id=>{
      const m=model.getMetric(2026,month,'__all__',id);
      const a=annual[id];
      if(!m) return null;
      return metric(m.label,m.unit,m.valor,m.meta,a.acumulado,a.meta,{monthlyPct:m.monthlyPct,annualPct:a.porcentaje});
    }).filter(Boolean);
  }};
}

async function loadConservando(){
  const base=url('data/conservando_atitlan/2026/');
  const sources=await cargarDatosConservando(base.href,fetch);
  const controller=crearControladorConservando(sources.datos,sources.metas,sources.fuentes);
  const months=new Set(controller.mesesDisponibles().map(p=>Number(p.slice(-2))));
  return {months,get(month){
    const summary=controller.seleccionarMes(dateKey(month));
    const annual=summary.metasAnuales.filter(m=>m.goalType==='annual');
    const monthly=summary.metasMensuales.filter(m=>m.goalType==='monthly');
    const nText=text=>{
      const found=String(text??'').replace(/,/g,'').replace(/^Q\s*/,'').match(/[-+]?\d+(?:\.\d+)?/);
      return found ? Number(found[0]) : null;
    };
    const goalText=text=>{
      const found=String(text??'').replace(/,/g,'').match(/[-+]?\d+(?:\.\d+)?/);
      return found ? Number(found[0]) : null;
    };
    const pairs={'colectas':'jornadas-recoleccion','aceite':'aceite-mes','agua':'agua-mes','jabones-prod':'produccion-mes','jabones-vend':'jabones-vendidos-mes'};
    const grouped=new Set(Object.values(pairs));
    const annualMapped=annual.map(m=>{
      const mm=monthly.find(row=>row.id===pairs[m.id]);
      return metric(m.title,m.unit,mm?nText(mm.value):null,mm?goalText(mm.expectedText):null,nText(m.value),goalText(m.expectedText),{
        annualPct:Number(m.progress)/100,
        monthlyPct:mm&&Number.isFinite(mm.periodRatio)?mm.periodRatio:null,
        monthNote:mm?'':'Indicador anual sin correspondencia mensual'
      });
    });
    const monthlyMapped=monthly.filter(m=>!grouped.has(m.id)).map(m=>metric(m.title,m.unit,nText(m.value),goalText(m.expectedText),null,null,{monthlyPct:Number.isFinite(m.periodRatio)?m.periodRatio:null,annualPct:null,yearNote:'Indicador de operación mensual'}));
    return [...annualMapped,...monthlyMapped.map(m=>({...m,kind:'monthly'}))];
  }};
}

async function loadFortalecimiento(){
  const base='data/fortalecimiento_municipal/2026/';
  const [rows,goals]=await Promise.all([fetchCsv(base+'indicadores_publicados_2026.csv'),fetchCsv(base+'metas_referencia_2026.csv')]);
  const byId=new Map(goals.map(r=>[r.indicador_id,r]));
  const months=new Set(rows.map(r=>Number(r.periodo.slice(-2))));
  return {months,get(month){
    const current=rows.filter(r=>r.periodo===dateKey(month));
    return current.map(r=>{
      const g=byId.get(r.indicador_id);
      const previous=rows.find(p=>p.periodo===dateKey(month-1)&&p.indicador_id===r.indicador_id);
      const published=num(r.valor_publicado);
      const movement=previous ? published-num(previous.valor_publicado) : published;
      return metric(g?.indicador||r.indicador_id,r.unidad||g?.unidad||'',movement,null,published,num(g?.meta_referencia||r.meta_referencia),{
        monthlyPct:null, monthNote:'Cambio del acumulado; sin meta mensual ratificada',yearNote:'Meta de referencia pendiente de ratificación'
      });
    });
  }};
}

async function loadEducando(){
  const rows=await fetchCsv('data/educando_para_conservar/2026/institucional_indicadores.csv');
  const months=new Set(rows.map(r=>Number(r.mes_num)));
  return {months,get(month){return rows.filter(r=>Number(r.mes_num)===month).map(r=>{
    const a=num(r.valor_acumulado),goal=num(r.meta_anual),m=num(r.valor_mes),mg=num(r.meta_mes);
    const annualPrecomputed=num(r.pct_meta_anual);
    const recurrent=r.modelo_medicion==='monthly_recurrent';
    return metric(r.indicador_nombre,r.unidad,m,mg>0?mg:null,a,!recurrent&&goal>0?goal:null,{
      monthlyPct:mg>0?ratio(m,mg):null,
      annualPct:Number.isFinite(annualPrecomputed) ? annualPrecomputed : null,
      monthNote:mg>0?'':'Sin meta mensual para este indicador',
      yearNote:recurrent?'Cumplimiento de meses y cobertura según el modelo original':''
    });
  });}};
}

async function loadReforestacion(){
  const rows=await fetchCsv('data/reforestacion/2026/indicadores_institucionales_2026.csv');
  const months=new Set(rows.map(r=>Number(r.mes_num)));
  return {months,get(month){return rows.filter(r=>Number(r.mes_num)===month).map(r=>{
    const m=num(r.valor_mes), mg=num(r.meta_mes), a=num(r.valor_acumulado),g=num(r.meta_anual);
    return metric(r.indicador_nombre,r.unidad,m,mg>0?mg:null,a,g>0?g:null,{
      monthlyPct:mg>0?ratio(m,mg):null,
      annualPct:Number.isFinite(num(r.pct_meta_anual))?num(r.pct_meta_anual):null,
      monthNote:mg>0?'':'No hay meta mensual publicada'
    });
  });}};
}

async function loadTul(){
  const data=await loadTulData();
  return {months:new Set(data.available),get(month){
    const snapshot=getTulMonth(data,month);
    const byMonth=new Map(snapshot.monthly.map(m=>[m.id,m]));
    return snapshot.annual.map(a=>{
      const m=byMonth.get(a.id);
      return metric(a.label,a.unit,m?.value??null,m?.goal??null,a.value,a.goal,{
        monthlyPct:m?m.pct/100:null,annualPct:a.pct/100,
        monthNote:m?'':'Sin meta mensual publicada'
      });
    });
  }};
}

function formatValue(value,unit){
  if(value===null||value===undefined||!Number.isFinite(Number(value)))return '—';
  const content=Number(value);
  if(unit==='GTQ'||unit==='quetzales'||unit?.toLowerCase()?.includes('quetzal'))return money(content);
  return `${fmt(content)}${unit?` ${unit}`:''}`;
}
function progress(value){
  if(value===null||!Number.isFinite(value))return '<div class="meter-unknown">Sin porcentaje definido</div>';
  return `<div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.max(0,Math.min(100,Math.round(value*100)))}"><span style="width:${Math.max(0,Math.min(100,value*100))}%"></span></div>`;
}
function indicatorCard(m){
  const monthlyShown=m.monthly!==null && m.monthly!==undefined;
  const annualShown=m.annual!==null && m.annual!==undefined;
  const isMonthly=m.kind!=='annual';
  const isAnnual=m.kind!=='monthly';
  return `<article class="indicator">
    <h4>${escape(m.name)}</h4>
    <div class="indicator-compare">
      <div class="indicator-side">
        <span class="indicator-label">Mensual</span>
        <strong>${monthlyShown && isMonthly?escape(formatValue(m.monthly,m.unit)):'—'}</strong>
        <small>${m.monthlyGoal!=null && isMonthly ? `Meta: ${escape(formatValue(m.monthlyGoal,m.unit))}` : escape(m.monthNote||'Sin meta mensual publicada')}</small>
        <b>${isMonthly?percent(m.monthlyPct):'—'}</b>${isMonthly?progress(m.monthlyPct):''}
      </div>
      <div class="indicator-side">
        <span class="indicator-label">Acumulado anual</span>
        <strong>${annualShown && isAnnual?escape(formatValue(m.annual,m.unit)):'—'}</strong>
        <small>${m.annualGoal!=null && isAnnual?`Meta: ${escape(formatValue(m.annualGoal,m.unit))}`:escape(m.yearNote||'Sin meta anual publicada')}</small>
        <b>${isAnnual?percent(m.annualPct):'—'}</b>${isAnnual?progress(m.annualPct):''}
      </div>
    </div>
  </article>`;
}
function renderProgram(index){
  const p=programs[index],dataset=state.datasets.get(p.id),error=state.errors.get(p.id);
  const root=document.querySelector('#programGrid');
  const link=new URL(`public/${p.file}`,RUTA).href;
  const emblem=new URL(`public/assets/logos/${p.art}`,RUTA).href;
  const month=state.month;
  let content='';
  if(error){
    content=`<div class="no-data"><strong>No se pudieron cargar los datos</strong><p>${escape(error.message)}</p></div>`;
  }else if(!dataset){
    content='<div class="no-data" role="status">Cargando información oficial…</div>';
  }else if(!dataset.months.has(month)){
    content=`<div class="no-data"><strong>Sin datos publicados para ${MESES[month-1].toLowerCase()} de 2026.</strong><p>No se muestran resultados ni cumplimiento ficticios.</p></div>`;
  }else{
    try{
      const rows=dataset.get(month), expanded=state.expanded.has(p.id);
      const items=expanded?rows:rows.slice(0,4);
      content=`<div class="indicator-grid">${items.map(indicatorCard).join('')}</div>
        ${rows.length>4?`<button type="button" class="more-indicators" data-expand="${p.id}" aria-expanded="${expanded}">${expanded?'Mostrar menos':`Ver todos los indicadores (${rows.length})`}</button>`:''}`;
    }catch(err){content=`<div class="no-data">No se pudieron calcular los indicadores: ${escape(err.message)}</div>`;}
  }
  root.innerHTML=`<article class="program-card" aria-label="Indicadores de ${escape(p.name)}">
    <div class="program-top">
      <div class="program-emblem"><img src="${emblem}" alt="" onerror="this.style.display='none'"><span>${p.code}</span></div>
      <div class="program-identity"><div class="eyebrow">Programa ${index+1} de 6</div><h3>${escape(p.name)}</h3><p>${escape(p.summary)}</p></div>
      <a class="open-dashboard" href="${link}">Abrir tablero <span aria-hidden="true">↗</span></a>
    </div>
    <div class="program-readout"><div><span class="section-kicker">Indicadores y metas del programa</span><strong>Resultados a ${MESES[month-1].toLowerCase()} de 2026</strong></div><span class="institutional-tag">Visualización institucional azul</span></div>
    ${content}
    <div class="program-bottom"><span>Los porcentajes se calculan con las reglas originales de este programa.</span><a href="${link}">Consultar indicadores completos ↗</a></div>
  </article>`;
  document.querySelectorAll('[data-expand]').forEach(button=>button.addEventListener('click',()=>{
    if(state.expanded.has(p.id))state.expanded.delete(p.id);else state.expanded.add(p.id);
    renderProgram(state.index);
  }));
  document.querySelector('#programCarouselPrev').disabled=index===0;
  document.querySelector('#programCarouselNext').disabled=index===programs.length-1;
  document.querySelector('#programCarouselDots').innerHTML=programs.map((x,i)=>`<button class="dot ${i===index?'active':''}" data-goto="${i}" aria-label="Ver ${escape(x.name)}" aria-current="${i===index?'true':'false'}"></button>`).join('');
  document.querySelectorAll('[data-goto]').forEach(button=>button.addEventListener('click',()=>goto(Number(button.dataset.goto))));
  document.querySelector('#programCarouselViewport').scrollTop=0;
}
function goto(index){state.index=Math.max(0,Math.min(index,programs.length-1));renderProgram(state.index);}
function setMonth(month){state.month=month;document.querySelector('#programMonthLabel').textContent=`Indicadores de ${MESES[month-1].toLowerCase()} de 2026.`;
  document.querySelectorAll('[data-month]').forEach(el=>{const active=Number(el.dataset.month)===month;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
  renderProgram(state.index);
}
function mount(){
  const monthList=document.querySelector('#programMonthButtons');
  monthList.innerHTML=MESES.map((name,i)=>`<button type="button" data-month="${i+1}" aria-pressed="false">${name.slice(0,3)}</button>`).join('');
  monthList.addEventListener('click',e=>{const button=e.target.closest('[data-month]');if(button)setMonth(Number(button.dataset.month));});
  document.querySelector('#programCarouselPrev').addEventListener('click',()=>goto(state.index-1));
  document.querySelector('#programCarouselNext').addEventListener('click',()=>goto(state.index+1));
  document.querySelector('#programCarouselViewport').addEventListener('keydown',e=>{if(e.key==='ArrowRight')goto(state.index+1);if(e.key==='ArrowLeft')goto(state.index-1);});
  document.querySelectorAll('[data-section]').forEach(button=>button.addEventListener('click',()=>{
    const name=button.dataset.section;
    document.querySelectorAll('[data-section]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-selected',String(b===button));});
    document.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==name);
    if(name==='programas')document.querySelector('#programCarouselViewport').focus({preventScroll:true});
  }));
  setMonth(9);
}
async function boot(){
  mount();
  await Promise.all(programs.map(async p=>{
    try{state.datasets.set(p.id,await p.loader());}catch(err){state.errors.set(p.id,err);}
    if(programs[state.index].id===p.id)renderProgram(state.index);
  }));
  const available=programs.map(p=>state.datasets.get(p.id)).filter(Boolean);
  document.querySelector('#kpiPrograms').textContent=String(available.length);
  document.querySelector('#kpiLatest').textContent=MESES[8];
  document.querySelector('#kpiLatestSub').textContent='Corte histórico inicial del índice: septiembre de 2026. Selecciona otros meses en las tarjetas.';
}
if(typeof document !== 'undefined')boot().catch(error=>{document.querySelector('#programGrid').textContent=`Error al iniciar el índice: ${error.message}`;});
