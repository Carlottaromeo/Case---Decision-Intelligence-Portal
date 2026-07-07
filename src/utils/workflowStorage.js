import { migrateWorkflowComments } from "./workflowComments"
import { migrateCardUseCases } from "./workflowUseCases"

const PREFIX = "northstar-workflow-draft:"
const CONTRACT_RISK_WORKFLOW_ID = "contract-risk-assessment"

function stripLegacyContractRiskOpportunities(workflow) {
  if (workflow?.id !== CONTRACT_RISK_WORKFLOW_ID) return workflow
  return {
    ...workflow,
    phases: (workflow.phases ?? []).map((phase) => ({
      ...phase,
      cards: (phase.cards ?? []).map((card) => ({
        ...card,
        useCaseOpportunities: (card.useCaseOpportunities ?? []).filter(
          (o) => o.authorName !== "Imported"
        ),
      })),
    })),
  }
}

function migrateWorkflow(workflow) {
  const withComments = migrateWorkflowComments(workflow)
  const withUseCases = {
    ...withComments,
    phases: withComments.phases.map((phase) => ({
      ...phase,
      cards: phase.cards.map(migrateCardUseCases),
    })),
  }
  return stripLegacyContractRiskOpportunities(withUseCases)
}

export function loadWorkflowDraft(workflowId) {
  if (!workflowId) return null
  try {
    const raw = localStorage.getItem(PREFIX + workflowId)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      ...parsed,
      workflow: migrateWorkflow(parsed.workflow),
    }
  } catch {
    return null
  }
}

export function saveWorkflowDraft(workflowId, { workflow, params }) {
  if (!workflowId) return
  try {
    localStorage.setItem(
      PREFIX + workflowId,
      JSON.stringify({
        workflow: migrateWorkflow(workflow),
        params,
        savedAt: new Date().toISOString(),
      })
    )
  } catch {
    /* ignore quota errors */
  }
}
