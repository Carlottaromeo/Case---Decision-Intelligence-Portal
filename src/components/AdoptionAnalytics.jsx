import Dipartimenti from "./Dipartimenti"
import Utenti from "./Utenti"

export default function AdoptionAnalytics({ onOpenInsights }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <Dipartimenti onOpenInsights={onOpenInsights} />
      <Utenti onOpenInsights={onOpenInsights} />
    </div>
  )
}
