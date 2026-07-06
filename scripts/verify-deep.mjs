import fs from "fs"
import XLSX from "xlsx"

const DEPT_NORMALIZE = {
  "Customer Suport": "Customer Support",
  Technlogy: "Technology",
  "Risk and Compliance": "Risk & Compliance",
  "Sales & Partnerships": "Sales & Part.",
  undefined: null,
  Sconosciuto: null,
}

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

const csvPath = "c:/Users/CarlottaRomeo/Downloads/northstar_ai_usage_export.csv"
const csvPublic = "public/northstar_ai_usage_export.csv"
const xlsxPath = "c:/Users/CarlottaRomeo/Downloads/northstar_employee_directory_1233_v2.xlsx"
const xlsxPublic = "public/northstar_employee_directory_1233_v2.xlsx"

const csv1 = fs.readFileSync(csvPath, "utf8")
const csv2 = fs.readFileSync(csvPublic, "utf8")
console.log("CSV Downloads vs public identical:", csv1 === csv2)

const x1 = fs.readFileSync(xlsxPath)
const x2 = fs.readFileSync(xlsxPublic)
console.log("XLSX Downloads vs public identical:", x1.equals(x2))

const wb = XLSX.readFile(xlsxPath)
const employees = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
const deptCol = Object.keys(employees[0]).find((k) => /department/i.test(k))
const idCol = Object.keys(employees[0]).find((k) => /employee.?id/i.test(k))

const unknown = []
const excelAllIds = new Set()
const excelMappedIds = new Set()
for (const e of employees) {
  const id = String(e[idCol]).trim()
  excelAllIds.add(id)
  let dept = String(e[deptCol]).trim()
  if (DEPT_NORMALIZE[dept] !== undefined) {
    if (DEPT_NORMALIZE[dept] === null) {
      unknown.push({ id, dept })
      continue
    }
    dept = DEPT_NORMALIZE[dept]
  }
  excelMappedIds.add(id)
}

const lines = csv1.trim().split(/\r?\n/)
const csvIds = new Set()
for (let i = 1; i < lines.length; i++) {
  csvIds.add(parseCsvLine(lines[i])[2])
}

const orphanCsv = [...csvIds].filter((id) => !excelMappedIds.has(id))
const unknownInCsv = unknown.filter((u) => csvIds.has(u.id))

console.log("\n--- Excel anomalies ---")
console.log("Total Excel rows:", employees.length)
console.log("Mapped (valid dept):", excelMappedIds.size)
console.log("Unknown dept rows:", unknown.length)
console.log("Unknown dept values:", [...new Set(unknown.map((u) => u.dept))])
console.log("Unknown dept also in CSV:", unknownInCsv.length)

console.log("\n--- CSV anomalies ---")
console.log("Unique provisioned IDs:", csvIds.size)
console.log("CSV IDs not in Excel (mapped):", orphanCsv.length, orphanCsv)

console.log("\n--- Outside rollout math ---")
console.log("1233 - 461 =", 1233 - 461)
console.log("Excel all ids not in CSV:", [...excelAllIds].filter((id) => !csvIds.has(id)).length)

const weekly = new Map()
const maxByUser = new Map()
for (let i = 1; i < lines.length; i++) {
  const [week, , empId, raw] = parseCsvLine(lines[i])
  const credits = JSON.parse(raw.replace(/""/g, '"')).total_credits
  weekly.set(week, (weekly.get(week) || 0) + credits)
  maxByUser.set(empId, Math.max(maxByUser.get(empId) || 0, credits))
}

const weeks = [...weekly.entries()].sort((a, b) => a[0].localeCompare(b[0]))
let declines = 0
for (let i = 1; i < weeks.length; i++) {
  if (weeks[i][1] < weeks[i - 1][1]) declines++
}
console.log("\n--- Trend validation ---")
console.log("Weeks in CSV:", weeks.length)
console.log("Declining weeks:", declines)
console.log("Week 1 credits:", weeks[0][1])
console.log("Week 13 credits:", weeks[weeks.length - 1][1])

const high = [...maxByUser.values()].filter((v) => v >= 500)
console.log("\n--- High consumption ---")
console.log("Users >=500 in any week:", high.length)
console.log("Max single-week credits:", Math.max(...maxByUser.values()))
