import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import XLSX from "xlsx"
import { normalizeDepartmentName } from "./dept-normalize.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const CSV_PATH = process.argv[2] || path.join(root, "public", "northstar_ai_usage_export.csv")
const XLSX_PATH = process.argv[3] || path.join(root, "public", "northstar_employee_directory_1233_v2.xlsx")

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

// Load existing data.js KPIs for comparison
const dataJs = fs.readFileSync(path.join(root, "src", "data", "data.js"), "utf8")
const kpisMatch = dataJs.match(/export const KPIs = (\{[\s\S]*?\});/)
const deptMatch = dataJs.match(/export const DEPT = (\[[\s\S]*?\]);/)
const weeklyMatch = dataJs.match(/export const WEEKLY = (\[[\s\S]*?\]);/)
const existingKPIs = JSON.parse(kpisMatch[1])
const existingDEPT = JSON.parse(deptMatch[1])
const existingWEEKLY = JSON.parse(weeklyMatch[1])

// Excel
const wb = XLSX.readFile(XLSX_PATH)
const employees = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
const deptCol = Object.keys(employees[0]).find((k) => /department/i.test(k)) || "Department"
const idCol = Object.keys(employees[0]).find((k) => /employee.?id/i.test(k)) || "Employee id"
const seniorityCol = Object.keys(employees[0]).find((k) => /seniority/i.test(k))

const empByDept = {}
const empMap = {}
const excelIds = new Set()
const skippedRows = { noDept: 0 }

for (const e of employees) {
  const id = String(e[idCol]).trim()
  const dept = normalizeDepartmentName(e[deptCol])
  if (dept === "Unknown") skippedRows.noDept++
  excelIds.add(id)
  empMap[id] = dept
  if (!empByDept[dept]) empByDept[dept] = new Set()
  empByDept[dept].add(id)
}

// CSV
const csv = fs.readFileSync(CSV_PATH, "utf8")
const lines = csv.trim().split(/\r?\n/)

const weeklyMap = new Map()
const userWeeks = new Map()
const userMaxWeekCredits = new Map()
const provisionedUsers = new Set()
const csvIds = new Set()
const csvIdsNotInExcel = new Set()
const excelIdsNotInCsv = new Set()

let totalCredits = 0
let totalSessions = 0
let rowCount = 0
const deptAgg = {}

for (let i = 1; i < lines.length; i++) {
  const [weekStart, , empId, creditsRaw, sessionsStr] = parseCsvLine(lines[i])
  if (!weekStart || !empId || !creditsRaw) continue

  rowCount++
  csvIds.add(empId)
  if (!excelIds.has(empId)) csvIdsNotInExcel.add(empId)

  const sessions = Number(sessionsStr)
  const credits = parseCredits(creditsRaw)

  provisionedUsers.add(empId)

  if (!weeklyMap.has(weekStart)) {
    weeklyMap.set(weekStart, { credits: 0, sessions: 0, date: parseDate(weekStart) })
  }
  const wk = weeklyMap.get(weekStart)
  wk.credits += credits.total_credits
  wk.sessions += sessions

  totalCredits += credits.total_credits
  totalSessions += sessions

  if (!userWeeks.has(empId)) userWeeks.set(empId, new Set())
  if (credits.total_credits > 0 || sessions > 0) userWeeks.get(empId).add(weekStart)

  const prevMax = userMaxWeekCredits.get(empId) || 0
  if (credits.total_credits > prevMax) userMaxWeekCredits.set(empId, credits.total_credits)

  const dept = empMap[empId] ?? "Unknown"
  if (!deptAgg[dept]) deptAgg[dept] = { users: new Set(), credits: 0 }
  deptAgg[dept].users.add(empId)
  deptAgg[dept].credits += credits.total_credits
}

for (const id of excelIds) {
  if (!csvIds.has(id)) excelIdsNotInCsv.add(id)
}

const WEEKLY = [...weeklyMap.entries()]
  .sort((a, b) => a[1].date - b[1].date)
  .map(([, v]) => ({ credits: v.credits, sessions: v.sessions }))

const weeks = WEEKLY.length
const totalEmployees = employees.length
const totalEmployeesMapped = excelIds.size
const provisioned = provisionedUsers.size
const outsideRollout = totalEmployees - provisioned
const highConsumptionUsers = [...userMaxWeekCredits.values()].filter((v) => v >= 500).length
const growthPct = WEEKLY.length >= 2
  ? Math.round(((WEEKLY[WEEKLY.length - 1].credits - WEEKLY[0].credits) / WEEKLY[0].credits) * 1000) / 10
  : 0

const segments = { power: 0, regular: 0, occasional: 0, inactive: 0 }
for (const id of provisionedUsers) {
  const activeWeeks = userWeeks.get(id)?.size || 0
  const ratio = activeWeeks / weeks
  if (ratio >= 0.7) segments.power++
  else if (ratio >= 0.3) segments.regular++
  else if (activeWeeks > 0) segments.occasional++
  else segments.inactive++
}

