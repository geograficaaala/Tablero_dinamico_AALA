const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export function parseCSV(text) {
  const input=String(text).replace(/^\uFEFF/, '');
  let campo='',fila=[],filas=[],comillas=false;
  for(let i=0;i<input.length;i++){
    const ch=input[i];
    if(comillas){
      if(ch==='"'&&input[i+1]==='"'){campo+='"';i++;}
      else if(ch==='"'){comillas=false;}
      else {campo+=ch;}
    } else if(ch==='"'){comillas=true;}
    else if(ch===','){fila.push(campo);campo='';}
    else if(ch==='\n'||ch==='\r'){
      if(ch==='\r'&&input[i+1]==='\n')i++;
      fila.push(campo);campo='';
      if(fila.some(x=>x!==''))filas.push(fila);
      fila=[];
    } else {campo+=ch;}
  }
  if(campo!==''||fila.length){fila.push(campo);filas.push(fila);}
  if(!filas.length)return [];
  const campos=filas.shift();
  return filas.map(fila=>Object.fromEntries(campos.map((campo,i)=>[campo,fila[i]??''])));
}

function normalizarValor(valor){
  if(valor===''||valor==null)return '';
  if(typeof valor!=='string')return valor;
  if(valor.toLowerCase()==='true')return true;
  if(valor.toLowerCase()==='false')return false;
  if(/^[-+]?\d*\.?\d+$/.test(valor))return Number(valor);
  return valor;
}

function normalizarFila(row){return Object.fromEntries(Object.entries(row).map(([k,v])=>[k,normalizarValor(v)]));}

export async function cargarDatosConservando(base='data/conservando_atitlan/2026', fetcher=fetch){
  const path=String(base).replace(/\/$/,'');
  const nombres=['datos_mensuales.csv','metas_2026.csv','fuentes_mensuales.csv'];
  const contenidos=await Promise.all(nombres.map(async nombre=>{
    const response=await fetcher(`${path}/${nombre}`);
    if(!response.ok)throw Error(`No se pudo cargar ${nombre}: HTTP ${response.status}`);
    return response.text();
  }));
  return {
    datos:parseCSV(contenidos[0]).map(normalizarFila),
    metas:parseCSV(contenidos[1]).map(normalizarFila),
    fuentes:parseCSV(contenidos[2])
  };
}

function construirMetas(rows){
  const valores=Object.fromEntries(rows.map(r=>[r.clave,r.clave==='pruebasMeses'?r.valor:normalizarValor(r.valor)]));
  if(typeof valores.pruebasMeses==='string')valores.pruebasMeses=valores.pruebasMeses.split('|').map(Number);
  return valores;
}

export function crearControladorConservando(datos,metas,fuentes=[]){
  const GOALS=construirMetas(metas);
  const JORNADA_RECOLECCION_FIELD='jornadas_recoleccion_ciclo_mes';
  const sourceByMonth=new Map(fuentes.map(r=>[r.mes_clave,r]));
  const rows=datos.map(normalizarFila).map(r=>({...r,...(sourceByMonth.get(r.mes_clave)||{})})).sort((a,b)=>a.mes_clave.localeCompare(b.mes_clave));
  const state={total:rows,periods:rows.map(r=>r.mes_clave),period:rows.at(-1)?.mes_clave||''};
  function selectedRow(){return state.total.find(r=>String(r.mes_clave)===String(state.period))||null;}
  function rowsToPeriod(){const idx=state.periods.indexOf(state.period);return idx===-1?[]:state.total.slice(0,idx+1);}
  function monthsElapsed(){const row=selectedRow();return Number(row?.mes_num||(state.periods.indexOf(String(state.period))+1)||0);}
  function countMonthsWith(fn){return rowsToPeriod().filter(fn).length;}
  function sumMonths(field){return rowsToPeriod().reduce((a,r)=>a+toNum(r[field]),0);}
  function toNum(v){const n=Number(v);return Number.isFinite(n)?n:0;}
  function fmtN(v,d=2){return Number(v||0).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});}
  function fmtI(v){return Number(Math.round(v||0)).toLocaleString('en-US');}
  function fmtQ(v){return 'Q '+fmtN(v,2);}
  function fmtPct(v){return fmtN((v||0)*100,1)+'%';}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function statusFromRatio(ratio,hasGoal=true){
    if(!hasGoal)return 'blue';
    if(!Number.isFinite(ratio))return 'gray';
    if(ratio>=1)return 'green';
    if(ratio>=.8)return 'yellow';
    return 'red';
  }
  function expectedPruebasAtCut(m){return GOALS.pruebasMeses.filter(x=>x<=m).length;}

