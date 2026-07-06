import fs from "fs"
import XLSX from "xlsx"

function parseCsvLine(line) {
  const parts = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '"') {
      let j = i + 1, s = ""
      while (j < line.length) {
        if (line[j] === '"' && line[j + 1] === '"') { s += '"'; j += 2 }
        else if (line[j] === '"') { j++; break }
        else { s += line[j]; j++ }
      }
      parts.push(s); i = j; if (line[i] === ",") i++
    } else {
      const j = line.indexOf(",", i)
      if (j === -1) { parts.push(line.slice(i)); break }
      parts.push(line.slice(i, j)); i = j + 1
    }
  }
  return parts
}

function parseDate(s) {
  const [d, m, y] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}

const csv = fs.readFileSync("c:/Users/CarlottaRomeo/Downloads/northstar_ai_usage_export.csv", "utf8")
const lines = csv.trim().split(/\r?\n/)

const weekly = new Map()
const toolTotals = { Chat: 0, Excel: 0, "Coding IDE": 0 }
const tierTotals = { instant: 0, thinking: 0, pro: 0 }

for (let i = 1; i < lines.length; i++) {
  const [week, , , raw, sessionsStr] = parseCsvLine(lines[i])
  const c = JSON.parse(raw.replace(/""/g, '"'))
  if (!weekly.has(week)) weekly.set(week, { credits: 0, date: parseDate(week) })
  weekly.get(week).credits += c.total_credits
  for (const tool of ["Chat", "Excel", "Coding IDE"]) {
    toolTotals[tool] += c[tool]?.total_credits || 0
    tierTotals.instant += (c[tool]?.["LLM-instant"] || 0)
    tierTotals.thinking += (c[tool]?.["LLM-thinking"] || 0)
    tierTotals.pro += (c[tool]?.["LLM-pro"] || 0)
  }
}

const sorted = [...weekly.values()].sort((a, b) => a.date - b.date)
let declines = 0
for (let i = 1; i < sorted.length; i++) {
  if (sorted[i].credits < sorted[i - 1].credits) declines++
}

const toolSum = Object.values(toolTotals).reduce((a, b) => a + b, 0)
const tierSum = Object.values(tierTotals).reduce((a, b) => a + b, 0)

console.log("Weeks:", sorted.length)
console.log("W1 credits (chronological):", sorted[0].credits)
console.log("W13 credits:", sorted[sorted.length - 1].credits)
console.log("Declining weeks (chronological):", declines)
console.log("Tool sum:", toolSum, "matches 578609:", toolSum === 578609)
console.log("Tier sum:", tierSum, "matches 578609:", tierSum === 578609)
console.log("Chat:", toolTotals.Chat, "Excel:", toolTotals.Excel, "Coding:", toolTotals["Coding IDE"])
console.log("Thinking+Pro %:", Math.round((tierTotals.thinking + tierTotals.pro) / toolSum * 1000) / 10)
