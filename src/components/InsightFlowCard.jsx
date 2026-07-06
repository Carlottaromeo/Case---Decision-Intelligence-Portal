import { AiSummaryBadge } from "./UI"

const SOURCE_LABEL = {
  tool: "Derived from data",
  ai: "AI interpretation",
}

function FlowStep({ step, label, children, accent }) {
  return (
    <div className={`insight-flow__step${accent ? " insight-flow__step--accent" : ""}`}>
      <div className="insight-flow__rail" aria-hidden="true">
        <span className="insight-flow__dot">{step}</span>
        <span className="insight-flow__line" />
      </div>
      <div className="insight-flow__content">
        <p className="insight-flow__label">{label}</p>
        {children}
      </div>
    </div>
  )
}

/**
 * Simple 3-step flow: Insight → Source → AI recommendation.
 * Pass either a full `insight` object or individual fields for context-only panels.
 */
export default function InsightFlowCard({
  insight,
  observation,
  source,
  recommendation,
  isAiRecommendation = false,
}) {
  const obs = observation ?? insight?.observation
  const title = insight?.title
  const howIdentified = source ?? insight?.how_identified
  const detectionType = insight?.detection_type
  const evidence = insight?.evidence ?? []
  const primaryAdvice = insight?.advice?.[0]
  const recTitle = recommendation ?? primaryAdvice?.step
  const recDetail = primaryAdvice?.detail ?? (typeof recommendation === "string" ? null : null)
  const aiRec = isAiRecommendation || detectionType === "ai" || Boolean(primaryAdvice)

  return (
    <article className="insight-flow">
      <FlowStep step={1} label="What we see">
        {title && <h3 className="insight-flow__title">{title}</h3>}
        <p className="insight-flow__text">{obs}</p>
      </FlowStep>

      <FlowStep step={2} label="Where it comes from">
        {detectionType && (
          <span className={`insight-flow__badge insight-flow__badge--${detectionType}`}>
            {SOURCE_LABEL[detectionType] ?? detectionType}
          </span>
        )}
        <p className="insight-flow__text">{howIdentified}</p>
        {evidence.length > 0 && (
          <ul className="insight-flow__evidence">
            {evidence.slice(0, 4).map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        )}
      </FlowStep>

      <FlowStep step={3} label="AI recommendation" accent>
        <div style={{ marginBottom: 10 }}>
          <AiSummaryBadge />
        </div>
        {recTitle && <p className="insight-flow__rec-title">{recTitle}</p>}
        {recDetail && <p className="insight-flow__text">{recDetail}</p>}
        {!recDetail && typeof recommendation === "string" && (
          <p className="insight-flow__text">{recommendation}</p>
        )}
        {insight?.advice?.length > 1 && (
          <ul className="insight-flow__more">
            {insight.advice.slice(1, 3).map((item, i) => (
              <li key={i}>
                <strong>{item.step}</strong>
                {" — "}
                {item.detail}
              </li>
            ))}
          </ul>
        )}
        {aiRec && (
          <p className="insight-flow__ai-note">
            Proposed from historical interventions and measured usage patterns.
          </p>
        )}
      </FlowStep>
    </article>
  )
}
