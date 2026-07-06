/** Shared process-map classification rules (used by process-data.mjs). */

export function adoptionLevel(rate) {
  if (rate >= 50) return "High"
  if (rate >= 25) return "Medium"
  return "Low"
}

export function classifyAiPotential(crWeek, totalCredits) {
  if (crWeek >= 75 || totalCredits >= 80000) return "High"
  if (crWeek >= 45 || totalCredits >= 20000) return "Medium"
  return "Low"
}

export function classifyAdoptionGap(aiPotential, level) {
  if (aiPotential === "High") {
    if (level === "Low") return "High"
    if (level === "Medium") return "Medium"
    return "Low"
  }
  if (aiPotential === "Medium") {
    if (level === "Low") return "Medium"
    return "Low"
  }
  return "Low"
}

export function classifyManagementAction(aiPotential, level) {
  if (aiPotential === "Low") return "Monitor"
  if (level === "High" && aiPotential === "High") return "Scale"
  if (level === "Medium" && aiPotential === "High") return "Industrialize"
  if (level === "Low" && aiPotential === "High") return "Activate"
  if (level === "Low" && aiPotential === "Medium") return "Quick win"
  if (level === "High" && aiPotential === "Medium") return "Industrialize"
  return "Monitor"
}

export const MANAGEMENT_ACTION_COPY = {
  Scale: "Expand access and replicate projected usage patterns across the department (simulated opportunity).",
  Industrialize: "Deepen adoption among active users and standardise illustrative high-value opportunities.",
  Activate: "High simulated AI potential but measured low uptake — prioritise access, awareness, and targeted enablement.",
  "Quick win": "Targeted pilot with medium simulated potential and low measured coverage — low-risk entry point.",
  Monitor: "Track measured usage and revisit when intensity or process-level data becomes available.",
}
