import { parseCSV } from '../../core/csv.mjs';

export const COMPONENTES = Object.freeze({
  estudios: 'Estudios de caracterización',
  pirdes: 'PIRDES municipales',
  asistencias: 'Asistencias técnicas',
  reuniones: 'Reuniones CODEMA',
  capacidad: 'Capacidad instalada y capacitaciones'
});

const FILES = ['actividades_2026.csv', 'indicadores_publicados_2026.csv', 'metas_referencia_2026.csv', 'notas_mensuales_2026.csv', 'periodos_2026.csv'];

export async function cargarDatosFortalecimiento(base = '../data/fortalecimiento_municipal/2026', fetcher = fetch) {
  const contents = await Promise.all(FILES.map(async name => {
    const response = await fetcher(`${base.replace(/\/$/, '')}/${name}`);
    if (!response.ok) throw new Error(`No se encontró ${name} (HTTP ${response.status})`);
    return parseCSV(await response.text());
  }));
  return Object.fromEntries(['actividades', 'indicadores', 'metas', 'notas', 'periodos'].map((key, index) => [key, contents[index]]));
}

export function crearControladorFortalecimiento(input) {
  const actividades = input.actividades.map(row => ({ ...row, participantes: Number(row.participantes || 0) }));
  const metas = input.metas.map(row => ({ ...row, meta_referencia: Number(row.meta_referencia) }));
  const indicadores = input.indicadores.map(row => ({ ...row, valor_publicado: Number(row.valor_publicado), valor_calculado_desde_actividades: Number(row.valor_calculado_desde_actividades), meta_referencia: Number(row.meta_referencia) }));
  const periodos = input.periodos.filter(row => row.publicado === 'si').map(row => row.periodo).sort();
  const notas = new Map(input.notas.map(row => [row.periodo, row.nota]));
  const metaMap = new Map(metas.map(row => [row.indicador_id, row]));
  if (!periodos.length) throw new Error('No hay períodos publicados');
  if (new Set(actividades.map(row => row.id)).size !== actividades.length) throw new Error('Actividades duplicadas');
  for (const period of periodos) {
    for (const meta of metas) {
      if (!indicadores.some(row => row.periodo === period && row.indicador_id === meta.indicador_id)) throw new Error(`Indicador faltante: ${period} · ${meta.indicador_id}`);
    }
  }
  return {
    periodos,
    ultimoPeriodo: periodos.at(-1),
    metas,
    indicadores(periodo) {
      if (!periodos.includes(periodo)) return [];
      return metas.map(meta => {
        const value = indicadores.find(row => row.periodo === periodo && row.indicador_id === meta.indicador_id);
        const ratio = meta.meta_referencia ? value.valor_publicado / meta.meta_referencia : null;
        return { ...meta, ...value, cumplimiento: ratio };
      });
    },
    actividades(periodo, { componente = 'estudios', estado = 'all', busqueda = '' } = {}) {
      if (!periodos.includes(periodo)) return [];
      const search = busqueda.trim().toLocaleLowerCase('es');
      return actividades.filter(row => row.periodo <= periodo && (componente === 'todos' || row.componente === componente) && (estado === 'all' || row.estado === estado) && (!search || ['municipio', 'actividad', 'comentario', 'nota', 'tipo', 'fecha'].some(field => row[field].toLocaleLowerCase('es').includes(search))));
    },
    actividadesMes(periodo) {
      return actividades.filter(row => row.periodo === periodo);
    },
    resumen(periodo) {
      const rows = actividades.filter(row => row.periodo <= periodo);
      return Object.entries(COMPONENTES).map(([key, nombre]) => {
        const all = rows.filter(row => row.componente === key);
        return { key, nombre, total: all.length, confirmadas: all.filter(row => row.estado === 'confirmado').length, apoyo: all.filter(row => row.estado === 'no').length, revision: all.filter(row => row.estado === 'proceso' || row.estado === 'pendiente').length };
      });
    },
    estadoProgramatico(periodo) {
      const byComponent = Object.entries(COMPONENTES).map(([key]) => {
        const all = actividades.filter(row => row.periodo <= periodo && row.componente === key);
        return all.length ? all.filter(row => row.estado === 'confirmado').length / all.length : 0;
      });
      const ratio = byComponent.reduce((a, b) => a + b, 0) / byComponent.length;
      return { ratio, estado: ratio >= .85 ? 'avance_solido' : ratio >= .5 ? 'avance_medio' : ratio > 0 ? 'avance_inicial' : 'sin_avance' };
    },
    nota(periodo) { return notas.get(periodo) || ''; },
    meta(id) { return metaMap.get(id); }
  };
}
