from pathlib import Path
import csv
import json

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'data/educando_para_conservar/2026'
REF = ROOT / 'references/educando_para_conservar/referencia_html_original_2026.json'

def read_csv(name):
    with (DATA / name).open(encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f))

def text(value):
    return '' if value is None else str(value)

def check():
    reference = json.loads(REF.read_text(encoding='utf-8'))
    for key, filename in [('total', 'total_mes.csv'), ('indicadores', 'institucional_indicadores.csv'), ('metadata', 'metadata_publicacion.csv')]:
        observed = read_csv(filename)
        original = reference[key]
        assert len(observed) == len(original), f'{key}: número de filas diferente'
        for pos, (actual, expected) in enumerate(zip(observed, original), 1):
            for field in set(actual) | set(expected):
                assert text(actual.get(field, '')) == text(expected.get(field, '')), f'{key}: fila {pos}, campo {field}: {actual.get(field)} != {expected.get(field)}'
    periods = [row['periodo_clave'] for row in read_csv('total_mes.csv')]
    assert periods == [f'2026-{i:02d}' for i in range(1, 10)]
    metas = read_csv('metas_referencia_2026.csv')
    septiembre = [r for r in reference['indicadores'] if r['periodo_clave'] == '2026-09']
    assert {r['indicator_id'] for r in metas} == {r['indicator_id'] for r in septiembre}
    assert len(septiembre) == 18
    print(f'OK: {len(periods)} meses, {len(reference["indicadores"])} registros de indicadores, {len(metas)} metas referenciadas; paridad exacta con referencia HTML original')

if __name__ == '__main__':
    check()
