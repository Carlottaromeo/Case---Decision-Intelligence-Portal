/**
 * Process employee directory + usage CSV into dashboard measured data.
 * Single source of truth — used by the browser app (and verify script via node).
 */
import * as XLSX from "xlsx"
import { normalizeDepartmentName, normalizeSeniority } from "./deptNormalize.js"
import { DEPT_COLORS, CHART } from "../theme.js"
import {
  adoptionLevel,
  classifyAiPotential,
  classifyAdoptionGap,
  classifyManagementAction,
} from "../../scripts/process-logic.mjs"

function parseCsvLine(line) {
  const parts = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '"') {
      let j = i + 1
      let s = ""
      while (j < line.length) {
        if (line[j] === '"' && line[j + 1] === '"') {
          s += '"'
          j += 2
        } else if (line[j] === '"') {
          j++
          break
        } else {
          s += line[j]
          j++
        }
      }
      parts.push(s)
      i = j
      if (line[i] === ",") i++
    } else {
      const j = line.indexOf(",", i)
      if (j === -1) {
        parts.push(line.slice(i))
        break
      }
      parts.push(line.slice(i, j))
      i = j + 1
    }
  }
  return parts
}

function parseCredits(raw) {
  return JSON.parse(raw.replace(/""/g, '"'))
}

