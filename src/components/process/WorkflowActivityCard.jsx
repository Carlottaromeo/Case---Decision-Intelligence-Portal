import { useState, useRef, useEffect } from "react"
import { IconSparkles, IconTarget, IconShield, IconClock, IconWorkflow } from "./ProcessIcons"
import { ownerInitials } from "../../utils/workflowBuilderUtils"
import { hasComments } from "../../utils/workflowComments"
import {
  getCardStatusLabel,
  getCardVisualTone,
  hasUseCaseOpportunities,
} from "../../utils/workflowUseCases"
import WorkflowCommentsBlock from "./WorkflowCommentsBlock"

const STATUS_ICONS = {
  active: IconSparkles,
  opportunity: IconTarget,
  human: IconShield,
  neutral: IconWorkflow,
}

export default function WorkflowActivityCard({
  card,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
  onUpdate,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const menuRef = useRef(null)
  const visualTone = getCardVisualTone(card)
  const StatusIcon = STATUS_ICONS[visualTone] ?? IconWorkflow
  const hasCommentThread = hasComments(card)
  const hasUseCases = hasUseCaseOpportunities(card)
  const statusLabel = getCardStatusLabel(card)
  const showTimeTarget = hasUseCases && card.timeToBe
  const commentCount = card.commentThread?.length ?? 0

  useEffect(() => {
    if (!menuOpen) return
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [menuOpen])

  return (
    <article
      className={`wf-node${visualTone !== "neutral" ? ` wf-node--${visualTone}` : ""}${selected ? " wf-node--selected" : ""}${commentsOpen ? " wf-node--comments-open" : ""}`}
    >
      <div className="wf-node__card">
        <div className="wf-node__top">
          <div className="wf-node__title-row">
            <StatusIcon size={15} color="currentColor" />
            <h4 className="wf-node__title">{card.title}</h4>
            <div className="wf-node__indicators">
              {hasUseCases && (
                <span className="wf-node__uc-dot" title="Tracked opportunities">
                  {card.useCaseOpportunities.length}
                </span>
              )}
            </div>
          </div>
          <div className="wf-node__top-actions">
            {onUpdate && (
              <button
                type="button"
                className={`wf-node__comment-btn${commentsOpen ? " wf-node__comment-btn--open" : ""}${hasCommentThread ? " wf-node__comment-btn--has" : ""}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setCommentsOpen((v) => !v)
                }}
                aria-label={commentsOpen ? "Hide comments" : "Show comments"}
                title="Comments"
              >
                <span className="wf-node__comment-label">Notes</span>
                {commentCount > 0 && <span className="wf-node__comment-count">{commentCount}</span>}
              </button>
            )}
            <div className="wf-node__menu-wrap" ref={menuRef}>
              <button
                type="button"
                className="wf-node__menu-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen((v) => !v)
                }}
                aria-label="Activity options"
              >
                ⋮
              </button>
              {menuOpen && (
                <div className="wf-node__menu">
                  <button type="button" onClick={() => { onSelect(); setMenuOpen(false) }}>Edit in panel</button>
                  <button type="button" onClick={() => { onDuplicate(); setMenuOpen(false) }}>Duplicate</button>
                  <button type="button" className="wf-node__menu-danger" onClick={() => { onDelete(); setMenuOpen(false) }}>Delete</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <button type="button" className="wf-node__body-btn" onClick={onSelect}>
          <p className="wf-node__summary">{card.summary}</p>
          <div className="wf-node__meta">
            <span className="wf-node__avatar">{ownerInitials(card.owner)}</span>
            <span className="wf-node__owner">{card.owner}</span>
          </div>
          <div className="wf-node__footer">
            {statusLabel ? (
              <span className={`wf-node__tag wf-node__tag--${statusLabel.tone}`}>{statusLabel.label}</span>
            ) : (
              <span className="wf-node__footer-spacer" aria-hidden="true" />
            )}
            <span className="wf-node__duration">
              <IconClock size={12} color="#9ca3af" />
              {card.timeAsIs}
              {showTimeTarget && <span className="wf-node__duration-target"> → {card.timeToBe}</span>}
            </span>
          </div>
        </button>
      </div>

      {commentsOpen && onUpdate && (
        <div className="wf-node__comments-panel" onClick={(e) => e.stopPropagation()}>
          <WorkflowCommentsBlock card={card} onUpdate={onUpdate} compact />
        </div>
      )}
    </article>
  )
}
