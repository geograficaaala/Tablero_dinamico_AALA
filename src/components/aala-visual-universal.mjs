import { installReportActions } from '../reports/report-ui.mjs';
import { aalaIcon } from './aala-icons.mjs';
import { mountInstitutionalFooter } from './aala-institutional-footer.mjs';

const titles = {
  'atitlan-recicla.html': 'Atitlán Recicla',
  'conservando-atitlan.html': 'Conservando Atitlán',
  'fortalecimiento-municipal.html': 'Fortalecimiento Municipal',
  'educando-para-conservar.html': 'Educando para Conservar',
  'reforestando-atitlan.html': 'Reforestando Atitlán',
  'tul.html': 'Siembra de Tul'
};
const icons = { btnFull:'dashboard', btnExec:'executive', btnPresentation:'presentation', btnMail:'mail' };
const labels = { btnFull:'Tablero completo', btnExec:'Resumen ejecutivo', btnPresentation:'Modo presentación', btnMail:'Enviar resumen por correo electrónico' };

function enhanceHeader(header) {
  if (header.dataset.aalaVisualReady === 'true') return;
  const main = header.querySelector('.aala-header-main');
  const row = header.querySelector('.aala-header-row');
  const months = header.querySelector('.aala-header-months');
  const actions = header.querySelector('.aala-header-buttons');
  if (!main || !row || !months || !actions) return;
  const originalLogo = main.querySelector('img');
  const programName = titles[location.pathname.split('/').pop()] || 'Tablero dinámico';
  const logoLink = document.createElement('a');
  logoLink.href = './index.html';
  logoLink.className = 'aala-v2-logo-link';
  logoLink.setAttribute('aria-label','Ir al índice institucional');
  if (originalLogo) {
    originalLogo.className = 'aala-v2-logo';
    logoLink.append(originalLogo);
  }
  const names = document.createElement('div');
  names.className = 'aala-v2-header-titles';
  const association = document.createElement('div');
  association.textContent = 'Asociación Amigos del Lago de Atitlán';
  const program = document.createElement('div');
  program.textContent = programName;
  names.append(association,program);
  const blank = document.createElement('div');
  blank.className='aala-v2-header-balance';
  main.replaceChildren(logoLink,names,blank);
  main.className='aala-v2-header-top';
  const nav = row.querySelector('.nav-tabs');
  months.classList.add('aala-v2-month-container');
  months.querySelector('.period-rack-label')?.classList.add('aala-v2-month-label');
  months.querySelector('#monthPills')?.classList.add('aala-v2-months');
  actions.classList.add('aala-v2-actions');
  for (const [id,icon] of Object.entries(icons)) {
    const button=actions.querySelector('#'+id);
    if (!button) continue;
    button.classList.add('aala-v2-action');
    button.setAttribute('aria-label',labels[id]);
    button.replaceChildren();
    const badge=document.createElement('span');
    badge.innerHTML=aalaIcon(icon);
    badge.className='aala-v2-action-icon';
    const text=document.createElement('span');
    text.textContent=labels[id];
    button.append(badge,text);
  }
  row.replaceChildren(months,actions);
  row.className='aala-v2-controls';
  header.replaceChildren(main,row);
  if (nav) {
    nav.classList.add('aala-v2-nav');
    for (const link of nav.querySelectorAll('a')) link.classList.add('aala-v2-nav-link');
    header.append(nav);
  }
  header.classList.add('aala-v2-header');
  header.dataset.aalaVisualReady='true';
}

function enhanceFooter(footer) {
  if (footer.dataset.aalaVisualReady==='true') return;
  if (!footer.querySelector('.footer-wrap')) return;
  footer.dataset.aalaVisualReady='true';
  const box=document.createElement('div');
  mountInstitutionalFooter(box);
  const newFooter=box.querySelector('footer');
  if (!newFooter) return;
  footer.innerHTML=newFooter.innerHTML;
  footer.classList.add('aala-v2-footer');
}

function removeLabels() {
  for(const n of document.querySelectorAll('.fm-disclaimer'))n.remove();
  for(const n of document.querySelectorAll('.period-rack-label,.aala-v2-month-label')) {
    if (/mes[- _]2026\d/i.test(n.textContent||'')) n.textContent='Período 2026';
  }
}

function initShell() {
  document.querySelectorAll('.aala-header').forEach(enhanceHeader);
  document.querySelectorAll('footer.site-footer').forEach(enhanceFooter);
  removeLabels();
}

function refreshShell() {
  initShell();
  if (!document.querySelector('.aala-header') && !document.querySelector('.aala-v2-header') && !document.querySelector('.page.active')) return;
}

let scheduled=false;
function schedule() {
  if (scheduled) return;
  scheduled=true;
  queueMicrotask(()=>{scheduled=false;refreshShell();});
}

function animateNumber(node) {
  if (node.dataset.aalaAnimated==='true') return;
  const original=node.textContent.trim();
  if (!original || original.length>36 || node.children.length || !/\d/.test(original)) return;
  const match=original.match(/-?\d[\d,.]*(?:[.,]\d+)?/);
  if (!match) return;
  const raw=match[0];
  const sep=raw.lastIndexOf(',')>raw.lastIndexOf('.')?',':'.';
  let decimal=0;
  if (raw.includes(sep)) { const tail=raw.split(sep).pop(); if (tail.length<=2) decimal=tail.length; }
  const clean=raw.replace(/[^\d-]/g,'');
  const target=Number(clean)/(10**decimal);
  if (!Number.isFinite(target)||Math.abs(target)>1e12)return;
  node.dataset.aalaAnimated='true';
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const prefix=original.slice(0,match.index),suffix=original.slice(match.index+raw.length);
  const locale=new Intl.NumberFormat('es-GT',{minimumFractionDigits:decimal,maximumFractionDigits:decimal});
  const start=performance.now();
  const duration=650;
  function tick(now) {
    if (!node.isConnected) return;
    const t=Math.min(1,(now-start)/duration);
    const eased=1-Math.pow(1-t,3);
    node.textContent=prefix+locale.format(target*eased)+suffix;
    if(t<1)requestAnimationFrame(tick);
    else node.textContent=original;
  }
  requestAnimationFrame(tick);
}

const numericSelector='.kpi-value,.goal-value,.fm-kpi-value,.exec-kpi-value,.pkpi-value,.prep-value,.kpi-simple-value';
function scanNumbers(root) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll(numericSelector).forEach(animateNumber);
}
function main() {
  initShell();
  const watcher=new MutationObserver(schedule);
  watcher.observe(document.body,{childList:true,subtree:true});
  const region=document.querySelector('main') || document.querySelector('.wrap');
  if (region) {
    let updatePending=false;
    const numbers=new MutationObserver(()=>{
      if(updatePending)return;
      updatePending=true;
      requestAnimationFrame(()=>{updatePending=false;scanNumbers(region)});
    });
    numbers.observe(region,{childList:true,subtree:true});
    scanNumbers(region);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',main,{once:true});
else main();

installReportActions();
