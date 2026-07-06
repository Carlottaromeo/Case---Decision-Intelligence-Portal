import { WORKFLOW_CATALOG } from "./workflowCatalog"
import { CONTRACT_RISK_WORKFLOW } from "./contractRiskWorkflow"
import { loadWorkflowDraft } from "../utils/workflowStorage"
import { migrateWorkflowComments } from "../utils/workflowComments"
import { migrateCardUseCases } from "../utils/workflowUseCases"

export const LIVE_WORKFLOW_ID = "contract-risk-assessment"

const ILLUSTRATIVE_HINTS = [
  "Pilot enablement",
  "Process redesign",
  "Custom assistant",
  "Training",
  "Governance controls",
  "Prompt library",
]

function deptSlug(department) {
  return String(department ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function stableHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

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

function getLiveWorkflowSource() {
  const draft = loadWorkflowDraft(LIVE_WORKFLOW_ID)
  if (draft?.workflow) {
    return {
      workflow: migrateWorkflow(draft.workflow),
      hasDraft: true,
      savedAt: draft.savedAt ?? null,
    }
  }
  return {
    workflow: migrateWorkflow(CONTRACT_RISK_WORKFLOW),
    hasDraft: false,
    savedAt: null,
  }
}

function collectWorkflowMetrics(workflow) {
  let activityCount = 0
  let opportunityCount = 0
  let aiOpportunities = 0
  let manualOpportunities = 0
  let commentCount = 0
  let activeAi = 0
  let opportunityAi = 0

  for (const phase of workflow.phases ?? []) {
    for (const card of phase.cards ?? []) {
      activityCount++
      const opps = card.useCaseOpportunities ?? []
      opportunityCount += opps.length
      for (const o of opps) {
        if (o.source === "ai") aiOpportunities++
        else manualOpportunities++
      }
      commentCount += (card.commentThread ?? []).length
      if (card.aiStatus === "active") activeAi++
      if (card.aiStatus === "opportunity") opportunityAi++
    }
  }

  return {
    activityCount,
    opportunityCount,
    aiOpportunities,
    manualOpportunities,
    commentCount,
    activeAi,
    opportunityAi,
  }
}

function computeLiveReadinessScore(metrics, hasDraft) {
  let score = hasDraft ? 25 : 15
  score += Math.min(metrics.opportunityCount * 12, 36)
  score += Math.min(metrics.commentCount * 4, 12)
  if (metrics.aiOpportunities > 0 && metrics.manualOpportunities > 0) score += 8
  if (metrics.activeAi > 0) score += 5
  if (metrics.opportunityAi > 0) score += 5
  return Math.min(100, Math.round(score))
}

export function buildLiveWorkflowSignal(catalogEntry, deptMetrics) {
  const { workflow, hasDraft, savedAt } = getLiveWorkflowSource()
  const metrics = collectWorkflowMetrics(workflow)

  return {
    id: catalogEntry.id,
    title: catalogEntry.title,
    description: catalogEntry.description,
    ooda: catalogEntry.ooda,
    clickable: true,
    illustrative: false,
    data_source: "live",
    hasDraft,
    savedAt,
    ...metrics,
    readiness_score: computeLiveReadinessScore(metrics, hasDraft),
    investment_hint: metrics.opportunityCount > 0 ? "Process redesign" : "Training",
    department: deptMetrics?.department ?? workflow.department,
  }
}

export function buildIllustrativeWorkflowSignal(catalogEntry, deptMetrics) {
  const hash = stableHash(catalogEntry.id)
  const adoption = deptMetrics?.adoption_rate ?? 30
  const potential = deptMetrics?.ai_potential ?? "Medium"

  const potentialOpps = { High: 4, Medium: 2, Low: 1 }
  const baseOpps = potentialOpps[potential] ?? 2
  const opportunityCount = Math.min(4, Math.max(1, baseOpps + (hash % 2)))

  const jitter = (hash % 21) - 10
  const readiness_score = Math.min(100, Math.max(8, Math.round(adoption * 0.55 + jitter + 12)))

  return {
    id: catalogEntry.id,
    title: catalogEntry.title,
    description: catalogEntry.description,
    ooda: catalogEntry.ooda,
    clickable: false,
    illustrative: true,
    data_source: "illustrative",
    hasDraft: false,
    savedAt: null,
    activityCount: 3 + (hash % 4),
    opportunityCount,
    aiOpportunities: Math.max(0, opportunityCount - 1),
    manualOpportunities: opportunityCount > 0 ? 1 : 0,
    commentCount: hash % 3,
    activeAi: hash % 2,
    opportunityAi: 1 + (hash % 2),
    readiness_score,
    investment_hint: ILLUSTRATIVE_HINTS[hash % ILLUSTRATIVE_HINTS.length],
    department: deptMetrics?.department,
  }
}

export function buildWorkflowSignal(catalogEntry, deptMetrics) {
  if (catalogEntry.id === LIVE_WORKFLOW_ID) {
    return buildLiveWorkflowSignal(catalogEntry, deptMetrics)
  }
  return buildIllustrativeWorkflowSignal(catalogEntry, deptMetrics)
}

export function collectDepartmentWorkflowSignals(department, deptMetrics) {
  const catalog = WORKFLOW_CATALOG[department] ?? []
  return catalog.map((entry) => buildWorkflowSignal(entry, { ...deptMetrics, department }))
}

export function collectWorkflowSignalsForPortfolio(processMaps) {
  const byDept = {}
  for (const map of processMaps) {
    byDept[map.department] = collectDepartmentWorkflowSignals(map.department, map)
  }
  return byDept
}

export function getLiveWorkflowBoost(workflows) {
  const live = workflows?.find((w) => w.id === LIVE_WORKFLOW_ID && !w.illustrative)
  if (!live || live.opportunityCount <= 0) return 0
  return 15 + live.opportunityCount * 3
}

export { deptSlug }
