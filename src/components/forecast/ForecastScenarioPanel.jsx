import { C, LOCALE } from "../../theme"
import { Badge } from "../UI"
import { LEVEL_COLORS } from "../../data/processMapsMeta"

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{value}</div>
    </div>
  )
}

export default function ForecastScenarioPanel({ scenario, confidence, active }) {
  const col = `#${scenario.color}`

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: 16,
        padding: "16px 18px",
        border: active ? `1px solid ${col}66` : `1px solid ${C.glassBorder}`,
        background: active ? `${col}10` : undefined,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: active ? col : C.text }}>{scenario.label}</div>
        {active && <Badge label="Selected" color={col} />}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
        marginBottom: 14,
        paddingBottom: 14,
        borderBottom: `1px solid ${C.glassBorder}`,
      }}>
        <Stat label="Credits (4w total)" value={scenario.credits.total4.toLocaleString(LOCALE)} />
        <Stat label="Credits (8w total)" value={scenario.credits.total8.toLocaleString(LOCALE)} />
        <Stat label="Sessions (8w total)" value={scenario.sessions.total8.toLocaleString(LOCALE)} />
        <Stat label="Active users (wk 8)" value={scenario.active_users.week8.toLocaleString(LOCALE)} />
      </div>

      <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
        8-week credits growth: <span style={{ color: col, fontWeight: 700 }}>{scenario.growthRate8 >= 0 ? "+" : ""}{scenario.growthRate8}%</span>
        {" · "}
        Confidence: <span style={{ color: LEVEL_COLORS[confidence], fontWeight: 700 }}>{confidence}</span>
      </div>

      <p style={{ margin: 0, fontSize: 12, color: C.textSub, lineHeight: 1.6, borderLeft: `3px solid ${col}`, paddingLeft: 10 }}>
        {scenario.implication}
      </p>
    </div>
  )
}
