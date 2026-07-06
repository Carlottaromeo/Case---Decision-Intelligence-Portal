import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { processSourceData, directoryRowsFromXlsx } from "../src/data/processSourceData.js"
import {
  CENTRAL_PARAMS,
  computeCostPerCreditByTool,
  computeGeminiCosts,
  computeGeminiCostsByDept,
} from "../src/data/geminiCostModel.js"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const csv = fs.readFileSync(path.join(root, "public/northstar_ai_usage_export.csv"), "utf8")
const xlsx = fs.readFileSync(path.join(root, "public/northstar_employee_directory_1233_v2.xlsx"))
const live = processSourceData({ directoryRows: directoryRowsFromXlsx(xlsx), csvText: csv })

const result = computeGeminiCosts(live.TOOL_TIER_CREDITS, CENTRAL_PARAMS)
const perCredit = computeCostPerCreditByTool(result)
const deptMeta = Object.fromEntries(live.DEPT.map((d) => [d.d, { active_users: d.active_users }]))
const deptCosts = computeGeminiCostsByDept(live.DEPT_TOOL_TIER_CREDITS, deptMeta, CENTRAL_PARAMS)

function assertNear(label, actual, expected, tolerance) {
  const ok = Math.abs(actual - expected) <= tolerance
  console.log(`${ok ? "✓" : "✗"} ${label}: ${actual.toFixed(2)} (expected ~${expected}, ±${tolerance})`)
  if (!ok) process.exitCode = 1
}

console.log("=== Gemini cost model verification (central) ===\n")
console.log("Total cost:", Math.round(result.totalCost), "| monthly:", Math.round(result.monthlyCost))
console.log("$/credit:", perCredit)
console.log("Departments with cost:", deptCosts.length)

assertNear("Total cost USD", result.totalCost, 14190, 200)
assertNear("Monthly cost USD", result.monthlyCost, 4730, 80)
assertNear("Chat $/credit", perCredit.Chat, 0.00096, 0.0003)
assertNear("Excel $/credit", perCredit.Excel, 0.00252, 0.001)
assertNear("Coding IDE $/credit", perCredit["Coding IDE"], 0.0946, 0.02)

const chat = result.tools.find((t) => t.tool === "Chat")
const coding = result.tools.find((t) => t.tool === "Coding IDE")
assertNear("Chat % credits", chat.pctCredits, 54, 3)
assertNear("Coding % cost", coding.pctCost, 96, 3)

const deptTotalCost = deptCosts.reduce((s, r) => s + r.cost, 0)
assertNear("Dept costs sum", deptTotalCost, result.totalCost, 50)

console.log("\nTop 3 departments by cost:")
deptCosts.slice(0, 3).forEach((r) => {
  console.log(`  ${r.dept}: ${Math.round(r.cost)} USD (${r.topCostDriver} ${Math.round(r.topCostDriverPct)}%)`)
})

if (process.exitCode === 1) {
  console.error("\nSome assertions failed.")
  process.exit(1)
}
console.log("\nAll assertions passed.")
