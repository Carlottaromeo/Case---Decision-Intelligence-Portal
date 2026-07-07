import { C, CHART, LOCALE } from "../../theme"
import { Card, SH, KpiCard, ExecutiveInsight, Callout } from "../UI"
import { dataQualityBucketSummary } from "../../data/dashboardCopy"
import { useMeasuredData } from "../../context/DashboardDataContext"
import { deptColor, accentFill } from "../../data/processMapsMeta"

export default function DataQualityOverview({ onGoToFiles }) {
  const { KPIs, DEPT, DATA_QUALITY, usageRows } = useMeasuredData()
  const mappingPct = Math.round((DATA_QUALITY.provisioned_mapped_to_dept / DATA_QUALITY.provisioned_total) * 1000) / 10
  const sortedDept = [...DEPT].sort((a, b) => b.total - a.total)
  const unknownRow = DEPT.find((d) => d.d === "Unknown")
  const bucketNotes = dataQualityBucketSummary(DATA_QUALITY)
  const unknownProvisioned = DATA_QUALITY.unmapped_missing_dept_field ?? 0
  const mappedProvisionedSub = unknownProvisioned > 0
    ? `Linked to a business unit (${unknownProvisioned} in Unknown)`
    : "Linked to a business unit"
  const sourceSubStyle = {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: 0,
    border: "none",
    background: "transparent",
    color: C.subtle,
    fontSize: 12,
    lineHeight: 1.35,
    textDecoration: "underline",
    textUnderlineOffset: 2,
    cursor: "pointer",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <ExecutiveInsight
        see={`${mappingPct}% of provisioned users mapped to a business unit. ${DATA_QUALITY.excel_undefined_dept_rows} directory rows still lack a department and are grouped into Unknown.`}
        matter="Unknown now represents only directory-linked users with missing department values."
        action="Edit source files to fix mapping gaps; charts recalculate automatically."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
        <KpiCard
          label="Directory rows"
          value={KPIs.total_employees.toLocaleString(LOCALE)}
          sub={
            onGoToFiles ? (
              <button type="button" style={sourceSubStyle} onClick={onGoToFiles}>
                Source: employee directory (.xlsx)
              </button>
            ) : (
              "Source: employee directory (.xlsx)"
            )
          }
          color={CHART.primary}
        />
        <KpiCard
          label="Usage rows"
          value={(usageRows?.length ?? 0).toLocaleString(LOCALE)}
          sub={
            onGoToFiles ? (
              <button type="button" style={sourceSubStyle} onClick={onGoToFiles}>
                Source: AI usage export (.csv)
              </button>
            ) : (
              "Source: AI usage export (.csv)"
            )
          }
          color={CHART.secondary}
        />
        <KpiCard
          label="Mapped provisioned users"
          value={`${DATA_QUALITY.provisioned_mapped_to_dept}/${DATA_QUALITY.provisioned_total}`}
          sub={mappedProvisionedSub}
          color={C.green}
        />
        <div id="anomaly-missing-department">
          <KpiCard
            label="Missing dept. in directory"
            value={DATA_QUALITY.excel_undefined_dept_rows}
            sub="Invalid / empty Department field"
            color={C.amber}
          />
        </div>
      </div>

      <Callout variant="alert" title="How the counts relate">
        <p className="dq-warning-lead">
          Mapped BU coverage is {DATA_QUALITY.provisioned_mapped_to_dept}/{DATA_QUALITY.provisioned_total}:{" "}
          {unknownProvisioned} provisioned user{unknownProvisioned === 1 ? "" : "s"} remain in Unknown because Department is missing in directory.
        </p>
        <ul className="dq-bucket-notes dq-bucket-notes--warning">
          {bucketNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        {unknownRow && (
          <p className="dq-bucket-notes__unknown">
            Unknown chart row today: {unknownRow.total} in directory · {unknownRow.provisioned} provisioned from directory · {unknownRow.active_users} active in usage (directory-linked only) · {unknownRow.gap} outside rollout.
          </p>
        )}
        {(DATA_QUALITY.excluded_usage_ids ?? 0) > 0 && (
          <p className="dq-bucket-notes__unknown" style={{ marginTop: 10 }}>
            {DATA_QUALITY.excluded_usage_ids} usage IDs are excluded because they are not present in the employee directory ({DATA_QUALITY.excluded_usage_credits_pct ?? 0}% of credits).
          </p>
        )}
      </Callout>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <SH title="Department distribution" sub="Employee directory joined with usage export" />
          {onGoToFiles && (
            <button type="button" className="dq-link-btn" onClick={onGoToFiles}>Open source files →</button>
          )}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.glassBorder}` }}>
                {["Department", "In directory", "Provisioned users", "Active users (usage)", "Access rate"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: C.muted, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedDept.map((d) => {
                const col = deptColor(d.color)
                const fill = accentFill(d.color)
                const isUnknown = d.d === "Unknown"
                return (
                  <tr key={d.d} style={{ borderBottom: `1px solid ${C.glassBorder}`, background: isUnknown ? `${C.amber}08` : undefined }}>
                    <td style={{ padding: "11px 12px", fontWeight: 600, color: C.text }}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: fill, marginRight: 8 }} />
                      {d.d}
                      {isUnknown && <span style={{ marginLeft: 8, fontSize: 10, color: C.amber, fontWeight: 700 }}>DATA BUCKET</span>}
                    </td>
                    <td style={{ padding: "11px 12px", color: C.textSub }}>{d.total.toLocaleString(LOCALE)}</td>
                    <td style={{ padding: "11px 12px", color: C.textSub }}>{d.provisioned}</td>
                    <td style={{ padding: "11px 12px", color: C.textSub }}>{d.active_users}</td>
                    <td style={{ padding: "11px 12px", fontWeight: 600, color: col }}>{d.prov_rate}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
