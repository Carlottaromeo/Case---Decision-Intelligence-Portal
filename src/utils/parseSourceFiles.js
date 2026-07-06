import * as XLSX from "xlsx"
import { normalizeDepartmentName } from "../data/deptNormalize"
import { EMPLOYEE_ROSTER } from "../data/data"

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

export function parseCsvText(csvText) {
  const lines = csvText.trim().split(/\r?\n/)
  if (!lines.length) return { headers: [], rows: [] }
  const headers = parseCsvLine(lines[0])
  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line)
    const row = {}
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? ""
    })
    return row
  })
  return { headers, rows }
}

export function rowsToCsv(headers, rows) {
  const escape = (v) => {
    const s = String(v ?? "")
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const headerLine = headers.map(escape).join(",")
  const body = rows.map((row) => headers.map((h) => escape(row[h])).join(","))
  return [headerLine, ...body].join("\n")
}

export function rosterToDirectoryRows() {
  return EMPLOYEE_ROSTER.map((e) => ({
    "Employee id": e.employee_id,
    Department: e.department,
    Seniority: e.seniority,
  }))
}

export const DIRECTORY_HEADERS = ["Employee id", "Department", "Seniority"]

export function directoryRowsToSheet(rows) {
  const ws = XLSX.utils.json_to_sheet(rows, { header: DIRECTORY_HEADERS })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Directory")
  return XLSX.write(wb, { type: "array", bookType: "xlsx" })
}

export function parseXlsxArray(buffer) {
  const wb = XLSX.read(buffer, { type: "array" })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" })
  const headers = rows.length
    ? Object.keys(rows[0])
    : DIRECTORY_HEADERS
  return { headers, rows, sheetName: wb.SheetNames[0] }
}

export function rowsToXlsxBlob(rows, headers = DIRECTORY_HEADERS) {
  const buffer = directoryRowsToSheet(rows)
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}

export function analyzeSourceData(directoryRows, usageCsvText) {
  const deptCol = directoryRows.length
    ? Object.keys(directoryRows[0]).find((k) => /department/i.test(k)) || "Department"
    : "Department"
  const idCol = directoryRows.length
    ? Object.keys(directoryRows[0]).find((k) => /employee.?id/i.test(k)) || "Employee id"
    : "Employee id"

  const empMap = {}
  let excelUnknown = 0
  for (const row of directoryRows) {
    const id = String(row[idCol] ?? "").trim()
    if (!id) continue
    const dept = normalizeDepartmentName(row[deptCol])
    empMap[id] = dept
    if (dept === "Unknown") excelUnknown++
  }

  const { rows: usageRows } = parseCsvText(usageCsvText)
  const provisioned = new Set()
  let unmappedNotInDirectory = 0
  let unmappedMissingDept = 0

  for (const row of usageRows) {
    const empId = String(row.employee_id ?? "").trim()
    if (!empId) continue
    provisioned.add(empId)
    if (!empMap[empId]) {
      unmappedNotInDirectory++
    } else if (empMap[empId] === "Unknown") {
      unmappedMissingDept++
    }
  }

  const provisionedTotal = provisioned.size
  const unmappedProvisioned = unmappedNotInDirectory + unmappedMissingDept
  const mapped = provisionedTotal - unmappedProvisioned

  const deptCounts = {}
  for (const dept of Object.values(empMap)) {
    deptCounts[dept] = (deptCounts[dept] ?? 0) + 1
  }

  return {
    directoryRows: directoryRows.length,
    usageRows: usageRows.length,
    provisionedTotal,
    provisionedMapped: mapped,
    unmappedProvisioned,
    unmappedNotInDirectory,
    unmappedMissingDept,
    excelUnknown,
    mappingPct: provisionedTotal > 0 ? Math.round((mapped / provisionedTotal) * 1000) / 10 : 0,
    deptCounts,
  }
}

export async function fetchText(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${url}`)
  return res.text()
}

export async function fetchArrayBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${url}`)
  return res.arrayBuffer()
}
