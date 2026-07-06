import { C } from "../../theme"
import { Badge, AiSummaryBadge } from "../UI"
import { ACTION_COLORS, LEVEL_COLORS } from "../../data/processMapsMeta"
import ProcessMetric from "./ProcessMetric"

function MetaRow({ label, value, accent }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 4,
      padding: "10px 12px",
      borderRadius: 12,
      background: C.surface2,
      border: `1px solid ${C.glassBorder}`,
      flex: "1 1 140px",
      minWidth: 130,
    }}>
      <span style={{ fontSize: 9, fontWeight: 600, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </span>
      <span style={{ fontSize: 12, fontWeight: 700, color: accent || C.text, lineHeight: 1.35 }}>
        {value}
      </span>
    </div>
  )
}

const TREND_COLORS = {
  Growing: C.accent,
  Stable: C.muted,
  Declining: C.amber,
}

export default function ProcessAiRecommendations({ recommendation, compact = false }) {
  const { signals } = recommendation
  const actionColor = ACTION_COLORS[recommendation.investmentPriority] || C.muted

  return (
    <div style={{ marginBottom: compact ? 0 : 24 }}>
      {!compact && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            AI Recommendations
          </div>
          <AiSummaryBadge />
        </div>
      )}

      <div className="glass-panel" style={{
        borderRadius: 16,
        padding: "18px 20px",
        borderLeft: `3px solid ${actionColor}`,
      }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
          {compact && <AiSummaryBadge />}
          <Badge label={recommendation.priority} color={actionColor} />
          <Badge label={`Impact: ${recommendation.expectedImpact}`} color={LEVEL_COLORS[recommendation.expectedImpact]} />
          <Badge label={recommendation.investmentPriority} color={actionColor} />
        </div>

        <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
          {recommendation.title}
        </h3>

        <p style={{ margin: "0 0 18px", fontSize: 13, color: C.textSub, lineHeight: 1.65 }}>
          {recommendation.message}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
          <MetaRow label="Suggested owner" value={recommendation.suggestedOwner} />
          <MetaRow label="Investment type" value={recommendation.recommendedInvestmentType} accent={C.cyan} />
          <MetaRow label="KPI to monitor" value={recommendation.kpiToMonitor} />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
          gap: 12,
          padding: "12px 0",
          marginBottom: 16,
          borderTop: `1px solid ${C.glassBorder}`,
          borderBottom: `1px solid ${C.glassBorder}`,
        }}>
          <ProcessMetric label="Dept. adoption" value={`${signals.adoptionRate}% (${signals.adoptionLevel})`} compact />
          <ProcessMetric label="AI potential" value={signals.aiPotential} compact />
          <ProcessMetric label="Sessions trend" value={signals.sessionsTrend} accent={TREND_COLORS[signals.sessionsTrend]} compact />
          <ProcessMetric label="Credits trend" value={signals.creditsTrend} accent={TREND_COLORS[signals.creditsTrend]} compact />
          <ProcessMetric label="Dept. size" value={signals.departmentSize} compact />
          <ProcessMetric label="Avg credits / active" value={signals.avgCreditsPerActiveUser.toLocaleString()} compact />
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          Suggested actions
        </div>
        <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          {recommendation.suggestedActions.map((item, i) => (
            <li key={i} style={{ fontSize: 13, color: C.textSub, lineHeight: 1.55 }}>
              {item}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
