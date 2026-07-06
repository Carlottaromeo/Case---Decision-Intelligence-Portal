import { C, LOCALE } from "../../theme"
import { Badge } from "../UI"
import { deptColor, LEVEL_COLORS, ACTION_COLORS } from "../../data/processMapsMeta"
import ProcessMetric from "./ProcessMetric"

export default function ProcessCard({ map, onClick, selected }) {
  const col = deptColor(map.color)

  return (
    <button
      type="button"
      onClick={() => onClick?.(map)}
      className="glass-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        padding: 20,
        borderRadius: 20,
        border: selected
          ? `1px solid ${col}88`
          : `1px solid ${C.glassBorder}`,
        background: selected ? `${col}12` : undefined,
        boxShadow: selected
          ? `${C.shadowMd}, 0 0 0 1px ${col}33`
          : undefined,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = `${col}55`
          e.currentTarget.style.background = `${col}08`
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = C.glassBorder
          e.currentTarget.style.background = ""
        }
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: col,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 6,
          }}>
            {map.department}
          </div>
          <div style={{
            fontSize: 16,
            fontWeight: 800,
            color: C.text,
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
          }}>
            {map.process_name}
          </div>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "12px 16px",
        padding: "12px 0",
        borderTop: `1px solid ${C.glassBorder}`,
        borderBottom: `1px solid ${C.glassBorder}`,
      }}>
        <ProcessMetric label="Adoption rate" value={`${map.adoption_rate}%`} accent={col} compact />
        <ProcessMetric
          label="Active users"
          value={`${map.active_users.toLocaleString(LOCALE)} / ${map.total_employees.toLocaleString(LOCALE)}`}
          compact
        />
        <ProcessMetric label="Sessions" value={map.total_sessions.toLocaleString(LOCALE)} compact />
        <ProcessMetric label="Credits" value={map.total_credits.toLocaleString(LOCALE)} compact />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Badge label={map.management_action} color={ACTION_COLORS[map.management_action]} />
        <Badge label={`Opportunity: ${map.ai_potential}`} color={LEVEL_COLORS[map.ai_potential]} />
      </div>
    </button>
  )
}
