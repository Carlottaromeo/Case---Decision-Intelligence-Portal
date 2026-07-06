/** Smart owner search — match by initials, name, surname, employee id. */

export function getEmployeeInitials(employee) {
  const full = employee?.full_name?.trim()
  if (full) {
    const parts = full.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }
  const name = String(employee?.name ?? "").trim()
  const surname = String(employee?.surname ?? "").trim()
  if (name && surname) return (name[0] + surname[0]).toUpperCase()
  return String(employee?.employee_id ?? "?").slice(0, 2).toUpperCase()
}

function searchKeys(employee) {
  const name = String(employee.name ?? "").trim().toLowerCase()
  const surname = String(employee.surname ?? "").trim().toLowerCase()
  const full = (employee.full_name ?? `${employee.name ?? ""} ${employee.surname ?? ""}`).trim().toLowerCase()
  const initials = getEmployeeInitials(employee).toLowerCase()
  const id = String(employee.employee_id ?? "").toLowerCase()
  return { name, surname, full, initials, id }
}

export function filterEmployeesForSearch(employees, query, limit = 8) {
  const list = employees ?? []
  const q = String(query ?? "").trim().toLowerCase()
  if (!q) return list.slice(0, limit)

  const compact = q.replace(/[\s.]+/g, "")

  const scored = list
    .map((emp) => {
      const k = searchKeys(emp)
      let score = 0

      if (k.initials === compact || k.initials.startsWith(compact)) score = 100
      else if (compact.length >= 2 && k.name.startsWith(compact[0]) && k.surname.startsWith(compact.slice(1))) score = 90
      else if (k.id.includes(q)) score = 80
      else if (k.name.startsWith(q) || k.surname.startsWith(q)) score = 70
      else if (k.full.includes(q)) score = 60

      const parts = q.split(/\s+/).filter(Boolean)
      if (parts.length >= 2 && k.name.startsWith(parts[0]) && k.surname.startsWith(parts[1])) {
        score = Math.max(score, 85)
      }

      return { emp, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return scored.map((x) => x.emp)
}

export function employeeDisplayName(employee) {
  if (!employee) return ""
  return employee.full_name?.trim() || employee.employee_id || ""
}
