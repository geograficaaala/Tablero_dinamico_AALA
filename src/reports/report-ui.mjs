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
function launch(action){
  const period=currentPeriod();
  if(!period){window.alert('Selecciona primero un mes con datos publicados.');return;}
  const params=new URLSearchParams({programa:PROGRAM,mes:period});
  if(action==='mail')params.set('accion','correo');
  const url=`./informe.html?${params.toString()}`;
  window.location.assign(url);
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
  mail.setAttribute('aria-label','Preparar informe por correo electrónico');
  const label=mail.querySelector('span:last-child');
  if(label && label.textContent!=='Enviar informe por correo')label.textContent='Enviar informe por correo';
  else if(!mail.querySelector('svg') && mail.textContent!=='Enviar informe por correo')mail.textContent='Enviar informe por correo';
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
