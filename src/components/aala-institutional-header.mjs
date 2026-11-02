import { aalaIcon } from './aala-icons.mjs';

const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const actions = [
  ['btnFull', 'Tablero completo', 'dashboard'],
  ['btnExec', 'Resumen ejecutivo', 'executive'],
  ['btnPresentation', 'Modo presentación', 'presentation'],
  ['btnMail', 'Enviar resumen por correo electrónico', 'mail']
];

export function mountInstitutionalHeader(mount, handlers, options={}) {
  const title = options.title || 'Tablero de programa';
  const nav = options.navigation || [];
  mount.innerHTML = `
    <header class="aala-v2-header" role="banner">
      <div class="aala-v2-header-top">
        <a class="aala-v2-logo-link" href="${options.homeHref || './index.html'}" aria-label="Volver al tablero institucional">
          <img class="aala-v2-logo" src="./assets/logos/aala.png" alt="Amigos del Lago de Atitlán" />
        </a>
        <div class="aala-v2-header-titles">
          <div>Asociación Amigos del Lago de Atitlán</div>
          <div>${title}</div>
        </div>
        <div class="aala-v2-header-balance" aria-hidden="true"></div>
      </div>
      <div class="aala-v2-controls">
        <div class="aala-v2-month-container">
          <span class="aala-v2-month-label" id="aalaMonthLabel">Período 2026</span>
          <div id="monthPills" class="month-pills aala-v2-months" role="group" aria-label="Seleccionar mes de 2026"></div>
        </div>
        <div class="aala-v2-actions" role="group" aria-label="Vistas y herramientas">
          ${actions.map(([id, label, icon], i) => `<button type="button" id="${id}" class="aala-v2-action${i===0?' aala-v2-active':''}" aria-pressed="${i===0?'true':'false'}">${aalaIcon(icon)}<span>${label}</span></button>`).join('')}
        </div>
      </div>
      <nav class="aala-v2-nav" aria-label="Secciones del programa">
        ${nav.map(({id,text}) => `<a href="#${id}" class="aala-v2-nav-link">${text}</a>`).join('')}
      </nav>
    </header>`;
  mount.querySelector('#btnFull').addEventListener('click', () => { handlers.onView?.('full'); updateView('full'); });
  mount.querySelector('#btnExec').addEventListener('click', () => { handlers.onView?.('exec'); updateView('exec'); });
  mount.querySelector('#btnPresentation').addEventListener('click', () => handlers.onPresentation?.());
  mount.querySelector('#btnMail').addEventListener('click', () => handlers.onMail?.());
  function updateView(view) {
    for (const [id] of actions.slice(0,2)) {
      const button = mount.querySelector(`#${id}`);
      const active = id === (view==='exec'?'btnExec':'btnFull');
      button.classList.toggle('aala-v2-active',active);
      button.setAttribute('aria-pressed',String(active));
    }
  }
  return {
    update({period,available=[]}={}) {
      const list = new Set(available);
      const rack = mount.querySelector('#monthPills');
      rack.replaceChildren(...months.map((name,i)=>{
        const key=`2026-${String(i+1).padStart(2,'0')}`;
        const button=document.createElement('button');
        button.type='button';
        button.className='month-pill'+(period===key?' active':'');
        button.textContent=name;
        button.disabled=!list.has(key);
        button.title=`${name} 2026`;
        button.setAttribute('aria-pressed',String(period===key));
        button.addEventListener('click',()=>handlers.onMonth?.(key));
        return button;
      }));
      updateView('full');
    }
  };
}
