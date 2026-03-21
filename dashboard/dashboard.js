// ── Config ───────────────────────────────────────────────────────────────────
const AUTH_URL = 'https://vr-lab-auth.6z5fznmp4m.workers.dev';
const SCHOOLS  = [
  'Inst. Canadiense','Col. Noil','Col. Mixcoac','Nueva Escocia',
  'William James','Dos Naciones','Lolindir','Martha','Preston',
  'Britannia','Vera Cruz','San Jerónimo','Escuelas varias'
];
const COLORS = [
  '#1e40af','#065f46','#7c3aed','#92400e','#991b1b',
  '#0369a1','#065f46','#1e3a5f','#5b21b6','#9a3412',
  '#1e40af','#065f46','#7c3aed','#92400e'
];
const MONTH_LABELS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const DEMO_SCHOOLS = new Set([
  'Inst. Canadiense','Col. Noil','Col. Mixcoac','Nueva Escocia','William James',
  'Dos Naciones','Lolindir','Martha','Preston','Britannia','Vera Cruz',
  'San Jerónimo','Escuelas varias','Admisiones'
]);
const ADMIN_SUBJECTS = new Set(['R.V.','Mantenimiento','Admin']);

// ── State ────────────────────────────────────────────────────────────────────
let token       = sessionStorage.getItem('vr-dash-token');
let allRows     = [];
let filtered    = [];
let chartsBuilt = {};
let pinVal      = '';

// Filter state
let filterMode  = 'full';  // 'full' | 'recent' | 'custom'
let customFrom  = '';
let customTo    = '';

