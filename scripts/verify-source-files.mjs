/**
 * Verify public source files match bundled data.js — read-only, no regeneration.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { processSourceData, directoryRowsFromXlsx } from "../src/data/processSourceData.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const CSV_PATH = path.join(root, "public", "northstar_ai_usage_export.csv")
const XLSX_PATH = path.join(root, "public", "northstar_employee_directory_1233_v2.xlsx")
const DATA_JS = path.join(root, "src", "data", "data.js")

function extractJsonExport(name, src) {
  const re = new RegExp(`export const ${name} = (\\{[\\s\\S]*?\\n\\});`, "m")
  const reArr = new RegExp(`export const ${name} = (\\[[\\s\\S]*?\\n\\]);`, "m")
  const m = src.match(re) || src.match(reArr)
  if (!m) return null
  return JSON.parse(m[1])
}

const csvText = fs.readFileSync(CSV_PATH, "utf8")
const xlsxBuf = fs.readFileSync(XLSX_PATH)
const directoryRows = directoryRowsFromXlsx(xlsxBuf)
const live = processSourceData({ directoryRows, csvText })

const bundled = fs.readFileSync(DATA_JS, "utf8")
const bundledKPIs = extractJsonExport("KPIs", bundled)
const bundledDQ = extractJsonExport("DATA_QUALITY", bundled)

const keys = [
  "total_employees", "provisioned", "total_credits", "total_sessions",
  "weeks", "growth_pct", "high_consumption_users",
]
const dqKeys = [
  "provisioned_total", "unmapped_provisioned", "unmapped_not_in_directory",
  "excel_undefined_dept_rows", "unmapped_credits",
]

console.log("=== Source file verification (no regeneration) ===\n")
console.log("Files:")
console.log(`  CSV:  ${CSV_PATH} (${csvText.split(/\r?\n/).length - 1} data rows)`)
console.log(`  XLSX: ${XLSX_PATH} (${directoryRows.length} rows)\n`)

console.log("Live from files → bundled data.js:")
let allMatch = true
for (const k of keys) {
  const ok = live.KPIs[k] === bundledKPIs[k]
  if (!ok) allMatch = false
  console.log(`  KPIs.${k}: ${live.KPIs[k]} ${ok ? "✓" : `✗ (bundled: ${bundledKPIs[k]})`}`)
}
for (const k of dqKeys) {
  const ok = live.DATA_QUALITY[k] === bundledDQ[k]
  if (!ok) allMatch = false
  console.log(`  DATA_QUALITY.${k}: ${live.DATA_QUALITY[k]} ${ok ? "✓" : `✗ (bundled: ${bundledDQ[k]})`}`)
}

console.log(`\nDepartments in live: ${live.DEPT.length} | DEPT rows in bundle: ${(bundled.match(/export const DEPT/g) || []).length}`)

if (allMatch) {
  console.log("\n✓ Uploaded files are representative of bundled dashboard data.")
} else {
  console.log("\n⚠ Mismatch — the app should use live file processing, not static data.js.")
}

process.exit(allMatch ? 0 : 1)
