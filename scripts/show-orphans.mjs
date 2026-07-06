import fs from "fs"
import XLSX from "xlsx"

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

const wb = XLSX.readFile("c:/Users/CarlottaRomeo/Downloads/northstar_employee_directory_1233_v2.xlsx")
const employees = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
const idCol = Object.keys(employees[0]).find((k) => /employee.?id/i.test(k))
const excelIds = new Set(employees.map((e) => String(e[idCol]).trim()))

const lines = fs
  .readFileSync("c:/Users/CarlottaRomeo/Downloads/northstar_ai_usage_export.csv", "utf8")
  .trim()
  .split(/\r?\n/)

const orphans = new Set()
const usage = new Map()

for (let i = 1; i < lines.length; i++) {
  const [, , empId, raw, sessionsStr] = parseCsvLine(lines[i])
  if (!excelIds.has(empId)) orphans.add(empId)
  if (!usage.has(empId)) usage.set(empId, { credits: 0, sessions: 0, weeks: 0 })
  const c = JSON.parse(raw.replace(/""/g, '"'))
  const u = usage.get(empId)
  u.credits += c.total_credits
  u.sessions += Number(sessionsStr)
  if (c.total_credits > 0 || Number(sessionsStr) > 0) u.weeks++
}

console.log("Orphan count:", orphans.size)
for (const id of [...orphans].sort()) {
  const u = usage.get(id)
  console.log(`${id}: credits=${u.credits}, sessions=${u.sessions}, active_weeks=${u.weeks}`)
}

const orphanCredits = [...orphans].reduce((s, id) => s + usage.get(id).credits, 0)
console.log("\nTotal orphan credits:", orphanCredits)
console.log("Share of 578609:", ((orphanCredits / 578609) * 100).toFixed(2) + "%")
