import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import {
  DATA_TIERS,
  WORKFLOW_DATA_TIERS,
} from "../data/dashboardCopy"

const DEPT_HEADERS = [
  "Rank",
  "Dipartimento",
  "Processo",
  "Score",
  "Priorità",
  "Adozione %",
  "Gap adozione",
  "Potenziale AI",
  "Investimento consigliato",
  "Impatto stimato",
  "Workflow live boost",
  "Perché (AI summary)",
  "Cosa fare (AI summary)",
]

const WORKFLOW_HEADERS = [
  "Dipartimento",
  "Workflow",
  "Tipo dati",
  "Readiness %",
  "Opportunità",
  "Opp. AI",
  "Opp. manuali",
  "Hint investimento",
  "OODA",
]

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

function todayLabel() {
  return new Date().toLocaleDateString("it-IT", {
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
    parts.push(`Periodo: ${filters.dateFrom ?? "—"} → ${filters.dateTo ?? "—"}`)
  }
  if (filters.department) parts.push(`BU: ${filters.department}`)
  if (filters.seniority) parts.push(`Seniority: ${filters.seniority}`)
  if (filters.adoptionLevel) parts.push(`Adozione: ${filters.adoptionLevel}`)
  if (filters.investmentPriority) parts.push(`Priorità: ${filters.investmentPriority}`)
  return parts.join(" · ")
}

export function buildDepartmentExportRow(item, rank) {
  return {
    Rank: rank,
    Dipartimento: item.department,
    Processo: item.process_name,
    Score: item.combined_score ?? "",
    Priorità: item.investment_priority,
    "Adozione %": item.adoption_rate,
    "Gap adozione": item.adoption_gap,
    "Potenziale AI": item.ai_potential,
    "Investimento consigliato": item.recommended_investment,
    "Impatto stimato": item.estimated_impact,
    "Workflow live boost": item.live_workflow_boost ?? 0,
    "Perché (AI summary)": item.coach?.perche ?? "",
    "Cosa fare (AI summary)": item.coach?.cosa_fare ?? "",
  }
}

export function buildWorkflowExportRows(item) {
  return (item.workflows ?? []).map((wf) => ({
    Dipartimento: item.department,
    Workflow: wf.title,
    "Tipo dati": workflowDataType(wf),
    "Readiness %": wf.readiness_score,
    Opportunità: wf.opportunityCount,
    "Opp. AI": wf.aiOpportunities,
    "Opp. manuali": wf.manualOpportunities,
    "Hint investimento": wf.investment_hint,
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
    { Campo: "Export", Valore: "Investment Matrix — riepilogo" },
    { Campo: "Data", Valore: todayLabel() },
    { Campo: "Filtri", Valore: formatFiltersMeta(filters) || "Nessun filtro attivo" },
    { Campo: "Nota tier", Valore: `${DATA_TIERS.measured.label} / ${DATA_TIERS.simulated.label} / ${WORKFLOW_DATA_TIERS.workflow_live.label} / ${WORKFLOW_DATA_TIERS.workflow_illustrative.label}` },
  ]
  XLSX.utils.book_append_sheet(wb, sheetFromRows(metaRows, ["Campo", "Valore"]), "Info")
  XLSX.utils.book_append_sheet(wb, sheetFromRows(departments, DEPT_HEADERS), "Dipartimenti")
  XLSX.utils.book_append_sheet(wb, sheetFromRows(workflows, WORKFLOW_HEADERS), "Workflow")

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
  doc.text("Investment Matrix — riepilogo", margin, y)
  y += 8

  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.text(`${todayLabel()}${formatFiltersMeta(filters) ? ` · ${formatFiltersMeta(filters)}` : ""}`, margin, y)
  y += 10

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(31, 31, 31)
  doc.text("Dipartimenti (per rank)", margin, y)
  y += 6

  const deptPdfHeaders = [
    "Rank",
    "Dipartimento",
    "Score",
    "Priorità",
    "Adozione %",
    "Investimento consigliato",
    "Perché (AI summary)",
  ]
  const deptPdfRows = departments.map((d) => ({
    Rank: d.Rank,
    Dipartimento: d.Dipartimento,
    Score: d.Score,
    Priorità: d.Priorità,
    "Adozione %": d["Adozione %"],
    "Investimento consigliato": d["Investimento consigliato"],
    "Perché (AI summary)": d["Perché (AI summary)"],
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
  doc.text("Workflow per dipartimento", margin, y)
  y += 6

  const wfPdfHeaders = [
    "Dipartimento",
    "Workflow",
    "Tipo dati",
    "Readiness %",
    "Opportunità",
    "Hint investimento",
  ]
  const wfPdfRows = workflows.map((w) => ({
    Dipartimento: w.Dipartimento,
    Workflow: w.Workflow,
    "Tipo dati": w["Tipo dati"],
    "Readiness %": w["Readiness %"],
    Opportunità: w.Opportunità,
    "Hint investimento": w["Hint investimento"],
  }))
  const wfWidths = [38, 70, 32, 18, 18, 38]

  y = addPdfTable(doc, wfPdfHeaders, wfPdfRows, y, margin, wfWidths)

  doc.setFontSize(7)
  doc.setTextColor(156, 163, 175)
  doc.text(
    `${DATA_TIERS.measured.label} = usage export · ${DATA_TIERS.simulated.label} = regole processo · ${WORKFLOW_DATA_TIERS.workflow_live.label} = Contract Risk Assessment · ${WORKFLOW_DATA_TIERS.workflow_illustrative.label} = catalogo prototipo`,
    margin,
    200
  )

  doc.save(`investment-matrix-${todayStamp()}.pdf`)
}
