import { C, CHART } from "../../theme"
import { Badge } from "../UI"
import { LEVEL_COLORS, deptColor } from "../../data/processMapsMeta"
import { OPPORTUNITY_LABEL } from "../../data/dashboardCopy"

const ADOPTION_BAR = {
  High: C.accent,
  Medium: CHART.secondary,
  Low: C.subtle,
}

const TOOL_COLORS = {
  Chat: CHART.tools.Chat,
  Excel: CHART.tools.Excel,
  "Coding IDE": CHART.tools["Coding IDE"],
  "Custom Assistant": CHART.tertiary,
}

export default function ProcessFlowStep({ step, index, total, accent }) {
  const col = accent || C.accent
  const isLast = index === total - 1

  return (
    <div style={{ display: "flex", gap: 14, position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 28 }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: `${ADOPTION_BAR[step.simulated_adoption]}22`,
          border: `2px solid ${ADOPTION_BAR[step.simulated_adoption]}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 800,
          color: ADOPTION_BAR[step.simulated_adoption],
          zIndex: 1,
        }}>
          {index + 1}
        </div>
        {!isLast && (
          <div style={{
            width: 2,
            flex: 1,
            minHeight: 24,
            background: `linear-gradient(${ADOPTION_BAR[step.simulated_adoption]}, ${C.glassBorder})`,
            marginTop: 4,
          }} />
        )}
      </div>

      <div
        className="glass-panel"
        style={{
          flex: 1,
          marginBottom: isLast ? 0 : 12,
          padding: "14px 16px",
          borderRadius: 14,
          border: `1px solid ${ADOPTION_BAR[step.simulated_adoption]}33`,
          background: `${ADOPTION_BAR[step.simulated_adoption]}08`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{step.step}</div>
          <Badge label={`Simulated adoption: ${step.simulated_adoption}`} color={ADOPTION_BAR[step.simulated_adoption]} />
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
          {OPPORTUNITY_LABEL}
        </div>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: C.textSub, lineHeight: 1.55 }}>
          {step.opportunity}
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <Badge label={step.tool} color={TOOL_COLORS[step.tool] || col} />
          <Badge label={`Gap: ${step.gap}`} color={LEVEL_COLORS[step.gap]} />
          <Badge label={step.recommended_action} color={C.muted} />
        </div>
        <div style={{ height: 4, borderRadius: 2, background: C.track, overflow: "hidden" }}>
          <div style={{
            width: `${step.adoption_score}%`,
            height: "100%",
            background: ADOPTION_BAR[step.simulated_adoption],
            borderRadius: 2,
            boxShadow: `0 0 8px ${ADOPTION_BAR[step.simulated_adoption]}66`,
          }} />
        </div>
      </div>
    </div>
  )
}

export function ProcessFlowOverlay({ summary, accent }) {
  const total = summary.high + summary.medium + summary.low
  if (!total) return null
  const col = accent || C.accent

  return (
    <div className="glass-panel" style={{ borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
        AI usage projected onto this representative process
      </div>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
        {summary.high > 0 && (
          <div style={{ flex: summary.high, background: C.accent }} title={`High: ${summary.high}`} />
        )}
        {summary.medium > 0 && (
          <div style={{ flex: summary.medium, background: CHART.secondary }} title={`Medium: ${summary.medium}`} />
        )}
        {summary.low > 0 && (
          <div style={{ flex: summary.low, background: C.subtle }} title={`Low: ${summary.low}`} />
        )}
      </div>
      <div style={{ display: "flex", gap: 16, fontSize: 11, color: C.muted, flexWrap: "wrap" }}>
        <span><span style={{ color: C.accent }}>■</span> High {summary.high}</span>
        <span><span style={{ color: CHART.secondary }}>■</span> Medium {summary.medium}</span>
        <span><span style={{ color: C.subtle }}>■</span> Low {summary.low}</span>
        <span style={{ marginLeft: "auto", color: col }}>{total} steps simulated</span>
      </div>
    </div>
  )
}
