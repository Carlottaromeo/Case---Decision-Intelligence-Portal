const iconStyle = { display: "block", flexShrink: 0 }

export function IconOverview({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <rect x="3" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" stroke={color} strokeWidth="2" />
      <rect x="13" y="11" width="8" height="10" rx="2" stroke={color} strokeWidth="2" />
      <rect x="3" y="14" width="8" height="7" rx="2" stroke={color} strokeWidth="2" />
    </svg>
  )
}

export function IconDepartments({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <rect x="9" y="2" width="6" height="5" rx="1.5" stroke={color} strokeWidth="2" />
      <rect x="2" y="17" width="6" height="5" rx="1.5" stroke={color} strokeWidth="2" />
      <rect x="16" y="17" width="6" height="5" rx="1.5" stroke={color} strokeWidth="2" />
      <path d="M12 7v4M6 14l6-3 6 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconToolTier({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <path d="M4 7h16M4 12h12M4 17h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="19" cy="12" r="2" fill={color} />
      <circle cx="15" cy="17" r="2" fill={color} />
    </svg>
  )
}

export function IconUsers({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <circle cx="9" cy="8" r="3.5" stroke={color} strokeWidth="2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" stroke={color} strokeWidth="1.8" />
      <path d="M15 20c0-2.2 1.5-4 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconProcessMaps({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <rect x="3" y="4" width="8" height="6" rx="1.5" stroke={color} strokeWidth="2" />
      <rect x="13" y="4" width="8" height="6" rx="1.5" stroke={color} strokeWidth="2" />
      <rect x="8" y="14" width="8" height="6" rx="1.5" stroke={color} strokeWidth="2" />
      <path d="M7 10v2h2M17 10v2h-2M12 12v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconInvestment({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <rect x="3" y="14" width="18" height="7" rx="2" stroke={color} strokeWidth="2" />
      <path d="M7 14V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 7V4M9 5l3-2 3 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="17.5" r="1" fill={color} />
      <circle cx="12" cy="17.5" r="1" fill={color} />
      <circle cx="16" cy="17.5" r="1" fill={color} />
    </svg>
  )
}

export function IconForecasting({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <path d="M4 18V6M4 18h16M4 18l4-6 4 3 5-8 3 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 4v2M20 6h-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconMgmtQuestions({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 2-2.5 2-2.5 4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="0.75" fill={color} />
    </svg>
  )
}

export function IconAiRecommendations({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={iconStyle}>
      <path d="M12 3l1.8 5.5H19l-4.6 3.3 1.8 5.5L12 14l-4.2 3.3 1.8-5.5L5 8.5h5.2L12 3z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M19 16v3M17.5 17.5h3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export const NAV_ICONS = {
  panoramica:   IconOverview,
  dipartimenti: IconDepartments,
  processmaps:  IconProcessMaps,
  investment:   IconInvestment,
  forecasting:  IconForecasting,
  airecommendations: IconAiRecommendations,
  mgmtquestions: IconMgmtQuestions,
  tooltier:     IconToolTier,
}
