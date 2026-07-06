import { jsPDF } from "jspdf"
import PptxGenJS from "pptxgenjs"
import { resolveOwnerDisplay } from "./workflowOwnerOptions"
import { formatCommentsForExport } from "./workflowComments"
import { formatUseCasesForExport } from "./workflowUseCases"

const STATUS_LABEL = {
  active: "AI in use today",
  opportunity: "AI opportunity",
  human: "Human only",
}

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function addPdfSection(doc, title, y, margin) {
  if (y > 260) {
    doc.addPage()
    y = 20
  }
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(31, 31, 31)
  doc.text(title, margin, y)
  return y + 8
}

function addPdfBody(doc, text, y, margin, maxWidth = 170) {
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(75, 85, 99)
  const lines = doc.splitTextToSize(String(text ?? "—"), maxWidth)
  for (const line of lines) {
    if (y > 280) {
      doc.addPage()
      y = 20
    }
    doc.text(line, margin, y)
    y += 5
  }
  return y + 4
}

export function exportWorkflowPdf({ workflow, params, department }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const margin = 18
  let y = 24

  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.setTextColor(98, 41, 255)
  doc.text(workflow.title, margin, y)
  y += 10

  doc.setFontSize(11)
  doc.setTextColor(107, 114, 128)
  doc.text(`${workflow.subtitle ?? department ?? ""} · ${todayLabel()}`, margin, y)
  y += 12

  if (params?.length) {
    y = addPdfSection(doc, "Parameters", y, margin)
    for (const p of params) {
      y = addPdfBody(doc, `${p.label}: ${p.value}`, y, margin)
    }
    y += 4
  }

  y = addPdfSection(doc, "Workflow overview", y, margin)
  y = addPdfBody(
    doc,
    "This document packages the current workflow diagram, activity owners, AI notes and reviewer comments for approval or presentation.",
    y,
    margin
  )

  for (const phase of workflow.phases) {
    y = addPdfSection(doc, phase.label, y, margin)

    for (const card of phase.cards) {
      if (y > 250) {
        doc.addPage()
        y = 20
      }

      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(31, 31, 31)
      doc.text(card.title, margin, y)
      y += 6

      y = addPdfBody(doc, `Owner: ${resolveOwnerDisplay(card)}`, y, margin)
      y = addPdfBody(doc, `Status: ${STATUS_LABEL[card.aiStatus] ?? card.aiStatus}`, y, margin)
      y = addPdfBody(doc, `Duration: ${card.timeAsIs}${card.aiStatus === "opportunity" ? ` → ${card.timeToBe}` : ""}`, y, margin)
      y = addPdfBody(doc, card.summary, y, margin)

      if (card.aiToday) y = addPdfBody(doc, `AI today: ${card.aiToday}`, y, margin)
      const useCaseText = formatUseCasesForExport(card.useCaseOpportunities)
      if (useCaseText) y = addPdfBody(doc, `Use case opportunities:\n${useCaseText}`, y, margin)
      if (card.humanOnlyNote) y = addPdfBody(doc, card.humanOnlyNote, y, margin)
      const commentText = formatCommentsForExport(card.commentThread)
      if (commentText) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.setTextColor(98, 41, 255)
        if (y > 275) { doc.addPage(); y = 20 }
        doc.text("Comments", margin, y)
        y += 5
        y = addPdfBody(doc, commentText, y, margin)
      }
      y += 4
    }
  }

  const safeName = workflow.title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-")
  doc.save(`${safeName || "workflow"}-report.pdf`)
}

export function exportWorkflowPptx({ workflow, params, department }) {
  const pptx = new PptxGenJS()
  pptx.author = "Northstar Dashboard"
  pptx.title = workflow.title

  const titleSlide = pptx.addSlide()
  titleSlide.addText(workflow.title, {
    x: 0.6,
    y: 1.2,
    w: 8.8,
    h: 1,
    fontSize: 28,
    bold: true,
    color: "1F1F1F",
  })
  titleSlide.addText(workflow.subtitle ?? department ?? "", {
    x: 0.6,
    y: 2.2,
    w: 8.8,
    fontSize: 14,
    color: "6B7280",
  })
  titleSlide.addText(`Approval pack · ${todayLabel()}`, {
    x: 0.6,
    y: 3.0,
    w: 8.8,
    fontSize: 11,
    color: "9CA3AF",
  })

  if (params?.length) {
    const paramSlide = pptx.addSlide()
    paramSlide.addText("Parameters", {
      x: 0.6,
      y: 0.5,
      w: 8.8,
      fontSize: 20,
      bold: true,
      color: "6229FF",
    })
    paramSlide.addText(
      params.map((p) => `${p.label}: ${p.value}`).join("\n"),
      { x: 0.6, y: 1.3, w: 8.8, h: 4, fontSize: 14, color: "374151" }
    )
  }

  for (const phase of workflow.phases) {
    const phaseSlide = pptx.addSlide()
    phaseSlide.addText(phase.label, {
      x: 0.6,
      y: 0.4,
      w: 8.8,
      fontSize: 22,
      bold: true,
      color: "6229FF",
    })

    const bullets = phase.cards.map((card) => {
      const commentText = formatCommentsForExport(card.commentThread)
      const comment = commentText ? ` · Commenti: ${commentText.replace(/\n/g, " | ")}` : ""
      return `${card.title} — ${resolveOwnerDisplay(card)} (${STATUS_LABEL[card.aiStatus]})${comment}`
    })

    phaseSlide.addText(bullets.join("\n"), {
      x: 0.6,
      y: 1.2,
      w: 8.8,
      h: 4.5,
      fontSize: 13,
      color: "374151",
      bullet: true,
    })

    for (const card of phase.cards) {
      const slide = pptx.addSlide()
      slide.addText(card.title, {
        x: 0.6,
        y: 0.4,
        w: 8.8,
        fontSize: 20,
        bold: true,
        color: "1F1F1F",
      })

      const blocks = [
        `Phase: ${phase.label}`,
        `Owner: ${resolveOwnerDisplay(card)}`,
        `Status: ${STATUS_LABEL[card.aiStatus] ?? card.aiStatus}`,
        `Duration: ${card.timeAsIs}${card.aiStatus === "opportunity" ? ` → ${card.timeToBe}` : ""}`,
        "",
        card.summary,
      ]

      if (card.aiToday) blocks.push("", `AI today: ${card.aiToday}`)
      const useCaseText = formatUseCasesForExport(card.useCaseOpportunities)
      if (useCaseText) blocks.push("", `Use case opportunities:\n${useCaseText}`)
      if (card.humanOnlyNote) blocks.push("", card.humanOnlyNote)
      const commentText = formatCommentsForExport(card.commentThread)
      if (commentText) blocks.push("", `Comments:\n${commentText}`)

      slide.addText(blocks.join("\n"), {
        x: 0.6,
        y: 1.1,
        w: 8.8,
        h: 4.8,
        fontSize: 12,
        color: "4B5563",
      })
    }
  }

  const safeName = workflow.title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-")
  pptx.writeFile({ fileName: `${safeName || "workflow"}-report.pptx` })
}
