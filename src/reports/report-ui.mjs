import { loadMonthlyReport, gmailDraftForReport } from './report-gmail.mjs';
const FILES = {
  'atitlan-recicla.html':'atitlan_recicla',
  'conservando-atitlan.html':'conservando_atitlan',
  'educando-para-conservar.html':'educando_para_conservar',
  'fortalecimiento-municipal.html':'fortalecimiento_municipal',
  'reforestando-atitlan.html':'reforestacion',
  'tul.html':'manejo_tul'
};
const PROGRAM = FILES[location.pathname.split('/').pop()];

function currentPeriod(){
  const pills=[...document.querySelectorAll('#monthPills .month-pill')];
  const selected=pills.find(p=>p.getAttribute('aria-pressed')==='true' && !p.disabled)
    || pills.find(p=>p.classList.contains('active') && !p.disabled);
  if(!selected)return null;
  const month=pills.indexOf(selected)+1;
  return month>=1&&month<=12?`2026-${String(month).padStart(2,'0')}`:null;
}
async function launch(action) {
  const period = currentPeriod();
  if (!period) {
    window.alert('Selecciona primero un mes con datos publicados.');
    return;
  }
  if (action === 'mail') {
    // Abrir la ventana durante el clic evita que el bloqueador de ventanas emergentes
    // interrumpa la navegación después de cargar los datos del informe.
    const draftWindow = window.open('about:blank', '_blank');
    if (!draftWindow) {
      window.alert('El navegador bloqueó la nueva ventana. Permite ventanas emergentes para este sitio y vuelve a intentarlo.');
      return;
    }
    try {
      draftWindow.opener = null;
      draftWindow.document.body.textContent = 'Preparando el borrador del informe en Gmail…';
      const report = await loadMonthlyReport(PROGRAM, period);
      draftWindow.location.replace(gmailDraftForReport(report));
    } catch (error) {
      draftWindow.close();
      window.alert(`No se pudo preparar el borrador de Gmail: ${error.message}`);
    }
    return;
  }
  const params = new URLSearchParams({ programa: PROGRAM, mes: period });
  window.open(`./informe.html?${params.toString()}`, '_blank', 'noopener,noreferrer');
}
function enhance(){
  if(!PROGRAM)return;
  const actions=document.querySelector('.aala-v2-actions, .aala-header-buttons');
  if(!actions||!actions.querySelector('#btnMail'))return;
  if(!actions.querySelector('#btnReport')){
    const btn=document.createElement('button');
    btn.type='button';btn.id='btnReport';btn.className='aala-v2-action aala-action';
    btn.textContent='Modo informe';btn.setAttribute('aria-label','Generar informe institucional del mes seleccionado');
    btn.addEventListener('click',()=>launch('report'));
    actions.querySelector('#btnMail').before(btn);
  }
  const mail=actions.querySelector('#btnMail');
  mail.setAttribute('aria-label','Abrir borrador del informe en Gmail');
  const label=mail.querySelector('span:last-child');
  if(label && label.textContent!=='Preparar correo en Gmail')label.textContent='Preparar correo en Gmail';
  else if(!mail.querySelector('svg') && mail.textContent!=='Preparar correo en Gmail')mail.textContent='Preparar correo en Gmail';
}
export function installReportActions(){
  if(!PROGRAM||typeof document==='undefined')return;
  document.addEventListener('click',event=>{
    const mail=event.target.closest?.('#btnMail');
    if(!mail)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    launch('mail');
  },true);
  let pending=false;
  const watcher=new MutationObserver(()=>{
    if(pending)return;pending=true;
    queueMicrotask(()=>{pending=false;enhance();});
  });
  const start=()=>{enhance();watcher.observe(document.body,{subtree:true,childList:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
}
