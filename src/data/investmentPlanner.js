import { MANAGEMENT_ACTION_COPY } from "../../scripts/process-logic.mjs"
import {
  collectWorkflowSignalsForPortfolio,
  deptSlug,
  getLiveWorkflowBoost,
} from "./investmentWorkflowSignals"
import { generateProcessRecommendation } from "./generateProcessRecommendation"
import { ACTION_ORDER, LEVEL_ORDER } from "./processMapsMeta"
import { filterInvestmentPortfolio, INVESTMENT_PRIORITIES } from "./processFilters"

export { filterInvestmentPortfolio, INVESTMENT_PRIORITIES }

export const INVESTMENT_MATRIX_NOTE =
  "Adozione misurata da usage export · priorità processo simulate · un solo workflow live (Contract Risk Assessment) · altri workflow con mappatura illustrativa."

export const PRIMARY_INVESTMENT = {
  Scale: "Advanced licenses",
  Industrialize: "Process redesign",
  Activate: "Training",
  "Quick win": "Custom assistant",
  Monitor: "Governance controls",
}

export const INVESTMENTS_BY_ACTION = {
  Scale: ["Advanced licenses", "Measurement framework", "Process redesign"],
  Industrialize: ["Process redesign", "Prompt library", "Measurement framework"],
  Activate: ["Training", "Prompt library", "Custom assistant"],
  "Quick win": ["Training", "Custom assistant", "Prompt library"],
  Monitor: ["Governance controls", "Measurement framework"],
}

export const QUADRANTS = [
  { id: "scale", label: "Scale", action: "Scale", x1: 50, x2: 100, y1: 66, y2: 100, color: "CCFF00" },
  { id: "industrialize-h", label: "Industrialize", action: "Industrialize", x1: 25, x2: 50, y1: 66, y2: 100, color: "00F0FF" },
  { id: "activate", label: "Activate", action: "Activate", x1: 0, x2: 25, y1: 66, y2: 100, color: "FF6600" },
  { id: "quickwin", label: "Quick win", action: "Quick win", x1: 0, x2: 25, y1: 33, y2: 66, color: "B400FF" },
  { id: "industrialize-m", label: "Industrialize", action: "Industrialize", x1: 25, x2: 100, y1: 33, y2: 66, color: "00F0FF" },
  { id: "monitor", label: "Monitor", action: "Monitor", x1: 0, x2: 100, y1: 0, y2: 33, color: "64748B" },
]

const POTENTIAL_Y = { Low: 16, Medium: 50, High: 84 }

export function buildInvestmentItem(map, index = 0) {
  const rec = generateProcessRecommendation(map)
  const jitter = ((index % 5) - 2) * 1.8

  return {
    id: map.department,
    process_name: map.process_name,
    department: map.department,
    adoption_rate: map.adoption_rate,
    adoption_level: map.adoption_level,
    adoption_gap: map.adoption_gap,
    ai_potential: map.ai_potential,
    investment_priority: map.management_action,
    recommended_investment: PRIMARY_INVESTMENT[map.management_action] || "Governance controls",
    recommended_investments: INVESTMENTS_BY_ACTION[map.management_action] || ["Governance controls"],
    estimated_impact: rec.expectedImpact,
    expected_outcome: MANAGEMENT_ACTION_COPY[map.management_action] || "",
    color: map.color,
    plotX: Math.min(97, Math.max(3, map.adoption_rate + jitter)),
    plotY: Math.min(97, Math.max(3, (POTENTIAL_Y[map.ai_potential] || 50) + jitter * 0.6)),
  }
}

export function computeCombinedScore(item) {
  const priorityScore = 100 - (ACTION_ORDER[item.investment_priority] ?? 4) * 18
  const gapScore = (LEVEL_ORDER[item.adoption_gap] ?? 2) * 12
  const potentialScore = (LEVEL_ORDER[item.ai_potential] ?? 2) * 8
  const liveBoost = getLiveWorkflowBoost(item.workflows)
  const adoptionBonus = (item.adoption_rate ?? 0) * 0.08
  return Math.round(priorityScore + gapScore + potentialScore + liveBoost + adoptionBonus)
}

export function buildHybridInvestmentItem(map, workflows, index = 0) {
  const base = buildInvestmentItem(map, index)
  const combined_score = computeCombinedScore({ ...base, workflows })

  return {
    ...base,
    id: `dept:${deptSlug(map.department)}`,
    level: "department",
    workflows,
    combined_score,
    live_workflow_boost: getLiveWorkflowBoost(workflows),
    processMapRef: map,
  }
}

export function buildHybridInvestmentPortfolio(processMaps) {
  const signalsByDept = collectWorkflowSignalsForPortfolio(processMaps)
  return processMaps.map((map, i) =>
    buildHybridInvestmentItem(map, signalsByDept[map.department] ?? [], i)
  )
}

export function buildInvestmentPortfolio(processMaps) {
  return buildHybridInvestmentPortfolio(processMaps)
}

export function rankInvestmentPortfolio(items) {
  return [...items].sort((a, b) => {
    const ca = a.combined_score ?? 0
    const cb = b.combined_score ?? 0
    if (ca !== cb) return cb - ca

    const pa = ACTION_ORDER[a.investment_priority] ?? 99
    const pb = ACTION_ORDER[b.investment_priority] ?? 99
    if (pa !== pb) return pa - pb

    const ga = LEVEL_ORDER[a.adoption_gap] ?? 99
    const gb = LEVEL_ORDER[b.adoption_gap] ?? 99
    if (ga !== gb) return ga - gb

    const ap = LEVEL_ORDER[a.ai_potential] ?? 99
    const bp = LEVEL_ORDER[b.ai_potential] ?? 99
    if (ap !== bp) return ap - bp

    return b.adoption_rate - a.adoption_rate
  })
}

export function listInvestmentDepartments(items) {
  return [...new Set(items.map((i) => i.department))].sort()
}
