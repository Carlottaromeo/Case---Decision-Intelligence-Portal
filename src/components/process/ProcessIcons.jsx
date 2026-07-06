const s = { display: "block", flexShrink: 0 }

export function IconChevronLeft({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={s}>
      <path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconBuilding({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={s}>
      <rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="1.8" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M9 19h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconUsers({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={s}>
      <circle cx="9" cy="8" r="3" stroke={color} strokeWidth="1.8" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" stroke={color} strokeWidth="1.6" />
      <path d="M14 20c0-2.2 1.8-4 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconWorkflow({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={s}>
      <rect x="3" y="4" width="7" height="5" rx="1.5" stroke={color} strokeWidth="1.8" />
      <rect x="14" y="4" width="7" height="5" rx="1.5" stroke={color} strokeWidth="1.8" />
      <rect x="8" y="15" width="8" height="5" rx="1.5" stroke={color} strokeWidth="1.8" />
      <path d="M6.5 9v3.5H12M17.5 9v3.5H12M12 12.5V15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconSparkles({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={s}>
      <path d="M12 2l1.2 4.2L17 7l-3.8 1.8L12 13l-1.2-4.2L7 7l3.8-1.8L12 2z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M19 14l.8 2.8L22 17l-2.2 1.2L19 21l-.8-2.8L16 17l2.2-1.2L19 14z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

export function IconTarget({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={s}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.5" fill={color} />
    </svg>
  )
}

export function IconShield({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={s}>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconChart({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={s}>
      <path d="M4 19V5M4 19h16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <rect x="7" y="11" width="3" height="8" rx="1" fill={color} opacity="0.85" />
      <rect x="12" y="7" width="3" height="12" rx="1" fill={color} opacity="0.65" />
      <rect x="17" y="13" width="3" height="6" rx="1" fill={color} opacity="0.45" />
    </svg>
  )
}

export function IconArrowDown({ size = 20, color = "#9ca3af" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 32" fill="none" style={s}>
      <path d="M12 2v20m0 0l-5-5m5 5l5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconChevronDown({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={s}>
      <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconClock({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={s}>
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.8" />
      <path d="M12 8v4l3 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconClose({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={s}>
      <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconZoomIn({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={s}>
      <circle cx="11" cy="11" r="6" stroke={color} strokeWidth="1.8" />
      <path d="M16 16l4 4M11 8v6M8 11h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconZoomOut({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={s}>
      <circle cx="11" cy="11" r="6" stroke={color} strokeWidth="1.8" />
      <path d="M16 16l4 4M8 11h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
