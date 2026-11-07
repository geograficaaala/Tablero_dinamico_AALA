import { REPORT_PROFILES } from './report-profiles.mjs';

export const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
export const MONTH_LABELS = MONTHS.map(m=>m[0].toUpperCase()+m.slice(1));
const fmt = new Intl.NumberFormat('es-GT',{maximumFractionDigits:2});

export function assertPeriod(value) {
  if (!/^2026-(0[1-9]|1[0-2])$/.test(String(value))) throw new Error('El período solicitado no es válido.');
  return String(value);
}
export function periodName(period) {
  return `${MONTH_LABELS[Number(assertPeriod(period).slice(-2))-1]} de 2026`;
}
export function shown(value,unit='') {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const n=Number(value);
  if (!Number.isFinite(n)) return String(value);
  const number=fmt.format(n);
  return unit==='GTQ' ? `Q${number}` : unit==='proporción' ? `${fmt.format(n*100)} %` : `${number}${unit?' '+unit:''}`;
}
export function matchesPeriod(row, field, period) {
  const raw=String(row?.[field]??'');
  const m=String(Number(period.slice(-2)));
  return raw===period || raw===m || raw===period.slice(-2);
}
function relevantRows(rows,field,period) {
  return (Array.isArray(rows)?rows:[]).filter(r=>matchesPeriod(r,field,period));
}
function compareReference(metric) {
  if (Number.isFinite(metric?.pct)) {
    const pct=Number(metric.pct);
    if(pct>=100)return 'El resultado publicado alcanza o supera la referencia institucional correspondiente a este indicador.';
    if(pct>=75)return 'El resultado publicado muestra un avance sustancial respecto de la referencia institucional, aunque debe mantenerse el seguimiento hasta el cierre de su temporalidad.';
    return 'El resultado publicado mantiene un avance parcial frente a su referencia institucional; su seguimiento continuará en los siguientes cortes del programa.';
  }
  return 'La lectura del indicador debe realizarse con la unidad y los criterios específicos consignados en la ficha institucional.';
}
function extraRows(profile,period,sources) {
  const rows=relevantRows(sources[profile.file],profile.periodField,period);
  const row=rows.find(r=>Object.entries(profile.filter||{}).every(([k,v])=>r[k]===v))||rows[0];
  const items=[];
  for(const [title,field,unit,description] of profile.extras){
    let value=null,monthly=null;
    if(profile.slug==='fortalecimiento-municipal.html'){
      const match=rows.find(r=>r.componente===field);
      value=shown(match?.valor_publicado,unit);
    }else if(profile.slug==='tul.html'){
      const match=rows.find(r=>r.indicador===field);
      value=shown(match?.acumulado,unit);
      monthly=shown(match?.resultado_mes,unit);
    }else value=shown(row?.[field],unit);
    if(value===null)continue;
    items.push({title,value,monthly,description});
  }
  if(profile.monthlyActivitySummary){
    const activities=relevantRows(sources['data/fortalecimiento_municipal/2026/actividades_2026.csv'],'periodo',period);
    const uniqueMunicipalities=new Set(activities.map(r=>String(r.municipio||'').trim()).filter(Boolean));
    const categories=[['Asistencias registradas','asistencias'],['Estudios en seguimiento','estudios'],['PIRDES en seguimiento','pirdes'],['Reuniones registradas','reuniones']];
    items.push({title:'Actividades documentadas durante el mes',value:shown(activities.length,'actividades'),description:'Se incluyen las actividades del registro operativo sin suponer que todas corresponden a metas institucionales terminadas.'});
    items.push({title:'Municipios o ámbitos con actividades registradas',value:shown(uniqueMunicipalities.size,'ámbitos'),description:'Identifica el número de denominaciones territoriales presentes en el registro del mes.'});
    for(const [title,key] of categories){
      const count=activities.filter(r=>r.componente===key).length;
      items.push({title,value:shown(count,'actividades'),description:'Se trata del número de registros operativos del componente durante el mes, independiente del valor institucional acumulado.'});
    }
  }
  return {row,items};
}
function detailRows(profile,period,sources){
  return (profile.details||[]).map(d=>{
    const rows=relevantRows(sources[d.file],d.periodField,period);
    return {title:d.title,type:d.type,fields:d.fields,rows:rows.slice(0,180)};
  }).filter(d=>d.rows.length);
}
function renderSnapshot(snap,conf,period){
  return (conf.indicators||[]).map((indicator,i)=>{
    const m=snap.metrics?.[i]||{};
    return {
      number:i+1, label:indicator.label, temporality:indicator.temporality,
      accumulated:m.acumDisplay??'', progress:m.pctDisplay??'',
      monthly:m.monthlyDisplay??'', monthlyPct:m.monthlyPct,
      interpretation:compareReference(m)
    };
  });
}
export function buildReport({definitions,cuts,program,period,sources={}}) {
  period=assertPeriod(period);
  const profile=REPORT_PROFILES[program];
  if(!profile)throw new Error('Programa desconocido.');
  const config=(Array.isArray(definitions)?definitions:[]).find(x=>x.id===program);
  if(!config)throw new Error('No se encontraron las definiciones institucionales del programa.');
  const snapshots=cuts?.[Number(period.slice(-2))];
  const selected=(Array.isArray(snapshots)?snapshots:[]).find(x=>x.id===program);
  if(!selected)throw new Error(`No hay un corte institucional publicado para ${periodName(period)} de este programa.`);
  const indexed=renderSnapshot(selected,config,period);
  const {row,items}=extraRows(profile,period,sources);
  const details=detailRows(profile,period,sources);
  const history=Object.entries(cuts||{}).filter(([month])=>Number(month)<=Number(period.slice(-2)))
    .sort((a,b)=>Number(a[0])-Number(b[0])).map(([m,list])=>{
      const s=Array.isArray(list)?list.find(x=>x.id===program):null;
      return s?{month:MONTH_LABELS[Number(m)-1],metrics:(s.metrics||[]).slice(0,3).map(x=>x.acumDisplay??'')}:null;
    }).filter(Boolean);
  return {
    program,name:config.name,period,periodName:periodName(period),year:2026,
    introduction:profile.introduction,score:typeof selected.score==='number'?selected.score:null,
    official:indexed,extras:items,details,history,
    narrative:profile.narrativeField?String(row?.[profile.narrativeField]||'').trim():'',
    sourceFiles:[profile.file,...(profile.details||[]).map(d=>d.file)]
  };
}
