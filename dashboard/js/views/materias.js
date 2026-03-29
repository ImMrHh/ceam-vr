// ── views/materias.js ─────────────────────────────────────────────────────────
// Renders the subject distribution cards grid.

const SUBJECT_COLORS = [
  '#ec4899','#059669','#8b5cf6','#06b6d4','#3b82f6',
  '#f59e0b','#ef4444','#0ea5e9','#10b981','#a855f7',
  '#f97316','#14b8a6','#6366f1','#84cc16','#e11d48',
];

function renderMaterias() {
  const confirmed = State.filtered.filter(r => r.Status === 'Confirmed');
  const clases    = confirmed.filter(r => getTipo(r) === 'Clase');

  const bySubj = groupBy(clases, r => r.Materia || 'Sin materia');
  const sorted = Object.entries(bySubj).sort((a, b) => b[1] - a[1]);

  // Top 5 + "Otras"
  const top5  = sorted.slice(0, 5);
  const otras = sorted.slice(5).reduce((sum, [, v]) => sum + v, 0);
  const items = [...top5];
  if (otras > 0) items.push(['Otras Materias', otras]);

  const grid = document.getElementById('materias-grid');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = '<p style="color:#94a3b8;font-size:13px">Sin datos en este período</p>';
    return;
  }

  grid.innerHTML = items.map(([label, count], i) => {
    const color = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
    return `
      <div class="card" style="border-top-color:${color}">
        <div class="card-value">${count}</div>
        <div class="card-label">${label}</div>
      </div>
    `;
  }).join('');
}
