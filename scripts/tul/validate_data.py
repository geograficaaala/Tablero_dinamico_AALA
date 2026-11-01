from pathlib import Path
import csv,json

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'data/tul/2026'
REF=json.loads((ROOT/'references/tul/referencia_html_2026.json').read_text(encoding='utf-8'))

def rows(name):
    with (BASE/name).open(encoding='utf-8',newline='') as handle:
        return list(csv.DictReader(handle))

periods=rows('periodos_2026.csv')
assert [int(p['mes']) for p in periods]==list(range(1,13))
assert [int(p['mes']) for p in periods if p['estado']=='publicado']==list(range(2,10))
assert len(rows('metas_anuales_2026.csv'))==8
for meta in rows('metas_anuales_2026.csv'):
    assert int(meta['meta_anual'])==REF['ANNUAL_GOALS'][meta['indicador']]

results=rows('resultados_mensuales_2026.csv')
assert len(results)==64
seen=set()
for row in results:
    key=(int(row['mes']),row['indicador'])
    assert key not in seen
    seen.add(key)
    old=REF['MONTHLY_DATA'][str(key[0])]
    assert int(row['acumulado'])==old['annual'][key[1]]
    if key[1]=='municipios':
        assert row['resultado_mes']==row['meta_mensual']==''
    else:
        assert int(row['resultado_mes'])==old['monthly'][key[1]]
        assert int(row['meta_mensual'])==old['monthly'][key[1]+'Goal']

jornadas=rows('jornadas_2026.csv')
assert len(jornadas)==len(REF['EVENTS'])==21
for row,original in zip(jornadas,REF['EVENTS']):
    for column,source in [('mes','month'),('fecha','date'),('municipio','municipio'),('sitio','sitio'),('actividad','actividad'),('semillero_participantes','semillero'),('coordenadas','coords')]:
        value=int(row[column]) if column=='mes' else row[column]
        assert value==original[source],(column,row['id'])

analysis=rows('analisis_mensual_2026.csv')
details=rows('analisis_detalles_2026.csv')
assert len(analysis)==8 and len(details)==24
for row in analysis:
    original=REF['MONTHLY_ANALYSIS'][str(row['mes'])]
    assert row['titular']==original['headline']
    assert row['descripcion']==original['body']
for row in details:
    a=REF['MONTHLY_ANALYSIS'][str(row['mes'])]['items'][int(row['orden'])-1]
    assert [row['categoria'],row['detalle']]==a

print('OK: 64 resultados, 8 metas anuales, 21 jornadas, 8 análisis y 24 detalles idénticos al HTML original; 12 períodos definidos.')
