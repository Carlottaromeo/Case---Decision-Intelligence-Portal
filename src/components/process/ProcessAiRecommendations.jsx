import { C } from "../../theme"
import { Badge } from "../UI"
import AiSummarySection from "../AiSummarySection"
import { EmphasizedText } from "../../utils/emphasizeAiText"
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
      <AiSummarySection
        title="AI Recommendations"
        className={compact ? "ai-summary-section--compact" : ""}
      >
        <div className="process-ai-rec__panel" style={{
          borderLeft: `3px solid ${actionColor}`,
        }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
            <Badge label={recommendation.priority} color={actionColor} />
            <Badge label={`Impact: ${recommendation.expectedImpact}`} color={LEVEL_COLORS[recommendation.expectedImpact]} />
            <Badge label={recommendation.investmentPriority} color={actionColor} />
          </div>

          <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
            {recommendation.title}
          </h3>

          <EmphasizedText text={recommendation.message} className="process-ai-rec__message" />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "18px 0" }}>
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

          <div className="ai-summary-block__label" style={{ marginBottom: 10 }}>
            Suggested actions
          </div>
          <ol className="process-ai-rec__actions">
            {recommendation.suggestedActions.map((item, i) => (
              <li key={i}>
                <EmphasizedText as="span" text={item} className="process-ai-rec__action-item" />
              </li>
            ))}
          </ol>
        </div>
      </AiSummarySection>
    </div>
  )
}
