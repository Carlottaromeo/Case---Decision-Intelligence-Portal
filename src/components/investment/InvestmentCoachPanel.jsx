import { C } from "../../theme"
import { Badge, AiSummaryBadge } from "../UI"
import { DATA_TIERS, WORKFLOW_DATA_TIERS } from "../../data/dashboardCopy"
import { LIVE_WORKFLOW_ID } from "../../data/investmentWorkflowSignals"

const TIER_COLORS = {
  measured: DATA_TIERS.measured.color,
  simulated: DATA_TIERS.simulated.color,
  workflow_live: WORKFLOW_DATA_TIERS.workflow_live.color,
  workflow_illustrative: WORKFLOW_DATA_TIERS.workflow_illustrative.color,
}

function CoachSummaryBlock({ label, text }) {
  return (
    <div className="investment-coach__block">
      <div className="investment-coach__label-row">
        <div className="investment-coach__label">{label}</div>
        <AiSummaryBadge />
      </div>
      <p className="investment-coach__text investment-coach__text--ai">{text}</p>
    </div>
  )
}

export default function InvestmentCoachPanel({ coach, title }) {
  if (!coach) return null

  return (
    <aside className="investment-coach">
      {title !== null && (
        <div className="investment-coach__title-row">
          <h3 className="investment-coach__title">{title ?? "Coach investimenti"}</h3>
          <AiSummaryBadge />
        </div>
      )}
      <div className="investment-coach__badges">
        {(coach.dati ?? []).map((d) => (
          <Badge key={d.tier} label={d.label} color={TIER_COLORS[d.tier] ?? C.muted} />
        ))}
      </div>
      <CoachSummaryBlock label="Perché" text={coach.perche} />
      <CoachSummaryBlock label="Cosa fare" text={coach.cosa_fare} />
    </aside>
  )
}

export function WorkflowCoachPanel({ workflow, deptItem, coach }) {
  if (!workflow || !coach) return null

  const tierLabel = workflow.illustrative
    ? WORKFLOW_DATA_TIERS.workflow_illustrative.label
    : WORKFLOW_DATA_TIERS.workflow_live.label
  const tierColor = workflow.illustrative
    ? WORKFLOW_DATA_TIERS.workflow_illustrative.color
    : WORKFLOW_DATA_TIERS.workflow_live.color

  return (
    <aside className="investment-coach investment-coach--workflow">
      <div className="investment-coach__title-row">
        <h3 className="investment-coach__title">{workflow.title}</h3>
        <AiSummaryBadge />
      </div>
      <div className="investment-coach__badges">
        <Badge label={tierLabel} color={tierColor} />
        <Badge label={`Readiness ${workflow.readiness_score}%`} color={C.indigoDk} />
      </div>
      <InvestmentCoachPanel coach={coach} title={null} />
      {!workflow.illustrative && workflow.id === LIVE_WORKFLOW_ID && workflow.opportunityCount > 0 && (
        <div className="investment-coach__block">
          <div className="investment-coach__label">Opportunità use case (live)</div>
          <ul className="investment-coach__list">
            <li>{workflow.aiOpportunities} consigliate dal tool</li>
            <li>{workflow.manualOpportunities} scritte manualmente</li>
            <li>{workflow.commentCount} commenti nel thread</li>
          </ul>
        </div>
      )}
      {workflow.illustrative && (
        <p className="investment-coach__disclaimer">
          Anteprima illustrativa per {deptItem?.department} — non collegata al builder.
        </p>
      )}
    </aside>
  )
}
