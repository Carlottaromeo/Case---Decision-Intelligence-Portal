import { useState } from "react"
import { IconSparkles, IconTarget } from "./ProcessIcons"
import { useSession } from "../../context/SessionContext"
import WorkflowCommentsBlock from "./WorkflowCommentsBlock"
import {
  createUseCaseOpportunity,
  formatUseCaseDate,
  generateAiUseCaseSuggestions,
  USE_CASE_SOURCE_META,
} from "../../utils/workflowUseCases"

export default function WorkflowUseCaseTab({ card, onUpdate }) {
  const { user } = useSession()
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
        <p>Questa attività è classificata come <strong>Human only</strong>.</p>
        <p className="wf-uc-tab__hint">Le opportunità AI non sono applicabili a questo step.</p>
        {card.humanOnlyNote && <div className="wf-activity-modal__note">{card.humanOnlyNote}</div>}
      </div>
    )
  }

  return (
    <div className="wf-uc-tab">
      <div className="wf-uc-tab__intro">
        <p>
          Traccia una o più opportunità di use case per questa attività.
          Ogni voce è classificata come <strong>consigliata dal tool</strong> o <strong>scritta manualmente</strong>.
        </p>
      </div>

      {opportunities.length > 0 ? (
        <ul className="wf-uc-list">
          {opportunities.map((opp) => {
            const meta = USE_CASE_SOURCE_META[opp.source] ?? USE_CASE_SOURCE_META.manual
            const isEditing = editingId === opp.id
            return (
              <li
                key={opp.id}
                className={`wf-uc-item wf-uc-item--${opp.source}`}
              >
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
                        Annulla
                      </button>
                      <button type="button" className="wf-builder__btn wf-builder__btn--primary" onClick={() => saveEdit(opp.id)}>
                        Salva
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="wf-uc-item__text">{opp.text}</p>
                )}

                {opp.authorName && opp.source === "manual" && (
                  <span className="wf-uc-item__author">di {opp.authorName}</span>
                )}

                {!isEditing && (
                  <div className="wf-uc-item__actions">
                    <button type="button" onClick={() => startEdit(opp)}>Modifica</button>
                    <button type="button" className="wf-uc-item__delete" onClick={() => removeOpportunity(opp.id)}>
                      Elimina
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="wf-uc-tab__empty-list">Nessuna opportunità tracciata. Aggiungine una con l&apos;AI o manualmente.</p>
      )}

      <section className="wf-uc-block">
        <h4 className="wf-uc-block__title">
          <IconSparkles size={14} color="#6229FF" />
          Suggerimenti AI
        </h4>
        <p className="wf-uc-block__desc">
          Il tool analizza titolo e descrizione dell&apos;attività e propone use case pertinenti.
        </p>
        <button
          type="button"
          className="wf-builder__btn wf-builder__btn--primary wf-uc-block__ai-btn"
          onClick={runAiSuggest}
          disabled={aiLoading}
        >
          {aiLoading ? "Generazione in corso…" : "Genera suggerimenti AI"}
        </button>

        {aiPreview.length > 0 && (
          <ul className="wf-uc-preview-list">
            {aiPreview.map((text) => (
              <li key={text} className="wf-uc-preview">
                <p>{text}</p>
                <button
                  type="button"
                  className="wf-builder__btn wf-builder__btn--ghost wf-uc-preview__add"
                  onClick={() => acceptSuggestion(text)}
                >
                  Aggiungi come consigliata
                </button>
              </li>
            ))}
          </ul>
        )}

        {!aiLoading && aiPreview.length === 0 && opportunities.length > 0 && (
          <p className="wf-uc-block__hint">Clicca per ottenere nuove idee non ancora presenti nella lista.</p>
        )}
      </section>

      <section className="wf-uc-block">
        <h4 className="wf-uc-block__title">Aggiungi manualmente</h4>
        <form className="wf-uc-manual-form" onSubmit={addManual}>
          <textarea
            value={manualDraft}
            rows={3}
            placeholder="Descrivi l'opportunità di use case che vuoi tracciare…"
            onChange={(e) => setManualDraft(e.target.value)}
          />
          <button
            type="submit"
            className="wf-builder__btn wf-builder__btn--primary"
            disabled={!manualDraft.trim()}
          >
            Aggiungi opportunità manuale
          </button>
        </form>
      </section>

      <WorkflowCommentsBlock card={card} onUpdate={onUpdate} />
    </div>
  )
}
