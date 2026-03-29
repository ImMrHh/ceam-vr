// ── state.js ──────────────────────────────────────────────────────────────────
// Single source of truth. All modules read/write through this object.
// Never duplicate state in individual modules.

const State = {
  token:      sessionStorage.getItem('vr-impact-token') || null,
  allRows:    [],   // raw rows from Worker /data (excluding Blocked)
  filtered:   [],   // rows after current filter is applied
  filterMode: 'full',  // 'full' | 'recent' | 'custom'
  customFrom: '',
  customTo:   '',
  chartsBuilt: {},  // tracks which chart instances exist
};
