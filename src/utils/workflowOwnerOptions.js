/** Workflow role presets + employee roster options for owner assignment. */

export const WORKFLOW_ROLE_PRESETS = [
  "Compliance Officer",
  "Risk Analyst",
  "Legal Reviewer",
  "Department Head",
  "Risk Analyst + Compliance Officer",
  "Process owner",
]

export function formatEmployeeOwner(employee) {
  if (!employee) return ""
  if (employee.full_name) {
    return `${employee.full_name} · ${employee.employee_id}`
  }
  return `${employee.employee_id} · ${employee.seniority}`
}

export function getOwnersForDepartment(roster, department, usageRecords = [], limit = 80) {
  const dept = String(department ?? "").trim()
  const employees = (roster ?? [])
    .filter((e) => e.department === dept)
    .slice(0, limit)

  const usageById = new Map()
  for (const r of usageRecords ?? []) {
    if (r.department !== dept) continue
    const prev = usageById.get(r.employee_id) ?? 0
    usageById.set(r.employee_id, prev + (r.credits ?? 0))
  }

  const topIds = [...usageById.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([id]) => id)

  const topEmployees = topIds
    .map((id) => employees.find((e) => e.employee_id === id))
    .filter(Boolean)

  const rest = employees.filter((e) => !topIds.includes(e.employee_id))

  return {
    roles: WORKFLOW_ROLE_PRESETS,
    topEmployees,
    employees: [...topEmployees, ...rest].slice(0, limit),
  }
}

export function resolveOwnerDisplay(card) {
  if (card.ownerEmployeeId && card.ownerLabel) return card.ownerLabel
  return card.owner ?? ""
}
