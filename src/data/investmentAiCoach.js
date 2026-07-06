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
    `${item.department} registra un'adozione misurata del ${formatPct(item.adoption_rate)} (${item.adoption_level}) con potenziale AI simulato ${item.ai_potential}.`,
    `La priorità di investimento simulata è ${item.investment_priority}: ${rec.message}`,
  ].join(" ")

  const cosa_fare = [
    `Azione primaria: ${primary}.`,
    steps.length ? `Passi concreti: ${steps.join(" · ")}` : null,
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
      perche: `In un rollout completo, il workflow «${workflow.title}» potrebbe mostrare una readiness illustrativa del ${workflow.readiness_score}% e ${workflow.opportunityCount} opportunità di esempio, coerenti con l'adozione del dipartimento ${deptItem?.department ?? ""}.`,
      cosa_fare: `Scenario prototipo: partire da ${workflow.investment_hint} quando il workflow sarà mappato come Contract Risk Assessment. Non è ancora disponibile nel builder.`,
      dati: [
        { tier: "simulated", label: DATA_TIERS.simulated.label },
        { tier: "workflow_illustrative", label: WORKFLOW_DATA_TIERS.workflow_illustrative.label },
      ],
      rec: null,
    }
  }

  const oppDetail =
    workflow.opportunityCount > 0
      ? `Nel draft live sono documentate ${workflow.opportunityCount} opportunità use case (${workflow.aiOpportunities} consigliate dal tool, ${workflow.manualOpportunities} manuali).`
      : "Il workflow live è disponibile ma non ha ancora opportunità use case documentate nel draft."

  return {
    perche: `Contract Risk Assessment è l'unico workflow con dati reali dal builder. Readiness ${workflow.readiness_score}%: ${oppDetail}`,
    cosa_fare: workflow.opportunityCount > 0
      ? `Priorità: industrializzare le ${workflow.opportunityCount} opportunità tracciate, validare con Compliance e avviare un pilota su intake e scoring.`
      : "Apri il workflow, documenta almeno 2–3 opportunità use case nelle attività OODA e salva il draft per aggiornare il segnale investment.",
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
