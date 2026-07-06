import { C } from "../../theme"

export default function ProcessMetric({ label, value, accent, compact }) {
  return (
    <div>
      <div style={{
        fontSize: compact ? 9 : 10,
        color: C.subtle,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: compact ? 2 : 4,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: compact ? 13 : 15,
        fontWeight: 700,
        color: accent || C.text,
      }}>
        {value}
      </div>
    </div>
  )
}
