import { C } from "../theme"
import { DATA_TIERS } from "../data/dashboardCopy"

export default function DataTierLegend({ compact = false }) {
  const tiers = Object.values(DATA_TIERS)

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: 14,
        padding: compact ? "12px 14px" : "14px 18px",
        display: "flex",
        flexWrap: "wrap",
        gap: compact ? 10 : 16,
      }}
    >
      {tiers.map((tier) => (
        <div key={tier.label} style={{ flex: "1 1 180px", minWidth: 160 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: tier.color,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: tier.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {tier.label}
            </span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45, paddingLeft: 16 }}>
            {tier.description}
          </div>
        </div>
      ))}
    </div>
  )
}
