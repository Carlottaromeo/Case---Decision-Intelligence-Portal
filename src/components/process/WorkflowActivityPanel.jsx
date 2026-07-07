import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { IconClose } from "./ProcessIcons"
import { formatEmployeeOwner } from "../../utils/workflowOwnerOptions"
import { employeeDisplayName } from "../../utils/workflowOwnerSearch"
import OwnerSearchField from "./OwnerSearchField"
import WorkflowUseCaseTab from "./WorkflowUseCaseTab"
import WorkflowAiToolsSection from "./WorkflowAiToolsSection"
import WorkflowCommentsBlock from "./WorkflowCommentsBlock"

const TABS = [
  { id: "activity", label: "Edit activity" },
  { id: "opportunities", label: "Opportunities" },
  { id: "notes", label: "Notes" },
]

function NavArrow({ direction }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direction === "prev" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function WorkflowActivityPanel({
  card,
  phaseLabel,
  ownerOptions,
  department,
  navIndex = 0,
  navTotal = 1,
  onPrevious,
  onNext,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
}) {
  const [activeTab, setActiveTab] = useState("activity")

  useEffect(() => {
    setActiveTab("activity")
  }, [card?.id])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft" && onPrevious) onPrevious()
      if (e.key === "ArrowRight" && onNext) onNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, onPrevious, onNext])

  if (!card) return null

  const ucCount = card.useCaseOpportunities?.length ?? 0
  const commentCount = card.commentThread?.length ?? 0
  const hasPrev = navIndex > 0
  const hasNext = navIndex < navTotal - 1

  const selectEmployee = (employee) => {
    const label = formatEmployeeOwner(employee)
    onUpdate({
      owner: employeeDisplayName(employee),
      ownerEmployeeId: employee.employee_id,
      ownerLabel: label,
    })
  }

  const clearOwner = () => {
    onUpdate({ owner: "", ownerEmployeeId: null, ownerLabel: null })
  }

  return createPortal(
    <div className="wf-activity-modal" role="dialog" aria-modal="true" aria-labelledby="wf-activity-modal-title">
      <button
        type="button"
        className="wf-activity-modal__backdrop"
        onClick={onClose}
        aria-label="Close dialog"
      />

      <div className="wf-activity-modal__dialog" onClick={(e) => e.stopPropagation()}>
        <header className="wf-activity-modal__head">
          <div className="wf-activity-modal__head-main">
            <span className="wf-activity-modal__phase">{phaseLabel}</span>
            <h2 id="wf-activity-modal-title" className="wf-activity-modal__title">{card.title}</h2>
          </div>

          <div className="wf-activity-modal__head-actions">
            <div className="wf-activity-modal__nav">
              <button
                type="button"
                className="wf-activity-modal__nav-btn"
                onClick={onPrevious}
                disabled={!hasPrev}
                aria-label="Previous activity"
              >
                <NavArrow direction="prev" />
              </button>
              <span className="wf-activity-modal__nav-count">
                {navIndex + 1} <span>/</span> {navTotal}
              </span>
              <button
                type="button"
                className="wf-activity-modal__nav-btn"
                onClick={onNext}
                disabled={!hasNext}
                aria-label="Next activity"
              >
                <NavArrow direction="next" />
              </button>
            </div>
            <button type="button" className="wf-activity-modal__close" onClick={onClose} aria-label="Close">
              <IconClose size={16} />
            </button>
          </div>
        </header>

        <div className="wf-activity-modal__tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`wf-activity-modal__tab${activeTab === tab.id ? " wf-activity-modal__tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === "opportunities" && ucCount > 0 && (
                <span className="wf-activity-modal__tab-badge">{ucCount}</span>
              )}
              {tab.id === "notes" && commentCount > 0 && (
                <span className="wf-activity-modal__tab-badge">{commentCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="wf-activity-modal__body">
          {activeTab === "activity" && (
            <section className="wf-activity-edit">
              <label className="wf-field">
                <span>Details</span>
                <input
                  value={card.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  placeholder="Activity title"
                />
              </label>

              <label className="wf-field">
                <span>Description</span>
                <textarea
                  value={card.summary}
                  rows={4}
                  onChange={(e) => onUpdate({ summary: e.target.value })}
                  placeholder="What happens in this workflow step"
                />
              </label>

              <label className="wf-field">
                <span>AS-IS time</span>
                <input
                  value={card.timeAsIs}
                  onChange={(e) => onUpdate({ timeAsIs: e.target.value })}
                  placeholder="e.g. 4h, 1 day, 3 days"
                />
              </label>

              <OwnerSearchField
                key={card.id}
                employees={ownerOptions.employees ?? []}
                selectedEmployeeId={card.ownerEmployeeId}
                ownerLabel={!card.ownerEmployeeId ? card.owner : null}
                department={department}
                onSelect={selectEmployee}
                onClear={clearOwner}
              />

              {card.aiStatus !== "human" && !card.humanOnlyNote && (
                <WorkflowAiToolsSection card={card} onUpdate={onUpdate} />
              )}
            </section>
          )}
          {activeTab === "opportunities" && (
            <WorkflowUseCaseTab card={card} onUpdate={onUpdate} />
          )}
          {activeTab === "notes" && (
            <WorkflowCommentsBlock card={card} onUpdate={onUpdate} />
          )}
        </div>

        <footer className="wf-activity-modal__foot">
          <button type="button" className="wf-builder__btn wf-builder__btn--ghost" onClick={onDuplicate}>
            Duplicate
          </button>
          <button type="button" className="wf-builder__btn wf-builder__btn--danger" onClick={onDelete}>
            Delete
          </button>
          <button type="button" className="wf-builder__btn wf-builder__btn--primary wf-activity-modal__done" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>,
    document.body
  )
}
