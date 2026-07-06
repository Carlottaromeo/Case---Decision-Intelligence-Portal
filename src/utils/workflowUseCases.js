/** Use case opportunity tracking for workflow activities. */

export const USE_CASE_SOURCE_META = {
  ai: { label: "Consigliata dal tool", shortLabel: "AI" },
  manual: { label: "Scritta manualmente", shortLabel: "Manuale" },
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
        authorName: "Importato",
      })
    )
  }

  const { useCase: _legacy, ...rest } = card
  return { ...rest, useCaseOpportunities: opportunities }
}

export function formatUseCaseDate(iso) {
  if (!iso) return ""
  try {
    return new Intl.DateTimeFormat("it-IT", {
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

export function generateAiUseCaseSuggestions(card) {
  const title = (card.title ?? "questa attività").trim()
  const summary = (card.summary ?? "").trim()
  const snippet = summary.length > 100 ? `${summary.slice(0, 100)}…` : summary

  const candidates = [
    `Agente AI per "${title}": classifica input, propone azioni e genera bozze strutturate${snippet ? ` partendo da: ${snippet}` : ""}. Revisione umana obbligatoria.`,
    `Copilot contestuale su "${title}": assiste l'analista con checklist dinamiche, estrazione campi e sintesi dei punti critici in tempo reale.`,
    `Pipeline RAG su knowledge base interna per supportare ${title.toLowerCase()}: risposte con citazioni delle fonti, scoring di confidenza e log di audit.`,
    `Automazione semi-guidata per ${title.toLowerCase()}: riduce il tempo AS-IS (${card.timeAsIs ?? "n/d"}) verso il target TO-BE con human-in-the-loop esplicito.`,
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
