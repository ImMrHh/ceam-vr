// ── views/header.js ───────────────────────────────────────────────────────────
// Renders the hero header: stat boxes + trend chart.

function renderHeader() {
  const rows      = State.filtered;
  const confirmed = rows.filter(r => r.Status === 'Confirmed');
  const profs     = uniqueCount(confirmed, r => r.Profesor);
  const demos     = confirmed.filter(r => getTipo(r) === 'Demo');
  const schools   = uniqueCount(demos, r => r.Grupo);

  // Best month growth % (compare two latest months)
  const byMonth   = groupBy(confirmed, r => getMonthKey(r.Fecha));
  const months    = Object.keys(byMonth).sort();
  let growthLabel = '—';
  if (months.length >= 2) {
    const prev = byMonth[months[months.length - 2]];
    const curr = byMonth[months[months.length - 1]];
    const pct  = Math.round(((curr - prev) / prev) * 100);
    const sign = pct >= 0 ? '+' : '';
    growthLabel = `${sign}${pct}% ${getMonthLabel(months[months.length - 1])}`;
  }

  // Update stat boxes
  _setStat('stat-sessions',  confirmed.length);
  _setStat('stat-professors', profs);
  _setStat('stat-growth',    growthLabel);
  _setStat('stat-schools',   schools);

  // Trend chart
  _buildTrendChart(confirmed);
}

function _setStat(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function _buildTrendChart(confirmed) {
  destroyChart('trendChart');
  const keys   = sortedMonthKeys(confirmed);
  const counts = groupBy(confirmed.filter(r => getTipo(r) === 'Clase'), r => getMonthKey(r.Fecha));

  new Chart(document.getElementById('trendChart'), {
    type: 'line',
    data: {
      labels: keys.map(getMonthLabel),
      datasets: [{
        label: 'Clases Impartidas',
        data:  keys.map(k => counts[k] || 0),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend:  { display: false },
        tooltip: CHART_TOOLTIP,
      },
      scales: {
        y: {
          beginAtZero: true,
          grid:  { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: 'rgba(255,255,255,0.7)' },
        },
        x: {
          grid:  { display: false },
          ticks: { color: 'rgba(255,255,255,0.7)' },
        },
      },
    },
  });
}
