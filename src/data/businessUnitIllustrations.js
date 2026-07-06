const BASE = "/assets/business-units"

export const BU_ILLUSTRATIONS = {
  "Customer Support": {
    src: `${BASE}/customer-support.png`,
    alt: "Abstract illustration of customer support with headset and chat",
  },
  Technology: {
    src: `${BASE}/technology.png`,
    alt: "Abstract illustration of technology with code and servers",
  },
  Underwriting: {
    src: `${BASE}/underwriting.png`,
    alt: "Abstract illustration of underwriting with documents and risk assessment",
  },
  "Sales & Part.": {
    src: `${BASE}/sales-partnerships.png`,
    alt: "Abstract illustration of sales and partnerships with handshake and growth",
  },
  Pricing: {
    src: `${BASE}/pricing.png`,
    alt: "Abstract illustration of pricing with tags and calculator",
  },
  "Data & Analytics": {
    src: `${BASE}/data-analytics.png`,
    alt: "Abstract illustration of data analytics with charts and connected nodes",
  },
  Finance: {
    src: `${BASE}/finance.png`,
    alt: "Abstract illustration of finance with ledger and trend line",
  },
  "Risk & Compliance": {
    src: `${BASE}/risk-compliance.png`,
    alt: "Abstract illustration of risk and compliance with shield and checklist",
  },
  People: {
    src: `${BASE}/people.png`,
    alt: "Abstract illustration of people and HR with team nodes",
  },
}

export function getBuIllustration(deptName) {
  return BU_ILLUSTRATIONS[deptName] ?? null
}

export function getBuInitials(deptName) {
  return String(deptName ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}
