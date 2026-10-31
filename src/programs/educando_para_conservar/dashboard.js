const PATHS = {
  total: ['../data/educando_para_conservar/2026/total_mes.csv'],
  indicadores: ['../data/educando_para_conservar/2026/institucional_indicadores.csv'],
  metadata: ['../data/educando_para_conservar/2026/metadata_publicacion.csv']
};

    const COVERAGE_CONFIG = [
      {
        id: 'docentes_capacitados',
        label: 'Docentes',
        valueKey: 'docentes_mes',
        moduleKey: 'docentes',
        target: 121,
        targetLabel: 'docentes',
        coverageLabel: 'docentes'
      },
      {
        id: 'estudiantes_epc',
        label: 'Estudiantes',
        valueKey: 'estudiantes_epc_mes',
        moduleKey: 'estudiantes',
        target: 3514,
        targetLabel: 'estudiantes',
        coverageLabel: 'estudiantes'
      },
      {
        id: 'centros_cobertura',
        label: 'Centros educativos',
        valueKey: 'centros_mes',
        moduleKey: 'centros',
        target: 50,
        targetLabel: 'centros educativos',
        coverageLabel: 'centros educativos'
      },
      {
        id: 'municipios_actividad_pedagogica',
        label: 'Municipios',
        valueKey: 'municipios_mes',
        moduleKey: 'municipios',
        target: 13,
        targetLabel: 'municipios',
        coverageLabel: 'municipios'
      }
    ];

    const OP_CONFIG = [
      { id:'act_tul', key:'act_tul_mes', label:'Siembra y poda', start:3, end:12, target:1, window:'Marzo a diciembre' },
      { id:'act_giras', key:'act_giras_mes', label:'Giras educativas', start:3, end:9, target:4, window:'Marzo a septiembre' },
      { id:'act_ferias', key:'act_ferias_mes', label:'Ferias ambientales', start:2, end:12, target:2, window:'Febrero a diciembre' },
      { id:'act_huertos', key:'act_huertos_mes', label:'Huertos', start:4, end:9, target:2, window:'Abril a septiembre' },
      { id:'act_murales', key:'act_murales_mes', label:'Murales', start:4, end:5, target:2, window:'Abril a mayo' },
      { id:'act_limpiezas', key:'act_limpiezas_mes', label:'Jornadas de limpieza', start:2, end:10, target:3, window:'Febrero a octubre' },
      { id:'act_reforestacion', key:'act_reforestacion_mes', label:'Reforestaciones', start:6, end:8, target:7, window:'Junio a agosto' },
      { id:'act_monitoreo_reforestadas', key:'act_monitoreo_reforestadas_mes', label:'Monitoreo', start:10, end:12, target:4, window:'Octubre a diciembre' },
      { id:'act_proyectos_gestion', key:'act_proyectos_gestion_mes', label:'Proyectos de Gestión Ambiental Escolar', start:null, end:null, target:2, window:'Programado' }
    ];

    const PREP_CONFIG = [
      { key:'docentes_induccion_mes', label:'Docentes en inducción', window:'Preparación', unit:'docentes', narrative:value => `${fmt(value)} docentes alcanzados en jornadas de inducción y acercamiento previas al ciclo pedagógico.` },
      { key:'centros_induccion_mes', label:'Centros con inducción', window:'Preparación', unit:'centros', narrative:value => `${fmt(value)} centros con socialización del programa y alineación metodológica previa al desarrollo de módulos.` },
      { key:'estudiantes_diagnostico_mes', label:'Diagnóstico inicial', window:'Preparación', unit:'estudiantes', narrative:value => `${fmt(value)} estudiantes con diagnóstico inicial levantado para orientar la implementación pedagógica del programa.` },
      { key:'coordinaciones_clave_mes', label:'Reuniones clave', window:'Gestión', unit:'coordinaciones', narrative:value => `${fmt(value)} coordinaciones o reuniones clave registradas para articulación institucional y seguimiento mensual.` },
];

    const OP_ANNUAL_META = [
      { key:'act_tul_mes', label:'Siembra y poda de tul', annualTarget:10, window:'Marzo a diciembre', start:3, end:12, resultSuffix:'jornadas acumuladas' },
      { key:'act_giras_mes', label:'Giras educativas', annualTarget:24, window:'Marzo a septiembre', start:3, end:9, resultSuffix:'giras acumuladas' },
      { key:'act_ferias_mes', label:'Ferias ambientales', annualTarget:16, window:'Febrero a diciembre', start:2, end:12, resultSuffix:'ferias acumuladas' },
      { key:'act_huertos_mes', label:'Huertos escolares', annualTarget:8, window:'Abril a septiembre', start:4, end:9, resultSuffix:'huertos acumulados' },
      { key:'act_murales_mes', label:'Murales pedagógicos', annualTarget:4, window:'Abril a mayo', start:4, end:5, resultSuffix:'murales acumulados' },
      { key:'act_limpiezas_mes', label:'Jornadas de limpieza', annualTarget:24, window:'Febrero a octubre', start:2, end:10, resultSuffix:'jornadas acumuladas' },
      { key:'act_reforestacion_mes', label:'Reforestaciones', annualTarget:20, window:'Junio a agosto', start:6, end:8, resultSuffix:'reforestaciones acumuladas' },
      { key:'act_monitoreo_reforestadas_mes', label:'Monitoreo de áreas reforestadas', annualTarget:8, window:'Octubre a diciembre', start:10, end:12, resultSuffix:'monitoreos acumulados' },
      { key:'act_centros_acopio_mes', label:'Centros de acopio escolar', annualTarget:8, window:'Programado', start:null, end:null, resultSuffix:'centros de acopio acumulados' },
      { key:'act_proyectos_gestion_mes', label:'Proyectos de Gestión Ambiental Escolar', annualTarget:2, window:'Programado', start:null, end:null, resultSuffix:'proyectos acumulados' }
    ];

    const FIELD_ACTIVITY_CUMULATIVE_META = [
      { key:'actividades_campo_mes', label:'Actividades de campo totales', annualTarget:128, window:'Marzo a octubre', start:3, end:10, resultSuffix:'actividades de campo acumuladas' },
      ...OP_ANNUAL_META
    ];

    const ANNUAL_ACTUAL_OVERRIDES = {
      '2026-06': {
        act_tul_mes: 3,
        act_huertos_mes: 4,
        act_murales_mes: 5,
        act_proyectos_gestion_mes: 0
      },
      '2026-07': {
        act_tul_mes: 5,
        act_huertos_mes: 4,
        act_murales_mes: 5,
        act_proyectos_gestion_mes: 0
      },
      '2026-08': {
        act_tul_mes: 6,
        act_huertos_mes: 8,
        act_murales_mes: 5,
        act_centros_acopio_mes: 8,
        act_proyectos_gestion_mes: 2
      },
      '2026-09': { act_tul_mes:8, act_huertos_mes:8, act_murales_mes:5, act_centros_acopio_mes:8, act_proyectos_gestion_mes:2 }
    };

    const PEDAGOGICAL_MODULES = [
      { periodo_clave:'2026-03', number:1, name:'Medio ambiente', month:'marzo', docentes:121, estudiantes:3514, centros:50, municipios:13 },
      { periodo_clave:'2026-04', number:2, name:'El bosque', month:'abril', docentes:120, estudiantes:3487, centros:50, municipios:13 }
    ];

    const ACTIVE_VISITS_TOTAL = 7;
    const ACTIVE_START_MONTH = 3;
    const ACTIVE_END_MONTH = 9;

    // Diplomado juvenil 2026: 2 cohortes · 60 estudiantes por cohorte · 5 módulos + 1 presentación final por cohorte.
    // El avance anual de estudiantes se reconoce por sostenimiento dentro de las sesiones de cada cohorte, no por sumar estudiantes cada mes.
    const DIPLOMA_ANNUAL_STUDENTS = 120;
    const DIPLOMA_COHORT_SIZE = 60;
    const DIPLOMA_COHORT_SIZES = { 1:60, 2:64 };
    const DIPLOMA_SESSIONS_PER_COHORT = 6;
    const DIPLOMA_ANNUAL_SESSIONS = 12;
    const DIPLOMA_SESSIONS = [
      { period:'2026-03', cohort:1, type:'módulo', label:'Módulo 1' },
      { period:'2026-03', cohort:1, type:'módulo', label:'Módulo 2' },
      { period:'2026-04', cohort:1, type:'módulo', label:'Módulo 3' },
      { period:'2026-05', cohort:1, type:'módulo', label:'Módulo 4' },
      { period:'2026-05', cohort:1, type:'módulo', label:'Módulo 5' },
      { period:'2026-06', cohort:1, type:'presentación final', label:'Presentación final' },
      { period:'2026-07', cohort:2, type:'módulo', label:'Módulo 1' },
      { period:'2026-07', cohort:2, type:'módulo', label:'Módulo 2' },
      { period:'2026-08', cohort:2, type:'módulo', label:'Módulo 3' },
      { period:'2026-08', cohort:2, type:'módulo', label:'Módulo 4' },
      { period:'2026-09', cohort:2, type:'módulo', label:'Módulo 5' },
      { period:'2026-09', cohort:2, type:'presentación final', label:'Presentación final' }
    ];

    const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    const state = { periodo:'', data:{ total:[], indicadores:[], metadata:[] } };

    const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const fmt = (n,d=0) => new Intl.NumberFormat('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}).format(Number(n)||0);
    const displayCoordinacionesClave = row => String(row.coordinaciones_clave_texto || '').trim() || fmt(row.coordinaciones_clave_mes || 0);
    const fmtPct = v => `${fmt((Number(v)||0)*100, 2)}%`;
    const isTrue = v => v===true || v===1 || String(v ?? '').trim().toLowerCase()==='true' || String(v ?? '').trim()==='1';
    const monthName = m => MONTHS[Math.max(0,Math.min(11, Number(m)-1))] || '—';

    function monthSpan(start, end){
      return `${monthName(start)} a ${monthName(end)}`;
    }

    function normalizeRow(row){
      const out={};
      Object.keys(row||{}).forEach(k=>{
        const raw=row[k];
        const value=typeof raw==='string' ? raw.trim() : raw;
        const maybeNum=Number(String(value).replace(/,/g,''));
        out[k] = value!=='' && !Number.isNaN(maybeNum) ? maybeNum : value;
      });
      return out;
    }

    async function fetchCsv(candidates){
      let lastErr = null;
      for(const url of candidates){
        try{
          const resp = await fetch(url, { cache:'no-store' });
          if(!resp.ok) continue;
          const text = await resp.text();
          const parsed = Papa.parse(text, { header:true, skipEmptyLines:'greedy' });
          return (parsed.data || []).map(normalizeRow);
        }catch(err){
          lastErr = err;
        }
      }
      throw lastErr || new Error('No se pudo cargar el CSV.');
    }

    function buildPills(rows){
      const mount = document.getElementById('monthPills');
      mount.innerHTML='';
      const available = new Map(
        rows
          .filter(r => isTrue(r.tiene_datos_mes))
          .map(r => [Number(r.mes_num), r])
      );
      const shortMonths = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      shortMonths.forEach((label, index) => {
        const monthNumber = index + 1;
        const row = available.get(monthNumber);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'month-pill'
          + (row && !isTrue(row.aporta_metas_epc) ? ' planif' : '')
          + (row && row.periodo_clave===state.periodo ? ' active' : '');
        btn.textContent = label;
        btn.disabled = !row;
        btn.setAttribute('aria-label', row ? `${monthName(monthNumber)} ${row.anio || ''}`.trim() : `${monthName(monthNumber)} sin datos publicados`);
        if(row){
          btn.onclick = () => {
            state.periodo = row.periodo_clave;
            document.querySelectorAll('.month-pill').forEach(el=>el.classList.remove('active'));
            btn.classList.add('active');
            renderAll();
          };
        }
        mount.appendChild(btn);
      });
    }

    function animateMetricValue(node){
      if(!node) return;
      const target=Number(node.dataset.value);
      if(!Number.isFinite(target)) return;
      const prefix=node.dataset.prefix||'';
      const suffix=node.dataset.suffix||'';
      const decimals=Number(node.dataset.decimals||0);
      const start=performance.now();
      const duration=380;
      function step(now){
        const t=Math.min(1,(now-start)/duration);
        const eased=1-Math.pow(1-t,3);
        const value=target*eased;
        const formatted=new Intl.NumberFormat('en-US',{minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(value);
        node.innerHTML='<span>'+((prefix+formatted).trim())+'</span>'+(suffix?'<span class="kpi-unit-inline">'+suffix+'</span>':'');
        if(t<1) requestAnimationFrame(step);
      }
      node.innerHTML='<span>'+((prefix+'0').trim())+'</span>'+(suffix?'<span class="kpi-unit-inline">'+suffix+'</span>':'');
      requestAnimationFrame(step);
    }

    function splitDisplayValue(text){
      const raw=String(text||'').trim();
      const match=raw.match(/^([^0-9-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
      if(!match) return { prefix:'', number:null, suffix:'', text:raw, decimals:0 };
      const num=Number(match[2].replace(/,/g,''));
      const decimals=(match[2].split('.')[1]||'').length;
      return { prefix:(match[1]||'').trim(), number:num, suffix:(match[3]||'').trim(), text:raw, decimals };
    }

    function clampPct(value){
      return Math.max(0, Math.min(Number(value)||0, 1));
    }

    function greenToneFromProgress(status, progress){
      const p = Math.max(0, Math.min(Number(progress)||0, 1));
      if(status==='pending') return 'tone-green-0';
      if(p >= .85) return 'tone-green';
      if(p >= .50) return 'tone-green-3';
      if(p >= .25) return 'tone-green-2';
      if(p > 0) return 'tone-green-1';
      return 'tone-green-0';
    }

    function toneFromProgress(status, progress){
      return greenToneFromProgress(status, progress);
    }

    function badgeText(status, progress){
      if(status==='pending') return 'Programado';
      if(status==='closed') return 'Ventana cerrada';
      return '';
    }

    function periodRow(){
      return state.data.total.find(r => r.periodo_clave===state.periodo) || {};
    }

    function indicatorsForPeriod(){
      return state.data.indicadores.filter(r => r.periodo_clave===state.periodo);
    }

    function activeCoverageModuleProgress(cfg, period){
      const target = Number(cfg.target || 0);
      const rows=(state.data.total||[])
        .filter(r => isTrue(r.tiene_datos_mes))
        .filter(r => String(r.periodo_clave) <= String(period))
        .filter(r => Number(r.mes_num) >= ACTIVE_START_MONTH && Number(r.mes_num) <= ACTIVE_END_MONTH);
      const progress = rows.reduce((acc, r) => {
        const actual = Number(r[cfg.valueKey] || 0);
        if(target > 0) return acc + Math.min(actual / target, 1);
        return acc + (actual > 0 ? 1 : 0);
      }, 0);
      return Math.max(0, Math.min(progress, ACTIVE_VISITS_TOTAL));
    }

    function coverageModuleLabel(value){
      const v = Math.max(0, Math.min(Number(value) || 0, ACTIVE_VISITS_TOTAL));
      if(v <= 0) return `0 de ${ACTIVE_VISITS_TOTAL} módulos`;
      const rounded = Math.round(v);
      if(Math.abs(v - rounded) < 0.01) return `${rounded} de ${ACTIVE_VISITS_TOTAL} módulos`;
      const next = Math.ceil(v);
      if(next <= ACTIVE_VISITS_TOTAL && (next - v) <= 0.10) return `Casi ${next} de ${ACTIVE_VISITS_TOTAL} módulos`;
      return `${fmt(v, 2)} de ${ACTIVE_VISITS_TOTAL} módulos`;
    }

    function diplomaSessionsUpTo(period){
      return DIPLOMA_SESSIONS.filter(item => String(item.period) <= String(period));
    }

    function diplomaSessionsInPeriod(period){
      return DIPLOMA_SESSIONS.filter(item => String(item.period) === String(period));
    }

    function diplomaCompletedByCohort(period, cohort){
      return diplomaSessionsUpTo(period).filter(item => Number(item.cohort) === Number(cohort)).length;
    }

    function diplomaCurrentCohort(period){
      const inMonth = diplomaSessionsInPeriod(period);
      if(inMonth.length) return inMonth[0].cohort;
      const completed = diplomaSessionsUpTo(period);
      if(!completed.length) return 1;
      return completed[completed.length - 1].cohort;
    }

    function diplomaProgressLabel(period){
      const totalCompleted = diplomaSessionsUpTo(period).length;
      const c1 = diplomaCompletedByCohort(period, 1);
      const c2 = diplomaCompletedByCohort(period, 2);
      if(totalCompleted <= 0) return 'Programado para iniciar';
      if(c1 < DIPLOMA_SESSIONS_PER_COHORT) return `Cohorte 1: ${c1} de ${DIPLOMA_SESSIONS_PER_COHORT} sesiones completadas`;
      if(c2 <= 0) return 'Cohorte 1 completada';
      if(c2 < DIPLOMA_SESSIONS_PER_COHORT) return `Cohorte 2: ${c2} de ${DIPLOMA_SESSIONS_PER_COHORT} sesiones completadas`;
      return 'Cohortes 1 y 2 completadas';
    }

    function diplomaStudentMainText(period){
      if(String(period)==='2026-09') return `${fmt(135)} estudiantes formados`;
      const totalCompleted = diplomaSessionsUpTo(period).length;
      const c1 = diplomaCompletedByCohort(period, 1);
      const c2 = diplomaCompletedByCohort(period, 2);
      if(totalCompleted <= 0) return 'Programado';
      if(c1 < DIPLOMA_SESSIONS_PER_COHORT) return `${fmt(DIPLOMA_COHORT_SIZE)} estudiantes en formación`;
      if(c2 <= 0) return `${fmt(DIPLOMA_COHORT_SIZE)} estudiantes formados`;
      if(c2 < DIPLOMA_SESSIONS_PER_COHORT) return `${fmt(DIPLOMA_ANNUAL_STUDENTS)} estudiantes en formación`;
      return `${fmt(DIPLOMA_ANNUAL_STUDENTS)} estudiantes formados`;
    }

    function diplomaCohortSize(cohort){
      return Number(DIPLOMA_COHORT_SIZES[Number(cohort)] || DIPLOMA_COHORT_SIZE);
    }

    function diplomaMonthlyStudentMainText(period){
      if(String(period)==='2026-09') return `${fmt(68)} estudiantes formados`;
      const sessions = diplomaSessionsInPeriod(period);
      if(!sessions.length) return 'Programado';
      const cohort = sessions[0].cohort;
      const completedInCohort = diplomaCompletedByCohort(period, cohort);
      const isFinalSessionMonth = completedInCohort >= DIPLOMA_SESSIONS_PER_COHORT && sessions.some(item => item.type === 'presentación final');
      return `${fmt(diplomaCohortSize(cohort))} estudiantes ${isFinalSessionMonth ? 'formados' : 'en formación'}`;
    }

    function sessionUnit(count){
      return Number(count) === 1 ? 'sesión' : 'sesiones';
    }

    function completedSessionUnit(count){
      return Number(count) === 1 ? 'sesión completada' : 'sesiones completadas';
    }

    function diplomaAnnualStudentKpiData(row){
      const completed = diplomaSessionsUpTo(state.periodo).length;
      const pct = DIPLOMA_ANNUAL_SESSIONS > 0 ? completed / DIPLOMA_ANNUAL_SESSIONS : 0;
      const status = completed > 0 ? 'active' : 'pending';
      const complianceText = completed > 0 ? fmtPct(pct) : 'Programado';
      return {
        label:'Estudiantes del diplomado',
        tone: greenToneFromProgress(status, pct),
        customHtml: `
          <div class="annual-clear">
            <div class="annual-clear-label">Estudiantes del diplomado</div>
            <div class="annual-clear-main">
              <strong>${esc(diplomaStudentMainText(state.periodo))}</strong>
            </div>
            <div class="annual-clear-lines">
              <div class="annual-clear-row"><span>Meta anual</span><strong>${fmt(DIPLOMA_ANNUAL_STUDENTS)} estudiantes</strong></div>
              <div class="annual-clear-row"><span>Avance del diplomado</span><strong>${esc(diplomaProgressLabel(state.periodo))}</strong></div>
              <div class="annual-clear-row"><span>Cumplimiento acumulado de meta anual</span><strong>${esc(complianceText)}</strong></div>
            </div>
            <div class="annual-clear-progress" aria-hidden="true"><span style="width:${Math.max(0, Math.min(pct * 100, 100))}%"></span></div>
          </div>`
      };
    }

    function diplomaAnnualSessionsKpiData(row){
      const completed = diplomaSessionsUpTo(state.periodo).length;
      const pct = DIPLOMA_ANNUAL_SESSIONS > 0 ? completed / DIPLOMA_ANNUAL_SESSIONS : 0;
      const status = completed > 0 ? 'active' : 'pending';
      const complianceText = completed > 0 ? fmtPct(pct) : 'Programado';
      return {
        label:'Módulos del diplomado',
        tone: greenToneFromProgress(status, pct),
        customHtml: `
          <div class="annual-clear">
            <div class="annual-clear-label">Módulos del diplomado</div>
            <div class="annual-clear-main">
              <strong>${completed > 0 ? `${fmt(completed)} ${esc(completedSessionUnit(completed))}` : 'Programado'}</strong>
            </div>
            <div class="annual-clear-lines">
              <div class="annual-clear-row"><span>Meta anual</span><strong>${fmt(DIPLOMA_ANNUAL_SESSIONS)} sesiones</strong></div>
              <div class="annual-clear-row"><span>Avance del diplomado</span><strong>${esc(diplomaProgressLabel(state.periodo))}</strong></div>
              <div class="annual-clear-row"><span>Cumplimiento acumulado de meta anual</span><strong>${esc(complianceText)}</strong></div>
            </div>
            <div class="annual-clear-progress" aria-hidden="true"><span style="width:${Math.max(0, Math.min(pct * 100, 100))}%"></span></div>
          </div>`
      };
    }

    function diplomaAnnualKpis(row){
      return [diplomaAnnualStudentKpiData(row), diplomaAnnualSessionsKpiData(row)];
    }

    function diplomaMonthlyStudentKpiData(row){
      const sessions = diplomaSessionsInPeriod(state.periodo);
      const isActive = sessions.length > 0;
      const progress = isActive ? 1 : 0;
      const cohort = isActive ? sessions[0].cohort : diplomaCurrentCohort(state.periodo);
      const cohortSize = state.periodo==='2026-09' ? 68 : diplomaCohortSize(cohort);
      const monthlyTarget = DIPLOMA_COHORT_SIZE;
      const monthlyProgress = isActive && monthlyTarget > 0 ? cohortSize / monthlyTarget : 0;
      return {
        label:'Estudiantes del diplomado',
        window:'',
        hideWindow:true,
        tone: greenToneFromProgress(isActive ? 'active' : 'pending', monthlyProgress),
        chip: isActive ? `Cohorte ${cohort}` : '',
        valueText: diplomaMonthlyStudentMainText(state.periodo),
        reference: isActive ? `Meta mensual <strong>${fmt(monthlyTarget)} estudiantes sostenidos</strong>` : 'Estado <strong>Programado</strong>',
        line1:'',
        line2: isActive ? `Cumplimiento de meta mensual: <strong>${fmtPct(monthlyProgress)}</strong>` : '',
        progressWidth: Math.min(monthlyProgress, 1) * 100,
        pillarHeight: Math.max(8, Math.min(monthlyProgress, 1) * 100)
      };
    }

    function diplomaMonthlySessionsKpiData(row){
      const sessions = diplomaSessionsInPeriod(state.periodo);
      const actual = sessions.length;
      const isActive = actual > 0;
      const hasPresentation = sessions.some(item => item.type === 'presentación final');
      const label = hasPresentation && actual === 1 ? '1 presentación final' : `${fmt(actual)} ${esc(completedSessionUnit(actual))}`;
      return {
        label:'Módulos del diplomado',
        window:'',
        hideWindow:true,
        tone: greenToneFromProgress(isActive ? 'active' : 'pending', isActive ? 1 : 0),
        chip: isActive ? `Cohorte ${sessions[0].cohort}` : '',
        valueText: isActive ? label : 'Programado',
        reference: isActive ? `Meta mensual <strong>${fmt(actual)} ${esc(sessionUnit(actual))}</strong>` : 'Estado <strong>Programado</strong>',
        line1:'',
        line2: isActive ? 'Cumplimiento de meta mensual: <strong>100.00%</strong>' : '',
        progressWidth: isActive ? 100 : 0,
        pillarHeight: isActive ? 100 : 8
      };
    }

    function diplomaMonthlyKpis(row){
      return [diplomaMonthlyStudentKpiData(row), diplomaMonthlySessionsKpiData(row)];
    }

    function coverageKpiData(cfg, row){
      const monthNum = Number(row.mes_num || 0);
      const moduleProgress = activeCoverageModuleProgress(cfg, state.periodo);
      const pct = moduleProgress / ACTIVE_VISITS_TOTAL;
      const currentValue = Number(row[cfg.valueKey] || 0);
      const unit = cfg.coverageLabel || cfg.targetLabel || '';
      const status = monthNum < ACTIVE_START_MONTH ? 'pending' : (monthNum > ACTIVE_END_MONTH ? 'closed' : 'active');
      const tone = greenToneFromProgress(status, pct);

      return {
        label: cfg.label,
        window: '',
        hideWindow: true,
        tone,
        chip: status==='pending' && moduleProgress===0 ? 'Programado' : `Avance de cobertura EPC: ${coverageModuleLabel(moduleProgress)}`,
        valueText: fmtPct(pct),
        reference: currentValue>0 ? `Cobertura del mes seleccionado <strong>${fmt(currentValue)} ${esc(unit)}</strong>` : 'Cobertura del mes seleccionado <strong>sin registro</strong>',
        line1: '',
        line2: '',
        progressWidth: pct*100,
        pillarHeight: Math.max(8, pct*100)
      };
    }


    function coverageMonthlyKpiData(cfg, row){
      const monthNum = Number(row.mes_num || 0);
      const actual = Number(row[cfg.valueKey] || 0);
      const target = Number(cfg.target || 0);
      const progress = target > 0 ? actual / target : 0;
      const status = monthNum < ACTIVE_START_MONTH ? 'pending' : (monthNum > ACTIVE_END_MONTH ? 'closed' : 'active');
      const tone = greenToneFromProgress(status, progress);
      const unit = cfg.coverageLabel || cfg.targetLabel || '';
      const reference = target > 0
        ? `Meta mensual <strong>${fmt(target)} ${esc(cfg.targetLabel || unit)}</strong>`
        : 'Sin meta mensual oficial';
      return {
        label: cfg.label,
        window: '',
        hideWindow: true,
        tone,
        chip: '',
        valueText: `${fmt(actual)} ${unit}`.trim(),
        reference,
        line1: '',
        line2: target > 0 ? `Cumplimiento de meta mensual: <strong>${fmtPct(progress)}</strong>` : '',
        progressWidth: Math.min(progress, 1) * 100,
        pillarHeight: Math.max(8, Math.min(progress, 1) * 100)
      };
    }

    function operationalKpiData(cfg, row){
      const monthNum = Number(row.mes_num || 0);
      const actual = Number(row[cfg.key] || 0);
      const annualCfg = OP_ANNUAL_META.find(item => item.key === cfg.key);
      const annualActual = annualCfg ? annualActualValue(cfg.key, row.periodo_clave || state.periodo) : 0;
      const annualTarget = Number(annualCfg?.annualTarget || 0);
      const annualGoalReached = cfg.id === 'act_murales' && monthNum >= 7 && annualTarget > 0 && annualActual >= annualTarget;
      if(annualGoalReached){
        return {
          label: cfg.label,
          window: '',
          hideWindow: true,
          tone: 'tone-green',
          chip: '',
          valueText: 'Meta anual alcanzada',
          reference: `Acumulado anual <strong>${fmt(annualActual)} murales</strong>`,
          line1: '',
          line2: '',
          progressWidth: 100,
          pillarHeight: 100
        };
      }
      const noCompletedProjects = cfg.id === 'act_proyectos_gestion' && monthNum >= 7 && actual === 0;
      if(noCompletedProjects){
        return {
          label: cfg.label,
          window: '',
          hideWindow: true,
          tone: 'tone-green-0',
          chip: '',
          valueText: '0 actividades',
          reference: 'Proyectos ejecutados <strong>0</strong>',
          line1: '',
          line2: 'Las entregas preparatorias no se contabilizan como proyectos ejecutados.',
          progressWidth: 0,
          pillarHeight: 8
        };
      }
      const startMonth = cfg.start;
      const endMonth = cfg.end;
      const hasWindow = Number.isFinite(Number(startMonth)) && Number.isFinite(Number(endMonth));
      const status = !hasWindow ? 'pending' : (monthNum < startMonth ? 'pending' : (monthNum > endMonth ? 'closed' : 'active'));
      const progress = cfg.target > 0 ? actual / cfg.target : 0;
      const tone = toneFromProgress(status, progress);
      const isPendingWithoutResult = status === 'pending' && actual === 0;
      const reference = isPendingWithoutResult
        ? 'Estado <strong>Programado</strong>'
        : `Meta mensual <strong>${fmt(cfg.target)} actividades</strong>`;

      return {
        label: cfg.label,
        window: '',
        hideWindow: true,
        tone,
        chip: '',
        valueText: isPendingWithoutResult ? 'Programado' : `${fmt(actual)} actividades`,
        reference,
        line1: '',
        line2: isPendingWithoutResult ? '' : `Cumplimiento de meta mensual: <strong>${fmtPct(progress)}</strong>`,
        progressWidth: Math.min(progress, 1) * 100,
        pillarHeight: Math.max(8, Math.min(progress, 1) * 100)
      };
    }

    function renderKpiCard(data, index){
      if(String(data.customHtml || '').trim()){
        return `
        <article class="card kpi annual-kpi ${data.tone}" style="--delay:${index*80}ms">
          <div class="kpi-custom">${data.customHtml}</div>
        </article>`;
      }

      const parts=splitDisplayValue(data.valueText);
      const windowMarkup = data.hideWindow || !String(data.window || '').trim() ? '' : `<div class="kpi-window">${esc(data.window)}</div>`;
      const chipMarkup = String(data.chip || '').trim() ? `<div class="kpi-achieved">${esc(data.chip)}</div>` : '';
      const line1Markup = String(data.line1 || '').trim() ? `<div class="kpi-meta">${data.line1}</div>` : '';
      const line2Markup = String(data.line2 || '').trim() ? `<div class="kpi-meta">${data.line2}</div>` : '';
      const readingsMarkup = (line1Markup || line2Markup) ? `<div class="kpi-readings">${line1Markup}${line2Markup}</div>` : '';
      return `
        <article class="card kpi ${data.tone}" style="--delay:${index*80}ms">
          <div class="kpi-top">
            <div class="kpi-label">${esc(data.label)}</div>
            ${windowMarkup}
          </div>
          <div class="kpi-figure">
            <div class="kpi-pillar" aria-hidden="true">
              <span class="kpi-pillar-track"></span>
              <span class="kpi-pillar-fill" data-height="${Math.max(8, Math.min(data.pillarHeight, 100))}%"></span>
            </div>
            <div class="kpi-reading">
              <div class="kpi-value" data-value="${parts.number!=null ? parts.number : ''}" data-prefix="${esc(parts.prefix)}" data-suffix="${esc(parts.suffix)}" data-decimals="${parts.decimals}">${esc(parts.text)}</div>
              ${chipMarkup}
              <div class="kpi-reference">${data.reference}</div>
            </div>
          </div>
          ${readingsMarkup}
          <div class="kpi-progress-line"><span data-width="${Math.max(0, Math.min(data.progressWidth, 100))}"></span></div>
        </article>`;
    }


    function preparationIndicatorData(cfg, row){
      const pendingText = cfg.key === 'coordinaciones_clave_mes' ? String(row.coordinaciones_clave_texto || '').trim() : '';
      if(pendingText){
        return {
          label: cfg.label,
          window: cfg.window,
          valueText: pendingText,
          rawValue: '',
          unit: cfg.unit,
          line1: 'Información pendiente de actualización para este indicador complementario.',
          line2: '',
          progressWidth: 12
        };
      }
      const value = Number(row[cfg.key] || 0);
      if(!(value > 0)) return null;
      const totalRows = PREP_CONFIG.map(item => Number(row[item.key] || 0));
      const maxValue = Math.max(1, ...totalRows);
      const pct = Math.min(100, (value / maxValue) * 100);
      const line2 = '';
      return {
        label: cfg.label,
        window: cfg.window,
        valueText: fmt(value),
        rawValue: value,
        unit: cfg.unit,
        line1: cfg.narrative(value, row),
        line2,
        progressWidth: Math.max(12, pct)
      };
    }

    function preparationCardsMarkup(row){
      const cards = PREP_CONFIG
        .map(cfg => preparationIndicatorData(cfg, row))
        .filter(Boolean)
        .map((item, index) => `
          <article class="prep-card" style="--delay:${index*70}ms">
            <div class="prep-top">
              <div class="prep-label">${esc(item.label)}</div>
              <div class="prep-chip">${esc(item.window)}</div>
            </div>
            <div class="prep-value" data-value="${item.rawValue}" data-prefix="" data-suffix="" data-decimals="0">${esc(item.valueText)}</div>
            <div class="prep-copy">
              <div class="prep-line">${esc(item.line1)}</div>
            </div>
            <div class="prep-progress"><span data-width="${item.progressWidth}"></span></div>
          </article>`)
        .join('');

      if(!cards) return '';
      return `
        <section class="section present-slide" id="preparacion">
          <div class="section-head">
            <div>
              <div class="section-title">Indicadores complementarios del presente mes</div>
            </div>
          </div>
          <div class="prep-grid">${cards}</div>
        </section>`;
    }

    function cumulativeValueForPeriod(key, period){
      return (state.data.total || [])
        .filter(r => isTrue(r.tiene_datos_mes))
        .filter(r => String(r.periodo_clave) <= String(period))
        .reduce((acc, r) => acc + Number(r[key] || 0), 0);
    }

    function annualActualValue(key, period){
      const periodOverrides = ANNUAL_ACTUAL_OVERRIDES[String(period)] || {};
      if(Object.prototype.hasOwnProperty.call(periodOverrides, key)){
        return Number(periodOverrides[key] || 0);
      }
      return cumulativeValueForPeriod(key, period);
    }

    function annualOperationalStatus(cfg, row){
      const monthNum = Number(row.mes_num || 0);
      if(cfg.start == null || cfg.end == null) return 'pending';
      if(monthNum < Number(cfg.start)) return 'pending';
      if(monthNum > Number(cfg.end)) return 'closed';
      return 'active';
    }

    function annualOperationalRows(row){
      return OP_ANNUAL_META.map(cfg => {
        const actual = annualActualValue(cfg.key, state.periodo);
        const rawPct = cfg.annualTarget > 0 ? actual / cfg.annualTarget : 0;
        const status = annualOperationalStatus(cfg, row);
        const pct = status === 'pending' ? null : rawPct;
        const visualPct = status === 'pending' ? 0 : clampPct(rawPct);
        const window = cfg.window;
        return { ...cfg, window, actual, rawPct, pct, visualPct, status };
      });
    }

    function annualOperationalTooltip(item){
      const pctLabel = item.pct == null ? 'Pendiente de activación' : fmtPct(item.pct);
      const statusText = item.status==='pending'
        ? `Programado. La ventana válida inicia en ${item.window.toLowerCase()}.`
        : item.status==='closed'
          ? `Ventana mensual cerrada para ${item.window.toLowerCase()}.`
          : `Lectura acumulada al presente mes dentro de la ventana ${item.window.toLowerCase()}.`;
      return `<strong>${esc(item.label)}</strong>Acumulado registrado: ${fmt(item.actual)}<br>Meta anual: ${fmt(item.annualTarget)}<br>Avance acumulado al presente mes: ${esc(pctLabel)}<br>${esc(statusText)}`;
    }

    function chartStatusMeta(item){
      if(item.status === 'pending'){
        return {
          badge: 'Programado',
          label: 'Ventana válida',
          value: item.window,
          detail: `Se activa cuando el período seleccionado entre en ${item.window.toLowerCase()}.`
        };
      }
      if(item.status === 'closed'){
        return {
          badge: 'Ventana cerrada',
          label: 'Avance final leído',
          value: fmtPct(item.pct),
          detail: `Se registró ${fmt(item.actual)} de ${fmt(item.annualTarget)} al cierre de su ventana operativa.`
        };
      }
      return {
        badge: 'Activo',
        label: 'Avance acumulado',
        value: fmtPct(item.pct),
        detail: `${fmt(item.actual)} de ${fmt(item.annualTarget)} registrados al presente mes.`
      };
    }

    function operationalMonthlyRowsForPeriod(key, period){
      return (state.data.total || [])
        .filter(r => isTrue(r.tiene_datos_mes))
        .filter(r => String(r.periodo_clave) <= String(period))
        .sort((a,b)=>String(a.periodo_clave).localeCompare(String(b.periodo_clave)))
        .map(r => ({
          periodo: String(r.periodo_clave || ''),
          month: monthName(r.mes_num),
          value: Number(r[key] || 0)
        }));
    }

    function annualBaseUnit(unitText){
      const cleaned = String(unitText || 'actividades')
        .replace(/\s+acumulad[oa]s?$/i,'')
        .trim();
      return cleaned || String(unitText || 'actividades');
    }

    function unitForCount(unitText, count){
      const n = Number(count) || 0;
      if(Math.abs(n) !== 1) return unitText;
      return String(unitText || '')
        .replace(/^jornadas\b/i,'jornada')
        .replace(/^giras\b/i,'gira')
        .replace(/^ferias\b/i,'feria')
        .replace(/^huertos\b/i,'huerto')
        .replace(/^murales\b/i,'mural')
        .replace(/^reforestaciones\b/i,'reforestación')
        .replace(/^monitoreos\b/i,'monitoreo')
        .replace(/^centros de acopio\b/i,'centro de acopio')
        .replace(/^proyectos\b/i,'proyecto');
    }

    function coverageAnnualKpiData(cfg, row){
      const monthNum = Number(row.mes_num || 0);
      const actual = Number(row[cfg.valueKey] || 0);
      const target = Number(cfg.target || 0);
      const unit = cfg.coverageLabel || cfg.targetLabel || '';
      const moduleProgress = activeCoverageModuleProgress(cfg, state.periodo);
      const pct = moduleProgress / ACTIVE_VISITS_TOTAL;
      const status = monthNum < ACTIVE_START_MONTH ? 'pending' : (monthNum > ACTIVE_END_MONTH ? 'closed' : 'active');
      const tone = greenToneFromProgress(status, pct);
      const complianceText = status === 'pending' && moduleProgress === 0 ? 'Programado' : fmtPct(pct);
      const progressWidth = status === 'pending' && moduleProgress === 0 ? 0 : Math.min(pct, 1) * 100;

      return {
        label: cfg.label,
        tone,
        customHtml: `
          <div class="annual-clear">
            <div class="annual-clear-label">${esc(cfg.label)}</div>
            <div class="annual-clear-main">
              <strong>${fmt(actual)} ${esc(unit)}</strong>
            </div>
            <div class="annual-clear-lines">
              <div class="annual-clear-row"><span>Meta anual de cobertura</span><strong>${fmt(target)} ${esc(unit)}</strong></div>
              <div class="annual-clear-row"><span>Avance de cobertura EPC</span><strong>${esc(coverageModuleLabel(moduleProgress))}</strong></div>
              <div class="annual-clear-row"><span>Cumplimiento acumulado de meta anual</span><strong>${esc(complianceText)}</strong></div>
            </div>
            <div class="annual-clear-progress" aria-hidden="true"><span style="width:${Math.max(0, Math.min(progressWidth, 100))}%"></span></div>
          </div>`
      };
    }

    function operationalAnnualKpiData(cfg, row){
      const actual = annualActualValue(cfg.key, state.periodo);
      const target = Number(cfg.annualTarget || 0);
      const pct = target > 0 ? actual / target : 0;
      const status = annualOperationalStatus(cfg, row);
      const tone = greenToneFromProgress(status, pct);
      const baseUnit = annualBaseUnit(cfg.resultSuffix || 'actividades acumuladas');
      const actualUnit = unitForCount(baseUnit, actual);
      const targetUnit = unitForCount(baseUnit, target);
      const annualGoalReached = cfg.key === 'act_murales_mes' && Number(row.mes_num || 0) >= 7 && target > 0 && actual >= target;
      const complianceText = annualGoalReached
        ? 'Meta anual alcanzada'
        : (status === 'pending' && actual === 0 ? 'Programado' : fmtPct(pct));
      const progressWidth = status === 'pending' && actual === 0 ? 0 : Math.min(pct, 1) * 100;

      return {
        label: cfg.label,
        tone,
        customHtml: `
          <div class="annual-clear">
            <div class="annual-clear-label">${esc(cfg.label)}</div>
            <div class="annual-clear-main">
              <strong>${fmt(actual)} ${esc(actualUnit)}</strong>
            </div>
            <div class="annual-clear-lines">
              <div class="annual-clear-row"><span>Meta anual</span><strong>${fmt(target)} ${esc(targetUnit)}</strong></div>
              <div class="annual-clear-row"><span>Cumplimiento acumulado de meta anual</span><strong>${esc(complianceText)}</strong></div>
            </div>
            <div class="annual-clear-progress" aria-hidden="true"><span style="width:${Math.max(0, Math.min(progressWidth, 100))}%"></span></div>
          </div>`
      };
    }

    function operationalAnnualKpisMarkup(row){
      const cards = [
        ...COVERAGE_CONFIG.map(cfg => coverageAnnualKpiData(cfg, row)),
        ...diplomaAnnualKpis(row),
        ...FIELD_ACTIVITY_CUMULATIVE_META.map(cfg => operationalAnnualKpiData(cfg, row))
      ]
        .map((data, idx) => renderKpiCard(data, idx))
        .join('');
      return `
        <section class="section present-slide" id="metas-anuales-avance-acumulado">
          <div class="section-head">
            <div>
              <div class="section-title">Metas anuales y avance acumulado</div>
            </div>
          </div>
          <div class="kpis paired-kpis">${cards || '<div class="empty">No hay metas anuales acumuladas para el presente mes.</div>'}</div>
        </section>`;
    }

    function monthlyCoverageChartItems(row){
      return COVERAGE_CONFIG.map(cfg => {
        const actual = Number(row[cfg.valueKey] || 0);
        const target = Number(cfg.target || 0);
        const pct = target > 0 ? actual / target : 0;
        const unit = cfg.coverageLabel || cfg.targetLabel || '';
        return {
          label: cfg.label,
          actual,
          target,
          unit,
          pct,
          pctLabel: fmtPct(pct),
          width: Math.max(0, Math.min(100, pct * 100))
        };
      });
    }

    function monthlyActivityChartItems(row){
      const monthNum = Number(row.mes_num || 0);
      return OP_CONFIG.map(cfg => {
        const actual = Number(row[cfg.key] || 0);
        const target = Number(cfg.target || 0);
        const annualCfg = OP_ANNUAL_META.find(item => item.key === cfg.key);
        const annualActual = annualCfg ? annualActualValue(cfg.key, row.periodo_clave || state.periodo) : 0;
        const annualTarget = Number(annualCfg?.annualTarget || 0);
        const annualGoalReached = cfg.id === 'act_murales' && monthNum >= 7 && annualTarget > 0 && annualActual >= annualTarget;
        if(annualGoalReached){
          return {
            label: cfg.label,
            actual: 0,
            target: 0,
            status: 'closed',
            pct: 1,
            pctLabel: 'Meta anual alcanzada',
            width: 100,
            detail: `${fmt(annualActual)} murales acumulados`
          };
        }
        if(cfg.id === 'act_proyectos_gestion' && monthNum >= 7 && actual === 0){
          return {
            label: cfg.label,
            actual: 0,
            target: 0,
            status: 'pending',
            pct: 0,
            pctLabel: '0 proyectos ejecutados',
            width: 0,
            detail: 'Entregas preparatorias; sin proyectos ejecutados'
          };
        }
        const hasWindow = Number.isFinite(Number(cfg.start)) && Number.isFinite(Number(cfg.end));
        const status = !hasWindow ? 'pending' : (monthNum < cfg.start ? 'pending' : (monthNum > cfg.end ? 'closed' : 'active'));
        const pct = target > 0 ? actual / target : 0;
        return {
          label: cfg.label,
          actual,
          target,
          status,
          pct,
          pctLabel: status === 'pending' && actual === 0 ? 'Programado' : fmtPct(pct),
          width: status === 'pending' && actual === 0 ? 0 : Math.max(0, Math.min(100, pct * 100)),
          detail: status === 'pending' && actual === 0 ? 'Programado' : `${fmt(actual)} de ${fmt(target)}`
        };
      });
    }

    function hbarMarkup(item, mode){
      const detail = mode === 'coverage'
        ? `${fmt(item.actual)} de ${fmt(item.target)} ${item.unit}`.trim()
        : item.detail;
      return `
        <div class="epc-hbar">
          <div>
            <div class="epc-hbar-name">${esc(item.label)}</div>
            <span class="epc-hbar-sub">${esc(detail)}</span>
          </div>
          <div class="epc-hbar-track" aria-hidden="true"><span class="epc-hbar-fill" style="width:${Math.max(0, Math.min(100, item.width))}%"></span></div>
          <div class="epc-hbar-value">${esc(item.pctLabel)}</div>
        </div>`;
    }

    function operationalAnnualChartMarkup(row){
      const monthText = `${monthName(row.mes_num)} ${row.anio || ''}`.trim();
      const coverage = monthlyCoverageChartItems(row).map(item => hbarMarkup(item, 'coverage')).join('');
      const activities = monthlyActivityChartItems(row).map(item => hbarMarkup(item, 'activity')).join('');
      return `
        <section class="section present-slide" id="graficos-interactivos">
          <div class="section-head">
            <div>
              <div class="section-title">Gráficos interactivos</div>
            </div>
          </div>
          <article class="card epc-chart-card">
            <div class="epc-chart-tabs" role="tablist" aria-label="Gráficos EPC">
              <button class="epc-chart-tab active" type="button" data-chart-tab="cobertura" onclick="switchEpcChart('cobertura')">Cobertura mensual</button>
              <button class="epc-chart-tab" type="button" data-chart-tab="actividades" onclick="switchEpcChart('actividades')">Actividades del mes</button>
            </div>
            <div class="epc-chart-panel active" data-chart-panel="cobertura">
              <div class="epc-chart-list">${coverage}</div>
              <p class="epc-chart-note">Cada barra compara el resultado de ${esc(monthText)} contra su meta mensual. La barra más llena indica mayor avance.</p>
            </div>
            <div class="epc-chart-panel" data-chart-panel="actividades">
              <div class="epc-chart-list">${activities}</div>
              <p class="epc-chart-note">Cada barra muestra las actividades registradas en ${esc(monthText)} contra la meta mensual correspondiente. Las actividades aún no iniciadas aparecen como programadas.</p>
            </div>
          </article>
        </section>`;
    }

    function switchEpcChart(mode){
      document.querySelectorAll('[data-chart-tab]').forEach(btn => btn.classList.toggle('active', btn.dataset.chartTab === mode));
      document.querySelectorAll('[data-chart-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.chartPanel === mode));
    }

    function monthlyAnalysisMarkup(row){
      const monthText = `${monthName(row.mes_num)} ${row.anio || ''}`.trim();
      const coverage = monthlyCoverageChartItems(row);
      const coverageAvg = coverage.length ? coverage.reduce((acc,item)=>acc+Number(item.pct||0),0)/coverage.length : 0;
      const bestCoverage = coverage.slice().sort((a,b)=>Number(b.pct||0)-Number(a.pct||0))[0];
      const lowestCoverage = coverage.slice().sort((a,b)=>Number(a.pct||0)-Number(b.pct||0))[0];
      const activities = monthlyActivityChartItems(row);
      const activeActivities = activities.filter(item => item.status !== 'pending' && Number(item.actual||0) > 0);
      const activityTotal = activities.reduce((acc,item)=>acc+Number(item.actual||0),0);
      const activityText = activeActivities.length
        ? activeActivities.slice(0,4).map(item => `${item.label}: ${fmt(item.actual)}`).join(' · ')
        : 'sin actividades operativas registradas para este mes';
      const annual = annualOperationalRows(row).filter(item => !(item.status === 'pending' && Number(item.actual||0) === 0));
      const annualAvg = annual.length ? annual.reduce((acc,item)=>acc+Number(item.pct||0),0)/annual.length : 0;
      return `
        <section class="section present-slide" id="analisis-mes">
          <div class="section-head">
            <div>
              <div class="section-title">Análisis del mes</div>
            </div>
          </div>
          <article class="card epc-analysis-card">
            <h3>${esc(monthText)}</h3>
            <p>Durante <strong>${esc(monthText)}</strong>, EPC reporta <strong>${fmt(row.estudiantes_epc_mes||0)}</strong> estudiantes, <strong>${fmt(row.docentes_mes||0)}</strong> docentes, <strong>${fmt(row.centros_mes||0)}</strong> centros educativos y <strong>${fmt(row.municipios_mes||0)}</strong> municipios con cobertura pedagógica registrada.</p>
            <p>El cumplimiento mensual promedio de cobertura es de <strong>${fmtPct(coverageAvg)}</strong>. El indicador más alto del mes es <strong>${esc(bestCoverage?.label || '—')}</strong> con <strong>${esc(bestCoverage?.pctLabel || '—')}</strong>; el indicador que requiere mayor seguimiento es <strong>${esc(lowestCoverage?.label || '—')}</strong> con <strong>${esc(lowestCoverage?.pctLabel || '—')}</strong>.</p>
            <p>En actividades operativas, el mes registra <strong>${fmt(activityTotal)}</strong> acciones en total: <strong>${esc(activityText)}</strong>.</p>
            <div class="epc-analysis-grid">
              <div class="epc-analysis-block"><strong>Cobertura pedagógica</strong><span>${fmt(row.estudiantes_epc_mes||0)} estudiantes · ${fmt(row.docentes_mes||0)} docentes</span></div>
              <div class="epc-analysis-block"><strong>Presencia territorial</strong><span>${fmt(row.centros_mes||0)} centros · ${fmt(row.municipios_mes||0)} municipios</span></div>
              <div class="epc-analysis-block"><strong>Actividades del mes</strong><span>${fmt(activityTotal)} acciones registradas</span></div>
              <div class="epc-analysis-block"><strong>Promedio anual activo</strong><span>${fmtPct(annualAvg)} de avance acumulado</span></div>
            </div>
          </article>
        </section>`;
    }

    function computeProgramStatus(row){
      const monthNum = Number(row.mes_num || 0);
      if(monthNum < ACTIVE_START_MONTH) return { cls:'muted', text:`${monthName(monthNum)} · período de preparación` };
      const activeOps = OP_CONFIG.map(cfg => operationalKpiData(cfg, row)).filter(k => Number(row.mes_num||0) >= cfgStartByLabel(k.label));
      const anyRed = false; // Alertas rojas deshabilitadas
      const anyYellow = activeOps.some(k => k.tone==='tone-yellow');
      // Sin alertas rojas
      if(anyYellow) return { cls:'green', text:`${monthName(monthNum)} · seguimiento operativo` };
      return { cls:'green', text:`${monthName(monthNum)} · al presente mes activo` };
    }

    function cfgStartByLabel(label){
      const match = OP_CONFIG.find(c => c.label===label);
      return match ? match.start : 13;
    }


    let presentationMode = false;
    let presentationIndex = 0;

    function presentationSlides(){
      return Array.from(document.querySelectorAll('.present-slide'));
    }

    function updatePresentationHint(){
      const hint = document.getElementById('presentationHint');
      const title = document.getElementById('presentationTitle');
      const count = document.getElementById('presentationCount');
      if(!hint || !title || !count) return;
      const slides = presentationSlides();
      if(!slides.length){
        title.textContent = 'Resumen';
        count.textContent = '0/0';
        return;
      }
      presentationIndex = Math.max(0, Math.min(presentationIndex, slides.length - 1));
      const active = slides[presentationIndex];
      const heading = active?.querySelector('.section-title, h1');
      title.textContent = heading ? heading.textContent.trim() : 'Resumen';
      count.textContent = `${presentationIndex + 1}/${slides.length}`;
      hint.setAttribute('aria-hidden', presentationMode ? 'false' : 'true');
    }

    function scrollToPresentationSlide(index, behavior='smooth'){
      const slides = presentationSlides();
      if(!slides.length) return;
      presentationIndex = Math.max(0, Math.min(index, slides.length - 1));
      slides[presentationIndex].scrollIntoView({ behavior, block:'start' });
      updatePresentationHint();
    }

    async function setPresentationMode(nextMode){
      presentationMode = Boolean(nextMode);
      document.body.classList.toggle('presentation-mode', presentationMode);
      const button = document.getElementById('presentationToggle');
      const label = button?.querySelector('.present-btn-label');
      if(button){
        button.classList.toggle('active', presentationMode);
        button.setAttribute('aria-pressed', presentationMode ? 'true' : 'false');
      }
      if(label) label.textContent = presentationMode ? 'Salir de presentación' : 'Modo presentación';

      if(presentationMode){
        try{
          if(!document.fullscreenElement && document.documentElement.requestFullscreen){
            await document.documentElement.requestFullscreen();
          }
        }catch(err){}
        requestAnimationFrame(()=>scrollToPresentationSlide(presentationIndex, 'auto'));
      }else{
        try{
          if(document.fullscreenElement && document.exitFullscreen){
            await document.exitFullscreen();
          }
        }catch(err){}
        updatePresentationHint();
      }
    }

    function refreshPresentationState(){
      const slides = presentationSlides();
      if(presentationIndex >= slides.length) presentationIndex = Math.max(0, slides.length - 1);
      updatePresentationHint();
      if(presentationMode){
        requestAnimationFrame(()=>scrollToPresentationSlide(presentationIndex, 'auto'));
      }
    }

    function syncPresentationIndexToScroll(){
      if(!presentationMode) return;
      const wrap = document.getElementById('mainWrap');
      const slides = presentationSlides();
      if(!wrap || !slides.length) return;
      const wrapTop = wrap.getBoundingClientRect().top;
      let closest = 0;
      let best = Infinity;
      slides.forEach((slide, index)=>{
        const dist = Math.abs(slide.getBoundingClientRect().top - wrapTop - 12);
        if(dist < best){
          best = dist;
          closest = index;
        }
      });
      if(closest !== presentationIndex){
        presentationIndex = closest;
        updatePresentationHint();
      }
    }

    function handlePresentationKeys(event){
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if(tag === 'input' || tag === 'textarea' || tag === 'select' || document.activeElement?.isContentEditable) return;

      if(event.key.toLowerCase() === 'p'){
        event.preventDefault();
        setPresentationMode(!presentationMode);
        return;
      }

      if(!presentationMode) return;

      if(['ArrowRight','ArrowDown','PageDown',' '].includes(event.key)){
        event.preventDefault();
        scrollToPresentationSlide(presentationIndex + 1);
        return;
      }
      if(['ArrowLeft','ArrowUp','PageUp'].includes(event.key)){
        event.preventDefault();
        scrollToPresentationSlide(presentationIndex - 1);
        return;
      }
      if(event.key === 'Home'){
        event.preventDefault();
        scrollToPresentationSlide(0);
        return;
      }
      if(event.key === 'End'){
        event.preventDefault();
        scrollToPresentationSlide(presentationSlides().length - 1);
        return;
      }
      if(event.key === 'Escape'){
        event.preventDefault();
        setPresentationMode(false);
      }
    }

    function bindPresentationControls(){
      const button = document.getElementById('presentationToggle');
      const wrap = document.getElementById('mainWrap');

      button?.addEventListener('click', ()=>setPresentationMode(!presentationMode));
      wrap?.addEventListener('scroll', syncPresentationIndexToScroll, { passive:true });
      document.addEventListener('keydown', handlePresentationKeys);
      document.addEventListener('fullscreenchange', ()=>{
        if(!document.fullscreenElement && presentationMode){
          presentationMode = false;
          document.body.classList.remove('presentation-mode');
          const button = document.getElementById('presentationToggle');
          const label = button?.querySelector('.present-btn-label');
          button?.classList.remove('active');
          button?.setAttribute('aria-pressed','false');
          if(label) label.textContent = 'Modo presentación';
          updatePresentationHint();
        }
      });
      updatePresentationHint();
    }




    function statusClassFromEstatus(status){
      const s = String(status || '').toLowerCase();
      if(s.includes('verde')) return 'green';
      if(s.includes('amar')) return 'green';
      if(s.includes('rojo')) return 'green';
      if(s.includes('gris')) return 'gray';
      return 'green';
    }

    function ratioClass(value){
      const n = Number(value);
      if(!Number.isFinite(n) || n <= 0) return 'gray';
      if(n >= 1) return 'green';
      if(n >= 0.85) return 'green';
      return 'green';
    }

    function indicatorRowsForPeriod(){
      return indicatorsForPeriod().slice().sort((a,b)=>Number(a.orden_dashboard||999)-Number(b.orden_dashboard||999));
    }

    function indicatorById(id){
      return indicatorRowsForPeriod().find(r=>String(r.indicator_id)===String(id)) || {};
    }

    function presentationChipClass(value){
      const n = Number(value);
      if(!Number.isFinite(n) || n <= 0) return 'gray';
      if(n >= 1) return 'green';
      if(n >= 0.85) return 'green';
      return 'green';
    }

    function executiveKpiMarkup(row){
      const items = [
        { id:'docentes_capacitados', title:'Docentes capacitados', value:Number(row.docentes_mes||0), unit:'personas', copy:'Docentes alcanzados en el mes con desarrollo de módulos del material EPC.' },
        { id:'estudiantes_epc', title:'Estudiantes beneficiados', value:Number(row.estudiantes_epc_mes||0), unit:'estudiantes', copy:'Participación estudiantil registrada en la cobertura pedagógica del período.' },
        { id:'centros_cobertura', title:'Centros alcanzados', value:Number(row.centros_mes||0), unit:'centros', copy:'Centros educativos cubiertos por el programa durante el al presente mes activo.' },
        { id:'municipios_actividad_pedagogica', title:'Municipios con actividad', value:Number(row.municipios_mes||0), unit:'municipios', copy:'Municipios con actividad pedagógica y despliegue territorial efectivo.' }
      ];
      return items.map(item=>{
        const ind = indicatorById(item.id);
        const cls = statusClassFromEstatus(ind.estatus);
        const pct = Number(ind.pct_vs_esperado || 0);
        const chip = Number(row.mes_num||0) < ACTIVE_START_MONTH ? 'Preparación' : fmtPct(pct);
        return `
          <article class="exec-kpi-card">
            <small>${esc(item.title)}</small>
            <strong>${fmt(item.value)}</strong>
            <p>${esc(item.copy)}</p>
            <span class="exec-kpi-chip ${cls}">${esc(chip)}</span>
          </article>`;
      }).join('');
    }

    function executiveStripMarkup(row){
      const items = [
        { label:'Actividades de campo', value:fmt(row.actividades_campo_mes||0), chip:'blue', chipText:'Presente mes' },
        { label:'Asistentes diplomado marzo', value:fmt(row.diplomado_marzo_asistentes_mes||0), chip:'purple', chipText:'Cohorte marzo' },
        { label:'Inscritos diplomado junio', value:fmt(row.diplomado_junio_inscritos_mes||0), chip:'purple', chipText:'Próxima cohorte' },
        { label:'Coordinaciones clave', value:displayCoordinacionesClave(row), chip:'green', chipText:'Gestión mensual' }
      ];
      return items.map(item=>`
        <article class="exec-strip-card">
          <small>${esc(item.label)}</small>
          <strong>${esc(item.value)}</strong>
          <span class="chip ${item.chip}">${esc(item.chipText)}</span>
        </article>`).join('');
    }

    function executiveProgressMarkup(row){
      const items = annualOperationalRows(row)
        .filter(item => item.status !== 'pending' || Number(row.mes_num||0) >= (Number(item.start)||0))
        .slice(0, 8);
      return `<div class="exec-progress-list">${items.map(item=>{
        const pct = item.pct == null ? 0 : Number(item.pct || 0);
        return `
          <div class="exec-progress-row">
            <div class="exec-progress-label">${esc(item.label)}</div>
            <div class="exec-progress-track"><span class="exec-progress-bar" style="width:${Math.max(0,Math.min(100,(item.visualPct||0)*100))}%"></span></div>
            <div class="exec-progress-pct">${item.pct == null ? 'Pend.' : fmtPct(pct)}</div>
          </div>`;
      }).join('')}</div>`;
    }

    function executiveAlertsData(row){
      // Alertas operativas deshabilitadas en el índice
      return [];
    }

    function executiveAlertsMarkup(row){
      return `<div class="alert-list">${executiveAlertsData(row).map(item=>`<div class="alert ${item.cls}">${esc(item.text)}</div>`).join('')}</div>`;
    }

    function executiveDiagnosticMarkup(row){
      const latestText = `${monthName(row.mes_num)} ${row.anio || ''}`.trim();
      const prep = PREP_CONFIG.map(cfg => Number(row[cfg.key] || 0)).reduce((a,b)=>a+b,0);
      const annual = annualOperationalRows(row);
      const greenCount = annual.filter(item => Number(item.pct||0) >= 1).length;
      const yellowCount = annual.filter(item => Number(item.pct||0) > 0 && Number(item.pct||0) < 1).length;
      return `
        <h3>Resumen ejecutivo · ${esc(latestText)}</h3>
        <p><strong>Lectura general.</strong> El programa Educando para Conservar presenta su al presente mes operativo en <strong>${esc(latestText)}</strong>. La cobertura pedagógica del mes alcanza <strong>${fmt(row.docentes_mes||0)}</strong> docentes, <strong>${fmt(row.estudiantes_epc_mes||0)}</strong> estudiantes, <strong>${fmt(row.centros_mes||0)}</strong> centros educativos y <strong>${fmt(row.municipios_mes||0)}</strong> municipios con actividad pedagógica.</p>
        <p><strong>Avance y gestión.</strong> En el componente táctico, se observan <strong>${greenCount}</strong> indicadores con cumplimiento acumulado favorable. Además, el al presente mes registra <strong>${fmt(row.actividades_campo_mes||0)}</strong> actividades de campo. Estado de coordinaciones clave: <strong>${esc(displayCoordinacionesClave(row))}</strong>.</p>
        <p><strong>Contexto programático.</strong> ${esc(String(row.logros_texto || '').trim() || 'Sin observaciones narrativas registradas para este período.')}</p>
        ${prep > 0 ? `<p><strong>Preparación y diplomado.</strong> El programa también acumuló <strong>${fmt(prep)}</strong> acciones o registros asociados a preparación metodológica, diagnóstico e inducción, junto con el despliegue del componente de diplomado juvenil.</p>` : ''}
      `;
    }

    function switchView(mode){
      state.view = mode === 'exec' ? 'exec' : 'full';
      document.body.classList.toggle('exec-view', state.view === 'exec');
      const full = document.getElementById('fullView');
      const exec = document.getElementById('execView');
      if(full) full.style.display = state.view === 'full' ? '' : 'none';
      if(exec) exec.style.display = state.view === 'exec' ? '' : 'none';
      document.getElementById('btnFull')?.classList.toggle('active', state.view === 'full');
      document.getElementById('btnExec')?.classList.toggle('active', state.view === 'exec');
      document.getElementById('btnFull')?.setAttribute('aria-pressed', state.view === 'full' ? 'true' : 'false');
      document.getElementById('btnExec')?.setAttribute('aria-pressed', state.view === 'exec' ? 'true' : 'false');
    }

    let slideIndex = 0;
    let controlsBound = false;

    function presentationSlidesCount(){
      return document.querySelectorAll('#presentationTrack .pres-slide').length;
    }

    function buildPresentationDots(){
      const dots = document.getElementById('presDots');
      const count = presentationSlidesCount();
      if(!dots) return;
      dots.innerHTML = Array.from({ length: count }, (_, idx)=>`<button class="pres-dot ${idx===slideIndex?'active':''}" type="button" aria-label="Ir a la diapositiva ${idx+1}" onclick="gotoSlide(${idx})"></button>`).join('');
      document.getElementById('presCounter').textContent = `${Math.min(slideIndex + 1, Math.max(count,1))} / ${Math.max(count,1)}`;
    }

    function gotoSlide(idx){
      const track = document.getElementById('presentationTrack');
      const count = presentationSlidesCount();
      if(!track || !count) return;
      slideIndex = (idx + count) % count;
      track.style.transform = `translateX(-${slideIndex * 100}%)`;
      buildPresentationDots();
    }

    function nextSlide(){ gotoSlide(slideIndex + 1); }
    function prevSlide(){ gotoSlide(slideIndex - 1); }

    function buildPresentation(){
      const row = periodRow();
      const latestText = `${monthName(row.mes_num)} ${row.anio || ''}`.trim();
      const annual = annualOperationalRows(row);
      const prepItems = PREP_CONFIG
        .map(cfg => ({ cfg, value:Number(row[cfg.key] || 0), pending: cfg.key === 'coordinaciones_clave_mes' ? String(row.coordinaciones_clave_texto || '').trim() : '' }))
        .filter(item => item.value > 0 || item.pending);
      const alerts = executiveAlertsData(row);
      const track = document.getElementById('presentationTrack');
      const meta = document.getElementById('presentationMeta');
      if(meta) meta.innerHTML = `<span>Modo presentación</span><span>${esc(latestText)}</span><span>Educando para Conservar</span>`;
      if(!track) return;
      track.innerHTML = `
        <section class="pres-slide"><div class="pres-inner">
          <div class="pres-kicker">Reporte de resultados · ${esc(latestText)}</div>
          <div class="pres-title-row">
            <div>
              <h2>Educando para Conservar</h2>
              <p>Programa de educación ambiental de AALA orientado a fortalecer capacidades técnicas, pedagógicas y comunitarias para el uso del material de referencia EPC y la promoción de buenas prácticas ambientales en la cuenca del Lago de Atitlán.</p>
            </div>
            <div class="pres-brand-badge"><img src="./assets/logos/educando-para-conservar.png" alt="Logo EPC" onerror="this.style.display='none'"></div>
          </div>
          <div class="pres-card-grid pres-card-grid-4">
            <div class="pres-card"><small>Docentes</small><strong>${fmt(row.docentes_mes||0)}</strong><p>Personas alcanzadas en el presente mes.</p></div>
            <div class="pres-card"><small>Estudiantes</small><strong>${fmt(row.estudiantes_epc_mes||0)}</strong><p>Participación estudiantil en cobertura pedagógica.</p></div>
            <div class="pres-card"><small>Centros</small><strong>${fmt(row.centros_mes||0)}</strong><p>Centros educativos con actividad del programa.</p></div>
            <div class="pres-card"><small>Municipios</small><strong>${fmt(row.municipios_mes||0)}</strong><p>Municipios con actividad pedagógica efectiva.</p></div>
          </div>
          <div class="pres-note"><h3>Contexto del programa</h3><p>El “Diplomado juvenil de liderazgo y gestión ambiental en el Lago de Atitlán” tiene como objetivo fomentar en jóvenes estudiantes, docentes y líderes comunitarios, la adquisición de habilidades y conocimientos necesarios para que a futuro puedan incidir en espacios a nivel comunitario y analizar las necesidades socio ambientales propias de la comunidad. Además, se pretende orientarlos en el beneficio que conlleva analizar necesidades y construir de manera participativa propuestas de proyectos socio ambientales para la mejora social y ambiental de las comunidades del Lago Atitlán.</p></div>
        </div></section>

        <section class="pres-slide"><div class="pres-inner">
          <div class="pres-kicker">Cobertura pedagógica</div>
          <div class="pres-title-row"><div><h2>Indicadores de cobertura del período</h2><p>Lectura ejecutiva de la presencia territorial y pedagógica del programa en el al presente mes activo.</p></div></div>
          <div class="pres-card-grid pres-card-grid-2">
            ${COVERAGE_CONFIG.map(cfg=>{ const d = coverageKpiData(cfg,row); return `<div class="pres-kpi-pair"><div class="pres-kpi-label">${esc(d.label)}</div><div class="pres-kpi-value">${esc(d.valueText)}</div><div class="pres-kpi-meta">${esc(d.line1)}</div><span class="pres-chip ${String(d.tone||'').startsWith('tone-green')?'green':'gray'}">${esc(d.chip)}</span><div class="pres-bar-wrap"><div class="pres-bar ${String(d.tone||'').startsWith('tone-green')?'green':'gray'}" style="width:${Math.max(0,Math.min(100,d.progressWidth))}%"></div></div></div>`; }).join('')}
          </div>
        </div></section>

        <section class="pres-slide"><div class="pres-inner">
          <div class="pres-kicker">Metas anuales y avance acumulado</div>
          <div class="pres-title-row"><div><h2>Metas anuales y avance acumulado</h2><p>Comparación del acumulado registrado al presente mes frente a la meta anual de las actividades tácticas del programa.</p></div></div>
          <div class="pres-card-grid pres-card-grid-2">
            ${annual.map(item=>`<div class="pres-kpi-pair"><div class="pres-kpi-label">${esc(item.label)}</div><div class="pres-kpi-value">${item.pct == null ? 'Pendiente' : fmtPct(item.pct)}</div><div class="pres-kpi-meta">${fmt(item.actual)} de ${fmt(item.annualTarget)} · ${esc(item.window)}</div><span class="pres-chip ${item.pct == null ? 'gray' : presentationChipClass(item.pct)}">${item.status === 'pending' ? 'Programado' : item.status === 'closed' ? 'Ventana cerrada' : 'Activo'}</span><div class="pres-bar-wrap"><div class="pres-bar ${item.pct == null ? 'gray' : presentationChipClass(item.pct)}" style="width:${Math.max(0,Math.min(100,(item.visualPct||0)*100))}%"></div></div></div>`).join('')}
          </div>
        </div></section>

        <section class="pres-slide"><div class="pres-inner">
          <div class="pres-kicker">Preparación y diplomado</div>
          <div class="pres-title-row"><div><h2>Lectura complementaria del período</h2><p>Indicadores de inducción, coordinación y despliegue del diplomado juvenil para enriquecer la comprensión ejecutiva del programa.</p></div></div>
          <div class="pres-card-grid pres-card-grid-4">
            <div class="pres-card"><small>Actividades de campo</small><strong>${fmt(row.actividades_campo_mes||0)}</strong><p>Acciones de campo registradas en el mes.</p></div>
            <div class="pres-card"><small>Asistentes diplomado marzo</small><strong>${fmt(row.diplomado_marzo_asistentes_mes||0)}</strong><p>Participantes de la cohorte de marzo.</p></div>
            <div class="pres-card"><small>Inscritos diplomado junio</small><strong>${fmt(row.diplomado_junio_inscritos_mes||0)}</strong><p>Base de jóvenes para la siguiente cohorte.</p></div>
            <div class="pres-card"><small>Coordinaciones clave</small><strong>${esc(displayCoordinacionesClave(row))}</strong><p>Gestiones y articulaciones institucionales del período.</p></div>
          </div>
          ${prepItems.length ? `<div class="pres-card-grid pres-card-grid-3">${prepItems.map(item=>`<div class="pres-card"><small>${esc(item.cfg.label)}</small><strong>${item.pending ? esc(item.pending) : fmt(item.value)}</strong><p>${esc(item.pending ? 'Información pendiente de actualización para este indicador complementario.' : item.cfg.narrative(item.value, row))}</p></div>`).join('')}</div>` : ''}
        </div></section>

        <section class="pres-slide"><div class="pres-inner">
          <div class="pres-kicker">Alertas y cierre</div>
          <div class="pres-title-row"><div><h2>Señales para la toma de decisiones</h2><p>Resumen de alertas, logros narrativos y mensajes de cierre listos para exposición o revisión gerencial.</p></div></div>
          <div class="pres-card-grid pres-card-grid-1">
            <div class="pres-note"><h3>Logros al presente mes</h3><p>${esc(String(row.logros_texto || '').trim() || 'Sin observaciones registradas para este período.')}</p></div>
          </div>
        </div></section>`;
      slideIndex = 0;
      buildPresentationDots();
      gotoSlide(0);
    }

    function openPresentation(){
      buildPresentation();
      const overlay = document.getElementById('presentationOverlay');
      overlay?.classList.add('open');
      overlay?.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
    }

    function closePresentation(){
      const overlay = document.getElementById('presentationOverlay');
      overlay?.classList.remove('open');
      overlay?.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    }

    function bindGlobalControls(){
      if(controlsBound) return;
      controlsBound = true;
      
      document.addEventListener('keydown', (e)=>{
        const overlay = document.getElementById('presentationOverlay');
        if(!overlay?.classList.contains('open')) return;
        if(e.key==='ArrowRight'){ e.preventDefault(); nextSlide(); }
        if(e.key==='ArrowLeft'){ e.preventDefault(); prevSlide(); }
        if(e.key==='Escape'){ e.preventDefault(); closePresentation(); }
      });
      document.getElementById('presentationOverlay')?.addEventListener('click', (e)=>{
        if(e.target === document.getElementById('presentationOverlay')) closePresentation();
      });
    }

    function renderAll(){
      const row = periodRow();
      const meta = (state.data.metadata||[])[0] || {};
      const status = computeProgramStatus(row);
      const latestText = meta.latest_month_label ? `${meta.latest_month_label} ${String(meta.latest_period||'').slice(0,4)}` : monthName(row.mes_num);

      const monthlyCoverageCards = COVERAGE_CONFIG
        .map(cfg => coverageMonthlyKpiData(cfg, row))
        .map((data, idx) => renderKpiCard(data, idx))
        .join('');
      const monthlyDiplomaCards = diplomaMonthlyKpis(row)
        .map((data, idx) => renderKpiCard(data, idx + COVERAGE_CONFIG.length))
        .join('');
      const monthlyOperationalCards = OP_CONFIG
        .map(cfg => operationalKpiData(cfg, row))
        .map((data, idx) => renderKpiCard(data, idx + COVERAGE_CONFIG.length + diplomaMonthlyKpis(row).length))
        .join('');
      const monthlyAny = monthlyCoverageCards || monthlyDiplomaCards || monthlyOperationalCards;
      const annualOperationalKpis = operationalAnnualKpisMarkup(row);
      const monthlyAnalysis = monthlyAnalysisMarkup(row);
      const annualChart = operationalAnnualChartMarkup(row);

      document.getElementById('mainWrap').innerHTML = `
        <div id="execView" style="display:none">
          <div class="exec-status-card">
            <div class="es-label">Estado del programa</div>
            <div class="es-title">Educando para Conservar</div>
            <div class="exec-status-badge">${esc(status.text)}</div>
            <div style="font-size:.82rem;opacity:.84;margin-top:4px">Período activo: <strong>${esc(monthName(row.mes_num))} ${esc(String(row.anio || '').trim())}</strong> · Último mes publicado: <strong>${esc(latestText)}</strong></div>
          </div>
          <div class="exec-kpi-grid">${executiveKpiMarkup(row)}</div>
          <div class="exec-strip">${executiveStripMarkup(row)}</div>
          <div class="exec-row-2">
            <article class="card panel">
              <h3>Avance acumulado vs meta anual</h3>
              <p class="sub">Progreso real acumulado de las actividades tácticas del programa frente a sus metas anuales al período seleccionado.</p>
              ${executiveProgressMarkup(row)}
            </article></div>
          <article class="card exec-diag">${executiveDiagnosticMarkup(row)}</article>
        </div>

        <div id="fullView">
          <section class="hero present-slide" id="resumen">
            <article class="card hero-main">
              <h1>Educando para Conservar</h1>
              <div class="hero-lead">
                <p>Educando para Conservar” (EPC), es un programa que tiene por objetivo contribuir a la mejora de la calidad educativa medioambiental de los pobladores del departamento de Sololá, a través del fortalecimiento de las capacidades técnicas para el uso del material de referencia Educando para Conservar, para que en forma conjunta, planificada y ordenada, fomente y se practiquen las buenas prácticas ambientales, el manejo sustentable de los recursos naturales y la capacidad de gestión ambiental.</p>
                <p>El “Diplomado juvenil de liderazgo y gestión ambiental en el Lago de Atitlán” tiene como objetivo fomentar en jóvenes estudiantes, docentes y líderes comunitarios, la adquisición de habilidades y conocimientos necesarios para que a futuro puedan incidir en espacios a nivel comunitario y analizar las necesidades socio ambientales propias de la comunidad.,</p>
              </div>
            </article>
            <article class="card hero-side logo-only" aria-label="Identidad visual del programa">
              <div class="program-logo-card">
                <img src="./assets/logos/educando-para-conservar.png" alt="Logo Educando para Conservar" onerror="this.style.display='none'">
              </div>
            </article>
          </section>

          ${annualOperationalKpis}

          <section class="section present-slide" id="metas-mensuales">
            <div class="section-head">
              <div>
                <div class="section-title">Metas mensuales</div>
                              </div>
            </div>
            <div id="monthlyKpiGrid">
              ${monthlyAny ? `
                <div class="monthly-kpi-block">
                  <div class="monthly-kpi-subhead">Cobertura EPC</div>
                  <div class="kpis paired-kpis">${monthlyCoverageCards}</div>
                </div>
                <div class="monthly-kpi-block diplomado">
                  <div class="monthly-kpi-subhead">Diplomado juvenil</div>
                  <div class="kpis paired-kpis">${monthlyDiplomaCards}</div>
                </div>
                <div class="monthly-kpi-block">
                  <div class="monthly-kpi-subhead">Actividades del mes</div>
                  <div class="kpis paired-kpis">${monthlyOperationalCards}</div>
                </div>
              ` : '<div class="empty">No hay metas mensuales para este al presente mes.</div>'}
            </div>
          </section>

          ${annualChart}

          ${monthlyAnalysis}
        </div>
      `;

      requestAnimationFrame(()=>{
        document.querySelectorAll('.kpi-pillar-fill').forEach((bar,i)=>{
          const target=bar.dataset.height||'0%';
          setTimeout(()=>{ bar.style.height=target; }, 35 + i*12);
        });
        document.querySelectorAll('.kpi-progress-line > span').forEach((bar,i)=>{
          const target=bar.dataset.width||'0';
          setTimeout(()=>{ bar.style.width=`${target}%`; }, 45 + i*12);
        });
        document.querySelectorAll('.prep-progress > span').forEach((bar,i)=>{
          const target=bar.dataset.width||'0';
          setTimeout(()=>{ bar.style.width=`${target}%`; }, 40 + i*12);
        });
        document.querySelectorAll('.chart-fill').forEach((bar,i)=>{
          const target=bar.dataset.width||'0';
          setTimeout(()=>{ bar.style.width=`${target}%`; }, 50 + i*10);
        });
        document.querySelectorAll('.kpi-value[data-value], .prep-value[data-value]').forEach((node,i)=>{
          if(node.dataset.value!=='') setTimeout(()=>animateMetricValue(node), 55 + i*12);
        });
        switchView(state.view || 'full');
      });
    }

    async function init(){
      try{
        const [total, indicadores, metadata] = await Promise.all([
          fetchCsv(PATHS.total),
          fetchCsv(PATHS.indicadores),
          fetchCsv(PATHS.metadata)
        ]);
        state.data = { total, indicadores, metadata };

        state.periodo = String(metadata[0]?.latest_period || '2026-09');
        const periodos = state.data.total.filter(r=>isTrue(r.tiene_datos_mes)).sort((a,b)=> String(a.periodo_clave).localeCompare(String(b.periodo_clave)));
        state.periodo = periodos.length ? periodos[periodos.length-1].periodo_clave : '';
        buildPills(state.data.total);
        renderAll();
        bindGlobalControls();
        switchView(state.view || 'full');
        document.getElementById('loadingState')?.remove();
      }catch(err){
        console.error(err);
        document.getElementById('mainWrap').innerHTML = '<div class="empty">Error al cargar los datos de Educando para Conservar. Verifica que existan los archivos CSV en <code>data/educando_para_conservar/2026/</code>.</div>';
      }
    }

    function enviarResumenEpc(){
      const row=periodRow();
      if(!row) return;
      const encabezado=`Educando para Conservar — ${monthName(row.mes_num)} ${row.anio}`;
      const indicadores=state.data.indicadores.filter(item=>String(item.periodo_clave)===String(state.periodo));
      const contenido=[encabezado, '', `Docentes: ${fmt(row.docentes_mes)}`, `Estudiantes: ${fmt(row.estudiantes_epc_mes)}`, `Centros educativos: ${fmt(row.centros_mes)}`, `Municipios: ${fmt(row.municipios_mes)}`, `Actividades de campo: ${fmt(row.actividades_campo_mes)}`, '', 'Indicadores', ...indicadores.filter(item=>item.categoria==='estrategico').map(item=>`${item.indicador_nombre}: ${item.valor_mes} (${item.estatus})`), '', String(row.logros_texto||'')].join('\n');
      window.location.href=`mailto:?subject=${encodeURIComponent(encabezado)}&body=${encodeURIComponent(contenido)}`;
    }
    init();