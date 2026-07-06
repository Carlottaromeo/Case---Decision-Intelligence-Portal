import { generateProcessRecommendation } from "./generateProcessRecommendation"
import { PRIMARY_INVESTMENT } from "./investmentPlanner"
import { DATA_TIERS, WORKFLOW_DATA_TIERS } from "./dashboardCopy"
import { LIVE_WORKFLOW_ID } from "./investmentWorkflowSignals"

function formatPct(value) {
  return `${Math.round(value ?? 0)}%`
}

export function buildDepartmentCoach(item, processMap) {
  const rec = generateProcessRecommendation(processMap ?? item)
  const primary = PRIMARY_INVESTMENT[item.investment_priority] || "Governance controls"
  const steps = rec.suggestedActions.slice(0, 2)

  const perche = [
    `${item.department} shows measured adoption of ${formatPct(item.adoption_rate)} (${item.adoption_level}) with simulated AI potential ${item.ai_potential}.`,
    `Simulated investment priority is ${item.investment_priority}: ${rec.message}`,
  ].join(" ")

  const cosa_fare = [
    `Primary action: ${primary}.`,
    steps.length ? `Concrete steps: ${steps.join(" · ")}` : null,
  ]
    .filter(Boolean)
    .join(" ")

  const dati = [
    { tier: "measured", label: DATA_TIERS.measured.label },
    { tier: "simulated", label: DATA_TIERS.simulated.label },
  ]

  const liveWf = item.workflows?.find((w) => w.id === LIVE_WORKFLOW_ID && !w.illustrative)
  if (liveWf?.opportunityCount > 0) {
    dati.push({
      tier: "workflow_live",
      label: WORKFLOW_DATA_TIERS.workflow_live.label,
    })
  }

  return { perche, cosa_fare, dati, rec }
}

export function buildWorkflowCoach(workflow, deptItem) {
  if (workflow.illustrative) {
    return {
      perche: `In a full rollout, workflow «${workflow.title}» could show illustrative readiness of ${workflow.readiness_score}% and ${workflow.opportunityCount} sample opportunities, aligned with ${deptItem?.department ?? "department"} adoption.`,
      cosa_fare: `Prototype scenario: start from ${workflow.investment_hint} when the workflow is mapped like Contract Risk Assessment. It is not yet available in the builder.`,
      dati: [
        { tier: "simulated", label: DATA_TIERS.simulated.label },
        { tier: "workflow_illustrative", label: WORKFLOW_DATA_TIERS.workflow_illustrative.label },
      ],
      rec: null,
    }
  }

  const oppDetail =
    workflow.opportunityCount > 0
      ? `The live draft documents ${workflow.opportunityCount} use case opportunities (${workflow.aiOpportunities} tool-recommended, ${workflow.manualOpportunities} manual).`
      : "The live workflow is available but has no use case opportunities documented in the draft yet."

  return {
    perche: `Contract Risk Assessment is the only workflow with real builder data. Readiness ${workflow.readiness_score}%: ${oppDetail}`,
    cosa_fare: workflow.opportunityCount > 0
      ? `Priority: industrialize the ${workflow.opportunityCount} tracked opportunities, validate with Compliance, and launch a pilot on intake and scoring.`
      : "Open the workflow, document at least 2–3 use case opportunities in OODA activities, and save the draft to refresh the investment signal.",
    dati: [
      { tier: "measured", label: DATA_TIERS.measured.label },
      { tier: "workflow_live", label: WORKFLOW_DATA_TIERS.workflow_live.label },
    ],
    rec: null,
  }
}

export function buildTopHeroSnippet(item, processMap) {
  const coach = buildDepartmentCoach(item, processMap)
  const firstSentence = coach.perche.split(". ")[0]
  return firstSentence ? `${firstSentence}.` : coach.perche
}

export function enrichPortfolioWithCoach(portfolio, processMaps) {
  const mapByDept = Object.fromEntries(processMaps.map((m) => [m.department, m]))
  return portfolio.map((item) => ({
    ...item,
    coach: buildDepartmentCoach(item, mapByDept[item.department]),
    heroSnippet: buildTopHeroSnippet(item, mapByDept[item.department]),
  }))
}
