import { mountProgramHeader } from '../../components/header.js';
import { mountFooter } from '../../components/footer/footer.js';
import { parseCSV } from '../../core/csv.mjs';

window.Papa = { parse(text, options = {}) {
  return { data: parseCSV(text) };
}};

mountProgramHeader(document.querySelector('#epcHeaderMount'), {
  onView: mode => window.switchView?.(mode),
  onPresentation: () => window.openPresentation?.(),
  onMail: () => window.enviarResumenEpc?.(),
  onMonth: period => window.selectEpcPeriod?.(period)
}, {
  title: 'Educando para Conservar',
  homeHref: './index.html',
  navigation: [
    { id: 'resumen', text: 'Resumen' },
    { id: 'metas-anuales-avance-acumulado', text: 'Metas anuales' },
    { id: 'metas-mensuales', text: 'Metas mensuales' },
    { id: 'graficos-interactivos', text: 'Gráficos' },
    { id: 'analisis-mes', text: 'Análisis del mes' }
  ]
});
mountFooter(document.querySelector('#epcFooterMount'));
const script = document.createElement('script');
script.src = '../src/programs/educando_para_conservar/dashboard.js';
script.onerror = () => {
  document.querySelector('#mainWrap').textContent = 'No se pudo cargar el controlador de Educando para Conservar.';
};
document.body.append(script);
