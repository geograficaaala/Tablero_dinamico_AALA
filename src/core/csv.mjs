export function parseCSV(text) {
  const source = String(text).replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const c = source[i];
    if (quoted) {
      if (c === '"' && source[i + 1] === '"') { field += '"'; i += 1; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && source[i + 1] === '\n') i += 1;
      row.push(field);
      if (row.some(value => value !== '')) rows.push(row);
      row = []; field = '';
    } else field += c;
  }
  if (quoted) throw new Error('CSV con comillas sin cerrar');
  if (row.length || field) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows.shift();
  if (new Set(headers).size !== headers.length) throw new Error('Cabeceras CSV duplicadas');
  return rows.map(values => {
    if (values.length !== headers.length) throw new Error('CSV con número de columnas incorrecto');
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
}
