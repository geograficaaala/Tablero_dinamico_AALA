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
  const rows=await fetchCsv('data/reforestacion/2026/total_mes_2026.csv');
  const months=new Set(rows.map(r=>Number(r.mes_num)));
  const definitions=[
    ['Hectáreas monitoreadas','ha','ha_monitoreadas_kpi_mes','ha_monitoreadas_kpi_acum','meta_ha'],
    ['Cobertura cartográfica de monitoreos','unidad','pct_cartografia_mes','pct_cartografia_acum',null],
    ['Árboles sembrados','árboles','arboles_sembrados_kpi_mes','arboles_sembrados_acum','meta_arboles'],
    ['Unidad SIG creada','unidad','aporte_sig_mes','aporte_sig_acum','meta_unidad_sig'],
    ['Plantas netas producidas','plantas','plantas_netas_mes','plantas_netas_acum','meta_plantas'],
    ['Especies nativas activas','especies','especies_activas_mes','especies_acumuladas_proxy','meta_especies']
  ];
  return {months,get(month){
    const row=rows.find(r=>Number(r.mes_num)===month);
    if(!row)return [];
    return definitions.map(([name,unit,monthlyKey,annualKey,goalKey])=>{
      const monthly=num(row[monthlyKey]);
      const annual=num(row[annualKey]);
      const annualGoal=goalKey?num(row[goalKey]):null;
      return metric(name,unit,monthly,null,annual,annualGoal,{
        monthlyPct:null,
        annualPct:annualGoal>0?ratio(annual,annualGoal):null
      });
    });
  }};
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


