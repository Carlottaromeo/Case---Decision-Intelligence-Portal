/** Anomalies derived from live DATA_QUALITY — not static data.js */
export const NAV_TARGETS = {
  dataQuality: { sectionId: "cockpit", pageId: "data-quality" },
  dataQualityUnmapped: {
    sectionId: "cockpit",
    pageId: "data-quality",
    anchor: "anomaly-unmapped-provisioned",
  },
}

export function buildDataAnomalies(dataQuality) {
  const dq = dataQuality
  if (!dq || dq.unmapped_provisioned <= 0) return []

  return [{
    id: "unmapped-provisioned",
    severity: "warning",
    title: "Unmapped provisioned users",
    message: `${dq.unmapped_provisioned} of ${dq.provisioned_total} provisioned users have no business unit assigned.`,
    detail: `${dq.unmapped_not_in_directory} not in employee directory · ${dq.unmapped_credits_pct}% of credits · excluded from department charts.`,
    target: NAV_TARGETS.dataQualityUnmapped,
    targetLabel: "Data Quality → mapping detail",
  }]
}
