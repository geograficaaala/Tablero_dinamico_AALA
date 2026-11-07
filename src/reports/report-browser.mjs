import { parseCSV } from '../core/csv.mjs';
import { REPORT_PROFILES, PROGRAM_IDS } from './report-profiles.mjs';
import { buildReport, periodName } from './report-core.mjs';

const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isCsv=name=>name.endsWith('.csv');
const rootFile=name=>new URL('../../'+name,import.meta.url);
const query=new URLSearchParams(location.search);
const program=query.get('programa');
const period=query.get('mes');
let built=null;

async function load(path){
  const res=await fetch(rootFile(path),{cache:'no-store'});
  if(!res.ok)throw new Error(`No se pudo cargar ${path} (HTTP ${res.status}).`);
  return isCsv(path)?parseCSV(await res.text()):await res.json();
}
function para(text){return `<p>${esc(text)}</p>`;}
function section(title,body){return `<section class="report-section"><h2>${esc(title)}</h2>${body}</section>`;}
function dataTable(head,rows){
  return `<table><thead><tr>${head.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(cell=>`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function metricSection(r){
  return `<section class="indicator-block"><h3>Indicador institucional ${r.number}. ${esc(r.label)}</h3>
    ${para(`El avance acumulado que presenta el tablero para el período es ${r.accumulated||'sin dato publicado'}. ${r.progress||''}`)}
    ${r.monthly&&r.monthly!=='—'?para(`El cumplimiento mensual se expresa de la siguiente manera: ${r.monthly}.`):''}
    ${para(r.interpretation)}
    ${r.temporality?para(r.temporality):''}
  </section>`;
}
function extraSection(r,i,period){
  const title=`Seguimiento complementario ${i+1}. ${r.title}`;
  const first=r.monthly
    ?`Durante ${period} se registraron ${r.monthly} para este rubro; el valor acumulado publicado es ${r.value}.`
    :`El valor publicado al corte de ${period} para este rubro es ${r.value}.`;
  return `<section class="indicator-block"><h3>${esc(title)}</h3>${para(first)}${para(r.description)}</section>`;
}
function detailSection(detail){
  const title=detail.title;
  if(detail.type==='table'){
    const visible=detail.rows.map(r=>detail.fields.map(([key])=>r[key]??''));
    return `<h3>${esc(title)}</h3>${para(`La siguiente relación presenta los registros documentados para el mes seleccionado, conservando sus denominaciones y estados.`)}${dataTable(detail.fields.map(([,label])=>label),visible)}`;
  }
  if(detail.type==='bullets'){
    return `<h3>${esc(title)}</h3>${detail.rows.map(row=>`<p><strong>${esc(row.categoria||'Actividad')}.</strong> ${esc(row.detalle||'')}</p>`).join('')}`;
  }
  if(detail.type==='maps'){
    return `<h3>${esc(title)}</h3>`+detail.rows.map(row=>{
      let lines=[];
      try{lines=JSON.parse(row.detalle_render||'[]');}catch{lines=[];}
      return `<div class="report-subproduct"><h4>${esc(row.kpi_nombre||row.componente)}</h4>${para(`El registro del período consigna ${row.valor_mes||'0'} elementos de seguimiento asociados con esta línea de trabajo.`)}${Array.isArray(lines)?lines.map(line=>para(line)).join(''):''}</div>`;
    }).join('');
  }
  return '';
}
function overview(r){
  const month=r.periodName;
  const average=r.score==null?'':` El cumplimiento promedio institucional publicado para este período es de ${new Intl.NumberFormat('es-GT',{maximumFractionDigits:1}).format(r.score)} %.`;
  const introduction=para(`Durante ${month}, el programa ${r.name} presenta ${r.official.length} indicadores institucionales priorizados, con resultados mensuales y avances acumulados.${average}`);
  const narratives=r.official.map((k,i)=>para(`En relación con el indicador ${i+1}, «${k.label}», el resultado institucional registrado es ${k.accumulated||'sin dato publicado'}. ${k.progress||''}${k.monthly&&k.monthly!=='—'?` Para el mes se informa: ${k.monthly}.`:''}`)).join('');
  return introduction+narratives;
}

function historicalTable(r){
  if(r.history.length<=1)return para('Este corte constituye el primer período del que se dispone de una serie de resultados institucionales.');
  return para('La siguiente tabla permite revisar la trayectoria de los principales resultados institucionales hasta el período elegido. Los valores reproducen las lecturas acumuladas que presenta el tablero en cada corte disponible.')
    +dataTable(['Mes',...r.official.slice(0,3).map((_,i)=>`Indicador ${i+1}`)],r.history.map(row=>[row.month,...row.metrics]));
}
function renderReport(r){
  const period=r.periodName.toLowerCase();
  const executive=section('1. Presentación y alcance',para(`El presente informe desarrolla los resultados del programa ${r.name} correspondientes a ${period}. ${r.introduction}`)+para(`El documento organiza la información en indicadores institucionales, seguimiento complementario, detalle de ejecución y evolución mensual, atendiendo la selección del período realizada en el tablero.`));
  const overviewSection=section('2. Resumen ejecutivo del período',overview(r)+(r.narrative?para(r.narrative):''));
  const officials=section('3. Desarrollo de los indicadores institucionales',para('El desempeño de cada indicador se presenta con su avance acumulado, su resultado mensual y la temporalidad establecida para el ejercicio.')+r.official.map(metricSection).join(''));
  const extras=section('4. Indicadores de seguimiento operativo y resultados complementarios',para('Los resultados operativos complementan la evaluación institucional mediante el seguimiento de actividades, participación, productos y cobertura territorial.')+r.extras.map((x,i)=>extraSection(x,i,period)).join(''));
  const details=section('5. Desglose de actividades, productos y cobertura',r.details.length?r.details.map(detailSection).join(''):para('Para este período, el desglose operativo se presenta en los resultados complementarios anteriores.'));
  const history=section('6. Seguimiento entre períodos',historicalTable(r));
  const end=section('7. Balance del período',para(`El análisis de ${period} consolida ${r.official.length} indicadores institucionales y ${r.extras.length} resultados operativos complementarios. La evaluación debe leerse junto con sus metas, temporalidades y registros de detalle, que permiten distinguir los avances anuales de la ejecución correspondiente al mes.`)+para(`La continuidad del seguimiento permitirá observar los resultados en los siguientes meses, de acuerdo con las metas anuales y los componentes operativos de cada programa.`));
  $('document').innerHTML=`<header class="report-heading">
    <img src="./assets/logos/aala.png" alt="Logotipo de AALA" class="report-logo"/>
    <p>ASOCIACIÓN AMIGOS DEL LAGO DE ATITLÁN</p><p>INFORME MENSUAL DE RESULTADOS</p>
    <h1>${esc(r.name.toUpperCase())}</h1><p>${esc(r.periodName)}</p>
  </header>${executive}${overviewSection}${officials}${extras}${details}${history}${end}
  <footer class="report-end">Asociación Amigos del Lago de Atitlán · ${esc(r.periodName)}</footer>`;
  document.title=`Informe ${r.name} · ${r.periodName} · AALA`;
  $('reportHeading').textContent=`${r.name} · ${r.periodName}`;
  $('printButton').disabled=false;
  $('mailButton').disabled=false;
  built=r;
}
function prepareEmail(){
  if(!built)return;
  const url=new URL(location.href);url.searchParams.delete('accion');
  const subject=`Informe institucional de ${built.name} · ${built.periodName}`;
  const body=`Buen día:\n\nComparto el informe mensual de ${built.name}, correspondiente a ${built.periodName}.\n\nPuede consultar el informe en:\n${url.href}\n\nSaludos cordiales,\nAsociación Amigos del Lago de Atitlán`;
  $('mailHelp').hidden=false;
  window.location.href=`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
async function boot(){
  $('printButton').addEventListener('click',()=>{if(built)window.print();});
  $('mailButton').addEventListener('click',prepareEmail);
  if(!PROGRAM_IDS.includes(program)||!/^2026-(0[1-9]|1[0-2])$/.test(period||'')){
    $('error').textContent='No se recibió un programa o mes válido desde el dashboard.';return;
  }
  $('backButton').href=`./${REPORT_PROFILES[program].slug}`;
  $('periodLabel').textContent=periodName(period);
  try {
    const profile=REPORT_PROFILES[program];
    const required=[...new Set([profile.file,...(profile.details||[]).map(d=>d.file),
      ...(profile.monthlyActivitySummary?['data/fortalecimiento_municipal/2026/actividades_2026.csv']:[])])];
    const [definitions,cuts,...all]=await Promise.all([
      load('config/index/indicadores_institucionales_2026.json'),
      load('data/index/2026/cortes_publicados.json'),
      ...required.map(load)
    ]);
    const sources=Object.fromEntries(required.map((file,i)=>[file,all[i]]));
    renderReport(buildReport({definitions,cuts,program,period,sources}));
    $('loading').hidden=true;
    if(query.get('accion')==='correo')$('mailHelp').hidden=false;
  }catch(error){
    $('loading').hidden=true;
    $('error').textContent=error.message;
  }
}
boot();
