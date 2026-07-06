import { C, glass, LOCALE } from '../theme'
import { DATA_TIERS, AI_SUMMARY } from '../data/dashboardCopy'

const glassBase = {
  ...glass,
  borderRadius: 20,
}

// ─── CARD ────────────────────────────────────────────────────────────────────
export function Card({ children, style, accent, id, className }) {
  return (
    <div
      id={id}
      className={className ? `glass-panel ${className}` : "glass-panel"}
      style={{
      position: "relative",
      borderRadius: 20,
      padding: 24,
      border: accent ? `1px solid ${accent}44` : glass.border,
      boxShadow: accent
        ? `${C.shadowMd}, 0 0 0 1px ${accent}22`
        : glass.boxShadow,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── KPI CARD ────────────────────────────────────────────────────────────────
export function KpiCard({ label, value, sub, color, highlight }) {
  return (
    <div className="glass-panel" style={{
      borderRadius: 20,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      border: highlight ? `1px solid ${color}55` : glass.border,
      background: highlight ? `${color}12` : glass.background,
    }}>
      <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: highlight ? color : C.text, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: C.subtle }}>{sub}</div>}
    </div>
  )
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
export function SH({ title, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ─── EXECUTIVE INSIGHT ───────────────────────────────────────────────────────
export function AiSummaryBadge({ title }) {
  return (
    <Badge
      label={AI_SUMMARY.label}
      color={AI_SUMMARY.color}
      title={title ?? AI_SUMMARY.description}
    />
  )
}

export function ExecutiveInsight({ see, matter, action, badge, badgeColor }) {
  return (
    <div className="glass-panel" style={{
      borderRadius: 12,
      padding: "16px 20px",
      borderLeft: `3px solid ${C.accent}`,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 16,
      background: C.surface,
    }}>
      <div style={{ gridColumn: "1 / -1", marginBottom: -4, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <AiSummaryBadge />
        {badge && <Badge label={badge} color={badgeColor || DATA_TIERS.simulated.color} />}
      </div>
      {[
        { label: "What we see", text: see },
        { label: "Why it matters", text: matter },
        { label: "Recommended action", text: action },
      ].map((block) => (
        <div key={block.label}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            {block.label}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>{block.text}</p>
        </div>
      ))}
    </div>
  )
}

// ─── CALLOUT ─────────────────────────────────────────────────────────────────
export function Callout({ color, children, variant = "default" }) {
  const isAlert = variant === "alert"
  return (
    <div className="glass-panel" style={{
      borderRadius: 16,
      padding: "14px 18px",
      fontSize: 13,
      color: C.textSub,
      lineHeight: 1.65,
      borderLeft: `3px solid ${color}`,
      background: isAlert ? `${color}10` : glass.background,
      border: `1px solid ${color}30`,
      borderLeftWidth: 3,
      borderLeftColor: color,
    }}>
      {children}
    </div>
  )
}

// ─── BADGE ───────────────────────────────────────────────────────────────────
export function Badge({ label, color, title }) {
  return (
    <span
      title={title}
      style={{
      fontSize: 11,
      fontWeight: 600,
      padding: "4px 12px",
      borderRadius: 20,
      background: `${color}18`,
      color,
      border: `1px solid ${color}35`,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  )
}

// ─── PILL TOGGLE ─────────────────────────────────────────────────────────────
export function PillToggle({ options, value, onChange }) {
  return (
    <div style={{
      display: "inline-flex",
      gap: 4,
      padding: 4,
      borderRadius: 24,
      background: C.pillBg,
      border: `1px solid ${C.glassBorder}`,
    }}>
      {options.map(([k, label]) => (
        <button key={k} onClick={() => onChange(k)} style={{
          padding: "6px 14px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          transition: "all 0.2s",
          background: value === k ? C.accent : "transparent",
          color: value === k ? C.onAccent : C.muted,
        }}>{label}</button>
      ))}
    </div>
  )
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel-strong" style={{
      borderRadius: 12,
      padding: "10px 14px",
      fontSize: 12,
      color: C.textSub,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: C.text }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ color: C.muted }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: C.text }}>
            {typeof p.value === "number" ? p.value.toLocaleString(LOCALE) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── MINI BAR ────────────────────────────────────────────────────────────────
export function MiniBar({ value, max = 100, color, height = 6 }) {
  return (
    <div style={{ width: "100%", height, borderRadius: height, background: C.track, overflow: "hidden" }}>
      <div style={{
        width: `${Math.min((value / max) * 100, 100)}%`,
        height: "100%",
        background: color,
        borderRadius: height,
        boxShadow: value > 0 ? `0 0 8px ${color}66` : "none",
      }} />
    </div>
  )
}

export { glassBase }