// ── Chart defaults ────────────────────────────────────────────────────────────
Chart.defaults.color = '#6b7280';
Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";
Chart.defaults.font.size = 12;
const GRID = 'rgba(0,0,0,.06)';
const TT   = {
  backgroundColor: '#fff',
  borderColor: '#e2e5ea',
  borderWidth: 1,
  titleColor: '#111827',
  bodyColor: '#4b5563',
  titleFont: { size: 12, weight: '700' },
  bodyFont: { size: 12 },
  padding: 10,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getTipo(row) {
  if (row.TipoSesion) return row.TipoSesion;
  const m = (row.Materia||'').trim();
  const a = (row.Actividad||'').toLowerCase();
  if (DEMO_SCHOOLS.has(m)) return 'Demo';
  if (ADMIN_SUBJECTS.has(m)) return a.includes('planeaci') ? 'Planeación' : 'Admin';
  if (a.includes('planeaci')) return 'Planeación';
  return 'Clase';
}

function getMonthKey(fecha) {
  if (!fecha) return null;
  const d = new Date(fecha + 'T12:00:00');
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function getMonthLabel(key) {
  const [y, m] = key.split('-');
  return `${MONTH_LABELS[parseInt(m)-1]} ${String(y).slice(2)}`;
}

function groupBy(arr, keyFn) {
  return arr.reduce((acc, r) => {
    const k = keyFn(r);
    if (k !== null) acc[k] = (acc[k]||0) + 1;
    return acc;
  }, {});
}

function rgba(hex, a) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function destroyChart(id) {
  const existing = Chart.getChart(id);
  if (existing) existing.destroy();
}

// ── Filter logic ──────────────────────────────────────────────────────────────
function applyFilter() {
  if (filterMode === 'recent') {
    filtered = allRows.filter(r => r.Fecha >= '2026-03-10');
  } else if (filterMode === 'custom' && customFrom && customTo) {
    filtered = allRows.filter(r => r.Fecha >= customFrom && r.Fecha <= customTo);
  } else {
    filtered = [...allRows];
  }
  chartsBuilt = {};
  rebuildActive();
}

function rebuildActive() {
  const active = document.querySelector('.tab-content.active');
  if (!active) return;
  const id = active.id.replace('tab-','');
  if (id === 'overview')      buildOverview();
  if (id === 'materias')      buildMaterias();
  if (id === 'profesores')    buildProfesores();
  if (id === 'cancelaciones') buildCancelaciones();
  if (id === 'planeacion')    buildPlaneacion();
}

// ── PIN ───────────────────────────────────────────────────────────────────────
function pinPress(v) {
  if (v === 'del') { pinVal = pinVal.slice(0,-1); updateDots(); return; }
  if (pinVal.length >= 4) return;
  pinVal += v; updateDots();
  if (pinVal.length === 4) submitPin();
}

function updateDots() {
  for (let i=0; i<4; i++) {
    const d = document.getElementById('d'+i);
    d.className = 'pin-dot' + (i < pinVal.length ? ' filled' : '');
  }
}

async function submitPin() {
  try {
    const r = await fetch(`${AUTH_URL}/auth`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({pin: pinVal})
    });
    const data = await r.json();
    if (data.token) {
      token = data.token;
      sessionStorage.setItem('vr-dash-token', token);
      enterDash();
    } else {
      showPinError(data.error || 'PIN incorrecto');
    }
  } catch(e) {
    showPinError('Error de conexión');
  }
}

function showPinError(msg) {
  const dots = document.getElementById('pin-dots');
  dots.classList.add('shake');
  for (let i=0; i<4; i++) document.getElementById('d'+i).className = 'pin-dot error';
  document.getElementById('pin-error').textContent = msg;
  setTimeout(() => { dots.classList.remove('shake'); pinVal=''; updateDots(); }, 600);
}

function logout() {
  try { fetch(`${AUTH_URL}/logout`, {method:'POST', headers:{Authorization:`Bearer ${token}`}}); } catch(e){}
  sessionStorage.removeItem('vr-dash-token');
  token = null; allRows = []; filtered = []; chartsBuilt = {};
  document.getElementById('main').classList.remove('visible');
  document.getElementById('pin-screen').classList.remove('hidden');
  pinVal = ''; updateDots();
  document.getElementById('pin-error').textContent = '';
}

// ── Enter dash ────────────────────────────────────────────────────────────────
async function enterDash() {
  document.getElementById('pin-screen').classList.add('hidden');
  document.getElementById('main').classList.add('visible');
  await loadData();
}

async function loadData() {
  try {
    const r = await fetch(`${AUTH_URL}/data`, {headers:{Authorization:`Bearer ${token}`}});
    if (r.status === 401) { logout(); return; }
    const data = await r.json();
    allRows  = (data.rows || []).filter(r => r.Status !== 'Blocked');
    filtered = [...allRows];
    buildAll();
  } catch(e) {
    document.getElementById('kpi-loading').innerHTML =
      '<p style="color:#ef4444">Error al cargar datos. Recarga la página.</p>';
  }
}

function buildAll() {
  buildOverview();
  buildEscuelas();
  setupFilters();
}

// ── Filter UI setup ───────────────────────────────────────────────────────────
function setupFilters() {
  const today = new Date().toISOString().slice(0,10);
  const fromInput = document.getElementById('filter-from');
  const toInput   = document.getElementById('filter-to');
  if (fromInput) { fromInput.value = '2026-03-10'; fromInput.max = today; }
  if (toInput)   { toInput.value = today; toInput.max = today; }
}

function setFilterMode(mode) {
  filterMode = mode;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-' + mode).classList.add('active');
  applyFilter();
}

function applyCustomFilter() {
  customFrom = document.getElementById('filter-from').value;
  customTo   = document.getElementById('filter-to').value;
  if (!customFrom || !customTo) return;
  filterMode = 'custom';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  applyFilter();
}

// ── Overview ──────────────────────────────────────────────────────────────────
function buildOverview() {
  chartsBuilt.overview = true;
  destroyChart('barChart');
  destroyChart('topChart');

  const confirmed  = filtered.filter(r => r.Status === 'Confirmed');
  const cancelled  = filtered.filter(r => r.Status === 'Cancelled');
  const clases     = confirmed.filter(r => getTipo(r) === 'Clase');
  const admins     = confirmed.filter(r => getTipo(r) === 'Admin');
  const demos      = confirmed.filter(r => getTipo(r) === 'Demo');
  const profesores = new Set(clases.map(r => r.Profesor).filter(Boolean));
  const materias   = new Set(clases.map(r => r.Materia).filter(Boolean));
  const dias       = new Set(confirmed.map(r => r.Fecha).filter(Boolean));

  // Growth calc
  const byMonth = groupBy(confirmed, r => getMonthKey(r.Fecha));
  const months  = Object.keys(byMonth).sort();
  let p1=0, p2=0;
  months.forEach((m,i) => { if(i < Math.ceil(months.length/2)) p1+=byMonth[m]; else p2+=byMonth[m]; });
  const growth = p1 > 0 ? Math.round(((p2-p1)/p1)*100) : 0;
  document.getElementById('growth-num').textContent = (growth>=0?'+':'')+growth+'%';

  // KPIs
  const kpiData = [
    {label:'Sesiones totales',    val:confirmed.length, sub:'confirmadas', color:'var(--blue)',   accent:'#1e40af'},
    {label:'Clases impartidas',   val:clases.length,    sub:'con alumnos', color:'var(--green)',  accent:'#065f46'},
    {label:'Profesores activos',  val:profesores.size,  sub:'en el programa', color:'var(--purple)', accent:'#7c3aed'},
    {label:'Materias',            val:materias.size,    sub:'disciplinas',  color:'var(--amber)',  accent:'#f59e0b'},
    {label:'Sesiones demo',       val:demos.length,     sub:'escuelas visitantes', color:'var(--red)', accent:'#ef4444'},
    {label:'Días activos',        val:dias.size,        sub:'en el período', color:'#0369a1',     accent:'#0369a1'},
  ];

  const grid = document.getElementById('kpi-grid');
  grid.innerHTML = kpiData.map(k => `
    <div class="kpi">
      <div class="kpi-accent" style="background:${k.accent}"></div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-val" style="color:${k.color}">0</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>`).join('');

  grid.querySelectorAll('.kpi-val').forEach((el, i) => {
    const target = kpiData[i].val;
    let start = null;
    const tick = ts => {
      if (!start) start = ts;
      const p = Math.min((ts-start)/1200, 1);
      const e = 1 - Math.pow(1-p, 3);
      el.textContent = Math.floor(e * target);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
    };
    setTimeout(() => requestAnimationFrame(tick), i*60);
  });

  // Callout
  document.getElementById('callout-text').innerHTML =
    `<strong>${confirmed.length} sesiones confirmadas</strong> en el período seleccionado — ` +
    `<strong>${clases.length} clases</strong> con alumnos en <strong>${materias.size} materias</strong>, ` +
    `<strong>${profesores.size} profesores</strong> activos y ` +
    `<strong>${demos.length} sesiones demo</strong> con instituciones visitantes.`;

  // Monthly bar chart
  const sortedMonths = Object.keys(groupBy(filtered, r => getMonthKey(r.Fecha))).sort();
  const labels       = sortedMonths.map(getMonthLabel);

  const monthClases    = sortedMonths.map(m => confirmed.filter(r=>getTipo(r)==='Clase' && getMonthKey(r.Fecha)===m).length);
  const monthAdmin     = sortedMonths.map(m => confirmed.filter(r=>getTipo(r)==='Admin' && getMonthKey(r.Fecha)===m).length);
  const monthCancelled = sortedMonths.map(m => cancelled.filter(r=>getMonthKey(r.Fecha)===m).length);

  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: { labels, datasets: [
      {label:'Clases',        data:monthClases,    backgroundColor:rgba('#1e40af',.8), borderRadius:4, borderSkipped:false},
      {label:'Admin',         data:monthAdmin,     backgroundColor:rgba('#7c3aed',.6), borderRadius:4, borderSkipped:false},
      {label:'Cancelaciones', data:monthCancelled, backgroundColor:rgba('#ef4444',.5), borderRadius:4, borderSkipped:false},
    ]},
    options: {
      responsive:true,
      plugins:{legend:{display:false}, tooltip:TT},
      scales:{
        x:{grid:{color:GRID}, ticks:{color:'#6b7280'}},
        y:{grid:{color:GRID}, ticks:{color:'#6b7280', stepSize:5}}
      }
    }
  });

  // Top 5 teachers bar chart
  const profCounts = groupBy(clases.filter(r=>r.Profesor), r => r.Profesor);
  const top5 = Object.entries(profCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);

  new Chart(document.getElementById('topChart'), {
    type: 'bar',
    data: {
      labels: top5.map(([n])=>n),
      datasets:[{
        label:'Clases',
        data: top5.map(([,n])=>n),
        backgroundColor: COLORS.slice(0,5).map(c=>rgba(c,.8)),
        borderRadius:4, borderSkipped:false
      }]
    },
    options:{
      indexAxis:'y', responsive:true,
      plugins:{legend:{display:false}, tooltip:TT},
      scales:{
        x:{grid:{color:GRID}, ticks:{color:'#6b7280'}},
        y:{grid:{display:false}, ticks:{color:'#374151', font:{weight:'600'}}}
      }
    }
  });

  document.getElementById('kpi-loading').style.display = 'none';
  document.getElementById('kpi-section').style.display = 'block';
}

