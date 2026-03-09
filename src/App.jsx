import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import React from "react";

// ── Error Boundary ────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{ color: "#ff2d78", padding: 32, fontFamily: "'Space Mono',monospace", fontSize: 13 }}>
        <div style={{ marginBottom: 8 }}>⚠ Render error — please reload</div>
        <div style={{ color: "#4a5568", fontSize: 11 }}>{this.state.error.message}</div>
      </div>
    );
    return this.props.children;
  }
}

// ── Palette ───────────────────────────────────────────────────────
const C = {
  bg: "#060812", panel: "#0a0e1a", border: "#1a2040",
  cyan: "#00e5ff", violet: "#7c3aed", pink: "#ff2d78",
  green: "#00ff9d", gold: "#ffd700", text: "#e2e8f0", muted: "#4a5568",
};

// ── Data ──────────────────────────────────────────────────────────
const monthly = [
  { month: "Oct", total: 29, classes: 23, admin: 6 },
  { month: "Nov", total: 48, classes: 45, admin: 3 },
  { month: "Dic", total: 39, classes: 35, admin: 4 },
  { month: "Ene", total: 11, classes: 10, admin: 1 },
  { month: "Feb", total: 58, classes: 53, admin: 5 },
  { month: "Mar", total: 23, classes: 23, admin: 0 },
];

const subjects = [
  { subject: "Arte",        p1: 5,  p2: 30, color: C.pink },
  { subject: "Biología",    p1: 6,  p2: 20, color: C.green },
  { subject: "Historia",    p1: 2,  p2: 14, color: C.gold },
  { subject: "Socioemoc.",  p1: 0,  p2: 14, color: C.violet },
  { subject: "Geografía",   p1: 5,  p2: 10, color: C.cyan },
  { subject: "Física",      p1: 0,  p2: 8,  color: "#34d399" },
  { subject: "Tecnología",  p1: 12, p2: 7,  color: "#ff6b35" },
  { subject: "Química",     p1: 10, p2: 6,  color: "#a78bfa" },
  { subject: "Matemáticas", p1: 0,  p2: 3,  color: "#fb923c" },
  { subject: "Francés",     p1: 0,  p2: 3,  color: "#f472b6" },
  { subject: "Educ. Fís.",  p1: 0,  p2: 3,  color: "#4ade80" },
  { subject: "Inglés",      p1: 0,  p2: 2,  color: "#60a5fa" },
].sort((a, b) => b.p2 - a.p2);

const professors = [
  { name: "Cecilia",       p1: 2,  p2: 27, color: C.violet },
  { name: "Silvia",        p1: 4,  p2: 20, color: C.green },
  { name: "María Maafs",   p1: 5,  p2: 19, color: C.pink },
  { name: "Henrik",        p1: 12, p2: 21, color: C.cyan },
  { name: "Karina",        p1: 0,  p2: 11, color: "#fb923c" },
  { name: "Óscar S.",      p1: 0,  p2: 10, color: C.gold },
  { name: "Carlos",        p1: 0,  p2: 8,  color: "#60a5fa" },
  { name: "José Antonio",  p1: 0,  p2: 7,  color: "#34d399" },
  { name: "Regino",        p1: 10, p2: 6,  color: "#a78bfa" },
  { name: "Alma",          p1: 0,  p2: 3,  color: "#f472b6" },
  { name: "Mariana",       p1: 0,  p2: 3,  color: "#4ade80" },
  { name: "Daniela",       p1: 0,  p2: 2,  color: "#fbbf24" },
  { name: "Luis",          p1: 0,  p2: 2,  color: "#38bdf8" },
  { name: "Eduardo",       p1: 0,  p2: 1,  color: "#e879f9" },
].sort((a, b) => b.p2 - a.p2);

const schools = [
  "Inst. Canadiense", "Col. Noil", "Col. Mixcoac", "Nueva Escocia",
  "William James", "Dos Naciones", "Lolindir", "Martha",
  "Preston", "Britannia", "Vera Cruz", "San Jerónimo", "Escuelas varias",
];

// ── Helpers ───────────────────────────────────────────────────────
function useCountUp(target, duration = 2000, go = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!go) return;
    let start = null;
    let raf;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setValue(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, go]);
  return value;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, fontFamily: "'Space Mono',monospace", color: C.text }}>
      <div style={{ color: C.muted, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || C.cyan }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  );
};

