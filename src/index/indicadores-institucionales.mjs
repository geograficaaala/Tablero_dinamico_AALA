export function construirProgramaInstitucional(descriptor, corte, dashboard) {
  if (!corte) return null;
  if (corte.id !== descriptor.id) throw new Error(`Programa incorrecto: ${corte.id}`);
  if (corte.metrics.length !== descriptor.indicators.length) throw new Error(`Cantidad de indicadores incorrecta: ${descriptor.id}`);
  const metrics = descriptor.indicators.map((indicator, index) => ({
    label: indicator.label,
    ...corte.metrics[index],
    temporality: indicator.temporality
  }));
  const output = {
    id: descriptor.id,
    name: descriptor.name,
    dashboard,
    latestLabel: corte.latestLabel,
    periodKey: corte.periodKey,
    score: corte.score,
    metrics,
    sourceSummary: corte.sourceSummary
  };
  for (const field of ['hasMonthlyColumn', 'scoreHeader', 'scoreLabel']) {
    if (Object.hasOwn(descriptor, field)) output[field] = descriptor[field];
  }
  return output;
}

export function construirTarjetasInstitucionales(descriptors, snapshots, month, dashboardFor) {
  const corte = snapshots[String(month)] || [];
  const byId = new Map(corte.map(program => [program.id, program]));
  return descriptors.map(descriptor => construirProgramaInstitucional(descriptor, byId.get(descriptor.id), dashboardFor(descriptor)));
}
