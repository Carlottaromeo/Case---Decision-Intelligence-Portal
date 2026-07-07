import { C, LOCALE } from "../theme"
import { useMeasuredData } from "../context/DashboardDataContext"
import { deptColor, accentFill } from "../data/processMapsMeta"
import {
  DEPT_ALIASES_DOC,
  DEPT_SOURCE_FILES,
  departmentMappingNotes,
} from "../data/dashboardCopy"
import { Card, SH } from "./UI"

const TH = {
  padding: "10px 12px",
  fontSize: 10,
  fontWeight: 700,
  color: C.subtle,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  textAlign: "left",
  borderBottom: `1px solid ${C.glassBorder}`,
  whiteSpace: "nowrap",
}

const TD = {
  padding: "11px 12px",
  fontSize: 12,
  color: C.textSub,
  borderBottom: `1px solid ${C.glassBorder}`,
  verticalAlign: "top",
}

export default function DepartmentMappingGuide() {
  const { DEPT, DATA_QUALITY } = useMeasuredData()
  const sorted = [...(DEPT ?? [])].sort((a, b) => b.total - a.total)
  const businessDepts = sorted.filter((d) => d.d !== "Unknown")
  const unknownRow = sorted.find((d) => d.d === "Unknown")

  return (
    <Card>
      <SH
        title="Department mapping"
        sub="How business units are built from the employee directory and usage export"
      />

      <ul style={{ margin: "0 0 20px", paddingLeft: 18, fontSize: 13, color: C.textSub, lineHeight: 1.65 }}>
        {departmentMappingNotes().map((note) => (
          <li key={note} style={{ marginBottom: 6 }}>{note}</li>
        ))}
      </ul>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 12,
        marginBottom: 20,
        fontSize: 12,
      }}>
        <div className="glass-panel" style={{ borderRadius: 12, padding: "12px 14px", background: C.surface2 }}>
          <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>Employee directory</div>
          <div style={{ color: C.muted, fontFamily: "monospace", fontSize: 11, marginBottom: 6 }}>{DEPT_SOURCE_FILES.directory}</div>
          <div style={{ color: C.textSub }}>Source of department names and headcount (1,233 employees).</div>
        </div>
        <div className="glass-panel" style={{ borderRadius: 12, padding: "12px 14px", background: C.surface2 }}>
          <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>Usage export</div>
          <div style={{ color: C.muted, fontFamily: "monospace", fontSize: 11, marginBottom: 6 }}>{DEPT_SOURCE_FILES.usage}</div>
          <div style={{ color: C.textSub }}>Credits and sessions only — department joined by employee_id.</div>
        </div>
      </div>

      <div style={{ overflowX: "auto", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr>
              {["Department", "In directory", "Provisioned users", "Access rate", "Notes"].map((h) => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {businessDepts.map((d) => {
              const col = deptColor(d.color)
              const fill = accentFill(d.color)
              const isUnderwriting = d.d === "Underwriting"
              return (
                <tr key={d.d}>
                  <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: fill, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, color: C.text }}>{d.d}</span>
                    </div>
                  </td>
                  <td style={TD}>{d.total.toLocaleString(LOCALE)}</td>
                  <td style={TD}>{d.provisioned.toLocaleString(LOCALE)}</td>
                  <td style={{ ...TD, fontWeight: 600, color: col }}>{d.prov_rate}%</td>
                  <td style={{ ...TD, color: C.muted, fontSize: 11 }}>
                    {isUnderwriting
                      ? "Standard business unit — includes Underwriting Risk Assessment process"
                      : "From employee directory"}
                  </td>
                </tr>
              )
            })}
            {unknownRow && (
              <tr id="anomaly-unknown-directory" style={{ background: C.rowAlt }}>
                <td style={TD}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: accentFill(unknownRow.color), flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: C.text }}>Unknown</span>
                  </div>
                </td>
                <td style={TD}>{unknownRow.total.toLocaleString(LOCALE)}</td>
                <td style={TD}>{unknownRow.provisioned.toLocaleString(LOCALE)}</td>
                <td style={{ ...TD, fontWeight: 600, color: C.muted }}>{unknownRow.prov_rate}%</td>
                <td style={{ ...TD, color: C.muted, fontSize: 11 }}>
                  Data-quality bucket — missing Department in directory (not a business unit)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(DATA_QUALITY.excluded_usage_ids ?? 0) > 0 && (
        <div
          style={{
            borderRadius: 12,
            padding: "14px 16px",
            border: `1px solid ${C.amber}44`,
            background: `${C.amber}10`,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: C.amberDk, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Excluded usage IDs
          </div>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>
            {DATA_QUALITY.excluded_usage_ids} usage IDs are not present in the employee directory and are excluded from dashboard metrics.
            Excluded volume: {DATA_QUALITY.excluded_usage_credits.toLocaleString(LOCALE)} credits ({DATA_QUALITY.excluded_usage_credits_pct}% of total).
          </p>
          <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.55 }}>
            Separately, {DATA_QUALITY.excel_undefined_dept_rows} directory rows have no valid department and appear under Unknown above.
          </p>
        </div>
      )}

      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Name normalisation applied
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
          {DEPT_ALIASES_DOC.map((a) => (
            <li key={a.from}>
              <span style={{ fontFamily: "monospace", color: C.textSub }}>{a.from}</span>
              {" → "}
              <span style={{ fontWeight: 600, color: C.text }}>{a.to}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
