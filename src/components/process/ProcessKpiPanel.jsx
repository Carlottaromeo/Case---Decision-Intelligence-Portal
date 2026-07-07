import { C, LOCALE } from "../../theme"
import { deptColor } from "../../data/processMapsMeta"
import ProcessMetric from "./ProcessMetric"

export default function ProcessKpiPanel({ map }) {
  const col = deptColor(map.color)

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
        KPI panel
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
        Department usage
      </div>
      <div className="glass-panel" style={{ borderRadius: 16, padding: "16px 18px", marginBottom: 12 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 16,
        }}>
          <ProcessMetric label="Total employees" value={map.total_employees.toLocaleString(LOCALE)} compact />
          <ProcessMetric label="Active employees" value={map.active_users.toLocaleString(LOCALE)} accent={col} compact />
          <ProcessMetric label="Adoption rate" value={`${map.adoption_rate}%`} accent={col} compact />
          <ProcessMetric label="Adoption level" value={map.adoption_level} compact />
          <ProcessMetric label="Total sessions" value={map.total_sessions.toLocaleString(LOCALE)} compact />
          <ProcessMetric label="Total credits" value={map.total_credits.toLocaleString(LOCALE)} compact />
          <ProcessMetric label="Avg sessions / active" value={map.avg_sessions_per_active_user.toLocaleString(LOCALE)} compact />
          <ProcessMetric label="Avg credits / active" value={map.avg_credits_per_active_user.toLocaleString(LOCALE)} compact />
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
        Process opportunity
      </div>
      <div className="glass-panel" style={{ borderRadius: 16, padding: "16px 18px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 16,
        }}>
          <ProcessMetric label="AI potential" value={map.ai_potential} compact />
          <ProcessMetric label="Adoption gap" value={map.adoption_gap} accent={col} compact />
          <ProcessMetric label="Investment priority" value={map.management_action} compact />
        </div>
      </div>
    </div>
  )
}
