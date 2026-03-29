// ── data.js ───────────────────────────────────────────────────────────────────
// Fetches all bookings from Worker /data endpoint and populates State.
// Called once on login; all views read from State.allRows / State.filtered.

async function loadData() {
  _showLoading(true);
  try {
    const r = await fetch(`${AUTH_URL}/data`, {
      headers: { Authorization: `Bearer ${State.token}` },
    });
    if (r.status === 401) { logout(); return; }
    const data = await r.json();

    State.allRows  = (data.rows || []).filter(r => r.Status !== 'Blocked');
    State.filtered = [...State.allRows];
    _showLoading(false);
    buildAll();
  } catch(e) {
    _showLoading(false);
    _showError('Error al cargar datos. Recarga la página.');
  }
}

function _showLoading(show) {
  const el = document.getElementById('loading-overlay');
  if (el) el.style.display = show ? 'flex' : 'none';
}

function _showError(msg) {
  const el = document.getElementById('loading-overlay');
  if (el) el.innerHTML = `<p style="color:#ef4444;font-size:14px">${msg}</p>`;
}
