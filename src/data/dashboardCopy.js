/** Shared dashboard copy — Measured / Simulated / Future-ready distinction. */

export const PRODUCT_NAME = "AI Adoption & Investment Hub"
export const PRODUCT_SUBTITLE =
  "Monitor AI adoption, identify opportunity gaps, prioritize investments and forecast future AI demand."
export const PRODUCT_PERIOD = "Dec 2025 – Mar 2026"

export const LOGIN_WELCOME = "Welcome back to the AI Adoption & Investment Hub"
export const LOGIN_HEADLINE = "Drive AI outcomes that truly matter"
export const LOGIN_HINT = "Please login to your account."
export const LOGIN_BUTTON = "Login"
export const LOGIN_SIGNUP_BUTTON = "Sign Up"
export const LOGIN_BRAND_NAME = "Northstar Financial"

/** Product requirement: every visit starts on the login screen — no auto-login or persisted session. */
export const LOGIN_ALWAYS_REQUIRED = true

export const MVP_GLOBAL_NOTE =
  "This MVP combines measured AI usage data with simulated process and investment logic to show how management could monitor adoption, identify opportunities and prioritize actions."

export const NAV_ITEMS = [
  { id: "panoramica", label: "Executive view" },
  { id: "dipartimenti", label: "Adoption analytics" },
  { id: "investment", label: "Strategic allocation" },
  { id: "forecasting", label: "Forecasting" },
  { id: "processmaps", label: "Process mapping" },
  { id: "tooltier", label: "Data repository" },
]

export const PAGE_TITLES = Object.fromEntries(
  NAV_ITEMS.map((item) => [item.id, item.label])
)

export const PAGE_QUESTIONS = {
  panoramica: "How is AI adoption progressing overall?",
  dipartimenti: "Where is adoption strong or weak?",
  processmaps: "Where could AI create value in representative business processes?",
  investment: "How should AI investment be allocated strategically?",
  forecasting: "How could future AI usage evolve?",
  tooltier: "How reliable is the current analysis?",
}

export const DATA_TIERS = {
  measured: {
    label: "Measured",
    color: "#0284c7",
    description: "From usage export and employee directory.",
  },
  simulated: {
    label: "Simulated",
    color: "#b45309",
    description: "Assumption-based process and investment views.",
  },
  future: {
    label: "Future-ready",
    color: "#7c3aed",
    description: "Workflow and ROI data not yet integrated.",
  },
}

/** Workflow-specific data tiers for Investment Matrix. */
export const WORKFLOW_DATA_TIERS = {
  workflow_live: {
    label: "Workflow live",
    color: "#6229FF",
    description: "Real data from the workflow builder (Contract Risk Assessment).",
  },
  workflow_illustrative: {
    label: "Illustrative workflow",
    color: "#64748B",
    description: "Placeholder mapping for workflows not yet implemented in the prototype.",
  },
}

/** Label for rule-based narrative blocks (coach, insights, recommendations). */
export const AI_SUMMARY = {
  label: "AI summary",
  color: "#6229FF",
  description: "Rule-based summary text on the dashboard — not live LLM output.",
}

/** Technical tier detail — info panels only. */
export function tierGuideBullets() {
  return [
    `${DATA_TIERS.measured.label}: credits, sessions, departments, seniority, weekly usage.`,
    `${DATA_TIERS.simulated.label}: process maps, estimated opportunity, investment priority, recommendations, forecasts.`,
    `${WORKFLOW_DATA_TIERS.workflow_live.label}: saved draft and use case opportunities from Contract Risk Assessment.`,
    `${WORKFLOW_DATA_TIERS.workflow_illustrative.label}: deterministic preview for catalog workflows not yet clickable.`,
    `${DATA_TIERS.future.label}: task-level tracking, productivity KPIs, ROI.`,
  ]
}

export function tierSectionNote(tierKey) {
  const t = DATA_TIERS[tierKey]
  return `${t.label} — ${t.description}`
}

export const FLOW_DISCLAIMER =
  "Illustrative process flow — usage is mapped to representative steps, not tracked task-level activity."

export const OPPORTUNITY_LABEL = "Estimated opportunity"

export const DEPT_SOURCE_FILES = {
  directory: "northstar_employee_directory_1233_v2.xlsx",
  usage: "northstar_ai_usage_export.csv",
}

/** Department name fixes applied when reading the employee directory. */
export const DEPT_ALIASES_DOC = [
  { from: "Customer Suport", to: "Customer Support" },
  { from: "customer suprt / customer-support", to: "Customer Support" },
  { from: "Technlogy", to: "Technology" },
  { from: "Risk and Compliance", to: "Risk & Compliance" },
  { from: "Sales & Partnerships", to: "Sales & Part." },
  { from: "Sconosciuto", to: "Unknown" },
]

/** Bullets for the Department mapping guide (Data Quality). */
export function departmentMappingNotes() {
  return [
    `Employee directory (Excel): defines who exists and their business unit — ${DEPT_SOURCE_FILES.directory}.`,
    `Usage export (CSV): weekly AI credits and sessions only — department is joined via employee_id.`,
    "Underwriting is a standard business department (148 employees in directory), not the same as Unknown.",
    "Unknown in the directory table: employees with a missing or invalid Department field (empty, undefined, or Sconosciuto).",
    "Usage IDs not found in the employee directory are excluded from dashboard metrics (they are not counted as provisioned users).",
  ]
}

export function departmentUnknownNote() {
  return "Unknown is a data-quality bucket — not a business unit. It only includes directory-linked users whose Department is missing/invalid. Usage IDs not found in directory are excluded from dashboard metrics."
}

/** Short explainer for Data Quality KPI cards — three distinct counts. */
export function dataQualityBucketSummary(dq) {
  const missingDept = dq?.excel_undefined_dept_rows ?? 0
  return [
    `${missingDept} employee directory row${missingDept === 1 ? "" : "s"} have no valid Department field and are grouped into Unknown.`,
    "Unknown now reflects only directory-linked users with missing Department values.",
    "Usage IDs that do not exist in the directory are excluded from all dashboard metrics.",
  ]
}
