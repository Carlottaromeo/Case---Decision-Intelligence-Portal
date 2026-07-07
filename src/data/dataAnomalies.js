/** Anomalies derived from live DATA_QUALITY — not static data.js */
export const NAV_TARGETS = {
  dataQuality: { sectionId: "data-quality", pageId: "overview" },
  dataQualityMissingDepartment: {
    sectionId: "data-quality",
    pageId: "overview",
    anchor: "anomaly-missing-department",
  },
}

export function buildDataAnomalies(dataQuality) {
  const dq = dataQuality
  if (!dq || (dq.excel_undefined_dept_rows ?? 0) <= 0) return []

  return [{
    id: "missing-department-directory",
    severity: "warning",
    title: "Directory users without department",
    message: `${dq.excel_undefined_dept_rows} users in the employee directory have a missing or invalid Department value.`,
    detail: "These users are grouped into the Unknown bucket until Department is assigned in the directory file.",
    target: NAV_TARGETS.dataQualityMissingDepartment,
    targetLabel: "Data Quality → mapping detail",
  }]
}
