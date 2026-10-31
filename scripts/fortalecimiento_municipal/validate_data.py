import csv
import hashlib
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'data/fortalecimiento_municipal/2026'
REF = json.loads((ROOT / 'references/fortalecimiento_municipal/referencia_original_2026.json').read_text(encoding='utf-8'))


def read(name):
    with (BASE / name).open(encoding='utf-8-sig', newline='') as source:
        return list(csv.DictReader(source))


def check():
    activities = read('actividades_2026.csv')
    kpis = read('indicadores_publicados_2026.csv')
    metas = read('metas_referencia_2026.csv')
    notes = read('notas_mensuales_2026.csv')
    periods = read('periodos_2026.csv')
    baseline = [a for a in activities if a['periodo'] <= '2026-09']
    assert len(baseline) == REF['total_actividades'], 'Cambió el número de actividades originales'
    counts = Counter(a['componente'] for a in baseline)
    assert dict(counts) == REF['actividades_por_componente'], 'Cambió la distribución de componentes'
    assert len({a['id'] for a in activities}) == len(activities), 'Existen IDs de actividad duplicados'
    digest = hashlib.sha256(json.dumps(baseline, ensure_ascii=False, sort_keys=True).encode('utf-8')).hexdigest()
    assert digest == REF['hash_actividades_enero_septiembre'], 'Se modificó una actividad del histórico publicado'
    assert len(metas) == 5, 'No coinciden las metas de referencia'
    assert all(m['estado_aprobacion'] == 'referencia_original_pendiente_confirmacion' for m in metas), 'Metas sin estado de aprobación explícito'
    meta_by_source = {m['componente']: m for m in metas}
    assert len(meta_by_source) == len(metas), 'Metas de componente duplicadas'
    published = {p['periodo'] for p in periods if p['publicado'] == 'si'}
    assert set(REF['periodos_originales']).issubset(published), 'Se eliminó un período original publicado'
    assert len({(k['periodo'], k['componente']) for k in kpis}) == len(kpis), 'KPI duplicado'
    for period, numbers in REF['resumen_indicadores'].items():
        assert period in published, f'Período original despublicado: {period}'
        for source, expected in numbers.items():
            row = next((k for k in kpis if k['periodo'] == period and k['componente'] == source), None)
            assert row and float(row['valor_publicado']) == expected, f'No coincide la cifra histórica: {period} {source}'
            assert row['indicador_id'] == meta_by_source[source]['indicador_id'], f'ID inesperado: {source}'
            rows = [a for a in baseline if a['componente'] == source and a['estado'] == 'confirmado' and a['periodo'] <= period]
            keys = {a['count_key'] or f"{a['periodo']}-{a['fecha']}-{a['municipio']}-{a['actividad']}" for a in rows}
            assert int(float(row['valor_calculado_desde_actividades'])) == len(keys), f'Conteo incorrecto: {period} {source}'
            is_override = source in REF['overrides_originales'].get(period, {})
            assert (row['origen_valor'] == 'ajuste_publicado_en_html_original') == is_override, f'Fuente incorrecta: {period} {source}'
    assert len(notes) >= 9, 'Faltan notas de los meses originales'
    assert any(n['periodo'] == '2026-09' and n['nota'] == REF['notas_originales']['2026-09'] for n in notes), 'Cambió la nota de septiembre'
    print(f'OK: {len(baseline)} actividades originales, 45 indicadores comparados y cinco metas de referencia. Períodos publicados: {len(published)}.')


if __name__ == '__main__':
    check()
