import { PROCESS_FLOW_DEFINITIONS } from "./processFlows"

const TOOL_MIX_KEY = {
  Chat: "chat",
  Excel: "excel",
  "Coding IDE": "coding",
  "Custom Assistant": "chat",
}

const LEVEL_SCORE = { High: 0.78, Medium: 0.52, Low: 0.28 }

function toolAffinity(tool, dept) {
  if (!dept) return 0.45
  const key = TOOL_MIX_KEY[tool]
  if (!key) return 0.4
  return (dept[key] || 0) / 100
}

export function enrichProcessStep(stepDef, map, dept, index, totalSteps) {
  const affinity = toolAffinity(stepDef.tool, dept)
  const deptScore = LEVEL_SCORE[map.adoption_level] ?? 0.5
  const positionFactor = 1 - Math.abs(index / Math.max(totalSteps - 1, 1) - 0.5) * 0.15
  const composite = deptScore * 0.55 + affinity * 0.45 * positionFactor

  let simulated_adoption = "Low"
  if (composite >= 0.62) simulated_adoption = "High"
  else if (composite >= 0.42) simulated_adoption = "Medium"

  let gap = "Low"
  if (map.ai_potential === "High") {
    if (simulated_adoption === "Low") gap = "High"
    else if (simulated_adoption === "Medium") gap = "Medium"
  } else if (map.ai_potential === "Medium" && simulated_adoption === "Low") {
    gap = "Medium"
  }

  let recommended_action = "Monitor"
  if (simulated_adoption === "High") recommended_action = "Standardize"
  else if (simulated_adoption === "Medium") recommended_action = "Expand pilot"
  else if (map.ai_potential !== "Low") recommended_action = "Enable & train"
  else recommended_action = "Monitor"

  return {
    ...stepDef,
    simulated_adoption,
    gap,
    recommended_action,
    adoption_score: Math.round(composite * 100),
  }
}

export function getEnrichedProcessFlow(map, dept) {
  const defs = PROCESS_FLOW_DEFINITIONS[map.department] || []
  return defs.map((step, i) => enrichProcessStep(step, map, dept, i, defs.length))
}

export function flowAdoptionSummary(steps) {
  if (!steps.length) return { high: 0, medium: 0, low: 0 }
  return steps.reduce(
    (acc, s) => {
      const k = s.simulated_adoption.toLowerCase()
      acc[k] = (acc[k] || 0) + 1
      return acc
    },
    { high: 0, medium: 0, low: 0 }
  )
}
