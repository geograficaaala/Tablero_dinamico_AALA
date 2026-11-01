import { mountProgramHeader } from '../../components/header.js';
import { mountFooter } from '../../components/footer/footer.js';
const header=mountProgramHeader(document.querySelector('#reforestacionHeaderMount'),{
 onView:mode=>window.switchView?.(mode),
 onPresentation:()=>window.openPresentation?.(),
 onMail:()=>{
  const body=window.reforestaResumenCorreo?.()||'Resumen de Reforestando Atitlán';
  const url='mailto:?subject='+encodeURIComponent('Resumen ejecutivo — Reforestando Atitlán')+'&body='+encodeURIComponent(body);
  location.href=url;
 },
 onMonth:period=>window.setReforestaPeriod?.(period)
},{title:'Reforestando Atitlán',homeHref:'./index.html',navigation:[
 {id:'resumen',text:'Resumen'},
 {id:'metasAnuales',text:'Metas anuales'},
 {id:'supervivenciaPromedio',text:'Supervivencia'},
 {id:'metasMensuales',text:'Metas mensuales'},
 {id:'mapasSig',text:'Mapas'},
 {id:'diagnosticPanel',text:'Diagnóstico'}
]});
mountFooter(document.querySelector('#reforestacionFooterMount'));
const app=document.createElement('script');
app.src='../src/programs/reforestacion/dashboard.js';
app.onerror=()=>{document.querySelector('.wrap').textContent='No se pudo cargar el controlador de Reforestación.'};
document.body.append(app);
