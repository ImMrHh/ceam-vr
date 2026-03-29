// ── helpers.js ────────────────────────────────────────────────────────────────
// Pure utility functions. No DOM access, no side effects.

function getTipo(row) {
  if (row.TipoSesion) return row.TipoSesion;
  const m = (row.Materia  || '').trim();
  const a = (row.Actividad|| '').toLowerCase();
  if (m === DEMO_LABEL)          return 'Demo';
  if (ADMIN_SUBJECTS.has(m))     return a.includes(PLANEACION_KEY) ? 'Planeación' : 'Admin';
  if (a.includes(PLANEACION_KEY))return 'Planeación';
  return 'Clase';
}

function getMonthKey(fecha) {
  if (!fecha) return null;
  const d = new Date(fecha + 'T12:00:00');
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function getMonthLabel(key) {
  const [y, m] = key.split('-');
  return `${MONTH_LABELS[parseInt(m)-1]} ${String(y).slice(2)}`;
}

function groupBy(arr, keyFn) {
  return arr.reduce((acc, r) => {
    const k = keyFn(r);
    if (k !== null && k !== undefined) acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function groupBySum(arr, keyFn, valFn) {
  return arr.reduce((acc, r) => {
    const k = keyFn(r);
    if (k !== null && k !== undefined) acc[k] = (acc[k] || 0) + valFn(r);
    return acc;
  }, {});
}

function rgba(hex, a) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function sortedMonthKeys(rows) {
  return Object.keys(groupBy(rows, r => getMonthKey(r.Fecha))).sort();
}

function uniqueCount(arr, keyFn) {
  return new Set(arr.map(keyFn).filter(Boolean)).size;
}

function pct(part, total) {
  if (!total) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}
