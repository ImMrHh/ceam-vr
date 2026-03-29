// ── views/insight.js ──────────────────────────────────────────────────────────
// Renders the insight callout box with computed narrative text.

function renderInsight() {
  const rows      = State.filtered;
  const confirmed = rows.filter(r => r.Status === 'Confirmed');
  const clases    = confirmed.filter(r => getTipo(r) === 'Clase');
  const demos     = confirmed.filter(r => getTipo(r) === 'Demo');
  const profs     = uniqueCount(confirmed, r => r.Profesor);
  const schools   = uniqueCount(demos, r => r.Grupo);
  const materias  = uniqueCount(clases, r => r.Materia);
  const hours     = confirmed.length * HOURS_PER_SESSION;
  const avg       = profs ? (confirmed.length / profs).toFixed(1) : '—';

  const el = document.getElementById('insight-text');
  if (!el) return;

  el.innerHTML = `
    <strong>${confirmed.length} sesiones confirmadas</strong> representan
    <strong>${hours.toLocaleString()} horas</strong> de experiencias VR entregadas.
    <strong>${profs} profesores</strong> integran la tecnología en
    <strong>${materias} materias diferentes</strong>,
    con un promedio de <strong>${avg} sesiones por profesor</strong> en este período.
    ${schools ? `<strong>${schools} instituciones visitantes</strong> han participado en demos.` : ''}
  `;
}
