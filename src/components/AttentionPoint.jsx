import { useState, useCallback } from "react"
import { C } from "../theme"
import { buildDataAnomalies, NAV_TARGETS } from "../data/dataAnomalies"
import { useMeasuredData } from "../context/DashboardDataContext"

const DISMISSED_KEY = "northstar-dismissed-notifications"

const SEVERITY_STYLE = {
  warning: { color: C.amberDk, accent: C.amber, border: `${C.amber}55` },
  attention: { color: C.cyanDk, accent: C.cyan, border: `${C.cyan}50` },
}

function severityStyle(severity) {
  return SEVERITY_STYLE[severity] ?? SEVERITY_STYLE.attention
}

function loadDismissed() {
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw))
  } catch {
    return new Set()
  }
}

function saveDismissed(dismissed) {
  try {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed]))
  } catch {
    /* ignore quota / private mode */
  }
}

export function AttentionLink({ children, onNavigate, target, className }) {
  if (!onNavigate || !target) {
    return <span className={className}>{children}</span>
  }

  return (
    <button
      type="button"
      className={className ? `attention-link ${className}` : "attention-link"}
      onClick={() => onNavigate(target)}
    >
      {children}
    </button>
  )
}

function AttentionNotification({ anomaly, onNavigate, onDismiss }) {
  const s = severityStyle(anomaly.severity)

  return (
    <div
      className={`attention-notification attention-notification--${anomaly.severity}`}
      style={{ borderColor: s.border }}
      role="status"
    >
      <div className="attention-notification__accent" style={{ background: s.accent }} aria-hidden="true" />
      <button
        type="button"
        className="attention-notification__close"
        onClick={() => onDismiss(anomaly.id)}
        aria-label={`Dismiss: ${anomaly.title}`}
      >
        ×
      </button>
      <div className="attention-notification__title" style={{ color: s.color }}>
        {anomaly.title}
      </div>
      <p className="attention-notification__message">{anomaly.message}</p>
      {anomaly.detail && (
        <p className="attention-notification__detail">{anomaly.detail}</p>
      )}
      {onNavigate && anomaly.target && (
        <AttentionLink onNavigate={onNavigate} target={anomaly.target}>
          {anomaly.targetLabel ?? "View detail →"}
        </AttentionLink>
      )}
    </div>
  )
}

/** Compact hint next to the Provisioned KPI — links to Data Quality. */
export function UnmappedProvisionedHint({ onNavigate }) {
  const { DATA_QUALITY } = useMeasuredData()
  if (DATA_QUALITY.unmapped_provisioned <= 0) return null

  const anomalies = buildDataAnomalies(DATA_QUALITY)
  const anomaly = anomalies[0]
  const target = anomaly?.target ?? NAV_TARGETS.dataQualityUnmapped

  return (
    <div className="kpi-context-hint" role="note">
      <span className="kpi-context-hint__dot" aria-hidden="true" />
      <span className="kpi-context-hint__text">
        {DATA_QUALITY.unmapped_provisioned} without department
        {onNavigate && (
          <>
            {" · "}
            <AttentionLink
              onNavigate={onNavigate}
              target={target}
              className="kpi-context-hint__link"
            >
              Data Quality
            </AttentionLink>
          </>
        )}
      </span>
    </div>
  )
}

/** Top-right dismissible notifications — reappear only after closing and reopening the app (session). */
export default function AttentionNotifications({ onNavigate }) {
  const { DATA_QUALITY } = useMeasuredData()
  const anomalies = buildDataAnomalies(DATA_QUALITY)
  const [dismissed, setDismissed] = useState(loadDismissed)

  const dismiss = useCallback((id) => {
    setDismissed((prev) => {
      const next = new Set(prev)
      next.add(id)
      saveDismissed(next)
      return next
    })
  }, [])

  const visible = anomalies.filter((a) => !dismissed.has(a.id))
  if (!visible.length) return null

  return (
    <div className="attention-notifications" aria-label="Important notices">
      {visible.map((a) => (
        <AttentionNotification
          key={a.id}
          anomaly={a}
          onNavigate={onNavigate}
          onDismiss={dismiss}
        />
      ))}
    </div>
  )
}
