export function parseCSV(source) {
  const rows=[]; let cells=[],part='',inside=false;
  const text=String(source).replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++) {
    const ch=text[i];
    if(ch==='"') {if(inside&&text[i+1]==='"'){part+='"';i++;}else inside=!inside;}
    else if(ch===','&&!inside){cells.push(part);part='';}
    else if((ch==='\r'||ch==='\n')&&!inside){if(ch==='\r'&&text[i+1]==='\n')i++;cells.push(part);if(cells.some(x=>x!==''))rows.push(cells);cells=[];part='';}
    else part+=ch;
  }
  if(inside)throw Error('CSV con comillas sin cerrar');
  if(part!==''||cells.length){cells.push(part);rows.push(cells);}
  if(!rows.length)return [];
  const headers=rows.shift();
  return rows.map((values,i)=>{if(values.length!==headers.length)throw Error(`Fila ${i+2}: columnas inconsistentes`);return Object.fromEntries(headers.map((k,j)=>[k,values[j]]));});
}
export const INDICATORS=[
  ['metros','Metros lineales sembrados','Metros lineales sembrados en el mes','m'],
  ['macollas','Macollas establecidas','Macollas establecidas en el mes','macollas'],
  ['mantenimiento','Mantenimiento de masas tulares','Mantenimiento de masas tulares en el mes','jornadas'],
  ['mapas','Mapas actualizados','Mapas actualizados en el mes','mapas'],
  ['jornadas','Jornadas de siembra','Jornadas del mes','jornadas'],
  ['municipios','Municipios atendidos',null,'municipios']
].map(([id,label,monthly,unit])=>({id,label,monthly,unit}));
export function percent(v,g,monthly=false){return monthly&&g===0?(v>0?100:0):g?Math.max(0,Math.min(100,Math.round(v/g*100))):0;}
const n=v=>v===''||v===undefined?null:Number(v);
export function composeTulData(tables){
  const periods=tables.periodos.map(r=>({month:Number(r.mes),name:r.nombre,status:r.estado}));
  const goals=Object.fromEntries(tables.metas.map(r=>[r.indicador,Number(r.meta_anual)]));
  const monthly={};
  for(const r of tables.resultados){
    const m=Number(r.mes);monthly[m]??={};
    if(monthly[m][r.indicador])throw Error(`Registro duplicado ${m} ${r.indicador}`);
    monthly[m][r.indicador]={value:n(r.resultado_mes),goal:n(r.meta_mensual),annual:n(r.acumulado)};
  }
  const events=tables.jornadas.map(r=>({month:Number(r.mes),date:r.fecha,municipio:r.municipio,sitio:r.sitio,actividad:r.actividad,semillero:r.semillero_participantes,coords:r.coordenadas}));
  const analysis={};
  for(const r of tables.analisis)analysis[Number(r.mes)]={headline:r.titular,body:r.descripcion,items:[]};
  for(const r of tables.detalles){const m=Number(r.mes);if(!analysis[m])throw Error(`Sin análisis ${m}`);analysis[m].items.push({order:Number(r.orden),name:r.categoria,text:r.detalle});}
  for(const a of Object.values(analysis))a.items.sort((a,b)=>a.order-b.order);
  const available=periods.filter(p=>p.status==='publicado'&&monthly[p.month]).map(p=>p.month);
  if(!available.length)throw Error('Sin datos mensuales publicados');
  return {periods,goals,monthly,events,analysis,available,latest:Math.max(...available)};
}
export function getTulMonth(data,month){
  if(!data.available.includes(month))return null;
  const m=data.monthly[month];
  const annual=INDICATORS.map(cfg=>({...cfg,value:m[cfg.id].annual,goal:data.goals[cfg.id],pct:percent(m[cfg.id].annual,data.goals[cfg.id])}));
  const monthly=INDICATORS.filter(cfg=>cfg.monthly).map(cfg=>({...cfg,value:m[cfg.id].value,goal:m[cfg.id].goal,pct:percent(m[cfg.id].value,m[cfg.id].goal,true)}));
  const territory=Object.entries(data.events.filter(e=>e.month<=month&&data.available.includes(e.month)&&!e.municipio.includes('Por confirmar')).reduce((acc,e)=>{acc[e.municipio]=(acc[e.municipio]||0)+1;return acc;},{})).sort((a,b)=>b[1]-a[1]);
  return {annual,monthly,territory,analysis:data.analysis[month]};
}
export async function loadTulData(){
  const directory=new URL('../../../data/tul/2026/',import.meta.url);
  const files={periodos:'periodos_2026.csv',metas:'metas_anuales_2026.csv',resultados:'resultados_mensuales_2026.csv',jornadas:'jornadas_2026.csv',analisis:'analisis_mensual_2026.csv',detalles:'analisis_detalles_2026.csv'};
  const pairs=await Promise.all(Object.entries(files).map(async([k,file])=>{
    const response=await fetch(new URL(file,directory),{cache:'no-cache'});
    if(!response.ok)throw Error(`${file}: HTTP ${response.status}`);
    return [k,parseCSV(await response.text())];
  }));
  return composeTulData(Object.fromEntries(pairs));
}
