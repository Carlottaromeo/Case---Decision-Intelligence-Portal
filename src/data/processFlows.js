/** Illustrative process steps and AI opportunities per department (MVP — not tracked workflows). */

export const PROCESS_FLOW_DEFINITIONS = {
  Technology: [
    { step: "Requirements analysis", opportunity: "Summarize requirements and generate user stories", tool: "Chat" },
    { step: "Code development", opportunity: "Code generation and refactoring", tool: "Coding IDE" },
    { step: "Debugging", opportunity: "Error explanation and fix suggestions", tool: "Coding IDE" },
    { step: "Testing", opportunity: "Test case generation", tool: "Coding IDE" },
    { step: "Documentation", opportunity: "Technical documentation drafting", tool: "Chat" },
    { step: "Code review", opportunity: "Assisted review and quality checks", tool: "Coding IDE" },
  ],
  "Data & Analytics": [
    { step: "Data collection", opportunity: "Dataset explanation", tool: "Chat" },
    { step: "Data cleaning", opportunity: "Formulas and transformations", tool: "Excel" },
    { step: "Exploratory analysis", opportunity: "Trend and anomaly detection", tool: "Excel" },
    { step: "Insight generation", opportunity: "KPI interpretation", tool: "Chat" },
    { step: "Reporting", opportunity: "Executive summary drafting", tool: "Chat" },
    { step: "Forecasting", opportunity: "Scenario analysis", tool: "Excel" },
  ],
  "Customer Support": [
    { step: "Request intake", opportunity: "Classify customer intent", tool: "Chat" },
    { step: "Knowledge search", opportunity: "Retrieve relevant information", tool: "Chat" },
    { step: "Response drafting", opportunity: "Generate customer reply", tool: "Chat" },
    { step: "Escalation", opportunity: "Summarize case for second level", tool: "Chat" },
    { step: "Ticket closure", opportunity: "Recap and categorization", tool: "Chat" },
  ],
  Finance: [
    { step: "Data gathering", opportunity: "Collect reporting inputs", tool: "Excel" },
    { step: "Data validation", opportunity: "Identify inconsistencies", tool: "Excel" },
    { step: "Variance analysis", opportunity: "Explain deviations", tool: "Excel" },
    { step: "Commentary drafting", opportunity: "Prepare management notes", tool: "Chat" },
    { step: "Forecast update", opportunity: "Update expected scenarios", tool: "Excel" },
    { step: "Executive summary", opportunity: "Generate report summary", tool: "Chat" },
  ],
  Pricing: [
    { step: "Market input review", opportunity: "Summarize pricing inputs", tool: "Chat" },
    { step: "Historical analysis", opportunity: "Detect price trends", tool: "Excel" },
    { step: "Scenario simulation", opportunity: "Compare pricing options", tool: "Excel" },
    { step: "Margin analysis", opportunity: "Explain profitability impact", tool: "Excel" },
    { step: "Recommendation drafting", opportunity: "Prepare pricing rationale", tool: "Chat" },
  ],
  Underwriting: [
    { step: "Document collection", opportunity: "Summarize submitted documents", tool: "Chat" },
    { step: "Client data review", opportunity: "Extract key information", tool: "Chat" },
    { step: "Risk analysis", opportunity: "Identify red flags", tool: "Chat" },
    { step: "Policy comparison", opportunity: "Compare against internal rules", tool: "Chat" },
    { step: "Decision memo", opportunity: "Draft assessment note", tool: "Chat" },
    { step: "Final review", opportunity: "Checklist validation", tool: "Chat" },
  ],
  "Risk & Compliance": [
    { step: "Policy review", opportunity: "Summarize internal policies", tool: "Chat" },
    { step: "Document control", opportunity: "Extract obligations and clauses", tool: "Chat" },
    { step: "Gap analysis", opportunity: "Identify compliance gaps", tool: "Excel" },
    { step: "Risk flagging", opportunity: "Detect red flags", tool: "Chat" },
    { step: "Evidence preparation", opportunity: "Summarize audit evidence", tool: "Chat" },
    { step: "Reporting", opportunity: "Prepare compliance update", tool: "Chat" },
  ],
  "Sales & Part.": [
    { step: "Meeting preparation", opportunity: "Summarize client context", tool: "Chat" },
    { step: "Need analysis", opportunity: "Classify pain points", tool: "Chat" },
    { step: "Proposal drafting", opportunity: "Generate commercial content", tool: "Chat" },
    { step: "Follow-up", opportunity: "Draft email and next steps", tool: "Chat" },
    { step: "Pipeline review", opportunity: "Summarize opportunities", tool: "Chat" },
    { step: "Partnership review", opportunity: "Summarize agreements", tool: "Chat" },
  ],
  People: [
    { step: "Employee request intake", opportunity: "Classify HR question", tool: "Chat" },
    { step: "Policy search", opportunity: "Answer from HR policies", tool: "Chat" },
    { step: "Response drafting", opportunity: "Prepare employee reply", tool: "Chat" },
    { step: "Onboarding support", opportunity: "Generate checklist and FAQ", tool: "Chat" },
    { step: "Job description drafting", opportunity: "Generate HR content", tool: "Chat" },
    { step: "Training recap", opportunity: "Summarize feedback and needs", tool: "Chat" },
  ],
}

