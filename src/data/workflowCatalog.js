/** Illustrative workflow catalog per business unit (2–3 per dept). */

export const WORKFLOW_CATALOG = {
  Technology: [
    { id: "sdlc-release", title: "Software Release Readiness", description: "From code freeze to production deployment", ooda: "Orient → Act", clickable: false },
    { id: "incident-response", title: "Incident Response & Post-mortem", description: "Triage, root cause, remediation tracking", ooda: "Observe → Decide", clickable: false },
    { id: "tech-debt", title: "Technical Debt Prioritisation", description: "Backlog scoring and sprint allocation", ooda: "Orient → Act", clickable: false },
  ],
  "Data & Analytics": [
    { id: "insight-cycle", title: "Insight Generation Cycle", description: "From raw data to executive narrative", ooda: "Observe → Orient", clickable: false },
    { id: "model-governance", title: "Model Governance Review", description: "Validate analytics models before production", ooda: "Decide → Act", clickable: false },
    { id: "data-quality", title: "Data Quality Remediation", description: "Detect, classify and fix data issues", ooda: "Observe → Decide", clickable: false },
  ],
  "Customer Support": [
    { id: "ticket-escalation", title: "Ticket Escalation & Resolution", description: "L1 intake through L2 specialist handoff", ooda: "Observe → Act", clickable: false },
    { id: "knowledge-base", title: "Knowledge Base Refresh", description: "Update FAQs from recurring ticket patterns", ooda: "Orient → Act", clickable: false },
    { id: "csat-recovery", title: "CSAT Recovery Playbook", description: "Low-score follow-up and root-cause tagging", ooda: "Decide → Act", clickable: false },
  ],
  Finance: [
    { id: "monthly-close", title: "Monthly Close & Variance", description: "Actuals load, variance commentary, sign-off", ooda: "Observe → Decide", clickable: false },
    { id: "budget-definition", title: "Budget Definition", description: "Planning cycle from actuals to published BDG", ooda: "Observe → Act", clickable: false },
    { id: "audit-prep", title: "Audit Evidence Preparation", description: "Collect and validate supporting documentation", ooda: "Orient → Act", clickable: false },
  ],
  Pricing: [
    { id: "price-review", title: "Price Review & Simulation", description: "Scenario modelling and margin impact", ooda: "Orient → Decide", clickable: false },
    { id: "competitive-scan", title: "Competitive Pricing Scan", description: "Market benchmark and positioning update", ooda: "Observe → Orient", clickable: false },
    { id: "rate-card", title: "Rate Card Update", description: "Annual rate card review and approval", ooda: "Decide → Act", clickable: false },
  ],
  Underwriting: [
    { id: "risk-assessment", title: "Underwriting Risk Assessment", description: "Application intake through policy decision", ooda: "Observe → Decide", clickable: false },
    { id: "renewal-review", title: "Policy Renewal Review", description: "Portfolio review and repricing recommendations", ooda: "Orient → Act", clickable: false },
    { id: "claims-triage", title: "Claims Intake Triage", description: "Initial claims classification and routing", ooda: "Observe → Orient", clickable: false },
  ],
  "Risk & Compliance": [
    {
      id: "contract-risk-assessment",
      title: "Contract Risk Assessment — Third Party & Partner Onboarding",
      description: "End-to-end third-party contract review with AI-assisted triage and scoring",
      ooda: "Observe → Act",
      clickable: true,
    },
    { id: "policy-control", title: "Compliance Review & Policy Control", description: "Periodic policy review and gap remediation", ooda: "Orient → Decide", clickable: false },
    { id: "incident-reporting", title: "Regulatory Incident Reporting", description: "Incident classification and regulator notification", ooda: "Observe → Act", clickable: false },
  ],
  "Sales & Part.": [
    { id: "proposal-followup", title: "Sales Proposal & Client Follow-up", description: "Proposal drafting through closure", ooda: "Orient → Act", clickable: false },
    { id: "partner-onboarding", title: "Partner Onboarding Checklist", description: "Due diligence and contract alignment", ooda: "Observe → Decide", clickable: false },
    { id: "pipeline-review", title: "Pipeline Review", description: "Weekly opportunity review and forecast", ooda: "Orient → Decide", clickable: false },
  ],
  People: [
    { id: "employee-onboarding", title: "Employee Support & Onboarding", description: "New hire setup and HR policy guidance", ooda: "Observe → Act", clickable: false },
    { id: "talent-review", title: "Talent Review Cycle", description: "Performance calibration and development plans", ooda: "Orient → Decide", clickable: false },
    { id: "leave-approval", title: "Leave & Absence Approval", description: "Request intake through manager sign-off", ooda: "Observe → Act", clickable: false },
  ],
}

export function getWorkflowsForDepartment(department) {
  return WORKFLOW_CATALOG[department] ?? []
}
