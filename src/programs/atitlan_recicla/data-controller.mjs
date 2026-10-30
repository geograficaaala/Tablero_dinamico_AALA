const METRICS = Object.freeze({
  materiales_generales: { label: 'Materiales reciclables', unit: 'qq', column: 'total_materiales_qq', meta: 1630 },
  pet: { label: 'PET recolectado', unit: 'qq', column: 'pet_qq', meta: 153 },
  vidrio: { label: 'Vidrio recolectado', unit: 'qq', column: 'vidrio_total_qq', meta: 1018 },
  ingreso_bruto_total: { label: 'Ingreso bruto total', unit: 'GTQ', column: 'ingreso_bruto_total', meta: 40727 },
  ingreso_bruto_mujeres: { label: 'Ingreso bruto mujeres', unit: 'GTQ', column: 'ingreso_bruto_lideresas', meta: 36655 },
  ingreso_bruto_municipalidades: { label: 'Ingreso bruto municipalidades', unit: 'GTQ', column: 'ingreso_bruto_municipalidad', meta: 4073 },
  ingreso_diario_lideresa: { label: 'Ingreso diario lideresa', unit: 'GTQ/día', column: 'ingreso_diario_lideresa', meta: 135 },
  participacion_actividades: { label: 'Participación en actividades', unit: 'proporción', column: 'pct_participacion_actividades', meta: 0.75 },
  participacion_comercializacion: { label: 'Participación en comercialización', unit: 'proporción', column: 'pct_participacion_comercializacion', meta: 0.60 }
});

export const KPI_IDS = Object.freeze([
  'materiales_generales', 'pet', 'vidrio', 'ingreso_bruto_total',
  'ingreso_bruto_mujeres', 'ingreso_diario_lideresa',
  'participacion_actividades', 'participacion_comercializacion'
]);

export const ANNUAL_IDS = Object.freeze([
  'materiales_generales', 'pet', 'vidrio', 'ingreso_bruto_total',
  'ingreso_bruto_mujeres', 'ingreso_bruto_municipalidades'
]);

