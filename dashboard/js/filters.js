// ── filters.js ────────────────────────────────────────────────────────────────
// Filter logic: full cycle, last 3 months, custom range.
// Mutates State.filtered and triggers a full re-render.

function applyFilter() {
  const today = new Date().toISOString().slice(0, 10);

  if (State.filterMode === 'recent') {
    // Last 3 months
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    const from = d.toISOString().slice(0, 10);
    State.filtered = State.allRows.filter(r => r.Fecha >= from);
  } else if (State.filterMode === 'custom' && State.customFrom && State.customTo) {
    State.filtered = State.allRows.filter(
      r => r.Fecha >= State.customFrom && r.Fecha <= State.customTo
    );
  } else {
    State.filtered = [...State.allRows];
  }

  State.chartsBuilt = {};
  buildAll();
}

function setFilter(mode) {
  State.filterMode = mode;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('btn-' + mode);
  if (btn) btn.classList.add('active');
  applyFilter();
}

function setupFilters() {
  const today    = new Date().toISOString().slice(0, 10);
  const fromInput = document.getElementById('filter-from');
  const toInput   = document.getElementById('filter-to');
  // Default custom range: start of current school year
  if (fromInput) { fromInput.value = '2025-08-01'; fromInput.max = today; }
  if (toInput)   { toInput.value   = today;         toInput.max  = today; }
}

function applyCustomFilter() {
  const from = document.getElementById('filter-from')?.value;
  const to   = document.getElementById('filter-to')?.value;
  if (!from || !to) return;
  State.customFrom  = from;
  State.customTo    = to;
  State.filterMode  = 'custom';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  applyFilter();
}