// ── Materias ──────────────────────────────────────────────────────────────────
function buildMaterias() {
  chartsBuilt.materias = true;
  destroyChart('subjChart');

  const clases  = filtered.filter(r=>r.Status==='Confirmed' && getTipo(r)==='Clase');
  const counts  = groupBy(clases, r=>r.Materia);
  const sorted  = Object.entries(counts).sort((a,b)=>b[1]-a[1]);

  new Chart(document.getElementById('subjChart'), {
    type:'bar',
    data:{
      labels: sorted.map(([s])=>s),
      datasets:[{
        label:'Sesiones',
        data: sorted.map(([,n])=>n),
        backgroundColor: sorted.map((_,i)=>rgba(COLORS[i%COLORS.length],.8)),
        borderRadius:4, borderSkipped:false
      }]
    },
    options:{
      indexAxis:'y', responsive:true,
      plugins:{legend:{display:false}, tooltip:TT},
      scales:{
        x:{grid:{color:GRID}, ticks:{color:'#6b7280'}},
        y:{grid:{display:false}, ticks:{color:'#374151', font:{size:12}}}
      }
    }
  });

  document.getElementById('subj-cards').innerHTML = sorted.map(([s,n],i) => {
    const c = COLORS[i%COLORS.length];
    return `<div class="stat-card">
      <div class="top-bar" style="background:${c}"></div>
      <div class="sc-label">${s}</div>
      <div class="sc-val" style="color:${c}">${n}</div>
      <div class="sc-sub">sesiones</div>
    </div>`;
  }).join('');
}

