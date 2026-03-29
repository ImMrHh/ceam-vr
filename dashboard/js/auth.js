// ── auth.js ───────────────────────────────────────────────────────────────────
// Handles PIN entry, session token management, and logout.
// Role expected: 'coordinacion' (or 'admin').

let _pinVal = '';

function pinPress(v) {
  if (v === 'del') { _pinVal = _pinVal.slice(0, -1); _updateDots(); return; }
  if (_pinVal.length >= 4) return;
  _pinVal += v;
  _updateDots();
  if (_pinVal.length === 4) _submitPin();
}

function _updateDots() {
  for (let i = 0; i < 4; i++) {
    const d = document.getElementById('d' + i);
    if (d) d.className = 'pin-dot' + (i < _pinVal.length ? ' filled' : '');
  }
}

async function _submitPin() {
  try {
    const r = await fetch(`${AUTH_URL}/auth`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ pin: _pinVal }),
    });
    const data = await r.json();

    if (data.token) {
      // Accept coordinacion and admin only
      if (data.role !== 'coordinacion' && data.role !== 'admin') {
        _showPinError('Acceso restringido a coordinación.');
        return;
      }
      State.token = data.token;
      sessionStorage.setItem('vr-impact-token', data.token);
      enterDash();
    } else {
      _showPinError(data.error || 'PIN incorrecto');
    }
  } catch (e) {
    _showPinError('Error de conexión');
  }
}

function _showPinError(msg) {
  const dots = document.getElementById('pin-dots');
  if (dots) dots.classList.add('shake');
  for (let i = 0; i < 4; i++) {
    const d = document.getElementById('d' + i);
    if (d) d.className = 'pin-dot error';
  }
  const errEl = document.getElementById('pin-error');
  if (errEl) errEl.textContent = msg;
  setTimeout(() => {
    if (dots) dots.classList.remove('shake');
    _pinVal = '';
    _updateDots();
    if (errEl) errEl.textContent = '';
  }, 900);
}

function logout() {
  try {
    fetch(`${AUTH_URL}/logout`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${State.token}` },
    });
  } catch(e) {}
  sessionStorage.removeItem('vr-impact-token');
  State.token    = null;
  State.allRows  = [];
  State.filtered = [];
  State.chartsBuilt = {};

  document.getElementById('main').classList.remove('visible');
  document.getElementById('pin-screen').classList.remove('hidden');
  _pinVal = '';
  _updateDots();
}

async function checkExistingSession() {
  if (!State.token) return false;
  try {
    const r = await fetch(`${AUTH_URL}/auth/check`, {
      headers: { Authorization: `Bearer ${State.token}` },
    });
    const d = await r.json();
    if (d.valid && (d.role === 'coordinacion' || d.role === 'admin')) return true;
  } catch(e) {}
  sessionStorage.removeItem('vr-impact-token');
  State.token = null;
  return false;
}

// Keyboard support for PIN entry
document.addEventListener('keydown', e => {
  const pinScreen = document.getElementById('pin-screen');
  if (!pinScreen || pinScreen.classList.contains('hidden')) return;
  if (e.key >= '0' && e.key <= '9') pinPress(e.key);
  if (e.key === 'Backspace') pinPress('del');
});
