// ── views/metrics.js ──────────────────────────────────────────────────────────
// Renders the 4 hero KPI metric cards below the header.

function renderMetrics() {
  const rows      = State.filtered;
  const confirmed = rows.filter(r => r.Status === 'Confirmed');
  const clases    = confirmed.filter(r => getTipo(r) === 'Clase');
  const demos     = confirmed.filter(r => getTipo(r) === 'Demo');
  const profs     = uniqueCount(confirmed, r => r.Profesor);
  const schools   = uniqueCount(demos, r => r.Grupo);
  const materias  = uniqueCount(clases, r => r.Materia);
  const clasePct  = pct(clases.length, confirmed.length);

  // Best month growth label
  const byMonth = groupBy(confirmed, r => getMonthKey(r.Fecha));
  const months  = Object.keys(byMonth).sort();
  let growthChange = '';
  if (months.length >= 2) {
    const prev    = byMonth[months[months.length - 2]];
    const curr    = byMonth[months[months.length - 1]];
    const g       = Math.round(((curr - prev) / prev) * 100);
    const sign    = g >= 0 ? '↑' : '↓';
    growthChange  = `${sign} ${Math.abs(g)}% pico ${getMonthLabel(months[months.length - 1])}`;
  }

  const grid = document.getElementById('metrics-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="metric-card primary">
      <div class="metric-label">Sesiones Confirmadas</div>
      <div class="metric-value">${confirmed.length}</div>
      <div class="metric-sub">en el período seleccionado</div>
      ${growthChange ? `<div class="metric-change">${growthChange}</div>` : ''}
    </div>
    <div class="metric-card success">
      <div class="metric-label">Clases Impartidas</div>
      <div class="metric-value">${clases.length}</div>
      <div class="metric-sub">con participación de alumnos</div>
      <div class="metric-change">${clasePct} del total de sesiones</div>
    </div>
    <div class="metric-card warning">
      <div class="metric-label">Instituciones Visitantes</div>
      <div class="metric-value">${schools}</div>
      <div class="metric-sub">escuelas visitantes</div>
      <div class="metric-change">${demos.length} sesiones demo</div>
    </div>
    <div class="metric-card info">
      <div class="metric-label">Profesores Participantes</div>
      <div class="metric-value">${profs}</div>
      <div class="metric-sub">activos en el programa</div>
      <div class="metric-change">${materias} materias diferentes</div>
    </div>
  `;
}