// ── Profesores ────────────────────────────────────────────────────────────────
function buildProfesores() {
  chartsBuilt.profesores = true;
  destroyChart('profChart');

  const clases  = filtered.filter(r=>r.Status==='Confirmed' && getTipo(r)==='Clase' && r.Profesor);
  const counts  = groupBy(clases, r=>r.Profesor);
  const sorted  = Object.entries(counts).sort((a,b)=>b[1]-a[1]);

  new Chart(document.getElementById('profChart'), {
    type:'bar',
    data:{
      labels: sorted.map(([n])=>n),
      datasets:[{
        label:'Sesiones',
        data: sorted.map(([,n])=>n),
        backgroundColor: sorted.map((_,i)=>rgba(COLORS[i%COLORS.length],.8)),
        borderRadius:4, borderSkipped:false
      }]
    },
    options:{
      indexAxis:'y', responsive:true,
      plugins:{legend:{display:false}, tooltip:TT},
      scales:{
        x:{grid:{color:GRID}, ticks:{color:'#6b7280'}},
        y:{grid:{display:false}, ticks:{color:'#374151', font:{size:12}}}
      }
    }
  });

  document.getElementById('prof-cards').innerHTML = sorted.map(([name,total],i) => {
    const c = COLORS[i%COLORS.length];
    return `<div class="prof-card">
      <div class="prof-avatar" style="background:${rgba(c,.12)};border:2px solid ${rgba(c,.3)};color:${c}">${name[0]}</div>
      <div class="prof-name">${name}</div>
      <div class="prof-stat">
        <div class="n" style="color:${c}">${total}</div>
        <div class="l">sesiones</div>
      </div>
    </div>`;
  }).join('');
}

