/** Contract Risk Assessment workflow — Risk & Compliance (illustrative prototype). */

export const CONTRACT_RISK_WORKFLOW = {
  id: "contract-risk-assessment",
  title: "Contract Risk Assessment",
  subtitle: "Third Party & Partner Onboarding",
  department: "Risk & Compliance",
  phases: [
    {
      id: "observe",
      label: "OBSERVE",
      color: "#0891B2",
      pastel: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)",
      cards: [
        {
          id: "intake-triage",
          title: "Intake & Triage",
          summary: "Receive and classify incoming third-party documents, flag gaps and route to analysts.",
          owner: "Compliance Officer",
          timeAsIs: "4h",
          timeToBe: "30min",
          aiToday: "None",
          aiStatus: "opportunity",
          useCase:
            "AI agent classifies incoming documents by type (contract, NDA, SLA, annex), flags missing documents and generates a triage sheet with initial risk indicators",
        },
      ],
    },
    {
      id: "orient",
      label: "ORIENT",
      color: "#7C3AED",
      pastel: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
      cards: [
        {
          id: "document-analysis",
          title: "Document Analysis",
          summary: "Extract clauses, compare against internal standards and score contractual risk.",
          owner: "Risk Analyst",
          timeAsIs: "3 days",
          timeToBe: "4h",
          aiToday: "Occasional unstructured Chat LLM usage",
          aiStatus: "active",
          useCase:
            "RAG agent trained on internal contract templates. Extracts risk clauses, compares them against company standards, produces a structured report with traffic-light scoring (OK / Warning / Critical)",
        },
        {
          id: "regulatory-check",
          title: "Regulatory Compliance Check",
          summary: "Verify contract terms against regulatory requirements and produce gap analysis.",
          owner: "Legal Reviewer",
          timeAsIs: "2 days",
          timeToBe: "2h",
          aiToday: "Excel AI for tracking, no structured usage",
          aiStatus: "opportunity",
          useCase:
            "LLM with updated regulatory knowledge base. Given the contract, automatically verifies compliance against a predefined regulatory checklist and produces a gap analysis with specific regulatory references",
        },
      ],
    },
    {
      id: "decide",
      label: "DECIDE",
      color: "#D97706",
      pastel: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
      cards: [
        {
          id: "risk-scoring",
          title: "Risk Scoring",
          summary: "Aggregate findings into a multi-dimensional risk score with analyst validation.",
          owner: "Risk Analyst + Compliance Officer",
          timeAsIs: "1 day",
          timeToBe: "1h",
          aiToday: "Excel AI for calculations only",
          aiStatus: "active",
          useCase:
            "Semi-automatic scoring model. AI aggregates findings from previous phases and proposes a risk score per dimension (legal, operational, reputational, financial) with rationale. Analyst validates and adjusts. Human in the loop explicit.",
        },
        {
          id: "report-production",
          title: "Report Production",
          summary: "Compile assessment into the company report template for management review.",
          owner: "Compliance Officer",
          timeAsIs: "1 day",
          timeToBe: "2h",
          aiToday: "Some analysts use Chat LLM informally, not standardised",
          aiStatus: "opportunity",
          useCase:
            "LLM receives all structured outputs from previous phases and auto-generates the first draft in the company report template. Analyst reviews and finalises.",
        },
      ],
    },
    {
      id: "act",
      label: "ACT",
      color: "#059669",
      pastel: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
      cards: [
        {
          id: "review-approval",
          title: "Review & Approval",
          summary: "Final sign-off by department head — accountability remains human by design.",
          owner: "Department Head",
          timeAsIs: "1 day",
          timeToBe: "1 day",
          aiToday: "None",
          aiStatus: "human",
          useCase: null,
          humanOnlyNote:
            "This step remains fully human by design. Final decision accountability cannot be delegated to AI.",
        },
      ],
    },
  ],
}
