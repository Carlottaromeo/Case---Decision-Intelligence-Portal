import { C } from "../../theme"
import { Badge } from "../UI"
import { WORKFLOW_DATA_TIERS } from "../../data/dashboardCopy"
import { LIVE_WORKFLOW_ID } from "../../data/investmentWorkflowSignals"
import { buildWorkflowCoach } from "../../data/investmentAiCoach"

export default function InvestmentWorkflowDetail({
  item,
  selectedWorkflowId,
  onSelectWorkflow,
  onNavigate,
}) {
  if (!item?.workflows?.length) return null

  return (
    <section className="investment-workflows">
      <h3 className="investment-workflows__title">
        Workflow in {item.department}
      </h3>
      <p className="investment-workflows__sub">
        Un workflow live (Contract Risk Assessment) · altri con mappatura illustrativa
      </p>
      <div className="investment-workflows__list">
        {item.workflows.map((wf) => {
          const isLive = !wf.illustrative
          const tier = isLive
            ? WORKFLOW_DATA_TIERS.workflow_live
            : WORKFLOW_DATA_TIERS.workflow_illustrative
          const isSelected = selectedWorkflowId === wf.id

          return (
            <div
              key={wf.id}
              className={`investment-workflow-row${isSelected ? " investment-workflow-row--selected" : ""}${isLive ? " investment-workflow-row--live" : ""}`}
            >
              <button
                type="button"
                className="investment-workflow-row__main"
                onClick={() => onSelectWorkflow?.(wf)}
              >
                <div className="investment-workflow-row__head">
                  <span className="investment-workflow-row__name">{wf.title}</span>
                  <Badge label={tier.label} color={tier.color} />
                </div>
                <div className="investment-workflow-row__meta">
                  <span>Readiness {wf.readiness_score}%</span>
                  <span>·</span>
                  <span>{wf.opportunityCount} opportunità</span>
                  <span>·</span>
                  <span>{wf.investment_hint}</span>
                </div>
                <div className="investment-workflow-row__ooda">{wf.ooda}</div>
              </button>
              {isLive && wf.id === LIVE_WORKFLOW_ID && (
                <button
                  type="button"
                  className="investment-btn investment-btn--primary investment-workflow-row__cta"
                  onClick={() =>
                    onNavigate?.({
                      sectionId: "process",
                      pageId: "portfolio",
                      processNav: {
                        view: "workflow",
                        dept: item.department,
                        workflowId: LIVE_WORKFLOW_ID,
                      },
                    })
                  }
                >
                  Apri workflow
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function getWorkflowCoach(workflow, deptItem) {
  if (!workflow) return null
  return buildWorkflowCoach(workflow, deptItem)
}