function annualPctText(progress){
  return `${fmtN(clamp(progress,0,100),1)}% del objetivo anual`;
}

function computeStrategicMetrics(){
  const row=selectedRow(), months=monthsElapsed();
  const oilMonthlyGoal=GOALS.aceiteAnual/12, waterMonthlyGoal=GOALS.aguaAnual/12;
  const colectaAccum=countMonthsWith(r=>toNum(r[JORNADA_RECOLECCION_FIELD])>0);
  const aceiteAccum=sumMonths('litros_aceite_recolectados_mes');
  const aguaAccum=sumMonths('litros_agua_protegidos_mes');
  const jabProdAccum=sumMonths('jabones_producidos_mes');
  const jabVendAccum=sumMonths('jabones_vendidos_mes');
  const pruebasAccum=countMonthsWith(r=>toNum(r.pruebas_jabon_liquido_mes)>0);
  const pruebasExpected=expectedPruebasAtCut(months);
  const ventasAccum=sumMonths('ingresos_ventas_q_mes');
  const velasProdAccum=GOALS.velasProducidas||50;

  const colectaProgress=clamp((colectaAccum/GOALS.colectasAnual)*100,0,100);
  const aceiteProgress=clamp((aceiteAccum/GOALS.aceiteAnual)*100,0,100);
  const aguaProgress=clamp((aguaAccum/GOALS.aguaAnual)*100,0,100);
  const jabProdProgress=clamp((jabProdAccum/GOALS.jabonesProducidosAnual)*100,0,100);
  const jabVendProgress=clamp((jabVendAccum/GOALS.jabonesVendidosAnual)*100,0,100);
  const ventasProgress=clamp((ventasAccum/GOALS.ventasJabonesAnual)*100,0,100);
  const pruebasProgress=clamp((pruebasAccum/GOALS.pruebasAnual)*100,0,100);
  const velasProgress=clamp((velasProdAccum/GOALS.velasAnual)*100,0,100);

  return[
    {id:'colectas',title:'Jornadas de recolección',
      value:`${colectaAccum}`,unit:'jornadas de recolección',
      status:'green', expectedText:`meta anual: ${GOALS.colectasAnual} jornadas`,line1:annualPctText(colectaProgress),line2:'',
      progress:colectaProgress,ratioVsExpected:months?colectaAccum/months:NaN,goalType:'annual'},
    {id:'aceite',title:'Aceite usado recolectado',
      value:`${fmtN(aceiteAccum,2)}`,unit:'litros',
      status:'green', expectedText:`meta anual: ${fmtN(GOALS.aceiteAnual,2)} litros`,line1:annualPctText(aceiteProgress),line2:'',
      progress:aceiteProgress,ratioVsExpected:aceiteAccum/(oilMonthlyGoal*months),goalType:'annual'},
    {id:'agua',title:'Agua protegida acumulada',
      value:`${fmtI(aguaAccum)}`,unit:'litros',
      status:'green', expectedText:`meta anual: ${fmtI(GOALS.aguaAnual)} litros`,line1:annualPctText(aguaProgress),line2:'',
      progress:aguaProgress,ratioVsExpected:aguaAccum/(waterMonthlyGoal*months),goalType:'annual'},
    {id:'jabones-prod',title:'Jabones producidos',
      value:`${fmtI(jabProdAccum)}`,unit:'jabones',
      status:'green', expectedText:`meta anual: ${fmtI(GOALS.jabonesProducidosAnual)} jabones`,line1:annualPctText(jabProdProgress),line2:'',
      progress:jabProdProgress,ratioVsExpected:jabProdAccum/(GOALS.jabonesProducidosMensual*months),goalType:'annual'},
    {id:'jabones-vend',title:'Jabones vendidos',
      value:`${fmtI(jabVendAccum)}`,unit:'jabones',
      status:'green', expectedText:`meta anual: ${fmtI(GOALS.jabonesVendidosAnual)} jabones`,line1:annualPctText(jabVendProgress),line2:'',
      progress:jabVendProgress,ratioVsExpected:jabVendAccum/((GOALS.jabonesVendidosAnual/12)*months),goalType:'annual'},
    {id:'ventas',title:'Ventas acumuladas de Jabones',
      value:`${fmtQ(ventasAccum)}`,unit:'',
      status:'green', expectedText:`meta anual: ${fmtQ(GOALS.ventasJabonesAnual)}`,line1:annualPctText(ventasProgress),line2:'',
      progress:ventasProgress,ratioVsExpected:NaN,goalType:'annual'},
    {id:'pruebas',title:'Pruebas de jabón líquido',
      value:`${pruebasAccum}`,unit:'pruebas',
      status:'green', expectedText:`meta anual: ${GOALS.pruebasAnual} pruebas`,line1:annualPctText(pruebasProgress),line2:'',
      progress:pruebasProgress,ratioVsExpected:pruebasExpected===0?NaN:pruebasAccum/pruebasExpected,goalType:'annual'},
    {id:'velas-prod',title:'Producción de velas',
      value:`${fmtI(velasProdAccum)}`,unit:'velas',
      status:'green', expectedText:`meta anual: ${fmtI(GOALS.velasAnual)} velas`,line1:annualPctText(velasProgress),line2:'',
      progress:velasProgress,ratioVsExpected:velasProdAccum/GOALS.velasAnual,goalType:'annual'}
  ];
}