const MONTHS = Object.freeze(['', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']);
const ZONE_MUNICIPIOS = Object.freeze({
  'Kaqchikel': ['Panajachel', 'Santa Catarina Palopó', 'San Antonio Palopó', 'San Juan La Laguna'],
  'Las Lagunas': ['Jaibalito', 'Santa Cruz La Laguna', 'Tzununá', 'San Marcos La Laguna'],
  'Tzolojya': ['Sololá', 'Santa Clara La Laguna', 'Santa Lucía Utatlán', 'Santa María Visitación', 'San Andrés Semetabaj'],
  'Zona Sur': ['Santiago Atitlán', 'San Lucas Tolimán']
});

const number = value => {
  const converted = Number(value);
  return Number.isFinite(converted) ? converted : 0;
};

const canonicalZone = value => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase()
  .replace('kaqchiquel', 'kaqchikel');

const sameZone = (a, b) => canonicalZone(a) === canonicalZone(b);
const dateKey = (year, month) => `${number(year)}|${number(month)}`;
const isAverage = metricId => metricId === 'ingreso_diario_lideresa' || metricId.startsWith('participacion_');

export function parseCsv(csv) {
  const rows = [];
  let record = [];
  let cell = '';
  let quoted = false;
  const source = String(csv).replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      record.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[i + 1] === '\n') i += 1;
      record.push(cell);
      if (record.some(value => value.length > 0)) rows.push(record);
      record = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error('CSV inválido: comillas sin cerrar');
  if (record.length || cell.length) {
    record.push(cell);
    if (record.some(value => value.length > 0)) rows.push(record);
  }
  if (!rows.length) return [];
  const [headers, ...items] = rows;
  return items.map((fields, index) => {
    if (fields.length !== headers.length) throw new Error(`CSV inválido: fila ${index + 2}`);
    return Object.fromEntries(headers.map((key, i) => [key, fields[i]]));
  });
}

export function createAtitlanModel({ totalMes, zonaMes, territorioMes, precalculoImpacto, metasAnuales, surusicMensual, metasMensuales = {} }) {
  if (!Array.isArray(totalMes) || !Array.isArray(zonaMes) || !Array.isArray(territorioMes)) throw new TypeError('Tablas mensuales requeridas');
  if (!precalculoImpacto?.byZone || !precalculoImpacto?.byMunicipio) throw new TypeError('Precálculo final requerido');
  if (!metasAnuales || !surusicMensual) throw new TypeError('Metas y SURUSIC requeridos');
  const monthlyMetrics = Object.fromEntries(Object.entries(METRICS).map(([id, metric]) => [id, { ...metric, meta: number(metasMensuales[id] ?? metric.meta) }]));
  const dataYear = Math.max(...totalMes.map(row => number(row.anio)));
  const periods = totalMes.map(row => ({ anio: number(row.anio), mes_num: number(row.mes_num), mes: row.mes || MONTHS[number(row.mes_num)] }))
    .filter(row => row.anio === dataYear && row.mes_num >= 1 && row.mes_num <= 12)
    .sort((a, b) => a.anio - b.anio || a.mes_num - b.mes_num);
  const lastPeriod = periods.at(-1) ?? null;
  const synchronizedZoneRows = [];
  const synchronizedTerritoryRows = [];

  function projectedRow(monthly, base) {
    return {
      programa: 'atitlan_recicla',
      materiales_lideresas_qq: number(monthly?.materiales_generales),
      materiales_municipalidad_qq: 0,
      total_materiales_qq: number(monthly?.materiales_generales),
      pet_qq: number(monthly?.pet),
      vidrio_total_qq: number(monthly?.vidrio),
      ingreso_bruto_total: number(monthly?.ingreso_bruto_total),
      ingreso_bruto_lideresas: number(monthly?.ingreso_bruto_mujeres),
      ingreso_bruto_municipalidad: number(monthly?.ingreso_bruto_municipalidades),
      ingreso_diario_lideresa: number(monthly?.ingreso_diario_lideresa),
      pct_participacion_actividades: number(monthly?.participacion_actividades),
      pct_participacion_comercializacion: number(monthly?.participacion_comercializacion),
      ...base
    };
  }

  for (const zone of precalculoImpacto.zones ?? []) {
    for (const [key, bundle] of Object.entries(precalculoImpacto.byZone[zone] ?? {})) {
      const [anio, mes_num] = key.split('|').map(Number);
      synchronizedZoneRows.push(projectedRow(bundle.monthly, {
        anio, mes_num, mes: MONTHS[mes_num], zona: zone,
        territorios_reportados: (ZONE_MUNICIPIOS[zone] ?? []).length
      }));
    }
  }
  for (const [municipio, months] of Object.entries(precalculoImpacto.byMunicipio)) {
    for (const [key, bundle] of Object.entries(months)) {
      const [anio, mes_num] = key.split('|').map(Number);
      const zona = Object.keys(ZONE_MUNICIPIOS).find(name => ZONE_MUNICIPIOS[name].includes(municipio)) ?? '';
      synchronizedTerritoryRows.push(projectedRow(bundle.monthly, {
        anio, mes_num, mes: MONTHS[mes_num], zona, territorio: municipio, municipio
      }));
    }
  }
  synchronizedZoneRows.sort((a, b) => a.anio - b.anio || a.mes_num - b.mes_num || a.zona.localeCompare(b.zona, 'es'));
  synchronizedTerritoryRows.sort((a, b) => a.anio - b.anio || a.mes_num - b.mes_num || a.zona.localeCompare(b.zona, 'es') || a.territorio.localeCompare(b.territorio, 'es'));

  function metricFromRow(row, metricId) {
    return row ? number(row[METRICS[metricId]?.column]) : null;
  }

  function getRows(anio, mes_num, zona = '__all__') {
    const rows = zona === '__all__' ? totalMes : synchronizedZoneRows;
    return rows.filter(row => number(row.anio) === number(anio) && number(row.mes_num) === number(mes_num) && (zona === '__all__' || sameZone(row.zona, zona)));
  }

  function sumMetricSeries(metricId, anio, zona, mes_num) {
    const rows = (zona === '__all__' ? totalMes : synchronizedZoneRows)
      .filter(row => number(row.anio) === number(anio) && number(row.mes_num) <= number(mes_num) && (zona === '__all__' || sameZone(row.zona, zona)));
    const values = rows.map(row => number(metricFromRow(row, metricId)));
    const total = values.reduce((sum, value) => sum + value, 0);
    return isAverage(metricId) ? (values.length ? total / values.length : 0) : total;
  }

  function getMetric(anio, mes_num, zona, metricId) {
    const config = monthlyMetrics[metricId];
    if (!config) throw new RangeError(`Indicador desconocido: ${metricId}`);
    const total = getRows(anio, mes_num)[0];
    const active = getRows(anio, mes_num, zona)[0];
    if (!total && !active) return null;
    const valor = active ? metricFromRow(active, metricId) : 0;
    const totalValue = total ? metricFromRow(total, metricId) : 0;
    const annualActual = sumMetricSeries(metricId, anio, zona, mes_num);
    const annualProgramActual = sumMetricSeries(metricId, anio, '__all__', mes_num);
    const annualExpected = config.meta * number(mes_num);
    return {
      id: metricId, label: config.label, unit: config.unit,
      valor, meta: config.meta,
      monthlyPct: config.meta ? valor / config.meta : 0,
      annualPct: annualExpected ? annualActual / annualExpected : 0,
      sharePct: totalValue ? valor / totalValue : (zona === '__all__' ? 1 : 0),
      annualSharePct: annualProgramActual ? annualActual / annualProgramActual : (zona === '__all__' ? 1 : 0)
    };
  }

  function getKpis(anio, mes_num, zona = '__all__') {
    return Object.fromEntries(KPI_IDS.map(id => [id, getMetric(anio, mes_num, zona, id)]).filter(([, value]) => value !== null));
  }

  function getTrend(anio, zona, metricId) {
    if (!monthlyMetrics[metricId]) throw new RangeError(`Indicador desconocido: ${metricId}`);
    const rows = (zona === '__all__' ? totalMes : synchronizedZoneRows)
      .filter(row => number(row.anio) === number(anio) && (zona === '__all__' || sameZone(row.zona, zona)));
    return rows.map(row => ({
      anio: number(row.anio), mes_num: number(row.mes_num), mes: row.mes ?? MONTHS[number(row.mes_num)],
      valor: metricFromRow(row, metricId), referencia: monthlyMetrics[metricId].meta
    })).sort((a, b) => a.anio - b.anio || a.mes_num - b.mes_num);
  }

  function getAnnualGoals(anio, mes_num) {
    const goals = Object.fromEntries(ANNUAL_IDS.map(id => {
      const acumulado = sumMetricSeries(id, anio, '__all__', mes_num);
      const meta = number(metasAnuales[id]);
      return [id, { acumulado, meta, porcentaje: meta ? acumulado / meta : 0, unit: METRICS[id].unit }];
    }));
    const surusic = getSurusic(anio, mes_num);
    const meta = number(metasAnuales.surusic_ventas);
    goals.surusic_ventas = { acumulado: surusic.acumulado.ventas, meta, porcentaje: meta ? surusic.acumulado.ventas / meta : 0, unit: 'GTQ' };
    goals.surusic_vidrio = { acumulado: surusic.acumulado.unidades, meta: null, porcentaje: null, unit: 'unidades' };
    return goals;
  }

  function getSurusic(anio, mes_num) {
    const yearRows = number(anio) === dataYear ? surusicMensual : {};
    const row = yearRows[String(number(mes_num))] ?? {};
    const acumulado = Object.entries(yearRows).reduce((acc, [month, value]) => {
      if (number(month) <= number(mes_num)) {
        acc.ventas += number(value.ventas);
        acc.unidades += number(value.unidades);
      }
      return acc;
    }, { ventas: 0, unidades: 0 });
    return { mensual: { ventas: number(row.ventas), unidades: number(row.unidades) }, acumulado };
  }

  function getImpact(anio, mes_num, { zona, municipio } = {}) {
    const key = dateKey(anio, mes_num);
    if (municipio && municipio !== '__none__') return precalculoImpacto.byMunicipio[municipio]?.[key] ?? null;
    if (zona && zona !== '__none__') return precalculoImpacto.byZone[zona]?.[key] ?? null;
    return null;
  }

  function getProgramStatus(anio, mes_num, zona = '__all__') {
    const kpis = getKpis(anio, mes_num, zona);
    const ids = ['materiales_generales', 'pet', 'vidrio', 'ingreso_bruto_total'];
    const values = ids.map(id => kpis[id]).filter(Boolean);
    if (!values.length) return { label: 'Sin datos suficientes', className: 'status-muted' };
    const average = values.reduce((sum, metric) => sum + (zona === '__all__' ? metric.monthlyPct : metric.sharePct), 0) / values.length;
    if (zona === '__all__') {
      if (average >= 1) return { label: 'Buen avance del mes', className: 'status-green' };
      if (average >= 0.85) return { label: 'Avance intermedio / en seguimiento', className: 'status-yellow' };
      return { label: 'Bajo meta mensual / requiere atención', className: 'status-red' };
    }
    if (average >= 0.25) return { label: 'Zona con aporte fuerte al mes', className: 'status-green' };
    if (average >= 0.10) return { label: 'Zona con aporte intermedio', className: 'status-yellow' };
    return { label: 'Zona con aporte bajo en el mes', className: 'status-red' };
  }

  return Object.freeze({
    periods, lastPeriod, zones: ['__all__', ...(precalculoImpacto.zones ?? [])],
    metrics: monthlyMetrics, syncedZoneRows: synchronizedZoneRows, syncedTerritoryRows: synchronizedTerritoryRows,
    originalZoneRows: zonaMes, originalTerritoryRows: territorioMes,
    getRows, getMetric, getKpis, getTrend, getAnnualGoals, getImpact, getSurusic, getProgramStatus, sumMetricSeries
  });
}

export async function loadAtitlanModel(baseUrl, fetchImpl = fetch, monthlyGoalsUrl = null) {
  if (!baseUrl) throw new TypeError('Se requiere una URL base de datos');
  const base = baseUrl.replace(/\/$/, '');
  const sources = ['total_mes.csv', 'zona_mes.csv', 'territorio_mes.csv', 'precalculo_impacto_final.json', 'metas_anuales.json', 'surusic_mensual.json'];
  const values = await Promise.all(sources.map(async name => {
    const response = await fetchImpl(`${base}/${name}`);
    if (!response.ok) throw new Error(`No se pudo cargar ${name}: ${response.status}`);
    return name.endsWith('.csv') ? parseCsv(await response.text()) : response.json();
  }));
  const metasMensuales = monthlyGoalsUrl ? await fetchImpl(monthlyGoalsUrl).then(response => { if (!response.ok) throw new Error(`No se pudo cargar configuración de metas: ${response.status}`); return response.json(); }) : {};
  return createAtitlanModel({...Object.fromEntries(['totalMes', 'zonaMes', 'territorioMes', 'precalculoImpacto', 'metasAnuales', 'surusicMensual'].map((key, index) => [key, values[index]])), metasMensuales});
}
