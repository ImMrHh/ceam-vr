// ── views/activity.js ─────────────────────────────────────────────────────────
// Renders the "Análisis de Actividad" section:
//   - Type distribution doughnut (Clases / Admin / Demos / Planeación)
//   - Top 5 subjects horizontal bar chart

function renderActivity() {
  const confirmed = State.filtered.filter(r => r.Status === 'Confirmed');

  _buildTypeChart(confirmed);
  _buildSubjChart(confirmed);
}

function _buildTypeChart(confirmed) {
  destroyChart('typeChart');

  const types  = ['Clase', 'Admin', 'Demo', 'Planeación'];
  const colors = ['#059669', '#f59e0b', '#3b82f6', '#8b5cf6'];
  const counts = types.map(t => confirmed.filter(r => getTipo(r) === t).length);

  new Chart(document.getElementById('typeChart'), {
    type: 'doughnut',
    data: {
      labels: types,
      datasets: [{
        data:            counts,
        backgroundColor: colors,
        borderColor:     'white',
        borderWidth:     3,
        hoverOffset:     6,
      }],
    },
    options: {
      responsive: true,
      cutout: '60%',
      plugins: {
        legend: {
          display:  true,
          position: 'bottom',
          labels:   { usePointStyle: true, padding: 16, font: { size: 12 } },
        },
        tooltip: { ...CHART_TOOLTIP, mode: 'nearest', intersect: true },
      },
    },
  });
}

function _buildSubjChart(confirmed) {
  destroyChart('subjChart');

  const clases   = confirmed.filter(r => getTipo(r) === 'Clase');
  const bySubj   = groupBy(clases, r => r.Materia || 'Sin materia');
  const sorted   = Object.entries(bySubj).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const labels   = sorted.map(([k]) => k);
  const data     = sorted.map(([, v]) => v);
  const colors   = ['#ec4899','#059669','#8b5cf6','#06b6d4','#3b82f6'];

  new Chart(document.getElementById('subjChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label:           'Sesiones',
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderRadius:    8,
        borderSkipped:   false,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend:  { display: false },
        tooltip: CHART_TOOLTIP,
      },
      scales: {
        x: { grid: { color: CHART_GRID_COLOR }, ticks: { color: '#94a3b8' } },
        y: { grid: { display: false },          ticks: { color: '#64748b'  } },
      },
    },
  });
}
