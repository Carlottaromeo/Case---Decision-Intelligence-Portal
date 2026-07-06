import { DEPT_ALIASES, normalizeDepartmentName } from "../data/deptNormalize"
import { parseCsvText, rowsToCsv } from "../utils/parseSourceFiles"

const SUGGESTIONS = [
  { id: "fix-typos", label: "Fix department typos (aliases)" },
  { id: "normalize-unknown", label: "Set empty departments to Unknown" },
  { id: "remove-test-csv", label: "Remove test accounts (NSF900*) from CSV" },
  { id: "list-unmapped", label: "List unmapped provisioned IDs" },
]

export function getAiSuggestions() {
  return SUGGESTIONS
}

function findDeptCol(rows) {
  if (!rows.length) return "Department"
  return Object.keys(rows[0]).find((k) => /department/i.test(k)) || "Department"
}

function findIdCol(rows) {
  if (!rows.length) return "Employee id"
  return Object.keys(rows[0]).find((k) => /employee.?id/i.test(k)) || "Employee id"
}

export function applySourceDataAi({ prompt, directoryRows, usageCsvText }) {
  const text = (prompt || "").toLowerCase().trim()
  const suggestion = SUGGESTIONS.find((s) => text.includes(s.id) || text.includes(s.label.toLowerCase()))

  let nextDirectory = [...directoryRows]
  let nextCsv = usageCsvText
  let summary = ""
  let logAction = "ai-edit"

  const deptCol = findDeptCol(nextDirectory)
  const idCol = findIdCol(nextDirectory)

  const wantsTypos =
    suggestion?.id === "fix-typos" ||
    /typo|alias|normaliz|fix.*dept|department.*fix/.test(text)
  const wantsUnknown =
    suggestion?.id === "normalize-unknown" ||
    /empty|missing|unknown|blank/.test(text)
  const wantsRemoveTest =
    suggestion?.id === "remove-test-csv" ||
    /test account|nsf900|remove test/.test(text)
  const wantsListUnmapped =
    suggestion?.id === "list-unmapped" ||
    /unmapped|without department|no business unit/.test(text)

  if (wantsTypos) {
    let fixed = 0
    nextDirectory = nextDirectory.map((row) => {
      const raw = row[deptCol]
      const normalized = normalizeDepartmentName(raw)
      if (String(raw).trim() !== normalized) fixed++
      return { ...row, [deptCol]: normalized }
    })
    summary = `Applied ${Object.keys(DEPT_ALIASES).length} known aliases — ${fixed} department values updated.`
    logAction = "ai-fix-typos"
  } else if (wantsUnknown) {
    let fixed = 0
    nextDirectory = nextDirectory.map((row) => {
      const raw = row[deptCol]
      const next = normalizeDepartmentName(raw)
      if (next === "Unknown" && String(raw ?? "").trim() && String(raw).trim() !== "Unknown") fixed++
      if (!String(raw ?? "").trim() || String(raw).trim() === "undefined") {
        fixed++
        return { ...row, [deptCol]: "Unknown" }
      }
      return { ...row, [deptCol]: next }
    })
    summary = `Normalized empty department fields — ${fixed} rows set to Unknown.`
    logAction = "ai-normalize-unknown"
  } else if (wantsRemoveTest) {
    const { headers, rows } = parseCsvText(usageCsvText)
    const before = rows.length
    const filtered = rows.filter((r) => !String(r.employee_id ?? "").startsWith("NSF900"))
    nextCsv = rowsToCsv(headers, filtered)
    summary = `Removed ${before - filtered.length} test-account rows (NSF900*) from usage export.`
    logAction = "ai-remove-test"
  } else if (wantsListUnmapped) {
    const empIds = new Set(nextDirectory.map((r) => String(r[idCol] ?? "").trim()).filter(Boolean))
    const { rows } = parseCsvText(usageCsvText)
    const seen = new Set()
    const unmapped = []
    for (const row of rows) {
      const id = String(row.employee_id ?? "").trim()
      if (!id || seen.has(id)) continue
      seen.add(id)
      if (!empIds.has(id)) unmapped.push(id)
    }
    summary =
      unmapped.length === 0
        ? "All provisioned IDs in the CSV are present in the directory."
        : `${unmapped.length} provisioned IDs not in directory: ${unmapped.slice(0, 8).join(", ")}${unmapped.length > 8 ? "…" : ""}. Add them to the Excel or remove from CSV.`
    logAction = "ai-list-unmapped"
  } else {
    summary =
      "Try: “Fix department typos”, “Set empty departments to Unknown”, “Remove test accounts NSF900”, or “List unmapped provisioned IDs”."
    logAction = "ai-help"
  }

  return {
    directoryRows: nextDirectory,
    usageCsvText: nextCsv,
    summary,
    logAction,
    changed: wantsTypos || wantsUnknown || wantsRemoveTest,
  }
}
