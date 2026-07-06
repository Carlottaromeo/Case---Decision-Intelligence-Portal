const iconStyle = { display: "block", flexShrink: 0 }

export function IconTarget({ size = 22, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconTrendUp({ size = 22, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <path d="M4 18h16M6 14l4-4 3 3 5-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h3v3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconBolt({ size = 22, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function IconUnlock({ size = 22, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 7.5-2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconSearch({ size = 22, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <circle cx="11" cy="11" r="6" stroke={color} strokeWidth="2" />
      <path d="M16 16l5 5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconAccess({ size = 22, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <path d="M4 12h16M12 4v16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <rect x="3" y="6" width="8" height="12" rx="2" stroke={color} strokeWidth="2" />
      <rect x="13" y="6" width="8" height="12" rx="2" stroke={color} strokeWidth="2" />
    </svg>
  )
}

export function IconSparkle({ size = 12, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M19 14l.8 2.8L22.5 18l-2.7.7L19 21.5l-.8-2.8L15.5 18l2.7-.7L19 14z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export const INSIGHT_ICONS = {
  "tool-mix-coherence":              IconTarget,
  "consistent-growth":               IconTrendUp,
  "high-consumption-signal":         IconBolt,
  "high-intensity-incomplete-rollout": IconUnlock,
  "low-adoption-unknown-cause":      IconSearch,
  "gap-is-access-not-motivation":    IconAccess,
}
