import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import {
  DATA_TIERS,
  WORKFLOW_DATA_TIERS,
} from "../data/dashboardCopy"
import { LOCALE } from "../theme"

const DEPT_HEADERS = [
  "Rank",
  "Department",
  "Process",
  "Score",
  "Priority",
  "Adoption %",
  "Adoption gap",
  "AI potential",
  "Recommended investment",
  "Estimated impact",
  "Workflow live boost",
  "Why (AI summary)",
  "What to do (AI summary)",
]

const WORKFLOW_HEADERS = [
  "Department",
  "Workflow",
  "Data type",
  "Readiness %",
  "Opportunities",
  "AI opp.",
  "Manual opp.",
  "Investment hint",
  "OODA",
]

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

function todayLabel() {
  return new Date().toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function workflowDataType(workflow) {
  return workflow.illustrative
    ? WORKFLOW_DATA_TIERS.workflow_illustrative.label
    : WORKFLOW_DATA_TIERS.workflow_live.label
}

function formatFiltersMeta(filters) {
  if (!filters) return ""
  const parts = []
  if (filters.dateFrom || filters.dateTo) {
    parts.push(`Period: ${filters.dateFrom ?? "—"} → ${filters.dateTo ?? "—"}`)
  }
  if (filters.department) parts.push(`BU: ${filters.department}`)
  if (filters.seniority) parts.push(`Seniority: ${filters.seniority}`)
  if (filters.adoptionLevel) parts.push(`Adoption: ${filters.adoptionLevel}`)
  if (filters.investmentPriority) parts.push(`Priority: ${filters.investmentPriority}`)
  return parts.join(" · ")
}

export function buildDepartmentExportRow(item, rank) {
  return {
    Rank: rank,
    Department: item.department,
    Process: item.process_name,
    Score: item.combined_score ?? "",
    Priority: item.investment_priority,
    "Adoption %": item.adoption_rate,
    "Adoption gap": item.adoption_gap,
    "AI potential": item.ai_potential,
    "Recommended investment": item.recommended_investment,
    "Estimated impact": item.estimated_impact,
    "Workflow live boost": item.live_workflow_boost ?? 0,
    "Why (AI summary)": item.coach?.perche ?? "",
    "What to do (AI summary)": item.coach?.cosa_fare ?? "",
  }
}

export function buildWorkflowExportRows(item) {
  return (item.workflows ?? []).map((wf) => ({
    Department: item.department,
    Workflow: wf.title,
    "Data type": workflowDataType(wf),
    "Readiness %": wf.readiness_score,
    Opportunities: wf.opportunityCount,
    "AI opp.": wf.aiOpportunities,
    "Manual opp.": wf.manualOpportunities,
    "Investment hint": wf.investment_hint,
    OODA: wf.ooda,
  }))
}

export function buildInvestmentExportData(rankedPortfolio) {
  const departments = rankedPortfolio.map((item, i) =>
    buildDepartmentExportRow(item, i + 1)
  )
  const workflows = rankedPortfolio.flatMap((item) => buildWorkflowExportRows(item))
  return { departments, workflows }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function sheetFromRows(rows, headers) {
  return XLSX.utils.json_to_sheet(rows, { header: headers })
}

export function exportInvestmentExcel(rankedPortfolio, { filters } = {}) {
  const { departments, workflows } = buildInvestmentExportData(rankedPortfolio)
  const wb = XLSX.utils.book_new()

  const metaRows = [
    { Field: "Export", Value: "Investment Matrix — summary" },
    { Field: "Date", Value: todayLabel() },
    { Field: "Filters", Value: formatFiltersMeta(filters) || "No active filters" },
    { Field: "Tier note", Value: `${DATA_TIERS.measured.label} / ${DATA_TIERS.simulated.label} / ${WORKFLOW_DATA_TIERS.workflow_live.label} / ${WORKFLOW_DATA_TIERS.workflow_illustrative.label}` },
  ]
  XLSX.utils.book_append_sheet(wb, sheetFromRows(metaRows, ["Field", "Value"]), "Info")
  XLSX.utils.book_append_sheet(wb, sheetFromRows(departments, DEPT_HEADERS), "Departments")
  XLSX.utils.book_append_sheet(wb, sheetFromRows(workflows, WORKFLOW_HEADERS), "Workflows")

  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" })
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  downloadBlob(blob, `investment-matrix-${todayStamp()}.xlsx`)
}

function addPdfTable(doc, headers, rows, startY, margin, colWidths) {
  let y = startY
  const rowH = 6
  const fontSize = 8

  doc.setFont("helvetica", "bold")
  doc.setFontSize(fontSize)
  doc.setTextColor(31, 31, 31)

  let x = margin
  for (let i = 0; i < headers.length; i++) {
    doc.text(String(headers[i]).slice(0, 18), x, y)
    x += colWidths[i]
  }
  y += rowH

  doc.setFont("helvetica", "normal")
  doc.setTextColor(75, 85, 99)

  for (const row of rows) {
    if (y > 275) {
      doc.addPage()
      y = 20
    }
    x = margin
    const values = headers.map((h) => String(row[h] ?? "—"))
    for (let i = 0; i < values.length; i++) {
      doc.text(values[i].slice(0, 22), x, y)
      x += colWidths[i]
    }
    y += rowH
  }

  return y + 8
}

export function exportInvestmentPdf(rankedPortfolio, { filters } = {}) {
  const { departments, workflows } = buildInvestmentExportData(rankedPortfolio)
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" })
  const margin = 14
  let y = 18

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(98, 41, 255)
  doc.text("Investment Matrix — summary", margin, y)
  y += 8

  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.text(`${todayLabel()}${formatFiltersMeta(filters) ? ` · ${formatFiltersMeta(filters)}` : ""}`, margin, y)
  y += 10

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(31, 31, 31)
  doc.text("Departments (by rank)", margin, y)
  y += 6

  const deptPdfHeaders = [
    "Rank",
    "Department",
    "Score",
    "Priority",
    "Adoption %",
    "Recommended investment",
    "Why (AI summary)",
  ]
  const deptPdfRows = departments.map((d) => ({
    Rank: d.Rank,
    Department: d.Department,
    Score: d.Score,
    Priority: d.Priority,
    "Adoption %": d["Adoption %"],
    "Recommended investment": d["Recommended investment"],
    "Why (AI summary)": d["Why (AI summary)"],
  }))
  const deptWidths = [10, 42, 14, 22, 18, 38, 130]

  y = addPdfTable(doc, deptPdfHeaders, deptPdfRows, y, margin, deptWidths)

  if (y > 170) {
    doc.addPage()
    y = 20
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(31, 31, 31)
  doc.text("Workflows by department", margin, y)
  y += 6

  const wfPdfHeaders = [
    "Department",
    "Workflow",
    "Data type",
    "Readiness %",
    "Opportunities",
    "Investment hint",
  ]
  const wfPdfRows = workflows.map((w) => ({
    Department: w.Department,
    Workflow: w.Workflow,
    "Data type": w["Data type"],
    "Readiness %": w["Readiness %"],
    Opportunities: w.Opportunities,
    "Investment hint": w["Investment hint"],
  }))
  const wfWidths = [38, 70, 32, 18, 18, 38]

  y = addPdfTable(doc, wfPdfHeaders, wfPdfRows, y, margin, wfWidths)

  doc.setFontSize(7)
  doc.setTextColor(156, 163, 175)
  doc.text(
    `${DATA_TIERS.measured.label} = usage export · ${DATA_TIERS.simulated.label} = process rules · ${WORKFLOW_DATA_TIERS.workflow_live.label} = Contract Risk Assessment · ${WORKFLOW_DATA_TIERS.workflow_illustrative.label} = prototype catalog`,
    margin,
    200
  )

  doc.save(`investment-matrix-${todayStamp()}.pdf`)
}
