/** Shared dashboard copy — Measured / Simulated / Future-ready distinction. */

export const PRODUCT_NAME = "AI Adoption & Investment Hub"
export const PRODUCT_SUBTITLE =
  "Monitor AI adoption, identify opportunity gaps, prioritize investments and forecast future AI demand."
export const PRODUCT_PERIOD = "Dec 2025 – Mar 2026"

export const MVP_GLOBAL_NOTE =
  "This MVP combines measured AI usage data with simulated process and investment logic to show how management could monitor adoption, identify opportunities and prioritize actions."

export const NAV_ITEMS = [
  { id: "panoramica", label: "Executive Cockpit" },
  { id: "dipartimenti", label: "Adoption Analytics" },
  { id: "processmaps", label: "Process Opportunities" },
  { id: "investment", label: "Investment Planner" },
  { id: "forecasting", label: "Forecasting" },
  { id: "tooltier", label: "Data Quality" },
]

export const PAGE_TITLES = Object.fromEntries(
  NAV_ITEMS.map((item) => [item.id, item.label])
)

export const PAGE_QUESTIONS = {
  panoramica: "How is AI adoption progressing overall?",
  dipartimenti: "Where is adoption strong or weak?",
  processmaps: "Where could AI create value in representative business processes?",
  investment: "Where should management invest first?",
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
    description: "Dati reali dal workflow builder (Contract Risk Assessment).",
  },
  workflow_illustrative: {
    label: "Workflow illustrativo",
    color: "#64748B",
    description: "Mappatura fittizia per workflow non ancora implementati nel prototipo.",
  },
}

/** Label for rule-based narrative blocks (coach, insights, recommendations). */
export const AI_SUMMARY = {
  label: "AI summary",
  color: "#6229FF",
  description: "Testo riassuntivo rule-based sul dashboard — non output LLM in tempo reale.",
}

/** Technical tier detail — info panels only. */
export function tierGuideBullets() {
  return [
    `${DATA_TIERS.measured.label}: credits, sessions, departments, seniority, weekly usage.`,
    `${DATA_TIERS.simulated.label}: process maps, estimated opportunity, investment priority, recommendations, forecasts.`,
    `${WORKFLOW_DATA_TIERS.workflow_live.label}: draft salvato e opportunità use case da Contract Risk Assessment.`,
    `${WORKFLOW_DATA_TIERS.workflow_illustrative.label}: anteprima deterministica per workflow catalogo non ancora cliccabili.`,
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
    "Unmapped provisioned users: appear in the usage CSV but cannot be assigned to a business unit (test accounts or missing directory link).",
  ]
}

export function departmentUnknownNote() {
  return "Unknown in department charts means missing department in the employee directory — not a business unit. See Data Quality for mapping detail."
}
