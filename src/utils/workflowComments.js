import { LOCALE } from "../theme"

export function createCommentId() {
  return `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function createComment({ authorId, authorName, text, createdAt }) {
  return {
    id: createCommentId(),
    authorId: authorId ?? null,
    authorName: String(authorName ?? "Unknown").trim() || "Unknown",
    text: String(text ?? "").trim(),
    createdAt: createdAt ?? new Date().toISOString(),
  }
}

export function daysAgoIso(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(10, 30, 0, 0)
  return d.toISOString()
}

export function formatCommentDate(iso) {
  if (!iso) return ""
  try {
    return new Intl.DateTimeFormat(LOCALE, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function personInitials(name) {
  if (!name) return "?"
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

export function migrateCardComments(card) {
  const thread = Array.isArray(card.commentThread) ? [...card.commentThread] : []
  if (typeof card.comments === "string" && card.comments.trim() && !thread.length) {
    thread.push(createComment({ authorName: "Unknown", text: card.comments.trim() }))
  }
  const { comments: _legacy, ...rest } = card
  return { ...rest, commentThread: thread }
}

export function migrateWorkflowComments(workflow) {
  return {
    ...workflow,
    phases: workflow.phases.map((phase) => ({
      ...phase,
      cards: phase.cards.map(migrateCardComments),
    })),
  }
}

/** Demo seeds keyed by activity id — authors resolved from employee directory at load time. */
export const DEMO_COMMENT_SEEDS = {
  "intake-triage": [
    {
      employeeId: "NSF101102",
      fallbackName: "Hannah Davis",
      text: "We should prioritize auto-triage before the Q3 onboarding peak.",
      daysAgo: 6,
    },
  ],
  "document-analysis": [
    {
      employeeId: "NSF101103",
      fallbackName: "Lucas Roberts",
      text: "Chat usage is still ad hoc — we need a standardized RAG template.",
      daysAgo: 4,
    },
  ],
  "regulatory-check": [
    {
      employeeId: "NSF101104",
      fallbackName: "Charlotte Brown",
      text: "Gap analysis must cite specific articles; the LLM checklist draft looks promising.",
      daysAgo: 3,
    },
  ],
  "risk-scoring": [
    {
      employeeId: "NSF101105",
      fallbackName: "Mason Scott",
      text: "Excel macros work but score rationale is still manual.",
      daysAgo: 2,
    },
  ],
  "report-production": [
    {
      employeeId: "NSF101106",
      fallbackName: "Sophia Adams",
      text: "I propose a pilot with mandatory human review on every AI-generated paragraph.",
      daysAgo: 1,
    },
  ],
  "review-approval": [
    {
      employeeId: "NSF101107",
      fallbackName: "James Hill",
      text: "Final sign-off stays human — no delegating accountability to AI.",
      daysAgo: 0,
    },
  ],
}

export function buildSeedCommentsForCard(cardId, roster, department) {
  const seeds = DEMO_COMMENT_SEEDS[cardId]
  if (!seeds?.length) return []

  const deptPeople = (roster ?? []).filter((e) => e.department === department)
  const byId = new Map(deptPeople.map((e) => [e.employee_id, e]))

  return seeds.map((seed) => {
    const emp = byId.get(seed.employeeId)
    const authorName = emp?.full_name || seed.fallbackName
    return createComment({
      authorId: emp?.employee_id ?? seed.employeeId,
      authorName,
      text: seed.text,
      createdAt: daysAgoIso(seed.daysAgo),
    })
  })
}

export function formatCommentsForExport(thread) {
  const list = Array.isArray(thread) ? thread : []
  if (!list.length) return ""
  return list
    .map((c) => `${c.authorName} (${formatCommentDate(c.createdAt)}): ${c.text}`)
    .join("\n")
}

export function hasComments(card) {
  return Array.isArray(card.commentThread) && card.commentThread.length > 0
}
