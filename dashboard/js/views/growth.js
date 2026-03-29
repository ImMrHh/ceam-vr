// ── views/growth.js ───────────────────────────────────────────────────────────
// Renders growth cycles, KPI table, and growth projection chart.
// Ciclo 1 = live data; Ciclos 2 & 3 = projected (factors from config.js).

function renderGrowth() {
  const confirmed = State.filtered.filter(r => r.Status === 'Confirmed');
  const clases    = confirmed.filter(r => getTipo(r) === 'Clase');
  const demos     = confirmed.filter(r => getTipo(r) === 'Demo');
  const profs     = uniqueCount(confirmed, r => r.Profesor);
  const schools   = uniqueCount(demos, r => r.Grupo);
  const materias  = uniqueCount(clases, r => r.Materia);
  const hours     = confirmed.length * HOURS_PER_SESSION;

  // Base values (Ciclo 1)
  const base = {
    sessions:   confirmed.length,
    clases:     clases.length,
    profs,
    hours,
    schools,
    materias,
  };

  // Render cycle cards
  const cyclesEl = document.getElementById('cycles-grid');
  if (cyclesEl) {
    cyclesEl.innerHTML = GROWTH_CYCLES.map(c => {
      const sessions = Math.round(base.sessions * c.factor);
      return `
        <div class="cycle-card ${c.type}">
          <div class="cycle-label">${c.label.replace('\n', ' ')}</div>
          <div class="cycle-number">${sessions.toLocaleString()}</div>
          <div class="cycle-desc">${c.type === 'current' ? 'Sesiones impartidas' : `+${Math.round((c.factor - 1) * 100)}% crecimiento`}</div>
          <div class="cycle-badge ${c.type === 'projected' ? 'projected' : ''}">${c.badge}</div>
        </div>
      `;
    }).join('');
  }

  // Render KPI table
  const tableEl = document.getElementById('growth-table-body');
  if (tableEl) {
    const rows = [
      ['Sesiones VR',          base.sessions,  Math.round(base.sessions * 1.5),  Math.round(base.sessions * 2.25)],
      ['Clases Impartidas',    base.clases,    Math.round(base.clases   * 1.41), Math.round(base.clases   * 2.12)],
      ['Profesores Activos',   base.profs,     Math.round(base.profs    * 1.4),  Math.round(base.profs    * 1.75)],
      ['Horas VR Entregadas',  base.hours,     Math.round(base.hours    * 1.5),  Math.round(base.hours    * 2.25)],
      ['Instituciones Visit.', base.schools,   Math.round(base.schools  * 1.47), Math.round(base.schools  * 2.0)],
      ['Materias Participantes',base.materias, Math.min(base.materias + 2, 20),  Math.min(base.materias + 4, 22)],
    ];
    tableEl.innerHTML = rows.map(([label, c1, c2, c3]) => `
      <tr>
        <td><strong>${label}</strong></td>
        <td class="number">${c1.toLocaleString()}</td>
        <td class="number">${c2.toLocaleString()}</td>
        <td class="number">${c3.toLocaleString()}</td>
      </tr>
    `).join('');
  }

  // Growth chart
  _buildGrowthChart(base.sessions, base.profs);
}

function _buildGrowthChart(baseSessions, baseProfs) {
  destroyChart('growthChart');
  const labels   = ['Ciclo 1\n(Actual)', 'Ciclo 2\n(Proyectado)', 'Ciclo 3\n(Proyectado)'];
  const sessions = [baseSessions, Math.round(baseSessions * 1.5), Math.round(baseSessions * 2.25)];
  const profs    = [baseProfs,    Math.round(baseProfs    * 1.4),  Math.round(baseProfs    * 1.75)];

  new Chart(document.getElementById('growthChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Sesiones VR',
          data:  sessions,
          borderColor: '#0f3a7d',
          backgroundColor: rgba('#0f3a7d', 0.08),
          borderWidth: 4,
          fill: true,
          tension: 0.4,
          pointRadius: 7,
          pointBackgroundColor: '#0f3a7d',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
        },
        {
          label: 'Profesores Activos',
          data:  profs,
          borderColor: '#059669',
          backgroundColor: rgba('#059669', 0.08),
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: '#059669',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display:  true,
          position: 'bottom',
          labels:   { usePointStyle: true, padding: 20, font: { size: 13 } },
        },
        tooltip: CHART_TOOLTIP,
      },
      scales: {
        y: { beginAtZero: true, grid: { color: CHART_GRID_COLOR }, ticks: { color: '#94a3b8' } },
        x: { grid: { display: false },                             ticks: { color: '#94a3b8' } },
      },
    },
  });
}
