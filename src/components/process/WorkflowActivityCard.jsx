import { useState, useRef, useEffect } from "react"
import { IconSparkles, IconTarget, IconShield, IconClock } from "./ProcessIcons"
import { ownerInitials } from "../../utils/workflowBuilderUtils"
import { hasComments } from "../../utils/workflowComments"
import { hasUseCaseOpportunities } from "../../utils/workflowUseCases"

const STATUS = {
  active: { label: "AI in use", Icon: IconSparkles, tone: "active" },
  opportunity: { label: "Opportunity", Icon: IconTarget, tone: "opportunity" },
  human: { label: "Human only", Icon: IconShield, tone: "human" },
}

export default function WorkflowActivityCard({
  card,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const isOpportunity = card.aiStatus === "opportunity"
  const status = STATUS[card.aiStatus] ?? STATUS.opportunity
  const StatusIcon = status.Icon
  const hasCommentThread = hasComments(card)
  const hasUseCases = hasUseCaseOpportunities(card)

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
      className={`wf-node wf-node--${card.aiStatus}${selected ? " wf-node--selected" : ""}`}
    >
      <div className="wf-node__card">
        <div className="wf-node__top">
          <div className="wf-node__title-row">
            <StatusIcon size={15} color="currentColor" />
            <h4 className="wf-node__title">{card.title}</h4>
            <div className="wf-node__indicators">
              {hasUseCases && (
                <span className="wf-node__uc-dot" title="Ha opportunità use case">
                  {card.useCaseOpportunities.length}
                </span>
              )}
              {hasCommentThread && <span className="wf-node__comment-dot" title="Ha commenti" />}
            </div>
          </div>
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

        <button type="button" className="wf-node__body-btn" onClick={onSelect}>
          <p className="wf-node__summary">{card.summary}</p>
          <div className="wf-node__meta">
            <span className="wf-node__avatar">{ownerInitials(card.owner)}</span>
            <span className="wf-node__owner">{card.owner}</span>
          </div>
          <div className="wf-node__footer">
            <span className={`wf-node__tag wf-node__tag--${status.tone}`}>{status.label}</span>
            <span className="wf-node__duration">
              <IconClock size={12} color="#9ca3af" />
              {card.timeAsIs}
              {isOpportunity && <span className="wf-node__duration-target"> → {card.timeToBe}</span>}
            </span>
          </div>
        </button>
      </div>
    </article>
  )
}
