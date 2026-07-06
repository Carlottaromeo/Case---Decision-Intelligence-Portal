import { CHART } from "../theme"

function normalizeDept(name) {
  return String(name ?? "").trim()
}

function dominantToolFromDeptMix(deptRow) {
  if (!deptRow) return "Chat"
  const mix = [
    { tool: "Chat", pct: deptRow.chat ?? 0 },
    { tool: "Excel", pct: deptRow.excel ?? 0 },
    { tool: "Coding IDE", pct: deptRow.coding ?? 0 },
  ]
  mix.sort((a, b) => b.pct - a.pct)
  return mix[0]?.tool ?? "Chat"
}

/**
 * Top N users by total credits in a department (from USAGE_RECORDS).
 * Tool column uses department tool mix as proxy (usage rows lack per-tool split).
 */
export function getTopUsersByDepartment(usageRecords, department, deptRow, limit = 3, employeeRoster = []) {
  const dept = normalizeDept(department)
  const byUser = new Map()
  const rosterById = new Map((employeeRoster ?? []).map((e) => [e.employee_id, e]))

  for (const r of usageRecords) {
    if (normalizeDept(r.department) !== dept) continue
    const id = r.employee_id
    if (!id) continue
    const prev = byUser.get(id) ?? { employee_id: id, credits: 0, sessions: 0 }
    prev.credits += r.credits ?? 0
    prev.sessions += r.sessions ?? 0
    byUser.set(id, prev)
  }

  const dominant = dominantToolFromDeptMix(deptRow)
  const toolColors = CHART.tools

  return [...byUser.values()]
    .filter((u) => u.credits > 0)
    .sort((a, b) => b.credits - a.credits)
    .slice(0, limit)
    .map((u, i) => {
      const emp = rosterById.get(u.employee_id)
      const full_name = emp?.full_name?.trim() || null
      return {
        rank: i + 1,
        employee_id: u.employee_id,
        full_name,
        display_name: full_name || u.employee_id,
        credits: u.credits,
        sessions: u.sessions,
        primary_tool: dominant,
        tool_color: toolColors[dominant] ?? CHART.primary,
      }
    })
}

export function getBusinessDepartments(deptList) {
  return deptList.filter((d) => d.d !== "Unknown")
}
