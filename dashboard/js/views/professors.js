// ── views/professors.js ───────────────────────────────────────────────────────
// Renders the "Profesores Destacados" table (top 10 by session count).

function renderProfessors() {
  const confirmed = State.filtered.filter(r => r.Status === 'Confirmed');
  const clases    = confirmed.filter(r => getTipo(r) === 'Clase');
  const total     = confirmed.length;

  // Group by professor
  const byProf = {};
  clases.forEach(r => {
    const p = r.Profesor || '—';
    if (!byProf[p]) byProf[p] = { count: 0, materias: new Set() };
    byProf[p].count++;
    if (r.Materia) byProf[p].materias.add(r.Materia);
  });

  const sorted = Object.entries(byProf)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  const tbody = document.getElementById('prof-tbody');
  if (!tbody) return;

  if (!sorted.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:24px">Sin datos en este período</td></tr>';
    return;
  }

  const maxCount = sorted[0][1].count;

  tbody.innerHTML = sorted.map(([name, info], i) => {
    const participation = pct(info.count, total);
    const bar = Math.round((info.count / maxCount) * 100);
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:24px;height:24px;border-radius:50%;background:var(--primary);color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center">${i + 1}</div>
            <strong>${name}</strong>
          </div>
        </td>
        <td class="number">${info.count}</td>
        <td>${[...info.materias].slice(0, 2).join(', ')}${info.materias.size > 2 ? ` +${info.materias.size - 2}` : ''}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="flex:1;height:6px;background:#e0f2fe;border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${bar}%;background:var(--accent);border-radius:3px"></div>
            </div>
            <span style="font-size:12px;color:var(--accent-dark);font-weight:600;min-width:32px">${participation}</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}
