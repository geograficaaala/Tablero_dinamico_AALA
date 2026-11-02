from pathlib import Path
import csv
import json
from decimal import Decimal, InvalidOperation

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'data/educando_para_conservar/2026'
REFERENCE = ROOT / 'references/educando_para_conservar/referencia_html_original_2026.json'
INDICE = ROOT / 'data/index/2026/cortes_publicados.json'


def read_csv(name):
    with (DATA / name).open(encoding='utf-8', newline='') as file:
        return list(csv.DictReader(file))


def same_value(original, current):
    if isinstance(original, bool):
        return str(current).lower() == str(original).lower()
    if original is None:
        return current in (None, '')
    if isinstance(original, (int, float)):
        try:
            return Decimal(str(original)) == Decimal(str(current))
        except (InvalidOperation, TypeError):
            return False
    return original == current


def check():
    source = json.loads(REFERENCE.read_text(encoding='utf-8'))
    actual_total = read_csv('total_mes.csv')
    actual_indicators = read_csv('institucional_indicadores.csv')
    metas = read_csv('metas_referencia_2026.csv')
    details = read_csv('actividades_detalle_2026.csv')
    metadata = read_csv('metadata_publicacion.csv')
    assert len(actual_total) == 10
    assert len(actual_indicators) == len(source['indicadores']) + 18
    assert len(metas) == 18
    assert len(details) == 18
    assert len(metadata) == 1 and metadata[0]['latest_period'] == '2026-10'

    old_totals = {row['periodo_clave']: row for row in source['total']}
    for row in actual_total:
        period = row['periodo_clave']
        if period == '2026-10':
            continue
        before = old_totals[period]
        permitted = {'is_latest_data_month'}
        if period == '2026-06':
            permitted |= {'act_ferias_mes', 'actividades_campo_mes', 'logros_texto'}
        for field in before:
            if field not in permitted:
                assert same_value(before[field], row[field]), f'{period}.{field} cambió sin autorización'
        if period == '2026-06':
            assert int(float(row['act_ferias_mes'])) == int(float(before['act_ferias_mes'])) + 1
            assert int(float(row['actividades_campo_mes'])) == int(float(before['actividades_campo_mes'])) + 1
            assert '10 de junio' in row['logros_texto'] and 'ENRO' in row['logros_texto']

    originals = {(row['periodo_clave'], row['indicator_id']): row for row in source['indicadores']}
    allowed_fields = {'valor_acumulado', 'pct_meta_anual', 'pct_vs_esperado'}
    for row in actual_indicators:
        period = row['periodo_clave']
        if period == '2026-10':
            continue
        old = originals[(period, row['indicator_id'])]
        permitted = {'is_latest_data_month'}
        if period >= '2026-06' and row['indicator_id'] in ('act_ferias', 'actividades_campo'):
            permitted |= allowed_fields
            if period == '2026-06':
                permitted |= {'valor_mes', 'nota_metodologica'}
                assert int(float(row['valor_mes'])) == int(float(old['valor_mes'])) + 1
            assert int(float(row['valor_acumulado'])) == int(float(old['valor_acumulado'])) + 1
            goal = float(row['meta_anual'])
            assert abs(float(row['pct_meta_anual']) - float(row['valor_acumulado']) / goal) < 1e-10
        for field in old:
            if field not in permitted:
                assert same_value(old[field], row[field]), f'{period}.{row["indicator_id"]}.{field} cambió sin autorización'

    june = next(row for row in actual_total if row['periodo_clave'] == '2026-06')
    october = next(row for row in actual_total if row['periodo_clave'] == '2026-10')
    assert all(row['is_latest_data_month'] == ('True' if row['periodo_clave'] == '2026-10' else 'False') for row in actual_total)
    assert all(row['is_latest_data_month'] == ('True' if row['periodo_clave'] == '2026-10' else 'False') for row in actual_indicators)
    assert int(float(june['act_ferias_mes'])) == 2
    assert int(float(june['actividades_campo_mes'])) == 22
    expected = {'actividades_campo_mes': 15, 'act_reforestacion_mes': 2, 'act_monitoreo_reforestadas_mes': 5,
                'act_tul_mes': 2, 'act_ferias_mes': 1, 'act_giras_mes': 3, 'act_limpiezas_mes': 2,
                'propuestas_juveniles_mes': 8, 'capitales_semilla_mes': 4}
    for field, value in expected.items():
        assert int(float(october[field])) == value, f'Octubre: {field}'
    assert int(float(october['docentes_mes'])) == 0
    assert int(float(october['estudiantes_epc_mes'])) == 0
    assert sum(int(float(october[field])) for field in ('act_reforestacion_mes', 'act_monitoreo_reforestadas_mes', 'act_tul_mes', 'act_ferias_mes', 'act_giras_mes', 'act_limpiezas_mes')) == 15
    assert sum(1 for d in details if d['periodo_clave'] == '2026-06') == 1
    assert all(d['estado'] == 'realizada' for d in details)
    assert any('capital semilla' in d['tipo_actividad'].lower() and '4 capitales' == d['cantidad'] for d in details)
    oct_ind = {row['indicator_id']: row for row in actual_indicators if row['periodo_clave'] == '2026-10'}
    assert len(oct_ind) == 18
    assert int(float(oct_ind['actividades_campo']['valor_acumulado'])) == 148
    assert int(float(oct_ind['act_ferias']['valor_acumulado'])) == 16
    assert int(float(oct_ind['capitales_semilla']['valor_acumulado'])) == 4
    assert int(float(oct_ind['jovenes_formados_diplomado']['valor_acumulado'])) == 135
    assert int(float(oct_ind['propuestas_juveniles']['valor_acumulado'])) == 13
    assert next(row for row in actual_total if row['periodo_clave'] == '2026-09')['is_latest_data_month'] == 'False'
    assert october['is_latest_data_month'] == 'True'
    cuts = json.loads(INDICE.read_text(encoding='utf-8'))
    card = next(item for item in cuts['10'] if item['id'] == 'educando_para_conservar')
    assert len(card['metrics']) == 4 and card['metrics'][3]['acumDisplay'] == '148 / 128 actividades'
    assert all(c['id'] != 'educando_para_conservar' or len(c['metrics']) == 4 for records in cuts.values() for c in records)
    print('OK: 10 meses, 183 indicadores, 18 actividades documentadas, 4 capitales entregados y feria del 10 de junio incorporada.')


if __name__ == '__main__':
    check()