function KPICard({ label, value, sub, color, delay = 0, go }) {
  const count = useCountUp(value, 2000, go);
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{ background: `linear-gradient(135deg,${C.panel},#0d1428)`, border: `1px solid ${color}40`, borderRadius: 16, padding: "24px 20px", position: "relative", overflow: "hidden", opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease,transform 0.6s ease", boxShadow: `0 0 40px ${color}15` }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 100, height: 100, background: `radial-gradient(circle at top right,${color}20,transparent 70%)` }} />
      <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10, fontFamily: "'Space Mono',monospace" }}>{label}</div>
      <div style={{ fontSize: 44, fontWeight: 900, color, fontFamily: "'Space Mono',monospace", lineHeight: 1, marginBottom: 6 }}>{count}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
    </div>
  );
}

function SectionTitle({ children, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <h2 style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: "'Space Mono',monospace", margin: 0 }}>{children}</h2>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.border},transparent)` }} />
    </div>
  );
}

function Panel({ children, style }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 24px", marginBottom: 20, ...style }}>
      {children}
    </div>
  );
}

function Legend({ items }) {
  return (
    <div style={{ display: "flex", gap: 20, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
      {items.map(i => (
        <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: i.color }} />{i.label}
        </div>
      ))}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────
function Overview({ go }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 14, marginBottom: 36 }}>
        <KPICard label="Sesiones Totales"    value={200} sub="Oct 2025 – Mar 2026"    color={C.cyan}   delay={0}   go={go} />
        <KPICard label="Clases Impartidas"   value={181} sub="excl. admin y demo"     color={C.violet} delay={100} go={go} />
        <KPICard label="Escuelas Visitantes" value={13}  sub="sesiones demo"          color={C.pink}   delay={200} go={go} />
        <KPICard label="Profesores Activos"  value={14}  sub="en el programa"         color={C.green}  delay={300} go={go} />
        <KPICard label="Materias"            value={12}  sub="disciplinas integradas" color={C.gold}   delay={400} go={go} />
        <KPICard label="Días Activos"        value={73}  sub="en el ciclo"            color="#a78bfa"  delay={500} go={go} />
      </div>

      <div style={{ background: `linear-gradient(135deg,${C.cyan}10,${C.violet}10)`, border: `1px solid ${C.cyan}30`, borderRadius: 16, padding: "24px 28px", marginBottom: 32, display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 11, color: C.cyan, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Space Mono',monospace", marginBottom: 8 }}>◈ Comparativo de Periodos</div>
          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
            El programa pasó de <strong style={{ color: C.cyan }}>49 actividades</strong> en el primer período a{" "}
            <strong style={{ color: C.pink }}>151 actividades</strong> en el segundo — un crecimiento del{" "}
            <strong style={{ color: C.green }}>+208%</strong> en sesiones totales y{" "}
            <strong style={{ color: C.gold }}>+252%</strong> en clases con alumnos.
          </p>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {[{ label: "P1: Oct → Nov 14", value: 49, color: C.muted }, { label: "P2: Nov 15 → Mar", value: 151, color: C.cyan }].map(i => (
            <div key={i.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: i.color, fontFamily: "'Space Mono',monospace", lineHeight: 1 }}>{i.value}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{i.label}</div>
            </div>
          ))}
        </div>
      </div>

      <Panel>
        <SectionTitle icon="📈">Tendencia Mensual de Actividades</SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthly} barGap={4}>
            <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 12, fontFamily: "'Space Mono',monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="classes" name="Clases" fill={C.cyan}   radius={[4, 4, 0, 0]} />
            <Bar dataKey="admin"   name="Admin"  fill={C.violet} radius={[4, 4, 0, 0]} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
        <Legend items={[{ color: C.cyan, label: "Clases con alumnos" }, { color: C.violet, label: "Sesiones admin/RV" }]} />
      </Panel>

      <Panel>
        <SectionTitle icon="📊">Actividad Total por Mes</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthly}>
            <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 12, fontFamily: "'Space Mono',monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="total"   name="Total"  stroke={C.cyan} strokeWidth={2.5} dot={{ fill: C.cyan, r: 4 }} />
            <Line type="monotone" dataKey="classes" name="Clases" stroke={C.pink} strokeWidth={2}   dot={{ fill: C.pink, r: 3 }} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

function Subjects() {
  return (
    <div>
      <Panel>
        <SectionTitle icon="📚">Clases por Materia — P1 vs P2</SectionTitle>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={subjects} layout="vertical" barGap={3}>
            <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="subject" width={95} tick={{ fill: C.text, fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="p1" name="P1 (hasta Nov 14)" radius={[0, 4, 4, 0]}>
              {subjects.map((e, i) => <Cell key={i} fill={e.color} opacity={0.3} />)}
            </Bar>
            <Bar dataKey="p2" name="P2 (Nov 15 → Mar)" radius={[0, 4, 4, 0]}>
              {subjects.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <Legend items={[{ color: "rgba(255,255,255,0.25)", label: "P1 (hasta Nov 14)" }, { color: C.cyan, label: "P2 (Nov 15 → Mar)" }]} />
      </Panel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(158px,1fr))", gap: 10 }}>
        {subjects.map((s, i) => {
          const growth = s.p1 === 0 ? "Nuevo ✦" : `+${Math.round(((s.p2 - s.p1) / s.p1) * 100)}%`;
          return (
            <div key={i} style={{ background: C.panel, border: `1px solid ${s.color}30`, borderRadius: 12, padding: 14, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>{s.subject}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 10, color: C.muted }}>sesiones P2</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: s.color, fontFamily: "'Space Mono',monospace" }}>{s.p2}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: s.p2 >= s.p1 ? C.green : C.pink, fontFamily: "'Space Mono',monospace" }}>{growth}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Professors() {
  return (
    <div>
      <Panel>
        <SectionTitle icon="👨‍🏫">Participación de Profesores — P1 vs P2</SectionTitle>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={professors} layout="vertical" barGap={3}>
            <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fill: C.text, fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="p1" name="P1" radius={[0, 4, 4, 0]}>
              {professors.map((e, i) => <Cell key={i} fill={e.color} opacity={0.3} />)}
            </Bar>
            <Bar dataKey="p2" name="P2" radius={[0, 4, 4, 0]}>
              {professors.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <Legend items={[{ color: "rgba(255,255,255,0.25)", label: "P1" }, { color: C.cyan, label: "P2" }]} />
      </Panel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(148px,1fr))", gap: 10 }}>
        {professors.map((p, i) => (
          <div key={i} style={{ background: C.panel, border: `1px solid ${p.color}30`, borderRadius: 12, padding: 16, textAlign: "center" }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: `${p.color}20`, border: `2px solid ${p.color}60`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 17, fontWeight: 700, color: p.color }}>{p.name[0]}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>{p.name}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.muted, fontFamily: "'Space Mono',monospace" }}>{p.p1}</div>
                <div style={{ fontSize: 10, color: C.muted }}>P1</div>
              </div>
              <div style={{ width: 1, height: 30, background: C.border }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: p.color, fontFamily: "'Space Mono',monospace" }}>{p.p2}</div>
                <div style={{ fontSize: 10, color: C.muted }}>P2</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Demos() {
  return (
    <div>
      <div style={{ background: `linear-gradient(135deg,${C.pink}15,${C.violet}10)`, border: `1px solid ${C.pink}30`, borderRadius: 16, padding: 36, marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: C.pink, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Space Mono',monospace", marginBottom: 12 }}>◈ Alcance Externo</div>
        <div style={{ fontSize: 80, fontWeight: 900, color: C.pink, fontFamily: "'Space Mono',monospace", lineHeight: 1 }}>22</div>
        <div style={{ fontSize: 16, color: C.text, marginTop: 10 }}>sesiones demo con escuelas visitantes</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>13 instituciones distintas · 100% en P2</div>
      </div>
      <Panel>
        <SectionTitle icon="🏫">Escuelas Visitantes</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(195px,1fr))", gap: 10 }}>
          {schools.map((s, i) => {
            const hue = (i * 27) % 360;
            return (
              <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: `hsl(${hue},70%,65%)`, boxShadow: `0 0 8px hsl(${hue},70%,65%)` }} />
                <span style={{ fontSize: 13, color: C.text }}>{s}</span>
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "center" }}>
          {[
            { label: "Experiencia más frecuente", value: "🦕 Isla de Dinosaurios", sub: "Exploración prehistórica en VR", color: C.gold },
            { label: "Instructor de demos",        value: "Henrik",               sub: "Coordinador sesiones externas",  color: C.cyan },
            { label: "Instituciones P1 → P2",      value: "0 → 13",              sub: "el programa llegó al exterior",   color: C.pink },
          ].map((f, i, arr) => (
            <React.Fragment key={i}>
              <div>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Space Mono',monospace", marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: f.color }}>{f.value}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{f.sub}</div>
              </div>
              {i < arr.length - 1 && <div style={{ width: 1, height: 50, background: C.border, flexShrink: 0 }} />}
            </React.Fragment>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
const TABS = [
  { id: "overview",   label: "Overview" },
  { id: "subjects",   label: "Materias" },
  { id: "professors", label: "Profesores" },
  { id: "demos",      label: "Escuelas Visitantes" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [go, setGo] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHeaderVisible(true), 100);
    const t2 = setTimeout(() => setGo(true), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <ErrorBoundary>
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans',sans-serif", overflowX: "hidden" }}>
        <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: `linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "fixed", top: "10%", left: "5%", width: 400, height: 400, background: "radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: "20%", right: "5%", width: 500, height: 500, background: "radial-gradient(circle,rgba(0,229,255,0.08),transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

          {/* Header */}
          <div style={{ marginBottom: 44, opacity: headerVisible ? 1 : 0, transform: headerVisible ? "translateY(0)" : "translateY(-30px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: "0.3em", color: C.cyan, textTransform: "uppercase", fontFamily: "'Space Mono',monospace", marginBottom: 8 }}>◈ Centro Educativo Anglo Mexicano · Ciclo 2025–26</div>
                <h1 style={{ fontSize: "clamp(30px,5vw,54px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.02em", background: `linear-gradient(135deg,#ffffff 0%,${C.cyan} 50%,${C.violet} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: 0 }}>
                  Programa de<br />Realidad Virtual
                </h1>
                <div style={{ fontSize: 14, color: C.muted, marginTop: 10 }}>Reporte de Impacto · Octubre 2025 — Marzo 2026</div>
              </div>
              <div style={{ background: `linear-gradient(135deg,${C.violet}20,${C.cyan}10)`, border: `1px solid ${C.violet}40`, borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Space Mono',monospace" }}>Crecimiento Total</div>
                <div style={{ fontSize: 44, fontWeight: 900, color: C.cyan, fontFamily: "'Space Mono',monospace", lineHeight: 1 }}>+208%</div>
                <div style={{ fontSize: 11, color: C.muted }}>actividades vs. inicio</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 32, background: C.panel, borderRadius: 12, padding: 4, border: `1px solid ${C.border}`, width: "fit-content", flexWrap: "wrap" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "9px 18px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s", background: activeTab === t.id ? `linear-gradient(135deg,${C.cyan}20,${C.violet}20)` : "transparent", color: activeTab === t.id ? C.cyan : C.muted, boxShadow: activeTab === t.id ? `0 0 20px ${C.cyan}20` : "none" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* KEY FIX: all tabs stay mounted, toggled with display */}
          <div style={{ display: activeTab === "overview"   ? "block" : "none" }}><Overview go={go} /></div>
          <div style={{ display: activeTab === "subjects"   ? "block" : "none" }}><Subjects /></div>
          <div style={{ display: activeTab === "professors" ? "block" : "none" }}><Professors /></div>
          <div style={{ display: activeTab === "demos"      ? "block" : "none" }}><Demos /></div>

          <div style={{ marginTop: 44, paddingTop: 20, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontSize: 11, color: C.muted, fontFamily: "'Space Mono',monospace" }}>CEAM · Programa R.V. · Ciclo 2025–26</span>
            <span style={{ fontSize: 11, color: C.muted, fontFamily: "'Space Mono',monospace" }}>Datos al 8 de marzo, 2026</span>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,900&family=Space+Mono:wght@400;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: ${C.bg}; }
          ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        `}</style>
      </div>
    </ErrorBoundary>
  );
}
