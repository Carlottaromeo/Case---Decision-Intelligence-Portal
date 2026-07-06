/** Browser copy of scripts/dept-normalize.mjs */

export const DEPT_ALIASES = {
  "Customer Suport": "Customer Support",
  Technlogy: "Technology",
  "Risk and Compliance": "Risk & Compliance",
  "Sales & Partnerships": "Sales & Part.",
  Sconosciuto: "Unknown",
}

/** Extra variants matched case-insensitively. */
export const DEPT_ALIASES_CI = {
  "customer suprt": "Customer Support",
  "customer suport": "Customer Support",
  "customer-support": "Customer Support",
  "customer support": "Customer Support",
  technlogy: "Technology",
  technology: "Technology",
}

const CANONICAL_LOOKUP = new Map()
for (const [from, to] of Object.entries(DEPT_ALIASES)) {
  CANONICAL_LOOKUP.set(from, to)
  CANONICAL_LOOKUP.set(from.toLowerCase(), to)
}
for (const [from, to] of Object.entries(DEPT_ALIASES_CI)) {
  CANONICAL_LOOKUP.set(from, to)
  CANONICAL_LOOKUP.set(from.toLowerCase(), to)
}

export function normalizeDepartmentName(raw) {
  if (raw === undefined || raw === null) return "Unknown"
  const trimmed = String(raw).trim()
  if (!trimmed || trimmed === "undefined") return "Unknown"
  return CANONICAL_LOOKUP.get(trimmed) ?? CANONICAL_LOOKUP.get(trimmed.toLowerCase()) ?? trimmed
}

export function normalizeSeniority(raw) {
  if (raw === undefined || raw === null) return "Unknown"
  const trimmed = String(raw).trim()
  return trimmed || "Unknown"
}
