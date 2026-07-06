/**
 * Regenerate src/data/data.js from public source files via processSourceData.js.
 * Usage: npm run data
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { processSourceData, directoryRowsFromXlsx } from "../src/data/processSourceData.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const CSV_PATH = process.argv[2] || path.join(root, "public", "northstar_ai_usage_export.csv")
const XLSX_PATH = process.argv[3] || path.join(root, "public", "northstar_employee_directory_1233_v2.xlsx")
const OUT_PATH = path.join(root, "src", "data", "data.js")

const EXPORTS = [
  "WEEKLY",
  "DEPT",
  "TOOL_DATA",
  "TOOL_TIER_CREDITS",
  "DEPT_TOOL_TIER_CREDITS",
  "LLM_DATA",
  "USER_SEGMENTS",
  "SENIORITY",
  "KPIs",
  "DATA_QUALITY",
  "PROCESS_MAPS",
  "EMPLOYEE_ROSTER",
  "USAGE_RECORDS",
  "PROCESS_WEEKS",
  "DEPT_COLORS",
]

const csvText = fs.readFileSync(CSV_PATH, "utf8")
const xlsxBuf = fs.readFileSync(XLSX_PATH)
const directoryRows = directoryRowsFromXlsx(xlsxBuf)
const data = processSourceData({ directoryRows, csvText })

let output = "/** Auto-generated — do not edit. Run: npm run data */\n\n"
for (const name of EXPORTS) {
  output += `export const ${name} = ${JSON.stringify(data[name], null, 2)};\n\n`
}

fs.writeFileSync(OUT_PATH, output)

console.log("✓ data.js generated from processSourceData.js")
console.log("  Employees:", data.KPIs.total_employees)
console.log("  Provisioned:", data.KPIs.provisioned)
console.log("  Total credits:", data.KPIs.total_credits.toLocaleString())
console.log("  Departments:", data.DEPT.length)
console.log("  Unmapped provisioned:", data.DATA_QUALITY.unmapped_provisioned)
