import { C } from "../../theme"
import { Badge } from "../UI"
import { DATA_TIERS } from "../../data/dashboardCopy"

const TIER_COLORS = {
  Measured: DATA_TIERS.measured.color,
  Simulated: DATA_TIERS.simulated.color,
  "Future-ready": DATA_TIERS.future.color,
}

function TierBadges({ badges }) {
  if (!badges?.length) return null
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
      {badges.map((b) => (
        <Badge key={b} label={b} color={TIER_COLORS[b] || C.muted} />
      ))}
    </div>
  )
}

function BulletList({ title, items, color }) {
  if (!items?.length) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
        {title}
      </div>
      <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: 12, color: C.textSub, lineHeight: 1.55 }}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default function ManagementAnswerPanel({ question, answer }) {
  if (!question || !answer) return null

  return (
    <div className="glass-panel" style={{ borderRadius: 16, padding: "18px 20px", borderLeft: `3px solid ${C.cyan}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.cyan, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
        Answer
      </div>
      <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 800, color: C.text, lineHeight: 1.3 }}>
        {question.title}
      </h3>
      <p style={{ margin: "0 0 18px", fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>
        {answer.headline}
      </p>

      <BulletList title="Measured evidence" items={answer.measured} color={DATA_TIERS.measured.color} />
      <BulletList title="Simulated interpretation" items={answer.simulated} color={DATA_TIERS.simulated.color} />
      <BulletList title="Future-ready" items={answer.future} color={DATA_TIERS.future.color} />

      {answer.items?.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Key findings
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {answer.items.map((item, i) => (
              <div
                key={i}
                className="glass-panel"
                style={{ borderRadius: 12, padding: "12px 14px", background: C.surface2 }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  {item.rank != null && (
                    <span style={{ fontSize: 12, fontWeight: 800, color: C.accent }}>#{item.rank}</span>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{item.title}</div>
                    {item.subtitle && (
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{item.subtitle}</div>
                    )}
                  </div>
                </div>
                {item.lines?.map((line, j) => (
                  <div key={j} style={{ fontSize: 12, color: C.textSub, marginTop: 6, lineHeight: 1.5 }}>
                    {line}
                  </div>
                ))}
                <TierBadges badges={item.badges} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
