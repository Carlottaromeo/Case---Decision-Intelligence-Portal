import { useState } from "react"
import { IconSparkles, IconTarget } from "./ProcessIcons"
import { useSession } from "../../context/SessionContext"
import {
  createUseCaseOpportunity,
  formatUseCaseDate,
  generateAiUseCaseSuggestions,
  USE_CASE_SOURCE_META,
} from "../../utils/workflowUseCases"
import WorkflowSessionAuthor from "./WorkflowSessionAuthor"

export default function WorkflowUseCaseTab({ card, onUpdate }) {
  const { user } = useSession()
  const [mode, setMode] = useState(null)
  const [manualDraft, setManualDraft] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPreview, setAiPreview] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState("")

  const opportunities = Array.isArray(card.useCaseOpportunities) ? card.useCaseOpportunities : []

  const updateList = (next) => onUpdate({ useCaseOpportunities: next })

  const addOpportunity = (text, source) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const item = createUseCaseOpportunity({
      text: trimmed,
      source,
      authorName: source === "manual" ? user?.name ?? null : null,
    })
    updateList([...opportunities, item])
  }

  const removeOpportunity = (id) => {
    updateList(opportunities.filter((o) => o.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const startEdit = (opp) => {
    setEditingId(opp.id)
    setEditDraft(opp.text)
  }

  const saveEdit = (id) => {
    const trimmed = editDraft.trim()
    if (!trimmed) return
    updateList(opportunities.map((o) => (o.id === id ? { ...o, text: trimmed } : o)))
    setEditingId(null)
    setEditDraft("")
  }

  const runAiSuggest = async () => {
    setMode("ai")
    setAiLoading(true)
    setAiPreview([])
    await new Promise((r) => setTimeout(r, 700))
    setAiPreview(generateAiUseCaseSuggestions(card))
    setAiLoading(false)
  }

  const acceptSuggestion = (text) => {
    addOpportunity(text, "ai")
    setAiPreview((prev) => prev.filter((t) => t !== text))
  }

  const addManual = (e) => {
    e.preventDefault()
    if (!manualDraft.trim()) return
    addOpportunity(manualDraft, "manual")
    setManualDraft("")
  }

  if (card.aiStatus === "human") {
    return (
      <div className="wf-uc-tab wf-uc-tab--empty">
        <IconTarget size={28} color="#9ca3af" />
        <p>This activity is classified as <strong>Human only</strong>.</p>
        <p className="wf-uc-tab__hint">AI opportunities do not apply to this step.</p>
        {card.humanOnlyNote && <div className="wf-activity-modal__note">{card.humanOnlyNote}</div>}
      </div>
    )
  }

  return (
    <div className="wf-uc-tab">
      {opportunities.length > 0 ? (
        <ul className="wf-uc-list">
          {opportunities.map((opp) => {
            const meta = USE_CASE_SOURCE_META[opp.source] ?? USE_CASE_SOURCE_META.manual
            const isEditing = editingId === opp.id
            return (
              <li key={opp.id} className={`wf-uc-item wf-uc-item--${opp.source}`}>
                <div className="wf-uc-item__head">
                  <span className={`wf-uc-item__badge wf-uc-item__badge--${opp.source}`}>
                    {opp.source === "ai" ? <IconSparkles size={11} color="currentColor" /> : null}
                    {meta.label}
                  </span>
                  <time className="wf-uc-item__date" dateTime={opp.createdAt}>
                    {formatUseCaseDate(opp.createdAt)}
                  </time>
                </div>

                {isEditing ? (
                  <div className="wf-uc-item__edit">
                    <textarea
                      value={editDraft}
                      rows={3}
                      onChange={(e) => setEditDraft(e.target.value)}
                    />
                    <div className="wf-uc-item__edit-actions">
                      <button type="button" className="wf-builder__btn wf-builder__btn--ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                      <button type="button" className="wf-builder__btn wf-builder__btn--primary" onClick={() => saveEdit(opp.id)}>
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="wf-uc-item__text">{opp.text}</p>
                )}

                {opp.authorName && opp.source === "manual" && (
                  <span className="wf-uc-item__author">Added by {opp.authorName}</span>
                )}

                {!isEditing && (
                  <div className="wf-uc-item__actions">
                    <button type="button" onClick={() => startEdit(opp)}>Edit</button>
                    <button type="button" className="wf-uc-item__delete" onClick={() => removeOpportunity(opp.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="wf-uc-tab__empty-list">No opportunities tracked yet.</p>
      )}

      <div className="wf-uc-mode-picker">
        <p className="wf-uc-mode-picker__label">Add an opportunity</p>
        <div className="wf-uc-mode-picker__actions">
          <button
            type="button"
            className={`wf-uc-mode-btn${mode === "manual" ? " wf-uc-mode-btn--active" : ""}`}
            onClick={() => setMode("manual")}
          >
            Write manually
          </button>
          <button
            type="button"
            className={`wf-uc-mode-btn wf-uc-mode-btn--ai${mode === "ai" ? " wf-uc-mode-btn--active" : ""}`}
            onClick={runAiSuggest}
            disabled={aiLoading}
          >
            <IconSparkles size={14} color="currentColor" />
            {aiLoading ? "Generating…" : "Suggest with AI"}
          </button>
        </div>
      </div>

      {mode === "manual" && (
        <section className="wf-uc-block">
          <h4 className="wf-uc-block__title">Manual entry</h4>
          <WorkflowSessionAuthor prefix="Opportunity by" />
          <form className="wf-uc-manual-form" onSubmit={addManual}>
            <textarea
              value={manualDraft}
              rows={3}
              placeholder="Describe the use case you want to track…"
              onChange={(e) => setManualDraft(e.target.value)}
            />
            <button
              type="submit"
              className="wf-builder__btn wf-builder__btn--primary"
              disabled={!manualDraft.trim()}
            >
              Add opportunity
            </button>
          </form>
        </section>
      )}

      {mode === "ai" && (
        <section className="wf-uc-block">
          <h4 className="wf-uc-block__title">
            <IconSparkles size={14} color="#6229FF" />
            AI suggestions
          </h4>
          <p className="wf-uc-block__desc">
            Based on this activity&apos;s title and description. Review before adding.
          </p>
          {aiPreview.length > 0 ? (
            <ul className="wf-uc-preview-list">
              {aiPreview.map((text) => (
                <li key={text} className="wf-uc-preview">
                  <p>{text}</p>
                  <button
                    type="button"
                    className="wf-builder__btn wf-builder__btn--ghost wf-uc-preview__add"
                    onClick={() => acceptSuggestion(text)}
                  >
                    Add to list
                  </button>
                </li>
              ))}
            </ul>
          ) : !aiLoading ? (
            <p className="wf-uc-block__hint">No suggestions yet — click Suggest with AI above.</p>
          ) : null}
        </section>
      )}
    </div>
  )
}
