import { C } from "../theme"
import { EmphasizedText } from "../utils/emphasizeAiText"

export function AiSummaryBlock({ label, text, accent }) {
  return (
    <div className="ai-summary-block">
      <div
        className="ai-summary-block__label"
        style={accent ? { color: accent } : undefined}
      >
        {label}
      </div>
      <EmphasizedText text={text} className="ai-summary-block__text" />
    </div>
  )
}

export function AiSummaryGrid({ blocks }) {
  return (
    <div className="ai-summary-section__grid">
      {blocks.map((block) => (
        <AiSummaryBlock key={block.label} {...block} accent={block.accent ?? C.accent} />
      ))}
    </div>
  )
}
