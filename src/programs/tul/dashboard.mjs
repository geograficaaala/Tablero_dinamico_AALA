import {mountProgramHeader} from '../../components/header.js';
import {mountFooter} from '../../components/footer/footer.js';
import {loadTulData,getTulMonth} from './data-controller.mjs';

let dataset,month,view='full',slides=[],slide=0,header;
const el=id=>document.getElementById(id);
const fmt=value=>new Intl.NumberFormat('es-GT').format(value);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const monthName=m=>dataset.periods.find(p=>p.month===m)?.name||'';

function card(d,monthly=false,index=0){
  const value=fmt(d.value)+(d.unit==='m'?' m':'');
  const unit=d.unit==='m'?' m':` ${d.unit}`;
  const readings=monthly?[['Resultado del mes',fmt(d.value)+unit],['Meta mensual',fmt(d.goal)+unit],['Cumplimiento mensual',`${d.pct}%`]]:[['Resultado acumulado',fmt(d.value)+unit],[d.id==='municipios'?'Meta de referencia':'Meta anual',fmt(d.goal)+unit],[d.id==='municipios'?'Cobertura territorial':'Cumplimiento acumulado',`${d.pct}%`]];
  return `<article class="card kpi clean-kpi ${monthly?'kpi-monthly-card':''}" style="--delay:${index*45}ms">${monthly?`<div class="kpi-monthly-title">${esc(d.monthly)}</div><div class="kpi-top"><div class="kpi-value">${esc(value)}</div></div>`:`<div class="kpi-top"><div><div class="kpi-label">${esc(d.label)}</div><div class="kpi-value">${esc(value)}</div></div></div>`}<div class="kpi-readings">${readings.map(([label,v])=>`<div class="kpi-meta"><span>${esc(label)}</span><strong>${esc(v)}</strong></div>`).join('')}</div><div class="progress"><span style="width:${d.pct}%"></span></div></article>`;
}
function calendar(){
  el('calendarGrid').innerHTML=dataset.periods.filter(p=>p.month>=2).map(p=>{
    const items=dataset.events.filter(e=>e.month===p.month);
    const done=p.month<=month&&dataset.available.includes(p.month);
    return `<section class="month-group ${p.month===month?'is-current':''}"><div class="month-title"><h3>${esc(p.name)}</h3><span>${items.length} jornada${items.length===1?'':'s'}</span></div><div class="event-list">${items.map(e=>`<article class="event-card ${done?'done':'pending'}"><div class="event-date">${esc(e.date)}</div><div class="event-main"><strong>${esc(e.municipio)} · ${esc(e.sitio)}</strong><span>${esc(e.actividad)} · ${esc(e.semillero.includes('AALA')?'Participación: ':'Semillero: ')}${esc(e.semillero)}</span><span>Coordenadas: ${esc(e.coords)}</span></div><span class="status ${done?'done':'pending'}">${done?'Realizada':'Programada'}</span></article>`).join('')}</div></section>`;
  }).join('');
}
function render(){
  const d=getTulMonth(dataset,month);
  if(!d)throw Error(`No se publicaron datos para el mes ${month}`);
  el('annualKpiGrid').innerHTML=d.annual.map((item,i)=>card(item,false,i)).join('');
  el('execKpiGrid').innerHTML=el('annualKpiGrid').innerHTML;
  el('monthlyKpiGrid').innerHTML=d.monthly.map((item,i)=>card(item,true,i)).join('');
  el('execPeriodText').textContent=`Resumen ejecutivo a ${monthName(month)} de 2026.`;
  el('monthlyAnalysis').innerHTML=`<h3>${esc(d.analysis.headline)}</h3><p>${esc(d.analysis.body)}</p><div class="analysis-grid">${d.analysis.items.map(item=>`<div class="analysis-item"><small>${esc(item.name)}</small><strong>${esc(item.text)}</strong></div>`).join('')}</div>`;
  el('territoryList').innerHTML=d.territory.map(([place,count])=>`<div class="territory-item"><strong>${esc(place)}</strong><span>${count} jornada${count===1?'':'s'}</span></div>`).join('');
  calendar();
  header.update({period:`2026-${String(month).padStart(2,'0')}`,available:dataset.available.map(x=>`2026-${String(x).padStart(2,'0')}`)});
}
function switchView(next){
  view=next;document.body.classList.toggle('view-exec',next==='exec');document.body.classList.toggle('view-full',next!=='exec');
  for(const [id,active] of [['btnFull',next!=='exec'],['btnExec',next==='exec']]){el(id).classList.toggle('active',active);el(id).classList.toggle('aala-action-active',active);}
}
function buildSlides(d){
  const metrics=items=>`<div class="aala-presentation-grid">${items.map(x=>`<div class="aala-presentation-metric"><span>${esc(x.label)}</span><strong>${fmt(x.value)}${x.unit==='m'?' m':''}</strong><span>Meta: ${fmt(x.goal)} · ${x.pct}%</span></div>`).join('')}</div>`;
  return [`<h1>Siembra de Tul</h1><p>${esc(monthName(month))} de 2026 · Asociación Amigos del Lago de Atitlán</p>`,`<h1>Avance acumulado</h1>${metrics(d.annual.slice(0,3))}`,`<h1>Indicadores de seguimiento</h1>${metrics(d.annual.slice(3))}`,`<h1>Resultados del mes</h1>${metrics(d.monthly.slice(0,3))}`,`<h1>Cobertura territorial</h1><div class="aala-presentation-grid">${d.territory.slice(0,6).map(([place,count])=>`<div class="aala-presentation-metric"><span>${esc(place)}</span><strong>${count}</strong><span>Jornadas</span></div>`).join('')}</div>`,`<h1>Análisis mensual</h1><h2>${esc(d.analysis.headline)}</h2><p>${esc(d.analysis.body)}</p>`];
}
function drawSlide(){
  el('tulPresentation').innerHTML=`<div class="aala-presentation-header"><strong>Siembra de Tul · 2026</strong><button type="button" id="tulClose">Cerrar ×</button></div><div class="aala-presentation-slide">${slides[slide]}</div><div class="aala-presentation-controls"><button id="tulPrev" type="button" ${slide===0?'disabled':''}>← Anterior</button><span>${slide+1} / ${slides.length}</span><button id="tulNext" type="button" ${slide===slides.length-1?'disabled':''}>Siguiente →</button></div>`;
  el('tulClose').addEventListener('click',closePresentation);
  el('tulPrev').addEventListener('click',()=>{slide=Math.max(0,slide-1);drawSlide();});
  el('tulNext').addEventListener('click',()=>{slide=Math.min(slides.length-1,slide+1);drawSlide();});
}
function openPresentation(){slides=buildSlides(getTulMonth(dataset,month));slide=0;el('tulPresentation').hidden=false;el('tulPresentation').setAttribute('aria-hidden','false');document.body.classList.add('tul-presenting');drawSlide();el('tulClose').focus();}
function closePresentation(){el('tulPresentation').hidden=true;el('tulPresentation').setAttribute('aria-hidden','true');document.body.classList.remove('tul-presenting');el('btnPresentation').focus();}
function mail(){
  const d=getTulMonth(dataset,month);
  const lines=[`Siembra de Tul · ${monthName(month)} 2026`,'','Avance anual',...d.annual.map(x=>`${x.label}: ${fmt(x.value)} / ${fmt(x.goal)} (${x.pct}%)`),'','Resultados del mes',...d.monthly.map(x=>`${x.monthly}: ${fmt(x.value)} / ${fmt(x.goal)} (${x.pct}%)`),'',d.analysis.headline,d.analysis.body];
  window.location.href=`mailto:?subject=${encodeURIComponent(`Resumen Tul ${monthName(month)} 2026`)}&body=${encodeURIComponent(lines.join('\n'))}`;
}
async function main(){
  header=mountProgramHeader(el('tulHeaderMount'),{onView:switchView,onPresentation:openPresentation,onMail:mail,onMonth:period=>{const m=Number(period.slice(-2));if(dataset.available.includes(m)){month=m;render();}}},{title:'Siembra de Tul',navigation:[{id:'resumen',text:'Resumen'},{id:'indicadoresAnuales',text:'Metas anuales'},{id:'indicadoresMensuales',text:'Metas mensuales'},{id:'programacion',text:'Programación'},{id:'geoportal',text:'Geoportal'},{id:'analisisMes',text:'Análisis'}]});
  mountFooter(el('tulFooterMount'));
  dataset=await loadTulData();month=dataset.latest;render();
  document.addEventListener('keydown',event=>{if(el('tulPresentation').hidden)return;if(event.key==='Escape')closePresentation();if(event.key==='ArrowRight'&&slide<slides.length-1){slide++;drawSlide();}if(event.key==='ArrowLeft'&&slide>0){slide--;drawSlide();}});
}
main().catch(error=>{el('tulError').hidden=false;el('tulError').textContent=`No se pudo cargar el tablero de Tul: ${error.message}`;console.error(error);});
