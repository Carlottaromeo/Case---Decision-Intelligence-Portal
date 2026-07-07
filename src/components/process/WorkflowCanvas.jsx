import { useState, useMemo, useCallback } from "react"
import WorkflowActivityCard from "./WorkflowActivityCard"
import WorkflowActivityPanel from "./WorkflowActivityPanel"
import WorkflowConnector from "./WorkflowConnector"
import { IconClose, IconZoomIn, IconZoomOut } from "./ProcessIcons"
import {
  cloneWorkflow,
  createActivityCard,
  DEFAULT_PARAMS,
  PHASE_UI,
} from "../../utils/workflowBuilderUtils"
import { getOwnersForDepartment } from "../../utils/workflowOwnerOptions"
import { exportWorkflowPdf, exportWorkflowPptx } from "../../utils/workflowExport"
import ExportShareBar from "../ExportShareBar"
import NotificationBanner, { NotificationToastStack } from "../NotificationBanner"
import {
  buildSeedCommentsForCard,
  migrateCardComments,
} from "../../utils/workflowComments"
import { migrateCardUseCases } from "../../utils/workflowUseCases"
import { migrateWorkflowAiTools } from "../../utils/workflowAiTools"
import { loadWorkflowDraft, saveWorkflowDraft } from "../../utils/workflowStorage"

function prepareWorkflowDraft(workflow, employeeRoster, department) {
  const saved = loadWorkflowDraft(workflow.id)
  if (saved?.workflow) {
    return {
      draft: migrateWorkflowAiTools(saved.workflow),
      params: saved.params?.length ? saved.params : [...DEFAULT_PARAMS],
      dirty: false,
    }
  }

  const draft = migrateWorkflowAiTools(cloneWorkflow(workflow))
  for (const phase of draft.phases) {
    phase.cards = phase.cards.map((card) => {
      const normalized = migrateCardUseCases(migrateCardComments({
        commentThread: [],
        useCaseOpportunities: [],
        ownerEmployeeId: null,
        ownerLabel: null,
        ...card,
      }))
      const seeds = buildSeedCommentsForCard(card.id, employeeRoster, department)
      return {
        ...normalized,
        commentThread: seeds.length ? seeds : normalized.commentThread,
      }
    })
  }

  return { draft, params: [...DEFAULT_PARAMS], dirty: false }
}

function PhaseBlock({
  phase,
  ui,
  selectedId,
  onSelect,
  onDelete,
  onDuplicate,
  onAddCard,
  onUpdateCard,
}) {
  const isRow = phase.cards.length > 1

  const renderCard = (card) => (
    <WorkflowActivityCard
      key={card.id}
      card={card}
      selected={selectedId === card.id}
      onSelect={() => onSelect(phase.id, card.id)}
      onDelete={() => onDelete(phase.id, card.id)}
      onDuplicate={() => onDuplicate(phase.id, card.id)}
      onUpdate={(patch) => onUpdateCard(phase.id, card.id, patch)}
    />
  )

  const renderCardStack = (cards, phaseId) => (
    <div className="wf-phase__stack">
      {cards.map((card, cardIndex) => (
        <div key={card.id} className="wf-phase__card-wrap">
          {cardIndex > 0 && (
            <WorkflowConnector onAdd={() => onAddCard(phaseId, cardIndex)} />
          )}
          {renderCard(card)}
        </div>
      ))}
      <WorkflowConnector onAdd={() => onAddCard(phaseId, cards.length)} label="Add activity to phase" />
    </div>
  )

  return (
    <section
      className="wf-phase-zone"
      style={{ background: ui.bg, borderColor: ui.border }}
    >
      <div className="wf-phase-zone__label" style={{ color: ui.labelColor, borderColor: ui.border }}>
        {phase.label}
      </div>
      {isRow ? (
        <>
          <div className="wf-phase-zone__row">
            {phase.cards.map((card) => (
              <div key={card.id} className="wf-phase-zone__col">
                {renderCard(card)}
              </div>
            ))}
          </div>
          <WorkflowConnector onAdd={() => onAddCard(phase.id, phase.cards.length)} label="Add parallel activity" />
        </>
      ) : (
        renderCardStack(phase.cards, phase.id)
      )}
    </section>
  )
}

