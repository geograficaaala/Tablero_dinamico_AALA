#!/usr/bin/env python3
"""Fail if any 2026 exported table differs from the authoritative HTML snapshot."""
import csv
import hashlib
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT/'data'/'atitlan_recicla'/'2026'
BASELINE = ROOT/'references'/'atitlan_recicla'/'fuente_vigente_2026.json'


def verify():
    data = json.loads(BASELINE.read_text(encoding='utf-8'))
    manifest=json.loads((DATA_DIR/'manifest.json').read_text(encoding='utf-8'))
    assert manifest['referencia_sha256'] == hashlib.sha256(BASELINE.read_bytes()).hexdigest(), 'Changed baseline'
    count=0
    for logical, spec in manifest['tablas'].items():
        path=ROOT/spec['file']
        assert path.is_file(), f'Missing {path}'
        assert hashlib.sha256(path.read_bytes()).hexdigest()==spec['sha256'],f'Changed file {path}'
        columns=spec['columns']
        assert len(data[logical]) == spec['rows'], f'Incorrect row count for {logical}'
        actual=list(csv.DictReader(path.open(newline='',encoding='utf-8')))
        assert len(actual)==len(data[logical]), f'Incorrect CSV rows: {logical}'
        assert (list(actual[0]) if actual else [])==columns, f'Schema drift: {logical}'
        for n,(row_source,row_export) in enumerate(zip(data[logical], actual),start=1):
            expected={key: '' if row_source.get(key) is None else str(row_source.get(key)) for key in columns}
            assert expected==row_export, f'Value mismatch in {logical}, row {n}'
            count+=1
    impact=DATA_DIR/'precalculo_impacto_final.json'
    assert hashlib.sha256(impact.read_bytes()).hexdigest() == manifest['precalculo_impacto_sha256'], 'Impact precalc drift'
    latest={int(r['mes_num']) for r in data['totalMes'] if r.get('anio') == 2026}
    assert latest==set(range(1,10)), f'Unexpected month coverage: {latest}'
    print(f'OK: {len(manifest["tablas"])} tables, {count} rows and all values identical to embedded source.')
    print('CAUTION: visual parity and derived KPI formulas are NOT validated by this check.')

if __name__=='__main__':
    verify()
