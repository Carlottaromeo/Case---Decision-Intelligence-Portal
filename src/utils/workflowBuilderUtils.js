export function cloneWorkflow(workflow) {
  return JSON.parse(JSON.stringify(workflow))
}

export function ownerInitials(owner) {
  if (!owner) return "?"
  const parts = String(owner).split(/[\s+&/]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

export function createActivityCard(overrides = {}) {
  return {
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: "New activity",
    summary: "Describe what happens in this step.",
    owner: "Process owner",
    timeAsIs: "1 day",
    timeToBe: "4h",
    aiToday: "None",
    aiStatus: "opportunity",
    aiTools: [],
    useCaseOpportunities: [],
    commentThread: [],
    ownerEmployeeId: null,
    ownerLabel: null,
    ...overrides,
  }
}

export const DEFAULT_PARAMS = [
  { id: "year", label: "Year", value: "2026" },
  { id: "scenario", label: "Scenario", value: "Base case" },
]

export const PHASE_UI = {
  observe: { bg: "#eef6ff", border: "#bfdbfe", labelColor: "#2563eb" },
  orient: { bg: "#f5f3ff", border: "#ddd6fe", labelColor: "#7c3aed" },
  decide: { bg: "#fffbeb", border: "#fde68a", labelColor: "#d97706" },
  act: { bg: "#ecfdf5", border: "#a7f3d0", labelColor: "#059669" },
}
