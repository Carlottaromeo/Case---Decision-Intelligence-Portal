/** AI tool tracking on workflow activity cards. */

export const PREDEFINED_AI_TOOLS = ["Chat", "Excel", "Coding IDE"]

export function normalizeAiTools(tools) {
  if (!Array.isArray(tools)) return []
  const seen = new Set()
  const out = []
  for (const raw of tools) {
    const label = String(raw ?? "").trim()
    if (!label) continue
    const key = label.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(label)
  }
  return out
}

export function inferAiToolsFromCard(card) {
  if (Array.isArray(card.aiTools) && card.aiTools.length) {
    return normalizeAiTools(card.aiTools)
  }
  if (card.aiStatus !== "active") return []

  const text = String(card.aiToday ?? "").toLowerCase()
  const found = []
  if (/\bchat\b/.test(text)) found.push("Chat")
  if (/\bexcel\b/.test(text)) found.push("Excel")
  if (/\bcoding\b/.test(text) || /\bide\b/.test(text)) found.push("Coding IDE")
  return found
}

export function formatAiTodayLabel(tools) {
  const list = normalizeAiTools(tools)
  return list.length ? list.join(", ") : "None"
}

export function isHumanOnlyCard(card) {
  return card.aiStatus === "human" || Boolean(card.humanOnlyNote)
}

export function deriveAiStatusFromTools(tools, card) {
  const list = normalizeAiTools(tools)
  if (list.length > 0) return "active"
  if (isHumanOnlyCard(card)) return "human"
  return "opportunity"
}

export function buildAiToolsPatch(tools, card) {
  const aiTools = normalizeAiTools(tools)
  const aiStatus = deriveAiStatusFromTools(aiTools, card)
  return {
    aiTools,
    aiStatus,
    aiToday: formatAiTodayLabel(aiTools),
  }
}

export function migrateCardAiTools(card) {
  const aiTools = inferAiToolsFromCard(card)
  return {
    ...card,
    aiTools,
    aiStatus: deriveAiStatusFromTools(aiTools, card),
    aiToday: aiTools.length ? formatAiTodayLabel(aiTools) : (card.aiToday ?? "None"),
  }
}

export function migrateWorkflowAiTools(workflow) {
  const draft = JSON.parse(JSON.stringify(workflow))
  for (const phase of draft.phases ?? []) {
    phase.cards = (phase.cards ?? []).map(migrateCardAiTools)
  }
  return draft
}
