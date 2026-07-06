/** Department name normalization — shared by process-data.mjs and documentation. */

export const DEPT_ALIASES = {
  "Customer Suport": "Customer Support",
  Technlogy: "Technology",
  "Risk and Compliance": "Risk & Compliance",
  "Sales & Partnerships": "Sales & Part.",
  Sconosciuto: "Unknown",
}

export function normalizeDepartmentName(raw) {
  if (raw === undefined || raw === null) return "Unknown"
  const trimmed = String(raw).trim()
  if (!trimmed || trimmed === "undefined") return "Unknown"
  if (DEPT_ALIASES[trimmed] !== undefined) return DEPT_ALIASES[trimmed]
  return trimmed
}

export function normalizeSeniority(raw) {
  if (raw === undefined || raw === null) return "Unknown"
  const trimmed = String(raw).trim()
  return trimmed || "Unknown"
}
