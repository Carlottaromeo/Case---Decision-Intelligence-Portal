import { jsPDF } from "jspdf"
import { PRODUCT_NAME, PRODUCT_PERIOD } from "../data/dashboardCopy"

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

export function exportPageSummaryPdf({ title, subtitle, kpis = [], lines = [] }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" })
  let y = 48

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text(PRODUCT_NAME, 48, y)
  y += 22

  doc.setFontSize(13)
  doc.text(title ?? "Dashboard export", 48, y)
  y += 18

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(100)
  if (subtitle) {
    doc.text(subtitle, 48, y, { maxWidth: 500 })
    y += 16
  }
  doc.text(`Period: ${PRODUCT_PERIOD} · Exported ${todayStamp()}`, 48, y)
  y += 24
  doc.setTextColor(0)

  if (kpis.length) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("Key metrics", 48, y)
    y += 16
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    for (const kpi of kpis) {
      doc.text(`${kpi.label}: ${kpi.value}`, 48, y)
      y += 14
    }
    y += 8
  }

  if (lines.length) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("Notes", 48, y)
    y += 16
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    for (const line of lines) {
      const wrapped = doc.splitTextToSize(line, 500)
      doc.text(wrapped, 48, y)
      y += wrapped.length * 13 + 6
    }
  }

  const slug = (title ?? "page").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  doc.save(`${slug || "dashboard"}-${todayStamp()}.pdf`)
}