const computedDEPT = Object.keys(empByDept)
  .sort((a, b) => empByDept[b].size - empByDept[a].size)
  .map((dept) => {
    const total = empByDept[dept].size
    const provSet = deptAgg[dept]?.users || new Set()
    const provisionedCount = [...provSet].filter((id) => empByDept[dept].has(id)).length
    const gap = total - provisionedCount
    const total_credits = deptAgg[dept]?.credits || 0
    const cr_week = provisionedCount > 0 ? Math.round((total_credits / provisionedCount / weeks) * 10) / 10 : 0
    return { d: dept, total, provisioned: provisionedCount, gap, prov_rate: Math.round((provisionedCount / total) * 1000) / 10, total_credits, cr_week }
  })

const computedKPIs = {
  total_employees: totalEmployees,
  provisioned,
  outside_rollout: outsideRollout,
  provisioning_rate: Math.round((provisioned / totalEmployees) * 1000) / 10,
  total_credits: totalCredits,
  total_sessions: totalSessions,
  high_consumption_users: highConsumptionUsers,
  weeks,
  growth_pct: growthPct,
  power_users: segments.power,
  regular: segments.regular,
  occasional: segments.occasional,
  inactive: segments.inactive,
}

function compare(label, a, b) {
  const ok = a === b
  return { label, expected: a, actual: b, ok }
}

const checks = [
  compare("total_employees", computedKPIs.total_employees, existingKPIs.total_employees),
  compare("provisioned", computedKPIs.provisioned, existingKPIs.provisioned),
  compare("outside_rollout", computedKPIs.outside_rollout, existingKPIs.outside_rollout),
  compare("provisioning_rate", computedKPIs.provisioning_rate, existingKPIs.provisioning_rate),
  compare("total_credits", computedKPIs.total_credits, existingKPIs.total_credits),
  compare("total_sessions", computedKPIs.total_sessions, existingKPIs.total_sessions),
  compare("high_consumption_users", computedKPIs.high_consumption_users, existingKPIs.high_consumption_users),
  compare("weeks", computedKPIs.weeks, existingKPIs.weeks),
  compare("growth_pct", computedKPIs.growth_pct, existingKPIs.growth_pct),
  compare("power_users", computedKPIs.power_users, 362),
  compare("week1_credits", WEEKLY[0]?.credits, existingWEEKLY[0]?.credits),
  compare("week13_credits", WEEKLY[WEEKLY.length - 1]?.credits, existingWEEKLY[existingWEEKLY.length - 1]?.credits),
]

let deptMismatches = 0
for (const cd of computedDEPT) {
  const ed = existingDEPT.find((d) => d.d === cd.d)
  if (!ed) {
    deptMismatches++
    continue
  }
  for (const key of ["total", "provisioned", "gap", "prov_rate", "total_credits", "cr_week"]) {
    if (cd[key] !== ed[key]) deptMismatches++
  }
}

console.log("=== SOURCE FILES ===")
console.log("CSV:", CSV_PATH)
console.log("XLSX:", XLSX_PATH)
console.log("CSV rows (data):", rowCount)
console.log("Excel rows:", employees.length)
console.log("Excel mapped employees:", totalEmployeesMapped)
console.log("Excel rows with Unknown department:", skippedRows)

console.log("\n=== CROSS-FILE INTEGRITY ===")
console.log("Unique employee_ids in CSV:", csvIds.size)
console.log("CSV ids NOT in Excel:", csvIdsNotInExcel.size, csvIdsNotInExcel.size ? [...csvIdsNotInExcel].slice(0, 5) : "")
console.log("Excel ids NOT in CSV (outside rollout):", excelIdsNotInCsv.size)

console.log("\n=== COMPUTED FROM SOURCES ===")
console.log(JSON.stringify(computedKPIs, null, 2))

console.log("\n=== KPI CHECKS vs data.js ===")
for (const c of checks) {
  console.log(`${c.ok ? "OK" : "MISMATCH"} ${c.label}: source=${c.expected} data.js=${c.actual}`)
}

console.log(`\nDEPT field mismatches: ${deptMismatches}`)

console.log("\n=== DEPARTMENT TABLE (from sources) ===")
for (const d of computedDEPT) {
  console.log(`${d.d}: total=${d.total} prov=${d.provisioned} gap=${d.gap} (${d.prov_rate}%) cr/wk=${d.cr_week} credits=${d.total_credits}`)
}

console.log("\n=== PPT vs SOURCES ===")
console.log("PPT provisioned 450 -> sources:", computedKPIs.provisioned, computedKPIs.provisioned === 450 ? "PPT matches old?" : "PPT is OUTDATED")
console.log("PPT outside 783 -> sources:", computedKPIs.outside_rollout, computedKPIs.outside_rollout === 783 ? "PPT matches old?" : "PPT is OUTDATED")
console.log("Cluster A gap sum (Tech+DA+Fin):", computedDEPT.filter(d => ["Technology","Data & Analytics","Finance"].includes(d.d)).reduce((s,d)=>s+d.gap,0))
