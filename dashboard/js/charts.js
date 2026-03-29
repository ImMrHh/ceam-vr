// ── charts.js ─────────────────────────────────────────────────────────────────
// Chart.js global defaults and shared chart utilities.
// buildAll() is the single entry point that re-renders every view section.

// Global Chart.js defaults
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.font.size   = 12;
Chart.defaults.color       = '#64748b';

function destroyChart(id) {
  const existing = Chart.getChart(id);
  if (existing) existing.destroy();
}

function buildAll() {
  renderHeader();
  renderMetrics();
  renderInsight();
  renderGrowth();
  renderActivity();
  renderProfessors();
  renderMaterias();
  setupFilters();
}
