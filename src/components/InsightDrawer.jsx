import { useEffect, useMemo } from "react"
import { C } from "../theme"
import { getInsightById } from "../data/insights"
import { enrichInsightsWithMeasured } from "../data/buildLiveInsightEvidence"
import { useMeasuredData } from "../context/DashboardDataContext"
import InsightFlowCard from "./InsightFlowCard"

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

function sortInsights(insights) {
  return [...insights].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 9
    const pb = PRIORITY_ORDER[b.priority] ?? 9
    if (pa !== pb) return pa - pb
    return a.title.localeCompare(b.title)
  })
}

export default function InsightDrawer({ panel, onClose }) {
  const measured = useMeasuredData()
  const open = Boolean(panel?.insightIds?.length || panel?.context)

  const insights = useMemo(() => {
    if (!open) return []
    const ids = panel.insightIds || []
    const base = ids.map((id) => getInsightById(id)).filter(Boolean)
    return sortInsights(enrichInsightsWithMeasured(base, measured))
  }, [open, panel?.insightIds, measured])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 400,
          background: C.overlay,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      <aside
        className="glass-panel-strong insight-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={panel.title || "Insight flow"}
      >
        <header className="insight-drawer__header">
          <div className="insight-drawer__header-text">
            <p className="insight-drawer__eyebrow">Insight flow</p>
            <h2 className="insight-drawer__title">{panel.title}</h2>
            {panel.subtitle && (
              <p className="insight-drawer__subtitle">{panel.subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="insight-drawer__close"
          >
            ×
          </button>
        </header>

        <div className="insight-drawer__body">
          {insights.length === 0 && panel.context && (
            <InsightFlowCard
              observation={panel.context}
              source="Chart context and measured usage data in this view."
              recommendation="Review the pattern with the department lead and decide whether to expand access, run enablement, or monitor for another period."
              isAiRecommendation
            />
          )}

          {insights.map((insight, index) => (
            <div key={insight.id} className="insight-drawer__block">
              {insights.length > 1 && (
                <p className="insight-drawer__block-label">
                  Insight {index + 1} of {insights.length}
                </p>
              )}
              <InsightFlowCard insight={insight} />
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
