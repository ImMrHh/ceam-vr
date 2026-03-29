// ── config.js ─────────────────────────────────────────────────────────────────
// Central configuration: URLs, constants, palette, growth projections.
// All other modules import from here — never hardcode values elsewhere.

const AUTH_URL = 'https://vr-lab-auth.6z5fznmp4m.workers.dev';

const MONTH_LABELS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const ADMIN_SUBJECTS = new Set(['R.V.','Mantenimiento','Admin']);

// Subjects that should be classified as admin regardless of Actividad
const DEMO_LABEL      = 'Demo';
const PLANEACION_KEY  = 'planeaci';  // substring match (lowercase)

// Chart.js shared tooltip style
const CHART_TOOLTIP = {
  backgroundColor: 'rgba(15, 58, 125, 0.92)',
  titleColor: '#ffffff',
  bodyColor: '#e0f2fe',
  padding: 12,
  borderRadius: 8,
  borderColor: 'rgba(255,255,255,0.15)',
  borderWidth: 1,
  mode: 'index',
  intersect: false,
};

const CHART_GRID_COLOR = 'rgba(15, 58, 125, 0.06)';

// Growth projections (Ciclo 2 and 3 are calculated, not live data)
const GROWTH_CYCLES = [
  { label: 'Ciclo 1\n(Actual)',      key: 'c1', factor: 1.0,  badge: 'Base comprobada', type: 'current'   },
  { label: 'Ciclo 2\n(Proyectado)', key: 'c2', factor: 1.50, badge: 'Escalada',        type: 'projected'  },
  { label: 'Ciclo 3\n(Proyectado)', key: 'c3', factor: 2.25, badge: 'Full Adoption',   type: 'projected'  },
];

// Hours per session (fixed ratio used in insight box)
const HOURS_PER_SESSION = 3;
