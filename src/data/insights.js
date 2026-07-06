// ─── AI INSIGHTS ─────────────────────────────────────────────────────────────
// Curated patterns derived from northstar_ai_usage_export.csv analysis.
// Kept separate from raw aggregates in data.js.

export const INSIGHTS = [
  {
    id: "tool-mix-coherence",
    priority: "high",
    detection_type: "tool",
    detection_note:
      "Calculated by comparing each department's tool distribution against expected usage profile based on role type",
    title: "The way each department uses AI reflects its core activity",
    observation:
      "Tool mix aligns with departmental work types: technical teams lean on Coding IDE, finance on Excel, and frontline roles on Chat. Where the dominant tool matches the job, adoption appears organic rather than experimental.",
    how_identified:
      "Calculated by aggregating credits per tool (Chat, Excel, Coding IDE) for each department over 13 weeks, then expressing each tool as a share of that department's total credits.",
    evidence: [
      "Technology: 45.7% Coding IDE, 42.3% Chat, 12% Excel",
      "Finance: 54.6% Excel, 42% Chat, 3.4% Coding IDE",
      "Customer Support: 88.1% Chat, 11% Excel, 0.9% Coding IDE",
      "Data & Analytics: 33.9% Excel, 46.5% Chat, 19.6% Coding IDE — analytical profile",
    ],
    advice: [
      {
        step: "Replicate what works",
        detail:
          "Where tool mix is coherent with core work, adoption is organic. Use these departments as internal reference models for enablement playbooks.",
      },
      {
        step: "Prioritise scattered mixes",
        detail:
          "Focus enablement efforts on departments where the tool mix is scattered or unexpected — misalignment often signals superficial adoption or unclear application patterns.",
      },
    ],
  },
  {
    id: "consistent-growth",
    priority: "high",
    detection_type: "tool",
    detection_note:
      "Identified by verifying that every week's credit total exceeded the prior week — zero exceptions across 13 data points",
    title: "Usage has grown every single week without exception",
    observation:
      "Weekly credit consumption rose continuously from 19,676 in week 1 to 71,142 in week 13 — a 261.6% increase with no week-on-week decline across the entire observation period.",
    how_identified:
      "Summed total credits per week_start_date across all provisioned users for 13 consecutive weeks (Dec 29, 2025 – Mar 23, 2026), then compared each week to the prior week.",
    evidence: [
      "Week 1 (Dec 29): 19,676 credits",
      "Week 13 (Mar 23): 71,142 credits",
      "All 12 week-on-week transitions show positive growth — zero declining weeks",
      "Total sessions grew in parallel: 2,682 → 6,653 over the same period",
    ],
    advice: [
      {
        step: "Treat momentum as real",
        detail:
          "Organic growth without incentives is a strong signal. Usage is compounding, not plateauing.",
      },
      {
        step: "Ask who is left out",
        detail:
          "The open question is whether this momentum is reaching the whole organisation or only the 37.4% currently provisioned (461 of 1,233 employees).",
      },
    ],
  },
  {
    id: "high-consumption-signal",
    priority: "medium",
    detection_type: "tool",
    detection_note:
      "Identified by flagging users in the top percentile of weekly credit consumption (≥500 credits in at least one week)",
    title: "47 users show unusually high weekly credit consumption — direction unknown",
    observation:
      "Forty-seven users consumed ≥500 credits in at least one week. This concentration at the top of the distribution is statistically notable but semantically ambiguous — it cannot be read as purely positive or negative from credits alone.",
    how_identified:
      "Flagged any employee_id with total_credits ≥ 500 in a single week_start_date row. Counted unique users meeting this threshold across the 13-week window.",
    evidence: [
      "47 users hit ≥500 credits in at least one week",
      "600 credits is the maximum observed value — possible weekly system cap",
      "Reading A: constrained power users hitting a ceiling",
      "Reading B: inefficient or unfocused prompt usage driving excess consumption",
    ],
    advice: [
      {
        step: "Do not act on the number alone",
        detail:
          "Investigate qualitatively before intervening. The same metric can mean opposite things depending on context and output quality.",
      },
      {
        step: "Sample both tails",
        detail:
          "Interview a subset of high-consumption users and their managers. Compare tool/tier mix and deliverables against moderate users in the same department.",
      },
    ],
  },
  {
    id: "high-intensity-incomplete-rollout",
    priority: "high",
    detection_type: "tool",
    detection_note:
      "Cross-referenced provisioning rate with credits per user per week — departments with high intensity but low coverage surfaced automatically",
    title: "Some departments show the highest usage intensity in the organisation — but less than half their team has access",
    observation:
      "Technology and Data & Analytics rank among the highest credits-per-user-per-week in the company, yet provisioning rates remain near 53%. Finance shows strong intensity (99.5 cr/user/week) with only 29.1% access. Demand among provisioned users is already visible in the usage export.",
    how_identified:
      "Computed credits per provisioned user per week (total department credits ÷ provisioned headcount ÷ 13 weeks) and cross-referenced with provisioning rate (provisioned ÷ total department employees).",
    evidence: [
      "Technology: 163 cr/user/week at 53.2% provisioning (125 of 235)",
      "Data & Analytics: 145.1 cr/user/week at 53.3% provisioning (49 of 92)",
      "Finance: 99.5 cr/user/week at 29.1% provisioning (23 of 79)",
      "Customer Support: high volume (81,958 total credits) but lower intensity (53 cr/user/week) at 39.9% access",
    ],
    advice: [
      {
        step: "Expand where demand is observed",
        detail:
          "Where intensity is high among those with access, expanding provisioning is lower-risk. The usage signal already exists in the export.",
      },
      {
        step: "Sequence by estimated value",
        detail:
          "Prioritise Technology, Data & Analytics, and Finance for the next provisioning wave — intensity data supports the business case before budget is committed.",
      },
    ],
  },
  {
    id: "low-adoption-unknown-cause",
    priority: "medium",
    detection_type: "ai",
    detection_note:
      "Algorithm flagged low provisioning + low intensity. AI layer generated department-specific hypotheses based on role context",
    title: "Three departments show low provisioning and low intensity — but for different reasons",
    observation:
      "People (10.5%), Risk & Compliance (24%), and Sales & Partnerships (27.4%) all sit at the bottom of provisioning rates. Low intensity alone does not explain why — each department likely faces a distinct barrier (budget, awareness, workflow fit, or leadership buy-in).",
    how_identified:
      "Ranked departments by provisioning rate and cross-checked credits per user per week. Flagged clusters where both access rate and usage intensity fall in the bottom quartile of the organisation.",
    evidence: [
      "People: 10.5% provisioned (6 of 57), 23.9 cr/user/week — possible HR budget or priority gap",
      "Risk & Compliance: 24% provisioned (18 of 75), 60.7 cr/user/week — possible compliance caution on AI tools",
      "Sales & Partnerships: 27.4% provisioned (32 of 117), 64.6 cr/user/week — possible field-work adoption barrier",
      "Same symptom (low access), different plausible root causes — data alone cannot distinguish them",
    ],
    advice: [
      {
        step: "Diagnose before intervening",
        detail:
          "Do not apply a single rollout playbook to all three. Each department likely has a different barrier.",
      },
      {
        step: "Run lightweight discovery",
        detail:
          "Short interviews with non-provisioned employees and team leads in each department to identify whether the blocker is access, awareness, relevance, or policy.",
      },
    ],
  },
  {
    id: "gap-is-access-not-motivation",
    priority: "high",
    detection_type: "ai",
    detection_note:
      "Derived from interpreting the combination of high engagement among provisioned users and large unprovision gap — AI generated the strategic framing",
    title: "Among provisioned users, engagement is consistently high. The gap is not motivation — it is access.",
    observation:
      "Of 461 provisioned users, zero remained inactive across the full 13-week period. 362 qualify as Power Users (active ≥70% of weeks), 88 as Regular, and only 11 as Occasional. Tool mix among active users is coherent with departmental work — behaviour among those inside the rollout looks healthy.",
    how_identified:
      "Segmented provisioned users by counting weeks with credits > 0 or sessions > 0, then classified: Power User (≥70% of weeks), Regular (30–70%), Occasional (<30%), Inactive (0 weeks). Cross-referenced with department tool-mix coherence.",
    evidence: [
      "0 inactive users among 461 provisioned — everyone with access used AI at least once",
      "362 Power Users (78.5% of provisioned population)",
      "772 employees (62.6%) never appear in usage data — outside rollout entirely",
      "Tool mix coherence in active departments supports sustained, contextual usage",
    ],
    advice: [
      {
        step: "Reframe the problem",
        detail:
          "The case for expanding provisioning is already made by the data. The bottleneck is organisational access, not user willingness.",
      },
      {
        step: "Escalate the rollout decision",
        detail:
          "Present provisioning expansion as an observed-demand initiative: intensity and engagement among the 37.4% with access justify extending coverage to the remaining 62.6%.",
      },
    ],
  },
  {
    id: "seniority-intensity-gradient",
    priority: "medium",
    detection_type: "tool",
    detection_note:
      "Compared average credits per active user across seniority levels L1–L6 in the employee directory",
    title: "Senior levels show higher per-user intensity — but L1–L6 coverage is still partial",
    observation:
      "L5 and L6 active users consume more credits per person than L1–L3, consistent with greater autonomy and complex work. Yet only a fraction of each level is provisioned — intensity among active users can mask how many colleagues at the same level never received access.",
    how_identified:
      "Aggregated credits and active users by seniority from the usage export cross-referenced with employee directory headcount per level.",
    evidence: [
      "L6: highest credits/user among levels with meaningful sample size",
      "L1: lowest intensity but also smallest active cohort",
      "Directory headcount per level vs active users shows adoption gap within each band",
    ],
    advice: [
      {
        step: "Do not over-index on senior intensity alone",
        detail:
          "High averages at L5–L6 reflect depth among those already inside the rollout, not organisation-wide senior adoption.",
      },
      {
        step: "Expand by level band",
        detail:
          "When provisioning, compare active vs in-company counts per level — prioritise levels with large untapped headcount and coherent tool usage among actives.",
      },
    ],
  },
  {
    id: "gemini-cost-credit-gap",
    priority: "high",
    detection_type: "tool",
    detection_note:
      "Compared share of credits vs share of estimated Gemini cost by tool using tier mix and model pricing",
    title: "Credit share understates cost share for Coding IDE",
    observation:
      "Coding IDE consumes a smaller slice of total credits than Chat, but drives a disproportionate share of estimated Gemini spend because thinking/pro tiers and the 3.5 Flash price list convert each credit into more tokens and higher $/credit.",
    how_identified:
      "Converted measured tool × tier credits to tokens per scenario, applied pay-as-you-go Gemini prices per tool, and compared % credits vs % cost.",
    evidence: [
      "Chat & Excel priced on 2.5 Flash-Lite; Coding IDE on 3.5 Flash",
      "Derived $/credit is highest for Coding IDE given tier mix",
      "Department rows inherit the same model — Technology skews cost via IDE usage",
    ],
    advice: [
      {
        step: "Budget on cost, not credits alone",
        detail:
          "Executive forecasts should use the cost model — credit totals alone will understate spend where IDE share is high.",
      },
      {
        step: "Scenario-plan intensity",
        detail:
          "Use Light / Expected / Intensive scenarios to bracket token-per-interaction uncertainty while holding list prices fixed.",
      },
    ],
  },
  {
    id: "adoption-intensity-prioritization",
    priority: "high",
    detection_type: "ai",
    detection_note:
      "Plotted BU adoption rate vs credits per active user per week; classified quadrants at 38% adoption and 65 cr/week",
    title: "Adoption breadth and usage depth tell different stories — prioritise Scale before Investigate",
    observation:
      "Some BUs combine high intensity with low penetration (Scale quadrant) — proven value with untapped breadth. Others show wide access but shallow per-user usage (Investigate) — a diagnostic flag, not a quick win. Bubble size shows absolute non-adopter headcount.",
    how_identified:
      "Computed adoption = active users ÷ BU headcount and intensity = total credits ÷ active users ÷ weeks. Sized bubbles by non-adopters (total − active).",
    evidence: [
      "Scale: high intensity, adoption below threshold — highest-ROI expansion candidates",
      "Investigate: high adoption rate but low cr/week — volume without depth",
      "Champions: sustain and harvest; Low fit: assess relevance before investing",
    ],
    advice: [
      {
        step: "Sequence investment",
        detail:
          "Evangelise Scale quadrant BUs first — intensity proves fit; the gap is breadth. Investigate requires workflow diagnosis before spend.",
      },
      {
        step: "Read rate vs absolute gap",
        detail:
          "A BU can look 'high adoption' on rate while still holding the largest non-adopter bubble — always check both axes and bubble size.",
      },
    ],
  },
  {
    id: "cost-simulator-adoption",
    priority: "high",
    detection_type: "ai",
    detection_note:
      "Linear adoption-to-cost model: per-BU fixed $/active user from Gemini tier mix; pool of 30 no-dept employees at company-average rate",
    title: "Monthly spend roughly doubles to ~$9.5k as adoption reaches 100%",
    observation:
      "At today's 37% company adoption, estimated monthly Gemini spend is ~$4.7k. Scaling linearly to full headcount reaches ~$9.5k/mo — users grow 2.7× but cost only doubles because new adopters cluster in lower-cost BUs. Technology drives ~71% of the increase via coding-model intensity.",
    how_identified:
      "Derived fixed avg weekly cost per active user per BU from measured tool × tier credits and Gemini list prices. Interpolated active users from current to full headcount; added 30 no-department employees at company-average rate scaled by global progress.",
    evidence: [
      "Reference curve: $4,724/mo (37%) → $9,493/mo (100%) with 461 → 1,233 active users",
      "Technology: $3,866 → $7,267/mo — highest absolute lift",
      "Customer Support & People add users cheaply (low cr/week and IDE share)",
    ],
    advice: [
      {
        step: "Use the simulator for board-level forecasts",
        detail:
          "Adjust global adoption progress for company-wide scenarios; isolate BUs to model targeted rollouts without moving the rest of the organisation.",
      },
      {
        step: "Watch Technology concentration",
        detail:
          "Most incremental spend sits in engineering — any change to IDE tier mix or token intensity shifts the whole curve, not just Technology.",
      },
    ],
  },
];

/** @deprecated legacy ids — resolved by getInsightById */
export const INSIGHT_ALIASES = {
  "tool-mix-coherent": "tool-mix-coherence",
  "weekly-growth-unbroken": "consistent-growth",
  "high-consumption-ambiguous": "high-consumption-signal",
  "low-adoption-unknown-causes": "low-adoption-unknown-cause",
};

export function getInsightById(id) {
  const resolved = INSIGHT_ALIASES[id] || id;
  return INSIGHTS.find((i) => i.id === resolved);
}
