import {
  classifyManagementAction,
  classifyAdoptionGap,
} from "../../scripts/process-logic.mjs"
import { AI_RECOMMENDATIONS, ACTION_PLANS } from "./processFlows"

const STORAGE_KEY = "northstar-process-assumptions"

export const TIME_SAVING_OPTIONS = ["5–10%", "10–20%", "20–30%", "30%+"]
export const TIMEFRAME_OPTIONS = ["4 weeks", "8 weeks", "12 weeks", "16 weeks"]
export const INVESTMENT_TYPES = [
  "Training",
  "Licenses",
  "Custom Assistant",
  "Process Redesign",
  "Governance",
]
export const LEVEL_OPTIONS = ["Low", "Medium", "High"]

export const INVESTMENT_BY_ACTION = {
  Scale: "Licenses",
  Industrialize: "Process Redesign",
  Activate: "Training",
  "Quick win": "Custom Assistant",
  Monitor: "Governance",
}

const TIME_SAVING_BY_POTENTIAL = {
  High: "20–30%",
  Medium: "10–20%",
  Low: "5–10%",
}

const TIMEFRAME_BY_ACTION = {
  Scale: "12 weeks",
  Industrialize: "8 weeks",
  Activate: "8 weeks",
  "Quick win": "4 weeks",
  Monitor: "12 weeks",
}

function defaultAdoptionTarget(map) {
  const current = map.adoption_rate || 0
  if (current >= 50) return 75
  if (current >= 25) return 50
  return 35
}

export function buildDefaultAssumptions(map) {
  const action = map.management_action
  return {
    department: map.department,
    process_name: map.process_name,
    ai_potential: map.ai_potential,
    time_saving_range: TIME_SAVING_BY_POTENTIAL[map.ai_potential] || "10–20%",
    adoption_target: defaultAdoptionTarget(map),
    target_timeframe: TIMEFRAME_BY_ACTION[action] || "8 weeks",
    investment_type: INVESTMENT_BY_ACTION[action] || "Training",
    confidence_level: "Medium",
    notes: "",
  }
}

export function loadSavedAssumptions(department) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const all = JSON.parse(raw)
    return all[department] || null
  } catch {
    return null
  }
}

export function saveAssumptions(department, assumptions) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[department] = assumptions
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    /* ignore quota / privacy errors */
  }
}

export function clearSavedAssumptions(department) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const all = JSON.parse(raw)
    delete all[department]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

function adoptionGapNarrative(gap, target, current) {
  const delta = target - current
  if (delta <= 0) return `Current adoption (${current}%) already meets or exceeds the ${target}% target.`
  return `Closing a ${delta.toFixed(1)} pp gap from ${current}% to ${target}% is required.`
}

function confidenceQualifier(level) {
  if (level === "High") return "High confidence in these estimates supports committing budget this quarter."
  if (level === "Low") return "Low confidence — treat as a hypothesis and validate with a short pilot before scaling spend."
  return "Medium confidence — proceed with staged investment and checkpoint reviews."
}

export function deriveScenarioOutcome(map, assumptions) {
  const ai_potential = assumptions.ai_potential
  const adoption_level = map.adoption_level
  const management_action = classifyManagementAction(ai_potential, adoption_level)
  const adoption_gap = classifyAdoptionGap(ai_potential, adoption_level)

  const base = AI_RECOMMENDATIONS[management_action] || AI_RECOMMENDATIONS.Monitor
  const gapNote = adoptionGapNarrative(adoption_gap, assumptions.adoption_target, map.adoption_rate)
  const confidenceNote = confidenceQualifier(assumptions.confidence_level)

  const recommendation = [
    base,
    `Scenario assumption: ${assumptions.time_saving_range} estimated time saving on representative steps (simulated), targeting ${assumptions.adoption_target}% measured adoption within ${assumptions.target_timeframe}.`,
    gapNote,
    `Primary investment lever: ${assumptions.investment_type}. ${confidenceNote}`,
    assumptions.notes?.trim() ? `Notes: ${assumptions.notes.trim()}` : null,
  ].filter(Boolean).join(" ")

  const basePlan = ACTION_PLANS[management_action] || ACTION_PLANS.Monitor
  const actionPlan = [
    `Align on ${assumptions.adoption_target}% adoption target over ${assumptions.target_timeframe}`,
    `Prioritise ${assumptions.investment_type} as the main investment type`,
    ...basePlan.slice(0, 3),
  ]

  const defaults = buildDefaultAssumptions(map)
  const isCustomized = JSON.stringify(assumptions) !== JSON.stringify(defaults)

  return {
    ai_potential,
    adoption_gap,
    management_action,
    recommendation,
    actionPlan,
    isCustomized,
  }
}