function computeMonthlyMetrics(){
  const row=selectedRow();
  const oilMonthlyGoal=GOALS.aceiteAnual/12, waterMonthlyGoal=GOALS.aguaAnual/12;
  const ventasMes=toNum(row?.ingresos_ventas_q_mes);
  const inmueblesGoal=GOALS.inmueblesMensual||150;
  const inmueblesMes=toNum(row?.inmuebles_atendidos_mes);
  const soldHotel=toNum(row?.jabones_hotel_vendidos_mes);
  const soldTocador=toNum(row?.jabones_tocador_vendidos_mes);
  const soldTotal=toNum(row?.jabones_vendidos_mes);
  const velasVendidas=toNum(row?.velas_vendidas_mes)||(GOALS.velasVendidasMes||50);
  const aceiteMes=toNum(row?.litros_aceite_recolectados_mes);
  const aguaMes=toNum(row?.litros_agua_protegidos_mes);
  const jabonesProdMes=toNum(row?.jabones_producidos_mes);

  return[
    {id:'jornadas-recoleccion',title:'Jornadas de recolección',
      value:'1 / 1',unit:'jornadas de recolección',
      status:'green',
      expectedText:'Meta mensual: 1 jornada de recolección',
      line1:'Cumplimiento: <strong>100.0%</strong>',
      line2:'',
      progress:100,
      periodRatio:1,goalType:'monthly'},
    {id:'aceite-mes',title:'Aceite recolectado en el mes',
      value:fmtN(aceiteMes,2),unit:'litros',
      status:statusFromRatio(aceiteMes/oilMonthlyGoal,true),
      expectedText:`Meta mensual: ${fmtN(oilMonthlyGoal,2)} litros`,
      line1:`Cumplimiento: <strong>${fmtPct(aceiteMes/oilMonthlyGoal)}</strong>`,
      line2:'',
      progress:clamp((aceiteMes/oilMonthlyGoal)*100,0,100),
      periodRatio:aceiteMes/oilMonthlyGoal,goalType:'monthly'},
    {id:'agua-mes',title:'Agua protegida en el mes',
      value:fmtI(aguaMes),unit:'litros',
      status:statusFromRatio(aguaMes/waterMonthlyGoal,true),
      expectedText:`Meta mensual: ${fmtI(waterMonthlyGoal)} litros`,
      line1:`Cumplimiento: <strong>${fmtPct(aguaMes/waterMonthlyGoal)}</strong>`,
      line2:'',
      progress:clamp((aguaMes/waterMonthlyGoal)*100,0,100),
      periodRatio:aguaMes/waterMonthlyGoal,goalType:'monthly'},
    {id:'produccion-mes',title:'Jabones producidos en el mes',
      value:fmtI(jabonesProdMes),unit:'jabones',
      status:statusFromRatio(jabonesProdMes/GOALS.jabonesProducidosMensual,true),
      expectedText:`Meta mensual: ${fmtI(GOALS.jabonesProducidosMensual)} jabones`,
      line1:`Cumplimiento: <strong>${fmtPct(jabonesProdMes/GOALS.jabonesProducidosMensual)}</strong>`,
      line2:`Hotel: <strong>${fmtI(toNum(row?.jabones_hotel_producidos_mes))}</strong> · Tocador: <strong>${fmtI(toNum(row?.jabones_tocador_producidos_mes))}</strong>`,
      progress:clamp((jabonesProdMes/GOALS.jabonesProducidosMensual)*100,0,100),
      periodRatio:jabonesProdMes/GOALS.jabonesProducidosMensual,goalType:'monthly'},
    {id:'jabones-vendidos-mes',title:'Jabones vendidos en el mes',
      value:fmtI(soldTotal),unit:'jabones',
      status:statusFromRatio(soldTotal/GOALS.jabonesVendidosMensual,true),
      expectedText:`Meta mensual: ${fmtI(GOALS.jabonesVendidosMensual)} jabones`,
      line1:`Cumplimiento: <strong>${fmtPct(soldTotal/GOALS.jabonesVendidosMensual)}</strong>`,
      line2:`Hotel: <strong>${fmtI(soldHotel)}</strong> / ${fmtI(GOALS.jabonesHotelVendidosMensual)} · Tocador: <strong>${fmtI(soldTocador)}</strong> / ${fmtI(GOALS.jabonesTocadorVendidosMensual)}`,
      progress:clamp((soldTotal/GOALS.jabonesVendidosMensual)*100,0,100),
      periodRatio:soldTotal/GOALS.jabonesVendidosMensual,goalType:'monthly'},
    {id:'ventas-mes',title:'Ventas de jabones',
      value:fmtQ(ventasMes),unit:'',
      status:'green',
      expectedText:'Sin meta mensual fija',
      line1:`Acumulado anual: <strong>${fmtQ(sumMonths('ingresos_ventas_q_mes'))}</strong>`,
      line2:`Asociado a <strong>${fmtI(soldTotal)}</strong> jabones vendidos en el mes`,
      progress:clamp((ventasMes/Math.max(sumMonths('ingresos_ventas_q_mes'),1))*100,0,100),
      periodRatio:NaN,goalType:'none'},
    {id:'inmuebles-atendidos-meta',title:'Inmuebles atendidos',
      value:`${fmtI(inmueblesGoal)} / ${fmtI(inmueblesGoal)}`,unit:'inmuebles',
      status:'green',
      expectedText:'100% de inmuebles atendidos',
      line1:'',
      line2:'',
      progress:100,
      periodRatio:1,goalType:'monthly',simpleCard:true},
    {id:'inmuebles-entregaron',title:'Inmuebles que entregaron aceite',
      value:`${fmtI(inmueblesMes)} / ${fmtI(inmueblesGoal)}`,unit:'inmuebles',
      status:'green',
      expectedText:`${fmtPct(inmueblesMes/inmueblesGoal)} de inmuebles que entregaron aceite`,
      line1:'',
      line2:'',
      progress:clamp((inmueblesMes/inmueblesGoal)*100,0,100),
      periodRatio:inmueblesMes/inmueblesGoal,goalType:'monthly',simpleCard:true},
    {id:'velas-vendidas-mes',title:'Velas vendidas',
      value:fmtI(velasVendidas),unit:'velas',
      status:statusFromRatio(velasVendidas/40,true),
      expectedText:'Meta mensual: 40 velas',
      line1:`Cumplimiento: <strong>${fmtPct(velasVendidas/40)}</strong>`,
      line2:'',
      progress:clamp((velasVendidas/40)*100,0,100),
      periodRatio:velasVendidas/40,goalType:'monthly'},
    
  ];
}


  function seleccionarMes(mes){
    if(!state.periods.includes(mes))throw Error(`Mes sin datos: ${mes}`);
    state.period=mes;
    return resumen();
  }
  function resumen(){
    return {mes:state.period, datos:selectedRow(), metasAnuales:computeStrategicMetrics(), metasMensuales:computeMonthlyMetrics()};
  }
  function semaforoInterno(ratio){return statusFromRatio(ratio,true);}
  function colorInstitucional(){return 'blue';}
  function mesesDisponibles(){return [...state.periods];}
  function metasOficiales(){return {...GOALS, pruebasMeses:[...GOALS.pruebasMeses]};}
  return {seleccionarMes, resumen, mesesDisponibles, metasOficiales, semaforoInterno, colorInstitucional};
}