export const AI_RECOMMENDATIONS = {
  Scale: "Department-level usage shows strong adoption and intensity. In a future state with process-level data, prioritise expanding access and codifying illustrative step opportunities into repeatable playbooks.",
  Industrialize: "Active users demonstrate meaningful usage at department level. Focus on deepening simulated step adoption, standardising prompts, and moving from experimental to operational workflows once workflows are integrated.",
  Activate: "High simulated AI potential relative to measured department adoption. Start with access expansion, targeted training on representative steps, and AI Champion-led discovery sessions.",
  "Quick win": "Select 1–2 illustrative process steps for a low-risk pilot. Validate tool fit and adoption barriers before broader rollout.",
  Monitor: "Usage remains limited or uneven at department level. Track monthly adoption, run lightweight interviews, and revisit when process-level data becomes available.",
}

export const ACTION_PLANS = {
  Scale: [
    "Extend AI provisioning to employees not yet in the rollout",
    "Assign an AI Champion to document illustrative step-level opportunities",
    "Share internal playbooks with unprovisioned teams",
    "Set monthly department adoption targets (measured)",
  ],
  Industrialize: [
    "Audit top active users for reusable prompt patterns",
    "Standardise tool selection per representative process step",
    "Introduce peer learning sessions on high-value illustrative steps",
    "Plan step-level credit tracking when workflow data is integrated",
  ],
  Activate: [
    "Run discovery interviews with non-active employees",
    "Pilot the top 2 illustrative AI opportunities with a small user group",
    "Clarify access and policy constraints with department lead",
    "Define success metrics before scaling provisioning",
  ],
  "Quick win": [
    "Pick one low-friction illustrative step for a 4-week pilot",
    "Pair pilot users with a power user mentor",
    "Collect qualitative feedback on output quality",
    "Decide scale/no-scale based on pilot results",
  ],
  Monitor: [
    "Review measured adoption monthly without immediate intervention",
    "Flag significant usage shifts to the AI programme lead",
    "Reassess process mapping when task-level data becomes available",
    "Keep department in the next quarterly portfolio review",
  ],
}

export { FLOW_DISCLAIMER } from "./dashboardCopy"

export const PROCESS_DEFINITIONS = [
  { department: "Technology", process_name: "Software Development Lifecycle" },
  { department: "Data & Analytics", process_name: "Data Analysis & Insight Generation" },
  { department: "Customer Support", process_name: "Customer Request Handling" },
  { department: "Finance", process_name: "Monthly Reporting & Variance Analysis" },
  { department: "Pricing", process_name: "Pricing Analysis & Scenario Simulation" },
  { department: "Underwriting", process_name: "Underwriting Risk Assessment" },
  { department: "Risk & Compliance", process_name: "Compliance Review & Policy Control" },
  { department: "Sales & Part.", process_name: "Sales Proposal & Client Follow-up" },
  { department: "People", process_name: "Employee Support & Onboarding" },
]
