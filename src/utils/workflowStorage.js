import { migrateWorkflowComments } from "./workflowComments"
import { migrateCardUseCases } from "./workflowUseCases"

const PREFIX = "northstar-workflow-draft:"

function migrateWorkflow(workflow) {
  const withComments = migrateWorkflowComments(workflow)
  return {
    ...withComments,
    phases: withComments.phases.map((phase) => ({
      ...phase,
      cards: phase.cards.map(migrateCardUseCases),
    })),
  }
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
