/** Use case opportunity tracking for workflow activities. */

import { LOCALE } from "../theme"

export const USE_CASE_SOURCE_META = {
  ai: { label: "Tool-recommended", shortLabel: "AI" },
  manual: { label: "Written manually", shortLabel: "Manual" },
}

function createUseCaseId() {
  return `uc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function createUseCaseOpportunity({ text, source, authorName, createdAt }) {
  return {
    id: createUseCaseId(),
    text: String(text ?? "").trim(),
    source: source === "ai" ? "ai" : "manual",
    authorName: authorName ?? null,
    createdAt: createdAt ?? new Date().toISOString(),
  }
}

export function migrateCardUseCases(card) {
  const opportunities = Array.isArray(card.useCaseOpportunities)
    ? [...card.useCaseOpportunities]
    : []

  if (!opportunities.length && typeof card.useCase === "string" && card.useCase.trim()) {
    opportunities.push(
      createUseCaseOpportunity({
        text: card.useCase.trim(),
        source: "manual",
        authorName: "Imported",
      })
    )
  }

  const { useCase: _legacy, ...rest } = card
  return { ...rest, useCaseOpportunities: opportunities }
}

export function formatUseCaseDate(iso) {
  if (!iso) return ""
  try {
    return new Intl.DateTimeFormat(LOCALE, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function hasUseCaseOpportunities(card) {
  return Array.isArray(card.useCaseOpportunities) && card.useCaseOpportunities.length > 0
}

/** Summary for activity card footer — count, sources, authors. */
export function summarizeOpportunities(card) {
  const opps = card.useCaseOpportunities ?? []
  if (!opps.length) return null
  const manual = opps.filter((o) => o.source === "manual")
  const ai = opps.filter((o) => o.source === "ai")
  const authors = [...new Set(manual.map((o) => o.authorName).filter(Boolean))]
  return {
    count: opps.length,
    manualCount: manual.length,
    aiCount: ai.length,
    authors,
  }
}

export function generateAiUseCaseSuggestions(card) {
  const title = (card.title ?? "this activity").trim()
  const summary = (card.summary ?? "").trim()
  const snippet = summary.length > 100 ? `${summary.slice(0, 100)}…` : summary

  const candidates = [
    `AI agent for "${title}": classifies inputs, proposes actions, and generates structured drafts${snippet ? ` starting from: ${snippet}` : ""}. Mandatory human review.`,
    `Contextual copilot for "${title}": assists the analyst with dynamic checklists, field extraction, and real-time synthesis of critical points.`,
    `RAG pipeline on internal knowledge base to support ${title.toLowerCase()}: answers with source citations, confidence scoring, and audit logs.`,
    `Semi-guided automation for ${title.toLowerCase()}: reduces AS-IS time (${card.timeAsIs ?? "n/a"}) toward the TO-BE target with explicit human-in-the-loop.`,
  ]

  const existing = new Set(
    (card.useCaseOpportunities ?? []).map((o) => o.text.toLowerCase())
  )

  return candidates
    .filter((text) => !existing.has(text.toLowerCase()))
    .slice(0, 2)
}

export function formatUseCasesForExport(opportunities) {
  const list = Array.isArray(opportunities) ? opportunities : []
  if (!list.length) return ""
  return list
    .map((o) => {
      const src = USE_CASE_SOURCE_META[o.source]?.label ?? o.source
      const who = o.authorName ? ` · ${o.authorName}` : ""
      return `[${src}${who}] ${o.text}`
    })
    .join("\n")
}