export default function WorkflowCanvas({
  workflow,
  department,
  employeeRoster,
  usageRecords,
  onClose,
}) {
  const prepared = useMemo(
    () => prepareWorkflowDraft(workflow, employeeRoster, department),
    [workflow, employeeRoster, department]
  )
  const [draft, setDraft] = useState(() => prepared.draft)
  const [params, setParams] = useState(() => prepared.params)
  const [selection, setSelection] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [dirty, setDirty] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)

  const ownerOptions = useMemo(
    () => getOwnersForDepartment(employeeRoster, department, usageRecords),
    [employeeRoster, department, usageRecords]
  )

  const selectedCard = useMemo(() => {
    if (!selection) return null
    const phase = draft.phases.find((p) => p.id === selection.phaseId)
    const card = phase?.cards.find((c) => c.id === selection.cardId)
    if (!phase || !card) return null
    return { phase, card }
  }, [draft, selection])

  const activityNav = useMemo(() => {
    const items = []
    for (const phase of draft.phases) {
      for (const card of phase.cards) {
        items.push({ phaseId: phase.id, phaseLabel: phase.label, cardId: card.id })
      }
    }
    return items
  }, [draft])

  const selectedNavIndex = useMemo(() => {
    if (!selection) return -1
    return activityNav.findIndex(
      (item) => item.phaseId === selection.phaseId && item.cardId === selection.cardId
    )
  }, [activityNav, selection])

  const goToActivity = useCallback((index) => {
    const item = activityNav[index]
    if (item) setSelection({ phaseId: item.phaseId, cardId: item.cardId })
  }, [activityNav])

  const counts = useMemo(() => {
    let active = 0
    let opportunity = 0
    let human = 0
    for (const phase of draft.phases) {
      for (const card of phase.cards) {
        if (card.aiStatus === "active") active++
        else if (card.aiStatus === "opportunity") opportunity++
        else if (card.aiStatus === "human") human++
      }
    }
    return { active, opportunity, human }
  }, [draft])

  const markDirty = useCallback(() => setDirty(true), [])

  const updatePhases = useCallback((updater) => {
    setDraft((prev) => ({ ...prev, phases: updater(prev.phases) }))
    markDirty()
  }, [markDirty])

  const handleAddCard = useCallback((phaseId, index) => {
    updatePhases((phases) =>
      phases.map((p) => {
        if (p.id !== phaseId) return p
        const cards = [...p.cards]
        cards.splice(index, 0, createActivityCard())
        return { ...p, cards }
      })
    )
    setSelection(null)
  }, [updatePhases])

  const handleDeleteCard = useCallback((phaseId, cardId) => {
    updatePhases((phases) =>
      phases.map((p) => {
        if (p.id !== phaseId) return p
        const cards = p.cards.filter((c) => c.id !== cardId)
        return { ...p, cards: cards.length ? cards : [createActivityCard({ title: "New activity" })] }
      })
    )
    setSelection((prev) => (prev?.cardId === cardId ? null : prev))
  }, [updatePhases])

  const handleDuplicateCard = useCallback((phaseId, cardId) => {
    updatePhases((phases) =>
      phases.map((p) => {
        if (p.id !== phaseId) return p
        const idx = p.cards.findIndex((c) => c.id === cardId)
        if (idx < 0) return p
        const copy = {
          ...cloneWorkflow({ phases: [{ cards: [p.cards[idx]] }] }).phases[0].cards[0],
          id: createActivityCard().id,
        }
        const cards = [...p.cards]
        cards.splice(idx + 1, 0, copy)
        return { ...p, cards }
      })
    )
  }, [updatePhases])

  const handleUpdateCard = useCallback((phaseId, cardId, patch) => {
    updatePhases((phases) =>
      phases.map((p) =>
        p.id !== phaseId
          ? p
          : { ...p, cards: p.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)) }
      )
    )
  }, [updatePhases])

  const handleSelect = useCallback((phaseId, cardId) => {
    setSelection({ phaseId, cardId })
  }, [])

  const flash = (msg) => {
    setSaveMsg(msg)
    setTimeout(() => setSaveMsg(null), 2400)
  }

  const handleSave = () => {
    saveWorkflowDraft(workflow.id, { workflow: draft, params })
    setDirty(false)
    flash("Draft saved")
  }

  const handlePublish = () => {
    saveWorkflowDraft(workflow.id, { workflow: draft, params })
    setDirty(false)
    flash("Workflow published")
  }

  const runExport = (type) => {
    const payload = { workflow: draft, params, department }
    if (type === "pdf") exportWorkflowPdf(payload)
    else exportWorkflowPptx(payload)
    flash(type === "pdf" ? "PDF downloaded" : "PowerPoint downloaded")
  }

  const addParam = () => {
    setParams((prev) => [...prev, { id: `param-${Date.now()}`, label: "New param", value: "" }])
    markDirty()
  }

  return (
    <div className="wf-builder">
      <header className="wf-builder__toolbar">
        <div className="wf-builder__toolbar-left">
          {onClose && (
            <button type="button" className="wf-builder__btn wf-builder__btn--ghost" onClick={onClose}>
              <IconClose size={14} />
              Close
            </button>
          )}
          <span className="wf-builder__toolbar-title">{draft.title}</span>
          {dirty && <span className="wf-builder__unsaved">Unsaved changes</span>}
        </div>
        <div className="wf-builder__toolbar-right">
          <ExportShareBar
            variant="workflow"
            share={{
              title: draft.title,
              text: `Workflow ${department ?? ""}`.trim(),
            }}
            onNotify={flash}
            formats={[
              { key: "pdf", label: "PDF", onSelect: () => runExport("pdf") },
              { key: "pptx", label: "PowerPoint", onSelect: () => runExport("pptx") },
            ]}
          />
          <button type="button" className="wf-builder__btn wf-builder__btn--ghost" onClick={handleSave}>
            Save
          </button>
          <button type="button" className="wf-builder__btn wf-builder__btn--primary" onClick={handlePublish}>
            Save &amp; Publish
          </button>
        </div>
      </header>

      <div className="wf-builder__workspace">
        <div className="wf-builder__canvas-area">
          <div className="wf-builder__zoom-tools">
            <button type="button" onClick={() => setZoom((z) => Math.min(1.25, z + 0.1))} aria-label="Zoom in">
              <IconZoomIn size={15} />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))} aria-label="Zoom out">
              <IconZoomOut size={15} />
            </button>
          </div>

          <div className="wf-builder__scroll">
            <div className="wf-builder__scale" style={{ transform: `scale(${zoom})` }}>
              <div className="wf-builder__dot-canvas">
                <div className="wf-builder__flow">
                  <div className="wf-start-pill">Start</div>
                  <WorkflowConnector onAdd={() => handleAddCard(draft.phases[0]?.id, 0)} label="Add before first phase" />

                  {draft.phases.map((phase, phaseIndex) => {
                    const ui = PHASE_UI[phase.id] ?? PHASE_UI.observe
                    return (
                      <div key={phase.id} className="wf-builder__phase-block">
                        <PhaseBlock
                          phase={phase}
                          ui={ui}
                          selectedId={selection?.cardId}
                          onSelect={handleSelect}
                          onDelete={handleDeleteCard}
                          onDuplicate={handleDuplicateCard}
                          onAddCard={handleAddCard}
                          onUpdateCard={handleUpdateCard}
                        />
                        {phaseIndex < draft.phases.length - 1 && (
                          <WorkflowConnector
                            onAdd={() => handleAddCard(draft.phases[phaseIndex + 1]?.id, 0)}
                            label="Add between phases"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="wf-builder__sidebar">
          <div className="wf-builder__panel">
            <div className="wf-builder__panel-head">
              <span>Parameters</span>
              <button type="button" className="wf-builder__add-param" onClick={addParam}>+ Add param</button>
            </div>
            <ul className="wf-builder__param-list">
              {params.map((p) => (
                <li key={p.id} className="wf-builder__param">
                  <span className="wf-builder__param-label">{p.label}</span>
                  <input
                    className="wf-builder__param-input"
                    value={p.value}
                    onChange={(e) => {
                      setParams((prev) => prev.map((x) => (x.id === p.id ? { ...x, value: e.target.value } : x)))
                      markDirty()
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="wf-builder__panel">
            <div className="wf-builder__panel-head"><span>AI summary</span></div>
            <div className="wf-builder__summary">
              <div><strong>{counts.active}</strong> using AI</div>
              <div><strong>{counts.opportunity}</strong> opportunities</div>
              <div><strong>{counts.human}</strong> human only</div>
            </div>
            <p className="wf-builder__hint">Click an activity to open the editor. Use the arrows in the popup to navigate.</p>
          </div>
        </aside>
      </div>

      {selectedCard && (
        <WorkflowActivityPanel
          card={selectedCard.card}
          phaseLabel={selectedCard.phase.label}
          department={department}
          ownerOptions={ownerOptions}
          navIndex={selectedNavIndex}
          navTotal={activityNav.length}
          onPrevious={() => goToActivity(selectedNavIndex - 1)}
          onNext={() => goToActivity(selectedNavIndex + 1)}
          onClose={() => setSelection(null)}
          onUpdate={(patch) => handleUpdateCard(selectedCard.phase.id, selectedCard.card.id, patch)}
          onDelete={() => handleDeleteCard(selectedCard.phase.id, selectedCard.card.id)}
          onDuplicate={() => handleDuplicateCard(selectedCard.phase.id, selectedCard.card.id)}
        />
      )}

      {saveMsg && (
        <NotificationToastStack position="bottom">
          <NotificationBanner type="success" message={saveMsg} />
        </NotificationToastStack>
      )}
    </div>
  )
}
