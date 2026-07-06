const EMPHASIS_SPLIT =
  /(\d+(?:\.\d+)?%|\b(?:Activate|Scale|Industrialize|Quick win|Monitor|High|Medium|Low)\b)/g

function isEmphasis(part) {
  return (
    /^\d+(?:\.\d+)?%$/.test(part) ||
    /^(?:Activate|Scale|Industrialize|Quick win|Monitor|High|Medium|Low)$/.test(part)
  )
}

export function emphasizeAiText(text) {
  if (!text) return null
  const parts = text.split(EMPHASIS_SPLIT).filter(Boolean)
  return parts.map((part, i) =>
    isEmphasis(part) ? <strong key={i}>{part}</strong> : part
  )
}

export function EmphasizedText({ text, className, as: Tag = "p" }) {
  if (!text) return null
  return <Tag className={className}>{emphasizeAiText(text)}</Tag>
}
