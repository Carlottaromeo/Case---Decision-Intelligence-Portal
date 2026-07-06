const VARIANT_META = {
  success: { label: "Success" },
  error: { label: "Error" },
  warning: { label: "Warning" },
  info: { label: "Info" },
}

function NotificationIcon({ type }) {
  const icons = {
    success: (
      <path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    ),
    error: (
      <>
        <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </>
    ),
    warning: (
      <>
        <path d="M12 8.5v5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="1.1" fill="currentColor" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="8.5" r="1.2" fill="currentColor" />
        <path d="M12 11.5v5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </>
    ),
  }

  return (
    <span className={`notification-banner__icon notification-banner__icon--${type}`} aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        {icons[type] ?? icons.info}
      </svg>
    </span>
  )
}

/**
 * Alert banner — success, error, warning, info.
 * @param {"success"|"error"|"warning"|"info"} type
 */
export default function NotificationBanner({
  type = "info",
  title,
  message,
  children,
  detail,
  onDismiss,
  action,
  className = "",
  role = "status",
}) {
  const meta = VARIANT_META[type] ?? VARIANT_META.info
  const heading = title ?? meta.label
  const body = children ?? message

  return (
    <div
      className={`notification-banner notification-banner--${type}${className ? ` ${className}` : ""}`}
      role={role}
    >
      <div className="notification-banner__accent" aria-hidden="true" />
      <NotificationIcon type={type} />
      <div className="notification-banner__content">
        <div className="notification-banner__title">{heading}</div>
        {body && <div className="notification-banner__message">{body}</div>}
        {detail && <p className="notification-banner__detail">{detail}</p>}
        {action}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="notification-banner__close"
          onClick={onDismiss}
          aria-label={`Dismiss: ${heading}`}
        >
          ×
        </button>
      )}
    </div>
  )
}

export function NotificationToastStack({ children, position = "bottom" }) {
  if (!children) return null
  return (
    <div
      className={`notification-toast-stack notification-toast-stack--${position}`}
      aria-live="polite"
    >
      {children}
    </div>
  )
}