// ── Cancelaciones ─────────────────────────────────────────────────────────────
function buildCancelaciones() {
  chartsBuilt.cancelaciones = true;
  destroyChart('cancelChart');

  const cancelled = filtered.filter(r=>r.Status==='Cancelled');
  const byProf    = groupBy(cancelled, r=>r.Profesor||'Sin registro');
  const topProf   = Object.entries(byProf).sort((a,b)=>b[1]-a[1])[0];
  const rate      = allRows.length > 0 ? Math.round(cancelled.length/filtered.length*100) : 0;

  document.getElementById('cancel-kpis').innerHTML = `
    <div class="kpi">
      <div class="kpi-accent" style="background:#ef4444"></div>
      <div class="kpi-label">Total cancelaciones</div>
      <div class="kpi-val" style="color:var(--red)">${cancelled.length}</div>
      <div class="kpi-sub">en el período</div>
    </div>
    <div class="kpi">
      <div class="kpi-accent" style="background:#f59e0b"></div>
      <div class="kpi-label">Tasa de cancelación</div>
      <div class="kpi-val" style="color:var(--amber)">${rate}%</div>
      <div class="kpi-sub">del total de registros</div>
    </div>
    ${topProf ? `<div class="kpi">
      <div class="kpi-accent" style="background:#7c3aed"></div>
      <div class="kpi-label">Más cancelaciones</div>
      <div class="kpi-val" style="color:var(--purple);font-size:18px">${topProf[0]}</div>
      <div class="kpi-sub">${topProf[1]} cancelación${topProf[1]!==1?'es':''}</div>
    </div>` : ''}`;

  const sortedMonths = Object.keys(groupBy(filtered, r=>getMonthKey(r.Fecha))).sort();
  const labels       = sortedMonths.map(getMonthLabel);
  const monthData    = sortedMonths.map(m=>cancelled.filter(r=>getMonthKey(r.Fecha)===m).length);

  new Chart(document.getElementById('cancelChart'), {
    type:'bar',
    data:{labels, datasets:[{
      label:'Cancelaciones', data:monthData,
      backgroundColor:rgba('#ef4444',.7), borderRadius:4, borderSkipped:false
    }]},
    options:{
      responsive:true,
      plugins:{legend:{display:false}, tooltip:TT},
      scales:{
        x:{grid:{color:GRID}, ticks:{color:'#6b7280'}},
        y:{grid:{color:GRID}, ticks:{color:'#6b7280', stepSize:1}}
      }
    }
  });

  const sorted = [...cancelled].sort((a,b)=>b.Fecha.localeCompare(a.Fecha));
  document.getElementById('cancel-tbody').innerHTML = sorted.length
    ? sorted.map(r => {
        const motivo = (r.Observaciones||'').replace(/\[Cancelado:\s*/,'').replace(/\]$/,'').trim() || '—';
        return `<tr>
          <td>${r.Fecha}</td>
          <td class="primary">${r.Profesor||'—'}</td>
          <td>${r.Materia||'—'}</td>
          <td>${r.Grupo||'—'}</td>
          <td class="primary">${motivo}</td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="5" class="empty-state">Sin cancelaciones en este período</td></tr>';
}

// ── Planeación ────────────────────────────────────────────────────────────────
function buildPlaneacion() {
  chartsBuilt.planeacion = true;
  destroyChart('planChart');

  const plan   = filtered.filter(r=>getTipo(r)==='Planeación');
  const byProf = groupBy(plan, r=>r.Profesor||'Sin registro');

  document.getElementById('plan-kpis').innerHTML = `
    <div class="kpi">
      <div class="kpi-accent" style="background:#7c3aed"></div>
      <div class="kpi-label">Sesiones de planeación</div>
      <div class="kpi-val" style="color:var(--purple)">${plan.length}</div>
      <div class="kpi-sub">en el período</div>
    </div>
    <div class="kpi">
      <div class="kpi-accent" style="background:#5b21b6"></div>
      <div class="kpi-label">Profesores involucrados</div>
      <div class="kpi-val" style="color:#5b21b6">${Object.keys(byProf).length}</div>
      <div class="kpi-sub">en planeación</div>
    </div>`;

  const sortedMonths = Object.keys(groupBy(filtered, r=>getMonthKey(r.Fecha))).sort();
  const labels       = sortedMonths.map(getMonthLabel);
  const monthData    = sortedMonths.map(m=>plan.filter(r=>getMonthKey(r.Fecha)===m).length);

  new Chart(document.getElementById('planChart'), {
    type:'bar',
    data:{labels, datasets:[{
      label:'Planeación', data:monthData,
      backgroundColor:rgba('#7c3aed',.75), borderRadius:4, borderSkipped:false
    }]},
    options:{
      responsive:true,
      plugins:{legend:{display:false}, tooltip:TT},
      scales:{
        x:{grid:{color:GRID}, ticks:{color:'#6b7280'}},
        y:{grid:{color:GRID}, ticks:{color:'#6b7280', stepSize:1}}
      }
    }
  });

  const sorted = [...plan].sort((a,b)=>b.Fecha.localeCompare(a.Fecha));
  document.getElementById('plan-tbody').innerHTML = sorted.length
    ? sorted.map(r=>`<tr>
        <td>${r.Fecha}</td>
        <td class="primary">${r.Profesor||'—'}</td>
        <td>${r.Materia||'—'}</td>
        <td class="primary">${r.Actividad||'—'}</td>
      </tr>`).join('')
    : '<tr><td colspan="4" class="empty-state">Sin sesiones de planeación en este período</td></tr>';
}

// ── Escuelas ──────────────────────────────────────────────────────────────────
function buildEscuelas() {
  document.getElementById('school-grid').innerHTML = SCHOOLS.map((s,i) => {
    const h = (i*27) % 360;
    return `<div class="school-item">
      <div class="school-dot" style="background:hsl(${h},55%,45%)"></div>
      <span class="school-name">${s}</span>
    </div>`;
  }).join('');
}

// ── Tab switch ────────────────────────────────────────────────────────────────
function switchTab(id, btn) {
  document.querySelectorAll('.tab-content').forEach(e=>e.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  btn.classList.add('active');
  if (!chartsBuilt[id]) {
    if (id==='overview')      buildOverview();
    if (id==='materias')      buildMaterias();
    if (id==='profesores')    buildProfesores();
    if (id==='cancelaciones') buildCancelaciones();
    if (id==='planeacion')    buildPlaneacion();
  }
}

// ── Keyboard ──────────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (document.getElementById('pin-screen').classList.contains('hidden')) return;
  if (e.key >= '0' && e.key <= '9') pinPress(e.key);
  if (e.key === 'Backspace') pinPress('del');
});

// ── Init ──────────────────────────────────────────────────────────────────────
(async () => {
  if (token) {
    try {
      const r = await fetch(`${AUTH_URL}/auth/check`, {headers:{Authorization:`Bearer ${token}`}});
      const d = await r.json();
      if (d.valid) { enterDash(); return; }
    } catch(e) {}
    sessionStorage.removeItem('vr-dash-token');
    token = null;
  }
})();