function parseDate(s) {
  const [d, m, y] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function fmtWeek(d) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${months[d.getMonth()]} ${d.getDate()}`
}

function pct(part, total) {
  return total > 0 ? Math.round((part / total) * 1000) / 10 : 0
}

export function directoryRowsFromXlsx(buffer) {
  const wb = XLSX.read(buffer, { type: "array" })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet, { defval: "" })
}

export function processSourceData({ directoryRows, csvText }) {
  const employees = directoryRows
  const deptCol = Object.keys(employees[0] ?? {}).find((k) => /department/i.test(k)) || "Department"
  const idCol = Object.keys(employees[0] ?? {}).find((k) => /employee.?id/i.test(k)) || "Employee id"
  const seniorityCol = Object.keys(employees[0] ?? {}).find((k) => /seniority/i.test(k))
  const nameCol = Object.keys(employees[0] ?? {}).find((k) => /^name$/i.test(String(k).trim()))
  const surnameCol = Object.keys(employees[0] ?? {}).find((k) => /^surname$/i.test(String(k).trim()))

  const empByDept = {}
  const empMap = {}
  const seniorityMap = {}
  const excelAllIds = new Set()
  const EMPLOYEE_ROSTER = []

  for (const e of employees) {
    const id = String(e[idCol]).trim()
    if (!id) continue
    excelAllIds.add(id)
    const dept = normalizeDepartmentName(e[deptCol])
    const seniority = seniorityCol ? normalizeSeniority(e[seniorityCol]) : "Unknown"
    const name = nameCol ? String(e[nameCol] ?? "").trim() : ""
    const surname = surnameCol ? String(e[surnameCol] ?? "").trim() : ""
    const full_name = [name, surname].filter(Boolean).join(" ")
    empMap[id] = dept
    seniorityMap[id] = seniority
    EMPLOYEE_ROSTER.push({
      employee_id: id,
      department: dept,
      seniority,
      name,
      surname,
      full_name,
    })
    if (!empByDept[dept]) empByDept[dept] = new Set()
    empByDept[dept].add(id)
  }

  const SENIORITY_LEVELS = ["L1", "L2", "L3", "L4", "L5", "L6"]
  const seniorityRosterTotal = Object.fromEntries(SENIORITY_LEVELS.map((l) => [l, 0]))
  for (const e of EMPLOYEE_ROSTER) {
    if (SENIORITY_LEVELS.includes(e.seniority)) {
      seniorityRosterTotal[e.seniority]++
    }
  }

  const lines = csvText.trim().split(/\r?\n/)
  const weeklyMap = new Map()
  const userWeeks = new Map()
  const userMaxWeekCredits = new Map()
  const provisionedUsers = new Set()

  let totalCredits = 0
  let totalSessions = 0
  const toolTotals = { Chat: 0, Excel: 0, "Coding IDE": 0 }
  const tierTotals = { "LLM-instant": 0, "LLM-thinking": 0, "LLM-pro": 0 }
  const toolTierTotals = {
    Chat: { instant: 0, thinking: 0, pro: 0 },
    Excel: { instant: 0, thinking: 0, pro: 0 },
    "Coding IDE": { instant: 0, thinking: 0, pro: 0 },
  }
  const TIER_ALIAS = { "LLM-instant": "instant", "LLM-thinking": "thinking", "LLM-pro": "pro" }
  const emptyDeptToolTier = () => ({
    Chat: { instant: 0, thinking: 0, pro: 0 },
    Excel: { instant: 0, thinking: 0, pro: 0 },
    "Coding IDE": { instant: 0, thinking: 0, pro: 0 },
  })
  const deptAgg = {}
  const seniorityAgg = {}
  const excludedUsageIds = new Set()
  let excludedUsageCredits = 0
  let excludedUsageSessions = 0
  const USAGE_RECORDS = []
  const PROCESS_WEEKS_MAP = new Map()

  for (let i = 1; i < lines.length; i++) {
    const [weekStart, weekEnd, empId, creditsRaw, sessionsStr] = parseCsvLine(lines[i])
    if (!weekStart || !empId || !creditsRaw) continue

    const sessions = Number(sessionsStr)
    const credits = parseCredits(creditsRaw)
    if (!excelAllIds.has(empId)) {
      excludedUsageIds.add(empId)
      excludedUsageCredits += credits.total_credits
      excludedUsageSessions += sessions
      continue
    }

    const dept = empMap[empId] ?? "Unknown"
    const seniority = seniorityMap[empId] ?? "Unknown"

    if (!PROCESS_WEEKS_MAP.has(weekStart)) {
      PROCESS_WEEKS_MAP.set(weekStart, {
        week_start: weekStart,
        week_end: weekEnd,
        label: fmtWeek(parseDate(weekStart)),
        date: parseDate(weekStart),
      })
    }

    USAGE_RECORDS.push({
      employee_id: empId,
      department: dept,
      seniority,
      week_start: weekStart,
      week_end: weekEnd,
      week_label: PROCESS_WEEKS_MAP.get(weekStart).label,
      credits: credits.total_credits,
      sessions,
    })

    provisionedUsers.add(empId)

    if (!weeklyMap.has(weekStart)) {
      weeklyMap.set(weekStart, { credits: 0, sessions: 0, date: parseDate(weekStart), activeUsers: new Set() })
    }
    const wk = weeklyMap.get(weekStart)
    wk.credits += credits.total_credits
    wk.sessions += sessions
    if (credits.total_credits > 0 || sessions > 0) wk.activeUsers.add(empId)

    totalCredits += credits.total_credits
    totalSessions += sessions

    if (!userWeeks.has(empId)) userWeeks.set(empId, new Set())
    if (credits.total_credits > 0 || sessions > 0) userWeeks.get(empId).add(weekStart)

    const prevMax = userMaxWeekCredits.get(empId) || 0
    if (credits.total_credits > prevMax) userMaxWeekCredits.set(empId, credits.total_credits)

    for (const tool of ["Chat", "Excel", "Coding IDE"]) {
      toolTotals[tool] += credits[tool]?.total_credits || 0
      for (const tier of ["LLM-instant", "LLM-thinking", "LLM-pro"]) {
        const tierCredits = credits[tool]?.[tier] || 0
        tierTotals[tier] += tierCredits
        toolTierTotals[tool][TIER_ALIAS[tier]] += tierCredits
      }
    }

    if (!deptAgg[dept]) {
      deptAgg[dept] = {
        users: new Set(),
        activeUsers: new Set(),
        credits: 0,
        sessions: 0,
        tools: { Chat: 0, Excel: 0, "Coding IDE": 0 },
        tiers: { "LLM-instant": 0, "LLM-thinking": 0, "LLM-pro": 0 },
        toolTier: emptyDeptToolTier(),
      }
    }
    const da = deptAgg[dept]
    da.users.add(empId)
    da.credits += credits.total_credits
    da.sessions += sessions
    if (credits.total_credits > 0 || sessions > 0) da.activeUsers.add(empId)
    for (const tool of ["Chat", "Excel", "Coding IDE"]) {
      da.tools[tool] += credits[tool]?.total_credits || 0
      for (const tier of ["LLM-instant", "LLM-thinking", "LLM-pro"]) {
        const tierCredits = credits[tool]?.[tier] || 0
        da.tiers[tier] += tierCredits
        da.toolTier[tool][TIER_ALIAS[tier]] += tierCredits
      }
    }

    const sen = seniorityMap[empId] || "Unknown"
    if (!seniorityAgg[sen]) seniorityAgg[sen] = { activeUsers: new Set(), credits: 0 }
    if (credits.total_credits > 0 || sessions > 0) seniorityAgg[sen].activeUsers.add(empId)
    seniorityAgg[sen].credits += credits.total_credits
  }

  const WEEKLY = [...weeklyMap.entries()]
    .sort((a, b) => a[1].date - b[1].date)
    .map(([, v]) => ({
      week: fmtWeek(v.date),
      credits: v.credits,
      sessions: v.sessions,
      active_users: v.activeUsers.size,
    }))

  const weeks = WEEKLY.length

  const PROCESS_WEEKS = [...PROCESS_WEEKS_MAP.values()]
    .sort((a, b) => a.date - b.date)
    .map(({ week_start, week_end, label }) => ({ week_start, week_end, label }))

  function buildWeeklyTrends(deptName) {
    const trendMap = new Map()
    for (const r of USAGE_RECORDS) {
      if (r.department !== deptName) continue
      if (!trendMap.has(r.week_start)) {
        trendMap.set(r.week_start, { active: new Set(), credits: 0 })
      }
      const t = trendMap.get(r.week_start)
      t.credits += r.credits
      if (r.credits > 0 || r.sessions > 0) t.active.add(r.employee_id)
    }
    return PROCESS_WEEKS.filter((w) => trendMap.has(w.week_start)).map((w) => {
      const t = trendMap.get(w.week_start)
      return {
        week: w.label,
        week_start: w.week_start,
        active_users: t.active.size,
        credits: t.credits,
      }
    })
  }

  const excelUndefinedDeptRows = EMPLOYEE_ROSTER.filter((e) => e.department === "Unknown").length
  const totalEmployees = employees.length
  const provisioned = provisionedUsers.size
  const outsideRollout = totalEmployees - provisioned
  const highConsumptionUsers = [...userMaxWeekCredits.values()].filter((v) => v >= 500).length

  const DEPT = Object.keys(empByDept)
    .sort((a, b) => empByDept[b].size - empByDept[a].size)
    .map((dept) => {
      const total = empByDept[dept].size
      const provSet = deptAgg[dept]?.users || new Set()
      const provisionedCount = [...provSet].filter((id) => empByDept[dept].has(id)).length
      const gap = total - provisionedCount
      const prov_rate = pct(provisionedCount, total)
      const total_credits = deptAgg[dept]?.credits || 0
      const total_sessions = deptAgg[dept]?.sessions || 0
      const active_users = deptAgg[dept]?.activeUsers?.size || 0
      const cr_user = provisionedCount > 0 ? Math.round(total_credits / provisionedCount) : 0
      const cr_week = provisionedCount > 0 ? Math.round((total_credits / provisionedCount / weeks) * 10) / 10 : 0
      const toolSum = Object.values(deptAgg[dept]?.tools || {}).reduce((s, v) => s + v, 0)
      const tierSum = Object.values(deptAgg[dept]?.tiers || {}).reduce((s, v) => s + v, 0)

      return {
        d: dept,
        total,
        provisioned: provisionedCount,
        gap,
        prov_rate,
        total_credits,
        total_sessions,
        active_users,
        cr_user,
        cr_week,
        chat: pct(deptAgg[dept]?.tools.Chat || 0, toolSum),
        excel: pct(deptAgg[dept]?.tools.Excel || 0, toolSum),
        coding: pct(deptAgg[dept]?.tools["Coding IDE"] || 0, toolSum),
        instant: pct(deptAgg[dept]?.tiers["LLM-instant"] || 0, tierSum),
        thinking: pct(deptAgg[dept]?.tiers["LLM-thinking"] || 0, tierSum),
        pro: pct(deptAgg[dept]?.tiers["LLM-pro"] || 0, tierSum),
        color: DEPT_COLORS[dept] || "64748B",
      }
    })

  const TOOL_DATA = [
    { tool: "Chat", credits: toolTotals.Chat, color: CHART.tools.Chat },
    { tool: "Coding IDE", credits: toolTotals["Coding IDE"], color: CHART.tools["Coding IDE"] },
    { tool: "Excel", credits: toolTotals.Excel, color: CHART.tools.Excel },
  ]

  const LLM_DATA = [
    { tier: "Instant", credits: tierTotals["LLM-instant"], color: CHART.tiers.Instant },
    { tier: "Thinking", credits: tierTotals["LLM-thinking"], color: CHART.tiers.Thinking },
    { tier: "Pro", credits: tierTotals["LLM-pro"], color: CHART.tiers.Pro },
  ]

  const segments = { power: 0, regular: 0, occasional: 0, inactive: 0 }
  for (const id of provisionedUsers) {
    const activeWeeks = userWeeks.get(id)?.size || 0
    const ratio = activeWeeks / weeks
    if (ratio >= 0.7) segments.power++
    else if (ratio >= 0.3) segments.regular++
    else if (activeWeeks > 0) segments.occasional++
    else segments.inactive++
  }

  const USER_SEGMENTS = [
    { segment: "Power User", count: segments.power, desc: "Active ≥70% of weeks", color: CHART.segments[0] },
    { segment: "Regular", count: segments.regular, desc: "Active 30–70% of weeks", color: CHART.segments[1] },
    { segment: "Occasional", count: segments.occasional, desc: "Active <30% of weeks", color: CHART.segments[2] },
    { segment: "Inactive", count: segments.inactive, desc: "Never used in period", color: "#5A5A6A" },
  ]

  const SENIORITY = SENIORITY_LEVELS.map((level) => {
    const s = seniorityAgg[level] || { activeUsers: new Set(), credits: 0 }
    const totalInCompany = seniorityRosterTotal[level] || 0
    const activeUsers = s.activeUsers.size
    return {
      level,
      total_in_company: totalInCompany,
      pct_of_company: pct(totalInCompany, totalEmployees),
      active_users: activeUsers,
      ai_adoption_pct: pct(activeUsers, totalInCompany),
      credits: s.credits,
      cr_user: activeUsers > 0 ? Math.round(s.credits / activeUsers) : 0,
      users: activeUsers,
    }
  })

  const growthPct = WEEKLY.length >= 2
    ? Math.round(((WEEKLY[WEEKLY.length - 1].credits - WEEKLY[0].credits) / WEEKLY[0].credits) * 1000) / 10
    : 0

  const thinkingProPct = pct(tierTotals["LLM-thinking"] + tierTotals["LLM-pro"], totalCredits)

  const unmappedNotInDirectory = 0
  const unmappedMissingDeptField = 0
  const unmappedProvisioned = 0
  const unmappedCredits = 0

  const DATA_QUALITY = {
    provisioned_total: provisioned,
    provisioned_mapped_to_dept: provisioned - unmappedProvisioned,
    unmapped_provisioned: unmappedProvisioned,
    unmapped_not_in_directory: unmappedNotInDirectory,
    unmapped_missing_dept_field: unmappedMissingDeptField,
    unmapped_credits: unmappedCredits,
    unmapped_credits_pct: pct(unmappedCredits, totalCredits),
    excel_undefined_dept_rows: excelUndefinedDeptRows,
    excluded_usage_ids: excludedUsageIds.size,
    excluded_usage_credits: excludedUsageCredits,
    excluded_usage_credits_pct: pct(excludedUsageCredits, totalCredits + excludedUsageCredits),
    excluded_usage_sessions: excludedUsageSessions,
  }

  const PROCESS_DEFINITIONS = [
    { department: "Technology", process_name: "Software Development Lifecycle" },
    { department: "Data & Analytics", process_name: "Data Analysis & Insight Generation" },
    { department: "Customer Support", process_name: "Customer Request Handling" },
    { department: "Finance", process_name: "Monthly Reporting & Variance Analysis" },
    { department: "Pricing", process_name: "Pricing Analysis & Scenario Simulation" },
    { department: "Underwriting", process_name: "Underwriting Risk Assessment" },
    { department: "Risk & Compliance", process_name: "Compliance Review & Policy Control" },
    { department: "Sales & Part.", process_name: "Sales Proposal & Client Follow-up" },
    { department: "People", process_name: "Employee Support & Onboarding" },
  ]

  const deptByName = Object.fromEntries(DEPT.map((d) => [d.d, d]))

  const PROCESS_MAPS = PROCESS_DEFINITIONS.map(({ department, process_name }) => {
    const d = deptByName[department]
    if (!d) throw new Error(`Missing department data for process map: ${department}`)
    const active_users = d.active_users
    const adoption_rate = pct(active_users, d.total)
    const level = adoptionLevel(adoption_rate)
    const ai_potential = classifyAiPotential(d.cr_week, d.total_credits)
    const avg_sessions_per_active_user = active_users > 0 ? Math.round(d.total_sessions / active_users) : 0
    const avg_credits_per_active_user = active_users > 0 ? Math.round(d.total_credits / active_users) : 0
    const weekly_active_users_trend = buildWeeklyTrends(department)
    const weekly_credits_trend = weekly_active_users_trend.map((w) => ({
      week: w.week,
      week_start: w.week_start,
      credits: w.credits,
    }))
    return {
      process_name,
      department,
      mapping_status: "Simulated",
      active_users,
      total_employees: d.total,
      adoption_rate,
      adoption_level: level,
      total_sessions: d.total_sessions,
      total_credits: d.total_credits,
      avg_sessions_per_active_user,
      avg_credits_per_active_user,
      weekly_active_users_trend,
      weekly_credits_trend,
      ai_potential,
      adoption_gap: classifyAdoptionGap(ai_potential, level),
      management_action: classifyManagementAction(ai_potential, level),
      color: d.color,
    }
  })

  const KPIs = {
    total_employees: totalEmployees,
    provisioned,
    outside_rollout: outsideRollout,
    provisioning_rate: pct(provisioned, totalEmployees),
    total_credits: totalCredits,
    total_sessions: totalSessions,
    high_consumption_users: highConsumptionUsers,
    weeks,
    growth_pct: growthPct,
    avg_credits_per_user: provisioned > 0 ? Math.round(totalCredits / provisioned) : 0,
    avg_sessions_per_user: provisioned > 0 ? Math.round(totalSessions / provisioned) : 0,
    active_users: [...userWeeks.values()].filter((w) => w.size > 0).length,
    thinking_pro_pct: thinkingProPct,
  }

  const DEPT_TOOL_TIER_CREDITS = Object.fromEntries(
    Object.entries(deptAgg).map(([dept, da]) => [dept, da.toolTier])
  )

  return {
    WEEKLY,
    DEPT,
    TOOL_DATA,
    TOOL_TIER_CREDITS: toolTierTotals,
    DEPT_TOOL_TIER_CREDITS,
    LLM_DATA,
    USER_SEGMENTS,
    SENIORITY,
    KPIs,
    DATA_QUALITY,
    PROCESS_MAPS,
    EMPLOYEE_ROSTER,
    USAGE_RECORDS,
    PROCESS_WEEKS,
    DEPT_COLORS,
    directoryRows: employees,
    csvText,
  }
}
