const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function monthLabel(month) {
  return `${MONTHS[Number(month) - 1] || 'Mes'} de 2026`;
}

export function mountHeader(element, handlers) {
  element.innerHTML = `
    <header class="header aala-header">
      <div class="aala-header-main">
        <a class="header-brand aala-header-brand" href="../index.html">
          <span class="brand-text"><span class="brand-kicker">Asociación Amigos del Lago de Atitlán</span><span class="brand-title">Atitlán Recicla · Tablero de programa</span></span>
        </a>
        <img class="aala-header-logo" src="./assets/logos/aala.png" alt="Logo Amigos del Lago de Atitlán" />
      </div>
      <div class="aala-header-row">
        <nav class="nav-tabs" aria-label="Navegación del programa">
          <a class="nav-tab active" href="#resumen">Resumen</a><a class="nav-tab" href="#annualGoalsGrid">Metas</a><a class="nav-tab" href="#kpiGrid">Indicadores</a><a class="nav-tab" href="#zoneBarPanel">Comparativo</a><a class="nav-tab" href="#diagnosticPanel">Diagnóstico</a>
        </nav>
        <div class="aala-header-buttons">
          <button class="aala-action aala-action-active" id="btnFull" type="button">Tablero completo</button>
          <button class="aala-action" id="btnExec" type="button">Resumen ejecutivo</button>
          <button class="aala-action" id="btnPresentation" type="button">Modo presentación</button>
          <button class="aala-action" id="btnMail" type="button">Enviar resumen por correo</button>
        </div>
      </div>
      <div class="aala-header-months"><span class="period-rack-label">Mes de lectura · 2026</span><div id="monthPills" class="month-pills aala-month-pills" role="group" aria-label="Seleccionar mes de 2026"></div></div>
    </header>`;
  element.querySelector('#btnFull').addEventListener('click', () => handlers.onView('full'));
  element.querySelector('#btnExec').addEventListener('click', () => handlers.onView('exec'));
  element.querySelector('#btnPresentation').addEventListener('click', handlers.onPresentation);
  element.querySelector('#btnMail').addEventListener('click', handlers.onMail);
  return {
    update({ month, available = [] }) {
      const list = new Set(available.map(Number));
      const rack = element.querySelector('#monthPills');
      rack.replaceChildren(...MONTHS.map((name, index) => {
        const n = index + 1;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `month-pill ${n === month ? 'active' : ''}`;
        button.textContent = name.slice(0, 3);
        button.title = `${name} 2026${list.has(n) ? '' : ' · Sin datos publicados'}`;
        button.setAttribute('aria-label', `${name} 2026`);
        button.setAttribute('aria-pressed', String(n === month));
        button.addEventListener('click', () => handlers.onMonth(n));
        if (!list.has(n)) button.classList.add('aala-month-pending');
        return button;
      }));
      element.querySelector('#btnFull').classList.toggle('aala-action-active', handlers.getView() === 'full');
      element.querySelector('#btnExec').classList.toggle('aala-action-active', handlers.getView() === 'exec');
    }
  };
}
