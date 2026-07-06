import {
  adoptionLevel,
  classifyAiPotential,
  classifyAdoptionGap,
  classifyManagementAction,
} from "../../scripts/process-logic.mjs"
import { PROCESS_DEFINITIONS } from "./processFlows"
import {
  getDefaultProcessFilters,
  resolveActiveFilters,
  isFutureReadyFilter,
  matchDepartment,
  matchSeniority,
  normalizeDepartment,
  normalizeSeniorityValue,
} from "./processFilters"

export { getDefaultProcessFilters } from "./processFilters"

function pct(part, total) {
  return total > 0 ? Math.round((part / total) * 1000) / 10 : 0
}

function parseWeekDate(s) {
  const [d, m, y] = s.split("-").map(Number)
  return new Date(y, m - 1, d).getTime()
}

function inDateRange(weekStart, from, to) {
  const t = parseWeekDate(weekStart)
  if (from && t < parseWeekDate(from)) return false
  if (to && t > parseWeekDate(to)) return false
  return true
}

function filterUsage(usageRecords, filters) {
  const { dateFrom, dateTo, department, seniority } = filters
  return usageRecords.filter((r) => {
    if (!matchDepartment(r.department, department)) return false
    if (!matchSeniority(r.seniority, seniority)) return false
    if (!inDateRange(r.week_start, dateFrom, dateTo)) return false
    return true
  })
}

function filterRoster(roster, filters, processDepartment) {
  const { seniority } = filters
  const dept = normalizeDepartment(processDepartment)
  return roster.filter((e) => {
    if (normalizeDepartment(e.department) !== dept) return false
    if (!matchSeniority(e.seniority, seniority)) return false
    return true
  })
}

function computeWeeklyTrends(usage, weeks, processDepartment) {
  const dept = normalizeDepartment(processDepartment)
  const weekOrder = weeks
    .filter((w) => usage.some((r) => r.week_start === w.week_start && normalizeDepartment(r.department) === dept))
    .sort((a, b) => parseWeekDate(a.week_start) - parseWeekDate(b.week_start))

  const allWeeksInRange = [...new Set(
    usage.filter((r) => normalizeDepartment(r.department) === dept).map((r) => r.week_start)
  )]
    .sort((a, b) => parseWeekDate(a) - parseWeekDate(b))

  const labels = weekOrder.length ? weekOrder : weeks.filter((w) => allWeeksInRange.includes(w.week_start))

  return labels.map((w) => {
    const rows = usage.filter(
      (r) => normalizeDepartment(r.department) === dept && r.week_start === w.week_start
    )
    const activeSet = new Set()
    let credits = 0
    let sessions = 0
    for (const r of rows) {
      credits += r.credits
      sessions += r.sessions
      if (r.credits > 0 || r.sessions > 0) activeSet.add(r.employee_id)
    }
    return {
      week: w.label,
      week_start: w.week_start,
      active_users: activeSet.size,
      credits,
      sessions,
    }
  })
}

function buildProcessMap(def, rosterSlice, usage, weeks, deptColors) {
  const dept = normalizeDepartment(def.department)
  const rosterIds = new Set(rosterSlice.map((e) => e.employee_id))
  const deptUsage = usage.filter(
    (r) => normalizeDepartment(r.department) === dept && rosterIds.has(r.employee_id)
  )

  const activeSet = new Set()
  let total_sessions = 0
  let total_credits = 0

  for (const r of deptUsage) {
    total_sessions += r.sessions
    total_credits += r.credits
    if (r.credits > 0 || r.sessions > 0) activeSet.add(r.employee_id)
  }

  const total_employees = rosterSlice.length
  const active_users = activeSet.size
  const adoption_rate = pct(active_users, total_employees)
  const level = adoptionLevel(adoption_rate)
  const weekCount = Math.max(
    new Set(deptUsage.map((r) => r.week_start)).size,
    1
  )
  const cr_week = active_users > 0
    ? Math.round((total_credits / active_users / weekCount) * 10) / 10
    : 0
  const ai_potential = classifyAiPotential(cr_week, total_credits)

  const weekly_active_users_trend = computeWeeklyTrends(usage, weeks, dept)
  const weekly_credits_trend = weekly_active_users_trend.map((w) => ({
    week: w.week,
    week_start: w.week_start,
    credits: w.credits,
  }))

  return {
    process_name: def.process_name,
    department: dept,
    mapping_status: "Simulated",
    active_users,
    total_employees,
    adoption_rate,
    adoption_level: level,
    total_sessions,
    total_credits,
    avg_sessions_per_active_user: active_users > 0 ? Math.round(total_sessions / active_users) : 0,
    avg_credits_per_active_user: active_users > 0 ? Math.round(total_credits / active_users) : 0,
    weekly_active_users_trend,
    weekly_credits_trend,
    ai_potential,
    adoption_gap: classifyAdoptionGap(ai_potential, level),
    management_action: classifyManagementAction(ai_potential, level),
    color: deptColors[dept] || "64748B",
  }
}

export function computeProcessMetrics(
  roster,
  usageRecords,
  processWeeks,
  deptColors,
  filters = {}
) {
  if (isFutureReadyFilter(filters)) return []

  const active = resolveActiveFilters(filters)
  const usage = filterUsage(usageRecords, active)
  const defs = active.department
    ? PROCESS_DEFINITIONS.filter((d) => matchDepartment(d.department, active.department))
    : PROCESS_DEFINITIONS

  let maps = defs.map((def) => {
    const rosterSlice = filterRoster(roster, active, def.department)
    return buildProcessMap(def, rosterSlice, usage, processWeeks, deptColors)
  })

  if (active.adoptionLevel) {
    maps = maps.filter((m) => m.adoption_level === active.adoptionLevel)
  }
  if (active.investmentPriority) {
    maps = maps.filter((m) => m.management_action === active.investmentPriority)
  }

  return maps
}

export function listSeniorityOptions(roster) {
  return [...new Set(roster.map((e) => normalizeSeniorityValue(e.seniority)))].sort()
}

export function listDepartmentOptions(roster) {
  const fromDefs = PROCESS_DEFINITIONS.map((d) => d.department)
  const fromRoster = roster
    ? [...new Set(roster.map((e) => normalizeDepartment(e.department)))]
    : []
  return [...new Set([...fromDefs, ...fromRoster])].sort()
}
